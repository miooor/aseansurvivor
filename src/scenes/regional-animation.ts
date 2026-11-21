import {regionalWindup} from '../content/regional-ghosts.js';
import type {Enemy, Point} from '../game/runtime.js';
import type {Actor} from './SpriteAssets';

const HOVERING=new Set(['guaKelawar','enggangStormwing','pontianak','penanggal','shade','lantern','neon','drifter','kite','mooring','ledangGlint','jettyTideback','cengalProw',
  'quaysideSamambu','nightDrongo','telagaGoldJar','sevenWellsShard','gelanggiRampart','mayangDrift','marakCrockery']);
const LOW_STRIDE=new Set(['foam','bakauBelangkas','bubuSnapjaw','becaRevenant','biawakArus']);
const RELEASE_HOLD=.24;
const RECOVERY=.18;

// Offsets are rows of poses within one atlas. All frames share a ground pivot.
export function regionalPose(actor:Actor,baseFrame:number,enemy:Enemy,target:Point,time:number,reduced:boolean,poseStride=9,paintedWindup=false){
  const windup=enemy.windup||enemy.slamWind||0;
  const age=time-(enemy.attackAt??-Infinity);
  const charging=(enemy.rush??0)>0;
  const released=age<RELEASE_HOLD||charging;
  const aim=(windup>0||released)&&enemy.attackAngle!==undefined
    ?Math.cos(enemy.attackAngle):undefined;
  actor.flipX=aim===undefined?(enemy.faceX??((enemy.objective??target).x<enemy.x)):aim<0;
  actor.originY=.91;

  const stride=(enemy.stride??0)/(enemy.type==='sentinel'?18:12);
  const walking=enemy.moving&&!windup&&!released;
  const frame=baseFrame+(windup&&paintedWindup?2:released?(paintedWindup?3:2):
    !reduced&&walking&&Math.floor(stride)%2?1:0)*poseStride;
  if(charging&&enemy.type==='tenggilingRoller'&&enemy.stun<=0){
    actor.originY=.5;
    actor.width*=.78;
    actor.height*=.78;
    actor.y-=actor.height*.41;
    if(!reduced)actor.rotation=(actor.flipX?-1:1)*(enemy.stride??0)/25;
    return frame;
  }
  if(reduced||enemy.stun>0)return frame;

  const facing=actor.flipX?-1:1;
  const hovering=HOVERING.has(enemy.type);
  const idle=Math.sin(time*4+enemy.phase);
  if(windup>0){
    const coil=Math.max(0,1-windup/(enemy.castMax??regionalWindup(enemy.type)));
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
  }else if(enemy.type==='pocong'&&walking){
    const phase=enemy.boss?enemy.phase*2.5:enemy.phase;
    actor.y-=Math.max(0,Math.sin(phase))*9;
    actor.rotation=facing*.07;
  }else if(walking){
    const step=Math.sin(stride*Math.PI);
    const scuttle=LOW_STRIDE.has(enemy.type);
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
