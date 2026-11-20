import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';

export function drawMira(scene:SurvivalScene,g:RunState){
  const s=g.roster.mira as {braceUntil:number};
  if(s.braceUntil<=g.t)return;
  // Crossed deck timbers travel with the protected rescuer until the guard expires.
  const {x,y}=g.p,ink=scene.effects;
  const shield=[[-25,-13],[0,-22],[25,-13],[21,9],[0,25],[-21,9]];
  ink.fillStyle(0x184b5a,.56).lineStyle(3,0xffce83,.98).beginPath().moveTo(x-25,y-13);
  for(const [dx,dy] of shield.slice(1))ink.lineTo(x+dx,y+dy);
  ink.closePath().fillPath().strokePath();
  for(const side of [-1,1])ink.lineStyle(4,0xffdb9e,.94).lineBetween(x+side*14,y-8,x-side*10,y+11);
}
