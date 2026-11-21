import type {Effect, Point, RunState} from '../../game/runtime.js';
import type {Knot, SpellRibbons} from '../SpellRibbons';

const turn=2*Math.PI;
const paper=0xffe4a4, vermilion=0xc73839, brass=0xfab442, oil=0x3a302b, glint=0xffdb77;
const rose=0xd34a90, silk=0xb0b8ff, reed=0xdc9851, leaf=0x85ed9d, resin=0xa43828, honey=0xffb638;

type Plane=(d:number,w:number,h?:number)=>Knot;
function plane(x:number,y:number,angle:number):Plane{
  const dx=Math.cos(angle),dy=Math.sin(angle);
  return (d,w,h=8)=>[x+dx*d-dy*w,y+dy*d+dx*w,h];
}
function face(b:SpellRibbons,points:Knot[],color:number,alpha:number){
  for(let i=2;i<points.length;i++)b.facet([points[0],points[i-1],points[i]],color,alpha);
}
function slip(b:SpellRibbons,p:Plane,d:number,w:number,h:number,size:number,alpha:number){
  const pt=(x:number,y:number)=>p(d+x*size,w+y*size,h);
  face(b,[pt(-17,-10),pt(14,-10),pt(18,10),pt(-14,10)],paper,alpha);
  face(b,[pt(-13,-10),pt(-7,-10),pt(-4,10),pt(-10,10)],vermilion,alpha);
  b.strip([pt(-2,-4),pt(10,-4)],2*size,0x824323,alpha,false);
  b.strip([pt(-1,3),pt(6,3)],2*size,0x824323,alpha,false);
}
export function drawRosterProjectile(b:SpellRibbons,id:string|undefined,p:Plane,slot:number|undefined){
  switch(id){
    case 'asha':
      slip(b,p,0,0,18,1,1);break;
    case 'dani':
      face(b,[p(-38,0,14),p(0,-8,14),p(16,0,14),p(0,8,14)],oil,1);
      face(b,[p(-15,0,15),p(1,-5,15),p(16,0,15),p(1,5,15)],paper,1);
      b.glow(p(8,0,16),12,glint,.9);break;
    case 'vanna':
      face(b,[p(-23,0,14),p(-3,-9,14),p(23,0,14),p(-3,9,14)],rose,1);
      for(const d of [-7,0,7])b.strip([p(d-3,-5,16),p(d+1,5,16)],2,paper,1,false);
      b.strip([p(-55,-7,10),p(-43,5,16),p(-32,-4,11),p(-16,0,14)],3,silk,.9,false);break;
    case 'keo':{
      const overtone=slot===2;
      b.strip([p(-27,0,14),p(7,0,14)],overtone?3:5,reed,1,false);
      for(const d of [-8,4])b.strip([p(d,-4,14),p(d,4,14)],2,paper,1,false);
      b.strip([p(6,-9,14),p(13,-5,16),p(16,0,17),p(13,5,16),p(6,9,14)],3,leaf,1,false);break;
    }
    default:return false;
  }
  return true;
}

export function drawRosterCast(b:SpellRibbons,f:Effect,g:RunState,reduced:boolean){
  const age=f.max-f.life,phase=reduced?.62:Math.min(1,age/Math.min(.45,f.max));
  const alpha=Math.min(1,f.life/.14),angle=f.a??0;
  const at=plane(f.x,f.y,angle);
  const band=(path:(u:number)=>Knot,n:number,width:number,color:number,opacity=1)=>{
    const knots:Knot[]=[];for(let i=0;i<=n;i++)knots.push(path(i/n));
    b.strip(knots,width,color,alpha*opacity,false);
  };
  const polar=(p:Point,r:number,a:number,h:number):Knot=>[p.x+r*Math.cos(a),p.y+r*Math.sin(a),h];
  const rim=(p:Point,r:number,c:number)=>band(u=>polar(p,r,u*turn,4),36,3,c);
  switch(f.skill){
    case 'asha-1':{
      const target={x:f.tx??f.x,y:f.ty??f.y},radius=f.range??100;
      const land=plane(target.x,target.y,-.18);
      rim(target,radius,brass);
      for(let i=-1;i<=1;i++){
        const flight=Math.max(0,Math.min(1,phase*1.7-i*.09));
        const h=8+44*Math.sin(Math.PI*flight);
        slip(b,land,i*radius*.47,i*8,h,1.05,alpha);
      }
      break;
    }
    case 'asha-2':
      // The local register closes even when there are no served tickets to collect.
      for(const side of [-1,1]){
        const p=plane(f.x,f.y,side*Math.PI/2+.3);
        slip(b,p,78*(1-phase)+24,0,14+22*phase,1.05,alpha);
      }
      rim(f,90,brass);break;
    case 'asha-3':
      for(let i=0;i<8;i++){
        const p=plane(f.x,f.y,i*turn/8);
        const front=35+phase*110;
        b.strip([p(front-16,-16),p(front,0),p(front-16,16)],5,vermilion,alpha,false);
        slip(b,p,front-19,0,9+12*Math.sin(phase*Math.PI),.75,alpha);
      }
      break;
    case 'asha-4':{
      const beat=Math.min(4,Math.floor(age));
      for(let i=0;i<5;i++){
        const p=plane(f.x,f.y,i*turn/5);
        slip(b,p,199,0,12,1.2,alpha*(i<beat?.42:1));
        if(i===beat){
          const travel=reduced?.5:age%1;
          band(u=>p(190-u*155,0,12+24*Math.sin(u*Math.PI)),12,3,brass,.7);
          slip(b,p,190-travel*155,0,14+24*Math.sin(travel*Math.PI),.9,alpha);
        }
      }
      // A little counter printer feeds a continuous strip into the field.
      const counter=plane(f.x,f.y-56,-.12);
      face(b,[counter(-28,-10,24),counter(27,-10,24),counter(27,12,24),counter(-28,12,24)],vermilion,alpha);
      face(b,[counter(-28,12,24),counter(27,12,24),counter(23,16,6),counter(-24,16,6)],0x813529,alpha);
      const feed=reduced?.6:age%1;
      face(b,[counter(-15,0,25),counter(14,0,25),counter(14,-10,39+18*feed),counter(-15,-10,39+18*feed)],paper,alpha);
      for(const offset of [0,7])b.strip([counter(-10,-6,32+offset),counter(7,-6,32+offset)],1.8,vermilion,alpha,false);
      rim(f,220,brass);break;
    }
    case 'keo-1':
      for(let i=0;i<4;i++){
        const r=35+(i+phase)*51;
        band(u=>polar(f,r,angle+(u-.5)*70*Math.PI/180,8+12*Math.sin(u*Math.PI)),16,4+i, i%2?leaf:reed);
        for(const side of [-1,1]){
          const p=plane(f.x,f.y,angle+side*.53);
          b.strip([p(r-14,0,7),p(r,0,23)],3,paper,alpha,false);
        }
      }
      break;
    case 'keo-2':
      for(const i of f.reedCount===5?[-2,-1,0,1,2]:[-1,0,1]){
        const len=45+12*i;
        b.strip([at(-9,i*20,12),at(len,i*20,18)],6,reed,alpha,false);
        for(const d of [len-11,len])b.strip([at(d,i*20-5,18),at(d,i*20+5,18)],3,paper,alpha,false);
      }
      break;
    case 'keo-3':
      for(let i=0;i<8;i++){
        const a=i*turn/8;
        band(u=>polar(f,145-45*(1-phase)*Math.sin(Math.PI*u),a+.7*u,6+26*Math.sin(Math.PI*u)*(1-phase)),10,4,leaf);
        const p=plane(f.x,f.y,a);
        b.strip([p(18,0,7),p(22,0,38+10*(i%3))],5,reed,alpha,false);
      }
      break;
    case 'keo-4':{
      const start=f.castAt??g.t-age;
      const pulses=(g.roster.keo as {pulses:(Point&{at:number})[]}).pulses;
      const next=pulses.find(p=>[.3,.9,1.5,2.1].some(delay=>Math.abs(p.at-start-delay)<.001));
      if(!next)break;
      const beat=reduced?.55:1-Math.min(1,(next.at-g.t)/.6);
      const spent=Math.round((next.at-start-.3)/.6);
      for(let i=0;i<4;i++){
        const a=i*turn/4,p=plane(next.x,next.y,a);
        b.strip([p(126,0,7),p(135,0,28+12*i)],6,reed,alpha*(i<spent?.28:1),false);
        band(u=>polar(next,30+148*beat,a+u*1.45,7+9*Math.sin(u*Math.PI)),12,5,leaf);
      }
      break;
    }
  }
}

export function hasRosterCast(hero:string|undefined){
  return hero==='asha'||hero==='dani'||hero==='vanna'||hero==='keo';
}

export function drawRosterContact(b:SpellRibbons,f:Effect,reduced:boolean){
  if(!hasRosterCast(f.hero))return false;
  if(f.kind==='ring'&&(f.flourish==='seal'||f.flourish==='echo-land')){
    const fade=f.life/f.max,spread=reduced?.64:1-fade,r=f.r??0;
    const rim:Knot[]=[];
    for(let j=0;j<=32;j++)rim.push([f.x+r*Math.cos(turn*j/32),f.y+r*Math.sin(turn*j/32),4]);
    b.strip(rim,3,f.flourish==='seal'?honey:leaf,fade,false);
    for(let i=0;i<8;i++){
      const p=plane(f.x,f.y,i*turn/8),d=r*(.35+.6*spread);
      if(f.flourish==='seal'){
        face(b,[p(d*.48,-5,4),p(d,0,10+15*(1-spread)),p(d*.7,8,6)],i%2?honey:resin,fade);
      }else{
        b.strip([p(d-8,-d*.34,5),p(d,0,14),p(d-8,d*.34,5)],5,leaf,fade,false);
      }
    }
    return true;
  }
  if(f.kind!=='impact')return false;
  const fade=f.life/f.max,spread=reduced?.55:1-fade;
  const p=plane(f.x,f.y,f.a??0),size=(f.r??22)/22;
  const highlight=f.c==='#ffe66b'?0xffe66b:paper;
  for(const side of [-1,1]){
    const d=(7+15*spread)*size,w=side*(8+9*spread)*size;
    switch(f.hero){
      case 'asha':
        face(b,[p(d-8,w-5),p(d+6,w-4),p(d+9,w+5),p(d-5,w+6)],side<0?highlight:vermilion,fade);break;
      case 'dani':
        b.strip([p(-7,w*.4),p(d*.5,w,16),p(d,w*1.2,24)],4,side<0?glint:highlight,fade,false);break;
      case 'vanna':
        b.strip([p(-d,w*.4),p(-3,-w*.55,16),p(d,w,20)],4,side<0?rose:silk,fade,false);break;
      case 'keo':
        b.strip([p(-8,w*.7),p(0,w*1.2),p(9,w)],3,leaf,fade,false);
        b.strip([p(-4,w*1.35),p(1,w*1.7),p(6,w*1.55)],2,highlight,fade,false);break;
    }
  }
  b.glow(p(0,0,12),12*size,highlight,fade);
  return true;
}
