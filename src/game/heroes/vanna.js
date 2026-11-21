import {inDirectedLine} from '../geometry.js';
import {fireAtNearest,installKitState,showCooldown} from './direct-skills.js';

const STITCH_RANGE=280,STITCH_HOP=135,STITCH_DURATION=4;
const FAMILIAR_DURATION=4,FAMILIAR_INTERVAL=.6,FAMILIAR_ORBIT=52,FAMILIAR_GUARD_RADIUS=18;
export const LOOM_HALF_SIZE=250,LOOM_DURATION=4,LOOM_TICK=.4;

function insideLoom(p,e){
  return !e.dead&&e.nightEcho!=='gasp'&&Math.abs(e.x-p.x)<=LOOM_HALF_SIZE&&Math.abs(e.y-p.y)<=LOOM_HALF_SIZE;
}

export function isLoomBound(g,e){
  const weave=g.roster.vanna,loom=weave?.loom;
  return !!(loom&&weave.raid===g.raid&&g.t<loom.until-1e-8&&loom.targets.has(e));
}

export function vannaFamiliarPoint(player,start,time){
  const angle=(time-start)*2*Math.PI/1.1;
  return {x:player.x+FAMILIAR_ORBIT*Math.cos(angle),y:player.y+FAMILIAR_ORBIT*Math.sin(angle),angle};
}

export function vannaFamiliarIntercept(g,fromX,fromY,shot){
  const weave=g.roster.vanna,familiar=weave?.familiar;
  if(!familiar||weave.raid!==g.raid||g.t>=familiar.until)return;
  const dx=shot.x-fromX,dy=shot.y-fromY,length=dx*dx+dy*dy;
  const firstContact=(point,radius)=>{
    const x=fromX-point.x,y=fromY-point.y,c=x*x+y*y-radius*radius;
    if(c<=0)return 0;
    const b=x*dx+y*dy,discriminant=b*b-length*c;
    if(!length||b>=0||discriminant<0)return Infinity;
    const t=(-b-Math.sqrt(discriminant))/length;
    return t<=1?t:Infinity;
  };
  const point=vannaFamiliarPoint(g.p,familiar.start,g.t);
  const block=firstContact(point,FAMILIAR_GUARD_RADIUS+shot.r);
  if(block<firstContact(g.p,g.p.r+shot.r))return block;
}

export function installVanna(api){
  const {HEROES,CAST,AUTO,HOOKS,aimDir,hit,rm,clearLine}=api;
  HEROES.vanna={id:'vanna',name:'Vanna',country:'Cambodia',role:'Silk weaver · crowd control',hp:110,speed:175,ultNeed:60,basicDamage:15,
    identity:{title:'Silk Weaver',name:'Foldstep',color:'#e79ac7',max:1,key:'F',
      loop:'Send thread through nearby foes with Running Stitch, then cut the stitched targets harder with Q. Foldstep animates a fold of silk that guards you and strikes nearby foes.',
      hint:'F · Familiar recharging',ready:'F · Summon a silk familiar'},
    skills:[
      {key:'',name:'Silk Needle',desc:'Automatically shoot a fast needle at the nearest enemy.',up:'+25% damage.',cd:.7},
      {key:'Q',name:'Ribbon Cut',baseDamage:34,desc:'Snap a silk ribbon through a straight lane. Deals 50% more damage to stitched enemies.',up:'+25% damage and shorter cooldown.',cd:5},
      {key:'E',name:'Running Stitch',baseDamage:26,desc:'Send a shuttle to the nearest visible foe. It hops to up to two more foes, slowing them briefly and stitching them for 4 seconds.',up:'+25% damage and shorter cooldown.',cd:7},
      {key:'F',name:'Foldstep',techniqueDamage:'pulse',desc:`Unfold a silk familiar that orbits you for ${FAMILIAR_DURATION} seconds. It strikes the nearest visible foe every ${FAMILIAR_INTERVAL} seconds and catches shots that hit the silk.`,up:'+25% damage and shorter cooldown.',cd:8},
      {key:'R',name:'Silk Loom',baseDamage:36,damageLabel:'Base tick',desc:`Weave a ${2*LOOM_HALF_SIZE}-unit square for ${LOOM_DURATION} seconds. Enemies inside or entering take damage immediately and every ${LOOM_TICK} seconds. They stay stunned until the threads unravel.`,up:'+25% damage.',cd:0,ult:true}]};
  const state=installKitState(api,'vanna',()=>({stitches:new Map(),familiar:null,loom:null}));
  function nearestVisible(g,from,range,seen){
    let target=null,best=range*range;
    for(const e of g.enemies){
      if(e.dead||e.nightEcho==='gasp'||e.type==='body'&&!e.near||seen?.has(e))continue;
      const distance=(e.x-from.x)**2+(e.y-from.y)**2;
      if(distance>=best||!clearLine(from,e,0))continue;
      target=e;best=distance;
    }
    return target;
  }
  const familiarRange=g=>g.technique.radius*(g.evo[3]?1.5:1);
  CAST.vanna=[
    r=>fireAtNearest(api,r,{range:380,speed:520,pierce:1}),
    r=>{
      const g=api.G,[x,y]=aimDir(),stitches=state().stitches,damage=g.hero.skills[1].baseDamage*rm(r);
      for(const e of g.enemies)if(!e.dead&&inDirectedLine(e,g.p.x,g.p.y,x,y,280,50))
        hit(e,damage*(stitches.get(e)>g.t?1.5:1),{hero:'vanna',slot:1});
    },
    r=>{
      const g=api.G,s=state(),seen=new Set(),damage=g.hero.skills[2].baseDamage*rm(r);
      let from=g.p;
      for(let i=0;i<3;i++){
        const e=nearestVisible(g,from,i===0?STITCH_RANGE:STITCH_HOP,seen);
        if(!e)break;
        seen.add(e);
        g.fx.push({kind:'relay',hero:'vanna',slot:2,x:from.x,y:from.y,tx:e.x,ty:e.y,life:.58,max:.58});
        if(hit(e,damage,{hero:'vanna',slot:2})&&!e.dead){
          e.slowT=Math.max(e.slowT||0,1.2);
          s.stitches.set(e,g.t+STITCH_DURATION);
        }
        if(g.roster.vanna!==s)break;
        from=e;
      }
      if(!seen.size)return false;
    },
    r=>{
      const g=api.G;
      state().familiar={start:g.t,until:g.t+FAMILIAR_DURATION,next:g.t,range:familiarRange(g),
        damage:g.technique.pulse*rm(r)};
      api.signatureReleased();
    },
    r=>{
      const g=api.G,{x,y}=g.p;
      const targets=new Map();
      for(const e of g.enemies)if(insideLoom(g.p,e))targets.set(e,g.t);
      state().loom={x,y,until:g.t+LOOM_DURATION,damage:g.hero.skills[4].baseDamage*rm(r),targets};
    }
  ];
  HOOKS.update.push(()=>{
    const g=api.G;
    if(g.hero.id!=='vanna')return;
    const s=state(),{loom,familiar}=s;
    for(const [e,until] of s.stitches)if(e.dead||g.t>=until)s.stitches.delete(e);
    if(familiar&&g.t+1e-8>=familiar.until)s.familiar=null;
    else if(familiar&&g.t+1e-8>=familiar.next){
      const target=nearestVisible(g,g.p,familiar.range);
      if(target){
        const {x,y}=vannaFamiliarPoint(g.p,familiar.start,g.t);
        familiar.next=g.t+FAMILIAR_INTERVAL;
        g.fx.push({kind:'relay',hero:'vanna',slot:3,x,y,tx:target.x,ty:target.y,life:.23,max:.23});
        hit(target,familiar.damage,{hero:'vanna',slot:3});
      }
    }
    if(loom&&g.roster.vanna===s){
      if(g.t<loom.until-1e-8)
        for(const e of g.enemies)if(!loom.targets.has(e)&&insideLoom(loom,e))loom.targets.set(e,g.t);

      for(const [e,firstTick] of loom.targets){
        let next=firstTick;
        while(!e.dead&&g.roster.vanna.loom===loom&&next<loom.until-1e-8&&next<=g.t+1e-8){
          hit(e,loom.damage,{hero:'vanna',slot:4,dot:true});
          next+=LOOM_TICK;
        }
        if(g.roster.vanna.loom!==loom)break;
        if(e.dead)loom.targets.delete(e);
        else loom.targets.set(e,next);
      }
      if(g.t+1e-8>=loom.until)s.loom=null;
    }
    showCooldown(g,3);
  });
  AUTO.vanna={order:[2,1,3,4],when:[null,n=>n(280)>0,n=>n(STITCH_RANGE)>0,n=>n(familiarRange(api.G))>0,
    ()=>api.G.enemies.filter(e=>insideLoom(api.G.p,e)).length>=4||
      api.G.enemies.some(e=>e.boss&&insideLoom(api.G.p,e))]};
}
