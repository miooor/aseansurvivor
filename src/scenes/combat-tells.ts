import type {Point} from '../game/runtime.js';
import type {BattleMarks} from './BattleMarks';

const DANGER=0xffac89,DANGER_FILL=0xe74449;
const SLOW=0xbce4ff,SLOW_FILL=0x457fc9;
export const EXPOSED_INK='#aaffdf';

// Teeth point into the real hit area. The warm edge stays legible over
// elemental effects whose fill colours can vary from one cast to the next.
export function damageCircle(floor:BattleMarks,{x,y}:Point,r:number,inner=0,weight=1,tint=DANGER_FILL){
  if(r<=0)return;
  floor.fillStyle(tint,.29*weight);
  if(inner)floor.fillRing(x,y,r,inner);
  else floor.fillCircle(x,y,r);
  floor.lineStyle(3.5,DANGER,weight).strokeCircle(x,y,r);
  if(inner)floor.lineStyle(3,DANGER,weight).strokeCircle(x,y,inner);
  const tooth=Math.min(17,(r-inner)*.72,r*.43);
  const width=Math.min(.24,10/r);
  const count=r>=65?6:4;
  floor.fillStyle(DANGER,weight);
  for(let i=0;i<count;i++){
    const a=(i+.5)*Math.PI*2/count;
    floor.fillTriangle(
      x+r*Math.cos(a-width),y+r*Math.sin(a-width),
      x+(r-tooth)*Math.cos(a),y+(r-tooth)*Math.sin(a),
      x+r*Math.cos(a+width),y+r*Math.sin(a+width));
  }
}

export function damagePolygon(floor:BattleMarks,points:Point[],weight=1,tint=DANGER_FILL){
  floor.fillStyle(tint,.29*weight).fillPoints(points);
  floor.lineStyle(3.5,DANGER,weight).beginPath();
  for(const {x,y} of points)floor.lineTo(x,y);
  floor.closePath().strokePath();

  const center=points.reduce((p,q)=>({x:p.x+q.x/points.length,y:p.y+q.y/points.length}),{x:0,y:0});
  floor.fillStyle(DANGER,weight);
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];
    const length=Math.hypot(b.x-a.x,b.y-a.y);
    const count=Math.min(3,Math.max(1,Math.floor(length/75)));
    const half=Math.min(8/length,.27/count);
    for(let j=0;j<count;j++){
      const at=(j+.5)/count;
      const x=a.x+(b.x-a.x)*at,y=a.y+(b.y-a.y)*at;
      const depth=Math.min(.42,13/(Math.hypot(center.x-x,center.y-y)||1));
      floor.fillTriangle(
        x-(b.x-a.x)*half,y-(b.y-a.y)*half,
        x+(center.x-x)*depth,y+(center.y-y)*depth,
        x+(b.x-a.x)*half,y+(b.y-a.y)*half);
    }
  }
}

export function damageLane(floor:BattleMarks,{x,y}:Point,dx:number,dy:number,length:number,width:number,weight=1,tint=DANGER_FILL){
  const tx=x+dx*length,ty=y+dy*length,ox=-dy*width/2,oy=dx*width/2;
  damagePolygon(floor,[{x:x+ox,y:y+oy},{x:tx+ox,y:ty+oy},{x:tx-ox,y:ty-oy},{x:x-ox,y:y-oy}],weight,tint);
}

export function slowField(floor:BattleMarks,{x,y}:Point,r:number,covered=false){
  floor.fillStyle(SLOW_FILL,.22).fillCircle(x,y,r);
  floor.lineStyle(3,SLOW,.86);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    floor.beginPath().arc(x,y,r,a,a+.49).strokePath();
  }
  // The small status marker sits under the actor, so its waves sit in front.
  const offset=covered?r*.34:0;
  for(const row of [-.26,0,.26]){
    const y0=y+offset+row*r;
    floor.beginPath().moveTo(x-r*.52,y0).lineTo(x-r*.26,y0-r*.12)
      .lineTo(x,y0).lineTo(x+r*.26,y0-r*.12).lineTo(x+r*.52,y0).strokePath();
  }
}

export function exposedBrackets(floor:BattleMarks,{x,y}:Point,r:number){
  const width=r+17,y0=y+9;
  for(const side of [-1,1]){
    const edge=x+width*side,tip=edge-9*side;
    floor.lineStyle(8,0x104b46,.94).beginPath().moveTo(edge,y0-11)
      .lineTo(tip,y0).lineTo(edge,y0+11).strokePath();
    floor.lineStyle(4,0xaaffdf,1).beginPath().moveTo(edge,y0-11)
      .lineTo(tip,y0).lineTo(edge,y0+11).strokePath();
  }
}
