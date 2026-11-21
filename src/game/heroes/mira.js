import {launchMeleeWave} from '../basic-volley.js';
import {inDirectedLine} from '../geometry.js';

export const MIRA_BASIC_REACH=100;
export const MIRA_BASIC_HALF_ANGLE=35*Math.PI/180;

export function installMira(api){
  const {HEROES,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,rm}=api;
  HEROES.mira={id:'mira',name:'Captain "Pag Pag" Garcia',country:'Philippines',role:'Street cook · close-range sustain',hp:120,speed:185,ultNeed:55,basicDamage:15,price:0,
    identity:{title:'Keeper of the Last Stove',name:'Second Serving',color:'#ffb45c',max:3,key:'E',loop:'Growing up in poverty, he learned to stretch pagpag to feed one more neighbour. Catch heat with Q or block with F. Spend up to three portions with E before the stove cools.',hint:'Q hits or a lid block bank portions',ready:'E · Serve the pot'},
    skills:[
      {key:'',name:'Wok Knuckle',desc:'Swing the iron wok in a short forward arc for 15 damage every 0.7 s.',up:'+25% damage per rank.',cd:.7},
      {key:'Q',name:'Tin Lid Skipper',baseDamage:24,damageLabel:'Base lid hit',desc:'Skip a stove lid through a 240-unit lane. Each ghost hit banks one hot portion, up to three. Fresh heat resets the eight-second timer.',up:'+25% damage and shorter cooldown per rank.',cd:6},
      {key:'E',name:'Pagpag Salo-Salo',baseDamage:28,damageLabel:'Base steam burst',desc:'Vent steam around you for 28 damage. Each portion adds 9 damage and restores 6 HP. Serve three together for a second burst of 28 damage at the same spot after half a second.',up:'+25% burst damage and shorter cooldown per rank.',cd:7},
      {key:'F',name:'Stockpot Guard',baseDamage:12,damageLabel:'Base lid bash',desc:'Bash nearby ghosts away and take 25% less damage for 3 s. The first blow caught on the lid banks one portion.',up:'+25% damage and shorter cooldown per rank.',cd:11},
      {key:'R',name:'Last Stove Express',desc:'Kick a blazing kitchen cart through a 340-unit lane for 76 damage. At the far end its pressure valve blows for 38 more damage within 95 units.',up:'+25% damage per rank.',cd:0,ult:true,baseDamage:76,damageLabel:'Base cart hit'}]};
  const fresh=g=>({raid:g.raid,portions:0,coolsAt:0,braceUntil:0,caught:false,boil:null,wave:null});
  function status(g,s){
    if(g.t>=s.coolsAt)s.portions=0;
    Object.assign(g.identity,{charge:s.portions,ready:s.portions>0,detail:s.portions
      ?s.portions+' / 3 portions · '+(s.coolsAt-g.t).toFixed(1)+'s':'Pot empty'});
  }
  function bank(g,s,count){
    status(g,s);
    s.portions=Math.min(3,s.portions+count);
    s.coolsAt=g.t+8;
    status(g,s);
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
      launchMeleeWave(g,r,a);
      each(p.x,p.y,MIRA_BASIC_REACH,(e,dx,dy)=>{
        if(dx*Math.cos(a)+dy*Math.sin(a)>=Math.hypot(dx,dy)*Math.cos(MIRA_BASIC_HALF_ANGLE))hit(e,g.hero.basicDamage*rm(r),{hero:'mira',slot:0});
      });
    },
    r=>{
      const g=api.G,s=state(g),p=g.p,[ax,ay]=aimDir();
      let portions=0;
      for(const e of g.enemies){
        if(!e.dead&&inDirectedLine(e,p.x,p.y,ax,ay,240,28)&&hit(e,damage(1,r),{hero:'mira',slot:1}))portions++;
      }
      if(portions&&!g.won)bank(g,s,portions);
      return {range:240};
    },
    r=>{
      const g=api.G,s=state(g);
      status(g,s);
      const portions=s.portions,range=sweepRange(g,portions>0);
      s.portions=0;
      if(portions){
        g.p.hp=Math.min(g.p.maxHp,g.p.hp+6*portions);
        g.identity.releaseT=.65;api.signatureReleased();
        if(portions===3)s.boil={x:g.p.x,y:g.p.y,range,damage:damage(2,r),at:g.t+.5};
      }
      each(g.p.x,g.p.y,range,e=>hit(e,damage(2,r)+9*portions*rm(r),{hero:'mira',slot:2}));
      status(g,s);
      return {range,flourish:portions?'serving':undefined};
    },
    r=>{
      const g=api.G,s=state(g),{duration,force}=g.technique;
      s.braceUntil=g.t+duration;s.caught=false;
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
  HOOKS.hurt.push(d=>{
    const g=api.G;
    if(g.hero.id!=='mira')return;
    const s=state(g);
    if(s.braceUntil<=g.t)return;
    if(!s.caught){s.caught=true;bank(g,s,1)}
    return d*.75;
  });
  HOOKS.update.push(dt=>{
    const g=api.G;if(g.hero.id!=='mira')return;
    const s=state(g),q=s.wave;
    status(g,s);
    if(s.boil&&g.t>=s.boil.at){
      const {x,y,range,damage}=s.boil;s.boil=null;
      api.ring(x,y,range,'#ffbe62',.45);
      each(x,y,range,e=>hit(e,damage,{hero:'mira',slot:2}));
    }
    if(!q)return;
    const from=q.distance,to=Math.min(q.length,from+q.length*dt/.6);
    for(const e of g.enemies){
      if(e.dead||q.seen.has(e)||!inDirectedLine(e,q.x+from*q.ax,q.y+from*q.ay,q.ax,q.ay,to-from,q.width))continue;
      q.seen.add(e);hit(e,q.damage,{hero:'mira',slot:4});
    }
    q.distance=to;if(to>=q.length){
      s.wave=null;
      const x=q.x+q.ax*to,y=q.y+q.ay*to;
      api.ring(x,y,95,'#ff9a43',.5);
      each(x,y,95,e=>hit(e,q.damage/2,{hero:'mira',slot:4}));
    }
  });
  AUTO.mira={order:[1,2,3,4],when:[null,n=>n(240)>0,n=>n(sweepRange(api.G,state(api.G).portions>0))>0,n=>n(120)>=2,n=>n(340)>=5||!!api.G.boss&&n(340)>0]};
}
