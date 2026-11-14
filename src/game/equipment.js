import {ITEMS} from '../content/equipment.js';

export function installEquipment(api){
  const {$,HOOKS}=api;let returnFocus=null;
  function recalculate(){const g=api.G,pass=g.pass;g.st={dmg:1+.12*(pass.sambal||0),cd:.92**(pass.kopi||0),spd:1+.1*(pass.teh||0),pickup:90*1.35**(pass.kemboja||0),crit:.08+.06*(pass.pelita||0),guli:pass.guli||0};let speed=0,health=0;for(const id of Object.values(g.equipment)){speed+=ITEMS[id]?.speed||0;health+=ITEMS[id]?.health||0;}g.st.spd*=1+speed;g.p.maxHp=g.hero.hp+25*(pass.nasi||0)+health;g.p.hp=Math.min(g.p.hp,g.p.maxHp);}
  HOOKS.dmgMul.push((e,o)=>1+Object.values(api.G.equipment).reduce((sum,id)=>sum+(typeof ITEMS[id]?.damage==='function'?ITEMS[id].damage(api.G,e,o):ITEMS[id]?.damage||0),0));
  const panel=$('lootPanel');
  function close(){panel.hidden=true;if(api.G)api.G.lootModal=null;$('equipmentButton').disabled=!!api.G&&(api.G.paused||api.G.choosing||api.G.over);returnFocus?.isConnected?returnFocus.focus():api.canvas.focus();returnFocus=null;}
  function open(kind){const g=api.G;if(!g||g.over||g.won||g.paused||g.choosing||g.pending>0||g.lootModal)return;returnFocus=kind==='inspect'?$('equipmentButton'):api.canvas;api.clearInput();g.lootModal=kind;panel.hidden=false;api.audio.setPaused(true);$('lootTitle').textContent=kind==='reward'?'Choose your equipment':'Your equipment';$('lootChoices').replaceChildren();
    const reward=g.rewards.find(r=>!r.consumed);
    $('lootCurrent').textContent=kind==='reward'?`${reward.slot} · Equipped: ${g.equipment[reward.slot]?ITEMS[g.equipment[reward.slot]].name+' — '+ITEMS[g.equipment[reward.slot]].description:'Empty'}`:Object.entries(g.equipment).map(([slot,id])=>`${slot}: ${id?ITEMS[id].name+' — '+ITEMS[id].description:'Empty'}`).join('\n');
    if(kind==='reward')for(const id of reward.offer){const b=document.createElement('button');b.className='up';b.dataset.item=id;b.textContent=ITEMS[id].name+' — '+ITEMS[id].description;b.onclick=()=>choose(reward,id);$('lootChoices').append(b)}
    $('lootSkip').hidden=kind!=='reward';$('lootClose').hidden=kind!=='inspect';(kind==='reward'?$('lootChoices').firstChild:$('lootClose')).focus();
  }
  function choose(reward,id){const g=api.G;if(!g||g.lootModal!=='reward'||reward.consumed||!g.rewards.includes(reward)||id&&!reward.offer.includes(id))return;reward.consumed=true;if(id){const previous=g.equipment[reward.slot];if(previous!==id){delete g.itemState[previous];g.equipment[reward.slot]=id;}recalculate();}close();}
  function grant(event,slot){const g=api.G;if(g.over||g.won||g.rewards.some(r=>r.event===event))return;const pool=Object.keys(ITEMS).filter(id=>ITEMS[id].slot===slot),offer=[];while(offer.length<3&&pool.length)offer.push(pool.splice(Math.random()*pool.length|0,1)[0]);g.rewards.push({event,slot,offer,consumed:false});}
  HOOKS.cast.push((slot,rank)=>{const g=api.G;if(slot!==0||g.equipment.weapon!=='splitEmber')return;g.itemState.splitEmber=(g.itemState.splitEmber||0)+1;if(g.itemState.splitEmber%4)return;const target=api.nearest(g.p.x,g.p.y,520),[dx,dy]=target?[target.x-g.p.x,target.y-g.p.y]:api.aimDir(),angle=Math.atan2(dy,dx),base={ustaz:12,rempit:11,nok:15,lan:9,sari:10}[g.hero.id];for(const offset of [-Math.PI/12,Math.PI/12]){const a=angle+offset;g.projs.push({x:g.p.x,y:g.p.y,vx:Math.cos(a)*470,vy:Math.sin(a)*470,r:6,dmg:base*api.rm(rank)*.4,life:1.4,pierce:1,hit:new Set(),kind:'nur',origin:'item'});}api.text(g.p.x,g.p.y-55,'Split Ember','#ffbc73',14);});
  HOOKS.newGame.push(g=>{g.equipment={weapon:null,charm:null,relic:null};g.itemState={};g.rewards=[];g.lootModal=null;panel.hidden=true;returnFocus=null;$('equipmentButton').hidden=true;});
  HOOKS.cleanup.push(()=>{if(api.G){api.G.rewards=[];api.G.lootModal=null}panel.hidden=true;returnFocus=null;$('equipmentButton').hidden=true;});
  $('equipmentButton').onclick=()=>open('inspect');$('lootClose').onclick=close;$('lootSkip').onclick=()=>choose(api.G.rewards.find(r=>!r.consumed));
  return {grant,recalculate,sync(){const g=api.G;$('equipmentButton').hidden=!g||g.over;$('equipmentButton').disabled=!!g&&(g.paused||g.choosing||!!g.lootModal);if(g&&!g.lootModal&&g.rewards.some(r=>!r.consumed))open('reward');},close};
}
