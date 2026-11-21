export const BASE_EQUIPMENT_DROPS={
  markerBlade:{
    slot:'weapon',name:'Surveyor’s Marker Blade',targetSpecific:true,
    description:'Deal 35% more direct damage to enemies at full HP, excluding environmental damage.',
    damage:(_g,e,o)=>e.hp>0&&e.hp===e.maxHp&&!o.dot&&o.damageType!=='environment'?.35:0
  },
  tideLens:{
    slot:'relic',name:'Tideglass Lens',showInStats:true,
    description:'Casting Q, E or F removes 0.75 seconds from each of the other two cooldowns.',
    onCast(g,slot){
      if(slot<1||slot>3)return;
      for(let i=1;i<=3;i++)if(i!==slot)g.cds[i]=Math.max(0,g.cds[i]-.75);
    }
  },
  wayfarerPin:{
    slot:'charm',name:'Wayfarer’s Map Pin',targetSpecific:true,
    description:'Deal 18% more damage to enemies at least 200 units from you at impact.',
    damage:(g,e)=>Math.hypot(e.x-g.p.x,e.y-g.p.y)>=200?.18:0
  },
  ferrySandals:{
    slot:'boots',name:'Ferry Runner’s Sandals',showInStats:true,
    description:'Walk 18% faster while your Q skill is on cooldown.',
    walkMultiplier:g=>g.cds[1]>0?1.18:1
  },
  lookoutVisor:{
    slot:'head',name:'Lookout Visor',showInStats:true,
    description:'Take 22% less damage when you are at or below 40% HP before the hit.',
    incomingMultiplier:g=>g.p.hp<=g.p.maxHp*.4?.78:1
  },
  rallyGong:{
    slot:'relic',name:'Harbour Rally Gong',showInStats:true,
    description:'Casting your ultimate restores 25% of your missing HP.',
    onCast(g,slot){
      if(slot===4)g.p.hp+=(g.p.maxHp-g.p.hp)*.25;
    }
  }
};
