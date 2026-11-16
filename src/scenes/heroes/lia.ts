import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
export function drawLia(scene:SurvivalScene,g:RunState){
  for(const f of g.fx){if(f.kind!=='spell'||f.hero!=='lia')continue;const alpha=Math.min(1,f.life/.15);
    if(f.slot===1){const a=f.a||0,dx=Math.cos(a),dy=Math.sin(a),points=[[0,-17.5],[240,-17.5],[240,17.5],[0,17.5]].map(([x,y])=>({x:f.x+x*dx-y*dy,y:f.y+x*dy+y*dx}));scene.floor.fillStyle(0xe8c979,.12*alpha).lineStyle(2,0xe8c979,alpha).beginPath().moveTo(points[0].x,points[0].y);for(const point of points.slice(1))scene.floor.lineTo(point.x,point.y);scene.floor.closePath().fillPath().strokePath()}
    if(f.slot===3)scene.circle(scene.floor,f.x,f.y,120,0xe8c979,.12*alpha,2);
  }
  const s=g.roster.lia as {shuttles:{x:number;y:number;age:number;ultimate:boolean;r:number}[];spools:number;wideUntil:number}|undefined;if(!s)return;
  if(g.t<s.wideUntil)scene.circle(scene.floor,g.p.x,g.p.y,60,0xe8c979,.05,2);
  for(let i=0;i<3;i++)scene.circle(scene.effects,g.p.x+(i-1)*13,g.p.y-70,4,0xe8c979,i<s.spools?.9:0,2);
  for(const q of s.shuttles){const ready=!q.ultimate&&q.age>=.65;scene.circle(scene.effects,q.x,q.y,q.r,q.ultimate?0xffe6a0:0xe8c979,.8,2);if(ready)scene.circle(scene.effects,q.x,q.y,q.r+6,0xffffff,.12,2);scene.effects.lineStyle(2,0x493923,1).lineBetween(q.x-q.r,q.y,q.x+q.r,q.y)}
}
