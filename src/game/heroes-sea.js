import {launchMeleeWave,upgradeBasicShot} from './basic-volley.js';
import {basicHitDamage, palmCounter, bellReach, floodRadius, kneeReach, garudaFeathers, poiseDuration, rainInterval, basicProjectileCount, stanceDuration, troupeGuards} from './skill-ranks.js';
export function installHeroes(api){
const {HEROES,HOOKS,CAST,nearest,each,hit,rm,text,juice,aimDir,combo,ring,TAU,puff,banner,rand,random=()=>Math.random(),visualRand=rand,AUTO}=api;


/* ---------- Hero data ---------- */
HEROES.nok={id:'nok',basicDamage:15,name:'Nok',country:'Thailand',role:'Muay Thai bruiser · close range, tough',hp:130,speed:175,ultNeed:55,price:150,
  skills:[
    {key:'',name:'Bell-Ringer',desc:'Auto punches in a short arc at the nearest ghost.',up:'More damage, longer reach.',cd:.55},
    {key:'Q',name:'Ember Flying Knee',baseDamage:54,damageLabel:'Base knee',desc:'Leap forward, striking each ghost in a front arc once. The outer reach deals 50% extra damage and briefly stuns ordinary ghosts.',up:'+25% damage, longer lunge.',cd:5},
    {key:'E',name:'Turning Elbow',baseDamage:30,damageLabel:'Base hit',desc:'Sweep nearby ghosts outward. Land it within 1.2 s of Ember Flying Knee to ready another knee. During Wai Khru Poise, draw them inward and stun them to line up a landing.',up:'+25% damage, wider spin.',cd:7},
    {key:'F',name:'Wai Khru Poise',desc:'Ritual dance honouring her teachers: +30% damage, 30% less damage taken for 8 s.',up:'Blessing lasts longer.',cd:16},
    {key:'R',name:'Hanuman Skyfall',baseDamage:90,damageLabel:'Base landing',desc:'Ultimate: leap high, untouchable, then crush and stun a big area.',up:'+25% damage, bigger landing.',cd:0,ult:true}]};
HEROES.lan={id:'lan',basicDamage:9,name:'Cô Lan',country:'Vietnam',role:'Water puppeteer · summoner, slows',hp:100,speed:165,ultNeed:60,price:200,
  skills:[
    {key:'',name:'River Puppet',desc:'Auto-thrown puppet that flies out and returns, hitting both ways.',up:'More damage, flies farther. Extra puppets at ranks 3, 4 and 5.',cd:.9},
    {key:'Q',name:'Dragonwake',baseDamage:36,damageLabel:'Base hit',desc:'A dragon puppet charges in a line, piercing and soaking ghosts.',up:'+25% damage, longer charge.',cd:7},
    {key:'E',name:'Ripple Troupe',baseDamage:11,damageLabel:'Base guard hit',desc:'Three guards fight for 10 s. Guard hits on soaked ghosts splash nearby enemies.',up:'+25% damage. +1 guard at ranks 3 and 5.',cd:14},
    {key:'F',name:'Flood the Stage',baseDamage:14,damageLabel:'Base wave',desc:'Wave of lake water: ghosts are 50% slower for 3 s.',up:'Bigger wave, more damage.',cd:9},
    {key:'R',name:'Festival of Rain',baseDamage:24,damageLabel:'Base strike',desc:'Ultimate: for 8 s the whole troupe rains hits on ghosts across the screen.',up:'+25% damage, faster hits.',cd:0,ult:true}]};
HEROES.sari={id:'sari',basicDamage:10,name:'Sari',country:'Indonesia',role:'Pencak silat duelist · agile, counters',hp:115,speed:190,ultNeed:50,price:250,
  skills:[
    {key:'',name:'Returning Kris',desc:'Auto-thrown kris that flies out and returns to her hand.',up:'More damage, flies farther.',cd:.75},
    {key:'Q',name:'Crescent Reap',baseDamage:30,damageLabel:'Base hit',desc:'Crescent kick in a wide arc. Detonates Tiger Step echoes caught in the sweep.',up:'+25% damage, wider reach.',cd:4.5},
    {key:'E',name:'Tiger Afterstep',baseDamage:26,damageLabel:'Base blast',desc:'Tiger-step dash. Afterimages explode 0.5 s later.',up:'+25% damage, bigger blasts.',cd:6},
    {key:'F',name:'Silat Palm Guard',desc:'Counter stance for 2.5 s: untouchable, ghosts that touch her are struck back.',up:'Longer stance, harder counter.',cd:12},
    {key:'R',name:'Garuda at Dusk',baseDamage:70,damageLabel:'Base feather hit',desc:'Ultimate: garuda feathers slam ghosts all over the screen.',up:'+25% damage, +1 feather.',cd:0,ult:true}]};

// These heroes are now real entries, so drop their placeholder "locked" cards from the menu.

/* ---------- Module state ---------- */
const fresh=()=>({knee:null,elbowWindow:0,wai:0,waiMax:8,leap:null,punchN:0,punchT:0,punchA:0,spinT:0,
  allies:[],show:0,showAcc:0,showDmg:0,showGap:.16,
  stance:0,stanceMax:2.5,ctrFn:null,images:[],dashImg:0,dashAcc:0,dashDmg:0,dashR:70,dashFear:false,garuda:null,kickT:0,
  strikes:[],fx:[]});
let S=fresh();
HOOKS.newGame.push(g=>{S=fresh();g.sea=S});

const sfx=o=>{o.max=o.life;S.fx.push(o)};
const norm=(dx,dy)=>{const l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]};
function onScreen(){const p=api.G.p,hw=api.W/(2*api.SC)-24,hh=api.H/(2*api.SC)-24,out=[];
  for(const e of api.G.enemies){if(e.dead||e.type==='body'&&!e.near)continue;if(Math.abs(e.x-p.x)<hw&&Math.abs(e.y-p.y)<hh)out.push(e)}return out}
function cluster(range){ // ghost with the most neighbours near the player (leap target)
  const p=api.G.p,c=[];for(const e of api.G.enemies){if(e.dead||e.type==='body')continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<range)c.push(e)}
  let best=null,bn=-1;for(let i=0;i<c.length&&i<40;i++){const a=c[i];let n=a.boss?6:0;for(const b of c)if(Math.abs(a.x-b.x)<130&&Math.abs(a.y-b.y)<130)n++;if(n>bn){bn=n;best=a}}
  return best}

/* Boomerang projectile shared by Lan's puppet and Sari's kris */
function boomerang(a,rank,o){
  const p=api.G.p,spd=o.spd,pr={x:p.x,y:p.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,ax:Math.cos(a),ay:Math.sin(a),r:o.r,dmg:o.dmg,life:4,pierce:9999,hit:new Set(),
    hitOptions:{slot:0},out:o.out,outMax:o.out,back:false,spin:0,trail:o.trail,kind:api.G.hero.id==='lan'?'puppet':'kris',
    update(q,dt){
      if(!q.back){q.out-=dt;const k=Math.max(.12,q.out/q.outMax);q.vx=q.ax*spd*k*1.6;q.vy=q.ay*spd*k*1.6;
        if(q.out<=0){q.back=true;q.hit.clear();if(o.onTurn)o.onTurn(q)}}
      else{const dx=api.G.p.x-q.x,dy=api.G.p.y-q.y,d=Math.hypot(dx,dy)||1;q.bs=Math.min(spd*1.5,(q.bs||spd*.3)+spd*4*dt);q.vx=dx/d*q.bs;q.vy=dy/d*q.bs;if(d<api.G.p.r+12)q.life=0}
      if(q.trail&&Math.random()<.5)api.G.fx.push({x:q.x,y:q.y,vx:0,vy:0,life:.22,max:.22,c:q.trail,size:4})},
    draw:null};
  api.G.projs.push(upgradeBasicShot(pr,rank));return pr}

/* Falling strikes shared by Festival of Rain and Garuda at Dusk */
function strike(e,x,y,o){S.strikes.push({e,x,y,t:o.t||.26,t0:o.t||.26,r:o.r,dmg:o.dmg,kind:o.kind,slow:o.slow||0,seed:Math.random()})}

function sweepKnee(k){
  const p=k.center;
  each(p.x,p.y,k.radius,(e,dx,dy)=>{
    if(k.targets.has(e))return;
    const forward=dx*k.ax+dy*k.ay,side=Math.abs(dx*k.ay-dy*k.ax);
    if(forward<0||Math.atan2(side,forward)>k.half||!api.clearLine(p,e,0))return;
    k.targets.add(e);
    const outer=(e.x-k.start.x)*k.ax+(e.y-k.start.y)*k.ay>=k.reach*.72;
    if(!hit(e,k.damage*(outer?1.5:1),{slot:1,kb:[k.ax*340,k.ay*340]}))return;
    if(outer){
      if(!e.boss)e.stun=Math.max(e.stun,.45);
      ring(e.x,e.y,24,'#ffb37d',.32,'tip');
      if(!k.rang){api.audio.play('nok','tip');k.rang=true}
    }
  });
}

/* ---------- Casts ---------- */
CAST.nok=[
  r=>{if(S.leap)return false;const p=api.G.p,reach=bellReach(r),t=nearest(p.x,p.y,reach+14);if(!t)return false;
    const a=Math.atan2(t.y-p.y,t.x-p.x),ax=Math.cos(a),ay=Math.sin(a);S.punchN++;
    launchMeleeWave(api.G,r,a);
    const knee=api.G.evo[0]&&S.punchN%3===0,cross=!knee&&S.punchN%2===0,mul=knee?3:cross?1.35:1,kb=knee?260:cross?170:60;
    each(p.x,p.y,reach,(e,dx,dy)=>{let d=Math.atan2(dy,dx)-a;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<.85){hit(e,basicHitDamage(api.G.hero,r,api.G.evo[0])*mul,{slot:0,kb:[ax*kb,ay*kb]});if(knee&&!e.boss)e.stun=Math.max(e.stun,.5)}});
    S.punchT=.14;S.punchA=a;sfx({kind:'arc',x:p.x,y:p.y,a,half:.85,r:reach,life:knee?.2:.13,c:knee?'#ffd34d':cross?'#ff6b5a':'#ffe9d6',w:knee?9:cross?7:5});
    if(knee){text(p.x+ax*40,p.y+ay*40-10,'KHAO!','#ffd34d',15);juice(5,.03)}else if(cross)juice(2)},
  r=>{
    if(S.leap)return false;
    const p=api.G.p,[ax,ay]=aimDir(),reach=kneeReach(r,api.G.technique);
    const knee={ax,ay,reach,radius:reach*.46,half:api.G.technique.half,elapsed:0,duration:.32,
      start:{x:p.x,y:p.y},center:{x:p.x,y:p.y},targets:new Set(),rang:false,damage:api.G.hero.skills[1].baseDamage*rm(r)};
    S.knee=knee;S.elbowWindow=1.2;
    sweepKnee(knee);
    if(api.G.evo[1])api.G.projs.push({x:p.x+ax*40,y:p.y+ay*40,vx:ax*620,vy:ay*620,r:26,dmg:20*rm(r),life:.75,pierce:9999,hit:new Set(),a:Math.atan2(ay,ax),
      onHit:(q,e)=>{if(!e.boss&&e.type!=='body'){e.kvx+=ax*260;e.kvy+=ay*260}},
      draw:null});
    p.sq=.65;juice(3)},
  r=>{if(S.leap)return false;const p=api.G.p,bl=S.wai>0,R=(96+7*r)*(bl?1.4:1),dmg=api.G.hero.skills[2].baseDamage*rm(r)*(bl?1.5:1);if(bl)combo("Khru's Blessing");
    let landed=false;
    each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);const force=bl?-230:230;if(hit(e,dmg,{kb:[nx*force,ny*force]}))landed=true;if(bl&&!e.boss)e.stun=Math.max(e.stun,.7)});
    if(landed&&S.elbowWindow>0){api.G.cds[1]=0;text(p.x,p.y-40,'KNEE READY','#ffce93',15)}
    else if(landed&&api.G.evo[2])api.G.cds[1]=Math.max(0,api.G.cds[1]-2);
    S.elbowWindow=0;S.knee=null;
    S.spinT=.28;sfx({kind:'spin',x:p.x,y:p.y,r:R,life:.28,c:bl?'#ffd34d':'#ff8a6b'});ring(p.x,p.y,R,bl?'#ffd34d':'#ff8a6b',.3);juice(bl?10:7,.05)},
  r=>{const p=api.G.p;S.waiMax=S.wai=poiseDuration(r);ring(p.x,p.y,70,'#ffd34d',.6);ring(p.x,p.y,110,'#fff3b0',.8);
    for(let k=0;k<10;k++){const a=k/10*TAU;api.G.fx.push({x:p.x+Math.cos(a)*26,y:p.y+Math.sin(a)*26,vx:Math.cos(a)*20,vy:-50,life:.8,max:.8,c:'rgba(255,221,120,.8)',size:4})}
    text(p.x,p.y-40,'Wai Khru Poise','#ffe9a8',17);p.sq=.6},
  r=>{const p=api.G.p,bl=S.wai>0;let tx,ty;
    const c=api.G.autoAim?cluster(330):null;
    if(c){tx=c.x;ty=c.y}else{const[ax,ay]=aimDir();tx=p.x+ax*230;ty=p.y+ay*230}
    if(bl)combo("Hanuman's Blessing");
    S.knee=null;S.elbowWindow=0;
    S.leap={t:0,dur:.45,sx:p.x,sy:p.y,tx,ty,r,bl};p.dash=null;p.vx=p.vy=0;
    puff(p.x,p.y,'#d8c9a8',12,140,4);ring(p.x,p.y,50,'#ffd34d',.3);juice(6);banner('Hanuman Skyfall!',1.5)},
];

CAST.lan=[
  r=>{const p=api.G.p,t=nearest(p.x,p.y,430);if(!t)return false;const base=Math.atan2(t.y-p.y,t.x-p.x),n=basicProjectileCount('lan',r);
    for(let k=0;k<n;k++)boomerang(base+(k-(n-1)/2)*.45,r,{spd:400,out:.42+.02*r,r:11,dmg:basicHitDamage(api.G.hero,r,api.G.evo[0]),trail:'rgba(120,200,255,.5)',draw:null,
      onTurn:api.G.evo[0]?q=>{each(q.x,q.y,74,e=>hit(e,13*rm(r),{slot:0}));ring(q.x,q.y,74,'#ffb347',.3);puff(q.x,q.y,'#ffcf70',8,150,3);juice(3)}:null})},
  r=>{const p=api.G.p,[ax,ay]=aimDir(),life=.62+.03*r,evo=!!api.G.evo[1];
    api.G.projs.push({kind:'dragon',x:p.x+ax*10,y:p.y+ay*10,vx:ax*540,vy:ay*540,r:26,dmg:api.G.hero.skills[1].baseDamage*rm(r),life,life0:life,pierce:9999,hit:new Set(),tidal:false,evo,ret:false,ph:0,
      dmgFor:e=>e.slowT>0?2:1,
      onHit:(q,e)=>{if(e.slowT>0&&!q.tidal){q.tidal=true;combo('Tidal Dragon')}e.slowT=Math.max(e.slowT||0,1.5);puff(e.x,e.y,'#8fd6ff',5,130,3);juice(3)},
      update:(q,dt)=>{q.ph+=dt*16;if(Math.random()<.7)api.G.fx.push({x:q.x+visualRand(-14,14),y:q.y+visualRand(-14,14),vx:visualRand(-40,40),vy:visualRand(-40,40),life:.35,max:.35,c:'rgba(143,214,255,.6)',size:5});
        if(q.evo&&!q.ret&&q.life<.05){q.ret=true;q.vx=-q.vx;q.vy=-q.vy;q.life=q.life0;q.hit.clear();q.tidal=false;ring(q.x,q.y,50,'#ffd34d',.3)}},
      draw:null});
    ring(p.x,p.y,40,'#8fd6ff',.3);juice(6,.04);p.sq=.7},
  r=>{const p=api.G.p,n=troupeGuards(r),full=S.show>0;if(full)combo('Full Troupe');
    for(let k=0;k<n;k++){const a=k/n*TAU+api.G.t,ax=p.x+Math.cos(a)*34,ay=p.y+Math.sin(a)*34;
      S.allies.push({x:ax,y:ay,t:10,dmg:api.G.hero.skills[2].baseDamage*rm(r)*(full?1.5:1),cd:rand(0,.3),slot:a,tg:null,bop:0,hue:k%3,full});
      puff(ax,ay,'#8fd6ff',6,90,3)}
    if(S.allies.length>10)S.allies.splice(0,S.allies.length-10);
    ring(p.x,p.y,60,'#8fd6ff',.4);juice(4)},
  r=>{const p=api.G.p,R=floodRadius(r,api.G.technique);each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,api.G.hero.skills[3].baseDamage*rm(r),{kb:[nx*170,ny*170]});e.slowT=Math.max(e.slowT||0,api.G.technique.slow)});
    sfx({kind:'wave',x:p.x,y:p.y,r:R,life:.5});ring(p.x,p.y,R,'#8fd6ff',.5);ring(p.x,p.y,R*.6,'#d6f1ff',.4);
    for(let k=0;k<16;k++){const a=k/16*TAU;api.G.fx.push({x:p.x+Math.cos(a)*30,y:p.y+Math.sin(a)*30,vx:Math.cos(a)*R*1.6,vy:Math.sin(a)*R*1.6,life:.45,max:.45,c:'rgba(143,214,255,.7)',size:5})}
    juice(8,.05)},
  r=>{S.show=8;S.showAcc=0;S.showDmg=api.G.hero.skills[4].baseDamage*rm(r);S.showGap=rainInterval(r);
    if(S.allies.length){combo('Full Troupe');for(const a of S.allies){a.t=Math.max(a.t,8);if(!a.full){a.full=true;a.dmg*=1.5}}}
    ring(api.G.p.x,api.G.p.y,240,'#8fd6ff',.7);juice(12,.1);banner('Festival of Rain!',1.5)},
];

CAST.sari=[
  r=>{const p=api.G.p,t=nearest(p.x,p.y,400);if(!t)return false;const base=Math.atan2(t.y-p.y,t.x-p.x),n=basicProjectileCount('sari',r,api.G.evo[0]);
    for(let k=0;k<n;k++)boomerang(base+(k-(n-1)/2)*.5,r,{spd:470,out:.34+.02*r,r:9,dmg:basicHitDamage(api.G.hero,r,api.G.evo[0]),trail:api.G.evo[0]?'rgba(255,211,77,.5)':'rgba(220,230,240,.4)',draw:null})},
  r=>{const p=api.G.p,[ax,ay]=aimDir(),a=Math.atan2(ay,ax),st=S.stance>0,R=(122+8*r)*(st?1.15:1),half=st?Math.PI:1.15,dmg=api.G.hero.skills[1].baseDamage*rm(r)*(st?2:1);
    if(st)combo('Bunga Sabit');
    each(p.x,p.y,R,(e,dx,dy)=>{let d=Math.atan2(dy,dx)-a;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<=half){const[nx,ny]=norm(dx,dy);hit(e,dmg,{kb:[nx*280,ny*280]})}});
    for(const echo of S.images){
      const dx=echo.x-p.x,dy=echo.y-p.y,d=Math.atan2(dy,dx)-a;
      if(Math.hypot(dx,dy)<=R&&Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))<=half){
        if(echo.t>0&&api.G.evo[1])echo.dmg*=1.5;
        echo.t=0;ring(echo.x,echo.y,echo.r,'#da81cf',.45,'echo');
      }
    }
    S.kickT=.22;sfx({kind:st?'spin':'arc',x:p.x,y:p.y,a,half,r:R,life:.22,c:st?'#ffd34d':'#ff9b3d',w:12});if(st)ring(p.x,p.y,R,'#ffd34d',.3);
    p.sq=.7;juice(st?10:6,.05)},
  r=>{const p=api.G.p,[ax,ay]=aimDir(),evo=!!api.G.evo[2];
    p.dash={t:.2,vx:ax*1050,vy:ay*1050,hit:new Set(),dmg:20*rm(r),fire:false};p.invuln=Math.max(p.invuln,.4);
    S.dashImg=4;S.dashAcc=0;S.dashDmg=api.G.hero.skills[2].baseDamage*rm(r);S.dashR=(66+5*r)*(evo?1.4:1);S.dashFear=evo;
    puff(p.x,p.y,'#ffb347',10,130,4);text(p.x,p.y-34,'Harimau!','#ffb347',14);juice(5)},
  r=>{const p=api.G.p;S.stanceMax=S.stance=stanceDuration(r,api.G.technique);const dmg=palmCounter(r,api.G.technique);
    S.ctrFn=e=>{if(api.G.t<(e.hits.ctr||0))return;e.hits.ctr=api.G.t+.45;for(const f of HOOKS.parry)f();const[nx,ny]=norm(e.x-p.x,e.y-p.y);hit(e,dmg,{visualSlot:3,kb:[nx*400,ny*400]});if(!e.boss)e.stun=Math.max(e.stun,.5);
      sfx({kind:'arc',x:p.x,y:p.y,a:Math.atan2(ny,nx),half:.6,r:44,life:.14,c:'#ffe9a8',w:6});puff(e.x,e.y,'#ffd34d',5,120,3);juice(4,.03)};
    p.onContact=S.ctrFn;api.G.cds[1]=Math.min(api.G.cds[1],.25); // the stance readies her kick
    ring(p.x,p.y,56,'#ff8fb0',.5);text(p.x,p.y-40,'Silat Palm Guard','#ffc2d4',16);p.sq=.5},
  r=>{const n=garudaFeathers(r);S.garuda={n,gap:2.4/n,acc:0,dmg:api.G.hero.skills[4].baseDamage*rm(r)};ring(api.G.p.x,api.G.p.y,220,'#ffd34d',.6);juice(12,.1);banner('Garuda at Dusk!',1.5)},
];

/* ---------- Auto-cast ---------- */
const bossUp=()=>api.G.boss&&!api.G.boss.dead||api.G.raidBoss&&!api.G.raidBoss.dead;
AUTO.nok={order:[3,2,1,4],when:[null,n=>n(215*api.G.technique.reach)>=1&&!S.leap,n=>!S.leap&&(n(118)>=3||S.wai>0&&n(130)>=2),n=>n(260)>=5||bossUp()&&n(260)>=1,n=>!S.leap&&(n(320)>=12||bossUp()&&n(320)>=1)]};
AUTO.lan={order:[3,1,2,4],when:[null,n=>n(300)>=2,n=>n(330)>=3,n=>n((190+13*api.G.ranks[3])*api.G.technique.radius)>=3,n=>n(360)>=12||bossUp()&&n(400)>=1]};
AUTO.sari={order:[3,1,2,4],when:[null,n=>n(135)>=2||S.stance>0&&n(150)>=1,n=>n(260)>=4&&!api.G.p.dash,n=>n(85)>=2||bossUp()&&n(80)>=1,n=>n(320)>=12||bossUp()&&n(400)>=1]};

/* ---------- Hooks ---------- */
HOOKS.dmgMul.push(()=>S.wai>0?1.3:1);
HOOKS.hurt.push(a=>{
  if(S.leap)return false;
  if(S.stance>0){for(const f of HOOKS.parry)f();if(Math.random()<.5)text(api.G.p.x,api.G.p.y-30,'parry!','#ffc2d4',12);return false}
  if(S.wai>0)return a*.7;
});

HOOKS.update.push(dt=>{
  if(!api.G||api.G.sea!==S)return;const p=api.G.p;
  if(S.punchT>0)S.punchT-=dt;if(S.spinT>0)S.spinT-=dt;if(S.kickT>0)S.kickT-=dt;
  for(const f of S.fx)f.life-=dt;if(S.fx.length)S.fx=S.fx.filter(f=>f.life>0);

  // Nok
  S.elbowWindow=Math.max(0,S.elbowWindow-dt);
  if(S.knee){
    const k=S.knee,step=Math.min(dt,k.duration-k.elapsed),d=k.reach*.54*step/k.duration;
    const x=p.x+k.ax*d,y=p.y+k.ay*d;
    Object.assign(p,api.moveOnMap(p.x,p.y,x,y,p.r));
    k.elapsed+=step;k.center.x=p.x;k.center.y=p.y;
    sweepKnee(k);
    if(k.elapsed>=k.duration||Math.hypot(p.x-x,p.y-y)>.01)S.knee=null;
  }
  if(S.wai>0){S.wai-=dt;if(Math.random()<dt*10)api.G.fx.push({x:p.x+visualRand(-16,16),y:p.y+10,vx:0,vy:-45,life:.6,max:.6,c:'rgba(255,221,120,.6)',size:3})}
  if(S.leap){const L=S.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur),s=k*k*(3-2*k);
    p.x=L.sx+(L.tx-L.sx)*s;p.y=L.sy+(L.ty-L.sy)*s;p.vx=p.vy=0;p.dash=null;
    if(k>=1){S.leap=null;const R=(172+9*L.r)*(L.bl?1.3:1),dmg=api.G.hero.skills[4].baseDamage*rm(L.r)*(L.bl?1.5:1);
      each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,dmg,{visualSlot:4,kb:[nx*320,ny*320]});if(!e.boss)e.stun=Math.max(e.stun,1.5+.2*(L.r-1)+(L.bl?.5:0))});
      ring(p.x,p.y,R,'#ffd34d',.5);ring(p.x,p.y,R*.6,'#fff3b0',.35);sfx({kind:'crack',x:p.x,y:p.y,r:R,life:.9,seed:Math.random()*9});
      puff(p.x,p.y,'#d8c9a8',22,260,5);p.sq=1;p.invuln=Math.max(p.invuln,.3);juice(18,.14)}}

  // Lan: guards
  if(S.allies.length){
    for(const a of S.allies){a.t-=dt;a.cd-=dt;if(a.bop>0)a.bop-=dt*5;
      if(a.tg&&(a.tg.dead||Math.hypot(a.tg.x-p.x,a.tg.y-p.y)>440))a.tg=null;
      if(!a.tg){const skip=new Set();for(const b of S.allies)if(b!==a&&b.tg)skip.add(b.tg);
        let t=nearest(a.x,a.y,340,skip)||nearest(a.x,a.y,340);if(t&&Math.hypot(t.x-p.x,t.y-p.y)>440)t=null;a.tg=t}
      let gx,gy,stop=6;
      if(a.tg){gx=a.tg.x;gy=a.tg.y;stop=a.tg.r+12}else{const q=a.slot+api.G.t*.8;gx=p.x+Math.cos(q)*48;gy=p.y+Math.sin(q)*48}
      const dx=gx-a.x,dy=gy-a.y,d=Math.hypot(dx,dy)||1;
      if(d>stop){const v=Math.min(270,d*8);a.x+=dx/d*v*dt;a.y+=dy/d*v*dt;a.fx=dx<0?-1:1}
      if(a.tg&&d<=stop+6&&a.cd<=0){a.cd=.45;a.bop=1;
        if(a.tg.slowT>0&&!(a.tg.hits.ripple>api.G.t)){
          a.tg.hits.ripple=api.G.t+.65;
          each(a.tg.x,a.tg.y,80,e=>{if(e!==a.tg)hit(e,a.dmg*.6,{visualSlot:2})});
          ring(a.tg.x,a.tg.y,80,'#84f2ef',.45,'ripple');
        }
        const landed=hit(a.tg,a.dmg,{visualSlot:2,kb:[dx/d*90,dy/d*90]});
        if(landed&&api.G.evo[2])a.tg.slowT=Math.max(a.tg.slowT||0,1.5);
        puff(a.tg.x,a.tg.y,'#8fd6ff',3,80,2)}
      if(a.t<=0)puff(a.x,a.y,'#8fd6ff',6,90,3)}
    S.allies=S.allies.filter(a=>a.t>0)}
  // Lan: Festival of Rain
  if(S.show>0){S.show-=dt;S.showAcc+=dt;
    while(S.showAcc>=S.showGap){S.showAcc-=S.showGap;const c=onScreen();if(!c.length)break;
      const e=api.G.boss&&!api.G.boss.dead&&c.includes(api.G.boss)&&random()<.2?api.G.boss:c[random()*c.length|0];
      strike(e,e.x,e.y,{r:40,dmg:S.showDmg,kind:'puppet',slow:1.2})}}

  // Sari
  if(S.dashImg>0){
    if(p.dash){S.dashAcc-=dt;if(S.dashAcc<=0){S.dashAcc=.05;S.dashImg--;S.images.push({x:p.x,y:p.y,t:.5,dmg:S.dashDmg,r:S.dashR,fear:S.dashFear})}}
    else{S.images.push({x:p.x,y:p.y,t:.5,dmg:S.dashDmg,r:S.dashR,fear:S.dashFear});S.dashImg=0}}
  if(S.images.length){for(const m of S.images){m.t-=dt;if(m.t<=0){each(m.x,m.y,m.r,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,m.dmg,{visualSlot:2,kb:[nx*160,ny*160]});if(m.fear&&!e.boss)e.fear=Math.max(e.fear,1.2)});
      ring(m.x,m.y,m.r,'#ffb347',.3);puff(m.x,m.y,'#ffb347',8,170,4);juice(5,.02)}}
    S.images=S.images.filter(m=>m.t>0)}
  if(S.stance>0){S.stance-=dt;if(!p.onContact)p.onContact=S.ctrFn;
    if(S.stance<=0){if(p.onContact===S.ctrFn)p.onContact=null;ring(p.x,p.y,40,'#ff8fb0',.3)}}
  else if(S.ctrFn&&p.onContact===S.ctrFn)p.onContact=null;
  if(S.garuda){const g=S.garuda;g.acc+=dt;
    while(g.n>0&&g.acc>=g.gap){g.acc-=g.gap;g.n--;const c=onScreen();
      if(c.length){const e=api.G.boss&&!api.G.boss.dead&&c.includes(api.G.boss)&&random()<.3?api.G.boss:c[random()*c.length|0];strike(e,e.x,e.y,{r:66,dmg:g.dmg,kind:'feather',t:.3})}
      else strike(null,p.x+rand(-220,220),p.y+rand(-160,160),{r:66,dmg:g.dmg,kind:'feather',t:.3})}
    if(g.n<=0)S.garuda=null}

  // falling strikes
  if(S.strikes.length){for(const s of S.strikes){if(s.e&&!s.e.dead){s.x=s.e.x;s.y=s.e.y}s.t-=dt;
      if(s.t<=0){each(s.x,s.y,s.r,e=>{hit(e,s.dmg,{visualSlot:4});if(s.slow)e.slowT=Math.max(e.slowT||0,s.slow)});
        if(s.kind==='feather'){ring(s.x,s.y,s.r,'#ffd34d',.3);puff(s.x,s.y,'#ffd34d',8,190,4);sfx({kind:'burst',x:s.x,y:s.y,r:s.r,life:.25});juice(8,.03)}
        else{ring(s.x,s.y,s.r,'#8fd6ff',.28);puff(s.x,s.y,'#8fd6ff',5,140,3);juice(3)}}}
    S.strikes=S.strikes.filter(s=>s.t>0)}
});



}
