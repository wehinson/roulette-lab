import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Synthetic browser surface; every application module is loaded unmodified.
async function app(){
  class Element {
    constructor(){this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={toggle(){}};this.value='1';this.hidden=true;this.disabled=false;this.textContent='';this.attrs={};this.options=[];}
    append(...xs){this.children.push(...xs);} replaceChildren(...xs){this.children=xs;}
    setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k]??null;}
    add(x){this.options.push(x);} addEventListener(){} checkValidity(){return this.valid!==false;}
  }
  const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  const values={strategy:'flat',limitRule:'stop',seed:'fixture',bankroll:'1000',base:'10',spins:'2',sessions:'1',tableMax:'1000',takeProfit:'0',stopLoss:'0',resetWins:'3'};
  for(const [id,value]of Object.entries(values))get(id).value=value;
  get('strategy').options=[{value:'flat',text:'Flat'}];
  get('output').hidden=true;get('cancel').hidden=true;
  const workers=[],blobs=[];let mode='ok';
  class Worker {
    constructor(){if(mode==='construct')throw Error('constructor fixture');this.terminated=0;this.sent=[];workers.push(this);}
    postMessage(c){if(mode==='send')throw Error('send fixture');this.sent.push(c);}
    terminate(){this.terminated++;}
  }
  class TestURL extends URL {static createObjectURL(blob){blobs.push(blob);return 'blob:fixture'+blobs.length;}static revokeObjectURL(){}}
  const context=vm.createContext({document:{getElementById:get,createElement:()=>new Element(),createElementNS:()=>new Element(),createTextNode:t=>t,querySelectorAll:()=>[]},Option:class{constructor(text,value){this.text=text;this.value=value;}},Worker,structuredClone,fetch:async()=>({ok:true,json:async()=>({})}),setTimeout:()=>0,performance:{now:()=>10},navigator:{userAgent:'synthetic'},innerWidth:1000,URL:TestURL,Blob,console});
  const modules=new Map();
  async function load(url){if(modules.has(url))return modules.get(url);const module=new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context,identifier:url});modules.set(url,module);await module.link((specifier,parent)=>load(new URL(specifier,parent.identifier).href));return module;}
  const module=await load(new URL('./dist/app.mjs',import.meta.url).href);await module.evaluate();
  const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
  const result={bank:1010,profit:10,wagered:10,benchmark:-10/37,spins:2,wageringSpins:1,limitHits:0,reason:'spin limit',path:[{x:0,y:0},{x:2,y:10}]};
  return {get,workers,blobs,mode:x=>mode=x,run:()=>get('run').onclick(),cancel:()=>get('cancel').onclick(),flush,result};
}
function idle(a){assert.equal(a.get('run').disabled,false);assert.equal(a.get('cancel').hidden,true);}
async function completed(a){a.run();const w=a.workers.at(-1);w.onmessage({data:{results:[a.result]}});await a.flush();return a.get('downloadReport').href;}
for(const mode of ['construct','send'])test(`${mode} failure recovers, preserves report and permits retry`,async()=>{
 const a=await app(),href=await completed(a),report=await a.blobs.at(-1).text();a.mode(mode);
 assert.doesNotThrow(a.run);idle(a);assert.match(a.get('error').textContent,/try again/i);assert.notEqual(a.get('status').textContent,'Simulating…');
 assert.equal(a.get('downloadReport').href,href);assert.equal(await a.blobs.at(-1).text(),report);assert.equal(a.get('output').hidden,false);
 if(mode==='send')assert.equal(a.workers.at(-1).terminated,1);
 a.mode('ok');await completed(a);idle(a);assert.equal(a.get('status').textContent,'1 sessions complete');
});
test('invalid config does not construct a Worker',async()=>{const a=await app();a.get('seed').value='';a.run();idle(a);assert.equal(a.workers.length,0);assert.match(a.get('error').textContent,/seed/);});
test('progress and completion retain report behavior',async()=>{const a=await app();a.run();const w=a.workers[0];assert.equal(w.sent.length,1);w.onmessage({data:{progress:.5}});assert.equal(a.get('status').textContent,'Simulating · 50%');w.onmessage({data:{results:[a.result]}});await a.flush();idle(a);assert.equal(w.terminated,1);assert.match(await a.blobs[0].text(),/fixture/);});
for(const kind of ['cancel','error','message error','send'])test(`${kind} cleanup ignores stale callbacks during retry`,async()=>{
 const a=await app();a.mode(kind==='send'?'send':'ok');assert.doesNotThrow(a.run);const old=a.workers[0];
 if(kind==='cancel')a.cancel();if(kind==='error')old.onerror();if(kind==='message error')old.onmessage({data:{error:'fixture error'}});
 idle(a);assert.equal(old.terminated,1);a.mode('ok');a.run();const next=a.workers.at(-1);
 old.onmessage({data:{progress:.9}});old.onmessage({data:{results:[a.result]}});old.onerror();
 assert.equal(a.get('run').disabled,true);assert.equal(a.get('status').textContent,'Simulating…');assert.equal(next.terminated,0);assert.equal(a.blobs.length,0);
 next.onmessage({data:{results:[a.result]}});await a.flush();idle(a);assert.equal(next.terminated,1);
});
