import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
export function drawKeo(scene:SurvivalScene,g:RunState){
  const s=g.roster.keo as {last:number|null;pulses:{x:number;y:number;at:number}[]}|undefined;if(!s)return;
  if(s.last!==null&&g.t-s.last<=2){const x=g.p.x-30,y=g.p.y-75,progress=Math.min(1,(g.t-s.last)/2);scene.effects.fillStyle(0x1b3028,.9).fillRect(x,y,60,8).fillStyle(0x9edba6,.9).fillRect(x,y,60*progress,8);scene.effects.lineStyle(2,0xffffff,.9).lineBetween(x+45,y-3,x+45,y+11)}
  for(const q of s.pulses)scene.circle(scene.floor,q.x,q.y,180,0x9edba6,.04,1);
}
