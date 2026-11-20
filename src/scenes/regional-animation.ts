import {regionalWindup} from '../content/regional-ghosts.js';
import type {Enemy, Point} from '../game/runtime.js';
import type {Actor} from './SpriteAssets';

const HOVERING=new Set(['lantern','neon','drifter','kite','ledangGlint','jettyTideback','cengalProw',
  'quaysideSamambu','nightDrongo','telagaGoldJar','sevenWellsShard','gelanggiRampart','mayangDrift','marakCrockery']);
const RELEASE_HOLD=.24;
const RECOVERY=.18;

// Offsets are rows of poses within one atlas. All frames share a ground pivot.
export function regionalPose(actor:Actor,baseFrame:number,enemy:Enemy,target:Point,time:number,reduced:boolean,animatedSheet=true){
  const windup=enemy.windup??0;
  const age=time-(enemy.attackAt??-Infinity);
  const charging=(enemy.rush??0)>0;
  const released=age<RELEASE_HOLD||charging;
  const aim=(windup>0||released)&&enemy.attackAngle!==undefined
    ?Math.cos(enemy.attackAngle):(enemy.objective??target).x-enemy.x;
  actor.flipX=aim<0;
  actor.originY=.91;

  const stride=(enemy.stride??0)/(enemy.type==='sentinel'?18:12);
  const walking=enemy.moving&&!windup&&!released;
  const frame=baseFrame+(animatedSheet?(released?18:!reduced&&walking&&Math.floor(stride)%2?9:0):0);
  if(reduced||enemy.stun>0)return frame;

  const facing=actor.flipX?-1:1;
  const hovering=HOVERING.has(enemy.type);
  const idle=Math.sin(time*4+enemy.phase);
  if(windup>0){
    const coil=1-windup/regionalWindup(enemy.type);
    actor.width*=1+.12*coil;
    actor.height*=1-.20*coil;
    actor.rotation=-facing*.16*coil;
    if(hovering)actor.y-=3+6*coil;
  }else if(released){
    const thrust=Math.max(charging?.45:0,1-age/RELEASE_HOLD);
    actor.width*=1+.11*thrust;
    actor.height*=1-.08*thrust;
    actor.rotation=facing*.12*thrust;
    if(hovering)actor.y-=4+6*thrust;
  }else if(age<RELEASE_HOLD+RECOVERY){
    const recoil=1-(age-RELEASE_HOLD)/RECOVERY;
    actor.height*=1+.08*recoil;
    actor.rotation=-facing*.10*recoil;
    if(hovering)actor.y-=4;
  }else if(hovering){
    actor.y-=5+3*idle;
    actor.rotation=(walking?facing*.06:0)+idle*.045;
  }else if(walking){
    const step=Math.sin(stride*Math.PI);
    const scuttle=enemy.type==='foam';
    actor.y-=Math.abs(step)*(scuttle?1.5:4);
    actor.rotation=step*(scuttle?.12:.07);
  }else{
    actor.height*=1+.018*idle;
    actor.rotation=idle*.025;
  }
  return frame;
}

export function travellerPose(actor:Actor,time:number,cleared:boolean,reduced:boolean){
  if(cleared)return 2;
  if(reduced)return 0;
  const wave=time%3.2;
  if(wave>=.75&&wave<1.65){
    actor.rotation=Math.sin((wave-.75)*Math.PI*4)*.045;
    return 1;
  }
  actor.height*=1+.014*Math.sin(time*3);
  return 0;
}
