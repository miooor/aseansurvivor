import {inDirectedLine} from '../geometry.js';
import {basicProjectileCount} from '../skill-ranks.js';
import {installKitState} from './direct-skills.js';

const ID='nadi';
const GOLD='#f6cb7d';
export const THOUSAND_PALMS_RADIUS=105;
export const THOUSAND_PALMS_BEAT=.12;
const PALM_BEATS=9, PALMS_PER_BEAT=11;
const CRITS_NEEDED=9, MEMORY_TIME=6;
const WAVE_RANGE=300, WAVE_WIDTH=140, WAVE_SPEED=780;

export function installNadi(api){
  const {HEROES,CAST,AUTO,HOOKS,aimDir,nearest,each,hit,rm}=api;
  const hero=HEROES.nadi={id:'nadi',name:'Nadi',country:'Myanmar',role:'Monk scholar · close-range flurries',hp:115,speed:180,ultNeed:60,basicDamage:14,
    identity:{title:'Monk of Mingun',name:'Perfect Recall',color:GOLD,max:CRITS_NEEDED,key:'E',
      inspiration:'Inspired by Mingun Sayadaw (1911–1993), the Burmese Buddhist scholar renowned for reciting the Tipiṭaka from memory.',
      loop:'Land nine critical hits with Thousand Palms within six seconds of your last critical. Spend full Recall on Hand of Buddha for 50% more damage.',
      hint:'Q · Land critical palms',ready:'E · Unleash Perfect Recall'},
    skills:[
      {key:'',name:'Open Palm',desc:'Strike a nearby foe for 14 damage every 0.65s.',up:'+25% damage. Strike one more nearby foe at ranks 3 and 5.',cd:.65},
      {key:'Q',name:'Thousand Palms',baseDamage:.65,damageLabel:'Damage per palm',desc:'Strike up to 99 times within radius 105 over 1.08s, with +12 percentage points of critical chance. Criticals build Perfect Recall.',up:'+25% damage per palm.',cd:5},
      {key:'E',name:'Hand of Buddha',baseDamage:54,damageLabel:'Base wave hit',desc:'Send an open-palm shockwave 300 units forward in a 140-unit-wide lane. Perfect Recall increases its damage by 50%.',up:'+25% wave damage.',cd:5.5},
      {key:'F',name:'Still Palm',baseDamage:28,damageLabel:'Base counter before crit',desc:'Guard for 1.5s. The first incoming hit deals half damage and triggers a critical counter within radius 95.',up:'+25% counter damage.',cd:10},
      {key:'R',name:'Buddha’s Refuge',baseDamage:22,damageLabel:'Base guardian strike',desc:'Raise a Buddha statue ahead for 6s. Take 30% less damage within its radius of 170 while three spectral monks pursue and strike nearby foes.',up:'+25% damage per guardian strike.',cd:0,ult:true}
    ]};
  const state=installKitState(api,ID,()=>({barrage:null,waves:[],guard:null,ward:null,criticals:0,recallUntil:0}));
  const options=slot=>({hero:ID,slot});
  const expires=(at,t)=>at<=t+1e-8;

  function updateRecall(g,s){
    if(expires(s.recallUntil,g.t))s.criticals=0;
    if(!g.identity)return;
    const ready=s.criticals===CRITS_NEEDED;
    const time=Math.max(0,Math.ceil(s.recallUntil-g.t));
    const detail=s.barrage?`${s.barrage.beat*PALMS_PER_BEAT}/99 · ${s.criticals} crits`
      :s.criticals?`${s.criticals}/9 crits · ${time}s`:'0 / 9';
    Object.assign(g.identity,{charge:s.criticals,ready,detail});
  }

  function strikePalms(g,s){
    const b=s.barrage,p=g.p;
    while(!g.won&&b.beat<PALM_BEATS&&expires(b.next,g.t)){
      b.beat++;
      b.next+=THOUSAND_PALMS_BEAT;
      each(p.x,p.y,THOUSAND_PALMS_RADIUS,e=>{
        if(g.won||!api.clearLine(p,e,0))return;
        const batch={damage:0,criticals:0};
        const contact={...options(1),criticalBonus:.12,batch};
        for(let i=0;i<PALMS_PER_BEAT&&!e.dead&&!g.won;i++)hit(e,b.damage,contact);
        if(batch.damage&&!g.won)api.resolveHitFeedback(e,batch.damage,batch.criticals>0,contact);
        if(batch.criticals&&s.criticals<CRITS_NEEDED){
          s.criticals=Math.min(CRITS_NEEDED,s.criticals+batch.criticals);
          s.recallUntil=g.t+MEMORY_TIME;
        }
      });
    }
    if(b.beat===PALM_BEATS)s.barrage=null;
  }

  function advanceWave(g,wave){
    const {x,y,ax,ay,distance}=wave;
    const front=Math.min(WAVE_RANGE,(g.t-wave.at)*WAVE_SPEED);
    const from={x:x+distance*ax,y:y+distance*ay};
    for(const e of g.enemies){
      if(g.won)break;
      if(e.dead||wave.hit.has(e)||(e.x-x)*ax+(e.y-y)*ay<0)continue;
      if(!inDirectedLine(e,from.x,from.y,ax,ay,front-distance,WAVE_WIDTH)||!api.clearLine(wave,e,0))continue;
      wave.hit.add(e);
      hit(e,wave.damage,options(2));
    }
    wave.distance=front;
    return front<WAVE_RANGE;
  }

  function advanceWard(g,ward,dt){
    for(const monk of ward.monks){
      if(g.won)break;
      let target=null,reach=Infinity;
      each(ward.x,ward.y,ward.radius,e=>{
        const gap=Math.hypot(e.x-monk.x,e.y-monk.y);
        if(gap<reach&&api.clearLine(monk,e,0)){target=e;reach=gap}
      });
      const offset=target?target.r+26:0;
      const dest=target?{
        x:target.x+Math.cos(monk.flank)*offset,
        y:target.y+Math.sin(monk.flank)*offset
      }:monk.home;
      const dx=dest.x-monk.x,dy=dest.y-monk.y,length=Math.hypot(dx,dy);
      const travel=Math.min(225*dt,length);
      if(travel)Object.assign(monk,api.moveOnMap(monk.x,monk.y,monk.x+dx/length*travel,monk.y+dy/length*travel,9));
      if(target)monk.angle=Math.atan2(target.y-monk.y,target.x-monk.x);
      else if(travel)monk.angle=Math.atan2(dy,dx);
      if(target&&reach<=32+target.r&&expires(monk.strikeAt,g.t)){
        monk.strikeAt=g.t+.85;
        monk.swingUntil=g.t+.22;
        hit(target,ward.damage,options(4));
      }
    }
  }

  HOOKS.update.push(dt=>{
    const g=api.G;
    if(g.hero.id!==ID||g.won)return;
    const s=state();
    updateRecall(g,s);
    if(s.barrage)strikePalms(g,s);
    s.waves=s.waves.filter(wave=>!g.won&&advanceWave(g,wave));
    if(s.guard&&expires(s.guard.until,g.t))s.guard=null;
    if(s.ward){
      if(expires(s.ward.until,g.t))s.ward=null;
      else advanceWard(g,s.ward,dt);
    }
    if(!g.won)updateRecall(g,s);
  });

  HOOKS.hurt.push(amount=>{
    const g=api.G;
    if(g.hero.id!==ID)return;
    const s=state(),p=g.p,ward=s.ward,guard=s.guard;
    if(ward&&!expires(ward.until,g.t)&&Math.hypot(p.x-ward.x,p.y-ward.y)<=ward.radius)amount*=.7;
    if(amount<=0||!guard||expires(guard.until,g.t))return amount;
    s.guard=null;
    each(p.x,p.y,95,e=>{
      if(!g.won&&api.clearLine(p,e,0))hit(e,guard.damage,{...options(3),forceCritical:true});
    });
    g.fx.push({kind:'ring',hero:ID,slot:3,x:p.x,y:p.y,r:95,c:GOLD,life:.35,max:.35});
    return amount*.5;
  });

  // Casts can follow one another during practice, but only one flurry and one ward are active.
  CAST.nadi=[
    rank=>{
      const g=api.G,p=g.p,hitTargets=new Set();
      let swings=0,angle=0;
      const count=basicProjectileCount(ID,rank);
      while(swings<count){
        const e=nearest(p.x,p.y,72,hitTargets);
        if(!e)break;
        hitTargets.add(e);
        if(!api.clearLine(p,e,0))continue;
        if(!swings)angle=Math.atan2(e.y-p.y,e.x-p.x);
        swings++;
        hit(e,hero.basicDamage*rm(rank),options(0));
        if(g.won)break;
      }
      if(!swings)return false;
      return {angle};
    },
    rank=>{
      const g=api.G,s=state();
      if(s.barrage)return false;
      s.barrage={beat:0,next:g.t+THOUSAND_PALMS_BEAT,damage:hero.skills[1].baseDamage*rm(rank)};
    },
    rank=>{
      const g=api.G,s=state(),p=g.p,[ax,ay]=aimDir();
      updateRecall(g,s);
      const empowered=s.criticals===CRITS_NEEDED;
      if(empowered){
        s.criticals=0;s.recallUntil=0;g.identity.releaseT=1;
        api.signatureReleased();updateRecall(g,s);
      }
      s.waves.push({x:p.x,y:p.y,ax,ay,at:g.t,distance:0,hit:new Set(),
        width:WAVE_WIDTH,empowered,damage:hero.skills[2].baseDamage*rm(rank)*(empowered?1.5:1)});
    },
    rank=>{
      const g=api.G;
      state().guard={until:g.t+(g.evo[3]?3:1.5),damage:hero.skills[3].baseDamage*rm(rank)};
    },
    rank=>{
      const g=api.G,p=g.p,{radius,duration}=g.technique,[ax,ay]=aimDir();
      const center=api.moveOnMap(p.x,p.y,p.x+ax*62,p.y+ay*62,16);
      const monks=Array.from({length:3},(_,i)=>{
        const angle=Math.PI/2+i*Math.PI*2/3;
        const home=api.moveOnMap(center.x,center.y,center.x+Math.cos(angle)*62,center.y+Math.sin(angle)*62,9);
        return {...home,home,angle,flank:angle,strikeAt:g.t,swingUntil:0};
      });
      state().ward={...center,radius,until:g.t+duration,monks,damage:hero.skills[4].baseDamage*rm(rank)};
    }
  ];
  AUTO.nadi={independent:true,order:[1,2,3,4],when:[
    null,n=>n(THOUSAND_PALMS_RADIUS)>0,n=>api.G.identity.ready||!state().barrage&&n(280)>0,
    n=>n(70)>0,n=>n(170)>=4
  ]};
}
