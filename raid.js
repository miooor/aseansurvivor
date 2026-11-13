// Portal and raid boss (module)
// A shadow portal opens once per run. Inside waits Hantu Raya, a raid-style boss with telegraphed mechanics.
// Reward: 60% Fusion Orb (a free evolution), otherwise +2 levels and double XP for 60 s.
(function(){
'use strict';
const ARENA={x:60000,y:60000,r:520};
const STASH=['enemies','gems','zones','eprojs','durians','pups'];
const PURPLE='#c77dff',RED='#ff2a4a';
const cl=(v,a,b)=>v<a?a:v>b?b:v;
let R=null;                       // module state, rebuilt on every new game
const fresh=()=>({portalAt:rand(50,110),spawned:false,portal:null,boss:null,tele:[],spawns:[],volleys:[],lane:null,eclipse:null,orb:null,xpT:0,reward:'',force:null});

/* ---------- Ghost types ---------- */
GHOSTS.raya={hp:3000,spd:72,r:40,dmg:14,xp:0};
GHOSTS.shade={hp:34,spd:104,r:12,dmg:7,xp:2};

/* ---------- Portal ---------- */
function spawnPortal(){
  const p=G.p,a=rand(0,TAU),d=rand(650,900);
  R.spawned=true;R.portal={x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,life:60,max:60};
  banner('A shadow portal has opened nearby! Follow the purple arrow. Something big waits inside.',5);
  juice(6);
}
function updatePortal(dt){
  if(!R.spawned&&G.clock>=R.portalAt){
    if(G.boss||G.won)R.spawned=true;        // the stage boss is out: no raid this run
    else spawnPortal();
  }
  const q=R.portal;if(!q)return;
  q.life-=dt;
  if(Math.random()<.3){const a=rand(0,TAU);G.fx.push({x:q.x+Math.cos(a)*44,y:q.y+Math.sin(a)*44,vx:-Math.cos(a)*50,vy:-Math.sin(a)*50,life:.7,max:.7,c:'rgba(199,125,255,.7)',size:3})}
  if(q.life<=0){R.portal=null;puff(q.x,q.y,PURPLE,20,160,4);banner('The shadow portal fades away.',2.5);return}
  if(!G.over&&!G.won&&Math.hypot(q.x-G.p.x,q.y-G.p.y)<34+G.p.r)enterRaid();
}

/* ---------- Enter / leave ---------- */
function enterRaid(){
  if(!G||G.raid||G.over)return;
  const p=G.p,stash={};
  for(const k of STASH){stash[k]=G[k];G[k]=[]}
  G.raid={t:0,entry:{x:p.x,y:p.y},stash,goal:$('goal').textContent,outro:0,won:false};
  R.portal=null;R.spawned=true;R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;R.orb=null;
  puff(p.x,p.y,PURPLE,24,200,4);
  p.x=ARENA.x;p.y=ARENA.y+250;p.vx=p.vy=0;p.dash=null;p.invuln=Math.max(p.invuln,1.2);
  const hp=600+300*G.level;
  const e=makeGhost('raya',ARENA.x,ARENA.y-150);
  Object.assign(e,{boss:true,raid:true,name:'Hantu Raya',hp,maxHp:hp,ai:rayaAI,state:'intro',st:1.6,next:1.2,step:0,p2:false,cast:null});
  G.raidBoss=e;R.boss=e;showBossBar('Hantu Raya');
  $('goal').textContent='Raid: defeat Hantu Raya';
  banner('Hantu Raya, the great shadow that wears its master\'s shape. Red circles mean MOVE.',5);
  ring(p.x,p.y,90,PURPLE,.5);juice(12,.12);
}
function exitRaid(){
  const rd=G.raid,p=G.p,left=G.gems;
  for(const k of STASH)G[k]=rd.stash[k];
  p.x=rd.entry.x;p.y=rd.entry.y;p.vx=p.vy=0;p.dash=null;p.invuln=Math.max(p.invuln,1.5);
  for(const g of left)if(!g.got){g.x=p.x+rand(-30,30);g.y=p.y+rand(-30,30);g.mag=true;G.gems.push(g)}   // nothing earned is left behind
  if(R.orb)grantOrb();
  G.raid=null;G.raidBoss=null;R.boss=null;R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;
  hideBossBar();if(G.boss&&!G.boss.dead)showBossBar(G.boss.name||'Pontianak');
  $('goal').textContent=rd.goal;
  each(p.x,p.y,180,(e,dx,dy)=>{if(e.boss||e.type==='body')return;const l=Math.hypot(dx,dy)||1;e.kvx+=dx/l*520;e.kvy+=dy/l*520;e.stun=Math.max(e.stun,.8)});
  ring(p.x,p.y,180,PURPLE,.5);puff(p.x,p.y,PURPLE,24,220,4);juice(10,.08);
  banner('Back in the kampung. '+R.reward,4);
}

/* ---------- Hantu Raya AI ---------- */
const STOP={tx:0,ty:0,sp:0};
const inArena=(x,y,pad)=>{const dx=x-ARENA.x,dy=y-ARENA.y,d=Math.hypot(dx,dy)||1,m=ARENA.r-pad;return d>m?[ARENA.x+dx/d*m,ARENA.y+dy/d*m]:[x,y]};
function rayaAI(e,dt,info){
  const p=G.p;e.phase+=dt;
  if(G.raid.won)return STOP;
  if(!e.p2&&e.hp<=e.maxHp*.5&&e.state!=='intro'){
    e.p2=true;e.state='roar';e.st=1.3;e.step=0;e.dmg=GHOSTS.raya.dmg;R.lane=null;e.cast={name:'roar',t:0,max:1.3};
    banner('Hantu Raya is ENRAGED! Shadow bolts fly, and when the eclipse comes, stand in the light.',5);
    text(e.x,e.y-e.r-30,'ENRAGE!',RED,24);ring(e.x,e.y,160,RED,.6);ring(e.x,e.y,90,RED,.4);puff(e.x,e.y,RED,26,260,4);juice(16,.18);
  }
  if(e.cast&&(e.cast.t+=dt)>=e.cast.max)e.cast=null;
  switch(e.state){
    case'intro':case'roar':case'cast':
      if((e.st-=dt)<=0){if(e.state==='roar')e.next=.4;e.state='chase'}
      return STOP;
    case'wind':{
      const L=R.lane;e.st-=dt;if(L)L.k=cl(1-e.st/L.wind,0,1);
      if(e.st<=0){e.state='lunge';e.st=L.len/680;e.dmg=24;juice(5)}
      return STOP}
    case'lunge':{
      const L=R.lane;e.st-=dt;
      G.fx.push({x:e.x,y:e.y,vx:0,vy:0,life:.3,max:.3,c:'rgba(30,10,50,.7)',size:26});
      if(e.st<=0||Math.hypot(e.x-ARENA.x,e.y-ARENA.y)>ARENA.r-e.r-2){e.state='chase';e.dmg=GHOSTS.raya.dmg;R.lane=null;ring(e.x,e.y,70,PURPLE,.3);juice(7,.04);return STOP}
      return{tx:L.dx,ty:L.dy,sp:680}}
  }
  if((e.next-=dt)<=0)return startAbility(e,info),STOP;
  return{tx:info.tx,ty:info.ty,sp:e.spd*(e.p2?1.3:1)*(info.dl<e.r+p.r-3?0:1)};
}
const ROT1=['slam','lunge','slam','summon'],ROT2=['ring','slam','eclipse','lunge','summon'];
function startAbility(e,info){
  const p=G.p,rot=e.p2?ROT2:ROT1;let ab=rot[e.step++%rot.length];
  if(ab==='summon'&&G.enemies.filter(s=>s.type==='shade'&&!s.dead).length>=6)ab='slam';
  e.next=e.p2?2.3:3.1;
  const say=(s,c)=>text(e.x,e.y-e.r-30,s,c||'#ffb3c1',18);
  if(ab==='slam'){
    const n=e.p2?5:3,max=e.p2?1.1:1.4;say('SHADOW SLAM');
    for(let k=0;k<n;k++){
      let x=p.x,y=p.y;
      if(k===1&&e.p2){x+=p.vx*.8;y+=p.vy*.8}
      else if(k>0){const a=rand(0,TAU),d=rand(120,240);x+=Math.cos(a)*d;y+=Math.sin(a)*d}
      [x,y]=inArena(x,y,30);
      R.tele.push({x,y,r:82,t:max+k*.2,max,dmg:20});
    }
    e.state='cast';e.st=.7;e.cast={name:'slam',t:0,max:.7};
  }else if(ab==='lunge'){
    say('SHADOW LUNGE');const wind=e.p2?.8:1;
    R.lane={x:e.x,y:e.y,dx:info.tx,dy:info.ty,len:Math.min(560,info.dl+170),w:e.r+10,k:0,wind};
    e.state='wind';e.st=wind;
  }else if(ab==='summon'){
    say('BAYANG, RISE!',PURPLE);const n=e.p2?4:3;
    for(let k=0;k<n;k++){const a=rand(0,TAU),d=rand(140,ARENA.r-90);R.spawns.push({x:ARENA.x+Math.cos(a)*d,y:ARENA.y+Math.sin(a)*d,t:.9+k*.12,max:.9+k*.12})}
    e.state='cast';e.st=1;e.cast={name:'summon',t:0,max:1};
  }else if(ab==='ring'){
    say('SHADOW BOLTS',PURPLE);
    R.volleys.push({t:.7,off:0},{t:1.25,off:.5});
    e.state='cast';e.st=1.4;e.cast={name:'ring',t:0,max:.7};
  }else{
    say('GERHANA!','#ffe9a8');banner('Gerhana! The eclipse is coming. Stand in the circle of light!',3);
    const a=rand(0,TAU),d=rand(150,240);const[x,y]=inArena(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,150);
    R.eclipse={x,y,r:105,t:2.8,max:2.8,dmg:30};
    e.state='cast';e.st=1.1;e.cast={name:'eclipse',t:0,max:1.1};e.next+=1.6;
  }
}

/* ---------- Per-frame raid logic ---------- */
function updateRaid(dt){
  const rd=G.raid,p=G.p,e=R.boss;rd.t+=dt;
  // arena wall
  {const dx=p.x-ARENA.x,dy=p.y-ARENA.y,d=Math.hypot(dx,dy),m=ARENA.r-p.r;if(d>m){p.x=ARENA.x+dx/d*m;p.y=ARENA.y+dy/d*m;if(p.dash)p.dash.t=0}}
  for(const s of G.enemies){if(s.dead)continue;const[x,y]=inArena(s.x,s.y,s.r);s.x=x;s.y=y}
  for(const q of G.eprojs)if(Math.hypot(q.x-ARENA.x,q.y-ARENA.y)>ARENA.r)q.life=0;
  if(Math.random()<.25){const a=rand(0,TAU),d=rand(0,ARENA.r);G.fx.push({x:ARENA.x+Math.cos(a)*d,y:ARENA.y+Math.sin(a)*d,vx:rand(-8,8),vy:rand(-30,-12),life:1.2,max:1.2,c:'rgba(199,125,255,.35)',size:2.5})}

  // Shadow Slam circles
  for(const q of R.tele){
    if((q.t-=dt)>0)continue;
    if(Math.hypot(p.x-q.x,p.y-q.y)<q.r+p.r*.4)hurtPlayer(q.dmg);
    ring(q.x,q.y,q.r,RED,.35);puff(q.x,q.y,'#3a1030',14,220,5);puff(q.x,q.y,RED,8,160,3);juice(8,.03);
  }
  R.tele=R.tele.filter(q=>q.t>0);
  // shade summons
  for(const s of R.spawns){
    if((s.t-=dt)>0)continue;
    const sh=makeGhost('shade',s.x,s.y);sh.raid=true;sh.hp=sh.maxHp=30+4*G.level;sh.born=G.t;puff(s.x,s.y,'#5a2a8a',10,120,4);
  }
  R.spawns=R.spawns.filter(s=>s.t>0);
  // projectile rings
  for(const v of R.volleys){
    if((v.t-=dt)>0||!e||e.dead)continue;
    const n=14,sp=175;for(let k=0;k<n;k++){const a=(k+v.off)/n*TAU+e.phase*.3;G.eprojs.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7,dmg:9,life:6,c:PURPLE})}
    ring(e.x,e.y,80,PURPLE,.35);juice(5);
  }
  R.volleys=R.volleys.filter(v=>v.t>0);
  // Gerhana: the only safe place is the light
  const ec=R.eclipse;
  if(ec&&(ec.t-=dt)<=0){
    R.eclipse=null;
    if(Math.hypot(p.x-ec.x,p.y-ec.y)>ec.r){hurtPlayer(ec.dmg);text(p.x,p.y-44,'caught in the dark!','#ff6b7d',15)}
    else text(p.x,p.y-44,'safe in the light','#ffe9a8',15);
    G.fx.push({kind:'pop',x:ARENA.x,y:ARENA.y,r:ARENA.r*.62,life:.22,max:.22});ring(ec.x,ec.y,ec.r,'#ffe9a8',.5);juice(12,.08);
  }
  // auto-cast the ultimate on the raid boss (the core only does this for the stage boss)
  if(e&&!e.dead&&!rd.won&&G.auto&&G.ult>=G.hero.ultNeed&&Math.hypot(e.x-p.x,e.y-p.y)<280&&typeof tryCast==='function')tryCast(4,true);

  // Fusion Orb flies to the hero
  const o=R.orb;
  if(o){o.t+=dt;
    if(o.t>.6){const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy)||1,v=Math.max(420,d*5);o.x+=dx/d*v*dt;o.y+=dy/d*v*dt;if(d<p.r+12||o.t>2.2)grantOrb()}
    if(Math.random()<.6)G.fx.push({x:o.x+rand(-6,6),y:o.y+rand(-6,6),vx:rand(-20,20),vy:rand(-20,20),life:.4,max:.4,c:'rgba(255,211,77,.8)',size:3})}
  // win: sweep up the loot, then go home
  if(rd.won){for(const g of G.gems)g.mag=true;if((rd.outro-=dt)<=0)exitRaid()}
}

/* ---------- Win and reward ---------- */
function grantOrb(){
  const o=R.orb;if(!o)return;R.orb=null;
  const ev=o.ev,p=G.p,sk=G.hero.skills[ev.i];
  G.evo[ev.i]=true;R.reward='Fusion Orb: '+(sk?sk.name+' evolved into ':'')+ev.name+'!';
  banner('FUSION ORB! '+(sk?sk.name+' evolves into ':'Evolved: ')+ev.name+'. '+ev.d,6);
  text(p.x,p.y-50,'FUSION: '+ev.name+'!','#ffd34d',22);ring(p.x,p.y,120,'#ffd34d',.6);ring(p.x,p.y,70,'#fff',.4);puff(p.x,p.y,'#ffd34d',24,240,4);juice(12,.12);
  updateSkillBar(true);
}
function grantXP(){
  const p=G.p;
  const keep=G.xp;G.xp=0;addXP(G.need);addXP(G.need);G.xp=Math.min(keep,G.need-1);       // exactly two levels whatever the XP curve is; progress kept
  G.xpMul=2;R.xpT=60;R.reward='Blessing: +2 levels and double XP for 60 s.';
  banner('BLESSING OF THE KAMPUNG! +2 levels now, and double XP for 60 s.',6);
  text(p.x,p.y-50,'+2 LEVELS · XP x2','#7fe0ff',22);ring(p.x,p.y,120,'#7fe0ff',.6);puff(p.x,p.y,'#7fe0ff',24,240,4);
}
function win(e){
  const rd=G.raid;rd.won=true;rd.outro=2.6;G.kills++;
  for(const s of G.enemies)if(s!==e&&!s.dead){s.dead=true;puff(s.x,s.y,'#5a2a8a',8,120,4)}
  G.eprojs=[];R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;
  G.fx.push({kind:'pop',x:e.x,y:e.y,r:e.r*3,life:.25,max:.25});
  ring(e.x,e.y,120,'#fff',.5);ring(e.x,e.y,220,PURPLE,.7);ring(e.x,e.y,340,RED,.9);
  puff(e.x,e.y,'#1a0c2a',30,320,7);puff(e.x,e.y,PURPLE,24,260,4);puff(e.x,e.y,'#fff',12,180,3);
  text(e.x,e.y-e.r-20,'HANTU RAYA BANISHED','#ffd34d',24);juice(20,.28);hideBossBar();
  for(let i=0;i<30;i++)dropCoin(e.x+rand(-90,90),e.y+rand(-90,90),1);
  const pool=((typeof EVOS!=='undefined'&&EVOS[G.hero.id])||[]).filter(ev=>!G.evo[ev.i]);
  const roll=R.force?R.force==='orb':Math.random()<.6;
  if(pool.length&&roll){R.orb={x:e.x,y:e.y,t:0,ev:pool[Math.random()*pool.length|0]};banner('Hantu Raya is banished! It leaves a Fusion Orb behind...',3)}
  else grantXP();
}

/* ---------- Hooks ---------- */
HOOKS.newGame.push(g=>{R=fresh();g.raid=null;g.raidBoss=null;g.xpMul=1});
HOOKS.update.push(dt=>{
  if(!R)return;
  if(R.xpT>0&&(R.xpT-=dt)<=0){R.xpT=0;G.xpMul=1;banner('The double XP blessing fades.',2.5)}
  if(G.raid)updateRaid(dt);else updatePortal(dt);
});
HOOKS.kill.push(e=>{if(!R||!G.raid||e!==R.boss)return;win(e);return true});

/* ---------- Drawing: arena ---------- */
function drawGround(cx,cy,under){
  const A=ARENA,t=G.t,vw=W/SC+80,vh=H/SC+80,p2=R.boss&&R.boss.p2;
  if(under){
    ctx.fillStyle='#07040d';ctx.fillRect(cx-vw/2,cy-vh/2,vw,vh);
    const g=ctx.createRadialGradient(A.x,A.y,40,A.x,A.y,A.r);g.addColorStop(0,p2?'#3d1746':'#36195c');g.addColorStop(.7,'#24103f');g.addColorStop(1,'#150a26');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(A.x,A.y,A.r,0,TAU);ctx.fill();
  }else{                                       // fallback when the ground pass is not available: tint from above
    ctx.fillStyle='rgba(7,4,13,.9)';ctx.beginPath();ctx.rect(cx-vw/2,cy-vh/2,vw,vh);ctx.arc(A.x,A.y,A.r,0,TAU);ctx.fill('evenodd');
    ctx.fillStyle='rgba(70,24,130,.3)';ctx.beginPath();ctx.arc(A.x,A.y,A.r,0,TAU);ctx.fill();
  }
  ctx.save();ctx.beginPath();ctx.arc(A.x,A.y,A.r,0,TAU);ctx.clip();
  // rune circles on the floor
  ctx.strokeStyle='rgba(199,125,255,.13)';ctx.lineWidth=2;
  for(const k of[.3,.62,.9]){ctx.beginPath();ctx.arc(A.x,A.y,A.r*k,0,TAU);ctx.stroke()}
  ctx.save();ctx.translate(A.x,A.y);ctx.rotate(t*.05);
  for(let k=0;k<12;k++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(A.r*.3,0);ctx.lineTo(A.r*.62,0);ctx.stroke();ctx.fillStyle='rgba(199,125,255,.12)';ctx.beginPath();ctx.arc(A.r*.76,0,7,0,TAU);ctx.fill()}
  ctx.restore();
  // Shadow Lunge lane
  const L=R.lane;
  if(L){ctx.save();ctx.translate(L.x,L.y);ctx.rotate(Math.atan2(L.dy,L.dx));
    ctx.fillStyle='rgba(255,40,70,.16)';ctx.fillRect(0,-L.w,L.len,L.w*2);
    ctx.fillStyle='rgba(255,40,70,.4)';ctx.fillRect(0,-L.w,L.len*L.k,L.w*2);
    ctx.strokeStyle='rgba(255,90,110,.95)';ctx.lineWidth=3;ctx.strokeRect(0,-L.w,L.len,L.w*2);
    ctx.fillStyle='rgba(255,200,210,.8)';for(let k=1;k<=3;k++){const ax=L.len*k/4;ctx.beginPath();ctx.moveTo(ax+14,0);ctx.lineTo(ax-8,-13);ctx.lineTo(ax-8,13);ctx.fill()}
    ctx.restore()}
  // Shadow Slam circles: the inner disc fills up, then it explodes
  for(const q of R.tele){
    const k=cl(1-q.t/q.max,0,1),on=q.t<=q.max;
    ctx.fillStyle=on?'rgba(255,40,70,.17)':'rgba(255,40,70,.07)';ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,TAU);ctx.fill();
    if(on){ctx.fillStyle=`rgba(255,40,70,${.3+.3*k})`;ctx.beginPath();ctx.arc(q.x,q.y,q.r*k,0,TAU);ctx.fill()}
    ctx.strokeStyle=on?'rgba(255,100,120,.95)':'rgba(255,100,120,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,TAU);ctx.stroke();
  }
  // shade summon marks
  for(const s of R.spawns){const k=cl(1-s.t/s.max,0,1);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(t*6);ctx.strokeStyle=`rgba(199,125,255,${.4+.5*k})`;ctx.lineWidth=3;
    for(let j=0;j<3;j++){ctx.rotate(TAU/3);ctx.beginPath();ctx.arc(0,0,26-16*k,0,1.4);ctx.stroke()}
    ctx.fillStyle=`rgba(20,8,36,${.7*k})`;ctx.beginPath();ctx.arc(0,0,12*k,0,TAU);ctx.fill();ctx.restore()}
  // Gerhana: darkness closes in, one circle of light stays
  const ec=R.eclipse;
  if(ec){const k=cl(1-ec.t/ec.max,0,1);
    ctx.fillStyle=`rgba(0,0,0,${.2+.5*k})`;ctx.beginPath();ctx.rect(A.x-A.r,A.y-A.r,A.r*2,A.r*2);ctx.arc(ec.x,ec.y,ec.r,0,TAU);ctx.fill('evenodd');
    const g=ctx.createRadialGradient(ec.x,ec.y,8,ec.x,ec.y,ec.r);g.addColorStop(0,'rgba(255,240,190,.5)');g.addColorStop(1,'rgba(255,220,130,.14)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(ec.x,ec.y,ec.r,0,TAU);ctx.fill();
    ctx.strokeStyle='#ffe9a8';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ec.x,ec.y,ec.r,0,TAU);ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(ec.x,ec.y,ec.r+9,-Math.PI/2,-Math.PI/2+TAU*(1-k));ctx.stroke();
    ctx.fillStyle='#ffe9a8';ctx.font='700 15px Chakra Petch, sans-serif';ctx.textAlign='center';ctx.fillText('STAND IN THE LIGHT',ec.x,ec.y+ec.r+28)}
  ctx.restore();
}
function drawArenaTop(){
  const A=ARENA,t=G.t,p2=R.boss&&R.boss.p2,c=p2?'#ff4d6d':PURPLE;
  ctx.save();
  ctx.shadowColor=c;ctx.shadowBlur=26;ctx.strokeStyle=c;ctx.globalAlpha=.75+.2*Math.sin(t*3);ctx.lineWidth=5;ctx.beginPath();ctx.arc(A.x,A.y,A.r,0,TAU);ctx.stroke();
  ctx.shadowBlur=0;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.setLineDash([14,18]);ctx.lineDashOffset=-t*30;ctx.beginPath();ctx.arc(A.x,A.y,A.r+12,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
  const o=R.orb;
  if(o){const b=Math.sin(t*8)*3;ctx.save();ctx.shadowColor='#ffd34d';ctx.shadowBlur=24;ctx.fillStyle='rgba(255,211,77,.3)';ctx.beginPath();ctx.arc(o.x,o.y,22+b,0,TAU);ctx.fill();
    ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.arc(o.x,o.y,12,0,TAU);ctx.fill();ctx.fillStyle='#fff8d6';ctx.beginPath();ctx.arc(o.x-3,o.y-3,5,0,TAU);ctx.fill();
    ctx.strokeStyle='#7fe0ff';ctx.lineWidth=2.5;ctx.shadowBlur=0;ctx.translate(o.x,o.y);ctx.rotate(t*4);ctx.beginPath();ctx.ellipse(0,0,18,7,0,0,TAU);ctx.stroke();ctx.rotate(TAU/4);ctx.strokeStyle='#ff9b3d';ctx.beginPath();ctx.ellipse(0,0,18,7,0,0,TAU);ctx.stroke();ctx.restore()}
}
// Ground pass: the core has no "draw under the ghosts" hook, so wrap its background painter. Falls back to a tint drawn from above.
let under=false;
try{if(typeof drawWorldBg==='function'){const orig=drawWorldBg;drawWorldBg=function(cx,cy){if(G&&G.raid&&R)drawGround(cx,cy,true);else orig(cx,cy)};under=true}}catch(_){under=false}

function drawPortal(){
  const q=R.portal;if(!q)return;const t=G.t;
  if(q.life<8&&Math.floor(t*8)%2)return;
  const grow=cl((q.max-q.life)/.6,0,1),r=40*grow;
  ctx.save();ctx.translate(q.x,q.y);
  const g=ctx.createRadialGradient(0,0,4,0,0,r*1.9+1);g.addColorStop(0,'rgba(199,125,255,.5)');g.addColorStop(1,'rgba(199,125,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.9,0,TAU);ctx.fill();
  ctx.scale(1,.82);
  ctx.fillStyle='#0b0416';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
  ctx.lineCap='round';
  for(let k=0;k<5;k++){const rad=r*(1-k*.17),a=t*(2.4+k*.7)*(k%2?-1:1);ctx.strokeStyle=['#c77dff','#9d4edd','#e0aaff','#7b2cbf','#f3d9ff'][k];ctx.lineWidth=5-k*.7;
    for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(0,0,rad,a+j*TAU/3,a+j*TAU/3+1.3);ctx.stroke()}}
  ctx.restore();
  ctx.fillStyle='#e0aaff';ctx.font='700 13px Chakra Petch, sans-serif';ctx.textAlign='center';ctx.fillText('SHADOW PORTAL · '+Math.ceil(q.life)+'s',q.x,q.y-r-16);
}
HOOKS.drawWorld.push(()=>{
  if(!R)return;
  if(G.raid){if(!under)drawGround(G.p.x,G.p.y,false);drawArenaTop()}
  else drawPortal();
});

/* ---------- Drawing: screen space ---------- */
function pill(x,y,s,c){ctx.font='700 14px Chakra Petch, sans-serif';const w=ctx.measureText(s).width+20;ctx.fillStyle='rgba(10,18,24,.78)';rr(x,y,w,26,6);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=c;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(s,x+10,y+14);ctx.textBaseline='alphabetic'}
HOOKS.drawScreen.push(()=>{
  if(!R)return;
  ctx.save();
  if(R.xpT>0)pill(14,104,'XP x2 · '+Math.ceil(R.xpT)+'s','#7fe0ff');
  const q=R.portal;
  if(q&&!G.raid){
    const p=G.p,dx=(q.x-p.x)*SC,dy=(q.y-p.y)*SC,d=Math.hypot(q.x-p.x,q.y-p.y);
    if(!(Math.abs(dx)<W/2-50&&dy>-(H/2-110)&&dy<H/2-100)){
      const mx=Math.max(40,W/2-52),my=Math.max(40,dy<0?H/2-150:H/2-130);
      const k=Math.min(mx/Math.max(1e-6,Math.abs(dx)),my/Math.max(1e-6,Math.abs(dy)));
      const ax=W/2+dx*k,ay=H/2+dy*k,a=Math.atan2(dy,dx),pulse=1+.12*Math.sin(G.t*7);
      ctx.translate(ax,ay);
      ctx.fillStyle='rgba(199,125,255,.22)';ctx.beginPath();ctx.arc(0,0,30*pulse,0,TAU);ctx.fill();
      ctx.save();ctx.rotate(a);ctx.scale(pulse,pulse);ctx.fillStyle=PURPLE;ctx.strokeStyle='#1b0b2e';ctx.lineWidth=3;ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(-12,-15);ctx.lineTo(-5,0);ctx.lineTo(-12,15);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
      const s='PORTAL '+Math.round(d/10)+' m · '+Math.ceil(q.life)+'s';
      ctx.font='700 13px Chakra Petch, sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(10,6,18,.9)';
      const lx=cl(0,70-ax,W-70-ax),ly=ay>H/2?-38:46;ctx.strokeText(s,lx,ly);ctx.fillStyle='#f0dcff';ctx.fillText(s,lx,ly);
    }
  }
  ctx.restore();
});

/* ---------- Drawing: ghosts ---------- */
GHOST_DRAW.raya=e=>{
  const t=G.t,fl=e.flash>0,p2=e.p2,s=e.r/40,glow=p2?RED:'#a15cff';
  const fade=e.state==='intro'?cl(1-e.st/1.6,0,1):1;
  ctx.translate(e.x,e.y+Math.sin(t*1.8)*5-6);ctx.scale(s,s);ctx.globalAlpha*=.15+.85*fade;
  // aura
  const ar=108+Math.sin(t*3)*7,g=ctx.createRadialGradient(0,0,18,0,0,ar);
  g.addColorStop(0,p2?'rgba(255,40,80,.36)':'rgba(140,70,255,.32)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,ar,0,TAU);ctx.fill();
  for(let k=0;k<8;k++){const a=t*.9+k*TAU/8,w=11+Math.sin(t*2+k)*4;ctx.fillStyle='rgba(18,7,32,.5)';ctx.beginPath();ctx.arc(Math.cos(a)*54,Math.sin(a)*46+4,w,0,TAU);ctx.fill()}
  // casting cue
  const c=e.cast;
  if(c){const k=cl(c.t/c.max,0,1);ctx.save();ctx.strokeStyle=c.name==='ring'||c.name==='summon'?PURPLE:c.name==='eclipse'?'#ffe9a8':RED;ctx.lineWidth=4;ctx.globalAlpha*=.8;ctx.beginPath();ctx.arc(0,0,130-80*k,0,TAU);ctx.stroke();ctx.restore()}
  // body: broad shoulders, long arms, tattered hem
  const sway=Math.sin(t*2.2)*3;
  ctx.fillStyle=fl?'#fff':'#0a0512';ctx.strokeStyle=glow;ctx.lineWidth=2;ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(-18,-36);ctx.quadraticCurveTo(-46,-36,-50,-12);ctx.lineTo(-58+sway,20);ctx.lineTo(-52+sway,34);ctx.lineTo(-48+sway,22);ctx.lineTo(-44+sway,34);ctx.lineTo(-36,4);ctx.lineTo(-36,44);
  for(let k=0;k<=8;k++)ctx.lineTo(-36+k*9,44+(k%2?12:0)+Math.sin(t*5+k)*3);
  ctx.lineTo(36,4);ctx.lineTo(44-sway,34);ctx.lineTo(48-sway,22);ctx.lineTo(52-sway,34);ctx.lineTo(58-sway,20);ctx.lineTo(50,-12);ctx.quadraticCurveTo(46,-36,18,-36);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha*=.55;ctx.stroke();ctx.restore();
  // head with a ragged crown of shadow
  ctx.beginPath();ctx.arc(0,-48,18,0,TAU);ctx.fill();
  ctx.beginPath();for(let k=0;k<5;k++){const hx=-16+k*8;ctx.moveTo(hx-4,-60);ctx.lineTo(hx+Math.sin(t*4+k)*2,-74-(k%2?0:6)-(p2?6:0));ctx.lineTo(hx+4,-60)}ctx.fill();
  // eyes
  ctx.shadowColor=RED;ctx.shadowBlur=p2?24:14;ctx.fillStyle=fl?'#400':p2?'#ff5a3d':RED;
  for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*7.5,-49,p2?6:5,p2?3.4:2.6,sx*.35,0,TAU);ctx.fill()}
  if(p2){ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(-9,-38);for(let k=1;k<=6;k++)ctx.lineTo(-9+k*3,-38+(k%2?4:0));ctx.lineTo(9,-38);ctx.closePath();ctx.fill()}
  ctx.shadowBlur=0;
};
GHOST_DRAW.shade=e=>{
  const t=G.t,fl=e.flash>0,b=Math.sin(t*9+e.phase)*1.5,k=cl((t-(e.born||0))/.4,0,1);
  ctx.translate(e.x,e.y+b);ctx.globalAlpha*=.3+.7*k;
  ctx.fillStyle='rgba(170,100,255,.3)';ctx.beginPath();ctx.arc(0,-2,22,0,TAU);ctx.fill();
  ctx.fillStyle=fl?'#fff':'#0d0618';ctx.strokeStyle='rgba(215,160,255,.95)';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(-11,-2);ctx.quadraticCurveTo(-12,-12,0,-12);ctx.quadraticCurveTo(12,-12,11,-2);ctx.lineTo(11,10);
  for(let j=0;j<=4;j++)ctx.lineTo(11-j*5.5,10+(j%2?5:0)+Math.sin(t*8+j+e.phase)*1.5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(0,-13,7.5,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=fl?'#400':RED;ctx.fillRect(-4.5,-15,3,2.5);ctx.fillRect(1.5,-15,3,2.5);
};

// debug / test handle
window.__raid={get state(){return R},ARENA,spawnPortal:()=>{if(G&&R&&!G.raid)spawnPortal()},enter:()=>{if(G&&R)enterRaid()},force:v=>{if(R)R.force=v}};
})();
