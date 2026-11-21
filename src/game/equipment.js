import {EQUIPMENT_SLOTS,ITEMS} from '../content/equipment.js';
import {menuFrame,menuPortraitPosition} from '../content/hero-art.js';

const itemFrames=[
  'quaySeal','supperCarrier','tinMallet','jettyKnot','padiSheaf',
  'nipahBraid','cengalMallet','wauSpool','thornEcho','bountySeal',
  'aftershockBell','lastLantern','stillwaterBeads','reedGuard','lanternHeart',
  'travellersKnot','splitEmber','quarryHammer','riverNeedle','huntersEdge'
];
const armorFrames=[
  'rainHood','quiltedVest','gripWraps','techniqueSash','trailBoots',
  'trailHelmet','stormCape','channelGloves','toolBelt','deckBoots',
  'lookoutCap','fieldJacket','workGloves','wovenBelt','monsoonBoots'
];
const expansionFrames=[
  'relaySash','flourishSash','pursuitWraps','breakerWraps',
  'watchJacket','runnerJacket','markerBlade','tideLens',
  'wayfarerPin','ferrySandals','lookoutVisor','rallyGong'
];
const surveyFrames=[
  'soundingRod','faultRod','tuningRod','pulseLocket',
  'refugeLocket','rallyLocket','cadenceDrum','thunderDrum',
  'rainDrum','mistHood','squallHood','reedBoots',
  'switchbackBoots'
];
const sheets=[
  {frames:itemFrames,columns:5,rows:5,style:''},
  {frames:armorFrames,columns:5,rows:3,style:' armor'},
  {frames:expansionFrames,columns:4,rows:3,style:' expansion'},
  {frames:surveyFrames,columns:4,rows:4,style:' survey'}
];
const slotArt={weapon:'huntersEdge',charm:'stillwaterBeads',relic:'lastLantern',head:'trailHelmet',chest:'quiltedVest',gloves:'workGloves',belt:'toolBelt',boots:'trailBoots'};

function node(tag,className='',label){
  const element=document.createElement(tag);
  element.className=className;
  if(label!==undefined)element.textContent=label;
  return element;
}

function itemArt(id,slot){
  const icon=id==='harbourToken'?'quaySeal':id;
  const sheet=sheets.find(sheet=>sheet.frames.includes(icon))||
    sheets.find(sheet=>sheet.frames.includes(slotArt[slot]));
  const frame=sheet.frames.indexOf(sheet.frames.includes(icon)?icon:slotArt[slot]);
  const art=node('i','gear-art'+sheet.style+(id?'':' empty'));
  art.setAttribute('aria-hidden','true');
  const column=frame%sheet.columns,row=Math.floor(frame/sheet.columns);
  art.style.backgroundPosition=column*100/(sheet.columns-1)+'% '+row*100/(sheet.rows-1)+'%';
  return art;
}


function equipmentTotals(g){
  const totals={damage:0,physicalDamage:0,skillDamage:0,physicalDefense:0,skillDefense:0,health:0,speed:0,pickup:0};
  for(const id of Object.values(g.equipment)){
    const item=ITEMS[id];
    if(item)for(const stat of Object.keys(totals)){
      if(typeof item[stat]==='number')totals[stat]+=item[stat];
    }
  }
  return totals;
}

export function equipmentCastRank(g,slot,rank){
  return ITEMS[g.equipment?.belt]?.skillRankSlots?.includes(slot)?rank+1:rank;
}

export function equipmentWalkMultiplier(g){
  return ITEMS[g.equipment.boots]?.walkMultiplier?.(g)??1;
}

export function incomingEquipmentMultiplier(g,type){
  const totals=g.gearStats;
  const armor=1-(type==='physical'?totals.physicalDefense:totals.skillDefense);
  return armor*(ITEMS[g.equipment.head]?.incomingMultiplier?.(g)??1);
}

function conditionalDamage(g,enemy,options){
  let bonus=0;
  for(const id of Object.values(g.equipment)){
    const modifier=ITEMS[id]?.damage;
    if(typeof modifier==='function')bonus+=modifier(g,enemy,options);
  }
  return bonus;
}

export function describeEquipmentStats(g){
  const totals=equipmentTotals(g);
  // An ordinary, unaffected enemy includes live Bell and Beads buffs in the total.
  totals.damage+=conditionalDamage(g,{},{});
  totals.skillDamage+=ITEMS[g.equipment.head]?.skillDamageBonus?.(g)??0;
  const labels={damage:'all damage',physicalDamage:'physical damage',skillDamage:'skill damage',physicalDefense:'physical defense',skillDefense:'skill defense',health:'maximum HP',speed:'movement speed',pickup:'pickup radius'};
  const lines=[];
  for(const [stat,value] of Object.entries(totals)){
    if(value)lines.push((value>0?'+':'')+(stat==='health'?value:Math.round(value*100)+'%')+' '+labels[stat]);
  }
  for(const id of Object.values(g.equipment)){
    const item=ITEMS[id];
    if(item?.targetSpecific||item?.showInStats)lines.push(item.description);
  }
  for(const slot of ITEMS[g.equipment.belt]?.skillRankSlots||[]){
    const skill=g.hero.skills[slot];
    lines.push(skill.name+' ('+skill.key+') +1 cast rank');
  }
  return lines;
}

const refinements=new Map();
for(const [id,item] of Object.entries(ITEMS)){
  if(!item.upgradeFrom)continue;
  if(!refinements.has(item.upgradeFrom))refinements.set(item.upgradeFrom,[]);
  refinements.get(item.upgradeFrom).push(id);
}

function addEliteChoices(g,reward,roll){
  const bases=[...refinements.keys()];
  const eligible=bases.filter(id=>g.equipment[ITEMS[id].slot]===id);
  if(eligible.length){
    const base=eligible[Math.floor(roll()*eligible.length)];
    reward.offer.push(...refinements.get(base));
  }else{
    const starters=bases.filter(id=>!g.equipment[ITEMS[id].slot]);
    if(!starters.length)return;
    const base=starters[Math.floor(roll()*starters.length)];
    if(!reward.offer.includes(base))reward.offer.push(base);
  }
}

export function installEquipment(api){
  const {$,HOOKS,lootRoll=()=>Math.random()}=api;let returnFocus=null;
  function recalculate(){
    const g=api.G,{pass,upgradeStats}=g;
    g.gearStats=equipmentTotals(g);
    const {speed,health}=g.gearStats;
    g.st={
      dmg:upgradeStats.damage*(1+.12*(pass.sambal||0)),
      cd:upgradeStats.cooldown*.92**(pass.kopi||0),
      spd:upgradeStats.speed*(1+.1*(pass.teh||0))*(1+speed),
      pickup:90*upgradeStats.pickup*1.35**(pass.kemboja||0)*(1+g.gearStats.pickup),
      crit:.08+.06*(pass.pelita||0),
      guli:pass.guli||0
    };
    g.p.maxHp=g.hero.hp+upgradeStats.health+25*(pass.nasi||0)+health;
    g.p.hp=Math.min(g.p.hp,g.p.maxHp);
  }
  HOOKS.dmgMul.push((enemy,options)=>{
    const g=api.G,stats=g.gearStats;
    let bonus=stats.damage;
    if(options.damageType!=='environment'){
      bonus+=options.slot===0?stats.physicalDamage:stats.skillDamage+(ITEMS[g.equipment.head]?.skillDamageBonus?.(g)??0);
    }
    return 1+(bonus+conditionalDamage(g,enemy,options));
  });
  HOOKS.cast.push(slot=>{
    const g=api.G;
    ITEMS[g.equipment.weapon]?.onCast?.(g,slot,api);
    ITEMS[g.equipment.charm]?.onCast?.(g,slot,api);
    ITEMS[g.equipment.relic]?.onCast?.(g,slot,api);
  });
  const panel=$('lootPanel');
  function close(){
    panel.hidden=true;
    if(api.G)api.G.lootModal=null;
    $('equipmentButton').disabled=!!api.G&&(api.G.paused||api.G.choosing||api.G.over);
    if(returnFocus===$('pauseGear')){
      $('pause').hidden=false;
      if(!$('pauseGear').getClientRects().length)returnFocus=$('resume');
    }
    (returnFocus?.isConnected?returnFocus:api.canvas).focus({preventScroll:true});
    returnFocus=null;
  }

  function inspect(g){
    const layout=node('div','gear-layout');
    const loadout=node('section','gear-loadout');
    const board=node('div','gear-board');
    const portrait=node('div','gear-portrait');
    const figure=node('i','gear-figure');
    figure.style.backgroundPosition=menuPortraitPosition(menuFrame(g.hero.id));
    portrait.append(figure);
    board.append(portrait);
    const detail=node('div','gear-detail');
    detail.setAttribute('aria-live','polite');
    function select(tile,slot){
      board.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed','false');
      tile.setAttribute('aria-pressed','true');
      const id=g.equipment[slot],item=ITEMS[id];
      detail.replaceChildren(node('small','gear-label',slot),node('h3','',item?.name||'Empty slot'),
        node('p','',item?.description||'Equip a '+slot+' reward to fill this slot.'));
      if(item?.upgradeFrom)detail.append(node('p','gear-ancestry','Upgraded from '+ITEMS[item.upgradeFrom].name));
    }
    const firstSlot=EQUIPMENT_SLOTS.find(slot=>g.equipment[slot])||EQUIPMENT_SLOTS[0];
    for(const slot of EQUIPMENT_SLOTS){
      const id=g.equipment[slot],name=ITEMS[id]?.name||'Empty';
      const tile=node('button','gear-slot');
      tile.type='button';
      tile.dataset.slot=slot;
      tile.setAttribute('aria-pressed','false');
      tile.append(itemArt(id,slot),node('small','gear-label',slot+': '),node('strong','',name));
      tile.onclick=()=>select(tile,slot);
      board.append(tile);
      if(slot===firstSlot)select(tile,slot);
    }
    loadout.append(board,detail);
    const sheet=node('section','gear-sheet');
    sheet.append(node('small','gear-label',g.hero.country+' · Level '+g.level),node('h3','gear-name',g.hero.name));
    const stats=node('dl','gear-stats');
    for(const [label,value] of [['Max HP',g.p.maxHp],['Move speed',Math.round(g.hero.speed*g.st.spd*equipmentWalkMultiplier(g))],['Critical chance',Math.round(g.st.crit*100)+'%']]){
      const pair=node('div');
      pair.append(node('dt','',label),node('dd','',value));
      stats.append(pair);
    }
    const bonuses=describeEquipmentStats(g);
    sheet.append(stats,node('h4','gear-label','Equipment bonuses'),node('p','gear-bonuses',bonuses.join(' · ')||'No stat bonuses equipped.'));
    sheet.append(node('h4','gear-label','Hero skills'));
    for(const [index,skill] of g.hero.skills.entries()){
      const row=node('div','gear-skill');
      row.append(node('kbd','',skill.key||'Auto'),node('span','',skill.name),node('small','','Rank '+equipmentCastRank(g,index,g.ranks[index])));
      sheet.append(row);
    }
    layout.append(loadout,sheet);
    $('lootCurrent').replaceChildren(layout);
  }

  function showReward(g,reward){
    const mixed=reward.offer.some(id=>ITEMS[id].slot!==reward.slot);
    const heading=node('h3','gear-offer-title','Choose one reward');
    $('lootCurrent').replaceChildren(heading);
    if(!mixed){
      const slot=reward.slot,current=g.equipment[slot],item=ITEMS[current];
      const equipped=node('div','gear-current'),copy=node('div');
      copy.append(node('small','gear-label',slot+' · Currently equipped'),node('h3','',item?.name||'Empty slot'),
        node('p','',item?.description||'Choose an item below to equip it.'));
      equipped.append(copy,itemArt(current,slot));
      $('lootCurrent').replaceChildren(equipped,heading);
    }
    for(const id of reward.offer){
      const option=ITEMS[id],slot=option.slot,current=g.equipment[slot],previous=ITEMS[current];
      const button=node('button','gear-offer');
      button.type='button';
      button.dataset.item=id;
      button.append(itemArt(id,slot),node('small','gear-label',slot+(option.upgradeFrom?' · Upgrade':'')),
        node('strong','',option.name),node('span','gear-effect',option.description));
      const action=node('span','gear-equip');
      if(option.upgradeFrom)action.append(node('span','gear-ancestry','Upgrade from '+ITEMS[option.upgradeFrom].name));
      if(id===current)action.append(node('span','','Keep equipped'));
      else if(!previous)action.append(node('span','','Equip in empty '+slot+' slot'));
      else if(current!==option.upgradeFrom)action.append(node('span','','Replace '+previous.name));
      if(mixed&&previous&&current!==id)action.append(node('span','gear-previous','Current effect · '+previous.description));
      button.append(action);
      button.onclick=()=>choose(reward,id);
      $('lootChoices').append(button);
    }
  }

  function open(kind,fromPause=false){
    const g=api.G;
    if(!g||g.over||g.won||Boolean(g.paused)!==fromPause||g.choosing||g.pending>0||g.lootModal)return;
    const isReward=kind==='reward';
    returnFocus=fromPause?$('pauseGear'):isReward?api.canvas:$('equipmentButton');
    if(fromPause)$('pause').hidden=true;
    api.clearInput();
    g.lootModal=kind;
    panel.dataset.mode=kind;
    panel.hidden=false;
    api.audio.setPaused(true);
    $('lootTitle').textContent=isReward?'Equipment reward':'Inventory';
    $('gearLocation').textContent=g.stage.name+' · '+EQUIPMENT_SLOTS.filter(slot=>g.equipment[slot]).length+' / '+EQUIPMENT_SLOTS.length+' equipped';
    $('lootChoices').replaceChildren();
    if(isReward){
      const reward=g.rewards.find(r=>!r.consumed);
      if(reward.event.startsWith('elite-'))addEliteChoices(g,reward,lootRoll);
      showReward(g,reward);
    }else inspect(g);
    $('lootSkip').hidden=!isReward;
    $('lootClose').hidden=isReward;
    panel.querySelector('.gear-scroll').scrollTop=0;
    (isReward?$('lootChoices').firstChild:$('lootClose')).focus({preventScroll:true});
  }
  function choose(reward,id){
    const g=api.G;
    if(!g||g.lootModal!=='reward'||!reward||reward.consumed||!g.rewards.includes(reward))return;
    if(id){
      const item=ITEMS[id];
      if(!item||!reward.offer.includes(id))return;
      const previous=g.equipment[item.slot];
      if(item.upgradeFrom&&previous!==item.upgradeFrom)return;
      if(previous!==id){
        delete g.itemState[previous];
        g.equipment[item.slot]=id;
      }
      recalculate();
    }
    reward.consumed=true;
    close();
  }
  function grant(event,slot,exclusive){
    const g=api.G;
    if(g.over||g.won||g.rewards.some(r=>r.event===event))return;
    if(exclusive){
      if(ITEMS[exclusive]?.exclusive&&ITEMS[exclusive].slot===slot)
        g.rewards.push({event,slot,offer:[exclusive],consumed:false});
      return;
    }
    const pool=[],offer=[];
    for(const [id,item] of Object.entries(ITEMS)){
      if(item.slot!==slot||item.upgradeFrom||item.exclusive)continue;
      if(item.quest===event)offer.push(id);
      else if(!item.quest)pool.push(id);
    }
    while(offer.length<3&&pool.length)offer.push(pool.splice(Math.floor(lootRoll()*pool.length),1)[0]);
    g.rewards.push({event,slot,offer,consumed:false});
  }
  HOOKS.cast.push((slot,rank)=>{const g=api.G;if(slot!==0||g.equipment.weapon!=='splitEmber')return;g.itemState.splitEmber=(g.itemState.splitEmber||0)+1;if(g.itemState.splitEmber%4)return;const target=api.nearest(g.p.x,g.p.y,520),[dx,dy]=target?[target.x-g.p.x,target.y-g.p.y]:api.aimDir(),angle=Math.atan2(dy,dx),base=g.hero.basicDamage;for(const offset of [-Math.PI/12,Math.PI/12]){const a=angle+offset;g.projs.push({x:g.p.x,y:g.p.y,vx:Math.cos(a)*470,vy:Math.sin(a)*470,r:6,dmg:base*api.rm(rank)*.4,life:1.4,pierce:1,hit:new Set(),kind:'nur',origin:'item',hitOptions:{slot:0}});}api.text(g.p.x,g.p.y-55,'Split Ember','#ffbc73',14);});
  HOOKS.newGame.push(g=>{g.equipment=Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,null]));g.itemState={};g.rewards=[];g.lootModal=null;panel.hidden=true;returnFocus=null;$('equipmentButton').hidden=true;});
  HOOKS.cleanup.push(()=>{if(api.G){api.G.rewards=[];api.G.lootModal=null}panel.hidden=true;returnFocus=null;$('equipmentButton').hidden=true;});
  $('pauseGear').onclick=()=>open('inspect',true);
  $('equipmentButton').onclick=()=>open('inspect');$('lootClose').onclick=close;$('lootSkip').onclick=()=>choose(api.G.rewards.find(r=>!r.consumed));
  return {grant,recalculate,sync(){const g=api.G;$('equipmentButton').hidden=!g||g.over;$('equipmentButton').disabled=!!g&&(g.paused||g.choosing||!!g.lootModal);if(g&&!g.lootModal&&g.rewards.some(r=>!r.consumed))open('reward');},close};
}
