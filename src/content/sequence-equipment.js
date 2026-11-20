function technique(slot){
  return slot>=1&&slot<=3;
}

function heal(g,fraction){
  g.p.hp=Math.min(g.p.maxHp,g.p.hp+g.p.maxHp*fraction);
}

function chargeUltimate(g){
  g.ult=Math.min(g.hero.ultNeed,g.ult+g.hero.ultNeed*.04);
}

function survey(g,slot,api){
  const id=g.equipment.weapon;
  if(slot===0){
    g.itemState[id]=Math.min(2,(g.itemState[id]||0)+1);
    return;
  }
  if(!technique(slot)||g.itemState[id]!==2)return;
  const target=api.nearest(g.p.x,g.p.y,520);
  if(!target)return;
  delete g.itemState[id];
  api.ring(target.x,target.y,100,'#ffd681',.4);
  api.each(target.x,target.y,100,enemy=>{
    if(id==='faultRod'&&!enemy.boss)enemy.stun=Math.max(enemy.stun||0,.65);
    api.hit(enemy,24,{origin:'item'});
  });
  if(id==='tuningRod'){
    for(let i=1;i<=3;i++)if(i!==slot)g.cds[i]=Math.max(0,g.cds[i]-1);
  }
}

function armLocket(g){
  const id=g.equipment.charm;
  const state=g.itemState[id]??={};
  if(g.t>=(state.readyAt??0))state.until=g.t+3;
}

function pulse(g,slot,api){
  const id=g.equipment.charm,state=g.itemState[id];
  if(!technique(slot)||state?.until===undefined||g.t>state.until)return;
  g.itemState[id]={readyAt:g.t+8};
  heal(g,.05);
  if(id==='refugeLocket')g.p.invuln=Math.max(g.p.invuln,1);
  if(id==='rallyLocket')chargeUltimate(g);
  api.text(g.p.x,g.p.y-52,'Pulse','#87ffb5',14);
}

function beat(g,slot,api){
  if(!technique(slot))return;
  const id=g.equipment.relic,previous=g.itemState[id];
  if(!previous||previous.slot===slot||g.t-previous.at<1||g.t-previous.at>4){
    g.itemState[id]={slot,at:g.t};
    return;
  }
  delete g.itemState[id];
  chargeUltimate(g);
  if(id==='rainDrum')heal(g,.04);
  if(id==='thunderDrum'){
    api.each(g.p.x,g.p.y,140,enemy=>api.hit(enemy,30,{origin:'item'}));
    api.ring(g.p.x,g.p.y,140,'#ffc774',.4);
  }
  api.text(g.p.x,g.p.y-68,'Cadence','#f4d58a',14);
}

const rod={
  slot:'weapon',showInStats:true,onCast:survey,
  description:'Two basic casts charge the rod. Cast Q, E or F with an enemy within 520 units to spend the charge and deal 24 damage within 100 units of the nearest enemy.'
};
const locket={
  slot:'charm',showInStats:true,onDamage:armLocket,onCast:pulse,
  description:'After losing HP to a hit, cast Q, E or F within 3 seconds to heal 5% of maximum HP. The locket then rests for 8 seconds.'
};
const drum={
  slot:'relic',showInStats:true,onCast:beat,
  description:'Cast two different Q/E/F skills 1–4 seconds apart to gain 4% ultimate charge. Repeating a skill or missing the timing starts a new pair on that cast.'
};

export const SEQUENCE_EQUIPMENT={
  soundingRod:{...rod,name:'Survey Rod'},
  faultRod:{...rod,name:'Fault Rod',upgradeFrom:'soundingRod',
    description:rod.description+' The pulse also stuns non-boss enemies for 0.65 seconds.'},
  tuningRod:{...rod,name:'Tuning Rod',upgradeFrom:'soundingRod',
    description:rod.description+' The pulse also removes 1 second from each other Q/E/F cooldown.'},
  pulseLocket:{...locket,name:'Pulse Locket'},
  refugeLocket:{...locket,name:'Refuge Locket',upgradeFrom:'pulseLocket',
    description:locket.description+' The heal also grants 1 second of invulnerability.'},
  rallyLocket:{...locket,name:'Rally Locket',upgradeFrom:'pulseLocket',
    description:locket.description+' The heal also grants 4% ultimate charge.'},
  cadenceDrum:{...drum,name:'Cadence Drum'},
  thunderDrum:{...drum,name:'Thunder Drum',upgradeFrom:'cadenceDrum',
    description:drum.description+' Completing a pair also deals 30 damage within 140 units of you.'},
  rainDrum:{...drum,name:'Rain Drum',upgradeFrom:'cadenceDrum',
    description:drum.description+' Completing a pair also heals 4% of maximum HP.'}
};
