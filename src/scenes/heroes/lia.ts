import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
import type {Actor,SpriteAssets} from '../SpriteAssets';
import type {AtlasActors} from '../AtlasActors';
import {liaWheelActive} from '../../game/heroes/lia.js';

export function bladeWheelAngle(g:RunState,reduced:boolean){
  if(!liaWheelActive(g))return null;
  const {castAngle,castT,castMax}=g.identity;
  return castAngle+(reduced?0:(1-castT/castMax)*2*Math.PI);
}

export function drawBladeWheel(actors:AtlasActors,assets:SpriteAssets,hero:Actor,footY:number,angle:number){
  const facing=Math.round(angle/(Math.PI/4))*Math.PI/4;
  const side=Math.cos(facing),depth=Math.sin(facing);
  const key='lia-blade-wheel';
  actors.add({key,frame:assets.frame(key,0),x:hero.x+side*43,y:hero.y-76+depth*12,
    width:132,height:132,originY:.5,rotation:angle,tint:0xffffff,alpha:hero.alpha},footY+(depth<-.25?-7:7),false);
}

interface Smoke {x:number;y:number;r:number;start:number;until:number;facing:number}
export function drawShadowstep(actors:AtlasActors,assets:SpriteAssets,g:RunState,hero:Actor,reduced:boolean){
  const {smoke}=g.roster.lia as {smoke:Smoke|null};
  if(!smoke||smoke.until<=g.t)return;
  const age=g.t-smoke.start,fade=Math.min(1,(smoke.until-g.t)*2.5),phase=reduced?0:age;
  const frame=assets.frame('lia-smoke',0);
  for(let i=0;i<4;i++){
    const angle=i*Math.PI/2+phase*.20;
    const x=smoke.x+Math.cos(angle)*smoke.r*.37,y=smoke.y+Math.sin(angle)*smoke.r*.32;
    const size=smoke.r*(1.25+.12*Math.sin(phase*2+i));
    actors.add({key:'lia-smoke',frame,x,y:y-7-phase*2,width:size,height:size*.69,
      originY:.70,rotation:.09*Math.sin(angle),tint:0xffffff,alpha:fade*.85,flipX:i%2===1},y,false);
  }
  const key='hero-motion-lia';
  actors.add({...hero,key,frame:assets.frame(key,56+smoke.facing),x:smoke.x,y:smoke.y,
    rotation:0,alpha:.59*fade,tint:0xb99be5},smoke.y,false);
}

export function drawLia(scene:SurvivalScene,g:RunState){
  const s=g.roster.lia as {shadow:{x:number;y:number;until:number}|null};
  const {smoke}=g.roster.lia as {smoke:Smoke|null};
  if(smoke&&smoke.until>g.t)scene.circle(scene.floor,smoke.x,smoke.y,smoke.r,0x4a395a,.14*Math.min(1,(smoke.until-g.t)*2.5),1);
  if(s?.shadow&&s.shadow.until>g.t){
    scene.circle(scene.floor,s.shadow.x,s.shadow.y,27,0x251d40,.42,2);
    scene.circle(scene.floor,g.p.x,g.p.y,12,0xc8b7ff,.22,2);
  }
}
