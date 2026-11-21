import type {RunState} from '../game/runtime.js';
import {STAGES} from '../content/core.js';
import {STAGE_PROPS,STAGE_SCENES} from '../content/stage-scenes';
import type {Actor, SpriteAssets} from './SpriteAssets';

const REGIONAL_BUILDINGS:Record<string,readonly number[]>={
  melaka:[1,1,0],perak:[4,4,0],penang:[7,7,1],kedah:[2,2,0],
  pahang:[3,3,0],terengganu:[5,0,7],kelantan:[6,6,0],selangor:[1,5,7,0]
};

export type SceneryActor = Actor & {
  motion?:'breeze'|'bob';
  emitter?:'steam'|'lantern';
};

function cityFrame(id:string){
  if(id.startsWith('hawker'))return 2;
  if(id.startsWith('office')||id.startsWith('tower'))return 4;
  if(id.startsWith('station')||id.startsWith('monorail'))return 5;
  if(id.startsWith('arcade')||id==='market-facade'||id==='district-1')return 3;
  if(id.includes('kopitiam')||id.startsWith('market')||id.endsWith('b'))return 1;
  return 0;
}

export function buildScenery(world:RunState['world'],assets:SpriteAssets){
  const scenery:SceneryActor[]=[];
  const districtIndex=STAGES.findIndex(stage=>stage.id===world.id);
  function place(key:string,index:number,x:number,y:number,width:number,originY=.96,tint=0xffffff,height?:number,originX=.5){
    const frame=assets.frame(key,index);
    const actor:SceneryActor={x,y,key,frame,width,height:height??width*frame.height/frame.width,
      originX,originY,rotation:0,alpha:1,tint};
    scenery.push(actor);
    return actor;
  }
  if(world.gangway){
    const {x,y}=world.gangway.winch;
    place('regional-workstations',0,x+54,y-15,76,.97);
  }
  if(world.wauLookout){
    const {x,y}=world.wauLookout.station;
    place('regional-workstations',1,x-37,y-17,56,.97);
  }
  for(const [i,b] of world.buildings.entries()){
    const x=b.x+b.w/2,y=b.y+b.h-12;
    const id=b.id??'';
    if(b.id==='featured-landmark'){
      if(world.id==='selangor')place('klang-warehouse',0,x,y,b.w*1.12,.96);
      else place('malaysia-landmarks',districtIndex,x,y,b.w*1.12,.911,0xffffff,
        world.id==='kl'||world.id==='pahang'?b.w*1.35:undefined);
    }else if(world.id==='kl'){
      const frame=cityFrame(id);
      const width=b.w*(frame===0||frame===4?1.32:1.18);
      const tint=[0xffffff,0xf2eeff,0xdce6f5][i%3];
      if(frame===2&&id.endsWith('-1'))place('malaysia-scenery',districtIndex,x,y,width*1.17,.91,tint);
      else place('kl-buildings',frame,x,y,width,.98,tint);
    }else if(world.id!=='selangor'&&(b.id==='district-0'||b.id==='house-a'||(world.id==='terengganu'&&b.id==='district-2'))){
      place('malaysia-scenery',districtIndex,x,y,b.w*1.52,.91);
    }else if(world.id==='johor'){
      if(id.includes('stall')||id.includes('store'))place('malaysia-buildings',i%3?0:7,x,y,b.w*1.22,.98);
      else place('kampung-buildings',i%2,x,y,b.w*1.42);
    }else{
      const palette=REGIONAL_BUILDINGS[world.id];
      const heritage=world.id==='penang'&&(id.startsWith('shore-shops')||id.startsWith('laneway'));
      const tint=i%2?0xf3fff5:0xfff1dd;
      if(id==='jetty-store'||id.startsWith('jetty-shacks')||id.startsWith('platform-shacks')){
        if(i%3)place('malaysia-buildings',7,x,y,b.w*1.22,.98,tint);
        else place('malaysia-scenery',districtIndex,x,y,b.w*1.38,.91,tint);
      }else place('malaysia-buildings',heritage?1:palette[i%palette.length],x,y,b.w*1.33,.98,tint);
    }
  }
  // Sample once at world creation so revisiting a grove restores the same plants.
  let seed=districtIndex+1;
  const random=()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  };
  function groundCover(x:number,y:number,frame:number,width:number){
    const r=width/2;
    if(!world.walkable(x,y,Math.max(20,r))||!world.clearOfRoads({x:x-r,y:y-r,w:width,h:width}))return;
    if(world.bridges.some(b=>x>=b.x-r&&x<=b.x+b.w+r&&y>=b.y-r&&y<=b.y+b.h+r)||
      world.courts.some(c=>((x-c.x)/(c.rx+r))**2+((y-c.y)/(c.ry+r))**2<1)||
      world.landmarks.some(s=>Math.hypot(x-s.x,y-s.y)<150)||
      world.paddies.some(([px,py])=>x>px-r&&x<px+922+r&&y>py-r&&y<py+796+r))return;
    place('regional-foliage',frame,x,y,width,.94);
  }
  const coastal=['penang','terengganu','pahang'].includes(world.id);
  const canopies=coastal?[0,3,2,0,1,3]:[1,2,0,1,3,2];
  for(const [i,t] of world.trees.entries()){
    const frame=canopies[(i+districtIndex)%canopies.length];
    const trunkX=[.30,.5,.5,.34][frame];
    const canopy=place('regional-foliage',frame,t.x,t.y,146+random()*42,.94,0xffffff,undefined,trunkX);
    canopy.motion='breeze';
    // Keep the low plants beneath the canopy and in short trails into the clearing.
    const angle=random()*Math.PI*2;
    for(let j=0;j<(world.urban?1:4);j++){
      const a=angle+j*1.95,r=54+j*27+random()*22;
      groundCover(t.x+Math.cos(a)*r,t.y+Math.sin(a)*r,4+(i+j*3)%8,33+random()*25);
    }
  }
  for(const b of world.rocks){
    const columns=Math.max(1,Math.round(b.w/170)),rows=Math.max(1,Math.round(b.h/230));
    for(let c=0;c<columns;c++)for(let r=0;r<rows;r++){
      const x=b.x+b.w*(c+.48+.11*Math.sin(r*2.2+c))/columns,y=b.y+b.h*(r+.82+.12*Math.cos(c*1.8+r))/rows;
      const width=Math.min(285,b.w/columns*(1.25+.3*Math.sin(c+2*r)**2));
      place('region-props',1,x,y,width,.92,(c+r)%2?0xe7f0dd:0xffffff,width*(.79+.19*Math.cos(r*2+c)**2));
    }
  }
  for(const scene of STAGE_SCENES[world.id]){
    for(const [prop,dx,dy,width] of scene.props){
      const x=scene.x+dx,y=scene.y+dy;
      const actor=place('stage-scene-props',STAGE_PROPS[prop],x,y,width,prop==='sampan'?.78:.96);
      if(prop==='sampan')actor.motion='bob';
      if(prop==='nets'||prop==='batik'||prop==='kites')actor.motion='breeze';
      if(prop==='cart')actor.emitter='steam';
      if(prop==='sign')actor.emitter='lantern';
    }
  }
  return scenery;
}

export function sceneryPose(actor:SceneryActor,time:number){
  const wind=Math.sin(time*1.22+actor.x*.004+actor.y*.003);
  if(actor.motion==='bob')return {...actor,x:actor.x+wind*4,y:actor.y-5-wind*2,rotation:wind*.021};
  if(actor.motion==='breeze')return {...actor,rotation:wind*.013+Math.sin(time*.8)*.009};
  return actor;
}
