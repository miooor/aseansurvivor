import {isExposed} from './combat-readability.js';

export function createRunRecap(){
  return {damage:{contact:0,skills:0,hazards:0,ailments:0},sources:new Map(),
    levelHealing:0,cacheHealing:0,openings:0,converted:0,windows:new WeakMap()};
}

export function recordDamage(recap,amount,category,source){
  if(!recap||amount<=0)return;
  recap.damage[category]+=amount;
  recap.sources.set(source,(recap.sources.get(source)??0)+amount);
}

export function observeExposure({recap,p},enemy,hit=false){
  if(!recap)return;
  if(!isExposed(enemy)){
    recap.windows.delete(enemy);
    return;
  }
  if(!recap.windows.has(enemy)){
    if(!hit&&Math.hypot(enemy.x-p.x,enemy.y-p.y)>310+enemy.r)return;
    recap.openings++;
    recap.windows.set(enemy,false);
  }
  if(hit&&!recap.windows.get(enemy)){
    recap.converted++;
    recap.windows.set(enemy,true);
  }
}
