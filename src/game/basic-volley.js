import {basicProjectileCount,rankDamage} from './skill-ranks.js';

// Keep the aimed shot on target and alternate extra shots to either side.
export function launchBasicVolley(g,rank,shot){
  const count=basicProjectileCount(g.hero.id,rank,g.evo[0]);
  const a=Math.atan2(shot.vy,shot.vx),speed=Math.hypot(shot.vx,shot.vy);
  for(let i=1;i<count;i++){
    const angle=a+(i%2?1:-1)*Math.ceil(i/2)*.18;
    g.projs.push(upgradeBasicShot({...shot,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,hit:new Set()},rank));
  }
  // The cast animation reads the aimed carrier last (including Auntie Karen's chope priority).
  if(count)g.projs.push(upgradeBasicShot(shot,rank));
}

export function launchMeleeWave(g,rank,angle){
  if(rank<2)return;
  launchBasicVolley(g,rank,{hero:g.hero.id,kind:'nur',x:g.p.x,y:g.p.y,
    vx:Math.cos(angle)*390,vy:Math.sin(angle)*390,r:9,life:.6,pierce:1,
    dmg:g.hero.basicDamage*rankDamage(rank),hit:new Set(),hitOptions:{hero:g.hero.id,slot:0}});
}

// Snapshot the rank at release. Item projectiles and secondary shards bypass this path.
export function upgradeBasicShot(shot,rank){
  if(rank<2)return shot;
  shot.basicRank=rank;
  shot.pierce++;
  shot.flightSpeed=Math.hypot(shot.vx,shot.vy);
  shot.returnPierce=shot.pierce;
  return shot;
}

export function basicContact(g,shot,enemy,nearest,hit,children){
  if(!shot.chained){
    const next=nearest(enemy.x,enemy.y,210,shot.hit);
    if(next){
      shot.chained=true;
      hit(next,shot.dmg*.65,shot.hitOptions);
      g.fx.push({kind:'basicChain',x:enemy.x,y:enemy.y,tx:next.x,ty:next.y,
        c:g.hero.identity.color,life:.18,max:.18});
    }
  }
  if(shot.basicRank<4||shot.forked)return;
  shot.forked=true;
  const heading=Math.atan2(shot.vy,shot.vx);
  for(const offset of [-.45,.45]){
    const angle=heading+offset;
    children.push({hero:shot.hero,kind:shot.kind,x:shot.x,y:shot.y,
      vx:Math.cos(angle)*shot.flightSpeed,vy:Math.sin(angle)*shot.flightSpeed,
      r:shot.r,dmg:shot.dmg*.5,life:.48,pierce:1,hit:new Set(shot.hit),hitOptions:shot.hitOptions,spin:0});
  }
}

export function startBasicReturn(shot){
  // Puppets and krises own their turn animation and evolution effects.
  if(shot.basicRank!==5||shot.back!==undefined)return;
  shot.back=true;
  shot.hit.clear();
  shot.bounces=0;
  shot.pierce=shot.returnPierce;
  shot.life=2;
}

export function steerBasicReturn(shot,player,dt){
  if(!shot.back||shot.update)return;
  const dx=player.x-shot.x,dy=player.y-shot.y,d=Math.hypot(dx,dy);
  if(d<=player.r+shot.flightSpeed*dt){shot.life=0;return}
  shot.vx=shot.flightSpeed*dx/d;
  shot.vy=shot.flightSpeed*dy/d;
}
