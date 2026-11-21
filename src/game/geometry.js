// Direction must be normalized; width is the full lane width, including both sides.
export function inDirectedLine(enemy,x,y,ax,ay,length,width){
  const dx=enemy.x-x,dy=enemy.y-y,t=dx*ax+dy*ay;
  return t>=-enemy.r&&t<=length+enemy.r&&Math.abs(dx*ay-dy*ax)<=width/2+enemy.r;
}

// True when the swept segment from (x0,y0) to (x1,y1) comes within radius r of
// (cx,cy). A clamped 50 ms step moves a basic shot ~24 units, well past the
// radius of a small ghost, so endpoint-only tests miss hits.
export function segmentHitsCircle(x0,y0,x1,y1,cx,cy,r){
  const dx=x1-x0,dy=y1-y0,len2=dx*dx+dy*dy;
  const t=len2>0?Math.max(0,Math.min(1,((cx-x0)*dx+(cy-y0)*dy)/len2)):0;
  const px=x0+dx*t-cx,py=y0+dy*t-cy;
  return px*px+py*py<=r*r;
}

// The vertices are ordered along a convex outline. Check both the center and
// the closest point on each edge so the actor's radius also counts at corners.
export function overlapsConvexPolygon(actor,points){
  let positive=false,negative=false;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];
    const dx=b.x-a.x,dy=b.y-a.y,px=actor.x-a.x,py=actor.y-a.y;
    const cross=dx*py-dy*px;
    positive ||=cross>0;
    negative ||=cross<0;
    const t=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy)));
    if((px-t*dx)**2+(py-t*dy)**2<=actor.r**2)return true;
  }
  return !(positive&&negative);
}

export function overlapsMonsterMark(actor,mark){
  if(mark.kind==='lane')return inDirectedLine(actor,mark.x,mark.y,mark.dx,mark.dy,mark.length,mark.width);
  if(mark.kind==='polygon')return overlapsConvexPolygon(actor,mark.points);
  const distance=Math.hypot(actor.x-mark.x,actor.y-mark.y);
  return distance<mark.r+actor.r&&distance+actor.r>=mark.inner;
}
