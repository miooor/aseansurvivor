import type {Point,RunState} from '../game/runtime.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

type Ink=Pick<SpellRibbons,'strip'|'facet'>;
interface Lane extends Point {ax:number;ay:number}
const local=(q:Lane,d:number,w:number,h=0):Knot=>[q.x+d*q.ax-w*q.ay,q.y+d*q.ay+w*q.ax,h];
const amber=0xffb044;

function stoveCart(ink:Ink,g:RunState,reduced:boolean){
  const {wave}=g.roster.mira as {wave:(Lane&{distance:number;width:number;length:number})|null};
  if(!wave)return;
  const at=(d:number,w:number,h:number)=>local(wave,Math.max(0,wave.distance+d),w,h);
  for(const side of [-1,1]){
    const w=side*wave.width*.31;
    const panel=[at(-37,w,8),at(0,w,8),at(0,w,31),at(-37,w,38)];
    ink.facet([panel[0],panel[1],panel[2]],0x374347,1);
    ink.facet([panel[0],panel[2],panel[3]],0x697879,1);
    ink.strip([panel[3],panel[2]],4,0xffc777,1,false);
    for(const d of [-30,-7]){
      const wheel=Array.from({length:13},(_,i)=>at(d+6*Math.cos(i*Math.PI/6),w,7+6*Math.sin(i*Math.PI/6)));
      ink.strip(wheel,4,0x372c29,1,false);
      const spin=reduced?0:wave.distance/6;
      for(let i=0;i<3;i++){
        const a=spin+i*Math.PI/3,dd=6*Math.cos(a),dh=6*Math.sin(a);
        ink.strip([at(d-dd,w,7-dh),at(d+dd,w,7+dh)],1.4,0xd39861,.9,false);
      }
    }
  }
  // The lipped flue sits above the stove and travels with its chassis.
  const flue:Knot[]=[],rim:Knot[]=[];
  for(let i=0;i<=10;i++){
    const a=i*2*Math.PI/10,d=-22+5*Math.cos(a),w=6*Math.sin(a);
    flue.push(at(d,w,32));rim.push(at(d,w,54));
    if(i){
      const shade=i<5?0x905939:0x57433b;
      ink.facet([flue[i-1],flue[i],rim[i]],shade,.96);
      ink.facet([flue[i-1],rim[i],rim[i-1]],shade,.96);
    }
  }
  ink.strip(rim,3,0xedba73,1,false);
  for(const w of [-22,0,22]){
    const h=48+(reduced?4:8*Math.sin(g.t*21+w));
    ink.facet([at(-32,w,33),at(-5,w,32),at(-29,w,h)],0xff9844,1);
    ink.facet([at(-25,w,33),at(-12,w,32),at(-22,w,h-6)],0xffde83,1);
  }
}

export function drawRosterCues(ink:Ink,g:RunState,reduced:boolean){
  const id=g.hero.id;
  if(!g.roster[id])return;
  switch(id){
    case 'mira':return stoveCart(ink,g,reduced);
    case 'lia':
      for(const f of g.fx){
        if(f.kind!=='shadowstep'||f.tx===undefined||f.ty===undefined)continue;
        const alpha=f.life/f.max,dx=f.tx-f.x,dy=f.ty-f.y;
        for(const side of [-1,1]){
          ink.strip([[f.x,f.y,10],[f.x+dx*.44,f.y+dy*.44,25+side*11],[f.tx,f.ty,12]],4,0x8f73db,alpha);
          ink.strip([[f.tx-side*23,f.ty,5],[f.tx,f.ty,26],[f.tx+side*19,f.ty,55]],4,0xe2d5ff,alpha);
        }
      }
      break;
    case 'asha':
      for(const f of g.fx){
        if(f.hero!==id||f.kind!=='relay'||f.tx===undefined||f.ty===undefined)continue;
        const dx=f.tx-f.x,dy=f.ty-f.y,len=Math.hypot(dx,dy);
        if(!len)continue;
        const lane={x:f.x,y:f.y,ax:dx/len,ay:dy/len},alpha=f.life/f.max;
        const d=len*(reduced?.8:1-alpha);
        ink.facet([local(lane,d-9,-7,5),local(lane,d+10,0,5),local(lane,d-9,7,5)],amber,1);
        ink.strip([local(lane,len-5,-10),local(lane,len+4,0),local(lane,len-5,10)],3,amber,alpha,false);
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
      for(const f of g.fx)if(f.hero===id&&f.kind==='ring'&&f.slot===3){
        const radius=f.r??95;
        const edge=Array.from({length:33},(_,i)=>{
          const a=i*Math.PI/16;
          return [f.x+Math.cos(a)*radius,f.y+Math.sin(a)*radius,5] as Knot;
        });
        ink.strip(edge,4,amber,f.life/f.max,false);
      }
      break;
  }
}
