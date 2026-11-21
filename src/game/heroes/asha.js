export function installAsha(api){
  const {HEROES,EVOS,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,rm,ring:drawRing,safePoint}=api;
  const color='#efc76d';
  const ring=(...args)=>{drawRing(...args);api.G.fx.at(-1).hero='asha'};
  HEROES.asha={id:'asha',name:'Asha Lim',country:'Singapore',role:'Night dispatcher · ticket, serve, collect',hp:110,speed:180,ultNeed:55,basicDamage:12,price:0,
    identity:{title:'Night Dispatcher',name:'Service Window',color,max:3,key:'E',loop:'Q tickets up to three enemies for 6 seconds. Land a basic on each, then collect served tickets with E within 420 units.',hint:'Q · Ticket → basics · Serve → E · Collect',ready:'E · Collect served tickets'},
    skills:[
      {key:'',name:'Dispatch Card',desc:'Every 0.75 s, fire a 12-damage card within 360. Prefer unserved tickets; an accepted basic hit serves one.',up:'+25% damage per rank.',cd:.75},
      {key:'Q',name:'Open Docket',desc:'Hit a radius-100 point up to 220 away for 24 damage and 0.6 s non-boss stun. Refresh existing tickets before filling the three-ticket cap; tickets last 6 s.',up:'+25% damage and shorter cooldown per rank.',cd:5},
      {key:'E',name:'Clear the Rail',desc:'Collect served tickets within 420: each makes a radius-65 burst for 34 damage. Also pulse radius 90 around Asha for 16. Dead or expired tickets give nothing.',up:'+25% damage and shorter cooldown per rank.',cd:8},
      {key:'F',name:'Make Room',desc:'Radius-150 wave deals 18 damage and pushes eligible enemies 200 units. No healing or immunity.',up:'+25% damage and shorter cooldown per rank.',cd:10},
      {key:'R',name:'Night Shift Relay',desc:'Spend 55 charge for a fixed radius-220 field lasting 5 s. Five one-second ticks deal 12 each and serve existing tickets hit inside; use E to collect.',up:'+25% damage per rank.',cd:0,ult:true}]};
  EVOS.asha=[];
  const fresh=()=>({tickets:[],fields:[],raid:api.G?.raid});
  function clear(){const g=api.G;if(!g)return;g.projs=g.projs.filter(q=>q.hero!=='asha');g.fx=g.fx.filter(f=>f.hero!=='asha');g.roster.asha=fresh()}
  function sync(){const g=api.G;if(!g||g.hero.id!=='asha')return null;let s=g.roster.asha;if(!s||s.raid!==g.raid){clear();s=g.roster.asha}s.tickets=s.tickets.filter(t=>!t.e.dead&&t.until>g.t+1e-8);return s}
  function status(s){const g=api.G;if(!g.identity)return;const served=s.tickets.filter(t=>t.served).length;g.identity.charge=served;g.identity.detail=served+' served / '+s.tickets.length+' tickets';g.identity.ready=served>0}
  HOOKS.newGame.push(g=>{if(g.hero.id==='asha')g.roster.asha=fresh()});
  HOOKS.cleanup.push(()=>{if(api.G?.hero.id==='asha')clear()});
  HOOKS.hit.push((e,o)=>{if(api.G?.hero.id!=='asha'||o.origin==='item'||o.hero!=='asha'||![0,4].includes(o.slot))return;const s=sync(),ticket=s.tickets.find(t=>t.e===e);if(ticket)ticket.served=true;status(s)});
  CAST.asha=[
    r=>{const s=sync(),g=api.G,p=g.p,unserved=s.tickets.filter(t=>!t.served&&Math.hypot(t.e.x-p.x,t.e.y-p.y)<=360).sort((a,b)=>Math.hypot(a.e.x-p.x,a.e.y-p.y)-Math.hypot(b.e.x-p.x,b.e.y-p.y));const target=unserved[0]?.e||nearest(p.x,p.y,360);if(!target)return false;
      const a=Math.atan2(target.y-p.y,target.x-p.x);g.projs.push({hero:'asha',kind:'nur',x:p.x,y:p.y,vx:Math.cos(a)*440,vy:Math.sin(a)*440,r:6,dmg:12*rm(r),life:360/440,pierce:1,hit:new Set(),hitOptions:{hero:'asha',slot:0}});},
    r=>{const s=sync(),g=api.G,p=g.p,[ax,ay]=aimDir(),point=safePoint(p.x+ax*220,p.y+ay*220,0),targets=[];
      each(point.x,point.y,100,e=>{hit(e,24*rm(r),{hero:'asha',slot:1});if(!e.boss&&e.type!=='body')e.stun=Math.max(e.stun,.6);if(!e.dead)targets.push(e)});
      for(const ticket of s.tickets)if(targets.includes(ticket.e))ticket.until=g.t+6;
      targets.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));for(const e of targets)if(s.tickets.length<3&&!s.tickets.some(t=>t.e===e))s.tickets.push({e,served:false,until:g.t+6});ring(point.x,point.y,100,color,.4);status(s);},
    r=>{const s=sync(),p=api.G.p,collect=s.tickets.filter(t=>t.served&&Math.hypot(t.e.x-p.x,t.e.y-p.y)<=420),points=collect.map(t=>({x:t.e.x,y:t.e.y}));s.tickets=s.tickets.filter(t=>!collect.includes(t));
      for(const point of points){each(point.x,point.y,65,e=>hit(e,34*rm(r),{hero:'asha',slot:2}));ring(point.x,point.y,65,color,.4)}each(p.x,p.y,90,e=>hit(e,16*rm(r),{hero:'asha',slot:2}));ring(p.x,p.y,90,color,.3);status(s);},
    r=>{sync();const p=api.G.p;each(p.x,p.y,150,(e,dx,dy)=>{const d=Math.hypot(dx,dy)||1;hit(e,18*rm(r),{hero:'asha',slot:3,kb:[dx/d*200,dy/d*200]})});ring(p.x,p.y,150,color,.4);},
    r=>{const s=sync(),g=api.G;s.fields.push({x:g.p.x,y:g.p.y,start:g.t,next:1,dmg:12*rm(r)});if(s.fields.length>12)s.fields.shift();status(s);}
  ];
  AUTO.asha={order:[1,2,3,4],when:[null,n=>n(320)>=1,()=>{const s=sync();return s?.tickets.some(t=>t.served&&Math.hypot(t.e.x-api.G.p.x,t.e.y-api.G.p.y)<=420)||!!nearest(api.G.p.x,api.G.p.y,90)},n=>n(150)>=3,n=>n(220)>=6||!!api.G.boss&&n(220)>=1]};
  HOOKS.update.push(()=>{const s=sync();if(!s)return;const g=api.G;for(const field of s.fields)while(field.next<=5&&g.t+1e-8>=field.start+field.next){each(field.x,field.y,220,e=>hit(e,field.dmg,{hero:'asha',slot:4}));field.next++}s.fields=s.fields.filter(f=>f.next<=5);status(s)});
}
