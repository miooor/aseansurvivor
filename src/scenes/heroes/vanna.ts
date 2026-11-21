import {LOOM_DURATION,LOOM_HALF_SIZE,LOOM_TICK,vannaFamiliarPoint} from '../../game/heroes/vanna.js';
import type {Effect,Enemy,Point,RunState} from '../../game/runtime.js';
import type {Knot,SpellRibbons} from '../SpellRibbons';

const PLUM=0x76295f,ROSE=0xf775be,IVORY=0xffe5df,GOLD=0xffce8f;
const ORCHID=0xbe67ec,BLUSH=0xffafdb;

type ClothCrossSection={center:Knot; heading:number; spread:number; twist:number};

// Two panels meet at a raised fold. Banking the hems changes their height as
// well as their ground position, so each path is a twisting surface in world space.
function scarf(ink:SpellRibbons,segments:number,sample:(u:number)=>ClothCrossSection,alpha:number,lining=PLUM){
  const left:Knot[]=[],right:Knot[]=[],fold:Knot[]=[];
  for(let i=0;i<=segments;i++){
    const {center:[x,y,h],heading,spread,twist}=sample(i/segments);
    const breadth=spread*Math.cos(twist),height=spread*Math.sin(twist);
    const dx=-Math.sin(heading)*breadth,dy=Math.cos(heading)*breadth;
    left.push([x+dx,y+dy,h+height]);
    right.push([x-dx,y-dy,h-height]);
    fold.push([x,y,h+spread*.22]);
  }
  for(let i=1;i<=segments;i++){
    const a=i-1,b=i;
    ink.facet([left[a],left[b],fold[a]],lining,alpha);
    ink.facet([left[b],fold[b],fold[a]],lining,alpha);
    ink.facet([fold[a],fold[b],right[a]],ROSE,alpha);
    ink.facet([fold[b],right[b],right[a]],BLUSH,alpha);
  }
  ink.strip(left,1.25,GOLD,alpha,false);
  ink.strip(right,1.15,IVORY,alpha*.83,false);
}

function castSilk(ink:SpellRibbons,f:Effect,reduced:boolean){
  const duration=f.slot===1?.53:.38,age=f.max-f.life;
  if(age>=duration)return;
  const phase=reduced?.57:age/duration,alpha=Math.min(1,(duration-age)/.16);
  const a=f.a??0,dx=Math.cos(a),dy=Math.sin(a);
  if(f.slot===1){
    for(const side of [-1,1])scarf(ink,18,u=>{
      const distance=(38+242*Math.min(1,phase*2.25))*u;
      const drift=side*(6+17*Math.sin(Math.PI*u))*Math.sin(u*4.7+phase*3);
      return {center:[f.x+dx*distance-dy*drift,f.y+dy*distance+dx*drift,19+42*Math.sin(Math.PI*u)],
        heading:a,spread:2+17*Math.sin(Math.PI*u),twist:side*(u*7-phase*3)};
    },alpha*.9,side<0?ORCHID:PLUM);
    return;
  }
  if(f.slot===0||f.slot===undefined)return;
  for(const side of [-1,1])scarf(ink,12,u=>{
    const angle=a+side*(.5+(1.2+phase*1.3)*u);
    const radius=12+u*(f.slot===4?95:67)*(.62+phase*.38);
    return {center:[f.x+radius*Math.cos(angle),f.y+radius*Math.sin(angle),27+58*Math.sin(Math.PI*u)],
      heading:angle+side*Math.PI/2,spread:1+15*Math.sin(Math.PI*u),twist:side*(u*5-phase*3)};
  },alpha*.85,side<0?ORCHID:PLUM);
}


function wraps(ink:SpellRibbons,enemy:Enemy,alpha:number){
  const {x,y,r}=enemy;
  const width=Math.max(13,r*.8);
  for(const [height,tilt,color] of [[17,7,ROSE],[30,-7,IVORY]]){
    ink.strip([[x-width,y,height-tilt],[x,y+4,height],[x+width,y,height+tilt]],3,color,alpha,false);
  }
  ink.glow([x,y+4,25],8,GOLD,alpha);
}

type Familiar={start:number;until:number};

function drawFamiliar(ink:SpellRibbons,g:RunState,familiar:Familiar,reduced:boolean){
  const time=g.t-familiar.start,alpha=Math.min(1,(familiar.until-g.t)/.22);
  for(const side of [-1,1])scarf(ink,17,u=>{
    const {x,y,angle}=vannaFamiliarPoint(g.p,familiar.start,g.t-u*.28);
    const wave=reduced?0:time*11;
    const drift=side*(4+u*9);
    return {center:[x+Math.cos(angle)*drift,y+Math.sin(angle)*drift,41+side*7+19*Math.sin(u*5-wave)],
      heading:angle+Math.PI/2,spread:(1-u)*(9+8*Math.sin(Math.PI*u))+1,
      twist:side*(.4+u*5-wave*.25)};
  },alpha*.93,side<0?ORCHID:PLUM);
  const {x,y}=vannaFamiliarPoint(g.p,familiar.start,g.t);
  ink.glow([x,y,40],17,GOLD,alpha*.66);
}

export function drawVannaWeave(ink:SpellRibbons,g:RunState,reduced:boolean){
  const weave=g.roster.vanna as {raid:RunState['raid'];stitches:Map<Enemy,number>;familiar:Familiar|null;
    loom:(Point&{until:number;targets:Map<Enemy,number>})|null}|undefined;
  if(!weave||weave.raid!==g.raid)return;
  const {stitches,familiar,loom}=weave;
  for(const [enemy,until] of stitches)if(!enemy.dead&&until>g.t)wraps(ink,enemy,.62);
  for(const f of g.fx){
    if(f.hero!=='vanna')continue;
    if(f.kind==='spell')castSilk(ink,f,reduced);
    if(f.kind!=='relay'||f.tx===undefined||f.ty===undefined)continue;
    const alpha=Math.min(1,f.life/.28);
    const lash=f.slot===3,dx=f.tx-f.x,dy=f.ty-f.y,heading=Math.atan2(dy,dx);
    const bend=reduced?0:(f.max-f.life)*12;
    scarf(ink,12,u=>{
      const curve=Math.sin(Math.PI*u)*Math.sin(5*u+bend)*(lash?17:10);
      return {center:[f.x+dx*u-Math.sin(heading)*curve,f.y+dy*u+Math.cos(heading)*curve,
        (lash?42:27)*(1-u)+21*u+26*Math.sin(Math.PI*u)],heading,
        spread:1+Math.sin(Math.PI*u)*(lash?9:6),twist:u*4-bend};
    },alpha,lash?ORCHID:PLUM);
  }
  if(familiar&&familiar.until>g.t)drawFamiliar(ink,g,familiar,reduced);
  if(!loom||loom.until<=g.t)return;
  const {x,y,until}=loom,edge=LOOM_HALF_SIZE,age=LOOM_DURATION-(until-g.t);
  const alpha=Math.min(1,(until-g.t)/.18);
  const beat=reduced?0:Math.max(0,1-age%LOOM_TICK*8);
  const corner=(dx:number,dy:number,h:number):Knot=>[x+dx,y+dy,h];
  const corners=[corner(-edge,-edge,2),corner(edge,-edge,2),corner(edge,edge,2),corner(-edge,edge,2)];
  ink.facet([corners[0],corners[1],corners[2]],PLUM,alpha*.22);
  ink.facet([corners[0],corners[2],corners[3]],PLUM,alpha*.22);
  ink.strip([...corners,corners[0]],9,PLUM,alpha,false);
  ink.strip([...corners,corners[0]],3,GOLD,alpha,false);
  // The cloth panels rise at the four anchors while the dense weave stays
  // close to the ground, keeping the square and the caught enemies readable.
  for(let i=0;i<4;i++){
    const a=corners[i],b=corners[(i+1)%4],dx=b[0]-a[0],dy=b[1]-a[1],heading=Math.atan2(dy,dx);
    const wind=reduced?.55:age*5+i*.6;
    scarf(ink,20,u=>{
      const span=Math.sin(Math.PI*u),ripple=Math.sin(10*u-wind);
      const flare=5+span*(14+ripple*8);
      return {center:[a[0]+dx*u+dy*flare/(2*edge),a[1]+dy*u-dx*flare/(2*edge),
        22+42*span+span*ripple*9+beat*8],heading,spread:3+14*span,twist:.7+ripple*.67};
    },alpha*.76,i%2?ORCHID:PLUM);
  }
  for(const c of corners){
    const top:Knot=[c[0],c[1],27];
    ink.strip([c,top],7,ROSE,alpha,false);
    ink.glow(top,17,GOLD,alpha);
  }

  for(let row=-5;row<=5;row++){
    const offset=row*edge/6;
    const reach=reduced?1:Math.min(1,.25+6*age-Math.abs(row)*.04);
    const warp:Knot[]=[],weft:Knot[]=[];
    for(let col=0;col<=10;col++){
      const d=-edge+2*edge*(col/10)*reach;
      const fold=(col+row)%2===0?2+3*beat:-2-3*beat;
      warp.push(corner(d,offset,8+fold));
      weft.push(corner(offset,-d,8-fold));
    }
    ink.strip(warp,4.5,ROSE,alpha*.64,false);
    ink.strip(weft,3.5,IVORY,alpha*.57,false);
  }
  for(const [enemy,nextTick] of loom.targets){
    if(enemy.dead)continue;
    wraps(ink,enemy,alpha);
    const sinceTick=g.t-nextTick+LOOM_TICK;
    if(!reduced&&sinceTick>=-1e-8&&sinceTick<.13){
      const {x,y,r}=enemy,flash=alpha*(1-Math.max(0,sinceTick)/.13);
      for(const side of [-1,1])
        ink.strip([[x-r*side,y,12],[x,y,27],[x+r*side,y,42]],4,IVORY,flash);
    }
  }
}
