import type {Knot,SpellRibbons} from './SpellRibbons';
import type {Effect} from '../game/runtime.js';

type Outline = [forward:number,side:number][];
const TAU = 2*Math.PI;

// A small, directional silhouette punctuates the release. The longer-lived
// range, target and projectile effects are drawn separately by the scene.
export function drawHeroRelease(batch:SpellRibbons, cast:Effect, ink:number, reduced:boolean){
  const age = cast.max-cast.life;
  const duration = Math.min(cast.max,cast.slot===4 ? .42 : .28);
  if(age>=duration)return;
  const phase = reduced ? .42 : age/duration;
  const alpha = Math.min(1,(duration-age)/.09);
  const scale = cast.slot===4 ? 1.5 : cast.slot===0 ? .85 : 1.1;
  const angle = cast.a||0, dx = Math.cos(angle), dy = Math.sin(angle);
  const lift = 18+7*Math.sin(Math.PI*phase);
  const origin = 14+phase*32;
  const point = (f:number,s:number,h=0):Knot => [
    cast.x+dx*(origin+f*scale)-dy*s*scale,
    cast.y+dy*(origin+f*scale)+dx*s*scale,
    lift+h*scale
  ];
  const light = 0xffecbf;
  const line = (outline:Outline,width:number,color=ink) =>
    batch.strip(outline.map(([f,s])=>point(f,s)),width*scale,color,alpha,false);
  const face = (outline:Outline,color:number) => {
    const vertices = outline.map(([f,s])=>point(f,s));
    for(let i=2;i<vertices.length;i++)batch.facet([vertices[0],vertices[i-1],vertices[i]],color,alpha);
  };
  const arc = (cx:number,r:number,start:number,span:number,width:number,color=ink) => {
    const path:Knot[] = [];
    for(let i=0;i<=16;i++){
      const a=start+span*i/16;
      path.push(point(cx+r*Math.cos(a),r*Math.sin(a)));
    }
    batch.strip(path,width*scale,color,alpha);
  };
  switch(cast.hero){
    case 'ustaz': // A dawn ember with a bright leading facet.
      face([[-21,0],[2,-8],[16,0],[2,8]],ink);
      face([[1,-5],[16,0],[1,5]],light);
      break;
    case 'rempit': // Hot filings scatter behind the thrown spanner.
      for(const side of [-1,1])face([[6,side*5],[-19,side*14],[-8,side*5]],ink);
      line([[-8,0],[7,0],[13,-7]],3,light);
      line([[7,0],[13,7]],3,light);
      break;
    case 'nok':
      for(let i=0;i<3;i++)arc(8-i*8,17-i*3,-.95,1.9,4-i*.8,i===0?light:ink);
      break;
    case 'lan':
      for(const side of [-1,1]){
        arc(-6,14,side*.2,side*2.4,3);
        batch.glow(point(8,side*9,8+phase*9),5,light,alpha);
      }
      break;
    case 'sari': // Undulating edges meet at the tip of the blade.
      face([[-17,1],[-6,-6],[4,-3]],ink);
      face([[-17,1],[4,-3],[0,5]],ink);
      face([[0,5],[4,-3],[21,-2]],light);
      break;
    case 'asha':
      face([[-13,-9],[15,-7],[13,9],[-15,7]],ink);
      line([[-7,-5],[-8,5]],1.6,light);
      line([[0,-3],[9,-2]],1.6,light);
      break;
    case 'mira':
      if(cast.slot!==0&&cast.slot!==1)break;
      line([[-24,6],[5,0],[14,-6],[11,-13],[4,-12]],3.2);
      line([[11,-13],[4,-12],[5,-8]],2,light);
      break;
    case 'dani':
      face([[-10,0],[0,-9],[12,0],[0,9]],light);
      for(const r of [17,23])arc(0,r,-.75,1.5,2.5);
      break;
    case 'vanna':
      for(const side of [-1,1])line([[-23,side*9],[-8,-side*5],[5,side*5],[18,0]],2.5,side<0?light:ink);
      break;
    case 'keo':
      for(let i=0;i<3;i++)arc(-12+i*9,8+i*4,-1.15,2.3,2.6,i===2?light:ink);
      break;
    case 'nadi':
      face([[-21,0],[1,-7],[10,-4],[13,2],[4,8]],ink);
      batch.glow(point(4,-2,2),4,light,alpha);
      batch.glow(point(-18,8,3),4,ink,alpha);
      break;
    case 'lia':
      face([[-14,0],[0,-8],[17,0],[0,8]],ink);
      for(const f of [-5,1,7])line([[f-2,-4],[f+2,4]],1.5,light);
      arc(-17,7,0,TAU*.76,1.6);
      break;
  }
}
