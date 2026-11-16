import {inDirectedLine} from '../geometry.js';

export function installDani(api){
  const {HEROES,EVOS,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,rm,ring:drawRing}=api,color='#89d5a1';
  const ring=(...args)=>{drawRing(...args);api.G.fx.at(-1).hero='dani'};
  HEROES.dani={id:'dani',name:'Dani Rahman',country:'Brunei',role:'Landing keeper · depart, return, absorb',hp:140,speed:165,ultNeed:60,basicDamage:16,price:0,
    identity:{title:'Landing Keeper',name:'Safe Landing',color,max:160,key:'F',loop:'E leaves a 6 s anchor. Walk 160 units away, return within 70 and F for a 30-HP shield lasting 4 s and a 35-damage anchor pulse.',hint:'E · Leave anchor → walk away → return + F',ready:'F · Secure the landing'},
    skills:[
      {key:'',name:'Hooklight',desc:'Every 0.9 s, fire a straight 16-damage light within 320 at speed 360, hitting one enemy.',up:'+25% damage per rank.',cd:.9},
      {key:'Q',name:'Clear the Landing',desc:'A 230-long, 45-wide shove deals 30 damage and pushes eligible enemies 220 units.',up:'+25% damage and shorter cooldown per rank.',cd:6},
      {key:'E',name:'Mooring Light',desc:'Plant or replace one 6 s anchor at Dani. Its radius-100 arrival pulse deals 18 damage. Walk at least 160 away to arm a return; no attraction or blocking.',up:'+25% damage and shorter cooldown per rank.',cd:10},
      {key:'F',name:'Step Ashore',desc:'Radius-130 wave deals 16 and slows 50% for 1 s. If the anchor is armed and within 70, consume it for a radius-150 burst dealing 35 plus a nonstacking 30-HP shield for 4 s.',up:'+25% damage and shorter cooldown per rank.',cd:9},
      {key:'R',name:'Sheltered Reach',desc:'Spend 60 charge for a fixed radius-200 shelter for 6 s. Six one-second ticks deal 14 each. Dani takes 30% less damage only while inside; no healing or immunity.',up:'+25% damage per rank.',cd:0,ult:true}]};EVOS.dani=[];
  const fresh=()=>({anchor:null,shield:{hp:0,until:0},fields:[],raid:api.G?.raid,lastX:api.G?.p.x,lastY:api.G?.p.y});
  function clear(){const g=api.G;if(!g)return;g.projs=g.projs.filter(q=>q.hero!=='dani');g.fx=g.fx.filter(f=>f.hero!=='dani');g.roster.dani=fresh()}
  function sync(){const g=api.G;if(!g||g.hero.id!=='dani')return null;let s=g.roster.dani;if(!s||s.raid!==g.raid){clear();s=g.roster.dani}if(s.anchor?.until<=g.t+1e-8)s.anchor=null;if(s.shield.until<=g.t+1e-8)s.shield.hp=0;return s}
  function status(s){const g=api.G;if(!g.identity)return;const a=s.anchor,d=a?Math.hypot(g.p.x-a.x,g.p.y-a.y):0;g.identity.charge=a?(a.ready?160:Math.min(159,d)):0;g.identity.ready=!!a?.ready&&d<=70;g.identity.detail=s.shield.hp>0?Math.ceil(s.shield.hp)+' shield · '+Math.max(0,s.shield.until-g.t).toFixed(1)+'s':a?(a.ready?(d<=70?'F READY':'Return within 70'):'Walk '+Math.ceil(Math.max(0,160-d))+' farther')+' · '+Math.max(0,a.until-g.t).toFixed(1)+'s':'E · Leave a landing anchor'}
  HOOKS.newGame.push(g=>{if(g.hero.id==='dani')g.roster.dani=fresh()});HOOKS.cleanup.push(()=>{if(api.G?.hero.id==='dani')clear()});
  CAST.dani=[
    r=>{sync();const g=api.G,p=g.p,target=nearest(p.x,p.y,320);if(!target)return false;const a=Math.atan2(target.y-p.y,target.x-p.x);g.projs.push({hero:'dani',kind:'nur',x:p.x,y:p.y,vx:Math.cos(a)*360,vy:Math.sin(a)*360,r:6,dmg:16*rm(r),life:320/360,pierce:1,hit:new Set(),hitOptions:{hero:'dani',slot:0}});},
    r=>{sync();const p=api.G.p,[ax,ay]=aimDir();for(const e of api.G.enemies){if(e.dead)continue;if(inDirectedLine(e,p.x,p.y,ax,ay,230,45))hit(e,30*rm(r),{hero:'dani',slot:1,kb:[ax*220,ay*220]})}ring(p.x+ax*115,p.y+ay*115,24,color,.3);},
    r=>{const s=sync(),g=api.G,p=g.p;s.anchor={x:p.x,y:p.y,until:g.t+6,ready:false,eligible:true};s.lastX=p.x;s.lastY=p.y;each(p.x,p.y,100,e=>hit(e,18*rm(r),{hero:'dani',slot:2}));ring(p.x,p.y,100,color,.4);status(s);},
    r=>{const s=sync(),g=api.G,p=g.p,a=s.anchor;if(a&&(p.dash||Math.hypot(p.x-s.lastX,p.y-s.lastY)>1e-5)){a.ready=false;a.eligible=false}
      each(p.x,p.y,130,e=>{hit(e,16*rm(r),{hero:'dani',slot:3});e.slowT=Math.max(e.slowT||0,1)});ring(p.x,p.y,130,color,.4);
      if(a?.ready&&Math.hypot(p.x-a.x,p.y-a.y)<=70){s.anchor=null;s.shield={hp:30,until:g.t+4};each(a.x,a.y,150,e=>hit(e,35*rm(r),{hero:'dani',slot:3}));ring(a.x,a.y,150,color,.6)}status(s);},
    r=>{const s=sync(),g=api.G;s.fields.push({x:g.p.x,y:g.p.y,start:g.t,next:1,damage:14*rm(r)});if(s.fields.length>12)s.fields.shift();status(s);}
  ];
  HOOKS.hurt.push(damage=>{const s=sync(),g=api.G;if(s?.fields.some(f=>g.t<f.start+6&&Math.hypot(g.p.x-f.x,g.p.y-f.y)<=200))return damage*.7});
  HOOKS.absorb.push(damage=>{const s=sync();if(!s||s.shield.hp<=0)return;const absorbed=Math.min(damage,s.shield.hp);s.shield.hp-=absorbed;status(s);return damage-absorbed});
  HOOKS.update.push(()=>{const s=sync();if(!s)return;const g=api.G,p=g.p,a=s.anchor,m=p.normalMove;if(a){const continuous=m&&!p.dash&&Math.hypot(m.x-m.dx-s.lastX,m.y-m.dy-s.lastY)<1e-5,d=Math.hypot(p.x-a.x,p.y-a.y);
      if(p.dash||!continuous&&Math.hypot(p.x-s.lastX,p.y-s.lastY)>1e-5){a.ready=false;a.eligible=false}
      if(continuous){if(d<=70)a.eligible=true;if(a.eligible&&d>=160-1e-8)a.ready=true}}
    s.lastX=p.x;s.lastY=p.y;for(const f of s.fields)while(f.next<=6&&g.t+1e-8>=f.start+f.next){each(f.x,f.y,200,e=>hit(e,f.damage,{hero:'dani',slot:4}));f.next++}s.fields=s.fields.filter(f=>f.next<=6);status(s);});
  AUTO.dani={order:[2,3,1,4],when:[null,n=>n(230)>=1,n=>!sync()?.anchor&&n(250)>=2,n=>{const s=sync(),a=s?.anchor;return !!a?.ready&&Math.hypot(api.G.p.x-a.x,api.G.p.y-a.y)<=70||n(130)>=3},n=>n(200)>=6||api.G.p.hp<api.G.p.maxHp*.6&&n(200)>=2]};
}
