import {RED,describeBet} from './engine.mjs';
export function mountBoard(n,onSelect){
  const $=id=>document.getElementById(id);
  const regions=['zeroBoard','numberBoard','streetBoard','sixBoard','columnBoard','dozenBoard','outsideBoard','basketBoard'];
  regions.forEach(id=>$(id).replaceChildren());
  const buttons=[];
  function choose(button){
    const selected=describeBet({type:button.dataset.type,value:button.dataset.value},n);
    for(const b of buttons){
      const active=b===button;
      b.classList.toggle('selected',active);
      b.setAttribute('aria-pressed',String(active));
      b.classList.toggle('covered',b.dataset.type==='straight'&&selected.nums.includes(+b.dataset.value));
    }
    onSelect(selected);
  }
  const add=(root,type,value,label,cls='')=>{
    const b=document.createElement('button');b.type='button';b.className='table-bet '+cls;b.textContent=label;
    b.dataset.target=type+':'+value;b.dataset.type=type;b.dataset.value=value;
    const target=describeBet({type,value},n);
    b.setAttribute('aria-label',`${target.label}, pays ${target.payout} to 1`);
    b.setAttribute('aria-pressed','false');b.title=target.label;
    b.onclick=()=>choose(b);buttons.push(b);root.append(b);return b;
  };
  const pos=(b,xd,yd,xm,ym)=>{for(const[k,v]of Object.entries({xd,yd,xm,ym}))b.style.setProperty('--'+k,v+'%');};
  for(const v of [0,...(n>37?[37]:[]),...(n>38?[38]:[])])add($('zeroBoard'),'straight',String(v),v===37?'00':v===38?'000':'0','zero');
  for(let i=1;i<=36;i++){
    const r=Math.floor((i-1)/3),c=(i-1)%3;
    let b=add($('numberBoard'),'straight',String(i),String(i),'number '+(RED.has(i)?'red':'black'));
    pos(b,(r+.5)/12*100,(2-c+.5)/3*100,(c+.5)/3*100,(r+.5)/12*100);
    if(c<2){b=add($('numberBoard'),'split',`${i},${i+1}`,'•','marker split');pos(b,(r+.5)/12*100,(2-c)/3*100,(c+1)/3*100,(r+.5)/12*100);}
    if(r<11){b=add($('numberBoard'),'split',`${i},${i+3}`,'•','marker split');pos(b,(r+1)/12*100,(2-c+.5)/3*100,(c+.5)/3*100,(r+1)/12*100);}
    if(c<2&&r<11){b=add($('numberBoard'),'corner',`${i},${i+1},${i+3},${i+4}`,'◆','marker corner');pos(b,(r+1)/12*100,(2-c)/3*100,(c+1)/3*100,(r+1)/12*100);}
  }
  for(let i=1;i<=34;i+=3){const row=(i-1)/3;
    let b=add($('streetBoard'),'street',`${i},${i+1},${i+2}`,`${i}–${i+2}`,'street');
    b.style.setProperty('--position',`${(row+.5)/12*100}%`);
    if(i<=31){b=add($('sixBoard'),'six',Array.from({length:6},(_,j)=>i+j).join(','),`${i}–${i+5}`,'six');b.style.setProperty('--position',`${(row+1)/12*100}%`);}
  }
  for(const i of [3,2,1])add($('columnBoard'),'column',String(i),'2 TO 1','column');
  for(let i=1;i<=3;i++)add($('dozenBoard'),'dozen',String(i),['1ST 12','2ND 12','3RD 12'][i-1],'dozen');
  for(const[type,label]of [['low','1–18'],['even','EVEN'],['red','Red'],['black','Black'],['odd','ODD'],['high','19–36']])add($('outsideBoard'),type,'',label,'outside '+type);
  if(n===38)add($('basketBoard'),'basket','','0 / 00 / 1 / 2 / 3 · BASKET','basket');
  choose(buttons.find(b=>b.dataset.type==='red'));
}
