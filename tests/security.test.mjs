import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePublicUrl, isPrivateIp, probePublicUrl } from '../lib/url-safety.ts';
import { isSameOriginMutation, mutationGuard } from '../lib/request-security.ts';
import { readProjectFields, verifyProjectFields } from '../lib/project-input.ts';
import { readCaptureImage } from '../lib/image-response.ts';

test('public URLs reject private, obfuscated, credential, and reserved destinations',()=>{
 for(const url of ['http://localhost','http://127.1','http://2130706433','http://0x7f000001','http://10.1.2.3','http://100.64.0.1','http://169.254.169.254','http://192.168.1.1','http://172.16.2.2','http://198.18.0.1','http://[::ffff:127.0.0.1]','http://[::ffff:a00:1]','https://internal.local','https://me:secret@example.org','file:///etc/passwd','javascript:alert(1)','https://example.org:9000']) assert.throws(()=>validatePublicUrl(url),url);
 assert.equal(validatePublicUrl('https://github.com/openai/codex#readme').toString(),'https://github.com/openai/codex');
 assert.equal(isPrivateIp('::ffff:c0a8:101'),true);
});
test('every origin-dependent write rejects missing, opaque and cross-site origins',()=>{
 const req=(headers)=>new Request('https://sundays.example/api/projects',{method:'POST',headers});
 assert.equal(isSameOriginMutation(req({origin:'https://sundays.example'})),true);
 for(const headers of [{},{origin:'null'},{origin:'https://evil.example'},{origin:'https://sundays.example','sec-fetch-site':'cross-site'}]) assert.equal(mutationGuard(req(headers)).status,403);
 assert.equal(mutationGuard(req({origin:'https://sundays.example','content-length':'20000'})).status,413);
});
const form=(fields={})=>{const f=new FormData();for(const [k,v]of Object.entries({title:'Quiet Notes',description:'A small notebook for evening ideas.',live_url:'https://example.org',...fields}))f.set(k,v);return f;};
test('project validation retains normal URLs but rejects malformed fields and repo links',()=>{
 assert.equal(readProjectFields(form()).liveUrl,'https://example.org/');
 for(const fields of [{title:' '},{description:'short'},{live_url:'http://127.0.0.1'},{repository_url:'https://github.com/user/repo/issues'}]) assert.throws(()=>readProjectFields(form(fields)),{name:'InputError'});
});
test('a typed repository owner cannot claim verification without a public repository response',async(t)=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('{}',{status:404}));
 assert.equal((await verifyProjectFields(form({repository_url:'https://github.com/maker/not-real'}),'maker')).verificationStatus,'unverified');
 globalThis.fetch=async()=>Response.json({private:false,owner:{login:'Maker'}});
 assert.equal((await verifyProjectFields(form({repository_url:'https://github.com/maker/real'}),'maker')).verificationStatus,'verified');
 globalThis.fetch=async()=>{throw new Error('rate limited');};
 assert.equal((await verifyProjectFields(form({repository_url:'https://github.com/maker/real'}),'maker')).verificationStatus,'unverified');
});
test('DNS and redirect checks reject unsafe destinations before requesting them',async(t)=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url)=>{calls.push(String(url));return Response.json({Answer:[{type:1,data:'10.0.0.1'}]});});
 await assert.rejects(probePublicUrl('https://example.org'),/private/);
 assert.equal(calls.some(url=>url==='https://example.org/'),false);
 globalThis.fetch=async(url)=>String(url).includes('dns-query')?Response.json({Answer:[{type:1,data:'93.184.216.34'}]}):new Response(null,{status:302,headers:{location:'http://127.0.0.1/admin'}});
 await assert.rejects(probePublicUrl('https://example.org'),/private/);
});
test('capture ingestion rejects SVG, bogus raster bodies, and unbounded chunks',async()=>{
 await assert.rejects(readCaptureImage(new Response('<svg/>',{headers:{'content-type':'image/svg+xml'}})),/PNG/);
 await assert.rejects(readCaptureImage(new Response('<script/>',{headers:{'content-type':'image/png'}})),/invalid/);
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(5_000_001));c.close();}});
 await assert.rejects(readCaptureImage(new Response(stream,{headers:{'content-type':'image/png'}})),/too large/);
 const png=Uint8Array.from([137,80,78,71,13,10,26,10]);
 assert.equal((await readCaptureImage(new Response(png,{headers:{'content-type':'image/png'}}))).bytes.length,8);
});

test('chunked form bodies cannot bypass the body limit',async()=>{
 const { readBoundedFormData } = await import('../lib/request-security.ts');
 const normal=new Request('https://example.org',{method:'POST',body:new URLSearchParams({title:'Kept'})});
 assert.equal((await readBoundedFormData(normal)).get('title'),'Kept');
 const oversized=new Request('https://example.org',{method:'POST',body:'x'.repeat(17000)});
 await assert.rejects(readBoundedFormData(oversized),/too large/);
});
