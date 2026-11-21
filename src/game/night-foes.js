import {NIGHT_FOES,NIGHT_ROSTERS,NIGHT_BUBBLE_RADIUS,NIGHT_FADE_HEAL} from '../content/night-foes.js';
import {ELEMENTS,HERO_ELEMENTS,elementAffinity} from '../content/elements.js';
import {blocksHit} from './combat-policy.js';
import {inJohorRhythm} from './johor-rhythm.js';

const ARRIVALS=[29,51,70,96];
const STATUS_TIMES={burn:2.1,chill:1.9,snare:1.1,frail:2.5,venom:2.2};
const STATUS_NAMES={burn:'Burning',chill:'Chilled',snare:'Snared',frail:'Weakened',venom:'Poisoned'};
const FOE_CAP=2;

export function installNightFoes(api){
  const {HOOKS,makeGhost,safePoint,text,hurtPlayer}=api;
  const canFight=()=>{const g=api.G;return !g.practice&&!g.raid&&!g.won&&!g.over};
  const trait=e=>e.nightEcho?undefined:NIGHT_FOES[e.type]?.trait;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const state=()=>api.G.p.nightStatus;

  HOOKS.newGame.push(g=>{
    g.nightHazards=[];g.fallenGhosts=[];g.nightNext=0;g.nightIndex=0;
    g.p.nightStatus={};
  });
  HOOKS.cleanup.push(()=>{
    const g=api.G;
    if(!g)return;
    g.nightHazards=[];g.fallenGhosts=[];g.p.nightStatus={};
  });

  function spawn(spawnPos){
    if(!canFight())return;
    const g=api.G,roster=NIGHT_ROSTERS[g.stage.id];
    if(!roster||g.clock<g.nightNext||g.enemies.filter(e=>!e.dead&&!e.nightEcho&&NIGHT_FOES[e.type]).length>=FOE_CAP)return;
    const unlocked=ARRIVALS.filter(at=>g.clock>=at).length;
    if(!unlocked)return;
    const fresh=roster.slice(0,unlocked).find(type=>!g.events.has('night:'+type));
    const type=fresh??roster[g.nightIndex++%unlocked];
    const [x,y]=spawnPos(-45);
    makeGhost(type,x,y);
    g.nightNext=g.clock+14;
    g.events.add('night:'+type);
    if(fresh)api.banner(NIGHT_FOES[type].name+'! '+NIGHT_FOES[type].hint,3.5);
  }

  function echo(type,x,y,kind,fraction){
    const g=api.G;
    if(g.enemies.length>=335)return;
    const enemy=makeGhost(type,x,y);
    enemy.nightEcho=kind;
    enemy.hp=enemy.maxHp=Math.max(1,enemy.maxHp*fraction);
    enemy.dmg*=.62;
    enemy.stun=.3;
    if(kind==='fragment'){
      enemy.scale=.57;
      enemy.r*=.64;
    }
    if(kind==='gasp'){
      enemy.nightExpires=g.t+2.4;
      enemy.spd*=1.4;
    }
  }

  function introduceArang(nearbyPoint){
    const g=api.G,type='arangBara';
    const arang=g.enemies.find(e=>!e.dead&&e.type===type&&!e.nightEcho);
    if(!arang||distance(arang,g.p)>420){
      const {x,y}=nearbyPoint(type);
      if(arang)Object.assign(arang,{x,y});
      else makeGhost(type,x,y);
    }
    g.events.add('night:'+type);
    g.nightNext=Math.max(g.nightNext,g.clock+14);
    api.banner('Arang Bara · Wait for the blast before returning for XP.',3.5);
  }

  function hazard(e,kind,r,t,anchored=false){
    const g=api.G;
    if(g.nightHazards.length>=8&&!anchored)return;
    const hazard={x:e.x,y:e.y,kind,r,t,max:t,owner:e,anchored};
    if(anchored)hazard.waiting=true;
    g.nightHazards.push(hazard);
    return hazard;
  }

  function death(e){
    const g=api.G;
    if(!canFight()||e.nightEcho||e.boss||e.elite||e.encounter||e.bossEscort||e.packId||e.type==='body')return;
    let ember;
    switch(trait(e)){
      case 'ember': {
        const anchored=inJohorRhythm(g);
        const flame=hazard(e,'ember',81,1.65,anchored);
        if(anchored)ember=flame;
        break;
      }
      case 'revive': hazard(e,'revive',244,1.05);break;
      case 'split':
        for(const sign of [-1,1])echo(e.type,e.x+sign*28,e.y+sign*21,'fragment',.28);
        break;
      case 'gasp': echo(e.type,e.x,e.y,'gasp',.4);break;
      case 'treasure':
        if(!g.events.has('dulangTimah')){
          g.events.add('dulangTimah');
          g.equipmentDrops.push({...safePoint(e.x,e.y,g.p.r),event:'dulangTimah',slot:'relic',item:'dulangTimah',collectAt:g.t+.65});
        }
        break;
    }
    if(!NIGHT_FOES[e.type]&&e.type!=='penanggal'){
      g.fallenGhosts.push({type:e.type,x:e.x,y:e.y,until:g.t+7});
      if(g.fallenGhosts.length>42)g.fallenGhosts.shift();
    }
    for(const eater of g.enemies){
      if(eater.dead||trait(eater)!=='souls'||(eater.nightSouls??0)>=5||distance(e,eater)>175)continue;
      eater.nightSouls=(eater.nightSouls??0)+1;
      eater.spd*=1.09;
      eater.dmg*=1.12;
    }
    return ember;
  }

  function blocked(e,o){
    if(e.nightEcho==='gasp')return true;
    return trait(e)==='bubble'&&!o.dot&&o.damageType!=='environment'&&distance(api.G.p,e)>NIGHT_BUBBLE_RADIUS;
  }

  function retaliate(e,element,damage,o){
    if(!canFight()||o.dot||o.raw||o.damageType==='environment'||damage<=0)return;
    const g=api.G,p=g.p;
    switch(trait(e)){
      case 'blood':
        if(blocksHit(p,'ailment')||g.t<(state().sapReady??0))break;
        state().sapReady=g.t+.32;
        state().sapStacks=Math.min(3,(state().sapUntil>g.t?state().sapStacks:0)+1);
        state().sapUntil=g.t+2.25;
        state().nextTick??=g.t+.55;
        break;
      case 'physicalThorns':
      case 'elementThorns':
        if((trait(e)==='physicalThorns')!==(element==='physical')||g.t<(e.nightReady??0))break;
        e.nightReady=g.t+.7;
        hurtPlayer(Math.min(8,damage*.18),element==='physical'?'physical':'skill',false,undefined,
          (NIGHT_FOES[e.type]?.name??'Enemy')+' thorns');
        break;
      case 'mirage':
        if(g.t<(e.nightReady??0))break;
        e.nightReady=g.t+3.5;
        hazard(e,'mirage',68,1.5);
        break;
    }
  }

  function status(kind,owner){
    if(!kind||!canFight())return;
    const g=api.G,p=g.p,active=state();
    if(kind==='purge'){
      if(!g.kopiT&&!g.shrineId)return;
      g.kopiT=0;g.shrineId=null;g.shrineT=0;
      text(p.x,p.y-65,'Blessings snuffed','#ddd3f3',Math.max(14,10/api.SC));
      return;
    }
    if(kind==='hex')kind=['chill','frail','snare'][(owner.actions-1)%3];
    if(!STATUS_TIMES[kind])return;
    if(!(active[kind]>g.t))text(p.x,p.y-65,STATUS_NAMES[kind],'#ddd3f3',Math.max(14,10/api.SC));
    active[kind]=g.t+STATUS_TIMES[kind];
    if(kind==='burn'||kind==='venom')active.nextTick??=g.t+.55;
  }

  function update(dt,johorAttackActive){
    const g=api.G,p=g.p;
    if(!canFight())return;
    g.fallenGhosts=g.fallenGhosts.filter(ghost=>ghost.until>g.t);
    let hazardActive=g.nightHazards.some(h=>!h.waiting);
    g.nightHazards=g.nightHazards.filter(h=>{
      if(h.waiting){
        if(johorAttackActive||hazardActive)return true;
        h.waiting=false;
        hazardActive=true;
      }
      h.t-=dt;
      if(!h.anchored&&h.t>.62&&h.kind!=='revive'){
        const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy)||1;
        const move=Math.min(d,dt*(h.kind==='ember'?146:182));
        h.x+=dx/d*move;h.y+=dy/d*move;
      }
      if(h.t>0)return true;
      if(h.kind==='revive'){
        let count=0;
        g.fallenGhosts=g.fallenGhosts.filter(ghost=>{
          if(count>=3||distance(ghost,h)>h.r)return true;
          echo(ghost.type,ghost.x,ghost.y,'revived',NIGHT_FADE_HEAL);
          count++;
          return false;
        });
      }else{
        const element=h.kind==='ember'?'fire':'lightning';
        api.ring(h.x,h.y,h.r,ELEMENTS[element].color,.3);
        if(distance(p,h)<h.r+p.r){
          const affinity=g.noElements?1:elementAffinity(HERO_ELEMENTS[g.hero.id]??'physical',element);
          hurtPlayer(15*affinity,'skill',false,h.owner,h.kind==='ember'?'Death ember':'Lightning mirage');
        }
      }
      return false;
    });
    const active=state(),stacks=active.sapUntil>g.t?active.sapStacks:0;
    const damage=1.5*stacks+(active.venom>g.t?3:0)+(active.burn>g.t?3:0);
    if(!damage)delete active.nextTick;
    else if(g.t>=(active.nextTick??0)){
      active.nextTick=g.t+.55;
      hurtPlayer(damage,'ailment');
    }
  }

  const blocksPickup=gem=>gem.emberHazard&&api.G.nightHazards.includes(gem.emberHazard);
  return {spawn,introduceArang,death,blocked,retaliate,status,update,blocksPickup,venom:e=>trait(e)==='venom'};
}
