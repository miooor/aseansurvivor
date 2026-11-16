import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface MiraState {endpoint:null|{x:number;y:number;startX:number;startY:number;ready:boolean;progress:number;until:number};braceUntil:number;strikes:{x:number;y:number;ax:number;ay:number;at:number}[]}
export function drawMira(scene:SurvivalScene,g:RunState){
  const s=g.roster.mira as MiraState|undefined;if(!s)return;const c=scene.color('#67d8df'),q=s.endpoint,f=scene.floor;
  if(q){scene.circle(f,q.x,q.y,12,c,.85,3);f.lineStyle(q.ready?4:2,c,.9);f.lineBetween(q.x,q.y,g.p.x,g.p.y);f.lineStyle(2,c,.4);f.lineBetween(q.x,q.y,q.startX,q.startY);if(q.ready){f.lineStyle(70,c,.06);f.strokeTriangle(q.x,q.y,q.startX,q.startY,g.p.x,g.p.y);for(const point of [q,{x:q.startX,y:q.startY},g.p])scene.circle(f,point.x,point.y,35,c,.06);f.fillStyle(c,.12);f.fillTriangle(q.x,q.y,q.startX,q.startY,g.p.x,g.p.y);f.lineStyle(2,c,.8);f.strokeTriangle(q.x,q.y,q.startX,q.startY,g.p.x,g.p.y)}for(let i=0;i<3;i++)scene.circle(f,q.x-12+i*12,q.y-23,3,c,q.progress>=(i+1)*30?1:.2)}
  if(s.braceUntil>g.t)scene.circle(scene.effects,g.p.x,g.p.y,31,c,.8,3);
  for(const strike of s.strikes){f.lineStyle(40,c,.07);f.lineBetween(strike.x,strike.y,strike.x+strike.ax*340,strike.y+strike.ay*340);f.lineStyle(2,c,.8);f.lineBetween(strike.x,strike.y,strike.x+strike.ax*340,strike.y+strike.ay*340)}
}
