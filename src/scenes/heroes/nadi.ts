import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface Layer {x:number;y:number;at:number;cured?:boolean}
export function drawNadi(scene:SurvivalScene,g:RunState){
  for(const f of g.fx){if(f.kind!=='spell'||f.hero!=='nadi')continue;const alpha=Math.min(1,f.life/.15);
    if(f.slot===1){const a=f.a||0,dx=Math.cos(a),dy=Math.sin(a),points=[[0,-16.0],[260,-16.0],[260,16.0],[0,16.0]].map(([x,y])=>({x:f.x+x*dx-y*dy,y:f.y+x*dy+y*dx}));scene.floor.fillStyle(0xe8a977,.12*alpha).lineStyle(2,0xe8a977,alpha).beginPath().moveTo(points[0].x,points[0].y);for(const point of points.slice(1))scene.floor.lineTo(point.x,point.y);scene.floor.closePath().fillPath().strokePath()}
    if(f.slot===3)scene.circle(scene.floor,f.x,f.y,150,0xe8a977,.12*alpha,2);
  }
  const state=g.roster.nadi as {layers:Layer[];discs:(Layer&{radius:number})[]}|undefined;if(!state)return;
  for(const q of state.discs){scene.circle(scene.floor,q.x,q.y,q.radius,0xe8a977,.1,3);scene.circle(scene.effects,q.x,q.y,12,0xffe1b0,.6,2)}
  for(const q of state.layers){const mature=q.cured||g.t-q.at>=2-1e-8;scene.circle(scene.floor,q.x,q.y,90,0xe8a977,mature?.17:.06,2);scene.circle(scene.effects,q.x,q.y,9,0xe8a977,mature?.9:0,2);}
}
