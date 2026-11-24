import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {options,run,buildRequest,apiRequest,downloadImage,imageMime,baseUrl,privateAddress} from '../skills/fusionai-images/scripts/fusionai.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6lwAAAAASUVORK5CYII=','base64');
const response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json',...headers}});
test('dry runs construct a redacted request without credentials, network or charges',async()=>{
 let text;await run(options(['generate','--model','gpt-image-2','--prompt','blue cup','--dry-run']),{env:{},log:v=>text=v,fetchImpl:()=>{throw Error('Network must not be used');}});
 const data=JSON.parse(text);assert.equal(data.url,'https://www.fusionai.tv/v1/images/generations');assert.equal(data.body.output_format,'png');assert.equal(data.catalogValidated,false);assert.equal(text.includes('Authorization'),false);
});
test('billable calls require explicit confirmation before even discovering models',async()=>{
 let calls=0;await assert.rejects(()=>run(options(['generate','--model','gpt-image-2','--prompt','x']),{fetchImpl:()=>{calls++;}}),/Billable/);assert.equal(calls,0);
});
test('auth, exact catalog IDs and supported protocols gate POST requests',async()=>{
 const calls=[],fetchImpl=async(url,init)=>{calls.push(init.method);return response({data:[{id:'midjourney',protocol:'midjourney-async'}]});};
 await assert.rejects(()=>run(options(['generate','--model','not-published','--prompt','x','--confirm-paid']),{env:{FUSIONAI_API_KEY:'fixture-key'},fetchImpl}),/not in/);
 await assert.rejects(()=>run(options(['generate','--model','midjourney','--prompt','x','--confirm-paid']),{env:{FUSIONAI_API_KEY:'fixture-key'},fetchImpl}),/Unsupported/);assert.deepEqual(calls,['GET','GET']);
});
test('multipart edit and Gemini inline references keep byte content and input order',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fusionai-client-'));try{
 const first=join(dir,'product.png'),second=join(dir,'scene.png');await writeFile(first,png);await writeFile(second,png);
 const args=options(['edit','--model','gpt-image-2','--prompt','preserve product','--image',first,'--image',second,'--mask',second,'--dry-run']);
 const gpt=await buildRequest(args,'openai-images');assert.equal(gpt.body.getAll('image[]').length,2);assert.equal(gpt.body.get('mask').type,'image/png');assert.equal(gpt.body.getAll('image[]')[0].name,'product.png');
 const gem=await buildRequest({...args,mask:undefined,model:'gemini-3.1-flash-image',ratio:'4:5'},'gemini-generate-content');assert.equal(gem.body.contents[0].parts.length,3);assert.equal(gem.body.contents[0].parts[1].inlineData.data,png.toString('base64'));assert.equal(gem.body.generationConfig.imageConfig.aspectRatio,'4:5');
 await assert.rejects(()=>buildRequest({...args,mask:undefined,ratio:'4:5'},'openai-images'),/--size/);
 await writeFile(first,'not an image');await assert.rejects(()=>buildRequest(args,'openai-images'),/image bytes/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('one successful paid request saves real image bytes and preserves request ID',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fusionai-output-'));try{
 const methods=[];let summary;const fetchImpl=async(url,init)=>{methods.push(init.method);assert.equal(init.headers.Authorization,'Bearer fixture-key');return init.method==='GET'?response({data:[{id:'gpt-image-2',protocol:'openai-images'}]}):response({data:[{b64_json:png.toString('base64')}]},200,{'x-request-id':'fixture-request'});};
 await run(options(['generate','--model','gpt-image-2','--prompt','cup','--confirm-paid','--output-dir',dir]),{env:{FUSIONAI_API_KEY:'fixture-key'},fetchImpl,log:v=>summary=JSON.parse(v)});
 assert.deepEqual(methods,['GET','POST']);assert.equal(summary.requestId,'fixture-request');assert.equal(summary.saved.length,1);assert.equal(imageMime(await readFile(summary.saved[0])),'image/png');
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('HTTP errors and uncertain timeouts never retry POST or expose API credentials',async()=>{
 let calls=0;await assert.rejects(()=>apiRequest('/v1/images/generations',{method:'POST',key:'fixture-secret',fetchImpl:async()=>{calls++;throw Error('Bearer fixture-secret');}}),e=>!e.message.includes('fixture-secret')&&e.message.includes('unknown'));assert.equal(calls,1);
 await assert.rejects(()=>apiRequest('/v1/models',{key:'fixture-secret',fetchImpl:async()=>response({error:{message:'bad fixture-secret'}},401,{'x-request-id':'fixture-id'})}),e=>!e.message.includes('fixture-secret')&&e.message.includes('fixture-id'));
 await apiRequest('/v1/models',{key:'fixture',fetchImpl:async(url,init)=>{assert.equal(init.redirect,'error');return response({data:[]});}});
});
test('result redirects reject private networks and never carry Authorization headers',async()=>{
 let calls=0;await assert.rejects(()=>downloadImage('https://127.0.0.1/a.png',{fetchImpl:async()=>{calls++;}}),/Private/);assert.equal(calls,0);
 const publicDns=async()=>[{address:'8.8.8.8',family:4}];
 await assert.rejects(()=>downloadImage('https://fixture.example/image',{lookupImpl:publicDns,fetchImpl:async(url,init)=>{calls++;assert.equal(init.headers,undefined);return new Response(null,{status:302,headers:{location:'https://169.254.169.254/secret'}});}}),/Private/);assert.equal(calls,1);
 const bytes=await downloadImage('https://fixture.example/image',{lookupImpl:publicDns,fetchImpl:async()=>new Response(png)});assert.equal(imageMime(bytes),'image/png');
 for(const ip of ['127.0.0.1','10.0.0.1','192.168.1.1','::1','::ffff:127.0.0.1','169.254.169.254'])assert.equal(privateAddress(ip),true);
});
test('failed result downloads retain generation evidence and do not regenerate',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fusionai-output-'));try{
 let posts=0,summary;const fetchImpl=async(url,init)=>{if(init.method==='GET')return response({data:[{id:'gpt-image-2',protocol:'openai-images'}]});posts++;return response({data:[{url:'https://fixture.example/result'}]},200,{'x-request-id':'saved-request'});};
 await assert.rejects(()=>run(options(['generate','--model','gpt-image-2','--prompt','x','--confirm-paid','--output-dir',dir]),{env:{FUSIONAI_API_KEY:'fixture'},fetchImpl,download:async()=>{throw Error('offline');},log:v=>summary=JSON.parse(v)}),/saving was incomplete/);assert.equal(posts,1);assert.equal(summary.requestId,'saved-request');assert.equal((await readdir(dir)).length,0);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('base URL and parser reject credential-bearing URLs and ambiguous inputs',()=>{
 for(const value of ['http://www.fusionai.tv','https://key@www.fusionai.tv','https://www.fusionai.tv/?key=x','https://www.fusionai.tv/v1'])assert.throws(()=>baseUrl(value));
 assert.throws(()=>options(['generate','--api-key','secret']));assert.throws(()=>options(['generate','--prompt','x','--prompt-file','x.txt']));assert.throws(()=>options(['models','--timeout','0']));
});
