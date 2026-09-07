import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export const env={};
export function resetDatabase(){
 const sql=new DatabaseSync(':memory:');
 sql.exec('PRAGMA foreign_keys=ON');
 for(const file of ['0000_exotic_hulk.sql','0001_slippery_diamondback.sql','0002_neat_jane_foster.sql']) sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 const prepare=(query)=>{
  let args=[];const s=sql.prepare(query);
  return {bind(...v){args=v;return this;},async first(){return s.get(...args)??null;},async all(){return {results:s.all(...args)};},async run(){return {meta:s.run(...args)};}};
 };
 env.DB={prepare,async batch(stmts){const results=[];for(const s of stmts)results.push(await s.run());return results;}};
 return sql;
}
