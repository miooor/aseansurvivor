import {BOSS_WARD_RANGE} from '../content/boss-escorts.js';

/** @param {import('./runtime.js').Enemy|null} boss */
export function activeBossWard(boss){
  const keeper=boss?.wardEscort;
  if(!boss||boss.dead||!keeper||keeper.dead||keeper.stun>0||(keeper.fear??0)>0)return null;
  return Math.hypot(boss.x-keeper.x,boss.y-keeper.y)<=BOSS_WARD_RANGE?keeper:null;
}
