import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
export function drawKeo(scene:SurvivalScene,g:RunState){
  for(const f of g.fx){if(f.kind!=='spell'||f.hero!=='keo')continue;const alpha=Math.min(1,f.life/.15),a=f.a||0;
    if(f.slot===1)scene.floor.fillStyle(0x9edba6,.12*alpha).lineStyle(2,0x9edba6,alpha).beginPath().moveTo(f.x,f.y).arc(f.x,f.y,240,a-Math.PI*35/180,a+Math.PI*35/180,false).closePath().fillPath().strokePath();
    if(f.slot===3)scene.circle(scene.floor,f.x,f.y,150,0x9edba6,.12*alpha,2);
  }
  const s=g.roster.keo as {last:number|null;pulses:{x:number;y:number;at:number}[]}|undefined;if(!s)return;
  if(s.last!==null&&g.t-s.last<=2){const x=g.p.x-30,y=g.p.y-75,progress=Math.min(1,(g.t-s.last)/2);scene.effects.fillStyle(0x1b3028,.9).fillRect(x,y,60,8).fillStyle(0x9edba6,.9).fillRect(x,y,60*progress,8);scene.effects.lineStyle(2,0xffffff,.9).lineBetween(x+45,y-3,x+45,y+11)}
  for(const q of s.pulses)scene.circle(scene.floor,q.x,q.y,180,0x9edba6,.04,1);
}
