import {REGION_DATA} from './regions.js';
export const WORLD_SIZE=6000,HALF=3000;
export const LANDMARKS=[
  {id:'village',name:'Village clearing',x:0,y:0,reward:0},
  {id:'fields',name:'Rice fields',x:-1500,y:-1100,reward:18},
  {id:'grove',name:'Palm groves',x:-1500,y:1400,reward:18},
  {id:'river',name:'Riverbank',x:2100,y:-1100,reward:22},
  {id:'market',name:'Abandoned market',x:2100,y:1300,reward:28}
];
export const BUILDINGS=[
  {id:'house-a',x:-540,y:-460,w:210,h:150}, {id:'house-b',x:350,y:-440,w:230,h:160},
  {id:'house-c',x:-520,y:360,w:190,h:140}, {id:'house-d',x:420,y:380,w:180,h:140},
  {id:'stall-a',x:1770,y:960,w:180,h:120},{id:'stall-b',x:2280,y:970,w:180,h:120},
  {id:'stall-c',x:1750,y:1530,w:180,h:120},{id:'stall-d',x:2290,y:1540,w:180,h:120}
];
export const TREES=[];
for(let i=0;i<48;i++){
  const x=-2550+((i*997)%5100),y=-2500+((i*677)%5000);
  if(Math.abs(x-1350)<350||LANDMARKS.some(s=>Math.hypot(x-s.x,y-s.y)<460))continue;
  TREES.push({x,y,frame:i%4===0?11:10});
}
export const BLOCKERS=[...BUILDINGS,...TREES.map((t,i)=>({id:'tree-'+i,x:t.x-22,y:t.y-18,w:44,h:36})),
  {id:'river-north',x:1220,y:-3000,w:260,h:1660},
  {id:'river-middle',x:1220,y:-860,w:260,h:1520},
  {id:'river-south',x:1220,y:1140,w:260,h:1860}
];
export function createWorld(id='johor'){
const region=REGION_DATA[id]||{id:'johor',name:'Kampung Outskirts',signature:'stalker',landmarks:LANDMARKS,buildings:BUILDINGS,trees:TREES,waters:BLOCKERS.filter(b=>b.id.startsWith('river')),bridges:[{x:1140,y:-1340,w:420,h:480},{x:1140,y:660,w:420,h:480}],rocks:[],paddies:[[-2250,-1850]],roads:[[[0,0],[-700,-650],[-1500,-1100]],[[0,0],[-750,800],[-1500,1400]],[[0,0],[800,-1100],[2100,-1100]],[[0,0],[700,900],[2100,900],[2100,1300]]],tint:0xb6c5b0,path:0x8a8057,water:0x1a4c54,urban:false};
const blockers=id==='johor'?BLOCKERS:[...region.buildings,...region.waters,...region.rocks,...region.trees.map((t,i)=>({id:'tree-'+i,x:t.x-22,y:t.y-18,w:44,h:36}))];
function walkable(x,y,r=20){return Math.abs(x)<=HALF-r&&Math.abs(y)<=HALF-r&&!blockers.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)}
function safePoint(x,y,r=24){
  x=Math.max(-HALF+r,Math.min(HALF-r,x));y=Math.max(-HALF+r,Math.min(HALF-r,y));
  if(walkable(x,y,r))return{x,y};
  for(let distance=60;distance<1200;distance+=60)for(let k=0;k<16;k++){const a=k*Math.PI/8,nx=x+Math.cos(a)*distance,ny=y+Math.sin(a)*distance;if(walkable(nx,ny,r))return{x:nx,y:ny}}
  return{x:0,y:0};
}
function moveOnMap(x,y,toX,toY,r=20){
  if(!walkable(x,y,r)){const start=safePoint(x,y,r);x=start.x;y=start.y}
  const steps=Math.max(1,Math.ceil(Math.hypot(toX-x,toY-y)/24)),dx=(toX-x)/steps,dy=(toY-y)/steps;
  for(let n=0;n<steps;n++){if(walkable(x+dx,y,r))x+=dx;if(walkable(x,y+dy,r))y+=dy}
  return{x,y};
}
const CELL=120,N=WORLD_SIZE/CELL,free=Array.from({length:N*N},(_,i)=>walkable((i%N+.5)*CELL-HALF,(Math.floor(i/N)+.5)*CELL-HALF,64));
let targetCell=-1,dist=new Int32Array(N*N);
const cell=(x,y)=>Math.max(0,Math.min(N-1,Math.floor((y+HALF)/CELL)))*N+Math.max(0,Math.min(N-1,Math.floor((x+HALF)/CELL)));
function field(target){
  let goal=cell(target.x,target.y);
  if(!free[goal]){let best=Infinity;for(let i=0;i<free.length;i++)if(free[i]){const d=Math.hypot((i%N+.5)*CELL-HALF-target.x,(Math.floor(i/N)+.5)*CELL-HALF-target.y);if(d<best){best=d;goal=i}}}
  if(goal===targetCell)return;targetCell=goal;dist.fill(-1);dist[goal]=0;const queue=[goal];
  for(let head=0;head<queue.length;head++){const i=queue[head];for(const j of [i-N,i+N,...(i%N?[i-1]:[]),...(i%N<N-1?[i+1]:[])])if(j>=0&&j<N*N&&free[j]&&dist[j]<0){dist[j]=dist[i]+1;queue.push(j)}}
}
function clearLine(a,b,r){
  for(const o of blockers){let lo=0,hi=1;for(const [start,delta,min,max]of [[a.x,b.x-a.x,o.x-r,o.x+o.w+r],[a.y,b.y-a.y,o.y-r,o.y+o.h+r]]){if(Math.abs(delta)<.001){if(start<min||start>max){hi=-1;break}}else{const p=(min-start)/delta,q=(max-start)/delta;lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q))}}if(lo<=hi)return false}return true;
}
function routeDirection(actor,target){
  let x=target.x,y=target.y;
  if(!clearLine(actor,target,actor.r||24)){
    field(target);const i=cell(actor.x,actor.y);let best=i;
    for(const j of [i-N,i+N,...(i%N?[i-1]:[]),...(i%N<N-1?[i+1]:[])])if(j>=0&&j<N*N&&dist[j]>=0&&(dist[best]<0||dist[j]<dist[best]))best=j;
    x=(best%N+.5)*CELL-HALF;y=(Math.floor(best/N)+.5)*CELL-HALF;
  }
  const d=Math.hypot(x-actor.x,y-actor.y)||1;return[(x-actor.x)/d,(y-actor.y)/d];
}

return {...region,blockers,walkable,safePoint,moveOnMap,routeDirection,clearLine};
}
// Legacy region fixture uses an independent Johor world; runs never share navigation state.
const johor=createWorld();
export const {walkable,safePoint,moveOnMap,routeDirection,clearLine}=johor;
