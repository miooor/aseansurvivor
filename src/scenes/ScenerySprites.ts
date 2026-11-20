import type {RunState} from '../game/runtime.js';
import {STAGES} from '../content/core.js';
import type {Actor, SpriteAssets} from './SpriteAssets';

const REGIONAL_BUILDINGS:Record<string,readonly number[]>={
  melaka:[1,1,0],perak:[4,4,0],penang:[7,7,1],kedah:[2,2,0],
  pahang:[3,3,0],terengganu:[5,0,7],kelantan:[6,6,0]
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
  const scenery:Actor[]=[];
  const districtIndex=STAGES.findIndex(stage=>stage.id===world.id);
  function place(key:string,index:number,x:number,y:number,width:number,originY=.96,tint=0xffffff,height?:number){
    const frame=assets.frame(key,index);
    scenery.push({x,y,key,frame,width,height:height??width*frame.height/frame.width,
      originY,rotation:0,alpha:1,tint});
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
      place('malaysia-landmarks',districtIndex,x,y,b.w*1.12,.911,0xffffff,
        world.id==='kl'||world.id==='pahang'?b.w*1.35:undefined);
    }else if(world.id==='kl'){
      const frame=cityFrame(id);
      const width=b.w*(frame===0||frame===4?1.32:1.18);
      const tint=[0xffffff,0xf2eeff,0xdce6f5][i%3];
      if(frame===2&&id.endsWith('-1'))place('malaysia-scenery',districtIndex,x,y,width*1.17,.91,tint);
      else place('kl-buildings',frame,x,y,width,.98,tint);
    }else if(b.id==='district-0'||b.id==='house-a'||(world.id==='terengganu'&&b.id==='district-2')){
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
  for(const [i,t] of world.trees.entries()){
    const palm=world.id==='johor'||world.id==='pahang'||world.id==='penang';
    const width=palm?144+i%3*16:114+i%3*13;
    place('actors',palm||i%3===0?10:11,t.x,t.y,width,.94,world.id==='pahang'?0xd4f2cc:0xf2f6d9);
  }
  for(const b of world.rocks){
    const columns=Math.max(1,Math.round(b.w/170)),rows=Math.max(1,Math.round(b.h/230));
    for(let c=0;c<columns;c++)for(let r=0;r<rows;r++){
      const x=b.x+b.w*(c+.48+.11*Math.sin(r*2.2+c))/columns,y=b.y+b.h*(r+.82+.12*Math.cos(c*1.8+r))/rows;
      const width=Math.min(285,b.w/columns*(1.25+.3*Math.sin(c+2*r)**2));
      place('region-props',1,x,y,width,.92,(c+r)%2?0xe7f0dd:0xffffff,width*(.79+.19*Math.cos(r*2+c)**2));
    }
  }
  for(const site of world.landmarks){
    const positions=[[-162,113],[162,113],[-213,-105],[213,-105],[0,215]];
    const clear=positions.map(([dx,dy])=>({x:site.x+dx,y:site.y+dy})).filter(({x,y})=>
      world.walkable(x,y,28)&&world.clearOfRoads({x:x-12,y:y-12,w:24,h:24}));
    for(const {x,y} of clear.slice(0,site.featured||site.reward===0?2:1))place('actors',12,x,y,54,.94);
  }
  return scenery;
}
