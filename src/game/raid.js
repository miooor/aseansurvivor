import {inLiaSmoke} from './heroes/lia.js';
import {applyEvolution} from './blessing-picker.js';
import {inDirectedLine} from './geometry.js';

export function installRaid(api){
const {rand,visualRand=rand,lootRoll=()=>Math.random(),GHOSTS,TAU,banner,juice,puff,$,makeGhost,showBossBar,ring,hideBossBar,each,text,hurtPlayer,tryCast,updateSkillBar,addXP,dropCoin,EVOS,HOOKS}=api;

const ARENA={x:60000,y:60000,r:520};
const STASH=['enemies','gems','equipmentDrops','zones','eprojs','durians','pups','nightHazards'];
const PURPLE='#c77dff',RED='#ff2a4a';
const cl=(v,a,b)=>v<a?a:v>b?b:v;
let R=null;                       // module state, rebuilt on every new game
const fresh=()=>({portalAt:rand(50,110),spawned:false,portal:null,boss:null,tele:[],spawns:[],volleys:[],lane:null,eclipse:null,orb:null,xpT:0,reward:'',force:null});

/* ---------- Ghost types ---------- */
GHOSTS.raya={hp:3000,spd:72,r:40,dmg:14,xp:0};
GHOSTS.shade={hp:34,spd:104,r:12,dmg:7,xp:2};

/* ---------- Portal ---------- */
function spawnPortal(){
  const {p,world}=api.G,start=rand(0,TAU);
  let portal;
  for(let radius=rand(650,790);!portal&&radius>100;radius-=140){
    for(let i=0;i<16;i++){
      const angle=start+i*TAU/16,x=p.x+Math.cos(angle)*radius,y=p.y+Math.sin(angle)*radius;
      if(world.walkable(x,y,40)){portal={x,y};break}
    }
  }
  R.spawned=true;R.portal={...(portal||api.safePoint(p.x,p.y,40)),life:60,max:60};
  banner('A Spirit Rift has opened nearby.',5);
  juice(6);api.audio.cue('portal');
}
function updatePortal(dt){
  if(!R.spawned&&api.G.clock>=R.portalAt){
    if(api.G.boss||api.G.won)R.spawned=true;        // the stage boss is out: no raid this run
    else spawnPortal();
  }
  const q=R.portal;if(!q)return;
  if(api.eventActive())return;
  q.life-=dt;
  if(Math.random()<.3){const a=visualRand(0,TAU);api.G.fx.push({x:q.x+Math.cos(a)*44,y:q.y+Math.sin(a)*44,vx:-Math.cos(a)*50,vy:-Math.sin(a)*50,life:.7,max:.7,c:'rgba(199,125,255,.7)',size:3})}
  if(q.life<=0){R.portal=null;puff(q.x,q.y,PURPLE,20,160,4);banner('The shadow portal fades away.',2.5);return}
  if(!api.G.over&&!api.G.won&&Math.hypot(q.x-api.G.p.x,q.y-api.G.p.y)<34+api.G.p.r)enterRaid();
}

/* ---------- Enter / leave ---------- */
function enterRaid(){
  if(!api.G||api.G.raid||api.G.over||api.G.won||api.G.paused||api.G.choosing||api.G.lootModal||api.eventActive())return;
  const p=api.G.p,stash={};
  for(const k of STASH){stash[k]=api.G[k];api.G[k]=[]}
  api.G.raid={t:0,entry:{x:p.x,y:p.y},stash,goal:$('goal').textContent,outro:0,won:false};
  R.portal=null;R.spawned=true;R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;R.orb=null;
  puff(p.x,p.y,PURPLE,24,200,4);
  p.nightStatus={};
  p.x=ARENA.x;p.y=ARENA.y+250;p.vx=p.vy=0;p.dash=null;p.invuln=Math.max(p.invuln,1.2);
  const hp=600+300*api.G.level;
  const e=makeGhost('raya',ARENA.x,ARENA.y-150);
  Object.assign(e,{boss:true,raid:true,name:'Hantu Raya',hp,maxHp:hp,ai:rayaAI,state:'intro',st:1.6,next:1.2,step:0,p2:false,cast:null});
  api.G.raidBoss=e;R.boss=e;showBossBar('Hantu Raya');
  $('goal').textContent='Raid: defeat Hantu Raya';
  banner('Hantu Raya, the great shadow that wears its master\'s shape. Red circles mean MOVE.',5);
  ring(p.x,p.y,90,PURPLE,.5);juice(12,.12);api.audio.cue('raid');
}
function exitRaid(){
  const rd=api.G.raid,p=api.G.p,left=api.G.gems;
  for(const k of STASH)api.G[k]=rd.stash[k];
  p.x=rd.entry.x;p.y=rd.entry.y;p.vx=p.vy=0;p.dash=null;p.invuln=Math.max(p.invuln,1.5);
  for(const g of left)if(!g.got){g.x=p.x+rand(-30,30);g.y=p.y+rand(-30,30);g.mag=true;api.G.gems.push(g)}   // nothing earned is left behind
  if(R.orb)grantOrb();
  api.G.raid=null;api.G.raidBoss=null;R.boss=null;R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;
  hideBossBar();if(api.G.boss&&!api.G.boss.dead)showBossBar(api.G.boss.name||'Pontianak');
  $('goal').textContent=rd.goal;
  each(p.x,p.y,180,(e,dx,dy)=>{if(e.boss||e.type==='body')return;const l=Math.hypot(dx,dy)||1;e.kvx+=dx/l*520;e.kvy+=dy/l*520;e.stun=Math.max(e.stun,.8)});
  ring(p.x,p.y,180,PURPLE,.5);puff(p.x,p.y,PURPLE,24,220,4);juice(10,.08);
  banner('Back in the kampung. '+R.reward,4);
}

/* ---------- Hantu Raya AI ---------- */
const STOP={tx:0,ty:0,sp:0};
const inArena=(x,y,pad)=>{const dx=x-ARENA.x,dy=y-ARENA.y,d=Math.hypot(dx,dy)||1,m=ARENA.r-pad;return d>m?[ARENA.x+dx/d*m,ARENA.y+dy/d*m]:[x,y]};
function rayaAI(e,dt,info){
  const p=api.G.p;e.phase+=dt;
  if(api.G.raid.won)return STOP;
  if(!e.p2&&e.hp<=e.maxHp*.5&&e.state!=='intro'){
    e.p2=true;e.state='roar';e.st=1.3;e.step=0;e.dmg=GHOSTS.raya.dmg;R.lane=null;e.cast={name:'roar',t:0,max:1.3};
    banner('Hantu Raya is ENRAGED! Shadow bolts fly, and when the eclipse comes, stand in the light.',5);api.audio.cue('enrage');
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
      api.G.fx.push({x:e.x,y:e.y,vx:0,vy:0,life:.3,max:.3,c:'rgba(30,10,50,.7)',size:26});
      if(e.st<=0||Math.hypot(e.x-ARENA.x,e.y-ARENA.y)>ARENA.r-e.r-2){e.state='chase';e.dmg=GHOSTS.raya.dmg;R.lane=null;ring(e.x,e.y,70,PURPLE,.3);juice(7,.04);return STOP}
      return{tx:L.dx,ty:L.dy,sp:680}}
  }
  if((e.next-=dt)<=0)return startAbility(e,info),STOP;
  return{tx:info.tx,ty:info.ty,sp:e.spd*(e.p2?1.3:1)*(info.dl<e.r+p.r-3?0:1)};
}
const ROT1=['slam','lunge','slam','summon'],ROT2=['ring','slam','eclipse','lunge','summon'];
function startAbility(e,info){
  const p=info.target,rot=e.p2?ROT2:ROT1;let ab=rot[e.step++%rot.length];
  if(ab==='summon'&&api.G.enemies.filter(s=>s.type==='shade'&&!s.dead).length>=6)ab='slam';
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
    R.lane={x:e.x,y:e.y,dx:info.tx,dy:info.ty,len:Math.min(560,info.dl+170),w:e.r+10,k:0,wind,hit:false};
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
  const rd=api.G.raid,p=api.G.p,e=R.boss;rd.t+=dt;
  // arena wall
  {const dx=p.x-ARENA.x,dy=p.y-ARENA.y,d=Math.hypot(dx,dy),m=ARENA.r-p.r;if(d>m){p.x=ARENA.x+dx/d*m;p.y=ARENA.y+dy/d*m;if(p.dash)p.dash.t=0}}
  for(const s of api.G.enemies){if(s.dead)continue;const[x,y]=inArena(s.x,s.y,s.r);s.x=x;s.y=y}
  for(const q of api.G.eprojs)if(Math.hypot(q.x-ARENA.x,q.y-ARENA.y)>ARENA.r)q.life=0;
  if(Math.random()<.25){const a=visualRand(0,TAU),d=visualRand(0,ARENA.r);api.G.fx.push({x:ARENA.x+Math.cos(a)*d,y:ARENA.y+Math.sin(a)*d,vx:visualRand(-8,8),vy:visualRand(-30,-12),life:1.2,max:1.2,c:'rgba(199,125,255,.35)',size:2.5})}

  // Shadow Slam circles
  for(const q of R.tele){
    if((q.t-=dt)>0)continue;
    if(Math.hypot(p.x-q.x,p.y-q.y)<q.r+p.r*.4)hurtPlayer(q.dmg,'skill',inLiaSmoke(api.G,e));
    ring(q.x,q.y,q.r,RED,.35);puff(q.x,q.y,'#3a1030',14,220,5);puff(q.x,q.y,RED,8,160,3);juice(8,.03);
  }
  R.tele=R.tele.filter(q=>q.t>0);
  // Shadow Lunge: the drawn lane is the hitbox, not just body contact. Test the
  // ground the boss has actually swept so the hit lands as it passes through.
  const L=R.lane;
  if(e&&e.state==='lunge'&&L&&!L.hit&&!e.dead){
    const travelled=(e.x-L.x)*L.dx+(e.y-L.y)*L.dy;
    if(travelled>0&&inDirectedLine(p,L.x,L.y,L.dx,L.dy,travelled,2*L.w)){
      L.hit=true;hurtPlayer(e.dmg,'skill',inLiaSmoke(api.G,e));text(p.x,p.y-42,'SHADOW LUNGE!',RED,16);juice(9,.05);
    }
  }
  // shade summons
  for(const s of R.spawns){
    if((s.t-=dt)>0)continue;
    const sh=makeGhost('shade',s.x,s.y);sh.raid=true;sh.hp=sh.maxHp=30+4*api.G.level;sh.born=api.G.t;puff(s.x,s.y,'#5a2a8a',10,120,4);
  }
  R.spawns=R.spawns.filter(s=>s.t>0);
  // projectile rings
  for(const v of R.volleys){
    if((v.t-=dt)>0||!e||e.dead)continue;
    const n=14,sp=175;for(let k=0;k<n;k++){const a=(k+v.off)/n*TAU+e.phase*.3;api.enemyProjectile(e,{x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7,dmg:9,life:6,c:PURPLE})}
    ring(e.x,e.y,80,PURPLE,.35);juice(5);
  }
  R.volleys=R.volleys.filter(v=>v.t>0);
  // Gerhana: the only safe place is the light
  const ec=R.eclipse;
  if(ec&&(ec.t-=dt)<=0){
    R.eclipse=null;
    if(Math.hypot(p.x-ec.x,p.y-ec.y)>ec.r){hurtPlayer(ec.dmg,'skill',inLiaSmoke(api.G,e));text(p.x,p.y-44,'caught in the dark!','#ff6b7d',15)}
    else text(p.x,p.y-44,'safe in the light','#ffe9a8',15);
    api.G.fx.push({kind:'pop',x:ARENA.x,y:ARENA.y,r:ARENA.r*.62,life:.22,max:.22});ring(ec.x,ec.y,ec.r,'#ffe9a8',.5);juice(12,.08);
  }
  // auto-cast the ultimate on the raid boss (the core only does this for the stage boss)
  if(e&&!e.dead&&!rd.won&&api.G.hero.id!=='vanna'&&api.G.auto&&api.G.ult>=api.G.hero.ultNeed&&Math.hypot(e.x-p.x,e.y-p.y)<280&&typeof tryCast==='function')tryCast(4,true);

  // Fusion Orb flies to the hero
  const o=R.orb;
  if(o){o.t+=dt;
    if(o.t>.6){const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy)||1,v=Math.max(420,d*5);o.x+=dx/d*v*dt;o.y+=dy/d*v*dt;if(d<p.r+12||o.t>2.2)grantOrb()}
    if(Math.random()<.6)api.G.fx.push({x:o.x+visualRand(-6,6),y:o.y+visualRand(-6,6),vx:visualRand(-20,20),vy:visualRand(-20,20),life:.4,max:.4,c:'rgba(255,211,77,.8)',size:3})}
  // win: sweep up the loot, then go home
  if(rd.won){for(const g of api.G.gems)g.mag=true;if((rd.outro-=dt)<=0)exitRaid()}
}

/* ---------- Win and reward ---------- */
function grantOrb(){
  const o=R.orb;if(!o)return;R.orb=null;
  const ev=o.ev,p=api.G.p,sk=api.G.hero.skills[ev.i];
  applyEvolution(api.G,ev);R.reward='Fusion Orb: '+(sk?sk.name+' evolved into ':'')+ev.name+'!';
  banner('FUSION ORB! '+(sk?sk.name+' evolves into ':'Evolved: ')+ev.name+'. '+ev.d,6);
  text(p.x,p.y-50,'FUSION: '+ev.name+'!','#ffd34d',22);ring(p.x,p.y,120,'#ffd34d',.6);ring(p.x,p.y,70,'#fff',.4);puff(p.x,p.y,'#ffd34d',24,240,4);juice(12,.12);
  updateSkillBar(true);
}
function grantXP(){
  const p=api.G.p;
  const keep=api.G.xp;api.G.xp=0;addXP(api.G.need);addXP(api.G.need);api.G.xp=Math.min(keep,api.G.need-1);       // exactly two levels whatever the XP curve is; progress kept
  api.G.xpMul=2;R.xpT=60;R.reward='Blessing: +2 levels and double XP for 60 s.';
  banner('BLESSING OF THE KAMPUNG! +2 levels now, and double XP for 60 s.',6);
  text(p.x,p.y-50,'+2 LEVELS · XP x2','#7fe0ff',22);ring(p.x,p.y,120,'#7fe0ff',.6);puff(p.x,p.y,'#7fe0ff',24,240,4);
}
function win(e){
  const rd=api.G.raid;rd.won=true;rd.outro=2.6;api.G.kills++;
  for(const s of api.G.enemies)if(s!==e&&!s.dead){s.dead=true;puff(s.x,s.y,'#5a2a8a',8,120,4)}
  api.G.eprojs=[];R.tele=[];R.spawns=[];R.volleys=[];R.lane=null;R.eclipse=null;
  api.G.fx.push({kind:'pop',x:e.x,y:e.y,r:e.r*3,life:.25,max:.25});
  ring(e.x,e.y,120,'#fff',.5);ring(e.x,e.y,220,PURPLE,.7);ring(e.x,e.y,340,RED,.9);
  puff(e.x,e.y,'#1a0c2a',30,320,7);puff(e.x,e.y,PURPLE,24,260,4);puff(e.x,e.y,'#fff',12,180,3);
  text(e.x,e.y-e.r-20,'HANTU RAYA BANISHED','#ffd34d',24);juice(20,.28);hideBossBar();api.audio.cue('victory');
  for(let i=0;i<30;i++)dropCoin(e.x+rand(-90,90),e.y+rand(-90,90),1);
  const pool=((typeof EVOS!=='undefined'&&EVOS[api.G.hero.id])||[]).filter(ev=>!api.G.evo[ev.i]);
  const roll=R.force?R.force==='orb':lootRoll()<.6;
  if(pool.length&&roll){R.orb={x:e.x,y:e.y,t:0,ev:pool[lootRoll()*pool.length|0]};banner('Hantu Raya is banished! It leaves a Fusion Orb behind...',3)}
  else grantXP();
}

/* ---------- Hooks ---------- */
HOOKS.newGame.push(g=>{R=fresh();g.raid=null;g.raidBoss=null;g.xpMul=1});
HOOKS.update.push(dt=>{
  if(!R||api.G.practice)return;
  if(R.xpT>0&&(R.xpT-=dt)<=0){R.xpT=0;api.G.xpMul=1;banner('The double XP blessing fades.',2.5)}
  if(api.G.raid)updateRaid(dt);else updatePortal(dt);
});
HOOKS.kill.push(e=>{if(!R||!api.G.raid||e!==R.boss)return;win(e);return true});


return {get state(){return R},ARENA,spawnPortal:()=>{if(api.G&&R&&!api.G.raid)spawnPortal()},enter:()=>{if(api.G&&R)enterRaid()},force:v=>{if(R)R.force=v}};
}
