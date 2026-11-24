import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(['.git','node_modules','outputs'].includes(e.name))continue;const file=resolve(dir,e.name);if(e.isDirectory())await walk(file);else files.push(file);}}
await walk(root);
for(const file of files){
 const text=await readFile(file,'utf8');
 assert.doesNotMatch(text,/GOCSPX-[A-Za-z0-9_-]+|(?:AKIA|LTAI)[A-Za-z0-9]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{20,}|sk-fusion-[A-Za-z0-9]{16,}/,'Possible credential: '+file);
 if(!file.endsWith('.md'))continue;
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
  const link=m[1].split('#')[0];if(!link||/^[a-z]+:/i.test(link)||link.startsWith('//'))continue;
  const target=resolve(dirname(file),decodeURIComponent(link));assert.ok(target===root||target.startsWith(root+'/')||target.startsWith(root+'\\'),'Link escapes repository: '+file);assert.ok(await stat(target).catch(()=>false),'Broken local link '+link+' in '+file);
 }
}
for(const name of ['fusionai-images','fusionai-product-photography']){
 const file=resolve(root,'skills',name,'SKILL.md'),text=await readFile(file,'utf8');assert.match(text,new RegExp('^---\\r?\\nname: '+name+'\\r?\\ndescription: .+\\r?\\n---'));assert.ok(text.length<9000);
}
for(const name of ['fashion-product-photography','product-background-replacement','object-removal']){
 const item=JSON.parse(await readFile(resolve(root,'examples',name,'evidence.json'),'utf8'));assert.ok(item.prompt&&item.receivedOutput.width>0&&item.images.length>=2);assert.equal(Object.hasOwn(item,'historyId'),false);assert.ok(item.images.every(im=>new URL(im.url).hostname==='www.fusionai.tv'));
}
console.log('Checked',files.length,'files: local links, skill entrypoints, evidence structure and credential patterns.');
