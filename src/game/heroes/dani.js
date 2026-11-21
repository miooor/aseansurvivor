import {goldDustDuration} from '../skill-ranks.js';
import {fireAtNearest,installKitState,showCooldown} from './direct-skills.js';

export const GOLD_DUST_RANGE=225;
export const GOLD_DUST_HALF=Math.PI/5;
export const COIN_RAIN_RADIUS=135;
export const COIN_RAIN_INTERVAL=.36;
const COIN_RAIN_WAVES=5, COIN_RAIN_RANGE=360;
const GOLD_DUST_SLOPE=Math.tan(GOLD_DUST_HALF);
const GOLD='#f6c34e';
const SPIN_TURNS=3, SPIN_MOVE_MULTIPLIER=1.35;
export const SPIN_TRAIL_LIFE=.24;
const CHANNELS={
  1:{duration:1.8,interval:.18/SPIN_TURNS},
  4:{duration:3,interval:.20}
};
const readyAt=(when,now)=>when<=now+1e-8;
const spinAngle=(shot,time)=>shot.startAngle+SPIN_TURNS*2*Math.PI*(time-shot.started)/CHANNELS[1].duration;

export function goldSpinMoveMultiplier(g){
  const state=g.roster.dani,channel=state?.channel;
  return state?.raid===g.raid&&channel?.slot===1&&!readyAt(channel.end,g.t)?SPIN_MOVE_MULTIPLIER:1;
}

export function goldDustBuff(g){
  const state=g.roster.dani;
  return state?.raid===g.raid&&state?.dust?.until>g.t+1e-8?state.dust:null;
}

function rainTarget(g){
  const nearby=[];
  for(const enemy of g.enemies){
    if(enemy.dead||enemy.type==='body'&&!enemy.near)continue;
    const distance=Math.hypot(enemy.x-g.p.x,enemy.y-g.p.y);
    if(distance<COIN_RAIN_RANGE+COIN_RAIN_RADIUS+enemy.r)nearby.push({enemy,distance});
  }
  let best=null,bestCount=0,bestDistance=Infinity;
  for(const {enemy,distance} of nearby){
    if(distance>COIN_RAIN_RANGE)continue;
    let count=0;
    for(const {enemy:other} of nearby){
      if((other.x-enemy.x)**2+(other.y-enemy.y)**2<(COIN_RAIN_RADIUS+other.r)**2)count++;
    }
    if(count>bestCount||count===bestCount&&distance<bestDistance){
      best=enemy;
      bestCount=count;
      bestDistance=distance;
    }
  }
  return best;
}

export function installDani(api){
  const {HEROES,CAST,AUTO,HOOKS,hit,each,aimDir,rm}=api;
  const hero=HEROES.dani={id:'dani',name:'The Gold Sultan',country:'Brunei',role:'Seria goldsmith · mobile firepower',hp:140,speed:165,ultNeed:60,basicDamage:16,price:0,
    identity:{title:'The Gold Sultan',name:'Make It Rain',color:GOLD,max:1,key:'F',
      loop:'Q sweeps fire three times and speeds you up. E boosts attacks and F targets the biggest nearby group. Move to steer R.',
      hint:'F · Automatically targets nearby enemies',ready:'F · Rain coins on nearby enemies'},
    skills:[
      {key:'',name:'Gold Rivet',desc:'Fire a gold rivet through two enemies.',up:'+25% damage.',cd:.9},
      {key:'Q',name:'Gold Melting Flamethrower',baseDamage:6,damageLabel:'Base damage per pulse',desc:'Make three full turns in 1.8s, sweeping burning gold dust around you. Move 35% faster while spinning.',up:'+25% damage per pulse and shorter cooldown.',cd:5.5},
      {key:'E',name:'Gold Dust',desc:'For 5s, deal 25% more attack damage and fire basic attacks 50% faster.',up:'+0.5s duration and shorter cooldown.',cd:10},
      {key:'F',name:'Make It Rain',baseDamage:23,damageLabel:'Base damage per wave',desc:'Automatically target the largest group around an enemy within 360 units. Five waves land there. F stays ready if no enemies are in range.',up:'+25% damage per wave and shorter cooldown.',cd:8},
      {key:'R',name:'Bullion Barrage',baseDamage:26,damageLabel:'Base damage per bar',desc:'Channel for 3s and fire a gold bar every 0.20s. Each bar can hit three enemies. Move to steer the stream.',up:'+25% damage per bar.',cd:0,ult:true}
    ]};
  const state=installKitState(api,'dani',()=>({channel:null,rain:null,dust:null,trail:[]}));

  function startChannel(rank,slot){
    const g=api.G,s=state();
    if(slot===1&&s.channel)return false;
    const {p}=g,[ax,ay]=p.moving?p.face:aimDir();
    const {duration,interval}=CHANNELS[slot],angle=Math.atan2(ay,ax);
    s.channel={slot,ax,ay,startAngle:angle,started:g.t,next:g.t+(slot===4?.06:interval/2),end:g.t+duration,damage:hero.skills[slot].baseDamage*rm(rank)};
    if(slot===1)s.channel.nextTurnCue=1;
    return {angle};
  }

  function updateChannel(g,s,dt){
    const shot=s.channel;
    if(!shot)return;
    const p=g.p,{slot}=shot,{interval,duration}=CHANNELS[slot];
    if(slot===1){
      const angle=spinAngle(shot,Math.min(g.t,shot.end));
      shot.ax=Math.cos(angle);
      shot.ay=Math.sin(angle);
      // The cast wrapper plays the first cue. Start the others on the spin clock.
      while(shot.nextTurnCue<SPIN_TURNS&&readyAt(shot.started+shot.nextTurnCue*duration/SPIN_TURNS,g.t)){
        api.audio.play('dani',1);
        shot.nextTurnCue++;
      }
      const move=p.normalMove;
      if(g.t>shot.started&&!readyAt(shot.end,g.t)&&move&&Math.hypot(move.dx,move.dy)>.01){
        s.trail.push({x:move.x-move.dx,y:move.y-move.dy,tx:move.x,ty:move.y,until:g.t+SPIN_TRAIL_LIFE});
      }
    }else if(p.moving)[shot.ax,shot.ay]=p.face;
    while(!g.won&&readyAt(shot.next,g.t)&&readyAt(shot.next,shot.end)){
      const at=shot.next;
      shot.next+=interval;
      if(slot===1){
        const angle=spinAngle(shot,at),ax=Math.cos(angle),ay=Math.sin(angle);
        each(p.x,p.y,GOLD_DUST_RANGE,(e,dx,dy)=>{
          const forward=dx*ax+dy*ay,side=Math.abs(dx*ay-dy*ax);
          if(!g.won&&forward>=0&&side<=forward*GOLD_DUST_SLOPE+e.r&&api.clearLine(p,e,0)){
            hit(e,shot.damage,{hero:'dani',slot});
          }
        });
      }else{
        const {ax,ay}=shot,speed=850;
        g.projs.push({kind:'gold-bar',hero:'dani',x:p.x+ax*24,y:p.y+ay*24,vx:ax*speed,vy:ay*speed,r:13,
          dmg:shot.damage,life:.58,pierce:3,hit:new Set(),hitOptions:{hero:'dani',slot}});
      }
    }
    if(readyAt(shot.end,g.t)){
      s.channel=null;
    }else if(slot===1||g.identity.castSlot===slot||g.identity.castT<=dt){
      g.identity.castSlot=slot;
      g.identity.castMax=duration;
      g.identity.castT=shot.end-g.t+dt;
      g.identity.castAngle=Math.atan2(shot.ay,shot.ax);
    }
  }

  function updateRain(g,s){
    const rain=s.rain;
    if(!rain)return;
    while(!g.won&&rain.wave<COIN_RAIN_WAVES&&readyAt(rain.next,g.t)){
      let landed=false;
      each(rain.x,rain.y,COIN_RAIN_RADIUS,e=>{
        if(!g.won&&hit(e,rain.damage,{hero:'dani',slot:3}))landed=true;
      });
      if(landed&&!rain.released){
        rain.released=true;
        g.identity.releaseT=.6;
        api.signatureReleased();
      }
      g.fx.push({kind:'coinfall',hero:'dani',slot:3,x:rain.x,y:rain.y,waveIndex:rain.wave,r:COIN_RAIN_RADIUS,life:.32,max:.32});
      rain.wave++;
      rain.next+=COIN_RAIN_INTERVAL;
    }
    if(rain.wave===COIN_RAIN_WAVES)s.rain=null;
  }

  CAST.dani=[
    rank=>fireAtNearest(api,rank,{range:360,speed:440,pierce:2}),
    rank=>startChannel(rank,1),
    rank=>{
      const g=api.G,{damage,fireRate}=g.technique;
      state().dust={started:g.t,until:g.t+goldDustDuration(rank,g.evo[2]),damage,fireRate};
    },
    rank=>{
      const g=api.G,s=state(),target=rainTarget(g);
      if(!target){
        if(!g.autoAim)api.text(g.p.x,g.p.y-48,'No targets in range',GOLD,15);
        return false;
      }
      s.rain={x:target.x,y:target.y,next:g.t+.38,wave:0,released:false,damage:hero.skills[3].baseDamage*rm(rank)};
    },
    rank=>startChannel(rank,4)
  ];

  HOOKS.dmgMul.push((_enemy,options)=>options.origin==='item'?1:goldDustBuff(api.G)?.damage??1);
  HOOKS.update.push(dt=>{
    const g=api.G;
    if(g.hero.id!=='dani'||g.won)return;
    const s=state();
    while(s.trail.length&&readyAt(s.trail[0].until,g.t))s.trail.shift();
    updateChannel(g,s,dt);
    updateRain(g,s);
    if(s.dust&&readyAt(s.dust.until,g.t))s.dust=null;
    showCooldown(g,3,s.rain?'Coins falling':undefined);
  });
  AUTO.dani={independent:true,order:[2,4,3,1],when:[
    null,n=>!state().channel&&n(GOLD_DUST_RANGE)>0,
    n=>!goldDustBuff(api.G)&&(!!state().channel||n(GOLD_DUST_RANGE)>=2),n=>n(COIN_RAIN_RANGE)>0,
    n=>state().channel?.slot!==4&&n(380)>=5
  ]};
}
