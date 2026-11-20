// Direction must be normalized; width is the full lane width, including both sides.
export function inDirectedLine(enemy,x,y,ax,ay,length,width){
  const dx=enemy.x-x,dy=enemy.y-y,t=dx*ax+dy*ay;
  return t>=-enemy.r&&t<=length+enemy.r&&Math.abs(dx*ay-dy*ax)<=width/2+enemy.r;
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
