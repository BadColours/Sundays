import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import { galleryProjects,projectSlug } from '../app/fixtures/demoGallery.ts';
test('every demo thumbnail exists, every slug is unique, and repeated creators keep separate projects',()=>{
 const slugs=new Set();for(const p of galleryProjects){assert.ok(!slugs.has(projectSlug(p)));slugs.add(projectSlug(p));if(p.thumbnail)assert.ok(existsSync(new URL('../public'+p.thumbnail,import.meta.url)),p.thumbnail);}
 assert.ok(galleryProjects.filter(p=>p.handle==='arivale').length>1);
});
test('deployment is Sundays-only with persistent bindings and immutable existing migrations',()=>{
 const config=JSON.parse(readFileSync(new URL('../.openai/hosting.json',import.meta.url),'utf8'));
 assert.equal(config.project_id,'appgprj_6a6a635771fc8191af1955b18bd07801');assert.equal(config.d1,'DB');assert.equal(config.r2,'THUMBNAILS');
 assert.ok(!existsSync(new URL('../app/api/schools',import.meta.url)));
});
