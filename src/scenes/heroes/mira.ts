import {MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE} from '../../game/heroes/mira.js';
import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';

export function drawMira(scene:SurvivalScene,g:RunState,painted=false){
  const s=g.roster.mira as {braceUntil:number;wave:{x:number;y:number;ax:number;ay:number;width:number;length:number;distance:number}|null};
  if(painted){
    const ink=scene.floor;
    for(const f of g.fx){
      if(f.kind!=='spell'||f.hero!=='mira')continue;
      const angle=f.a??0,alpha=Math.min(1,f.life/.14)*.5;
      ink.lineStyle(2,0xa3d5c8,alpha);
      if(f.slot===0)ink.beginPath().arc(f.x,f.y,MIRA_BASIC_REACH,angle-MIRA_BASIC_HALF_ANGLE,angle+MIRA_BASIC_HALF_ANGLE).strokePath();
      if(f.slot===1){
        const ax=Math.cos(angle),ay=Math.sin(angle);
        for(const side of [-14,14]){
          const x=f.x-ay*side,y=f.y+ax*side;
          ink.lineBetween(x,y,x+ax*(f.range??240),y+ay*(f.range??240));
        }
      }
      if(f.slot===2||f.slot===3)ink.strokeCircle(f.x,f.y,f.slot===2?(f.range??110):120);
    }
    const wave=s.wave;
    if(wave){
      ink.lineStyle(2,0xb7dacf,.42);
      for(const side of [-wave.width/2,wave.width/2]){
        const x=wave.x-wave.ay*side,y=wave.y+wave.ax*side;
        ink.lineBetween(x+wave.ax*wave.distance,y+wave.ay*wave.distance,x+wave.ax*wave.length,y+wave.ay*wave.length);
      }
    }
    return;
  }
  if(s.braceUntil<=g.t)return;
  // Crossed deck timbers travel with the protected rescuer until the guard expires.
  const {x,y}=g.p,ink=scene.effects;
  const shield=[[-25,-13],[0,-22],[25,-13],[21,9],[0,25],[-21,9]];
  ink.fillStyle(0x184b5a,.56).lineStyle(3,0xffce83,.98).beginPath().moveTo(x-25,y-13);
  for(const [dx,dy] of shield.slice(1))ink.lineTo(x+dx,y+dy);
  ink.closePath().fillPath().strokePath();
  for(const side of [-1,1])ink.lineStyle(4,0xffdb9e,.94).lineBetween(x+side*14,y-8,x-side*10,y+11);
}
