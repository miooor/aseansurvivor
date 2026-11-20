import {inDirectedLine} from '../geometry.js';

export const MIRA_BASIC_REACH=100;
export const MIRA_BASIC_HALF_ANGLE=35*Math.PI/180;

export function installMira(api){
  const {HEROES,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,moveOnMap,rm}=api;
  HEROES.mira={id:'mira',name:'Mira Reyes',country:'Philippines',role:'Harbour rescuer · hook and sweep',hp:120,speed:185,ultNeed:55,basicDamage:15,price:0,
    identity:{title:'Harbour Rescuer',name:'Haul In',color:'#67d8df',max:1,key:'E',loop:'Land Rescue Hook to prime your next Harbour Sweep for four seconds. Sweep immediately for 55 damage.',hint:'Land Q to prime E',ready:'E · Empowered sweep'},
    skills:[
      {key:'',name:'Boathook Tap',desc:'Every 0.7 s, swing at the closest enemy in reach. Hit a 100-unit, 70° arc for 15 damage.',up:'+25% damage per rank.',cd:.7},
      {key:'Q',name:'Rescue Hook',baseDamage:24,damageLabel:'Base hook hit',desc:'Hook the first enemy in a 240-long, 28-wide lane for 24 damage. Reel ordinary enemies into sweep range. A hit primes E for 4 s.',up:'+25% damage and shorter cooldown per rank.',cd:6},
      {key:'E',name:'Harbour Sweep',baseDamage:28,damageLabel:'Base sweep',desc:'Sweep all around you within 110 units for 28 damage. Spend Haul In to deal 55 instead.',up:'+25% damage and shorter cooldown per rank.',cd:7},
      {key:'F',name:'Deck Brace',baseDamage:12,damageLabel:'Base shove',desc:'Shove nearby enemies within 120 units for 12 damage and 180 force. Take 25% less damage for 3 s.',up:'+25% damage and shorter cooldown per rank.',cd:11},
      {key:'R',name:'Breaking Wave',desc:'Spend 55 charge to send a single 120-wide breaker forward 340 units in 0.6 s. Each enemy the crest reaches takes 76 damage once.',up:'+25% damage per rank.',cd:0,ult:true,baseDamage:76,damageLabel:'Base crest hit'}]};
  const fresh=g=>({raid:g.raid,primeUntil:0,braceUntil:0,wave:null});
  function status(g,s){
    const ready=s.primeUntil>g.t+1e-8;
    Object.assign(g.identity,{charge:Number(ready),ready,detail:ready?'E · Empowered sweep · '+(s.primeUntil-g.t).toFixed(1)+'s':'Land Q to prime E'});
  }
  function clear(g){
    g.roster.mira=fresh(g);
    g.fx=g.fx.filter(f=>f.hero!=='mira');
    if(g.identity){g.identity.releaseT=0;status(g,g.roster.mira)}
  }
  function state(g){if(g.roster.mira.raid!==g.raid)clear(g);return g.roster.mira}
  const sweepRange=(g,primed)=>primed&&g.evo[2]?190:110;
  const damage=(slot,r)=>api.G.hero.skills[slot].baseDamage*rm(r);
  HOOKS.newGame.push(g=>{if(g.hero.id==='mira')g.roster.mira=fresh(g)});
  HOOKS.cleanup.push(()=>{if(api.G?.hero.id==='mira')clear(api.G)});
  CAST.mira=[
    r=>{
      const g=api.G,p=g.p,target=nearest(p.x,p.y,MIRA_BASIC_REACH);
      if(!target)return false;
      const a=Math.atan2(target.y-p.y,target.x-p.x);
      each(p.x,p.y,MIRA_BASIC_REACH,(e,dx,dy)=>{
        if(dx*Math.cos(a)+dy*Math.sin(a)>=Math.hypot(dx,dy)*Math.cos(MIRA_BASIC_HALF_ANGLE))hit(e,g.hero.basicDamage*rm(r),{hero:'mira',slot:0});
      });
    },
    r=>{
      const g=api.G,s=state(g),p=g.p,[ax,ay]=aimDir();
      let target=null,closest=Infinity;
      for(const e of g.enemies){
        if(e.dead||!inDirectedLine(e,p.x,p.y,ax,ay,240,28))continue;
        const along=(e.x-p.x)*ax+(e.y-p.y)*ay;
        if(along<closest){closest=along;target=e}
      }
      const range=target?Math.max(0,Math.min(240,closest)):240;
      if(target&&hit(target,damage(1,r),{hero:'mira',slot:1})){
        if(!target.dead&&!target.boss&&target.type!=='body'){
          const dx=target.x-p.x,dy=target.y-p.y,distance=Math.hypot(dx,dy);
          if(distance>65)Object.assign(target,moveOnMap(target.x,target.y,p.x+65*dx/distance,p.y+65*dy/distance,target.r));
        }
        if(!g.won)s.primeUntil=g.t+4;
      }
      status(g,state(g));
      return {range};
    },
    r=>{
      const g=api.G,s=state(g),primed=s.primeUntil>g.t+1e-8;
      s.primeUntil=0;
      if(primed){g.identity.releaseT=.65;api.signatureReleased()}
      const range=sweepRange(g,primed);
      each(g.p.x,g.p.y,range,e=>hit(e,primed?55*rm(r):damage(2,r),{hero:'mira',slot:2}));
      status(g,state(g));
      return {range,flourish:primed?'haul':undefined};
    },
    r=>{
      const g=api.G,s=state(g),{duration,force}=g.technique;
      s.braceUntil=g.t+duration;
      each(g.p.x,g.p.y,120,(e,dx,dy)=>{
        const d=Math.hypot(dx,dy)||1;
        hit(e,damage(3,r),{hero:'mira',slot:3,kb:[dx/d*force,dy/d*force]});
      });
    },
    r=>{
      const g=api.G,[ax,ay]=aimDir();
      state(g).wave={x:g.p.x,y:g.p.y,ax,ay,distance:0,length:340,width:120,damage:damage(4,r),seen:new Set()};
    }
  ];
  HOOKS.hurt.push(d=>{const g=api.G;if(g.hero.id==='mira'&&state(g).braceUntil>g.t)return d*.75});
  HOOKS.update.push(dt=>{
    const g=api.G;if(g.hero.id!=='mira')return;
    const s=state(g),q=s.wave;status(g,s);if(!q)return;
    const from=q.distance,to=Math.min(q.length,from+q.length*dt/.6);
    for(const e of g.enemies){
      if(e.dead||q.seen.has(e)||!inDirectedLine(e,q.x+from*q.ax,q.y+from*q.ay,q.ax,q.ay,to-from,q.width))continue;
      q.seen.add(e);hit(e,q.damage,{hero:'mira',slot:4});
    }
    q.distance=to;if(to>=q.length)s.wave=null;
  });
  AUTO.mira={order:[1,2,3,4],when:[null,n=>n(240)>0,n=>n(sweepRange(api.G,state(api.G).primeUntil>api.G.t+1e-8))>0,n=>n(120)>=2,n=>n(340)>=5||!!api.G.boss&&n(340)>0]};
}
