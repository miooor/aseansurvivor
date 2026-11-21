import {BLADE_WHEEL_RADIUS} from '../game/heroes/lia.js';
import {MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE} from '../game/heroes/mira.js';
import {drawOriginalCast,drawOriginalProjectile,drawOriginalStrike} from './heroes/original-five-vfx';
import {drawRosterCast,drawRosterProjectile,drawRosterContact,hasRosterCast} from './heroes/roster-casts';
import {drawHeroRelease} from './hero-release';
import {SpellRibbons,type Knot} from './SpellRibbons';
import type {Effect,RunState} from '../game/runtime.js';

type KnotPoint={x:number;y:number};
const TAU=Math.PI*2;
const GOLD=0xffad38,IVORY=0xffe5a1,FIRE=0xff5530,ICE=0x51ddff,WATER=0x217fc9,PLUM=0xad3bc9,ROSE=0xff719c;

function curve(batch:SpellRibbons,steps:number,path:(u:number)=>Knot,width:number,c:number,alpha:number,taper=true){
  const knots:Knot[]=[];
  for(let i=0;i<=steps;i++)knots.push(path(i/steps));
  batch.strip(knots,width,c,alpha,taper);
}

export function drawCast(batch:SpellRibbons,f:Effect,g:RunState,reduced:boolean){
  if(f.hero==='nadi'||f.hero==='dani'&&f.slot!==0)return;
  if(f.hero==='ustaz'||f.hero==='rempit'||f.hero==='nok'||f.hero==='lan'||f.hero==='sari'){
    drawOriginalCast(batch,f,g,reduced);
    return;
  }
  if(hasRosterCast(f.hero)){
    if(f.slot===0)drawHeroRelease(batch,f,colourOf(f.c,GOLD),reduced);
    else drawRosterCast(batch,f,g,reduced);
    return;
  }
  const age=f.max-f.life,t=reduced?.22:age,progress=Math.min(1,t/f.max);
  const opacity=Math.min(1,.35+age*12,f.life/.16);
  const x=f.x,y=f.y,a=f.a||0;
  const forward=(d:number,s:number,h:number):Knot=>[x+Math.cos(a)*d-Math.sin(a)*s,y+Math.sin(a)*d+Math.cos(a)*s,h];
  const polar=(r:number,b:number,h:number):Knot=>[x+r*Math.cos(b),y+r*Math.sin(b),h];
  const band=(n:number,path:(u:number)=>Knot,w:number,c:number,alpha=1,taper=true)=>curve(batch,n,path,w,c,opacity*alpha,taper);
  const ring=(r:number,h:number,c:number,w=3)=>band(64,u=>polar(r,u*TAU,h),w,c,.92,false);
  const star=(p:Knot,size:number,c:number)=>{
    batch.glow(p,size*1.8,c,.44*opacity);
    band(2,u=>[p[0]+(u-.5)*size*2,p[1],p[2]],size*.23,c);
    band(2,u=>[p[0],p[1],p[2]+(u-.5)*size*3],size*.34,c);
  };
  const ink=colourOf(f.c,GOLD);
  // Embers and droplets rise from the cast footprint in staggered cycles.
  const motes=f.hero==='mira'?0:f.slot===4?22:f.slot===0?0:5;
  for(let i=0;i<motes;i++){
    const phase=(t*.85+i*.61803)%1,b=i*2.39996;
    const r=(f.slot===4?145:55)*(.32+.68*phase);
    const point=polar(r,b+phase*.35,8+phase*phase*(f.slot===4?112:60));
    batch.glow(point,(3+i%4)*(1-.5*phase),ink,opacity*(1-phase));
  }
  // Launch, outward travel and a final boundary give each skill a visible footprint.
  const pulse=Math.sin(Math.PI*Math.min(1,progress*1.4));
  const lane=(length:number,width:number,braid=false)=>{
    const end=length*Math.min(1,.15+progress*3);
    for(const side of [-1,1])band(22,u=>forward(end*u,side*width*(braid?Math.cos(u*TAU*1.5):1),10+pulse*18*Math.sin(Math.PI*u)),4,ink);
    star(forward(end,0,12),8,IVORY);
  };
  const wave=(radius:number,count:number)=>{
    for(let i=0;i<count;i++){
      const v=Math.max(0,Math.min(1,progress*1.5-i*.16));
      if(v>0)ring(radius*(.15+.85*v),4+6*(1-v),i%2?IVORY:ink,i?2:5);
    }
  };
  const canopy=(radius:number,count:number)=>{
    for(let i=0;i<count;i++)band(20,u=>polar(radius*Math.sin(u*Math.PI/2),i*TAU/count+u*.4,5+radius*.48*Math.cos(u*Math.PI/2)),4,ink,.75);
    ring(radius,5,ink);
  };
  drawHeroRelease(batch,f,ink,reduced);
  if(f.slot===0){
    if(f.hero==='mira'){
      const half=MIRA_BASIC_HALF_ANGLE;
      band(24,u=>polar(MIRA_BASIC_REACH,a-half+2*half*u,5),4,ink);
      band(2,u=>polar(MIRA_BASIC_REACH*u,a-half+2*half*progress,8),4,IVORY);
    }
    return;
  }
  switch(f.skill){
    case 'mira-1':{
      const reach=f.range??240,end=reach*(reduced?1:1-.68*progress);
      for(const side of [-14,14])band(2,u=>forward(reach*u,side,2),2,ink,.48,false);
      band(18,u=>forward(end-10+10*Math.cos(TAU*u),13*Math.sin(TAU*u),12),4,IVORY);
      band(8,u=>forward(end-3+5*Math.cos(TAU*u),4*Math.sin(TAU*u),15),3,0xffb968);
      break;
    }
    case 'mira-2':{
      const charged=f.flourish==='serving',radius=f.range??110;
      ring(radius,3,charged?IVORY:ink,charged?5:3);
      for(const side of [0,Math.PI]){
        const turn=a+side+progress*TAU;
        for(let i=0;i<20;i++){
          const u=i/20,v=(i+1)/20,b=turn+u*2.6,c=turn+v*2.6;
          const outer=polar(radius-1,b,6),tip=polar(radius-1,c,6);
          const inner=polar(radius-1-u*(charged?26:16),b,8+5*u),next=polar(radius-1-v*(charged?26:16),c,8+5*v);
          batch.facet([outer,tip,next],0xdf743c,opacity*.86);batch.facet([outer,next,inner],0xdf743c,opacity*.86);
        }
        band(24,u=>polar(radius-1,turn+u*2.6,7),charged?6:4,charged?IVORY:ink);
      }
      break;
    }
    case 'mira-3':
      ring(120,2,0xffbb70);
      for(let i=0;i<4;i++)band(3,u=>polar(116-12*Math.abs(2*u-1),i*TAU/4+(u-.5)*.25,5),4,IVORY);
      break;
    case 'mira-4':break; // RosterCues draws the live breaker.
    case 'lia-1':{
      const end=(f.range??240)*Math.min(1,.25+progress*3);
      for(const side of [-1,1])band(24,u=>forward(end*u,side*(16*Math.sin(Math.PI*u)),9+26*Math.sin(Math.PI*u)),5,side<0?0x7d53be:0xe5e3ff);
      break;
    }
    case 'lia-2':case 'lia-4':
      star([x,y,32],13,0xd4bdff);break;
    case 'lia-3':
      for(let i=0;i<3;i++){
        const angle=a+i*TAU/3+progress*4;
        const edge=(u:number)=>polar(BLADE_WHEEL_RADIUS*(.40+.60*u),angle+u*1.8,10+22*u);
        band(20,edge,12,0x965bce);
        band(20,edge,3,0xffdcff);
        batch.glow(edge(1),9,0xb595ff,opacity);
      }
      break;
  }

}

export function drawCombatTrails(batch:SpellRibbons,g:RunState,reduced:boolean){
  for(const q of g.projs){
    if(q.kind==='gold-bar')continue;
    if(!q.hero&&!q.hitOptions?.hero&&!('origin' in q)&&
      (q.kind!=='nur'||g.hero.id==='ustaz')&&drawOriginalProjectile(batch,q,reduced,g.t))continue;
    const a=Math.atan2(q.vy,q.vx),dx=Math.cos(a),dy=Math.sin(a);
    const at=(d:number,w:number,h=8):Knot=>[q.x+dx*d-dy*w,q.y+dy*d+dx*w,h];
    const owner=q.hero||q.hitOptions?.hero;
    const ink=owner===g.hero.id?colourOf(g.hero.identity.color,GOLD):q.kind==='nur'?GOLD:q.kind==='spanner'?FIRE:q.kind==='kris'?PLUM:ICE;
    if(drawRosterProjectile(batch,owner,at,q.hitOptions?.slot))continue;
    batch.glow(at(0,0,13),q.r*2.3+6,ink,.46);
    curve(batch,12,u=>at(-45+53*u,Math.sin(u*5)*4,8+7*u),6,ink,1);
    curve(batch,14,u=>at(Math.cos(u*TAU)*9,Math.sin(u*TAU)*7,14),3,ink,1,false);
  }
  for(const strike of g.sea?.strikes||[])drawOriginalStrike(batch,strike,reduced);
}

const inks=new Map<string,number>();
function colourOf(css:string|undefined,fallback:number){
  if(!css)return fallback;
  const cached=inks.get(css);
  if(cached!==undefined)return cached;
  const rgb=css.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  let colour=fallback;
  if(rgb)colour=(+rgb[1]<<16)|(+rgb[2]<<8)|+rgb[3];
  else if(/^#[0-9a-f]{6}$/i.test(css))colour=parseInt(css.slice(1),16);
  inks.set(css,colour);return colour;
}

export function drawImpact(batch:SpellRibbons,f:Effect,g:RunState,reduced:boolean){
  const alpha=Math.max(0,Math.min(1,f.life/(f.max||.4))),v=reduced?.5:1-alpha;
  const r=f.r||f.size||10,c=colourOf(f.c,IVORY),a=f.a||0;
  const polar=(radius:number,angle:number,h:number):Knot=>[f.x+radius*Math.cos(angle),f.y+radius*Math.sin(angle),h];
  const arc=(r:number,start:number,span:number,w:number,h:number,ink=c)=>
    curve(batch,32,u=>polar(r,start+span*u,h),w,ink,alpha,span<TAU);
  if(f.kind==='basicChain'&&f.tx!==undefined&&f.ty!==undefined){
    const path:Knot[]=[[f.x,f.y,23],[(f.x+f.tx)/2,(f.y+f.ty)/2, reduced?23:35],[f.tx,f.ty,23]];
    batch.strip(path,5,c,alpha);batch.strip(path,1.8,IVORY,alpha);
    return;
  }
  if(drawRosterContact(batch,f,reduced))return;
  if(f.kind==='wake'){
    for(const side of [-1,1])curve(batch,24,u=>{
      const dx=f.tx!-f.x,dy=f.ty!-f.y,len=Math.hypot(dx,dy)||1,off=side*16*Math.sin(Math.PI*u);
      return [f.x+dx*u-off*dy/len,f.y+dy*u+off*dx/len,8+30*Math.sin(u*Math.PI)*(1-v)];
    },7,c,alpha);
    return;
  }
  if(f.flourish==='crossing'||f.flourish==='kiln'){
    const count=f.flourish==='kiln'?7:4;
    for(let i=0;i<count;i++)curve(batch,14,u=>polar(r*(.2+u*.8),i*TAU/count+v*.6+u*.22,5+35*Math.sin(u*Math.PI)*(1-v)),5,c,alpha);
  }
  if(f.kind==='relay'){
    curve(batch,16,u=>[f.x+(f.tx!-f.x)*u,f.y+(f.ty!-f.y)*u,12+28*Math.sin(u*Math.PI)],5,c,alpha);
    return;
  }
  if(f.flourish==='return'){
    const bead=(t:number):Knot=>[f.x+(g.p.x-f.x)*t,f.y+(g.p.y-f.y)*t,18+55*Math.sin(Math.PI*t)];
    const head=reduced?.68:Math.min(1,v*1.24);
    curve(batch,16,u=>bead(Math.max(0,head-(1-u)*.32)),5,GOLD,alpha,false);
    batch.glow(bead(head),14,IVORY,alpha);
    return;
  }
  if(f.flourish==='tip'){
    const h=20;
    for(let i=0;i<4;i++){
      const b=Math.PI/4+i*Math.PI/2;
      batch.facet([polar(4,b-.85,h),polar((i%2?15:24)*(1+.2*v),b,h),polar(4,b+.85,h)],IVORY,alpha);
    }
    batch.glow([f.x,f.y,h],10,GOLD,alpha);
    return;
  }
  if(f.flourish==='ripple'){
    // Keep the outer rim on the splash radius. The inner crest travels out to it.
    arc(r,0,TAU,3,5,ICE);
    arc(r*(.25+.7*v),0,TAU,5,9,IVORY);
    return;
  }
  if(f.flourish==='ignition'||f.flourish==='echo'){
    for(let k=0;k<6;k++)curve(batch,10,u=>polar(r*v*(1-u*.48),k*TAU/6+u*.42,8+Math.sin(Math.PI*u)*r*(1-v)),5,c,alpha);
  }
  switch(f.kind){
    case 'line':
      curve(batch,6,u=>polar((f.len||100)*u,a,11),Math.max(3,(f.w||6)*.35),c,alpha);break;
    case 'impact':
      for(let k=0;k<5;k++)curve(batch,3,u=>polar(r*(.1+.9*u)*(.65+v*.7),a+k*TAU/5,11+u*7),4,c,alpha);
      batch.glow([f.x,f.y,12],r*.5,c,alpha*.7);break;
    case 'cone':case 'arc':
      arc(f.range||r,a-(f.half||.8),(f.half||.8)*2,5,10);break;
    case 'spin':case 'ring':case 'burst':case 'crack':case 'wave':
      arc(r*(.55+v*.55),0,TAU,3.5,6);break;
    default:batch.glow([f.x,f.y,9],Math.min(34,r)*(1+.4*v),c,alpha*.82);
  }
}

export function drawGroundSkills(batch:SpellRibbons,g:RunState,reduced:boolean){
  for(const z of g.zones){
    if(z.kind!=='fire'&&z.kind!=='barrier')continue;
    if(z.kind==='barrier'&&z.slot===3)continue;
    const fade=Math.min(1,z.life/.4);
    const fire=z.kind==='fire',c=fire?FIRE:GOLD;
    batch.glow([z.x,z.y,5],z.r,c,fade*(fire?.48:.22));
    if(fire){
      for(let i=0;i<3;i++){
        const phase=reduced?.45:(g.t*2+i*.32+Math.abs(z.x*.037))%1;
        curve(batch,6,u=>[z.x+Math.sin(i*3+u*5)*8,z.y+Math.cos(i*2)*8,4+u*28*(1-phase)],5,GOLD,fade*(1-phase));
      }
    }else{
      curve(batch,56,u=>[z.x+z.r*Math.cos(u*TAU),z.y+z.r*Math.sin(u*TAU),5],3,GOLD,fade,false);
    }
  }
}
