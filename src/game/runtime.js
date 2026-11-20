import {availableEvolutions, newlyAvailableEvolutions, trackingCue, applyEvolution, skillChanges} from './blessing-picker.js';
import {basicHitDamage, barrierHealing, castCooldown, dawnBolts, dawnPierce, fanReach, exhaustDuration, flybyDuration, hornFear, lanternStun, orbitBeads, rankDamage as rm, spannerBounces} from './skill-ranks.js';
import {SPECIALIZATIONS} from '../content/specializations.js';
import {hasPractice,placePracticeTargets,practicePrompt} from './signature-practice.js';
import {heroArt, menuFlag, menuFrame, menuPortraitPosition} from '../content/hero-art.js';
import {MAX_UPGRADE_RANK, runUpgradeStats, upgradePrice, upgradeRank} from '../content/hero-upgrades';
import {installAsha} from './heroes/asha.js';
import {installMira} from './heroes/mira.js';
import {installDani} from './heroes/dani.js';
import {installVanna} from './heroes/vanna.js';
import {installKeo} from './heroes/keo.js';
import {installNadi} from './heroes/nadi.js';
import {installLia} from './heroes/lia.js';
import {markStageProgress} from '../ui/stage-progress';
import {installHeroWheel} from '../ui/hero-wheel';
import {installUpgradeShop} from '../ui/upgrade-shop';
import {installHunt} from './hunt.js';
import {installCharms} from './charms.js';
import {installWard} from './ward.js';
import {equipmentCastRank,equipmentWalkMultiplier,incomingEquipmentMultiplier,installEquipment} from './equipment.js';
import {installEncounters} from './encounters.js';
import {installJettyGangway} from './jetty-gangway.js';
import {installWauLookout} from './wau-lookout.js';
import {createWorld,stageSignature} from '../content/world.js';
import {STAGES,INTRO,HEROES as BASE_HEROES,PASSIVES,EVOS} from '../content/core.js';
import {EQUIPMENT_SLOTS} from '../content/equipment.js';
import {REGIONAL_GHOSTS,regionalGhost,regionalWindup} from '../content/regional-ghosts.js';
import {BUNIAN_WAYFARER,FOLKLORE_IMPACT} from '../content/folklore-monsters.js';
import {inDirectedLine,overlapsConvexPolygon} from './geometry.js';
import {CAMPAIGN_ROUTES,nextCampaignStage,stageAvailable} from '../content/campaign-routes.js';
import {installHeroes} from './heroes-sea.js';
import {installRaid} from './raid.js';
import {SkillAudio} from './skill-audio.js';
import {installIdentities} from './hero-identities.js';
import {bossPace,NIGHT_WARNING} from './boss-pacing.js';

export function createRuntime(cvs,art){
const HEROES=structuredClone(BASE_HEROES);
const controller=new AbortController();
const audio=new SkillAudio();
let world=createWorld();
const safePoint=(x,y,r=24)=>{
  if(!G?.raid)return world.safePoint(x,y,r);
  if(walkable(x,y,r))return{x,y};
  const a=raid.ARENA,dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy)||1,max=Math.max(0,a.r-r);
  return{x:a.x+dx/d*max,y:a.y+dy/d*max};
};
const moveOnMap=(x,y,toX,toY,r=20)=>G?.raid?safePoint(toX,toY,r):world.moveOnMap(x,y,toX,toY,r);
const routeDirection=(...args)=>world.routeDirection(...args);
// Allow subpixel roundoff at the circular raid wall.
const walkable=(x,y,r=20)=>G?.raid?Math.hypot(x-raid.ARENA.x,y-raid.ARENA.y)<=raid.ARENA.r-r+1e-7:world.walkable(x,y,r);
const clearLine=(a,b,r)=>G?.raid?walkable(a.x,a.y,r??0)&&walkable(b.x,b.y,r??0):world.clearLine(a,b,r);
const listen=(target,event,fn)=>target.addEventListener(event,fn,{signal:controller.signal});


const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const $=id=>document.getElementById(id);
let BOSS_AT=180;


const SAVE_KEY='aseanSurvivor.v1';
const DEFAULT_SAVE={coins:0,owned:['ustaz','rempit'],cleared:[],retainedStages:[],heroUpgrades:{}};
function readSave(fallback){
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!saved||typeof saved!=='object')return DEFAULT_SAVE;
    const save={...DEFAULT_SAVE,...saved};
    if(!Number.isSafeInteger(save.coins)||save.coins<0)save.coins=0;
    if(!Array.isArray(save.owned))save.owned=DEFAULT_SAVE.owned;
    if(!Array.isArray(save.cleared))save.cleared=[];
    // Before KL became stage three, clearing Melaka granted access to Perak.
    if(!Array.isArray(saved.retainedStages))save.retainedStages=save.cleared.includes('melaka')?['perak']:[];
    return save;
  }catch{return fallback}
}
let SAVE=readSave(DEFAULT_SAVE);
function saveGame(next,requireStorage=false){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(next))}
  catch{if(requireStorage)return false}
  SAVE=next;
  return true;
}
async function updateSave(change){
  const transact=()=>{
    SAVE=readSave(SAVE);
    return change(SAVE);
  };
  // All writers share this lock so a run payout cannot replace another tab's purchase.
  return navigator.locks ? navigator.locks.request(SAVE_KEY,transact) : transact();
}
const UNLOCK_ALL=true; // testing: every hero and stage open. Set to false to bring back the shop and stage locks.

const stageIndex=id=>STAGES.findIndex(stage=>stage.id===id);
const routeForStage=(id,preferred)=>CAMPAIGN_ROUTES[preferred].includes(id)?preferred:
  Object.keys(CAMPAIGN_ROUTES).find(route=>CAMPAIGN_ROUTES[route].includes(id));
const stageOpen=(route,id)=>UNLOCK_ALL||stageAvailable(route,id,SAVE);
const bossAt=()=>G.stage.bossAt||BOSS_AT;
let routePick='west';
let stagePick=0;
if(!UNLOCK_ALL)for(const id of CAMPAIGN_ROUTES[routePick])if(stageOpen(routePick,id))stagePick=stageIndex(id);
/* ---------- Module hooks (heroes-sea.js, raid.js plug in here) ---------- */
const HOOKS={newGame:[],update:[],drawWorld:[],drawScreen:[],kill:[],hurt:[],absorb:[],lethal:[],damage:[],hit:[],parry:[],dmgMul:[],cleanup:[],cast:[]};

/* ---------- Heroes ---------- */




/* ---------- Viewport ---------- */
let W=0,H=0,SC=1;
function resize(width,height){W=width;H=height;SC=clamp(Math.min(W,H)/720,.6,1.25)*.78}
resize(innerWidth,innerHeight);
/* ---------- Input ---------- */
const keys=new Set();let mouse={x:0,y:0,t:-99};let joy=null;
listen(window,'keydown',e=>{
  if($('controls').open||$('upgradeShop').open)return;
  const overlay=document.querySelector('.ov[role="dialog"]:not([hidden])');
  if(e.code==='Tab'&&overlay){
    const buttons=[...overlay.querySelectorAll('button:not([hidden]):not(:disabled),select:not(:disabled)')],first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    return;
  }
  if(!G || e.target===$('recipePin'))return;
  if(G.lootModal){if(e.code==='Escape'&&G.lootModal==='inspect')equipment.close();return;}
  if(e.target instanceof Element&&e.target.closest('button,summary')&&['Space','Enter'].includes(e.code))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(G.choosing){if(e.repeat)return;const n=+e.key;if(n>=1&&n<=3)pickUp(n-1);return}
  if(e.code==='Escape'||e.code==='KeyP'){togglePause();return}
  if(G.paused||G.lootModal||G.over)return;
  if(e.code==='KeyT'){toggleAuto();return}
  const map={KeyQ:1,KeyE:2,KeyF:3,KeyR:4,Space:4};
  if(map[e.code])tryCast(map[e.code]);
});
listen(window,'keyup',e=>keys.delete(e.code));
listen(window,'blur',()=>{keys.clear();if(G&&!G.over&&!G.choosing&&!G.paused)togglePause()});
listen(cvs,'mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.t=performance.now()});
listen(cvs,'pointerdown',e=>{
  if(e.pointerType==='mouse')return;
  if(!joy&&e.clientX<W*.6){joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY}}
});
listen(cvs,'pointermove',e=>{if(joy&&e.pointerId===joy.id){joy.x=e.clientX;joy.y=e.clientY}});
const endJoy=e=>{if(joy&&e.pointerId===joy.id)joy=null};
listen(cvs,'pointerup',endJoy);listen(cvs,'pointercancel',endJoy);

/* ---------- Game state ---------- */
let G=null;let heroPick='ustaz';
function newGame(id,si,practice=false){
  if(!art.isHeroPrepared(id))throw Error('Hero artwork is not prepared: '+id);
  if(G)for(const f of HOOKS.cleanup)f();
  for(const id of ['pause','levelup','end'])$(id).hidden=true;
  audio.stop();audio.setPaused(false);
  const h=HEROES[id];if(si===undefined)si=stagePick;const S=STAGES[si];
  const campaignRoute=routeForStage(S.id,routePick);
  SAVE=readSave(SAVE);
  world=createWorld(S.id);
  G={practice:practice?{complete:false}:null,roster:{},world,hero:h,stage:S,si:si,campaignRoute,diff:1+.2*S.tier,pupCd:20,t:0,clock:0,raid:null,coins:0,kills:0,level:1,xp:0,need:12,pending:0,ult:0,
    p:{x:0,y:0,vx:0,vy:0,r:16,hp:h.hp,maxHp:h.hp,face:[1,0],invuln:0,hurt:0,dash:null,exhaust:0,exAcc:0,super:0,slip:false,shield:0},
    upgradeStats:runUpgradeStats(practice?undefined:SAVE.heroUpgrades?.[id]),
    trackedEvolution:null,specialization:null,technique:SPECIALIZATIONS[id].base,
    ranks:[1,1,1,1,1],cds:[0,0,0,0,0],pass:{},
    enemies:[],projs:[],eprojs:[],gems:[],equipmentDrops:[],fx:[],zones:[],texts:[],durians:[],marbles:[],
    exploration:{visited:[],claimed:[],guards:{}},orbit:null,spawnT:1,durianT:9,guliT:4,petalT:0,boss:null,bossSpawned:false,
    shake:0,stop:0,autoMode:SAVE.autoMode|0,auto:AUTO_MODES[SAVE.autoMode|0].n!=='OFF',evo:{},pups:[],pupT:20,kopiT:0,combos:0,events:new Set(),paused:false,choosing:false,over:false,won:false,wonT:0,nextId:1};
  if(!practice&&S.id==='johor'){
    const {x,y}=BUNIAN_WAYFARER;
    G.bunian={...safePoint(x,y),greeted:false};
  }
  for(const f of HOOKS.newGame)f(G);
  equipment.recalculate();G.p.hp=G.p.maxHp;
  if(practice){
    G.auto=false;G.autoMode=AUTO_MODES.length-1;
    placePracticeTargets(G,makeGhost);mouse.t=-Infinity;
  }
  document.body.classList.toggle('practicing',practice);
  $('practiceGuide').hidden=!practice;
  if(practice)$('practiceTitle').textContent=h.identity.name+' practice';
  lastHud={};keys.clear();joy=null;
  document.documentElement.style.setProperty('--hero-accent',h.identity.color);
  buildSkillBar();updateHud();cvs.focus({preventScroll:true});
  $('hudHero').textContent=h.name;
  const row=menuFrame(h.id);
  $('hudPortrait').style.backgroundPosition=menuPortraitPosition(row);
  setSkillArtwork($('skills'),h.id);
  $('hud').hidden=false;$('skills').hidden=false;$('bossbar').hidden=true;const ba=S.bossAt||BOSS_AT,bt=Math.floor(ba/60)+':'+String(ba%60).padStart(2,'0');$('goal').textContent='Survive until '+bt;
  if(practice){$('banner').classList.remove('show');return}
  banner('Stage '+(CAMPAIGN_ROUTES[campaignRoute].indexOf(S.id)+1)+': '+S.name+'. '+S.set+'. Survive until '+bt+(S.coinMul?'. Coins ×'+S.coinMul+'!':'.'),4);
}

/* ---------- Helpers ---------- */
function movementInput(){
  let x=0,y=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))y--;
  if(keys.has('KeyS')||keys.has('ArrowDown'))y++;
  if(keys.has('KeyA')||keys.has('ArrowLeft'))x--;
  if(keys.has('KeyD')||keys.has('ArrowRight'))x++;
  if(joy){
    const dx=joy.x-joy.ox,dy=joy.y-joy.oy,distance=Math.hypot(dx,dy);
    if(distance>8){const strength=Math.min(1,distance/60);x=dx/distance*strength;y=dy/distance*strength}
  }
  const length=Math.hypot(x,y);
  return length>1?[x/length,y/length]:[x,y];
}
function aimDir(){
  const p=G.p;
  if(G.autoAim){const n=nearest(p.x,p.y,500);if(n){const dx=n.x-p.x,dy=n.y-p.y,l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}}
  if(performance.now()-mouse.t<4000){
    const wx=(mouse.x-W/2)/SC,wy=(mouse.y-H/2)/SC,l=Math.hypot(wx,wy);
    if(l>4)return[wx/l,wy/l];
  }
  if(joy||'ontouchstart' in window){const n=nearest(p.x,p.y,420);if(n){const dx=n.x-p.x,dy=n.y-p.y,l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}}
  return p.face;
}
function nearest(x,y,range,skip){
  let best=null,bd=range*range;
  for(const e of G.enemies){if(e.dead||e.type==='body'&&!e.near||skip&&skip.has(e))continue;
    const dx=e.x-x,dy=e.y-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=e}}
  return best;
}
function each(x,y,r,fn){for(const e of G.enemies){if(e.dead)continue;const dx=e.x-x,dy=e.y-y,rr=r+e.r;if(dx*dx+dy*dy<rr*rr)fn(e,dx,dy)}}
function text(x,y,s,c='#fff',size=13){if(G.texts.length>=140)G.texts.shift();G.texts.push({x,y,s:String(s),c,size,life:.7,max:.7})}
function combatNumber(x,y,value,kind){
  const styles={damage:['#fff9e8',25],critical:['#ffe66b',36],incoming:['#ff6c79',28],heal:['#87ffb5',24],dot:['#e9b4ff',19]};
  const [c,size]=styles[kind],lane=(G.numberLane=(G.numberLane||0)+1)%5-2;
  if(G.texts.length>=140)G.texts.shift();
  G.texts.push({x,y,s:(kind==='heal'?'+':'')+Math.round(value),c,size,kind,lane,life:kind==='critical'?1.05:.85,max:kind==='critical'?1.05:.85});
}
function puff(x,y,c,n=6,sp=90,size=3){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(.3,1)*sp;G.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.6),max:.6,c,size})}}
function ring(x,y,r,c,life=.35,flourish){G.fx.push({kind:'ring',...(releaseSlot===undefined?{}:{hero:G.hero.id,slot:releaseSlot}),x,y,r,c,life,max:life,flourish})}
function juice(sh,stop=0){G.shake=Math.max(G.shake,sh);if(stop&&(stop>=.08||G.t>(G.stopUntil||0))){G.stop=Math.max(G.stop,stop);G.stopUntil=G.t+.3}}
function combo(name){const p=G.p;G.combos++;text(p.x,p.y-48,'COMBO: '+name+'!','#7fe0ff',20);ring(p.x,p.y,90,'#7fe0ff',.35);juice(8,.06)}
let bannerT=0;
function banner(s,t=3){const b=$('banner');b.textContent=s;b.classList.add('show');bannerT=t}

// The release scope labels synchronous contacts. Delayed carriers supply their
// own visual slot so a subsequent cast cannot relabel an earlier hit.
let releaseSlot;
function withCastEffects(slot,cast,rank){
  const previous=releaseSlot;
  releaseSlot=slot;
  try{return cast(rank)}finally{releaseSlot=previous}
}
function hit(e,amt,o={}){
  if(e.dead)return;
  if(e.type==='minyak'&&!o.dot&&Math.random()<.3){if(Math.random()<.5)text(e.x,e.y-e.r-4,'slip!','#8fa3a8',12);return}
  let crit=false;
  if(!o.dot&&Math.random()<G.st.crit){amt*=2;crit=true}
  amt*=G.st.dmg;for(const f of HOOKS.dmgMul)amt*=f(e,o);e.hp-=amt;e.flash=.08;if(!o.dot)e.sq=1;if(crit)juice(3,.025);
  for(const f of HOOKS.hit)f(e,o);
  combatNumber(e.x,e.y-e.r-6,amt,o.dot?'dot':crit?'critical':'damage');
  const slot=o.visualSlot??o.slot??releaseSlot;
  if(!o.dot)G.fx.push({kind:'impact',...(o.origin!=='item'&&slot!==undefined?{hero:G.hero.id,slot}:{}),x:e.x,y:e.y-e.r*.5,footY:e.y,r:crit?38:22,a:Math.atan2(e.y-G.p.y,e.x-G.p.x),c:crit?'#ffe66b':G.hero.identity.color,life:.24,max:.24});
  if(crit&&e.type==='pontianak'&&e.pinCd<=0){e.stun=3;e.pinCd=10;banner('Pinned! Like the nail in the old story, she is stunned for 3 s.',3);ring(e.x,e.y,60,'#ffd34d',.5)}
  if(o.kb&&!e.boss&&e.type!=='body'){e.kvx+=o.kb[0];e.kvy+=o.kb[1]}
  if(e.hp<=0)kill(e,{...o,damage:true});
  return true;
}
function kill(e,o={}){
  if(e.dead)return;
  e.dead=true;
  if(G.practice)return;
  for(const f of HOOKS.kill)if(f(e,o)===true)return;
  if(e.elite&&o.damage&&!e.boss&&!G.raid&&!G.over&&!G.won){
    G.equipmentDrops.push({...safePoint(e.x,e.y,G.p.r),event:'elite-'+e.id,
      slot:EQUIPMENT_SLOTS[Math.floor(Math.random()*EQUIPMENT_SLOTS.length)],collectAt:G.t+.65});
  }
  if(e.type==='body'){
    puff(e.x,e.y,'#7c5a6e',10);
    if(e.head&&!e.head.dead){e.head.hp=Math.min(e.head.hp,e.head.maxHp/2);e.head.weak=true;text(e.head.x,e.head.y-26,'body destroyed!','#ffb3c1',13)}
    dropGem(e.x,e.y,3,'ember');return;
  }
  G.kills++;G.fx.push({kind:'pop',x:e.x,y:e.y,r:e.r*1.6,life:.15,max:.15});if(e.type==='minyak')juice(4,.04);if(e.boss)juice(18,.25);
  if(!e.boss)G.ult=Math.min(G.hero.ultNeed,G.ult+1);
  if(!e.boss&&G.pupCd<=0&&G.pups.length<2&&Math.random()<.01){dropPup(e.x,e.y);G.pupCd=25}
  if(!e.boss&&Math.random()<(e.type==='minyak'?.25:.07)*(G.stage.coinMul||1))dropCoin(e.x+rand(-6,6),e.y+rand(-6,6),e.type==='minyak'?2:1);
  puff(e.x,e.y,e.type==='toyol'?'#5fd16a':e.type==='minyak'?'#3a4650':'#d9e4ea',8);
  if(e.type==='penanggal'&&e.body&&!e.body.dead){e.body.dead=true;puff(e.body.x,e.body.y,'#7c5a6e',8)}
  if(e.type==='toyol'&&e.carry>0){for(let i=0;i<Math.min(6,e.carry);i++)dropGem(e.x+rand(-14,14),e.y+rand(-14,14),Math.ceil(e.carry/Math.min(6,e.carry)),'ember');text(e.x,e.y-18,'embers back!','#ff9b3d',13)}
  if(e.boss){G.won=true;for(const f of HOOKS.cleanup)f();G.wonT=2.5;banner(e.name+' is defeated! '+G.stage.name+' is safe.',4);for(let i=0;i<30;i++)dropGem(e.x+rand(-60,60),e.y+rand(-60,60),5,'soul');for(let i=0;i<20;i++)dropCoin(e.x+rand(-70,70),e.y+rand(-70,70),2);hideBossBar()}
  else if(e.type==='pocong'&&Math.random()<.3)dropGem(e.x,e.y,4,'soul');
  else dropGem(e.x,e.y,e.xp,'ember');
}
function showBossBar(name){$('bossbar').hidden=false;$('bossbar').querySelector('.name').textContent=name.toUpperCase()}
function hideBossBar(){$('bossbar').hidden=true}
function dropCoin(x,y,v=1){G.gems.push({x,y,v,kind:'coin',mag:false})}
function dropGem(x,y,v,kind){if(G.gems.length>450){const g=G.gems.shift();G.gems[0]&&(G.gems[0].v+=g.v)}G.gems.push({x,y,v,kind,mag:false})}
function hurtPlayer(a,type='physical'){
  const p=G.p;if(p.invuln>0||p.super>0||p.shield>0||G.over||G.won)return;
  a*=G.upgradeStats.incoming*incomingEquipmentMultiplier(G,type);
  for(const f of HOOKS.hurt){const r=f(a);if(r===false)return;if(typeof r==='number')a=r}
  for(const f of HOOKS.absorb){const r=f(a);if(typeof r==='number')a=Math.max(0,r)}
  if(a>=p.hp)for(const f of HOOKS.lethal){const r=f(a);if(typeof r==='number')a=r;}
  const applied=Math.min(p.hp,Math.max(0,a));
  p.hp-=a;if(applied>0)for(const f of HOOKS.damage)f(applied);p.invuln=Math.max(p.invuln,.35);p.hurt=.2;p.sq=1;juice(7,.05);combatNumber(p.x,p.y-26,a,'incoming');
  if(p.hp<=0){p.hp=0;endGame(false)}
}
// XP curve: gentle early, quadratic mid-game, then +8% per level past 20 so late runs don't drown in level-ups
function xpNeed(L){return Math.floor((8+4*L+.45*L*L)*(L>20?Math.pow(1.08,L-20):1))}
function addXP(v){G.xp+=v;while(G.xp>=G.need){G.xp-=G.need;G.level++;G.need=xpNeed(G.level);G.pending++}}

/* ---------- Skills ---------- */
const CAST={
  ustaz:[
    r=>{const t=nearest(G.p.x,G.p.y,520);if(!t)return false;const n=dawnBolts(r);
      const base=Math.atan2(t.y-G.p.y,t.x-G.p.x);
      for(let k=0;k<n;k++){const a=base+(k-(n-1)/2)*.2;G.projs.push({x:G.p.x,y:G.p.y,vx:Math.cos(a)*470,vy:Math.sin(a)*470,r:6,dmg:basicHitDamage(G.hero,r,G.evo[0]),life:1.4,pierce:dawnPierce(r),hit:new Set(),kind:'nur',hitOptions:{slot:0}})}
      if(G.evo[0]){G.nova=(G.nova||0)+1;if(G.nova%3===0)for(let k=0;k<8;k++){const a=k/8*TAU+G.t;G.projs.push({x:G.p.x,y:G.p.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,r:8,dmg:16*rm(r),life:1.1,pierce:3,hit:new Set(),kind:'nur',hitOptions:{slot:0}})}}},
    r=>{const [ax,ay]=aimDir(),a=Math.atan2(ay,ax),range=fanReach(r),half=G.evo[1]?Math.PI:.62;let smite=0;
      each(G.p.x,G.p.y,range,(e,dx,dy)=>{let d=Math.atan2(dy,dx)-a;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<half){const st=e.stun>0;if(st)smite++;hit(e,G.hero.skills[1].baseDamage*rm(r)*(st?2:1),{kb:[ax*120,ay*120]});e.burnT=2;e.burnSlot=1;e.burnDps=8*rm(r)}});
      if(smite>=1)combo('Smite');
      G.fx.push({kind:'cone',x:G.p.x,y:G.p.y,a,range,half,life:.3,max:.3});juice(6,.05)},
    r=>{G.orbit={t:6+.5*(r-1),n:orbitBeads(r),rad:82,dmg:G.hero.skills[2].baseDamage*rm(r),ang:0};if(G.zones.some(z=>z.kind==='barrier'))combo('Holy Beads')},
    r=>{let embers=0;const R=(190+10*r)*G.technique.radius;each(G.p.x,G.p.y,R,(e,dx,dy)=>{const l=Math.hypot(dx,dy)||1;if(e.burnT>0&&embers<3){embers++;ring(e.x,e.y,22,'#ffcd76',.55,'return')}hit(e,G.hero.skills[3].baseDamage*rm(r),{kb:[dx/l*420,dy/l*420]});if(!e.boss)e.stun=Math.max(e.stun,lanternStun(r,G.technique))});
      const heal=Math.min(G.p.maxHp-G.p.hp,Math.min(3,embers)*4);
      if(heal>0){G.p.hp+=heal;combatNumber(G.p.x,G.p.y-26,heal,'heal')}
      ring(G.p.x,G.p.y,R,'#fff3b0',.45);juice(9,.06)},
    r=>{if(G.orbit)combo('Holy Beads');G.zones.push({kind:'barrier',x:G.p.x,y:G.p.y,r:215,life:8,max:8,dps:G.hero.skills[4].baseDamage*rm(r),heal:barrierHealing(r),acc:0});ring(G.p.x,G.p.y,215,'#fff3b0',.6);juice(12,.1);banner('Benteng Doa',1.5)},
  ],
  rempit:[
    r=>{const t=nearest(G.p.x,G.p.y,460);if(!t)return false;const dx=t.x-G.p.x,dy=t.y-G.p.y,l=Math.hypot(dx,dy)||1;
      G.projs.push({x:G.p.x,y:G.p.y,vx:dx/l*540,vy:dy/l*540,r:7,dmg:basicHitDamage(G.hero,r,G.evo[0]),life:1.2,pierce:1,bounces:spannerBounces(r,G.evo[0]),hit:new Set(),kind:'spanner',hitOptions:{slot:0},spin:0,fire:!!G.evo[0]})},
    r=>{
      const p=G.p;
      if(!G.autoAim){
        const [x,y]=movementInput(),length=Math.hypot(x,y);
        if(length>.1)p.face=[x/length,y/length];
      }
      const [ax,ay]=G.autoAim?aimDir():p.face;
      const fire=p.exhaust>0||!!G.evo[1];
      if(p.exhaust>0)combo('Api Wheelie');
      p.dash={t:G.evo[1]?.32:.22,vx:ax*1250,vy:ay*1250,hit:new Set(),dmg:G.hero.skills[1].baseDamage*rm(r)*(fire?1.5:1),fire};
      p.invuln=Math.max(p.invuln,.45);juice(5);puff(p.x,p.y,'#c9c9c9',10,120,4);
    },
    r=>{G.p.exhaust=exhaustDuration(r);G.p.exDps=G.hero.skills[2].baseDamage*rm(r);G.p.exPatch=G.evo[2]?{radius:G.technique.radius*1.5,life:G.technique.life+1}:G.technique},
    r=>{const sup=G.p.super>0;if(sup)combo('Superhorn');const R=(210+12*r)*(sup?1.6:1);
      const lit=G.zones.filter(z=>z.kind==='fire'&&Math.hypot(z.x-G.p.x,z.y-G.p.y)<=R);
      if(lit.length){
        if(lit.length>=2){
          G.cds[1]=Math.max(0,G.cds[1]-2);
          text(G.p.x,G.p.y-52,'RESTART',G.hero.identity.color,15);
        }
        const spent=new Set(lit),scorched=new Set();
        G.zones=G.zones.filter(z=>!spent.has(z));
        for(const patch of lit){
          ring(patch.x,patch.y,72,'#ff8b46',.42,'ignition');
          each(patch.x,patch.y,72,e=>{if(!scorched.has(e)){scorched.add(e);hit(e,20*rm(r))}});
        }
      }
      each(G.p.x,G.p.y,R,e=>{hit(e,G.hero.skills[3].baseDamage*rm(r)*(sup?3:1));if(!e.boss){e.fear=hornFear(r);if(sup)e.stun=1}});ring(G.p.x,G.p.y,R,'#ffd34d',.4);text(G.p.x,G.p.y-34,'PON PON!','#ffd34d',18);juice(8,.05)},
    r=>{G.p.super=flybyDuration(r);G.p.superDmg=G.hero.skills[4].baseDamage*rm(r);juice(12,.1);banner('Mode Superman!',1.5)},
  ],
};
function tryCast(i,auto){
  if(!G||G.practice?.complete||G.paused||G.choosing||G.lootModal||G.over||i<1||i>4)return;
  if(auto){const ms=AUTO_MODES[G.autoMode].set;if(ms&&!ms.includes(i))return}
  const h=G.hero,s=h.skills[i];
  if(s.ult?G.ult<h.ultNeed:G.cds[i]>0)return;
  G.autoAim=!!auto;
  const rank=equipmentCastRank(G,i,G.ranks[i]);
  try{if(CAST[h.id][i](rank)===false)return}finally{G.autoAim=false}
  if(s.ult)G.ult=0;else G.cds[i]=castCooldown(s,rank,G.st.cd);
}

/* ---------- Auto-cast ---------- */
const AUTO={
  ustaz:{order:[3,1,2,4],when:[null,n=>n(240)>=1&&!(G.cds[3]>0&&G.cds[3]<2.5),n=>n(300)>=3,n=>n(190*G.technique.radius)>=4,n=>n(260)>=12||G.boss&&!G.boss.dead&&n(300)>=1]},
  rempit:{order:[2,1,4,3],when:[null,n=>n(260)>=2,n=>n(320)>=4,n=>n(160)>=4||G.p.super>0&&n(330)>=3,n=>n(300)>=12||G.boss&&!G.boss.dead&&n(300)>=1]},
};
const AUTO_MODES=[{n:'Q+E',set:[1,2]},{n:'Q+F',set:[1,3]},{n:'E+F',set:[2,3]},{n:'ALL',set:null},{n:'OFF',set:[]}];
function autoCast(){
  if(!G.auto)return;const p=G.p,a=AUTO[G.hero.id],pair=AUTO_MODES[G.autoMode].set;
  if(pair){const nr=r=>{let c=0;for(const e of G.enemies){if(e.dead||e.type==='body')continue;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy<r*r)c++}return c};
    if(pair.every(i=>G.cds[i]<=0)&&pair.some(i=>a.when[i](nr)))for(const i of a.order)if(pair.includes(i))tryCast(i,true);return}
  const near=r=>{let c=0;for(const e of G.enemies){if(e.dead||e.type==='body')continue;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy<r*r)c++}return c};
  for(const i of a.order){const s=G.hero.skills[i],ready=s.ult?G.ult>=G.hero.ultNeed:G.cds[i]<=0;if(ready&&a.when[i](near))tryCast(i,true)}
}
function toggleAuto(){if(G.practice)return;const autoMode=G.autoMode=(G.autoMode+1)%AUTO_MODES.length;const m=AUTO_MODES[autoMode];G.auto=m.n!=='OFF';void updateSave(save=>saveGame({...save,autoMode}));
  const nm=i=>G.hero.skills[i].name;
  banner(m.n==='OFF'?'Auto-cast OFF: press Q E F R yourself':m.n==='ALL'?'Auto-cast: all four skills':'Auto combo '+m.n+': '+nm(m.set[0])+' + '+nm(m.set[1])+' fire together. The other skill and the ultimate are yours to press.',3.5);updateAutoBtn()}
function updateAutoBtn(){const b=$('autobtn');if(!b)return;const m=AUTO_MODES[G.autoMode];b.innerHTML='<span>AUTO<br> '+m.n+'</span>';b.classList.toggle('ready',G.auto);b.setAttribute('aria-label','Cycle auto-cast, currently '+m.n);
  for(let i=1;i<5;i++)if(skEls[i])skEls[i].b.classList.toggle('linked',!!m.set&&m.set.includes(i))}

/* ---------- Power-ups ---------- */
const PUPS={
  ketupat:{name:'Ketupat',c:'#9fd36a',d:'Heals 35% HP.',fn:()=>{G.p.hp=Math.min(G.p.maxHp,G.p.hp+G.p.maxHp*.35)}},
  magnet:{name:'Besi Berani',c:'#7fc8ff',d:'Magnet! Sucks in every ember and power-up on the map.',fn:()=>{for(const g of G.gems)g.mag=true;for(const u of G.pups)if(u.type!=='magnet')u.mag=true}},
  mercun:{name:'Mercun',c:'#ff5a4a',d:'Firecrackers hit every ghost on screen.',fn:()=>{const R=Math.hypot(W,H)/(2*SC);each(G.p.x,G.p.y,R,e=>{hit(e,e.boss?250:140,{damageType:'environment'});puff(e.x,e.y,['#ff5a4a','#ffd34d','#fff'][Math.random()*3|0],4,140,3)});juice(16,.12)}},
  kopi:{name:'Kopi Kaw',c:'#c08a5a',d:'Skills recharge 3x faster for 8 s.',fn:()=>{G.kopiT=8}},
  payung:{name:'Payung',c:'#ffd34d',d:'Nothing can hurt you for 6 s.',fn:()=>{G.p.shield=6}},
};
function dropPup(x,y,type){if(!G.raid)({x,y}=safePoint(x,y,25));const pool=['ketupat','magnet','magnet','mercun','kopi','payung'];const k=type||pool[Math.random()*pool.length|0];G.pups.push({x,y,type:k,t:0,life:30})}

/* ---------- Ghosts ---------- */
const GHOSTS={
  ...REGIONAL_GHOSTS,
  pocong:{hp:22,spd:62,r:13,dmg:8,xp:1},
  toyol:{hp:14,spd:150,r:10,dmg:5,xp:2},
  penanggal:{hp:40,spd:85,r:14,dmg:10,xp:4},
  body:{hp:30,spd:0,r:15,dmg:0,xp:0,fixed:true},
  minyak:{hp:95,spd:58,r:18,dmg:14,xp:6},
  pontianak:{hp:2800,spd:95,r:30,dmg:20,xp:0,fixed:true},
};
function makeGhost(type,x,y){
  if(!G.raid)({x,y}=safePoint(x,y,GHOSTS[type].r));
  const d=GHOSTS[type],m=type==='pontianak'||type==='body'||GHOSTS[type].fixed?1:(1+G.clock/150)*G.diff;
  const e={id:G.nextId++,type,x,y,r:d.r,hp:d.hp*m,maxHp:d.hp*m,spd:d.spd*rand(.9,1.1),dmg:d.dmg,xp:d.xp,
    skillT:2,windup:0,actions:0,rush:0,kvx:0,kvy:0,stun:0,fear:0,flash:0,burnT:0,burnDps:0,burnAcc:0,hits:{},phase:rand(0,TAU),carry:0,flee:0,target:null,scan:0};
  G.enemies.push(e);return e;
}
function spawnPos(extra=60){
  const R=Math.hypot(W,H)/(2*SC)+extra;
  for(let n=0;n<40;n++){const a=rand(0,TAU),x=G.p.x+Math.cos(a)*R,y=G.p.y+Math.sin(a)*R;if(walkable(x,y,50))return[x,y]}
  const q=safePoint(G.p.x+R,G.p.y,50);return[q.x,q.y];
}
function explore(){
  const state=G.exploration;
  for(const site of G.world.landmarks){const distance=Math.hypot(G.p.x-site.x,G.p.y-site.y);
    if(distance<380&&!state.visited.includes(site.id)){
      state.visited.push(site.id);banner(site.name+' discovered',2);
      if(site.reward)state.guards[site.id]=[0,1,2].map(k=>{const a=k*TAU/3;return makeGhost(k===0?G.world.signature:(G.world.id==='johor'?'pocong':Object.keys(G.stage.ghosts)[0]),site.x+Math.cos(a)*210,site.y+Math.sin(a)*210)});
    }
    if(site.reward&&distance<95&&!state.claimed.includes(site.id)&&state.guards[site.id]?.every(e=>e.dead)){
      state.claimed.push(site.id);G.coins+=site.reward;G.p.hp=Math.min(G.p.maxHp,G.p.hp+30);G.ult=Math.min(G.hero.ultNeed,G.ult+G.hero.ultNeed*.25);banner('Supply cache · +'+site.reward+' coins · health & ultimate restored',3);ring(site.x,site.y,100,'#f1c882',.6);
    }
  }
  const wayfarer=G.bunian;
  if(wayfarer&&!wayfarer.greeted&&Math.hypot(G.p.x-wayfarer.x,G.p.y-wayfarer.y)<160){
    wayfarer.greeted=true;
    banner(BUNIAN_WAYFARER.greeting,6);
  }
}
function introduceGhost(type){
  if(INTRO[type]&&!G.events.has('intro'+type)){
    G.events.add('intro'+type);
    banner(INTRO[type],5);
  }
}
function spawnWave(){
  const t=G.clock,alive=G.enemies.length;if(alive>330)return;
  const gw=G.stage.ghosts,gate={pocong:0,toyol:15,penanggal:40,minyak:60};
  const w=Object.keys(gw).map(k=>[k,t>=(gate[k]??G.stage.folklore[k]?.waveAt??8)?gw[k]:0]);
  const tot=w.reduce((a,b)=>a+b[1],0);
  const batch=1+Math.floor(t/50);
  for(let b=0;b<batch;b++){
    let r=Math.random()*tot,type='pocong';for(const[k,v]of w){if(v>0&&(r-=v)<0){type=k;break}}
    const[x,y]=spawnPos();
    if(type==='pocong'){for(let i=0;i<3;i++)makeGhost('pocong',x+rand(-30,30),y+rand(-30,30))}
    else if(type==='penanggal'){const h=makeGhost('penanggal',x,y);const a=rand(0,TAU),R=rand(320,480);
      const body=makeGhost('body',G.p.x+Math.cos(a)*R,G.p.y+Math.sin(a)*R);body.head=h;h.body=body}
    else makeGhost(type,x,y);
    introduceGhost(type);
  }
}
function introduceFolklore(){
  for(const [type,{at}] of Object.entries(G.stage.folklore)){
    if(G.clock<at||G.events.has('arrival:'+type))continue;
    G.events.add('arrival:'+type);
    const {p}=G,r=REGIONAL_GHOSTS[type].r;
    const reach=Math.min(235,Math.min(W,H)/(2*SC)*.65);
    const bearing=rand(0,TAU);
    let point;
    for(const distance of [reach,reach*.65]){
      for(let i=0;i<16;i++){
        const a=bearing+i*TAU/16;
        const candidate={x:p.x+Math.cos(a)*distance,y:p.y+Math.sin(a)*distance};
        if(walkable(candidate.x,candidate.y,r)&&clearLine(candidate,p,p.r)){
          point=candidate;
          break;
        }
      }
      if(point)break;
    }
    point??=safePoint(p.x+Math.cos(bearing)*reach,p.y+Math.sin(bearing)*reach,r);
    makeGhost(type,point.x,point.y);
    introduceGhost(type);
  }
}
function timeline(){
  const t=G.clock,ev=(k,at,fn)=>{if(t>=at&&!G.events.has(k)){G.events.add(k);fn()}};
  const eliteWave=Math.floor((t-45)/55);
  if(eliteWave>=0&&t<bossAt()&&!G.boss&&!G.won){
    ev(eliteWave===0?'regionalElite':'regionalElite-'+eliteWave,45,()=>{
      if(G.enemies.some(e=>e.elite&&!e.encounter&&!e.dead))return;
      const [x,y]=spawnPos(),type=G.world.signature;
      encounters.spawn(null,type,x,y,'Elite');
      banner('Elite '+REGIONAL_GHOSTS[type].name+' approaching',3);
    });
  }
  ev('ring1',75,()=>{banner('A circle of pocong surrounds you!',3);for(let i=0;i<22;i++){const a=i/22*TAU;makeGhost('pocong',G.p.x+Math.cos(a)*340,G.p.y+Math.sin(a)*340)}dropPup(G.p.x+60,G.p.y,'mercun')});
  ev('ring2',135,()=>{banner('Toyol raid!',2.5);for(let i=0;i<16;i++){const[x,y]=spawnPos(20);makeGhost('toyol',x,y)}});
  const B=G.stage.boss;
  if(B.type==='pontianak')ev('scent',bossAt()-15,()=>banner('A sweet smell of frangipani in the air...',5));
  ev('boss',bossAt(),()=>{const[x,y]=spawnPos(-80);const e=makeGhost(B.type,x,y);
    Object.assign(e,{boss:true,name:B.name,hp:B.hp*(1+G.level*.02),maxHp:B.hp*(1+G.level*.02),scale:B.scale,r:GHOSTS[B.type].r*B.scale,spd:B.type==='pontianak'?95:72,dmg:20,bt:3,tele:7,scream:4,pinCd:0,lastS:0});
    Object.assign(e,{baseSpd:e.spd,baseDmg:e.dmg,enrage:0});G.boss=e;showBossBar(B.name);
    banner(B.type==='pontianak'?B.name+' is here. Crits pin her in place.':B.name+' is here!',5);juice(10,.1)});
}

// The boss is the stage clock: it keeps pace, enrages each minute, and the night ends unbeaten runs.
function paceBoss(e){
  const pace=bossPace({speed:e.baseSpd,damage:e.baseDmg,heroSpeed:G.hero.speed,age:G.clock-bossAt()});
  if(pace.expired){endGame(false,'night');return true}
  e.spd=pace.speed;e.dmg=pace.damage;
  if(pace.enrage>e.enrage){e.enrage=pace.enrage;banner(e.name+' enrages! Faster and stronger.',3);juice(6,.06)}
  if(pace.left<=NIGHT_WARNING&&!G.events.has('nightWarning')){G.events.add('nightWarning');banner('Dawn is slipping away. Defeat '+e.name+' before the night swallows '+G.stage.name+'!',4)}
  const left=Math.ceil(pace.left);$('goal').textContent='Defeat '+e.name+' · '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
  return false;
}
function resolveFolkloreMarks(enemy,damage,dt){
  const p=G.p,age=enemy.folkloreRelease+=dt;
  for(const mark of enemy.folkloreMarks){
    if(mark.fired||age<mark.delay)continue;
    mark.fired=true;
    let hit;
    if(mark.kind==='lane')hit=inDirectedLine(p,mark.x,mark.y,mark.dx,mark.dy,mark.length,mark.width);
    else if(mark.kind==='polygon')hit=overlapsConvexPolygon(p,mark.points);
    else {
      const distance=Math.hypot(p.x-mark.x,p.y-mark.y);
      hit=distance<mark.r+p.r&&distance+p.r>=mark.inner;
    }
    if(hit)hurtPlayer(damage,'skill');
  }
  if(enemy.folkloreMarks.every(mark=>age>=mark.delay+FOLKLORE_IMPACT)){
    enemy.folkloreMarks=null;
  }
}

/* ---------- Update ---------- */
function update(dt){
  G.t+=dt;if(!G.raid)G.clock+=dt;const p=G.p,st=G.st;
  const campaignWorld=!G.practice&&!G.raid;
  if(campaignWorld)timeline();
  if(bannerT>0&&(bannerT-=dt)<=0)$('banner').classList.remove('show');
  if(G.won){for(const g of G.gems)g.mag=true;if((G.wonT-=dt)<=0){endGame(true);return}}
  if(campaignWorld&&G.boss&&!G.boss.dead&&!G.won&&paceBoss(G.boss))return;
  p.hp=Math.min(p.maxHp,p.hp+dt*G.upgradeStats.regen);

  // movement
  const previousPlayer={x:p.x,y:p.y};
  const [mx,my]=movementInput(),ml=Math.hypot(mx,my);
  if(ml>.1)p.face=[mx/ml,my/ml];
  const spd=G.hero.speed*st.spd*equipmentWalkMultiplier(G)*(p.super>0?2:1);
  p.slip=false;for(const z of G.zones)if(z.kind==='oil'&&Math.hypot(p.x-z.x,p.y-z.y)<z.r)p.slip=true;
  const acc=p.slip?2.2:14;
  p.vx+=(mx*spd-p.vx)*Math.min(1,dt*acc);p.vy+=(my*spd-p.vy)*Math.min(1,dt*acc);
  const dash=p.dash;
  if(dash){p.x+=dash.vx*dt;p.y+=dash.vy*dt}
  else{p.x+=p.vx*dt;p.y+=p.vy*dt}
  const moved=moveOnMap(previousPlayer.x,previousPlayer.y,p.x,p.y,p.r);
  if(dash&&(G.raid||dash.stopAtBlocker)&&(moved.x!==p.x||moved.y!==p.y))dash.t=0;
  Object.assign(p,moved);
  p.normalMove=!dash&&ml>.1?{x:p.x,y:p.y,dx:p.x-previousPlayer.x,dy:p.y-previousPlayer.y,dt}:null;
  if(dash){
    each(p.x,p.y,p.r+8,e=>{if(!dash.hit.has(e)){dash.hit.add(e);hit(e,dash.dmg,{visualSlot:G.hero.id==='rempit'?1:2,kb:[dash.vx*.3,dash.vy*.3],...dash.hitOptions})}});
    G.fx.push({x:p.x,y:p.y,vx:0,vy:0,life:.25,max:.25,c:'rgba(255,211,77,.6)',size:9});
    if(dash.fire)G.zones.push({kind:'fire',slot:1,x:p.x,y:p.y,r:30,life:2.5,max:2.5,dps:30*rm(G.ranks[1]),acc:0});
    if((dash.t-=dt)<=0)p.dash=null;
  }
  if(p.sq)p.sq=Math.max(0,p.sq-dt*6);p.moving=ml>.1;
  p.invuln=Math.max(0,p.invuln-dt);p.hurt=Math.max(0,p.hurt-dt);
  if(p.super>0){p.super-=dt;each(p.x,p.y,p.r+10,(e,dx,dy)=>{if(G.t>=(e.hits.ram||0)){e.hits.ram=G.t+.4;const l=Math.hypot(dx,dy)||1;hit(e,p.superDmg,{visualSlot:4,kb:[dx/l*520,dy/l*520]})}});
    if(Math.random()<.5)G.fx.push({x:p.x-p.face[0]*20,y:p.y-p.face[1]*20,vx:rand(-20,20),vy:rand(-20,20),life:.4,max:.4,c:'rgba(120,200,255,.7)',size:6})}
  if(p.exhaust>0){p.exhaust-=dt;p.exAcc+=dt;if(p.exAcc>.07){p.exAcc=0;G.zones.push({kind:'fire',x:p.x-p.face[0]*14,y:p.y-p.face[1]*14,r:p.exPatch.radius,life:p.exPatch.life,max:p.exPatch.life,dps:p.exDps,acc:rand(0,.25)})}}
  if(G.hero.id==='rempit'&&ml>.1&&Math.random()<.25)G.fx.push({x:p.x-p.face[0]*22,y:p.y-p.face[1]*22,vx:rand(-15,15),vy:rand(-15,15),life:.5,max:.5,c:'rgba(160,170,175,.35)',size:5});

  // skills
  if(G.kopiT>0)G.kopiT-=dt;if(p.shield>0)p.shield-=dt;
  const cdt=dt*(G.kopiT>0?3:1);for(let i=0;i<5;i++)G.cds[i]=Math.max(0,G.cds[i]-(i?cdt:dt));
  autoCast();
  G.pupCd-=dt;
  if(campaignWorld&&(G.pupT-=dt)<=0&&G.pups.length<2){G.pupT=rand(45,60);G.pupCd=Math.max(G.pupCd,15);const a=rand(0,TAU);dropPup(p.x+Math.cos(a)*rand(200,320),p.y+Math.sin(a)*rand(200,320))}
  for(const u of G.pups){u.t+=dt;u.life-=dt;if(u.mag){const dx=p.x-u.x,dy=p.y-u.y,d=Math.hypot(dx,dy)||1,v=Math.max(450,d*5);u.x+=dx/d*v*dt;u.y+=dy/d*v*dt;u.life=Math.max(u.life,5)}
    if(u.life<=0)continue;if(Math.hypot(u.x-p.x,u.y-p.y)<p.r+16){u.life=0;const d=PUPS[u.type];d.fn();banner(d.name+'! '+d.d,2.5);ring(u.x,u.y,60,d.c,.4);juice(5,.04)}}
  G.pups=G.pups.filter(u=>u.life>0);
  if(G.cds[0]<=0){if(CAST[G.hero.id][0](G.ranks[0])!==false)G.cds[0]=castCooldown(G.hero.skills[0],G.ranks[0],st.cd)}
  if(G.orbit){const o=G.orbit;o.ang+=dt*3.3;o.t-=dt;
    const holy=G.zones.some(z=>z.kind==='barrier'&&Math.hypot(p.x-z.x,p.y-z.y)<z.r);o.holy=holy;const rad=o.rad*(holy?1.4:1);
    for(let k=0;k<o.n;k++){const a=o.ang+k*TAU/o.n,bx=p.x+Math.cos(a)*rad,by=p.y+Math.sin(a)*rad;
      each(bx,by,holy?14:9,e=>{
        if(G.t<(e.hits.tas||0))return;
        e.hits.tas=G.t+.35;
        if(hit(e,o.dmg*(holy?2:1),{visualSlot:2})&&G.evo[2])e.slowT=Math.max(e.slowT||0,1);
      })}
    if(o.t<=0)G.orbit=null}

  // passives: guli marbles
  if(st.guli>0&&(G.guliT-=dt)<=0){G.guliT=Math.max(3,8-st.guli);G.marbles.push({x:p.x+rand(-120,120),y:p.y+rand(-120,120),life:5})}
  G.marbles=G.marbles.filter(m=>(m.life-=dt)>0);

  // spawns
  if(campaignWorld&&(G.spawnT-=dt)<=0){G.spawnT=Math.max(.14,.9-G.clock*.0032)*(G.boss?1.6:1);spawnWave()}
  if(campaignWorld)introduceFolklore();
  if(campaignWorld&&(G.durianT-=dt)<=0){G.durianT=rand(8,12);for(let i=0;i<1+Math.floor(G.clock/80);i++)G.durians.push({x:p.x+rand(-260,260),y:p.y+rand(-200,200),t:1.4})}
  for(const d of G.durians){d.t-=dt;if(d.t<=0){each(d.x,d.y,50,e=>hit(e,80,{damageType:'environment'}));if(Math.hypot(p.x-d.x,p.y-d.y)<50+p.r)hurtPlayer(12);puff(d.x,d.y,'#c8b04a',14,160,4);ring(d.x,d.y,50,'#c8b04a',.3);text(d.x,d.y-20,'DUSH!','#e3cf6b',15);juice(8,.04)}}
  G.durians=G.durians.filter(d=>d.t>0);
  if(campaignWorld&&G.stage.boss.type==='pontianak'&&G.clock>bossAt()-15&&(G.petalT-=dt)<=0){G.petalT=.12;G.fx.push({kind:'petal',x:p.x+rand(-W,W)/SC/2,y:p.y-H/SC/2-10,vx:rand(10,40),vy:rand(40,80),life:6,max:6,rot:rand(0,TAU)})}

  // enemies
  const viewR=Math.hypot(W,H)/(2*SC);
  for(const e of G.enemies){
    if(e.dead)continue;
    const regional=regionalGhost(e.type),folklore=regional?.folklore;
    if(regional)e.moving=false;
    e.vulnerable=Math.max(0,(e.vulnerable||0)-dt);e.flash=Math.max(0,e.flash-dt);if(e.sq)e.sq=Math.max(0,e.sq-dt*7);
    if(e.burnT>0){e.burnT-=dt;e.burnAcc+=dt;if(e.burnAcc>=.5){e.burnAcc-=.5;hit(e,e.burnDps*.5,{dot:true,slot:e.burnSlot});if(e.dead)continue}}
    if(e.pinCd!==undefined)e.pinCd=Math.max(0,e.pinCd-dt);
    e.x+=e.kvx*dt;e.y+=e.kvy*dt;const damp=Math.pow(.01,dt);e.kvx*=damp;e.kvy*=damp;
    if(e.type==='body'){e.near=Math.hypot(e.x-p.x,e.y-p.y)<520;if(Math.hypot(e.x-p.x,e.y-p.y)>1600){e.dead=true;if(e.head)e.head.body=null}continue}
    if(folklore&&e.folkloreMarks&&!e.windup)resolveFolkloreMarks(e,folklore.damage,dt);
    const target=e.objective||p;
    let dx=target.x-e.x,dy=target.y-e.y,dl=Math.hypot(dx,dy)||1;
    if(!e.encounter&&dl>viewR*1.7&&!e.boss&&!G.raid&&!e.folkloreMarks){const[x,y]=spawnPos();e.x=x;e.y=y;continue}
    if(e.stun>0){e.stun-=dt;continue}
    let tx=dx/dl,ty=dy/dl,sp=e.spd;
    if(e.ai){const r=e.ai(e,dt,{dx,dy,dl,tx,ty,sp});if(r){tx=r.tx;ty=r.ty;sp=r.sp}}
    else if(e.boss&&e.type!=='pontianak'){e.bt-=dt;e.phase+=dt;
      if(e.type==='toyol'){if(e.bt<=0){e.bt=5;for(let k=0;k<4;k++)makeGhost('toyol',e.x+rand(-50,50),e.y+rand(-50,50));text(e.x,e.y-60,'Toyol, serang!','#5fd16a',18);juice(4)}}
      else if(e.type==='minyak'){if(e.bt<=0){e.bt=.7;G.zones.push({kind:'oil',x:e.x,y:e.y,r:55,life:7,max:7})}}
      else if(e.type==='penanggal'){tx+=Math.cos(e.phase*1.5)*.6;ty+=Math.sin(e.phase*1.5)*.6;if(e.bt<=0){e.bt=3.5;const a0=Math.atan2(dy,dx);for(let k=-3;k<=3;k++){const a=a0+k*.18;G.eprojs.push({x:e.x,y:e.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,r:8,dmg:12,life:3,c:'#e88a9a'})}juice(4)}}
      else if(e.type==='pocong'){const s0=Math.sin(e.phase*2.5);sp*=Math.max(0,s0)*2.4;if(e.lastS>0&&s0<=0){ring(e.x,e.y,150,'#e9e4d6',.4);juice(7,.04);if(dl<150+p.r)hurtPlayer(15,'skill')}e.lastS=s0}
    }
    else if(e.type==='pocong'){e.phase+=dt*5;sp*=Math.max(0,Math.sin(e.phase))*2.1}
    else if(e.type==='penanggal'){e.phase+=dt*2;tx+=Math.cos(e.phase)*.35;ty+=Math.sin(e.phase)*.35;if(e.weak)sp*=.8}
    else if(e.type==='minyak'){e.phase+=dt;if(e.phase>1.6){e.phase=0;G.zones.push({kind:'oil',x:e.x,y:e.y,r:30,life:6,max:6})}}
    else if(e.type==='toyol'){
      if(e.flee>0){e.flee-=dt;tx=-tx;ty=-ty;sp*=1.1}
      else{
        if((e.scan-=dt)<=0){e.scan=.3;e.target=null;e.distract=null;
          for(const m of G.marbles)if(Math.hypot(m.x-e.x,m.y-e.y)<350){e.distract=m;break}
          if(!e.distract&&e.carry<8){let bd=380*380;for(const g of G.gems){const gx=g.x-e.x,gy=g.y-e.y,d=gx*gx+gy*gy;if(d<bd&&!g.mag&&g.kind!=='coin'){bd=d;e.target=g}}}}
        if(e.distract&&e.distract.life>0){const ax=e.distract.x-e.x,ay=e.distract.y-e.y,l=Math.hypot(ax,ay)||1;if(l<14)sp=0;else{tx=ax/l;ty=ay/l}}
        else if(e.target){const g=e.target,ax=g.x-e.x,ay=g.y-e.y,l=Math.hypot(ax,ay)||1;tx=ax/l;ty=ay/l;
          if(l<e.r+6){const i=G.gems.indexOf(g);if(i>=0){G.gems.splice(i,1);e.carry+=g.v;e.flee=3;text(e.x,e.y-16,'stolen!','#5fd16a',12)}e.target=null}}
      }}
    else if(e.type==='pontianak'){
      e.phase+=dt;e.tele-=dt;e.scream-=dt;
      if(e.tele<=1.2&&!e.dest){const a=rand(0,TAU);e.dest={x:p.x+Math.cos(a)*130,y:p.y+Math.sin(a)*130}}
      if(e.tele<=0){const far=dl>380;e.x=e.dest.x;e.y=e.dest.y;e.dest=null;e.tele=rand(6,8);puff(e.x,e.y,'#fff',18,140,4);juice(8,.06);
        banner(far?'Her wail sounds soft and far away... which means she is right beside you.':'A loud, close wail... she has gone far, for now.',3)}
      if(e.scream<=0){e.scream=4.2;for(let k=0;k<12;k++){const a=k/12*TAU+e.phase;G.eprojs.push({x:e.x,y:e.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,r:7,dmg:12,life:4})}ring(e.x,e.y,70,'#ffb3c1',.4)}
    }
    if(folklore&&!e.boss){
      e.skillT-=dt;
      if(e.skillT<=0&&dl<folklore.range&&!e.folkloreMarks){
        e.attackAngle=Math.atan2(dy,dx);
        e.folkloreMarks=folklore.marks(e,p,e.attackAngle);
        e.windup=folklore.windup;
        e.skillT=4;
      }
      if(e.windup>0){
        sp=0;
        e.windup=Math.max(0,e.windup-dt);
        if(!e.windup){
          e.actions++;
          e.attackAt=G.t;
          e.folkloreRelease=0;
          resolveFolkloreMarks(e,folklore.damage,0);
        }
      }
    }else if(regional&&!e.boss){
      e.skillT-=dt;
      if(e.skillT<=0&&dl<650&&!e.windup){
        e.windup=regionalWindup(e.type);e.skillT=3.5;
        if(e.type==='nipah')e.warningPoint={x:p.x,y:p.y};
        e.attackAngle=Math.atan2(dy,dx);
      }
      if(e.windup>0){e.windup=Math.max(0,e.windup-dt);sp=0;
        if(!e.windup){e.actions++;e.attackAt=G.t;const angle=Math.atan2(dy,dx);
          const bolt=(offset,speed,color)=>G.eprojs.push({encounter:e.encounter,x:e.x,y:e.y,vx:Math.cos(angle+offset)*speed,vy:Math.sin(angle+offset)*speed,r:7,dmg:10,life:3,c:color});
          if(e.type==='stalker'){e.rush=.5;e.rx=tx;e.ry=ty;}
          if(e.type==='lantern')for(const a of [-.2,0,.2])bolt(a,190,'#ffc66b');
          if(e.type==='sentinel'){ring(e.x,e.y,155,'#a9e3df',.5);if(dl<155+p.r)hurtPlayer(18,'skill');}
          if(e.type==='neon'){e.rush=.32;e.rx=tx;e.ry=ty;for(const a of [-.6,.6])bolt(a,250,'#ce9dff');}
          if(e.type==='drifter'){G.zones.push({encounter:e.encounter,kind:'oil',x:e.x,y:e.y,r:95,life:4,max:4,c:'#529eb1'});bolt(0,170,'#9be6e5');}
          if(e.type==='watcher')for(const a of [-.48,-.24,0,.24,.48])bolt(a,155,'#e8d58e');
          if(e.type==='nipah'){
            const mark=e.warningPoint,r=REGIONAL_GHOSTS.nipah.warning;
            ring(mark.x,mark.y,r,'#a0d58d',.55);
            if(Math.hypot(p.x-mark.x,p.y-mark.y)<r+p.r)hurtPlayer(14,'skill');
            e.warningPoint=null;
          }
          if(e.type==='foam'){
            const a=e.attackAngle,speed=190;
            for(const offset of [-52,52])for(let k=0;k<3;k++){
              const reach=k*27;
              G.eprojs.push({x:e.x-Math.sin(a)*offset-Math.cos(a)*reach,y:e.y+Math.cos(a)*offset-Math.sin(a)*reach,
                vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:11,dmg:11,life:2,c:'#94edf1'});
            }
          }
          if(e.type==='kite'){
            for(let k=1;k<10;k++)bolt(e.attackAngle-angle+k*TAU/10,190,'#f5b7d9');
          }
        }
      }
      if(e.rush>0){e.rush-=dt;tx=e.rx;ty=e.ry;sp*=3;if(e.rush<=0&&e.elite==='Armoured')e.vulnerable=1.5;}
      if(e.type==='watcher'&&dl<370)sp=0;
    }
    if(e.slowT>0){e.slowT-=dt;sp*=.5}
    if(e.fear>0){e.fear-=dt;tx=-dx/dl;ty=-dy/dl}
    const tl=Math.hypot(tx,ty)||1;
    const fromX=e.x,fromY=e.y;
    if(!G.raid){
      if(!e.fear&&!e.flee&&!e.target&&!e.distract&&!clearLine(e,target,e.r+12))[tx,ty]=routeDirection(e,target);
      const length=Math.hypot(tx,ty)||1;
      Object.assign(e,moveOnMap(e.x,e.y,e.x+tx/length*sp*dt,e.y+ty/length*sp*dt,e.r));
    }else{e.x+=tx/tl*sp*dt;e.y+=ty/tl*sp*dt;}
    if(regional){
      const distance=Math.hypot(e.x-fromX,e.y-fromY);
      e.moving=distance>.01;
      e.stride=(e.stride||0)+distance;
    }
    if(dl<e.r+target.r&&e.dmg){if(e.objective)e.onObjectiveContact();else if(p.onContact)p.onContact(e);else hurtPlayer(e.dmg)}
  }
  for(const f of HOOKS.update)f(dt);
  // separation (grid)
  const grid=new Map(),C=40;
  for(const e of G.enemies){if(e.dead)continue;const k=(Math.floor(e.x/C))+','+(Math.floor(e.y/C));let c=grid.get(k);if(!c)grid.set(k,c=[]);c.push(e)}
  for(const e of G.enemies){if(e.dead||e.type==='body'||e.boss)continue;const cx=Math.floor(e.x/C),cy=Math.floor(e.y/C);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const c=grid.get((cx+i)+','+(cy+j));if(!c)continue;
      for(const o of c){if(o===e||o.type==='body')continue;const ox=e.x-o.x,oy=e.y-o.y,rr=e.r+o.r,d2=ox*ox+oy*oy;
        if(d2<rr*rr&&d2>.01){const d=Math.sqrt(d2),push=(rr-d)*.5;e.x+=ox/d*push;e.y+=oy/d*push}}}}

  // player projectiles
  for(const pr of G.projs){
    if(pr.update)pr.update(pr,dt);
    pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;pr.life-=dt;if(pr.spin!==undefined)pr.spin+=dt*18;
    for(const e of G.enemies){if(e.dead||pr.hit.has(e)||pr.life<=0)continue;const dx=e.x-pr.x,dy=e.y-pr.y,rr=e.r+pr.r;
      if(dx*dx+dy*dy<rr*rr){pr.hit.add(e);hit(e,pr.dmg*(pr.dmgFor?pr.dmgFor(e):1),{visualSlot:pr.kind==='dragon'||G.hero.id==='nok'?1:pr.hitOptions?.slot,...pr.hitOptions,origin:pr.origin,dot:pr.dot});if(pr.onHit)pr.onHit(pr,e);if(pr.fire){e.burnT=2;e.burnSlot=0;e.burnDps=10*rm(G.ranks[0])}
        if(pr.bounces>0){pr.bounces--;const n=nearest(pr.x,pr.y,230,pr.hit);if(n){const ax=n.x-pr.x,ay=n.y-pr.y,l=Math.hypot(ax,ay)||1;pr.vx=ax/l*540;pr.vy=ay/l*540;pr.life=.8}else pr.life=0}
        else if(--pr.pierce<=0)pr.life=0;break}}
  }
  G.projs=G.projs.filter(q=>q.life>0);
  for(const q of G.eprojs){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(Math.hypot(q.x-p.x,q.y-p.y)<q.r+p.r){hurtPlayer(q.dmg,'skill');q.life=0}}
  G.eprojs=G.eprojs.filter(q=>q.life>0);

  // zones
  for(const z of G.zones){z.life-=dt;
    if(z.kind==='barrier'||z.kind==='fire'){z.acc+=dt;if(z.acc>=.25){z.acc-=.25;each(z.x,z.y,z.r,e=>hit(e,z.dps*.25,{dot:true}));
      if(z.kind==='barrier'&&Math.hypot(p.x-z.x,p.y-z.y)<z.r){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+z.heal*.25);if(p.hp>before)combatNumber(p.x,p.y-30,p.hp-before,'heal')}}}}
  G.zones=G.zones.filter(z=>z.life>0);

  // Leave a brief visible drop even when a melee kill lands under the hero.
  if(G.equipmentDrops.length&&!G.over&&!G.won){
    G.equipmentDrops=G.equipmentDrops.filter(drop=>{
      if(G.t<drop.collectAt||Math.hypot(p.x-drop.x,p.y-drop.y)>p.r+16)return true;
      equipment.grant(drop.event,drop.slot);
      return false;
    });
  }

  // gems
  const pr2=st.pickup*st.pickup;
  for(const g of G.gems){const dx=p.x-g.x,dy=p.y-g.y,d2=dx*dx+dy*dy;
    if(d2<pr2)g.mag=true;
    if(g.mag){const d=Math.sqrt(d2)||1,v=Math.max(380,d*6);g.x+=dx/d*v*dt;g.y+=dy/d*v*dt;if(d<p.r+6){g.got=true;if(g.kind==='coin')G.coins+=g.v;else addXP(g.v*(G.xpMul||1)*G.upgradeStats.xp)}}}
  G.gems=G.gems.filter(g=>!g.got);

  // fx
  for(const f of G.fx){f.life-=dt;if(f.vx!==undefined){f.x+=f.vx*dt;f.y+=f.vy*dt}if(f.kind==='petal')f.rot+=dt*2}
  G.fx=G.fx.filter(f=>f.life>0);if(G.fx.length>600){const spells=G.fx.filter(f=>f.kind==='spell');G.fx=[...spells,...G.fx.filter(f=>f.kind!=='spell').slice(-(600-spells.length))].slice(-600)}
  for(const t of G.texts){t.life-=dt;if(!t.kind)t.y-=28*dt}
  G.texts=G.texts.filter(t=>t.life>0);
  G.enemies=G.enemies.filter(e=>!e.dead);

  if(G.practice)return;
  if(G.pending>0&&!G.over&&!G.won)openLevelUp();
}

/* ---------- Level up ---------- */
let choices=[];
function updateRecipeTracking(){
  const recipes=EVOS[G.hero.id];
  const recipe=recipes.find(ev=>ev.i===G.trackedEvolution);
  let progress='';
  if(recipe){
    const skill=G.hero.skills[recipe.i],item=PASSIVES.find(p=>p.id===recipe.item);
    progress=availableEvolutions(G,recipes).includes(recipe)?'Recipe ready':
      `${skill.name} ${G.ranks[recipe.i]}/5 · ${item.name} ${G.pass[recipe.item]?1:0}/1`;
  }
  $('recipeProgress').textContent=progress;
  choices.forEach((choice,i)=>{
    const cue=$('up'+i).querySelector('.up-tracking');
    cue.textContent=trackingCue(G,recipe,choice);
    cue.hidden=!cue.textContent;
  });
}
listen($('recipePin'),'change',()=>{
  if(!G?.choosing)return;
  const value=$('recipePin').value;
  G.trackedEvolution=value===''?null:Number(value);
  updateRecipeTracking();
});
function openLevelUp(){
  if(!G||G.practice||G.lootModal||G.choosing||G.over)return;
  audio.setPaused(true);
  G.choosing=true;G.pending--;
  const pool=[];
  const recipes=EVOS[G.hero.id];
  G.hero.skills.forEach((s,i)=>{
    if(G.ranks[i]>=5)return;
    const ev=recipes.find(v=>v.i===i&&!G.evo[i]);
    const category=s.ult?'Ultimate':s.key?'Active skill':'Basic attack';
    const item=ev && PASSIVES.find(p=>p.id===ev.item);
    const choice={type:'skill',i,category,target:s,k:'Rank '+(G.ranks[i]+1),
      t:s.name,metrics:skillChanges(G,i),evolution:ev && `${ev.name} at rank 5 with ${item.name} Lv. 1+`};
    pool.push(choice,choice);
  });
  PASSIVES.forEach(pv=>{const lv=G.pass[pv.id]||0;if(lv<5)pool.push({type:'pass',id:pv.id,category:'Passive item',k:'Level '+(lv+1),t:pv.name,d:pv.desc})});
  choices=[];
  const [ev]=availableEvolutions(G,recipes);
  if(ev){
    const target=G.hero.skills[ev.i];
    choices.push({type:'evo',ev,target,category:'Evolution',t:ev.name,d:ev.d,k:'Evolves '+target.name});
  }
  const offerPaths=G.level-G.pending>=3&&!G.specialization;
  $('levelup').querySelector('.blessing-hint').textContent=offerPaths
    ? 'Pick one path for this run, or take another blessing to decide later.'
    : 'Choose a card or press its number.';
  if(offerPaths){
    const spec=SPECIALIZATIONS[G.hero.id],ability=G.hero.skills[spec.slot];
    choices.unshift(...spec.paths.map(path=>({type:'specialization',path,
      target:ability,category:'Specialization',t:path.name,d:path.description,k:ability.name+' · This run'})));
  }
  while(choices.length<3&&pool.length){const c=pool.splice(Math.floor(Math.random()*pool.length),1)[0];if(!choices.some(x=>x.t===c.t))choices.push(c)}
  if(!choices.length||offerPaths&&choices.length===2)choices.push({type:'heal',category:'Treat',t:'Kuih Muih',d:'Heal 40 HP.'});
  $('ups').innerHTML='';
  choices.forEach((c,i)=>{const b=document.createElement('button');b.className='up';b.id='up'+i;
    const unlocked=newlyAvailableEvolutions(G,recipes,c);
    const hint=unlocked.length?'Makes evolution available · '+unlocked.map(ev=>ev.name).join(', '):
      c.evolution?'Evolves into '+c.evolution:'';
    b.dataset.category=c.category;
    const slot=c.target && (c.target.key || 'Basic');
    if(slot)b.dataset.slot=slot;
    const badge=slot && (c.target.key || c.type==='evo')?`<b class="up-slot">${slot}</b> `:'';
    b.innerHTML=`<span class="up-meta"><strong>${badge}${c.category}</strong><kbd aria-label="Pick ${i+1}">${i+1}</kbd></span>
      <span class="up-tracking" hidden></span><span class="up-title">${c.t}</span>${c.metrics?`<span class="up-values">${c.metrics.map(value=>`<span>${value}</span>`).join('')}</span>`:
        `<span class="up-effect">${c.d}</span>`}
      ${c.k?`<span class="up-rank">${c.k}</span>`:''}
      ${hint?`<span class="up-evolution${unlocked.length?' available':''}">${hint}</span>`:''}`;
    b.onclick=()=>pickUp(i);$('ups').appendChild(b)});
  const pin=$('recipePin'),remaining=recipes.filter(ev=>!G.evo[ev.i]);
  pin.replaceChildren(new Option('No pin',''),...remaining.map(ev=>new Option(ev.name,String(ev.i))));
  pin.value=G.trackedEvolution===null?'':String(G.trackedEvolution);
  pin.disabled=!remaining.length;
  $('recipeTracker').hidden=pin.disabled;
  updateRecipeTracking();
  $('levelup').hidden=false;$('up0').focus({preventScroll:true});
}
function pickUp(i){
  const c=choices[i];if(!c||!G.choosing)return;
  if(c.type==='specialization'){G.specialization=c.path;G.technique=c.path.values}
  else if(c.type==='evo'){applyEvolution(G,c.ev);banner('Evolved: '+c.ev.name+'!',3);juice(10,.1)}
  else if(c.type==='skill')G.ranks[c.i]++;
  else if(c.type==='pass'){G.pass[c.id]=(G.pass[c.id]||0)+1;PASSIVES.find(p=>p.id===c.id).apply(G.st,G);equipment.recalculate()}
  else G.p.hp=Math.min(G.p.maxHp,G.p.hp+40);
  $('levelup').hidden=true;G.choosing=false;updateSkillBar(true);cvs.focus&&cvs.focus();
}

/* ---------- UI ---------- */
function selectMission(route,id){
  if(!CAMPAIGN_ROUTES[route].includes(id)||!stageOpen(route,id))return;
  startRequest++;routePick=route;stagePick=stageIndex(id);
  buildRoute();updateStartButton();
}
function buildRoute(){
  const box=$('route');box.innerHTML='';
  const activeRoute=CAMPAIGN_ROUTES[routePick];
  const nextByRoute=Object.fromEntries(Object.keys(CAMPAIGN_ROUTES).map(route=>[route,nextCampaignStage(route,SAVE)]));
  const next=[...new Set(Object.values(nextByRoute).filter(Boolean))];
  const coast=routePick==='east'?'East Coast':'West Coast';
  const target=nextByRoute[routePick],resume=$('continueExpedition');
  resume.disabled=!target;
  resume.textContent=target?'Continue expedition · '+STAGES[stageIndex(target)].name:coast+' complete';
  activeRoute.forEach((id,i)=>{const S=STAGES[stageIndex(id)],b=document.createElement('button');
    b.className='stg';b.id='stg-'+S.id;b.disabled=!stageOpen(routePick,id);b.setAttribute('aria-pressed',String(S===STAGES[stagePick]));
    b.innerHTML=`<span class="stage-no">${String(i+1).padStart(2,'0')}</span><span>${S.name}</span>`;
    markStageProgress(b,id,SAVE.cleared,next);
    b.title=S.set;
    b.onclick=()=>{selectMission(routePick,id);$('stg-'+id).focus({preventScroll:true})};box.appendChild(b)});
  const S=STAGES[stagePick];
  $('stageInfo').textContent=S.set+'.';$('stageTitle').textContent=S.name;
  $('stageChapter').textContent='Mission '+String(activeRoute.indexOf(S.id)+1).padStart(2,'0')+' / '+coast;
  $('stageBoss').textContent=S.boss.name;$('stageDuration').textContent=(S.bossAt||BOSS_AT)/60+' minutes'+(S.coinMul?' · '+S.coinMul+'× coins':'');
  $('stageGuardian').textContent=REGIONAL_GHOSTS[stageSignature(S.id)].name;
  $('coinsMenu').textContent=SAVE.coins;$('start').textContent='Enter '+S.name;
  const openStages=STAGES.filter(stage=>stageOpen(routeForStage(stage.id,routePick),stage.id)).map(stage=>stage.id);
  box.dataset.campaignRoute=routePick;
  box.dataset.clearedStages=SAVE.cleared.join(' ');
  box.dataset.nextStages=next.join(' ');
  box.dataset.openStages=openStages.join(' ');
  for(const route of Object.keys(CAMPAIGN_ROUTES))$('route-'+route).setAttribute('aria-pressed',String(route===routePick));
  box.dispatchEvent(new CustomEvent('stage-preview'));
}
listen($('continueExpedition'),'click',()=>{
  const id=nextCampaignStage(routePick,SAVE);
  if(!id)return;
  selectMission(routePick,id);
  const heading=$('stageTitle');
  heading.focus({preventScroll:true});
  heading.closest('.mission-sheet').scrollIntoView({block:'nearest'});
});
for(const [route,ids] of Object.entries(CAMPAIGN_ROUTES))listen($('route-'+route),'click',()=>{
  const current=STAGES[stagePick].id;
  selectMission(route,ids.includes(current)?current:ids[0]);
});
listen($('atlasLabels'),'select-mission',event=>{
  const id=event.detail,route=routeForStage(id,routePick);
  if(route)selectMission(route,id);
});
function setSkillArtwork(strip,id){
  const art=heroArt[id];
  const roster=art.portraitIndex!==undefined;
  strip.classList.toggle('roster-abilities',roster);
  strip.classList.toggle('mira-rescue-abilities',id==='mira');
  strip.style.setProperty('--icon-row',roster?art.portraitIndex*100/6+'%':art.idleIndex*25+'%');
}
function skillIconColumn(id,slot){return heroArt[id].portraitIndex===undefined?(slot-1)*100/3+'%':slot*25+'%'}
const heroOwned=id=>UNLOCK_ALL||HEROES[id].price===0||SAVE.owned.includes(id);
function updateMenuWallet(){
  $('coinsMenu').textContent=SAVE.coins;
  $('unlockHero').disabled=heroOwned(heroPick)||SAVE.coins<(HEROES[heroPick].price||200);
}
async function buyUpgrade(id,upgrade,offeredPrice){
  const result=await updateSave(save=>{
    if(G||!Object.hasOwn(HEROES,id)||!heroOwned(id))return 'Choose an unlocked survivor.';
    const levels=save.heroUpgrades?.[id],rank=upgradeRank(levels,upgrade.id);
    if(rank===MAX_UPGRADE_RANK)return upgrade.name+' is at maximum rank.';
    const price=upgradePrice(upgrade,rank);
    if(price!==offeredPrice)return upgrade.name+' changed in another tab. Check the new price.';
    if(save.coins<price)return 'You need '+(price-save.coins)+' more coins.';
    const next={...save,coins:save.coins-price,heroUpgrades:{
      ...save.heroUpgrades,[id]:{...levels,[upgrade.id]:rank+1}
    }};
    if(!saveGame(next,true))return 'The purchase could not be saved. Try again.';
    return HEROES[id].name+' gained '+upgrade.name+' rank '+(rank+1)+'.';
  });
  updateMenuWallet();
  return result;
}
function showHero(id){
  startRequest++;heroPick=id;
  const h=HEROES[heroPick];
  document.documentElement.style.setProperty('--hero-accent',h.identity.color);
  const frame=menuFrame(h.id);
  setSkillArtwork($('heroSkills'),id);
  $('heroTitle').textContent=h.country+' / '+h.identity.title;
  $('heroTrait').textContent=h.identity.name+' — '+h.identity.loop;
  $('selectedHeroName').textContent=h.name;$('selectedHeroRole').textContent=h.role;$('selectedHeroHp').textContent=h.hp+' HP · '+h.speed+' speed';
  $('heroSkills').innerHTML=h.skills.map((s,i)=>`<button type="button" class="ability" aria-expanded="false" aria-controls="menuSkillDescription"><i class="ability-art${i?'':' basic'}" style="--icon-col:${skillIconColumn(id,i)};--portrait:${menuPortraitPosition(frame)}" aria-hidden="true"></i><kbd>${s.key||'AUTO'}</kbd><strong>${s.name}</strong></button>`).join('');
  $('menuSkillDescription').hidden=true;
  const owned=heroOwned(id),unlock=$('unlockHero');
  unlock.hidden=owned;unlock.textContent='Unlock · '+(h.price||200)+' coins';
  updateMenuWallet();
  updateStartButton();
}
function updateStartButton(){
  $('practiceStart').hidden=!hasPractice(heroPick);$('practiceStart').disabled=false;$('practiceStart').textContent='Practice signature';
  $('start').disabled=!heroOwned(heroPick)||!stageOpen(routePick,STAGES[stagePick].id);
  $('start').textContent='Enter '+STAGES[stagePick].name;
}
listen($('heroSkills'),'click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const buttons=[...$('heroSkills').children],expanded=button.getAttribute('aria-expanded')==='false';
  for(const skill of buttons)skill.setAttribute('aria-expanded',String(expanded && skill===button));
  const description=$('menuSkillDescription');
  const slot=buttons.indexOf(button),recipe=EVOS[heroPick].find(ev=>ev.i===slot);
  description.textContent=HEROES[heroPick].skills[slot].desc;
  if(recipe){
    const item=PASSIVES.find(p=>p.id===recipe.item);
    description.textContent+=' Rank 5 + '+item.name+' Lv. 1 → '+recipe.name+'. '+recipe.d;
  }
  description.hidden=!expanded;
});
const skEls=[];
function buildSkillBar(){
  const box=$('skills');box.innerHTML='';skEls.length=0;
  G.hero.skills.forEach((s,i)=>{if(i===0)return;
    const b=document.createElement('button');b.className='sk'+(s.ult?' ult':'');b.id='sk'+i;b.title=s.name+': '+s.desc;
    b.style.setProperty('--icon-col',skillIconColumn(G.hero.id,i));
    b.innerHTML=`<span class="skill-art" aria-hidden="true"></span><span class="key">${s.key}</span><span class="nm">${s.name}</span><span class="rk"></span><span class="cd"></span><span class="cdn"></span>`;
    b.addEventListener('click',()=>{if(G&&!G.paused&&!G.choosing&&!G.lootModal&&!G.over)tryCast(i)});
    box.appendChild(b);skEls[i]={b,cd:b.querySelector('.cd'),cdn:b.querySelector('.cdn'),rk:b.querySelector('.rk')}});
  const ab=document.createElement('button');ab.className='sk auto';ab.id='autobtn';ab.title='Toggle auto-cast (T)';
  ab.addEventListener('click',()=>{if(G&&!G.paused&&!G.choosing&&!G.lootModal&&!G.over)toggleAuto()});box.appendChild(ab);updateAutoBtn();
  updateSkillBar(true);
}
let lastHud={};
function updateSkillBar(force){
  for(let i=1;i<5;i++){const el=skEls[i];if(!el)continue;const s=G.hero.skills[i];
    const identity=G.hero.identity,state=G.identity;
    const empowered=(state.ready??state.charge>=identity.max)&&identity.key.split(' / ').includes(s.key);
    el.b.classList.toggle('empowered',empowered);
    el.b.classList.toggle('chain-next',G.hero.id==='nok'&&state.charge>0&&i<4&&i!==state.lastSkill);
    const path=G.specialization&&SPECIALIZATIONS[G.hero.id].slot===i?G.specialization:null;
    const evolution=G.evo[i]&&EVOS[G.hero.id].find(ev=>ev.i===i);
    if(force&&(path||evolution)){
      el.b.querySelector('.nm').textContent=path?.name||evolution.name;
      el.b.title=[s.name,path&&path.name+'. '+path.description,evolution&&evolution.name+'. '+evolution.d].filter(Boolean).join(' · ');
    }
    el.b.setAttribute('aria-label',[s.key+' '+s.name,path?.name,evolution?.name,empowered&&identity.name+' ready'].filter(Boolean).join(' · '));
    let frac,label='';
    if(s.ult){frac=1-G.ult/G.hero.ultNeed;el.b.classList.toggle('ready',frac<=0);label=frac>0?Math.round((1-frac)*100)+'%':''}
    else{const full=castCooldown(s,equipmentCastRank(G,i,G.ranks[i]),G.st.cd);frac=G.cds[i]/full;label=G.cds[i]>0?Math.ceil(G.cds[i]):''}
    el.cd.style.setProperty('--p',frac.toFixed(3));if(el.cdn.textContent!=String(label))el.cdn.textContent=label;
    if(force)el.rk.textContent='r'+G.ranks[i]}
}
function updateHud(){
  const set=(id,v)=>{if(lastHud[id]!==v){lastHud[id]=v;$(id).textContent=v}};
  const m=Math.floor(G.clock/60),s=Math.floor(G.clock%60);set('coinsHud',String(G.coins));
  set('time',m+':'+String(s).padStart(2,'0'));set('lvl',String(G.level));set('kills',String(G.kills));
  const xp=$('xpbar');
  if(xp.max!==G.need)xp.max=G.need;
  if(xp.value!==G.xp)xp.value=G.xp;
  $('hpFill').style.width=(Math.max(0,G.p.hp)/G.p.maxHp*100).toFixed(1)+'%';
  set('hpValue',Math.ceil(Math.max(0,G.p.hp))+' / '+G.p.maxHp+' HP');
  const identity=G.hero.identity,state=G.identity,ready=state.ready??state.charge>=identity.max;
  set('signatureName',identity.name);set('signatureValue',state.detail??(Math.floor(state.charge)+' / '+identity.max+(state.window>0?' · '+state.window.toFixed(1)+'s':'')));
  set('signatureHint',state.releaseT>0?'RELEASED · '+identity.name:ready?identity.ready:identity.hint);
  $('signatureFill').style.width=(state.charge/identity.max*100)+'%';
  $('signatureMeter').setAttribute('aria-valuenow',String(Math.floor(state.charge)));
  $('signatureMeter').setAttribute('aria-valuemax',String(identity.max));
  $('signature').classList.toggle('charged',ready);
  $('skills').inert=G.paused||G.choosing||G.lootModal||G.over;$('pauseButton').disabled=G.choosing||G.over||G.paused||!!G.lootModal;
  const bb=G.raidBoss&&!G.raidBoss.dead?G.raidBoss:G.boss;if(bb&&!bb.dead)$('bossfill').style.width=(Math.max(0,bb.hp)/bb.maxHp*100).toFixed(1)+'%';
  if(G.practice){
    set('practicePrompt',practicePrompt(G));
    $('practiceGuide').hidden=G.paused;
    if(G.practice.complete){
      set('practiceTitle','Practice complete');
      $('skills').inert=true;$('pauseButton').disabled=true;
      if(!G.over&&G.t>=G.practice.finishAt){
        G.over=true;audio.setPaused(true);$('practiceRetry').focus({preventScroll:true});
      }
    }
  }
  updateSkillBar(false);
}
function statsHtml(extra=[]){
  const m=Math.floor(G.clock/60),s=Math.floor(G.clock%60);
  return[[m+':'+String(s).padStart(2,'0'),'Time'],[G.level,'Level'],[G.kills,'Ghosts'],[G.coins,'Coins'],...extra].map(([b,l])=>`<div><b>${b}</b><span>${l}</span></div>`).join('');
}
function togglePause(){if(!G||G.practice?.complete||G.over||G.choosing||G.lootModal)return;G.paused=!G.paused;audio.setPaused(G.paused);keys.clear();$('pause').hidden=!G.paused;if(G.paused){$('pstats').innerHTML=statsHtml();$('resume').focus()}else cvs.focus({preventScroll:true});updateHud()}
async function endGame(won,reason){
  audio.setPaused(true);
  if(G.practice){G.over=true;$('practiceTitle').textContent='Practice ended';$('practiceRetry').focus();return}
  if(G.over)return;G.over=true;for(const f of HOOKS.cleanup)f();G.choosing=false;$('levelup').hidden=true;$('pause').hidden=true;$('end').hidden=false;
  const run=G,S=run.stage,next=STAGES[nextStageIndex(run)],bonus=won?S.clearCoins:0;
  const fortune=Math.floor(run.coins*run.upgradeStats.coinPercent/100),payout=run.coins+bonus+fortune;
  $('endt').textContent=won?S.name+' is safe':reason==='night'?'The night swallowed '+S.name:'You were overwhelmed';
  $('ends').textContent=won?(next?'Next stop: '+next.name+'. '+next.set+'.':(run.campaignRoute==='east'?'East Coast':'West Coast')+' route complete. Thailand is the next planned chapter.'):reason==='night'?S.boss.name+' outlasted the night. Defeat the boss before time runs out.':'The ghosts of '+S.name+' got you this time. Spend the coins you earned in the Upgrades shop.';
  const rewards=[];
  if(won)rewards.push([bonus,'Clear bonus']);
  if(fortune)rewards.push([fortune,'Fortune bonus']);
  $('estats').innerHTML=statsHtml(rewards);
  $('next').hidden=!(won&&next);
  ($('next').hidden?$('again'):$('next')).focus();
  await updateSave(save=>{
    const cleared=won&&!save.cleared.includes(S.id)?[...save.cleared,S.id]:save.cleared;
    saveGame({...save,cleared,coins:save.coins+payout});
    if(!G){buildRoute();shop.refresh()}
    if(G===run)$('estats').innerHTML=statsHtml([...rewards,[SAVE.coins,'Total coins']]);
  });
}
function nextStageIndex(run){
  const route=CAMPAIGN_ROUTES[run.campaignRoute];
  return stageIndex(route[route.indexOf(run.stage.id)+1]);
}
function toMenu(){const practiced=!!G?.practice;document.body.classList.remove('practicing');$('practiceGuide').hidden=true;audio.setPaused(true);for(const f of HOOKS.cleanup)f();G=null;['hud','skills','end','pause','levelup'].forEach(id=>$(id).hidden=true);$('menu').hidden=false;buildRoute();showHero(heroPick);$(practiced?'practiceStart':'start').focus({preventScroll:true})}
$('unlockHero').onclick=async()=>{
  const id=heroPick,price=HEROES[id].price||200;
  await updateSave(save=>{
    if(heroOwned(id)||save.coins<price)return;
    saveGame({...save,coins:save.coins-price,owned:[...save.owned,id]});
    updateMenuWallet();
    if(id===heroPick){showHero(id);$('hero-'+id).focus({preventScroll:true})}
  });
};
let startRequest=0;
async function launch(practice){
  const id=heroPick,stage=stagePick,request=++startRequest,button=$(practice?'practiceStart':'start');
  updateStartButton();
  if($('upgradeShop').open||(practice?!hasPractice(id):!heroOwned(id)||!stageOpen(routePick,STAGES[stage].id)))return;
  if(!art.isHeroPrepared(id)){
    button.disabled=true;button.textContent='Preparing '+HEROES[id].name+'…';
    try{await art.prepareHero(id)}
    catch{if(request===startRequest){button.disabled=false;button.textContent='Retry loading '+HEROES[id].name}return}
    if(request!==startRequest)return;
  }
  updateStartButton();
  if($('upgradeShop').open)return;
  $('menu').hidden=true;newGame(id,practice?0:stage,practice);
}
$('start').onclick=()=>launch(false);
$('practiceStart').onclick=()=>launch(true);
$('practiceRetry').onclick=()=>{if(G?.practice)newGame(G.hero.id,0,true)};
$('practiceReturn').onclick=toMenu;
$('resume').onclick=togglePause;
$('pauseButton').onclick=togglePause;
$('helpButton').onclick=()=>$('controls').showModal();
$('quit').onclick=toMenu;
$('again').onclick=()=>{$('end').hidden=true;newGame(G.hero.id,G.si)};
$('next').onclick=()=>{
  if(!G?.over||$('next').hidden)return;
  const next=nextStageIndex(G);
  if(next<0)return;
  routePick=G.campaignRoute;stagePick=next;newGame(G.hero.id,next);
};
$('tomenu').onclick=toMenu;
listen(document,'visibilitychange',()=>{if(document.hidden&&G&&!G.paused&&!G.over&&!G.choosing)togglePause()});


const api={signatureReleased(){
  if(G.practice&&!G.practice.complete){
    G.practice.complete=true;G.practice.finishAt=G.t+1.2;
  }
},withCastEffects,audio,canvas:cvs,clearInput(){keys.clear();joy=null;},safePoint,moveOnMap,walkable,clearLine,get G(){return G},get W(){return W},get H(){return H},get SC(){return SC},HEROES,EVOS,HOOKS,CAST,nearest,each,hit,rm,text,juice,aimDir,combo,ring,TAU,puff,banner,rand,AUTO,GHOSTS,$,makeGhost,showBossBar,hideBossBar,hurtPlayer,tryCast,updateSkillBar,addXP,dropCoin};
installHeroes(api);
installAsha(api);
installMira(api);
installDani(api);
installVanna(api);
installKeo(api);
installNadi(api);
installLia(api);
installIdentities(api);
const equipment=installEquipment(api);
const encounters=installEncounters(api,equipment);
const jetty=installJettyGangway(api);
const wau=installWauLookout(api);
installHunt(api,encounters);
installWard(api,encounters);
installCharms(api);
api.eventActive=encounters.active;
const raid=installRaid(api);
buildRoute();
const menuHeroes=Object.values(HEROES).map(h=>({
  id:h.id,name:h.name,country:h.country,frame:menuFrame(h.id),color:h.identity.color,flag:menuFlag(h.country)
}));
installHeroWheel(menuHeroes,showHero,controller.signal);
const shop=installUpgradeShop({
  heroes:menuHeroes,selectedHero:()=>{
    startRequest++;updateStartButton();
    SAVE=readSave(SAVE);updateMenuWallet();
    return heroPick;
  },signal:controller.signal,buy:buyUpgrade,
  read:id=>({coins:SAVE.coins,levels:SAVE.heroUpgrades?.[id],owned:heroOwned(id)})
});
listen(window,'storage',event=>{
  if(event.key!==SAVE_KEY&&event.key!==null)return;
  const previous=SAVE;
  SAVE=readSave(SAVE);updateMenuWallet();shop.refresh();
  if(!G&&(previous.cleared.join()!==SAVE.cleared.join()||previous.retainedStages.join()!==SAVE.retainedStages.join()))buildRoute();
});
return {
  audio,get G(){return G},get scale(){return SC},get joystick(){return joy},raid,resize,
  tryCast,newGame,dropPup,openLevelUp,addXP,kill,makeGhost,endGame,toMenu,togglePause,
  step(delta){
    audio.setPaused(!G||G.paused||G.choosing||G.lootModal||G.over||document.hidden);
    if(!G)return;
    if(!G.practice&&G.pending>0&&!G.paused&&!G.choosing&&!G.lootModal&&!G.over&&!G.won)openLevelUp();
    equipment.sync();
    const dt=Math.min(.05,delta/1000);
    if(!G.paused&&!G.choosing&&!G.lootModal&&!G.over){if(G.stop>0)G.stop-=dt;else update(dt)}
    if(!G.raid){
      Object.assign(G.p,safePoint(G.p.x,G.p.y,G.p.r));
      for(const e of G.enemies)if(!e.dead&&!walkable(e.x,e.y,e.r))Object.assign(e,safePoint(e.x,e.y,e.r));
      if(!G.practice&&!G.paused&&!G.choosing&&!G.lootModal&&!G.over)explore();
    }
    G.shake=Math.max(0,G.shake-dt*40);equipment.sync();encounters.sync();jetty.sync();wau.sync();updateHud();
  },
  destroy(){$('upgradeShop').close();audio.destroy();controller.abort();G=null}
};
}
