// Local QA only: exposes a fictional creator session on a separate loopback port.
// This script is not an application route and is never bundled into the Worker.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const {token,expires}=JSON.parse(readFileSync('.wrangler/review-session.json','utf8'));
if(Date.now()>=Date.parse(expires)) throw new Error('Run npm run review:seed to renew the local sample session.');
const upstream='http://localhost:3007';
createServer(async(req,res)=>{
 try {
  if(req.headers.host!=='localhost:3008'&&req.headers.host!=='127.0.0.1:3008'){res.writeHead(403).end();return;}
  if(req.headers.origin && !['http://localhost:3008','http://127.0.0.1:3008'].includes(req.headers.origin)){res.writeHead(403).end();return;}
  const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v && !['host','connection','content-length','cookie'].includes(k))headers.set(k,Array.isArray(v)?v.join(','):v);
  headers.set('cookie',`sundays_session=${token}`);
  if(req.headers.origin) headers.set('origin',upstream);
  const parts=[];let size=0;for await(const part of req){size+=part.length;if(size>16384){res.writeHead(413).end();return;}parts.push(part);}
  const response=await fetch(new URL(req.url,upstream),{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(parts),redirect:'manual'});
  const out=Object.fromEntries(response.headers);delete out['content-encoding'];delete out['content-length'];delete out['transfer-encoding'];
  if(out.location)out.location=out.location.replace(upstream,'http://localhost:3008');
  out['cache-control']='private, no-store';
  res.writeHead(response.status,out);res.end(Buffer.from(await response.arrayBuffer()));
 } catch {res.writeHead(502).end('Start the Sundays preview on port 3007, then reload.');}
}).listen(3008,'127.0.0.1',()=>console.log('Local sample creator review: http://localhost:3008/dashboard'));
