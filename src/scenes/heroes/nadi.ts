import {THOUSAND_PALMS_RADIUS} from '../../game/heroes/nadi.js';
import type {SurvivalScene} from '../SurvivalScene';
import type {Point,RunState} from '../../game/runtime.js';

interface PalmWave extends Point {ax:number;ay:number;distance:number;width:number;empowered:boolean}
interface Monk extends Point {angle:number;swingUntil:number}
interface Refuge extends Point {radius:number;until:number;monks:Monk[]}
export interface MonkKit {
  barrage:{beat:number;next:number}|null;
  waves:PalmWave[];
  guard:{until:number}|null;
  ward:Refuge|null;
}

export function drawNadi(scene:SurvivalScene,g:RunState){
  const s=g.roster.nadi as MonkKit|undefined;
  if(!s)return;
  const gold=0xf6cb7d;
  const {ward}=s,p=g.p;
  if(ward&&ward.until>g.t){
    scene.circle(scene.floor,ward.x,ward.y,ward.radius,gold,.10,3);
    scene.circle(scene.floor,ward.x,ward.y,ward.radius-8,gold,.04,1);
    scene.circle(scene.floor,ward.x,ward.y,39,gold,.25,2);
    for(const monk of ward.monks)scene.circle(scene.floor,monk.x,monk.y,17,gold,.14);
  }
  if(s.barrage)scene.circle(scene.floor,p.x,p.y,THOUSAND_PALMS_RADIUS,gold,.06,2);
  if(s.guard&&s.guard.until>g.t){
    scene.circle(scene.floor,p.x,p.y,35,gold,.12,3);
    scene.circle(scene.effects,p.x,p.y-15,25,gold,.12,2);
  }
  for(const f of g.fx){
    if(f.kind==='ring'&&f.hero==='nadi')scene.circle(scene.floor,f.x,f.y,f.r??95,gold,.14*f.life/f.max,3);
  }
}
