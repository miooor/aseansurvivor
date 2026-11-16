import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface AshaState {tickets:{e:{x:number;y:number;r:number};served:boolean;until:number}[];fields:{x:number;y:number;start:number;next:number}[]}
export function drawAsha(scene:SurvivalScene,g:RunState){
  const s=g.roster.asha as AshaState|undefined;if(!s)return;
  const c=scene.color('#efc76d');
  for(const f of s.fields){scene.circle(scene.floor,f.x,f.y,220,c,.08);scene.circle(scene.floor,f.x,f.y,220,c,.7,3);for(let i=0;i<5;i++)scene.circle(scene.floor,f.x-32+i*16,f.y-205,4,c,i<f.next-1?1:.2)}
  for(const t of s.tickets){const x=t.e.x,y=t.e.y-t.e.r-23;scene.effects.lineStyle(2,c,1);if(t.served){scene.effects.fillStyle(c,1);scene.effects.fillRect(x-8,y-7,16,14);scene.effects.lineStyle(2,0x142122,1);scene.effects.lineBetween(x-5,y,x-1,y+4);scene.effects.lineBetween(x-1,y+4,x+5,y-4)}else scene.effects.strokeRect(x-8,y-7,16,14);scene.effects.lineStyle(2,c,.8);scene.effects.lineBetween(x-8,y+11,x-8+16*Math.max(0,(t.until-g.t)/6),y+11)}
}
