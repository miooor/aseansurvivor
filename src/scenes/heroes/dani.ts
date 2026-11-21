import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface DaniState {anchor:null|{x:number;y:number;ready:boolean;until:number};shield:{hp:number;until:number};fields:{x:number;y:number;start:number;next:number}[]}
export function drawDani(scene:SurvivalScene,g:RunState){
  const s=g.roster.dani as DaniState|undefined;if(!s)return;const c=scene.color('#89d5a1'),f=scene.floor,a=s.anchor;
  for(const effect of g.fx)if(effect.hero==='dani'&&effect.slot===1&&effect.life>0){const ax=Math.cos(effect.a||0),ay=Math.sin(effect.a||0);f.lineStyle(45,c,.1);f.lineBetween(effect.x,effect.y,effect.x+ax*230,effect.y+ay*230);f.lineStyle(2,c,.8);for(const offset of [-22.5,22.5])f.lineBetween(effect.x-ay*offset,effect.y+ax*offset,effect.x+ax*230-ay*offset,effect.y+ay*230+ax*offset)}
  for(const field of s.fields){scene.circle(f,field.x,field.y,200,c,.08);scene.circle(f,field.x,field.y,200,c,.65,4);for(let i=0;i<6;i++){f.lineStyle(3,c,i<field.next-1?1:.25);f.lineBetween(field.x-35+i*14,field.y-187,field.x-35+i*14,field.y-175)}}
  if(a){scene.circle(f,a.x,a.y,70,c,a.ready?.7:.25,2);f.lineStyle(3,c,.9);f.strokeRect(a.x-13,a.y-13,26,26);f.lineBetween(a.x-8,a.y,a.x+8,a.y);f.lineBetween(a.x,a.y-8,a.x,a.y+8);if(a.ready){f.fillStyle(c,.8);f.fillRect(a.x-5,a.y-5,10,10)}}
  if(s.shield.hp>0){scene.effects.lineStyle(4,c,1);scene.effects.strokeRect(g.p.x-25,g.p.y-31,50,54);for(let i=0;i<3;i++)scene.circle(scene.effects,g.p.x-12+i*12,g.p.y-40,4,c,s.shield.hp>i*10?1:.2)}
}
