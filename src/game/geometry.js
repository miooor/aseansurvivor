// Direction must be normalized; width is the full lane width, including both sides.
export function inDirectedLine(enemy,x,y,ax,ay,length,width){
  const dx=enemy.x-x,dy=enemy.y-y,t=dx*ax+dy*ay;
  return t>=-enemy.r&&t<=length+enemy.r&&Math.abs(dx*ay-dy*ax)<=width/2+enemy.r;
}
