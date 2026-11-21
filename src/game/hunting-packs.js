import {PACK_GUARD_RADIUS} from '../content/hunting-monsters.js';

const PACK_TIMES=[58,112,153];
const SHORT_PACK_TIMES=[59,94,110];
const APPROACH_OFFSETS=[-.65,.65,0];
const APPROACH_ROTATIONS=[0,.4,-.4,.8,-.8,1.2,-1.2];

export function dueHuntingPack(clock,bossAt,events){
  if(clock>=bossAt)return -1;
  const times=bossAt<150?SHORT_PACK_TIMES:PACK_TIMES;
  const index=times.findLastIndex(at=>clock>=at);
  return index>=0&&!events.has(huntingPackKey(index))?index:-1;
}

export const huntingPackKey=index=>'hunting-pack:'+index;

// Find a whole formation before placing anything. Keep one side open and
// leave enough separation to tell which enemy is approaching from each angle.
export function huntingPackSites(types,player,heading,reach,canSpawn){
  for(const distance of [reach,reach*.86]){
    for(const rotation of APPROACH_ROTATIONS){
      const sites=types.map((type,i)=>{
        const angle=heading+rotation+APPROACH_OFFSETS[i];
        return {type,x:player.x+Math.cos(angle)*distance,y:player.y+Math.sin(angle)*distance};
      });
      if(sites.every(canSpawn))return sites;
    }
  }
  return null;
}

export function activePackGuard(enemy){
  return enemy.type==='limestoneSeladang'&&!!enemy.packId&&!enemy.dead&&enemy.stun<=0&&!(enemy.fear>0)&&!(enemy.packRecovery>0);
}

export function guardedByPack(enemy,enemies){
  return !!enemy.packId&&enemies.some(guard=>guard!==enemy&&guard.packId===enemy.packId&&activePackGuard(guard)&&
    Math.hypot(guard.x-enemy.x,guard.y-enemy.y)<PACK_GUARD_RADIUS);
}
