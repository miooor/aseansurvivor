export function roadWidth(region,index){
  return (region.id==='kl'?310:region.urban?214:156)+(index%3-1)*22;
}

function roadSegments(region,roads){
  return roads.flatMap((path,index)=>path.slice(1).map(([x,y],i)=>{
    const [startX,startY]=path[i];
    return {x:startX,y:startY,dx:x-startX,dy:y-startY,radius:roadWidth(region,index)/2};
  }));
}

function crosses({x,y,dx,dy,radius},rect,pad){
  const margin=radius+pad;
  let first=0,last=1;
  for(const [start,delta,low,high] of [
    [x,dx,rect.x-margin,rect.x+rect.w+margin],
    [y,dy,rect.y-margin,rect.y+rect.h+margin]
  ]){
    if(!delta){if(start<low||start>high)return false;continue}
    const a=(low-start)/delta,b=(high-start)/delta;
    first=Math.max(first,Math.min(a,b));last=Math.min(last,Math.max(a,b));
    if(first>last)return false;
  }
  return true;
}

const overlaps=(a,b,pad=0)=>a.x+a.w+pad>b.x&&a.x-pad<b.x+b.w&&a.y+a.h+pad>b.y&&a.y-pad<b.y+b.h;

const offsets=[64,120,185,245,330,420,515].flatMap(radius=>Array.from({length:16},(_,i)=>{
  const angle=i*Math.PI/8;
  return [Math.round(radius*Math.cos(angle)),Math.round(radius*Math.sin(angle))];
}));

export function arrangeRoadsideScenery(region,{roads,buildings,trees,landmarks,waters,rocks,encounters,gangway,wauLookout,half}){
  const segments=roadSegments(region,roads);
  const clearOfRoads=(rect,pad=0)=>!segments.some(segment=>crosses(segment,rect,pad));
  const reserved=landmarks.map(({x,y})=>({x:x-94,y:y-94,w:188,h:188}));
  for(const {x,y} of encounters)reserved.push({x:x-64,y:y-64,w:128,h:128});
  if(gangway)reserved.push(gangway,{x:gangway.winch.x-110,y:gangway.winch.y-110,w:220,h:220});
  if(wauLookout)reserved.push({...wauLookout,w:wauLookout.w+160});
  const terrain=[...waters,...rocks];
  const fits=rect=>rect.x>-half&&rect.y>-half&&rect.x+rect.w<half&&rect.y+rect.h<half&&
    !terrain.some(blocker=>overlaps(rect,blocker))&&!reserved.some(area=>overlaps(rect,area,12));

  // Keep the authored frontage first. Move only the plots that cross a road or another footprint.
  const placed=[],pending=[];
  const vacant=rect=>!placed.some(other=>overlaps(rect,other,26));
  for(const rect of buildings){
    if(fits(rect)&&vacant(rect)&&clearOfRoads(rect,20))placed.push(rect);
    else pending.push(rect);
  }
  for(const rect of pending){
    for(const [dx,dy] of offsets){
      const candidate={...rect,x:rect.x+dx,y:rect.y+dy};
      if(fits(candidate)&&vacant(candidate)&&clearOfRoads(candidate,20)){placed.push(candidate);break}
    }
  }
  const outline=(x,y)=>({x:x-30,y:y-28,w:60,h:56});
  const woods=trees.filter(({x,y})=>{
    const footprint=outline(x,y);
    return fits(footprint)&&clearOfRoads(footprint,26)&&!placed.some(rect=>overlaps(footprint,rect,24));
  });
  return {buildings:placed,trees:woods,clearOfRoads};
}
