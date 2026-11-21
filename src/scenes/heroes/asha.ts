import type {SurvivalScene} from '../SurvivalScene';
import type {RunState} from '../../game/runtime.js';
interface AshaState {tickets:{e:{x:number;y:number;r:number};served:boolean;until:number;duration:number}[];fields:{x:number;y:number;start:number;next:number}[]}
const PINK=0xff5fa2,CASH=0xffd34d,TISSUE=0xf4f7ff,BAND=0x6fa8ff,INK=0x142122;
// Auntie Karen: tissue-packet chopes, gold coins once charged, and a spinning sale banner.
export function drawAsha(scene:SurvivalScene,g:RunState){
  const s=g.roster.asha as AshaState|undefined;if(!s)return;
  const c=scene.color('#efc76d'),still=matchMedia('(prefers-reduced-motion: reduce)').matches,spin=still?0:g.t*.6;
  const floor=scene.floor,fx=scene.effects;
  for(const f of s.fields){
    scene.circle(floor,f.x,f.y,220,PINK,.07);
    for(let i=0;i<16;i++){const a=spin+i*Math.PI/8;floor.lineStyle(5,i%2?CASH:PINK,.85).beginPath().arc(f.x,f.y,214,a,a+Math.PI/12).strokePath()}
    for(let i=0;i<4;i++){
      const a=-spin*1.5+i*Math.PI/2,x=f.x+Math.cos(a)*165,y=f.y+Math.sin(a)*165;
      floor.fillStyle(CASH,.95).fillPoints([{x:x-14,y:y-9},{x:x+6,y:y-9},{x:x+15,y},{x:x+6,y:y+9},{x:x-14,y:y+9}]);
      floor.fillStyle(INK,1).fillCircle(x+6,y,2.5);
      // A "%" mark on each price tag.
      floor.fillStyle(PINK,1).fillCircle(x-10,y-4,2).fillCircle(x-2,y+4,2);
      floor.lineStyle(2,PINK,1).lineBetween(x-2,y-5,x-10,y+5);
    }
    for(let i=0;i<5;i++)scene.circle(floor,f.x-32+i*16,f.y-205,4,c,i<f.next-1?1:.2);
  }
  for(const t of s.tickets){
    const bob=still||!t.served?0:Math.sin(g.t*6)*2,x=t.e.x,y=t.e.y-t.e.r-23+bob;
    if(t.served){
      fx.fillStyle(CASH,1).fillCircle(x,y,9);fx.lineStyle(2,INK,1).strokeCircle(x,y,9);
      fx.lineStyle(2,INK,1).beginPath().moveTo(x+4,y-5).lineTo(x-3,y-5).lineTo(x-4,y-1).lineTo(x+4,y+1).lineTo(x+3,y+5).lineTo(x-4,y+5).strokePath();
      fx.lineBetween(x,y-8,x,y+8);
    }else{
      fx.fillStyle(TISSUE,1).fillRect(x-9,y-6,18,12);fx.fillStyle(BAND,1).fillRect(x-9,y-2,18,4);
      fx.lineStyle(2,INK,.9).strokeRect(x-9,y-6,18,12);
    }
    fx.lineStyle(2,c,.8);fx.lineBetween(x-8,y+13,x-8+16*Math.max(0,(t.until-g.t)/t.duration),y+13);
  }
}
