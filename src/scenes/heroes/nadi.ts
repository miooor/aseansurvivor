import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface Layer {x:number;y:number;at:number}
export function drawNadi(scene:SurvivalScene,g:RunState){
  const state=g.roster.nadi as {layers:Layer[];discs:Layer[]}|undefined;if(!state)return;
  for(const q of state.discs){scene.circle(scene.floor,q.x,q.y,80,0xe8a977,.1,3);scene.circle(scene.effects,q.x,q.y,12,0xffe1b0,.6,2)}
  for(const q of state.layers){const mature=g.t-q.at>=2-1e-8;scene.circle(scene.floor,q.x,q.y,90,0xe8a977,mature?.17:.06,2);scene.circle(scene.effects,q.x,q.y,9,0xe8a977,mature?.9:0,2);}
}
