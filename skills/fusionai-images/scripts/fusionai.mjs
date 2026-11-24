#!/usr/bin/env node
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import https from 'node:https';
import {Readable} from 'node:stream';

export const DEFAULT_BASE='https://www.fusionai.tv';
const MAX_BYTES=64*1024*1024;
export function baseUrl(value=process.env.FUSIONAI_API_BASE_URL||DEFAULT_BASE){
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('API base must be an HTTPS origin without credentials, path, query or fragment.');
  return u.origin;
}
export function options(argv){
  const [command,...rest]=argv;
  if(!['models','generate','edit','help'].includes(command))throw Error('Use models, generate, edit or help.');
  const out={command,images:[],dryRun:false,confirmPaid:false};
  const flags=new Set(['dry-run','confirm-paid']);
  const names={'model':'model','prompt':'prompt','prompt-file':'promptFile','image':'images','mask':'mask','resolution':'resolution','size':'size','quality':'quality','aspect-ratio':'ratio','output-dir':'outputDir','timeout':'timeout'};
  for(let i=0;i<rest.length;i++){
    const flag=rest[i];if(!flag.startsWith('--'))throw Error('Expected a named option.');
    const key=flag.slice(2);
    if(flags.has(key)){out[key==='dry-run'?'dryRun':'confirmPaid']=true;continue;}
    if(!names[key]||!rest[i+1]||rest[i+1].startsWith('--'))throw Error('Unknown option or missing value: '+flag);
    if(key==='image')out.images.push(rest[++i]);else out[names[key]]=rest[++i];
  }
  out.timeout=Number(out.timeout??600);
  if(!Number.isFinite(out.timeout)||out.timeout<=0||out.timeout>1800)throw Error('Timeout must be 1–1800 seconds.');
  if(out.prompt&&out.promptFile)throw Error('Choose --prompt or --prompt-file.');
  return out;
}
async function localImage(file){
  const bytes=await readFile(file);if(bytes.length>20*1024*1024)throw Error('Each reference must be at most 20 MiB.');
  const mime=imageMime(bytes);if(!mime)throw Error('References must contain PNG, JPEG, WebP or GIF image bytes.');
  return {bytes,mime,name:basename(file).replace(/[\r\n"]/g,'_')};
}
export function imageMime(b){
  if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
  if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';
  if(b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'image/webp';
  if(b.length>=6&&['GIF87a','GIF89a'].includes(b.toString('ascii',0,6)))return 'image/gif';
  return null;
}
export async function buildRequest(opts,protocol){
  if(!opts.model||!opts.prompt?.trim())throw Error('A model and nonempty prompt are required.');
  if(opts.images.length>4)throw Error('This client accepts at most four references.');
  if(opts.command==='edit'&&!opts.images.length)throw Error('Editing requires at least one --image.');
  if(opts.command==='generate'&&opts.images.length&&protocol!=='gemini-generate-content')throw Error('Use edit for Images API references.');
  if(protocol==='gemini-generate-content'){
    if(opts.mask||opts.size||opts.quality)throw Error('Gemini does not use this client’s --mask, --size or --quality options.');
    const parts=[{text:opts.prompt}];
    for(const file of opts.images){const im=await localImage(file);parts.push({inlineData:{mimeType:im.mime,data:im.bytes.toString('base64')}});}
    return {path:'/v1beta/models/'+encodeURIComponent(opts.model)+':generateContent',body:{contents:[{role:'user',parts}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{...(opts.ratio?{aspectRatio:opts.ratio}:{}),...(opts.resolution?{imageSize:opts.resolution.toUpperCase()}: {})}}}};
  }
  if(protocol!=='openai-images')throw Error('Unsupported model protocol. This client supports openai-images and gemini-generate-content.');
  if(opts.ratio)throw Error('For GPT Images use --size rather than --aspect-ratio.');
  if(/^grok-/i.test(opts.model))throw Error('Grok URL editing is not implemented by this client.');
  const fields={model:opts.model,prompt:opts.prompt,...(opts.size?{size:opts.size}:{}),...(opts.resolution?{resolution:opts.resolution.toUpperCase()}:{}),...(opts.quality?{quality:opts.quality}:{}),response_format:'b64_json'};
  if(opts.command==='generate'){
    if(opts.mask)throw Error('Masks require the edit command.');
    return {path:'/v1/images/generations',body:{...fields,n:1,output_format:'png'}};
  }
  const form=new FormData();for(const [k,v]of Object.entries(fields))form.append(k,v);
  for(const file of opts.images){const im=await localImage(file);form.append('image[]',new Blob([im.bytes],{type:im.mime}),im.name);}
  if(opts.mask){const im=await localImage(opts.mask);if(im.mime!=='image/png')throw Error('Mask must contain PNG bytes.');form.append('mask',new Blob([im.bytes],{type:im.mime}),im.name);}
  return {path:'/v1/images/edits',body:form};
}
async function limitedBytes(response){
  if(Number(response.headers.get('content-length'))>MAX_BYTES){await response.body?.cancel();throw Error('Response exceeds 64 MiB.');}
  const parts=[];let size=0;
  if(!response.body)return Buffer.alloc(0);
  for await(const chunk of response.body){size+=chunk.length;if(size>MAX_BYTES)throw Error('Response exceeds 64 MiB.');parts.push(chunk);}
  return Buffer.concat(parts);
}
function scrub(text,key){return String(text).replaceAll(key||'\u0000','[redacted]').replace(/Bearer\s+\S+/gi,'Bearer [redacted]').replace(/sk-fusion-[a-z0-9_-]+/gi,'[redacted]').slice(0,1200);}
export async function apiRequest(path,{method='GET',body,key,base=DEFAULT_BASE,timeout=600,fetchImpl=fetch}={}){
  if(!key)throw Error('Set FUSIONAI_API_KEY in your environment. Do not put keys in command arguments.');
  let response;
  try{response=await fetchImpl(baseUrl(base)+path,{method,headers:{Authorization:'Bearer '+key,Accept:'application/json',...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(timeout*1000)});}
  catch{throw Error('API network error or timeout. POST outcome may be unknown; no automatic retry was made.');}
  const requestId=response.headers.get('x-request-id');
  let payload;try{payload=JSON.parse((await limitedBytes(response)).toString('utf8'));}catch{throw Error('Invalid or oversized API response'+(requestId?' (request ID '+requestId+')':''));}
  if(!response.ok)throw Error('HTTP '+response.status+': '+scrub(payload.error?.message||payload.message||'API request failed',key)+(requestId?' (request ID '+requestId+')':''));
  return {payload,requestId};
}
export function privateAddress(ip){
  if(!isIP(ip))return true;
  if(isIP(ip)===6)return !/^2[0-9a-f]{3}:/i.test(ip); // only global-unicast IPv6
  const [a,b]=ip.split('.').map(Number);
  return a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&[0,168].includes(b))||(a===198&&[18,19,51].includes(b))||(a===203&&b===0);
}
function pinnedFetch(url,addresses,timeout){
  return new Promise((resolve,reject)=>{
    const req=https.get(url,{signal:AbortSignal.timeout(timeout*1000),lookup:(_host,opts,cb)=>opts.all?cb(null,addresses.map(a=>({...a,family:isIP(a.address)}))):cb(null,addresses[0].address,isIP(addresses[0].address))},res=>{
      resolve(new Response(Readable.toWeb(res),{status:res.statusCode,headers:Object.fromEntries(Object.entries(res.headers).filter(([,v])=>v!==undefined).map(([k,v])=>[k,Array.isArray(v)?v.join(', '):v]))}));
    });req.on('error',reject);
  });
}
export async function downloadImage(value,{fetchImpl,lookupImpl=lookup,timeout=180}={}){
  let u=new URL(value);
  for(let hops=0;hops<4;hops++){
    if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443'))throw Error('Result downloads require public HTTPS URLs.');
    const host=u.hostname.replace(/^\[|\]$/g,'');
    const addresses=isIP(host)?[{address:host}]:await lookupImpl(host,{all:true});
    if(!addresses.length||addresses.some(a=>privateAddress(a.address)))throw Error('Private or reserved result destination rejected.');
    // A fresh request has no API credentials. Revalidate every redirect.
    const r=fetchImpl?await fetchImpl(u,{redirect:'manual',signal:AbortSignal.timeout(timeout*1000)}):await pinnedFetch(u,addresses,timeout);
    if([301,302,303,307,308].includes(r.status)){const next=r.headers.get('location');await r.body?.cancel();if(!next)throw Error('Missing redirect location.');u=new URL(next,u);continue;}
    if(!r.ok)throw Error('Result download failed: HTTP '+r.status);
    const bytes=await limitedBytes(r);if(!imageMime(bytes))throw Error('Result did not contain a supported image.');return bytes;
  }
  throw Error('Too many result redirects.');
}
export function collectImages(payload){
  const result=[];
  for(const im of payload.data||[]){if(im.b64_json)result.push({bytes:Buffer.from(im.b64_json,'base64')});else if(im.url)result.push({url:im.url});}
  for(const c of payload.candidates||[])for(const p of c.content?.parts||[]){const d=p.inlineData||p.inline_data;if(d?.data)result.push({bytes:Buffer.from(d.data,'base64')});}
  return result;
}
export async function run(opts,{fetchImpl=fetch,env=process.env,log=console.log,download=downloadImage}={}){
  if(opts.command==='help'){log('FusionAI Images CLI (Node 22+)\nmodels\ngenerate --model ID --prompt TEXT [--size 1024x1024] [--resolution 1K]\nedit --model ID --prompt TEXT --image FILE [--image FILE] [--mask PNG]\nUse --dry-run to inspect locally; add --confirm-paid to authorize one billable request.\n--prompt-file FILE, --output-dir DIR, --quality VALUE, --aspect-ratio VALUE (Gemini), --timeout SECONDS');return;}
  const base=baseUrl(env.FUSIONAI_API_BASE_URL||DEFAULT_BASE),key=env.FUSIONAI_API_KEY;
  if(opts.command==='models'){const {payload}=await apiRequest('/v1/models',{key,base,timeout:30,fetchImpl});log(JSON.stringify(payload,null,2));return;}
  if(!opts.dryRun&&!opts.confirmPaid)throw Error('Billable operation: use --dry-run or explicitly authorize one call with --confirm-paid.');
  if(opts.promptFile)opts={...opts,prompt:await readFile(opts.promptFile,'utf8')};
  let model;
  if(!opts.dryRun){const {payload}=await apiRequest('/v1/models',{key,base,timeout:30,fetchImpl});model=payload.data?.find(m=>m.id===opts.model);if(!model)throw Error('Model is not in the current authenticated /v1/models catalog.');}
  const protocol=model?.protocol||(opts.model?.startsWith('gemini-')?'gemini-generate-content':'openai-images');
  const request=await buildRequest(opts,protocol);
  if(opts.dryRun){const preview=request.body instanceof FormData?[...request.body].map(([k,v])=>[k,typeof v==='string'?v:{filename:v.name,type:v.type,size:v.size}]):JSON.parse(JSON.stringify(request.body,(k,v)=>k==='data'?'[image bytes omitted]':v));log(JSON.stringify({dryRun:true,url:base+request.path,method:'POST',body:preview,catalogValidated:false},null,2));return;}
  const {payload,requestId}=await apiRequest(request.path,{method:'POST',body:request.body,key,base,timeout:opts.timeout,fetchImpl});
  const images=collectImages(payload);if(!images.length)throw Error('No image returned'+(requestId?' (request ID '+requestId+')':'')+'. No automatic retry was made.');
  const directory=resolve(opts.outputDir||'outputs');await mkdir(directory,{recursive:true});const saved=[],failures=[];
  for(const [i,image]of images.entries()){
    try{const bytes=image.bytes||await download(image.url,{timeout:Math.min(opts.timeout,180)}),mime=imageMime(bytes);if(!mime)throw Error('Invalid image bytes.');const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'}[mime],file=resolve(directory,'fusionai-'+randomUUID()+'-'+i+'.'+ext);await writeFile(file,bytes,{flag:'wx'});saved.push(file);}
    catch{failures.push('Image '+(i+1)+' could not be saved. Preserve the API request ID; do not regenerate automatically.');}
  }
  log(JSON.stringify({model:opts.model,requestId,saved,failures},null,2));
  if(failures.length)throw Error('Generation returned a result, but local saving was incomplete. No retry was made.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{await run(options(process.argv.slice(2)));}catch(e){console.error(JSON.stringify({error:scrub(e.message,process.env.FUSIONAI_API_KEY)}));process.exitCode=1;}
}
