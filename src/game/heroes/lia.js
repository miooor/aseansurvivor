import {inDirectedLine} from '../geometry.js';
import {fireAtNearest,installKitState,showCooldown} from './direct-skills.js';

export const BLADE_WHEEL_RADIUS=145;
export const CRESCENT_CUT_WIDTH=88;
const BACKSTAB_LIFESTEAL=.25;

const SMOKE_SECONDS=3,SMOKE_RADIUS=125,SMOKE_MISS_CHANCE=.6;

export function inLiaSmoke(g,attacker){
  const s=g.roster?.lia,smoke=s?.smoke;
  return !!(smoke&&s.raid===g.raid&&smoke.until>g.t&&attacker&&
    Math.hypot(attacker.x-smoke.x,attacker.y-smoke.y)<=smoke.r);
}

export function smokeMiss(blinded,roll=Math.random){
  return !!blinded&&roll()<SMOKE_MISS_CHANCE;
}

export function liaShadow(g){
  const s=g.roster.lia;
  return g.hero.id==='lia'&&s&&s.raid===g.raid&&s.shadow?.until>g.t?s.shadow:null;
}

export function liaWheelActive(g){
  return g.identity.castSlot===3&&g.identity.castT>0;
}

export function installLia(api){
  const {HEROES,CAST,AUTO,HOOKS,hit,rm,aimDir,moveOnMap,clearLine}=api;
  HEROES.lia={id:'lia',name:'Lia Soares',country:'Timor-Leste',role:'Shadow assassin · stealth and ambush',hp:95,speed:205,ultNeed:50,basicDamage:18,
    identity:{title:'Shadow Assassin',name:'Shadowstep',color:'#b8a2ff',max:1,key:'E',loop:'Press E to vanish and blink behind a foe for a lifestealing backstab.',hint:'E · Blink and backstab',ready:'E · Shadowstep'},
    skills:[
      {key:'',name:'Dusk Knife',desc:'Automatically throw a knife at the nearest enemy while visible.',up:'+25% damage.',cd:.75},
      {key:'Q',name:'Crescent Cut',techniqueDamage:'damage',desc:'Send a wide crescent of shadow through enemies ahead.',up:'+25% damage and shorter cooldown.',cd:5},
      {key:'E',name:'Shadowstep',baseDamage:72,damageLabel:'Backstab',desc:`Vanish for 3s and blink. Backstab an aimed foe and heal for ${BACKSTAB_LIFESTEAL*100}% of the health taken. Leave a smoky illusion for ${SMOKE_SECONDS}s. Enemies in the smoke miss ${SMOKE_MISS_CHANCE*100}% of attacks. Aim into open space to escape.`,up:'+25% damage, +0.4s hidden and shorter cooldown.',cd:6},
      {key:'F',name:'Blade Wheel',baseDamage:42,desc:'Spin with a five-pointed blade inspired by Timor-Leste’s flag. Hit nearby foes and halve their speed for 2 seconds. Attacking reveals you.',up:'+25% damage and shorter cooldown.',cd:8},
      {key:'R',name:'Midnight Hunt',baseDamage:34,damageLabel:'Base strike',desc:'Blink between nearby foes for three strikes, returning to a lone foe if needed.',up:'+25% damage per strike.',cd:0,ult:true}]};
  const state=installKitState(api,'lia',()=>({shadow:null,hunt:null,smoke:null}));
  function pick(range,aim,skip){
    const g=api.G,p=g.p;let best=null,score=Infinity;
    for(const e of g.enemies){
      if(e.dead||e===skip||(e.type==='body'&&!e.near))continue;
      const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
      if(d>range||!clearLine(p,e,p.r))continue;
      const alignment=aim?(dx*aim[0]+dy*aim[1])/(d||1):1;
      if(aim&&alignment<.70)continue;
      const priority=d*(2-alignment);
      if(priority<score){best=e;score=priority}
    }
    return best;
  }
  function blink(target,aim,range,damage,slot){
    const g=api.G,p=g.p,x=p.x,y=p.y;
    const dx=target?target.x-x:aim[0],dy=target?target.y-y:aim[1],d=Math.hypot(dx,dy);
    const ax=d?dx/d:aim[0],ay=d?dy/d:aim[1];
    const travel=target?d+target.r+p.r+3:range;
    const end=moveOnMap(x,y,x+ax*travel,y+ay*travel,p.r);
    Object.assign(p,end,{vx:0,vy:0,normalMove:null,face:[target?-ax:ax,target?-ay:ay]});
    g.fx.push({kind:'shadowstep',hero:'lia',slot,x,y,tx:p.x,ty:p.y,life:.36,max:.36});
    if(!target||Math.hypot(target.x-p.x,target.y-p.y)>target.r+p.r+10)return 0;
    const hpBefore=target.hp;
    hit(target,damage,{hero:'lia',slot});
    return Math.max(0,hpBefore-Math.max(0,target.hp));
  }
  function huntStrike(s){
    const g=api.G,h=s.hunt;
    const target=pick(300,null,h.last)||pick(300);
    if(!target){s.hunt=null;return false}
    blink(target,g.p.face,300,h.damage,4);h.last=target;
    if(--h.left===0)s.hunt=null;else h.next=g.t+.18;
    return true;
  }
  HOOKS.update.push(()=>{
    const g=api.G;if(g.hero.id!=='lia')return;const s=state();
    if(s.shadow&&s.shadow.until<=g.t)s.shadow=null;
    if(s.smoke&&s.smoke.until<=g.t)s.smoke=null;
    if(s.hunt&&g.t>=s.hunt.next)huntStrike(s);
    showCooldown(g,2,s.shadow?'Hidden · '+(s.shadow.until-g.t).toFixed(1)+'s':'');
  });
  CAST.lia=[
    r=>liaShadow(api.G)||state().hunt?false:fireAtNearest(api,r,{range:350,speed:520,pierce:1}),
    r=>{const g=api.G,[x,y]=aimDir();state().shadow=null;
      for(const e of g.enemies)if(!e.dead&&inDirectedLine(e,g.p.x,g.p.y,x,y,g.technique.length,CRESCENT_CUT_WIDTH))
        hit(e,g.technique.damage*rm(r),{hero:'lia',slot:1})},
    r=>{const g=api.G,s=state(),aim=aimDir(),range=g.evo[2]?280:210;
      const damage=g.hero.skills[2].baseDamage*rm(r);
      s.hunt=null;
      s.shadow={x:g.p.x,y:g.p.y,r:g.p.r,vx:0,vy:0,until:g.t+3+.4*(r-1)};
      s.smoke={x:g.p.x,y:g.p.y,r:SMOKE_RADIUS,start:g.t,until:g.t+SMOKE_SECONDS,
        facing:(Math.round(Math.atan2(aim[1],aim[0])/(Math.PI/4))+8)%8};
      const drained=blink(pick(range,aim),aim,range,damage,2);
      if(drained>0){
        const p=g.p,heal=Math.min(p.maxHp-p.hp,drained*BACKSTAB_LIFESTEAL);
        if(heal>0){p.hp+=heal;api.text(p.x,p.y-40,'Lifesteal','#a6edc1',14)}
        api.signatureReleased();
      }},
    r=>{const g=api.G;state().shadow=null;
      for(const e of g.enemies){
        if(e.dead||(e.type==='body'&&!e.near)||Math.hypot(e.x-g.p.x,e.y-g.p.y)>BLADE_WHEEL_RADIUS+e.r||!clearLine(g.p,e,0))continue;
        if(hit(e,g.hero.skills[3].baseDamage*rm(r),{hero:'lia',slot:3}))e.slowT=Math.max(e.slowT||0,2);
      }},
    r=>{const g=api.G,s=state();s.hunt={left:3,next:g.t,last:null,damage:g.hero.skills[4].baseDamage*rm(r)};
      if(!huntStrike(s))return false;s.shadow=null}
  ];
  const canFollowUp=()=>!state().hunt&&!liaWheelActive(api.G);
  AUTO.lia={independent:true,order:[4,3,1,2],when:[
    null,
    n=>canFollowUp()&&n(api.G.technique.length)>0,
    n=>canFollowUp()&&!liaShadow(api.G)&&(api.G.identity.castT<=0||api.G.identity.castSlot===0)&&n(api.G.evo[2]?280:210)>0,
    n=>canFollowUp()&&n(BLADE_WHEEL_RADIUS)>=(liaShadow(api.G)?1:2),
    n=>canFollowUp()&&n(280)>=2
  ]};
}
