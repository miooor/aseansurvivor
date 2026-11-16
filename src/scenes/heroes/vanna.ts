import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface Strip{x:number;y:number;ax:number;ay:number}
export function drawVanna(scene:SurvivalScene,g:RunState){
  for(const f of g.fx)if(f.kind==='spell'&&f.hero==='vanna'&&f.slot===3)scene.circle(scene.floor,f.x,f.y,110,0xe79ac7,.12*Math.min(1,f.life/.15),2);
  const s=g.roster.vanna as {q:Strip|null;e:Strip|null;cross:{x:number;y:number}|null;patches:{x:number;y:number}[]}|undefined;if(!s)return;
  for(const q of [s.q,s.e]){if(!q)continue;const points=[[-140,-20],[140,-20],[140,20],[-140,20]].map(([x,y])=>({x:q.x+x*q.ax-y*q.ay,y:q.y+x*q.ay+y*q.ax}));scene.floor.fillStyle(0xe79ac7,.15).lineStyle(2,0xe79ac7,.9).beginPath().moveTo(points[0].x,points[0].y);for(const point of points.slice(1))scene.floor.lineTo(point.x,point.y);scene.floor.closePath().fillPath().strokePath()}
  if(s.cross){scene.circle(scene.effects,s.cross.x,s.cross.y,60,0xffe2f3,.12,3);scene.effects.lineStyle(2,0xffe2f3,.9).lineBetween(s.cross.x-9,s.cross.y,s.cross.x+9,s.cross.y).lineBetween(s.cross.x,s.cross.y-9,s.cross.x,s.cross.y+9)}
  for(const q of s.patches)scene.circle(scene.floor,q.x,q.y,200,0xe79ac7,.12,3);
}
