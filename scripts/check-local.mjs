import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { galleryProjects, projectSlug } from '../app/fixtures/demoGallery.ts';
const base='http://localhost:3007';
const {token}=JSON.parse(readFileSync('.wrangler/review-session.json','utf8'));
const auth={cookie:`sundays_session=${token}`};
let checks=0;
const routes=['/','/explore','/archive','/about','/join','/submit','/demo','/demo/explore','/demo/archive','/demo/about','/maker/sundays-local-review','/project/local-field-study',...galleryProjects.map(p=>'/demo/'+projectSlug(p)),...new Set(galleryProjects.map(p=>'/demo/maker/'+p.handle))];
for(let i=0;i<routes.length;i+=4) await Promise.all(routes.slice(i,i+4).map(async path=>{const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();assert.ok(html.includes('<h1'),path);const nav=html.match(/<nav[\s\S]*?<\/nav>/)?.[0];if(nav)assert.ok(nav.includes(`href="${path.startsWith('/demo')?'/demo/explore':'/explore'}"`),path+' navigation');checks++;}));
for(const path of ['/missing-page','/demo/missing-project','/demo/maker/missing-maker','/maker/missing-maker','/project/local-hidden']){const r=await fetch(base+path);assert.equal(r.status,404,path);checks++;}
const dashboard=await fetch(base+'/dashboard',{headers:auth});assert.equal(dashboard.status,200);assert.match(await dashboard.text(),/Your shared projects/);checks++;
const unsigned=await fetch(base+'/dashboard',{redirect:'manual'});assert.ok([302,303,307].includes(unsigned.status));checks++;
for(const path of ['/api/projects','/api/projects/local-field','/api/projects/local-field/recapture','/api/admin/projects/local-field','/api/auth/signout','/api/projects/local-field/report']){const r=await fetch(base+path,{method:'POST',headers:{...auth,origin:'https://evil.example'},body:new URLSearchParams({action:'withdraw'})});assert.equal(r.status,403,path);checks++;}
const post=(path,fields,headers={})=>fetch(base+path,{method:'POST',redirect:'manual',headers:{...auth,origin:base,...headers},body:new URLSearchParams(fields)});
const denied=await post('/api/admin/projects/local-field',{action:'approve'});assert.equal(denied.status,403);checks++;
const unknown=await post('/api/projects/not-owned',{action:'withdraw'});assert.equal(unknown.status,404);checks++;
const invalid=await post('/api/projects',{title:'Broken test',description:'A local validation test.',live_url:'http://127.0.0.1'},{accept:'application/json'});assert.equal(invalid.status,422);assert.match((await invalid.json()).error,/private|internal/);checks++;
const show=await post('/api/projects/local-hidden',{action:'show_profile'});assert.equal(show.status,303);
assert.match(await(await fetch(base+'/maker/sundays-local-review')).text(),/A hidden project/);
await post('/api/projects/local-hidden',{action:'withdraw'});
assert.doesNotMatch(await(await fetch(base+'/maker/sundays-local-review')).text(),/A hidden project/);checks+=2;
const thumbnail=await fetch(base+'/thumbnail/projects/local-field/review.png');assert.equal(thumbnail.status,200);assert.equal(thumbnail.headers.get('content-type'),'image/png');checks++;
const report=await post('/api/projects/local-field/report',{reason:'other',details:'Local QA report — fictional sample only.'});assert.equal(report.status,303);const notice=await(await fetch(base+new URL(report.headers.get('location')).pathname+'?reported=1')).text();assert.match(notice,/<details[^>]*open/);checks++;
console.log(`${checks} local HTTP and workflow checks passed, including ${routes.length} public routes.`);
