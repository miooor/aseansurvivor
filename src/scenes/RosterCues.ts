import type {Point,RunState} from '../game/runtime.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

type Ink=Pick<SpellRibbons,'strip'|'facet'>;
interface Lane extends Point {ax:number;ay:number}
interface LoomStrip extends Lane {at:number}
interface Shuttle extends Lane {age:number;ultimate:boolean}
const ground=(p:Point):Knot=>[p.x,p.y,0];
const local=(q:Lane,d:number,w:number,h=0):Knot=>[q.x+d*q.ax-w*q.ay,q.y+d*q.ay+w*q.ax,h];
const mint=0x78ffe0,amber=0xffb044;

function breakingWave(ink:Ink,g:RunState,reduced:boolean){
  const {wave}=g.roster.mira as {wave:(Lane&{distance:number;width:number;length:number})|null};
  if(!wave)return;
  const half=wave.width/2,front=wave.distance;
  // Ground rails and foam share the simulation's width and leading edge.
  for(const side of [-half,half])ink.strip([local(wave,0,side),local(wave,wave.length,side)],2,mint,.4,false);
  // A low trailing skirt rolls up into an overhanging lip. Keep the foam
  // folded behind the damaging front even when decoration is frozen.
  const span=24,point=(i:number,layer:number)=>{
    const u=i/span,side=(u-.5)*wave.width,dome=Math.sin(Math.PI*u);
    const scallop=.5+.5*Math.cos(6*Math.PI*u+(reduced?0:g.t*5));
    const back=[18+38*dome,11+18*dome,4+7*scallop,1+2*scallop][layer];
    const height=[1,6+11*dome,9+30*dome+6*scallop,5+15*dome][layer];
    return local(wave,Math.max(0,front-back),side,height);
  };
  for(const [layer,color] of [0x155f98,0x239eb8,0xb1f4e6].entries()){
    for(let i=0;i<span;i++){
      const a=point(i,layer),b=point(i+1,layer),c=point(i,layer+1),d=point(i+1,layer+1);
      ink.facet([a,b,d],color,.95);ink.facet([a,d,c],color,.95);
    }
  }
  ink.strip(Array.from({length:span+1},(_,i)=>point(i,2)),5,0xf1fff5,1,false);
  for(const i of [4,9,15,20]){
    const [x,y,h]=point(i,2);
    ink.strip([[x,y,h+4],[x-wave.ax*4,y-wave.ay*4,h+9],[x-wave.ax*8,y-wave.ay*8,h+10]],3,0xd9fff8,.9);
  }
}

function weave(ink:Ink,g:RunState,reduced:boolean){
  const {q,e,cross}=g.roster.vanna as {q:LoomStrip|null;e:LoomStrip|null;cross:(Point&{polygon:Point[]})|null};
  for(const strip of [q,e]){
    if(!strip)continue;
    const warp=strip===q,color=warp?0xfb8aba:0xa9bbff;
    const front=reduced?140:-140+280*Math.min(1,(g.t-strip.at)/.28);
    const offsets=warp?[-15,-5,5,15]:[-17,17];
    for(const offset of offsets){
      ink.strip([local(strip,-140,offset),local(strip,front,offset)],2.8,color,.95,false);
    }
    for(let d=-136;d<=front-20;d+=28){
      if(warp){
        // Alternating heddles lift each pair of lengthwise strands.
        ink.strip([local(strip,d,-13),local(strip,d+7,-5,5),local(strip,d,5),local(strip,d+7,13,5)],3,0xffdfb4,.9,false);
      }else{
        const diamond=[local(strip,d,0),local(strip,d+10,-14),local(strip,d+20,0),local(strip,d+10,14)];
        ink.facet([diamond[0],diamond[1],diamond[2]],0x6769b7,.9);
        ink.facet([diamond[0],diamond[2],diamond[3]],color,.9);
        ink.strip([diamond[1],diamond[2],diamond[3]],2,0xffdfb4,.95,false);
      }
    }
  }
  if(!cross)return;
  const polygon=cross.polygon.map(ground);
  for(let i=1;i+1<polygon.length;i++)ink.facet([polygon[0],polygon[i],polygon[i+1]],0xffdfad,.57);
  ink.strip([...polygon,polygon[0]],3.5,0xffdfad,.95,false);
}

function shuttles(ink:Ink,g:RunState,reduced:boolean){
  const state=g.roster.lia as {shuttles:Shuttle[]};
  for(const q of state.shuttles){
    const back=q.age>=.45-1e-8,dx=g.p.x-q.x,dy=g.p.y-q.y,len=Math.hypot(dx,dy);
    const lane=back&&len?{x:q.x,y:q.y,ax:dx/len,ay:dy/len}:q;
    const ready=back&&!q.ultimate&&q.age>=.65-1e-8;
    const color=q.ultimate?0xc499ff:ready?mint:back?0xffead0:amber;
    const tail=back?39:26,wing=q.ultimate?12:7;
    // Faceted parcel with a crossing tie; long cut-cloth pennants belong to Dispatch.
    const nose=local(lane,wing*1.6,0,13),rear=local(lane,-wing*1.8,0,13);
    for(const side of [-1,1]){
      const seam=local(lane,-2,wing*side,15);
      ink.facet([nose,seam,rear],side>0?0xbf3449:0xf77757,1);
      ink.strip([local(lane,-wing*.65,side*wing*.7,16),local(lane,wing*.55,-side*wing*.63,16)],2,0xffdf90,1,false);
      if(q.ultimate){
        const hem:Knot[]=[];
        for(let i=0;i<=12;i++){
          const u=i/12,flutter=Math.sin(u*Math.PI*2-(reduced?0:q.age*8));
          hem.push(local(lane,-10-64*u,side*(4+12*u)+6*u*flutter,13+10*u*flutter));
        }
        ink.strip(hem,5,side>0?0xeb4857:0xffbe53,.95);
      }
    }
    // A split tail points toward the player on return. Dispatch has a closed,
    // twin-barbed head. A catchable basic opens into a fork.
    for(const side of [-1,1]){
      ink.strip([local(lane,-tail,side*(back?wing:2),9),local(lane,-5,side*wing,9),local(lane,9,0,9)],3.6,color,1,false);
      if(q.ultimate)ink.strip([local(lane,-16,side*wing,9),local(lane,-7,0,9)],3,color,1,false);
      if(ready)ink.strip([local(lane,-tail,side*wing,9),local(lane,-tail-6,side*15,9)],4,mint,1,false);
    }
  }
}

export function drawRosterCues(ink:Ink,g:RunState,reduced:boolean){
  const id=g.hero.id;
  if(!g.roster[id])return;
  switch(id){
    case 'mira':return breakingWave(ink,g,reduced);
    case 'vanna':return weave(ink,g,reduced);
    case 'lia':return shuttles(ink,g,reduced);
    case 'asha':case 'dani':
      for(const f of g.fx){
        if(f.hero!==id||f.kind!=='relay'||f.tx===undefined||f.ty===undefined)continue;
        const dx=f.tx-f.x,dy=f.ty-f.y,len=Math.hypot(dx,dy);
        if(!len)continue;
        const lane={x:f.x,y:f.y,ax:dx/len,ay:dy/len},alpha=f.life/f.max;
        if(id==='asha'){
          const d=len*(reduced?.8:1-alpha);
          ink.facet([local(lane,d-9,-7,5),local(lane,d+10,0,5),local(lane,d-9,7,5)],amber,1);
          ink.strip([local(lane,len-5,-10),local(lane,len+4,0),local(lane,len-5,10)],3,amber,alpha,false);
        }else{
          // Mark pull direction at each hit, even when several tethers meet.
          for(const d of [0,14])ink.strip([local(lane,d,-10),local(lane,d+9,0),local(lane,d,10)],4,mint,alpha,false);
        }
      }
      break;
    case 'keo':{
      const {pulses}=g.roster.keo as {pulses:(Point&{redirected?:boolean})[]};
      for(const p of pulses)if(p.redirected){
        for(let i=0;i<4;i++){
          const a=i*Math.PI/2,axis={...p,ax:Math.cos(a),ay:Math.sin(a)};
          ink.strip([local(axis,22,-8),local(axis,10,0),local(axis,22,8)],4,0xb5fa78,1,false);
          ink.strip([local(axis,175,-16),local(axis,180,0),local(axis,175,16)],4,0xb5fa78,1,false);
        }
      }
      break;
    }
    case 'nadi':
      for(const f of g.fx)if(f.hero===id&&f.flourish==='kiln'){
        for(let i=0;i<3;i++){
          const a=i*Math.PI*2/3,axis={...f,ax:Math.cos(a),ay:Math.sin(a)},r=f.r??0;
          ink.strip([local(axis,6,0),local(axis,r*.32,-5),local(axis,r*.45,4),local(axis,r*.75,0)],4,amber,f.life/f.max,false);
        }
      }
      break;
  }
}
