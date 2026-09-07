import { registerHooks } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
import { resetDatabase } from './d1-fixture.mjs';
registerHooks({resolve(specifier,context,next){if(specifier==='cloudflare:workers')return {url:new URL('./d1-fixture.mjs',import.meta.url).href,shortCircuit:true};return next(specifier,context);}});
const repo=await import('../db/repository.ts');
const input={title:'Notes',description:'A personal notebook.',liveUrl:'https://example.org/',repositoryUrl:null,verificationStatus:'unverified'};
async function setup(){const sql=resetDatabase();const creator=await repo.upsertCreator({githubId:'1',githubHandle:'maker',displayName:'Maker',avatarUrl:'https://example.org/avatar',profileUrl:'https://github.com/maker'});return {sql,creator};}
test('profile visibility, review, hiding, and moderation remain distinct',async()=>{
 const {creator}=await setup();const p=await repo.createProject({creatorId:creator.id,...input});
 assert.equal(p.last_check_status,'unchecked');assert.equal(p.last_checked_at,null);
 assert.equal((await repo.listApprovedProjects()).length,0);assert.equal((await repo.listVisibleProjectsForCreator(creator.id)).length,1);
 await repo.moderateProject(p.id,'approve',null);assert.equal((await repo.listApprovedProjects()).length,1);
 assert.equal(await repo.getOwnedProject(p.id,'someone-else'),null);
 assert.equal(await repo.updateOwnedProject(p.id,'someone-else',input),false);
 await repo.withdrawOwnedProject(p.id,creator.id);
 assert.equal((await repo.listApprovedProjects()).length,0);assert.equal((await repo.listVisibleProjectsForCreator(creator.id)).length,0);
 await repo.moderateProject(p.id,'approve',null);assert.equal((await repo.listApprovedProjects()).length,0);
 await repo.showOwnedProjectOnProfile(p.id,creator.id);assert.equal((await repo.listVisibleProjectsForCreator(creator.id)).length,1);
 assert.equal(await repo.submitOwnedProjectToGallery(p.id,creator.id),true);
 await repo.moderateProject(p.id,'unavailable','Unsafe site');assert.equal((await repo.listVisibleProjectsForCreator(creator.id)).length,0);
});
test('old capture jobs cannot replace the preview of an edited URL',async()=>{
 const {creator}=await setup();const p=await repo.createProject({creatorId:creator.id,...input});
 await repo.updateOwnedProject(p.id,creator.id,{...input,liveUrl:'https://example.com/'});
 assert.equal(await repo.setThumbnailState(p.id,'ready','projects/old/image.png',null,p.live_url,p.updated_at),false);
 const newer=await repo.getProjectById(p.id);
 assert.equal(await repo.setThumbnailState(p.id,'ready','projects/new/image.png',null,newer.live_url,newer.updated_at),true);
 await repo.queueThumbnail(p.id);assert.equal((await repo.getProjectById(p.id)).thumbnail_storage_key,'projects/new/image.png');
 await repo.queueThumbnail(p.id,true);assert.equal((await repo.getProjectById(p.id)).thumbnail_storage_key,null);
});
test('OAuth state is single use and sessions expire server-side',async()=>{
 const {creator,sql}=await setup();await repo.createOAuthState('state','/submit');
 assert.equal(await repo.consumeOAuthState('state'),'/submit');assert.equal(await repo.consumeOAuthState('state'),null);
 await repo.createSession('session',creator.id);assert.equal((await repo.getCreatorForSession('session')).id,creator.id);
 sql.prepare("UPDATE sessions SET expires_at='2000-01-01'").run();assert.equal(await repo.getCreatorForSession('session'),null);
});
test('three real failures withdraw a project; successful checks only restore automatic withdrawals',async()=>{
 const {creator}=await setup();const p=await repo.createProject({creatorId:creator.id,...input});await repo.moderateProject(p.id,'approve',null);
 await repo.setProjectLinkHealth(p.id,false);await repo.setProjectLinkHealth(p.id,false);assert.equal((await repo.listApprovedProjects()).length,1);
 await repo.setProjectLinkHealth(p.id,false);assert.equal((await repo.listApprovedProjects()).length,0);
 await repo.setProjectLinkHealth(p.id,true);assert.equal((await repo.listApprovedProjects()).length,1);
 await repo.moderateProject(p.id,'unavailable','Manual moderation');await repo.setProjectLinkHealth(p.id,true);assert.equal((await repo.listApprovedProjects()).length,0);
});
test('report allowance limits repeated reports',async()=>{await setup();for(let i=0;i<5;i++)assert.equal(await repo.consumeReportAllowance('visitor'),true);assert.equal(await repo.consumeReportAllowance('visitor'),false);});
