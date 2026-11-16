import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
export function drawLia(scene:SurvivalScene,g:RunState){
  const s=g.roster.lia as {shuttles:{x:number;y:number;age:number;ultimate:boolean;r:number}[];spools:number;wideUntil:number}|undefined;if(!s)return;
  if(g.t<s.wideUntil)scene.circle(scene.floor,g.p.x,g.p.y,60,0xe8c979,.05,2);
  for(let i=0;i<3;i++)scene.circle(scene.effects,g.p.x+(i-1)*13,g.p.y-70,4,0xe8c979,i<s.spools?.9:0,2);
  for(const q of s.shuttles){const ready=!q.ultimate&&q.age>=.65;scene.circle(scene.effects,q.x,q.y,q.r,q.ultimate?0xffe6a0:0xe8c979,.8,2);if(ready)scene.circle(scene.effects,q.x,q.y,q.r+6,0xffffff,.12,2);scene.effects.lineStyle(2,0x493923,1).lineBetween(q.x-q.r,q.y,q.x+q.r,q.y)}
}
