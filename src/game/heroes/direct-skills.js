import {launchBasicVolley} from '../basic-volley.js';
import {remainingSkillCooldown} from '../skill-ranks.js';
// These signatures use the skill's regular cooldown as their only readiness meter.
export function showCooldown(g,slot,detail){
  if(!g.identity)return;
  const remaining=remainingSkillCooldown(g,slot);
  Object.assign(g.identity,{charge:remaining>0?0:1,ready:remaining<=0,
    detail:detail||(remaining>0?'Ready in '+Math.ceil(remaining)+'s':g.hero.skills[slot].key+' · Ready')});
}

export function fireAtNearest(api,rank,{range,speed,pierce}){
  const g=api.G,p=g.p,e=api.nearest(p.x,p.y,range);
  if(!e)return false;
  const a=Math.atan2(e.y-p.y,e.x-p.x);
  launchBasicVolley(g,rank,{hero:g.hero.id,kind:'nur',x:p.x,y:p.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
    r:7,dmg:g.hero.basicDamage*api.rm(rank),life:range/speed,pierce,hit:new Set(),hitOptions:{hero:g.hero.id,slot:0}});
}

export function installKitState(api,id,fresh){
  const reset=g=>{
    g.roster[id]={...fresh(),raid:g.raid};
    g.projs=g.projs.filter(q=>q.hero!==id);
    g.fx=g.fx.filter(f=>f.hero!==id);
    if(g.p.dash?.hitOptions?.hero===id)g.p.dash=null;
  };
  api.HOOKS.newGame.push(g=>{if(g.hero.id===id)reset(g)});
  api.HOOKS.cleanup.push(()=>{if(api.G?.hero.id===id)reset(api.G)});
  return ()=>{
    const g=api.G;
    if(g.roster[id]?.raid!==g.raid)reset(g);
    return g.roster[id];
  };
}
