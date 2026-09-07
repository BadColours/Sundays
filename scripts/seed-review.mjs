import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const token=randomBytes(32).toString('hex');
const hash=createHash('sha256').update(token).digest('hex');
const now=new Date().toISOString();
const expiry=new Date(Date.now()+86400000).toISOString();
mkdirSync('.wrangler',{recursive:true});
const sql=`
INSERT OR IGNORE INTO creators VALUES ('local-review','local-only','sundays-local-review','Local review creator','/favicon.svg','https://github.com/', '${now}','${now}');
DELETE FROM sessions WHERE creator_id = 'local-review';
INSERT INTO sessions VALUES ('${hash}','local-review','${now}','${expiry}');
INSERT OR IGNORE INTO projects (id,creator_id,slug,title,short_description,live_url,moderation_status,profile_status,thumbnail_status,thumbnail_storage_key,created_at,updated_at,published_at)
VALUES ('local-field','local-review','local-field-study','Field Study · local sample','A sample project for reviewing the Sundays creator flow.','https://offhours-gallery.badcolours.chatgpt.site/demo/field-study','approved','visible','ready','projects/local-field/review.png','${now}','${now}','${now}');
INSERT OR IGNORE INTO projects (id,creator_id,slug,title,short_description,live_url,moderation_status,profile_status,thumbnail_status,created_at,updated_at)
VALUES ('local-pending','local-review','local-pending','A project in review · local sample','Visible on the creator profile while gallery review is pending.','https://offhours-gallery.badcolours.chatgpt.site/demo/hush','submitted','visible','failed','${now}','${now}');
INSERT OR IGNORE INTO projects (id,creator_id,slug,title,short_description,live_url,moderation_status,profile_status,thumbnail_status,created_at,updated_at)
VALUES ('local-hidden','local-review','local-hidden','A hidden project · local sample','A private sample to test showing and hiding a project.','https://offhours-gallery.badcolours.chatgpt.site/demo/altitude','draft','hidden','failed','${now}','${now}');
`;
writeFileSync('.wrangler/review.sql',sql);
function wrangler(args){const r=spawnSync('node_modules/.bin/wrangler',[...args,'--local','--config','wrangler.local.jsonc'],{stdio:'inherit',env:{...process.env,WRANGLER_LOG_PATH:'.wrangler/seed.log'}});if(r.status!==0) process.exit(r.status??1);}
wrangler(['d1','execute','DB','--file','.wrangler/review.sql']);
wrangler(['r2','object','put','site-creator-r2/projects/local-field/review.png','--file','public/explore-thumbs/35.png','--content-type','image/png']);
writeFileSync('.wrangler/review-session.json',JSON.stringify({token,expires:expiry}),{mode:0o600});
console.log('Local sample records are ready. Session expires in 24 hours.');
