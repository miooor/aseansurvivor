import type {Knot,SpellRibbons} from './SpellRibbons';
import type {Effect} from '../game/runtime.js';

type Ink=Pick<SpellRibbons,'facet'|'strip'|'glow'>;
const turn=2*Math.PI;
const jade=0x239d90,mint=0xadffdc,gold=0xffbf57,cream=0xffedb3;
const ease=(v:number)=>{const n=Math.max(0,Math.min(1,v));return n*n*(3-2*n)};

// A Hang Tuah-inspired guardian rises behind the caster, steps into guard and
// sweeps a keris outward. All joints and trails belong to this cast.
export function drawSilatSaka(ink:Ink,f:Effect,reduced:boolean){
  const age=1-f.life/f.max,t=reduced?.58:age;
  const fade=Math.min(1,(1-age)*5)*ease(t/.12),appear=ease(t/.24),strike=ease((t-.24)/.39);
  const settle=ease((t-.65)/.35),reach=f.range??200;
  const facing=Math.cos(f.a??0)<0?-1:1;
  const point=(x:number,y:number,h:number):Knot=>[f.x+facing*(x*1.16-37),f.y-45+y,h*1.14+15*appear-8];
  const stroke=(path:Knot[],width:number,c:number,opacity=1)=>ink.strip(path,width,c,opacity*fade,false);
  const wave=ease((t-.19)/.57);
  if(wave>0){
    const ring:Knot[]=[];
    for(let i=0;i<=64;i++)ring.push([f.x+reach*wave*Math.cos(i*turn/64),f.y+reach*wave*Math.sin(i*turn/64),3]);
    stroke(ring,7,jade,.7);stroke(ring,2.4,cream,.95);
  }
  // Loft the visible cloth in curved cross sections. Each row controls the
  // drape independently, from a broad trouser knee to a gathered ankle.
  type Row=[x:number,height:number,width:number];
  type Palette=[number,number,number,number];
  const tunic:Palette=[0x34211f,0x71352c,0xa14732,0x713c30];
  const trousers:Palette=[0x242127,0x39323a,0x554446,0x403436];
  const brocade:Palette=[0x7a462a,0xb37d3e,0xddad62,0x9c6635];
  const skin:Palette=[0x8f5437,0xc18150,0xf0b680,0xd59963];
  function cloth(rows:Row[],depth:number,colors:Palette){
    const arcs=[-1,-.66,-.14,.54,1];
    const row=([x,h,w]:Row)=>arcs.map(u=>point(x+u*w,depth+Math.sqrt(1-u*u)*w*.43,h));
    let previous=row(rows[0]);
    for(const r of rows.slice(1)){
      const next=row(r);
      for(let i=0;i<4;i++){
        ink.facet([previous[i],previous[i+1],next[i+1]],colors[i],fade);
        ink.facet([previous[i],next[i+1],next[i]],colors[i],fade);
      }
      previous=next;
    }
  }
  const panel=(outline:number[][],depth:number,color:number)=>{
    const pts=outline.map(([x,h])=>point(x,depth,h));
    for(let i=1;i+1<pts.length;i++)ink.facet([pts[0],pts[i],pts[i+1]],color,fade);
  };
  const lean=13*strike-5*settle,step=15*strike,head=lean+6;
  cloth([[-53,5,5],[-49,12,6],[-36,31,10],[-31,40,14],[-20,53,14],[lean-3,66,11]],-3,trousers);
  cloth([[41+step,5,5],[41+step,14,6],[34+step,36,10],[28+step,46,14],[lean+13,54,15],[lean,66,12]],4,trousers);
  for(const [x,d] of [[-53,-3],[41+step,4]]){
    panel([[x-5,8],[x+3,10],[x+8,5],[x+15,3],[x+14,1],[x-6,1]],d,0x55362a);
  }
  // The loose waist tie swings a beat behind the hip as the weight shifts.
  const swing=ease((t-.32)/.40);
  panel([[lean-12,73],[lean-19,70],[lean-29-12*swing,57+7*swing],
    [lean-38-12*swing,53+9*swing],[lean-30,63],[lean-18,76]],0,0x984230);
  cloth([[lean,62,17],[lean,74,15],[lean+2,89,17],[lean+4,104,22],[lean+4,109,19],[head,114,8]],1,tunic);
  // Folded lapel and the panel of songket draped at an angle over the thigh.
  stroke([point(head-6,10,112),point(head+2,12,103),point(head+6,12,92)],1.7,0xf3c882);
  cloth([[lean-2,46,19],[lean,53,23],[lean,65,21],[lean,74,16]],9,brocade);
  panel([[lean-14,70],[lean+15,71],[lean+21,49],[lean+4,42]],16,0x85502f);
  for(const h of [48,52,67])stroke([point(lean-17,14,h+4),point(lean,19,h),point(lean+17,14,h-1)],1.6,gold);
  for(const x of [-9,0,9])stroke([point(lean+x-3,19,60),point(lean+x,20,64),point(lean+x+3,19,60),point(lean+x,20,57),point(lean+x-3,19,60)],1.1,cream);

  cloth([[head-1,111,5],[head,120,6],[head,126,7]],2,skin);
  cloth([[head+3,117,4],[head+2,120,8],[head,128,11],[head-1,137,11],[head-1,143,8]],4,skin);
  panel([[head+7,133],[head+15,126],[head+8,125]],12,0xe3a16a);
  stroke([point(head+2,12,134),point(head+8,12,133)],1.6,0x402c27);
  stroke([point(head+5,12,123),point(head+9,12,124),point(head+12,12,123)],1.4,0x513029);
  cloth([[head-1,136,12],[head-2,142,14],[head-3,147,11]],7,brocade);
  panel([[head-14,141],[head-20,158],[head-10,155],[head+12,143]],10,0xac6733);
  panel([[head-16,155],[head-5,163],[head+7,148],[head+14,144],[head-5,145]],11,0xd69b4e);
  stroke([point(head-13,13,138),point(head+2,15,145),point(head+13,12,144)],2.1,cream);
  const bladeAngle=(s:number)=>2.12-2.03*s;
  const bladePoint=(s:number,along:number,across=0):Knot=>{
    const a=bladeAngle(s),c=Math.cos(a),sn=Math.sin(a);
    return point(8+69*s-8*settle+along*c-across*sn,10,
      118-13*s+along*sn+across*c);
  };
  const palm=bladePoint(strike,0);
  // Sleeves hang below the elbows; the exposed wrists and hands have a
  // separate contour so the open guarding palm reads against the dark cloth.
  const elbowX=21+24*strike,elbowH=80+21*strike;
  const wristX=8+69*strike-8*settle,wristH=118-13*strike;
  panel([[lean-12,109],[lean-19,108],[-38+lean,92],[-36+lean,84],[-26+lean,83],[lean-8,99]],2,0x813a2e);
  cloth([[-31+lean,85,7],[-32+lean,90,8],[-30+lean,101,6],[-29+lean,109,4]],5,tunic);
  cloth([[-29+lean,108,4],[-29+lean,114,3],[-30+lean,121,4]],7,skin);
  for(let j=0;j<4;j++)stroke([point(lean-33+j*2,9,119),point(lean-36+j*2.6,9,125+Math.sin(j)*2)],1.4,0xf4c394);
  function arm(from:Knot,to:Knot,width:number,end:number,colors:Palette){
    const dx=to[0]-from[0],dz=to[2]-from[2],len=Math.hypot(dx,dz)||1;
    const at=(u:number,w:number):Knot=>[from[0]+dx*u+dz/len*w,from[1]+(to[1]-from[1])*u,from[2]+dz*u-dx/len*w];
    const middle=at(.43,1);middle[1]+=5;
    ink.facet([at(0,-width),at(1,-end),middle],colors[0],fade);
    ink.facet([at(1,-end),at(1,end),middle],colors[1],fade);
    ink.facet([at(1,end),at(0,width),middle],colors[2],fade);
    ink.facet([at(0,width),at(0,-width),middle],colors[3],fade);
  }
  const elbow=point(elbowX,8,elbowH),cuff=point(elbowX*.4+wristX*.6,10,elbowH*.4+wristH*.6);
  arm(point(lean+15,2,105),elbow,9,8,tunic);
  arm(elbow,cuff,9,6,tunic);arm(cuff,palm,5,3,skin);

  // Gilded hooked hilt, broad asymmetric base, and a flame-shaped double edge.
  const blade=(u:number,side:number)=>{
    const curve=Math.sin(u*Math.PI*5)*(1-u)*4.7,half=(1-u)*(u<.12?8:5.8);
    const edge=bladePoint(strike,10+u*67,curve+side*half);
    if(side===0)edge[1]+=2.5*(1-u);
    return edge;
  };
  if(strike>.02){
    const edge:Knot[]=[];
    let previousInner:Knot|undefined;
    for(let j=0;j<=20;j++){
      const s=strike*Math.max(0,1-(1-j/20)*.78);
      const inner=bladePoint(s,39),outer=bladePoint(s,77);
      if(previousInner){
        ink.facet([edge[j-1],outer,inner],jade,fade*.37);
        ink.facet([edge[j-1],inner,previousInner],jade,fade*.37);
      }
      edge.push(outer);previousInner=inner;
    }
    ink.strip(edge,4,mint,fade*.92);
  }
  stroke([bladePoint(strike,-11,4),bladePoint(strike,-6,-2),bladePoint(strike,11)],3.6,gold);
  stroke([bladePoint(strike,9,-7),bladePoint(strike,11,3),bladePoint(strike,7,10)],2.7,cream);
  cloth([[wristX,wristH-3,3],[wristX+1,wristH,5],[wristX+1,wristH+4,4]],12,skin);
  for(let j=0;j<18;j++){
    const u=j/18,v=(j+1)/18;
    for(const side of [-1,1]){
      const color=side>0?0xf7ffef:0x58abae;
      ink.facet([blade(u,0),blade(u,side),blade(v,side)],color,fade);
      ink.facet([blade(u,0),blade(v,side),blade(v,0)],color,fade);
    }
  }
  ink.glow(bladePoint(strike,76),10,cream,fade*.78*strike);
}
