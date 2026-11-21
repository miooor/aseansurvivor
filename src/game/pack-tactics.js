import {HUNTING_MONSTERS,PACK_GUARD_RADIUS} from '../content/hunting-monsters.js';
import {overlapsMonsterMark,segmentHitsCircle} from './geometry.js';

export const PACK_REPLAN=.2;
export const PACK_RECOVERY=.75;
export const PACK_RECOVERY_DAMAGE=1.2;

const ROLE_ORDER=['belangProwler','bakauBelangkas','enggangStormwing','limestoneSeladang'];
const ROLE_POSITIONS={
  belangProwler:{radius:154,angle:.24,castRange:160},
  bakauBelangkas:{radius:225,angle:-1.42,castRange:220},
  enggangStormwing:{radius:184,angle:1.48,castRange:190},
  limestoneSeladang:{radius:159,angle:-.65,castRange:152}
};

const OFFSETS=[0,.32,-.32,.64,-.64];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const polar=(center,r,angle)=>({x:center.x+Math.cos(angle)*r,y:center.y+Math.sin(angle)*r});
const heading=(player,target)=>Math.hypot(player.vx,player.vy)>30&&player===target
  ?Math.atan2(player.vy,player.vx):Math.atan2(player.face[1],player.face[0]);

// Goals use short, clear paths. At gates or on narrow bridges the ordinary
// shared route to the target handles the approach until there is room to spread.
export function planPackMovement(members,player,target,world){
  const forward=heading(player,target),goals=new Map(),reserved=[];
  const ordered=[...members].sort((a,b)=>ROLE_ORDER.indexOf(a.type)-ROLE_ORDER.indexOf(b.type));
  for(const enemy of ordered){
    const role=ROLE_POSITIONS[enemy.type];
    if(!role||distance(enemy,target)>470)continue;
    const ally=enemy.type==='limestoneSeladang'&&ordered.find(member=>member!==enemy&&!(member.fear>0));
    const center=ally||target;
    const direction=ally?Math.atan2(ally.y-target.y,ally.x-target.x)+.7:forward+role.angle;
    const radius=ally?PACK_GUARD_RADIUS*.48:role.radius;
    const canReach=point=>{
      if(distance(point,target)<target.r+enemy.r+30)return false;
      if(reserved.some(goal=>distance(goal,point)<65))return false;
      if(distance(enemy,target)>target.r+enemy.r+18&&segmentHitsCircle(enemy.x,enemy.y,point.x,point.y,
        target.x,target.y,target.r+enemy.r+10))return false;
      return world.walkable(point.x,point.y,enemy.r)&&world.clearLine(enemy,point,enemy.r);
    };
    for(const offset of OFFSETS){
      const point=polar(center,radius,direction+offset);
      if(canReach(point)){goals.set(enemy,point);reserved.push(point);break}
    }
  }
  return goals;
}

function hasDodge(player,marks,windup,speed,world){
  const reach=Math.min(112,speed*Math.max(0,windup-.14));
  for(const fraction of [1,.65]){
    for(let i=0;i<12;i++){
      const point={...polar(player,reach*fraction,i*Math.PI/6),r:player.r};
      if(marks.some(mark=>overlapsMonsterMark(point,mark)))continue;
      if(world.walkable(point.x,point.y,point.r)&&world.clearLine(player,point,point.r))return true;
    }
  }
  return false;
}

export function selectPackAttack(members,player,target,speed,dt,world){
  const forward=heading(player,target);
  let best=null;
  for(const enemy of members){
    const skill=HUNTING_MONSTERS[enemy.type]?.packSkill,reach=distance(enemy,target);
    if(!skill||enemy.skillT>dt||enemy.windup||enemy.monsterSkill||enemy.rush||enemy.stun>0||
      enemy.fear>0||enemy.packRecovery>0||reach<70||reach>=skill.range)continue;
    if(!world.clearLine(enemy,target,Math.min(enemy.r,target.r)))continue;
    const travelSpeed=Math.hypot(player.vx,player.vy);
    const lead=target===player&&travelSpeed?Math.min(skill.lead??0,78/travelSpeed):0;
    const anticipated={x:target.x+player.vx*lead,y:target.y+player.vy*lead};
    const aim=lead&&world.walkable(anticipated.x,anticipated.y,target.r)&&world.clearLine(target,anticipated,target.r)
      ?anticipated:target;
    if(aim!==target&&!world.clearLine(enemy,aim,Math.min(enemy.r,target.r)))continue;
    const angle=Math.atan2(aim.y-enemy.y,aim.x-enemy.x);
    const relative=Math.atan2(enemy.y-target.y,enemy.x-target.x)-forward;
    const role=ROLE_POSITIONS[enemy.type];
    const score=1-Math.abs(reach-role.castRange)/skill.range+.22*Math.cos(relative-role.angle);
    if(best&&score<=best.score)continue;
    const marks=skill.marks(enemy,aim,angle);
    if(hasDodge(player,marks,skill.windup,speed,world))best={enemy,angle,aim,marks,score};
  }
  return best;
}
