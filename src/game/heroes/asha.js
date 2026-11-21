import {launchBasicVolley} from '../basic-volley.js';
export function installAsha(api){
  const {HEROES,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,rm,ring:drawRing,safePoint,text,puff,juice}=api;
  const SALE=['50% OFF!','BUY 1 FREE 1!','LIMITED TIME!','CLEARANCE!','MEMBERS ONLY!'];
  const color='#efc76d';
  const ring=(...args)=>{drawRing(...args);api.G.fx.at(-1).hero='asha'};
  HEROES.asha={id:'asha',name:'Auntie Karen',country:'Singapore',role:'Kiasu auntie · chope, charge, cash out',hp:110,speed:180,ultNeed:55,basicDamage:12,price:0,
    identity:{title:'Kiasu Auntie',name:'Chope & Cash Out',color,max:3,key:'E',loop:'Q chopes up to three enemies with tissue packets for 6 seconds. Land a basic on each to charge them, then cash out charged chopes with E within 420 units.',hint:'Q · Chope → basics · Charge → E · Cash out',ready:'E · Cash out charged chopes'},
    skills:[
      {key:'',name:'Expired Voucher',desc:'Every 0.75 s, flick a 12-damage voucher within 360. Prefer uncharged chopes; an accepted basic hit charges one.',up:'+25% damage per rank.',cd:.75},
      {key:'Q',name:'Tissue Packet Chope',baseDamage:24,damageLabel:'Base hit',desc:'Slap tissue packets on a radius-100 point up to 220 away for 24 damage and 0.6 s non-boss stun. Refresh existing chopes before filling the three-chope cap; chopes last 6 s.',up:'+25% damage and shorter cooldown per rank.',cd:5},
      {key:'E',name:'Cash Out',baseDamage:55,damageLabel:'Base payout',desc:'Collect payment from every charged chope within 420: each takes a direct 55-damage payout. Each cashed chope also bills a 12-damage receipt to a different nearby unchoped ghost within 140. Needs at least one charged chope; dead or expired chopes give nothing.',up:'+25% damage and shorter cooldown per rank.',cd:8},
      {key:'F',name:'I Want the Manager',baseDamage:24,damageLabel:'Base complaint',desc:'Shout a 240-long, 100° complaint cone ahead for 24 damage. Eligible enemies are pushed 240 units back along the aim and non-bosses are stunned for 0.5 s.',up:'+25% damage and shorter cooldown per rank.',cd:10},
      {key:'R',name:'Great Singapore Sale',desc:'Spend 55 charge for a fixed radius-220 sale lasting 5 s. Five one-second ticks deal 12 each and charge existing chopes hit inside; use E to cash out.',up:'+25% damage per rank.',cd:0,ult:true,baseDamage:12,damageLabel:'Base tick'}]};
  const fresh=()=>({tickets:[],fields:[],raid:api.G?.raid});
  function clear(){const g=api.G;if(!g)return;g.projs=g.projs.filter(q=>q.hero!=='asha');g.fx=g.fx.filter(f=>f.hero!=='asha');g.roster.asha=fresh()}
  function sync(){const g=api.G;if(!g||g.hero.id!=='asha')return null;let s=g.roster.asha;if(!s||s.raid!==g.raid){clear();s=g.roster.asha}s.tickets=s.tickets.filter(t=>!t.e.dead&&t.until>g.t+1e-8);return s}
  function status(s){const g=api.G;if(!g.identity)return;const served=s.tickets.filter(t=>t.served).length;g.identity.charge=served;g.identity.detail=served+' charged / '+s.tickets.length+' chopes';g.identity.ready=served>0}
  HOOKS.newGame.push(g=>{if(g.hero.id==='asha')g.roster.asha=fresh()});
  HOOKS.cleanup.push(()=>{if(api.G?.hero.id==='asha')clear()});
  HOOKS.hit.push((e,o)=>{if(api.G?.hero.id!=='asha'||o.origin==='item'||o.hero!=='asha'||![0,4].includes(o.slot))return;const s=sync(),ticket=s.tickets.find(t=>t.e===e);if(ticket)ticket.served=true;status(s)});
  CAST.asha=[
    r=>{const s=sync(),g=api.G,p=g.p,unserved=s.tickets.filter(t=>!t.served&&Math.hypot(t.e.x-p.x,t.e.y-p.y)<=360).sort((a,b)=>Math.hypot(a.e.x-p.x,a.e.y-p.y)-Math.hypot(b.e.x-p.x,b.e.y-p.y));const target=unserved[0]?.e||nearest(p.x,p.y,360);if(!target)return false;
      const a=Math.atan2(target.y-p.y,target.x-p.x);launchBasicVolley(g,r,{hero:'asha',kind:'nur',x:p.x,y:p.y,vx:Math.cos(a)*440,vy:Math.sin(a)*440,r:6,dmg:api.G.hero.basicDamage*rm(r),life:360/440,pierce:1,hit:new Set(),hitOptions:{hero:'asha',slot:0}});},
    r=>{const s=sync(),g=api.G,p=g.p,[ax,ay]=aimDir(),point=safePoint(p.x+ax*220,p.y+ay*220,0),{radius,expiry}=g.technique,targets=[];
      each(point.x,point.y,radius,e=>{hit(e,api.G.hero.skills[1].baseDamage*rm(r),{hero:'asha',slot:1});if(!e.boss&&e.type!=='body')e.stun=Math.max(e.stun,.6);if(!e.dead)targets.push(e)});
      for(const ticket of s.tickets)if(targets.includes(ticket.e)){ticket.until=g.t+expiry;ticket.duration=expiry}
      targets.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));for(const e of targets)if(s.tickets.length<3&&!s.tickets.some(t=>t.e===e))s.tickets.push({e,served:false,duration:expiry,until:g.t+expiry});
      if(g.evo[1]){
        for(const e of targets){
          const ticket=s.tickets.find(t=>t.e===e&&!t.served);
          if(ticket){ticket.served=true;break}
        }
      }
      ring(point.x,point.y,radius,color,.4);text(point.x,point.y-30,'CHOPE!','#ffffff',20);puff(point.x,point.y,'#f4f7ff',12,160,4);status(s);},
    r=>{const s=sync(),p=api.G.p,collect=s.tickets.filter(t=>t.served&&Math.hypot(t.e.x-p.x,t.e.y-p.y)<=420),points=collect.map(t=>({x:t.e.x,y:t.e.y}));
      if(!collect.length)return false;
      s.tickets=s.tickets.filter(t=>!collect.includes(t));api.signatureReleased();
      // Payouts are single-target: Karen bills each charged ghost directly.
      for(const {e} of collect){api.G.fx.push({kind:'relay',hero:'asha',x:p.x,y:p.y,tx:e.x,ty:e.y,c:color,life:.3,max:.3});hit(e,api.G.hero.skills[2].baseDamage*rm(r),{hero:'asha',slot:2});text(e.x,e.y-40,'KA-CHING! $$$','#ffd34d',18);puff(e.x,e.y,'#ffd34d',10,150,4)}
      juice(5,.04);
      const sent=new Set([...collect,...s.tickets].map(ticket=>ticket.e));
      for(const point of points){
        const next=nearest(point.x,point.y,140,sent);
        if(!next)continue;
        sent.add(next);if(!hit(next,12*rm(r),{hero:'asha',slot:2}))continue;
        api.G.fx.push({kind:'relay',hero:'asha',x:point.x,y:point.y,tx:next.x,ty:next.y,c:color,life:.4,max:.4});text(next.x,next.y-30,'RECEIPT','#fff3d6',13);
      }
      status(s);},
    r=>{sync();const p=api.G.p,[ax,ay]=aimDir(),half=50*Math.PI/180;
      each(p.x,p.y,240,(e,dx,dy)=>{const d=Math.hypot(dx,dy);if(d>e.r&&(dx*ax+dy*ay)/d<Math.cos(half))return;
        hit(e,api.G.hero.skills[3].baseDamage*rm(r),{hero:'asha',slot:3,kb:[ax*240,ay*240]});if(!e.dead&&!e.boss&&e.type!=='body')e.stun=Math.max(e.stun,.5)});
      // Three nested cones read as megaphone shock rings rolling outward.
      for(const [range,life] of [[110,.22],[175,.32],[240,.42]])api.G.fx.push({kind:'cone',hero:'asha',x:p.x,y:p.y,a:Math.atan2(ay,ax),range,half,c:'#ff5a4e',life,max:life});
      text(p.x,p.y-70,'I WANT THE MANAGER!!','#ff6b5a',20);puff(p.x+ax*60,p.y+ay*60,'#ff6b5a',10,200,4);juice(8,.06);},
    r=>{const s=sync(),g=api.G;s.fields.push({x:g.p.x,y:g.p.y,start:g.t,next:1,dmg:api.G.hero.skills[4].baseDamage*rm(r)});if(s.fields.length>12)s.fields.shift();text(g.p.x,g.p.y-80,'GREAT SINGAPORE SALE!','#ff5fa2',22);juice(6,.05);status(s);}
  ];
  AUTO.asha={order:[1,2,3,4],when:[null,n=>n(320)>=1,()=>{const s=sync();return !!s?.tickets.some(t=>t.served&&Math.hypot(t.e.x-api.G.p.x,t.e.y-api.G.p.y)<=420)},n=>n(240)>=3,n=>n(220)>=6||!!api.G.boss&&n(220)>=1]};
  HOOKS.update.push(()=>{const s=sync();if(!s)return;const g=api.G;for(const field of s.fields)while(field.next<=5&&g.t+1e-8>=field.start+field.next){each(field.x,field.y,220,e=>hit(e,field.dmg,{hero:'asha',slot:4}));const a=field.next*2.4;text(field.x+Math.cos(a)*120,field.y+Math.sin(a)*90,SALE[field.next%SALE.length],'#ff8cc0',16);puff(field.x,field.y,'#ffd34d',8,220,3);field.next++}s.fields=s.fields.filter(f=>f.next<=5);status(s)});
}
