export function installVanna(api){
  const {HEROES,CAST,AUTO,HOOKS,nearest,aimDir,each,hit,rm,ring}=api;
  HEROES.vanna={id:'vanna',name:'Vanna',country:'Cambodia',role:'Crossweft maker · crossing fields',hp:110,speed:175,ultNeed:60,basicDamage:13,
    identity:{title:'Crossweft Maker',name:'Crossing Point',color:'#e79ac7',max:1,key:'F',loop:'Cross the two 280×40 strips. F detonates the real overlap within 400 and consumes both; parallel strips give no crossing.',hint:'Q + E · Cross strips, then F',ready:'F · Detonate crossing within 400'},
    skills:[
      {key:'',name:'Flying Shuttle',desc:'Auto projectile every 0.8s: 13 damage, range 350.',up:'+25% damage.',cd:.8},
      {key:'Q',name:'Warp Ribbon',baseDamage:14,damageLabel:'Base tick',desc:'280×40 strip along aim, centered 140 ahead for 5s. Occupants take 14 damage each second, five ticks.',up:'+25% tick damage.',cd:6},
      {key:'E',name:'Weft Ribbon',baseDamage:22,damageLabel:'Base arrival hit',desc:'280×40 strip perpendicular to aim, centered 140 ahead for 5s. Arrival 22 damage; occupants stay 50% slow for at least 0.6s.',up:'+25% arrival damage.',cd:7},
      {key:'F',name:'Crosscut Bloom',techniqueDamage:'pulse',damageLabel:'Base pulse',desc:'Radius 110 pulse for 20. A crossing within 400 also bursts in radius 60 for 60 damage and consumes both strips.',up:'+25% pulse and crossing damage.',cd:10},
      {key:'R',name:'Canopy of Threads',desc:'Radius 200 patch at cast position for 5s:20 damage each second, five ticks, and 50% slow. A live crossing inside the canopy adds a 12-damage radius-60 burst each tick. F can still consume it.',up:'+25% tick damage.',cd:0,ult:true,baseDamage:20,damageLabel:'Base tick'}
    ]};
  let S,lastRaid=null;
  function clear(){const g=api.G;S={q:null,e:null,cross:null,patches:[]};if(g){g.roster.vanna=S;g.fx=g.fx.filter(f=>f.hero!=='vanna');g.projs=g.projs.filter(q=>q.hitOptions?.hero!=='vanna')}}
  const inside=(q,e)=>{const dx=e.x-q.x,dy=e.y-q.y;const x=Math.max(0,Math.abs(dx*q.ax+dy*q.ay)-140),y=Math.max(0,Math.abs(dx*q.ay-dy*q.ax)-20);return x*x+y*y<=e.r*e.r};
  function corners(q){return[[-140,-20],[140,-20],[140,20],[-140,20]].map(([x,y])=>({x:q.x+x*q.ax-y*q.ay,y:q.y+x*q.ay+y*q.ax}))}
  function crossing(){
    if(!S.q||!S.e||Math.abs(S.q.ax*S.e.ay-S.q.ay*S.e.ax)<1e-8)return null;
    let polygon=corners(S.q);const clip=corners(S.e);
    for(let i=0;i<4;i++){const a=clip[i],b=clip[(i+1)%4],side=p=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x),input=polygon;polygon=[];
      for(let j=0;j<input.length;j++){const p=input[j],q=input[(j+1)%input.length],u=side(p),v=side(q);if(u>=-1e-8)polygon.push(p);if((u>=0)!==(v>=0)){const t=u/(u-v);polygon.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t})}}}
    let area=0,x=0,y=0;for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],c=a.x*b.y-b.x*a.y;area+=c;x+=(a.x+b.x)*c;y+=(a.y+b.y)*c}return Math.abs(area)>1e-8?{x:x/(3*area),y:y/(3*area),polygon}:null;
  }
  function status(){if(!api.G.identity)return;const ready=!!S.cross&&Math.hypot(S.cross.x-api.G.p.x,S.cross.y-api.G.p.y)<=400;Object.assign(api.G.identity,{charge:ready?1:0,ready,detail:S.cross?(ready?'Crossing READY · F':'Crossing beyond 400'):((S.q?1:0)+(S.e?1:0))+' / 2 strips'})}
  function sync(){const g=api.G;if(lastRaid!==g.raid){clear();lastRaid=g.raid}const q=S.q;if(q)while(q.next<=5&&g.t>=q.at+q.next-1e-8){for(const e of g.enemies)if(!e.dead&&inside(q,e))hit(e,q.damage,{hero:'vanna',slot:1,dot:true});q.next++}for(const key of ['q','e'])if(S[key]&&g.t-S[key].at>=5-1e-8)S[key]=null;S.cross=crossing()}
  function strip(r,slot){sync();const g=api.G,[ax,ay]=aimDir(),p=api.safePoint(g.p.x+ax*140,g.p.y+ay*140,0),q={...p,ax:slot===1?ax:-ay,ay:slot===1?ay:ax,at:g.t,next:1,damage:api.G.hero.skills[1].baseDamage*rm(r)};S[slot===1?'q':'e']=q;if(slot===2)for(const e of g.enemies)if(!e.dead&&inside(q,e))hit(e,api.G.hero.skills[2].baseDamage*rm(r),{hero:'vanna',slot:2});S.cross=crossing();status()}
  HOOKS.newGame.push(()=>{lastRaid=null;clear()});HOOKS.cleanup.push(clear);
  HOOKS.update.push(()=>{const g=api.G;if(g.hero.id!=='vanna')return;if(lastRaid!==g.raid){clear();lastRaid=g.raid}
    sync();
    if(S.e&&g.t-S.e.at<5)for(const e of g.enemies)if(!e.dead&&inside(S.e,e))e.slowT=Math.max(e.slowT||0,.6);
    for(const patch of S.patches){while(patch.next<=5&&g.t>=patch.at+patch.next-1e-8){each(patch.x,patch.y,200,e=>hit(e,patch.damage,{hero:'vanna',slot:4,dot:true}));const knot=S.cross;
      if(knot&&Math.hypot(knot.x-patch.x,knot.y-patch.y)<=200){
        each(knot.x,knot.y,60,e=>hit(e,patch.damage*.6,{hero:'vanna',slot:4,dot:true}));
        ring(knot.x,knot.y,60,'#e79ac7',.42,'crossing');g.fx.at(-1).hero='vanna';
      }
      patch.next++}if(g.t-patch.at<5)each(patch.x,patch.y,200,e=>{e.slowT=Math.max(e.slowT||0,.6)})}
    S.patches=S.patches.filter(q=>g.t-q.at<5-1e-8);sync();status();});
  CAST.vanna=[
    r=>{sync();const g=api.G,p=g.p,e=nearest(p.x,p.y,350);if(!e)return false;const a=Math.atan2(e.y-p.y,e.x-p.x);g.projs.push({x:p.x,y:p.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,r:6,dmg:api.G.hero.basicDamage*rm(r),life:350/430,pierce:1,hit:new Set(),hitOptions:{hero:'vanna',slot:0},kind:'nur'})},
    r=>strip(r,1),r=>strip(r,2),
    r=>{sync();const g=api.G,p=g.p,c=S.cross&&Math.hypot(S.cross.x-p.x,S.cross.y-p.y)<=400?S.cross:null;if(c){api.signatureReleased();if(!g.evo[3])S.q=null;S.e=S.cross=null}each(p.x,p.y,110,e=>hit(e,g.technique.pulse*rm(r),{hero:'vanna',slot:3}));if(c){each(c.x,c.y,60,e=>hit(e,g.technique.cross*rm(r),{hero:'vanna',slot:3}));ring(c.x,c.y,60,'#e79ac7',.5);api.G.fx.at(-1).hero='vanna'}status()},
    r=>{sync();const g=api.G;S.patches.push({x:g.p.x,y:g.p.y,at:g.t,next:1,damage:api.G.hero.skills[4].baseDamage*rm(r)});if(S.patches.length>12)S.patches.shift()}
  ];
  AUTO.vanna={order:[1,2,3,4],when:[null,n=>n(350)>=1,n=>n(350)>=1,n=>!!S.cross&&Math.hypot(S.cross.x-api.G.p.x,S.cross.y-api.G.p.y)<=400||n(110)>=2,n=>n(200)>=5]};
}
