import assert from 'node:assert/strict';import {prepare,settle,options,session,rng,simulate,multiplier,nextIndex,describeBet,bettingCommand} from './dist/engine.mjs';
let checks=0;function equal(a,b){assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);checks++;}
for(const n of [37,38,39])for(const type of ['red','black','odd','even','low','high','dozen','column','straight','split','street','corner','six']){const opts=options(type,n);for(const o of opts.length?opts:[{value:''}]){const b=prepare({type,value:o.value},n);equal(new Set(b.nums).size,b.nums.length);assert.ok(b.nums.every(x=>x>=0&&x<n));equal(Array.from({length:n},(_,i)=>settle(b,i,1)).reduce((a,b)=>a+b,0)/n,-(n-36)/n);}}
const basket=prepare({type:'basket'},38);equal(basket.edge,3/38);equal(Array.from({length:38},(_,i)=>settle(basket,i,1)).reduce((a,b)=>a+b,0)/38,-3/38);for(const type of ['red','black','odd','even','low','high','dozen','column'])for(const z of [0,37,38])equal(settle(prepare({type,value:'1'},39),z,10),-10);
equal(multiplier('fibonacci',0),1);equal(multiplier('fibonacci',1),1);equal(multiplier('fibonacci',5),8);equal(nextIndex('fibonacci',5,10),3);equal(nextIndex('martingale',5,10),0);equal(nextIndex('reverse',2,10,3),0);equal(nextIndex('dalembert',0,10),0);equal(nextIndex('martingale',3,0),3);
const c={pockets:37,bets:[{type:'red',value:'',units:1}],bankroll:1000,base:10,tableMax:1000,limitRule:'stop',strategy:'flat',takeProfit:0,stopLoss:0,spins:100,sessions:100,seed:'test',resetWins:3};let s=session(c,()=>1/37,true);equal(s.profit,1000);equal(s.wagered,1000);equal(s.spins,100);s=session(c,()=>0);equal(s.profit,-1000);equal(s.spins,100);s=session({...c,spins:101},()=>0);assert.equal(s.reason,'bankrupt');s=session({...c,strategy:'martingale',bankroll:100000},()=>0);assert.equal(s.reason,'table limit');equal(s.spins,7);s=session({...c,takeProfit:25},()=>1/37);equal(s.spins,3);s=session({...c,stopLoss:25},()=>0);equal(s.spins,3);s=session({...c,strategy:'martingale',tableMax:20,limitRule:'reset',spins:3},()=>0);equal(s.wagered,40);s=session({...c,strategy:'martingale',tableMax:20,limitRule:'cap',spins:3},()=>0);equal(s.wagered,50);assert.deepEqual(simulate(c),simulate(c));
for(const n of [37,38,39]){const random=rng('fairness'+n),counts=Array(n).fill(0);for(let i=0;i<390000;i++)counts[Math.floor(random()*n)]++;const e=390000/n,chi=counts.reduce((s,x)=>s+(x-e)**2/e,0);assert.ok(chi<85,`uniformity chi-square ${chi}`);console.log(`${n} pockets: 390,000 draws; chi-square ${chi.toFixed(2)}`);}
console.log(`Passed ${checks} numerical assertions plus progression, stops, seeded reproducibility and uniformity smoke checks.`);
// Scheduled wagers: wheel spins advance even when no rule is due.
let scheduled={...c,spins:10,bets:[{type:'straight',value:'17',amount:5,every:3,start:3}]};s=session(scheduled,()=>17/37,true);equal(s.spins,10);equal(s.wageringSpins,3);equal(s.wagered,15);equal(s.profit,525);equal(s.path.at(-1).x,10);
s=session({...scheduled,bets:[{type:'red',value:'',amount:10,every:3,start:1}]},()=>0);equal(s.wageringSpins,4);equal(s.wagered,40);equal(s.profit,-40);
s=session({...scheduled,bets:[{type:'red',value:'',amount:10,every:1,start:100}]},()=>0);equal(s.spins,10);equal(s.wageringSpins,0);equal(s.wagered,0);equal(s.profit,0);
s=session({...scheduled,strategy:'martingale',bets:[{type:'red',value:'',amount:10,every:3,start:3}]},()=>0);equal(s.wagered,70);equal(s.wageringSpins,3);
s=session({...scheduled,bankroll:15,bets:[{type:'red',value:'',amount:10,every:3,start:3}]},()=>0);equal(s.spins,5);equal(s.wagered,10);assert.equal(s.reason,'cannot fund next bet');
const duplicate=[{type:'red',value:'',amount:15,every:2,start:2},{type:'red',value:'',amount:15,every:3,start:3}];s=session({...c,bets:duplicate,spins:10,tableMax:20},()=>1/37);equal(s.spins,5);equal(s.wagered,45);assert.equal(s.reason,'table limit');s=session({...c,bets:duplicate,spins:6,tableMax:20,limitRule:'cap'},()=>1/37);equal(s.wagered,65);equal(s.spins,6);equal(s.limitHits,1);
s=session({...c,spins:3,bets:[{type:'straight',value:'1',amount:10,every:1,start:1},{type:'red',value:'',amount:10,every:1,start:1}]},()=>1/37);equal(s.profit,1080);equal(s.wagered,60);
s=session({...scheduled,takeProfit:100},()=>17/37);equal(s.spins,3);assert.equal(s.reason,'profit target');
for(const n of [37,38,39]){const zero=n-1;const result=session({...c,pockets:n,spins:6,bets:[{type:'straight',value:String(zero),amount:2,every:2,start:2}]},()=>zero/n);equal(result.profit,210);equal(result.wagered,6);equal(result.benchmark,-6*(n-36)/n);}
console.log(`Scheduled wagering checks passed; ${checks} total numerical assertions.`);
// All board targets call the same selection model, without a browser.
class E {
  constructor(){this.children=[];this.dataset={};this.style={setProperty(){}};this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
  append(...c){this.children.push(...c);}replaceChildren(){this.children=[];}setAttribute(k,v){this[k]=v;}
}
const regions=Object.fromEntries(['zeroBoard','numberBoard','streetBoard','sixBoard','columnBoard','dozenBoard','outsideBoard','basketBoard'].map(id=>[id,new E()]));
globalThis.document={getElementById:id=>regions[id],createElement:()=>new E()};
const {mountBoard}=await import('./dist/board.mjs');
for(const n of [37,38,39]){
  let selected;mountBoard(n,b=>selected=b);
  const buttons=Object.values(regions).flatMap(e=>e.children);
  assert.equal(selected.type,'red');
  assert.equal(regions.numberBoard.children.filter(x=>x.dataset.type==='straight').length,36);
  assert.equal(regions.zeroBoard.children.length,n-36);
  assert.equal(regions.basketBoard.children.length,n===38?1:0);
  assert.deepEqual(regions.columnBoard.children.map(b=>b.dataset.value),['3','2','1']);
  for(const button of buttons){
    button.onclick();const prepared=prepare(selected,n);
    assert.ok(prepared.nums.length>0&&prepared.nums.every(x=>x>=0&&x<n));
    assert.ok(selected.label?.length);assert.equal(selected.payout,prepared.payout);
    assert.equal(buttons.filter(b=>b.classes.has('selected')).length,1);
    assert.equal(button['aria-pressed'],'true');
    assert.deepEqual(buttons.filter(b=>b.classes.has('covered')).map(b=>+b.dataset.value).sort((a,b)=>a-b),[...prepared.nums].sort((a,b)=>a-b));
    const text=bettingCommand(selected,{amount:10,every:3,start:2});
    assert.ok(text.includes(selected.label));assert.ok(text.includes('every 3 spins, starting on spin 2'));
  }
  console.log(`Board ${n}: ${buttons.length} targets; command, selected chip, covered numbers, and payout checks passed.`);
}
assert.equal(describeBet({type:'straight',value:'37'},38).label,'00');
assert.equal(describeBet({type:'straight',value:'38'},39).label,'000');
assert.equal(describeBet({type:'corner',value:'1,2,4,5'},37).label,'Corner 1 / 2 / 4 / 5');
delete globalThis.document;
// Reports preserve the completed experiment and explain early stops.
const {summarizeRun,createRunReport,reportFilename}=await import('./dist/report.mjs');
const reportConfig={...c,spins:6,sessions:3,bets:[{type:'split',value:'1,2',amount:7,every:3,start:2}]};
const reportResults=[
  {bank:80,profit:-20,wagered:20,benchmark:-20/37,spins:3,wageringSpins:2,limitHits:0,reason:'cannot fund next bet',path:[{x:0,y:0},{x:3,y:-20}]},
  {bank:100,profit:0,wagered:10,benchmark:-10/37,spins:6,wageringSpins:1,limitHits:0,reason:'spin limit'},
  {bank:140,profit:40,wagered:20,benchmark:-20/37,spins:4,wageringSpins:2,limitHits:2,reason:'table limit'}
];
const stats=summarizeRun(reportResults);
equal(stats.mean,20/3);equal(stats.se,Math.sqrt(2800/9));equal(stats.p10,-16);equal(stats.median,0);equal(stats.p90,32);
assert.equal(stats.wins,1);assert.equal(stats.ties,1);assert.equal(stats.losses,1);assert.equal(stats.ruins,1);assert.equal(stats.limitSessions,1);assert.equal(stats.totals.limitHits,2);assert.equal(stats.totals.spins-stats.totals.wageringSpins,8);
const before=structuredClone({reportConfig,reportResults});
const report=createRunReport(reportResults,reportConfig,{version:'0.1.2',commit:'test-commit',startedAt:'2026-10-09T20:00:00Z',completedAt:'2026-10-09T20:00:01Z',durationMs:1000,userAgent:'test-browser'});
const configText=report.split('EXACT CONFIGURATION (JSON)\n')[1].split('\n').slice(1).join('\n').split('\n\nALL SESSION RESULTS')[0];
assert.deepEqual(JSON.parse(configText),reportConfig);
assert.ok(report.includes('cannot fund next bet: 1 (33.33%)'));
assert.ok(report.includes('Total table-limit hits: 2'));
assert.ok(report.includes('Amount before progression: 7; every 3 spin(s); starts on spin 2'));
assert.ok(report.includes('Source commit: test-commit'));
assert.ok(report.includes('3\t140\t40\t20\t'+(-20/37)+'\t4\t2\t2\t2\ttable limit'));
assert.ok(report.includes('1\t3\t-20'));
assert.deepEqual({reportConfig,reportResults},before);
assert.equal(reportFilename('2026-10-09T20:00:01Z'),'roulette-lab-report-20261009-200001.txt');
assert.equal(reportFilename('invalid'),'roulette-lab-report.txt');
assert.throws(()=>createRunReport([],reportConfig));
const singleReport=createRunReport(reportResults.slice(0,1),{...reportConfig,sessions:1});assert.ok(singleReport.includes('Not estimable from one session'));
const maxConfig={...c,spins:2,sessions:10000,bets:[{type:'red',value:'',amount:10,every:1,start:1}]};
const maxResults=simulate(maxConfig),maxReport=createRunReport(maxResults,maxConfig);
const sessionRows=maxReport.split('session\tfinal_bankroll')[1].split('\n\nSAMPLED PROFIT PATHS')[0].split('\n').slice(1);
assert.equal(sessionRows.length,10000);assert.ok(sessionRows.at(-1).startsWith('10000\t'));
console.log('Report checks passed: known statistics, original settings, all stop reasons, numeric precision, sampled paths, one-session report, and all 10,000 session rows.');
