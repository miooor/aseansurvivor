import {inDirectedLine} from '../geometry.js';

export function installNadi(api){
  const {HEROES,CAST,AUTO,HOOKS,aimDir,nearest,each,hit,rm,ring}=api;
  HEROES.nadi={id:'nadi',name:'Nadi',country:'Myanmar',role:'Lacquer workshop keeper · prepare and release',hp:115,speed:170,ultNeed:60,basicDamage:14,
    identity:{title:'Lacquer Workshop Keeper',name:'Let It Set',color:'#e8a977',max:3,key:'Q',loop:'Lay up to three coats with E. Wait 2 seconds or cure a nearby coat with F, then Q releases mature layers within 400; each expires after 7 seconds.',hint:'E · Lay coats, wait 2s, then Q',ready:'Q · Release mature coats'},
    skills:[
      {key:'',name:'Lacquer Flick',desc:'Auto projectile every 0.8s: 14 damage, range 340.',up:'+25% damage.',cd:.8},
      {key:'Q',name:'Peel the Lacquer',baseDamage:26,damageLabel:'Base line hit',desc:'260-unit, width-32 line for 26 damage. Release each mature coat within 400 for 42 damage in radius 90; immature coats remain.',up:'+25% line and layer damage.',cd:5},
      {key:'E',name:'Amber Pool',baseDamage:10,damageLabel:'Base arrival hit',desc:'Place a radius-90 coat up to 240 away for 10 arrival damage. Mature at 2s, expire at 7s; three coats maximum, replacing oldest.',up:'+25% arrival damage.',cd:4},
      {key:'F',name:'Kiln Breath',baseDamage:15,damageLabel:'Base pulse',desc:'Radius-150 pulse for 15 damage and 1.5s of 50% slow. Flash-cures the nearest wet coat within 150 so Q can release it now.',up:'+25% damage.',cd:10},
      {key:'R',name:'Three-Seal Bloom',desc:'Three separate radius-80 discs, 120 from cast position and 120° apart. Each strikes once after 1s for 50 damage; no coats are created.',up:'+25% damage.',cd:0,ult:true,baseDamage:50,damageLabel:'Base disc hit'}
    ]};
  let S,lastRaid=null;
  function clear(){const g=api.G;S={layers:[],discs:[]};if(g){g.roster.nadi=S;g.fx=g.fx.filter(f=>f.hero!=='nadi');g.projs=g.projs.filter(q=>q.hitOptions?.hero!=='nadi')}}
  function sync(){if(lastRaid!==api.G.raid){clear();lastRaid=api.G.raid}S.layers=S.layers.filter(q=>api.G.t-q.at<7-1e-8)}
  const mature=q=>q.cured||api.G.t-q.at>=2-1e-8;
  function status(){if(!api.G.identity)return;const count=S.layers.filter(mature).length;Object.assign(api.G.identity,{charge:count,detail:count+' mature / '+S.layers.length+' coats',ready:count>0})}
  HOOKS.newGame.push(()=>{lastRaid=null;clear()});HOOKS.cleanup.push(clear);
  HOOKS.update.push(()=>{if(api.G.hero.id!=='nadi')return;sync();const due=S.discs.filter(q=>api.G.t>=q.at-1e-8);S.discs=S.discs.filter(q=>!due.includes(q));for(const q of due){each(q.x,q.y,q.radius,e=>hit(e,q.damage,{hero:'nadi',slot:4}));ring(q.x,q.y,q.radius,'#e8a977',.4,'seal');api.G.fx.at(-1).hero='nadi'}status()});
  CAST.nadi=[
    r=>{sync();const g=api.G,p=g.p,e=nearest(p.x,p.y,340);if(!e)return false;const a=Math.atan2(e.y-p.y,e.x-p.x);g.projs.push({x:p.x,y:p.y,vx:Math.cos(a)*410,vy:Math.sin(a)*410,r:6,dmg:api.G.hero.basicDamage*rm(r),life:340/410,pierce:1,hit:new Set(),hitOptions:{hero:'nadi',slot:0},kind:'nur'});},
    r=>{sync();const g=api.G,p=g.p,[ax,ay]=aimDir(),release=S.layers.filter(q=>mature(q)&&Math.hypot(q.x-p.x,q.y-p.y)<=400);S.layers=S.layers.filter(q=>!release.includes(q));if(release.length)api.signatureReleased();
      for(const e of g.enemies){if(e.dead)continue;if(inDirectedLine(e,p.x,p.y,ax,ay,260,32))hit(e,api.G.hero.skills[1].baseDamage*rm(r),{hero:'nadi',slot:1})}
      for(const q of release){each(q.x,q.y,90,e=>hit(e,42*rm(r),{hero:'nadi',slot:1}));ring(q.x,q.y,90,'#e8a977',.4);api.G.fx.at(-1).hero='nadi'}status();},
    r=>{sync();const g=api.G,p=g.p,[ax,ay]=aimDir(),e=g.autoAim?nearest(p.x,p.y,240):null,q=api.safePoint(e?.x??p.x+ax*240,e?.y??p.y+ay*240,0);S.layers.push({...q,at:g.t});if(S.layers.length>3)S.layers.shift();each(q.x,q.y,90,e=>hit(e,api.G.hero.skills[2].baseDamage*rm(r),{hero:'nadi',slot:2}));status();},
    r=>{sync();const g=api.G;
      const wet=S.layers.filter(q=>!mature(q)&&Math.hypot(q.x-g.p.x,q.y-g.p.y)<=150)
        .sort((a,b)=>Math.hypot(a.x-g.p.x,a.y-g.p.y)-Math.hypot(b.x-g.p.x,b.y-g.p.y));
      for(const coat of g.evo[3]?wet:wet.slice(0,1)){coat.cured=true;ring(coat.x,coat.y,90,'#efb765',.6,'kiln');g.fx.at(-1).hero='nadi'}
      status();each(g.p.x,g.p.y,150,e=>{hit(e,api.G.hero.skills[3].baseDamage*rm(r),{hero:'nadi',slot:3});e.slowT=Math.max(e.slowT||0,1.5)})},
    r=>{sync();const g=api.G,[ax,ay]=aimDir(),a=Math.atan2(ay,ax);for(let i=0;i<3;i++){const angle=a+i*Math.PI*2/3,q=api.safePoint(g.p.x+Math.cos(angle)*g.technique.offset,g.p.y+Math.sin(angle)*g.technique.offset,0);S.discs.push({...q,radius:g.technique.radius,at:g.t+1,damage:api.G.hero.skills[4].baseDamage*rm(r)});if(S.discs.length>12)S.discs.shift()}}
  ];
  AUTO.nadi={order:[2,1,3,4],when:[null,n=>S.layers.some(q=>mature(q)&&Math.hypot(q.x-api.G.p.x,q.y-api.G.p.y)<=400)||n(260)>=2,n=>n(330)>=1,n=>n(150)>=2,n=>n(280)>=5]};
}
