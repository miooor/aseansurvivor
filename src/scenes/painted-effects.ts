import {MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE} from '../game/heroes/mira.js';
import type {Effect,Point,RunState} from '../game/runtime.js';

export interface PaintedSprite extends Point {
  hero:string; frame:number; width:number; height:number; angle:number; originX:number; lift:number; alpha:number; ground:boolean;
}
interface StampStyle {
  width:number; height?:number; angle?:number; lift?:number; alpha?:number; ground?:boolean; originX?:number;
}
type Emit=(sprite:PaintedSprite)=>void;
interface Axis extends Point {ax:number;ay:number}
const along=(p:Point,a:number,d:number)=>({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d});
const heading=(p:Axis)=>Math.atan2(p.ay,p.ax);
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const TAU=Math.PI*2;

export function skyfallLift(leap:{t:number;dur:number},reduced:boolean){
  return reduced?0:110*Math.sin(Math.PI*leap.t/leap.dur);
}

// Short release beats hand over to the simulation's live carriers and markers.
// No emitter timers or object references survive a frame, pause, or run change.
export function drawPaintedEffects(g:RunState,reduced:boolean,emit:Emit){
  const hero=g.hero.id,inFlight=reduced?2:1+Math.floor(g.t*8)%2;
  function stamp(slot:number,col:number,p:Point,style:StampStyle){
    const {width,height=width,angle=0,lift=14,alpha=1,ground=false,originX=.5}=style;
    emit({hero,frame:slot*4+col,x:p.x,y:p.y,width,height,angle,originX,lift,alpha,ground});
  }
  function release(f:Effect,slot:number){
    const skill=hero+'-'+slot,a=f.a??0;
    // These skills already launch one illustrated body per live carrier.
    if(skill==='lan-2'||skill==='lia-4'||skill==='nadi-4'||skill==='keo-2')return;
    let age=f.max-f.life;
    if(skill==='nok-4'){
      // Skyfall lands after the leap. Its warning belongs to the floor.
      if(g.sea?.leap){
        const leap=g.sea.leap;
        stamp(4,reduced?2:0,g.p,{width:75,angle:a,lift:skyfallLift(leap,reduced)});
        return;
      }
      age=Math.max(0,age-.45);
    }
    const duration=Math.min(RELEASE_DURATIONS[skill]??.65,f.max);
    if(age>=duration)return;
    const progress=clamp(age/duration),v=reduced?.65:progress;
    const col=reduced?2:Math.min(3,Math.floor(progress*4)),fade=Math.min(1,(1-progress)*5);
    const reach=f.range;
    const area=(p:Point,r:number)=>stamp(slot,col,p,{width:2*r,lift:0,alpha:fade*.76,ground:true});
    const lane=(length:number,width:number)=>{
      const end=length*(.16+.84*Math.min(1,v*2));
      stamp(slot,col,along(f,a,end/2),{width:end,height:width,angle:a,lift:3,alpha:fade,ground:true});
    };
    const fan=(radius:number,half:number)=>{
      const reach=radius*(.45+.55*v),height=Math.min(reach*1.4,2*radius*Math.sin(Math.min(half,Math.PI/2)));
      // The illustration already contains the sweep. Start it at the hand
      // or foot, with a second facing only for Sari's all-around stance.
      const ground=slot!==0;
      const lift=ground?0:Math.max(32,height/2);
      stamp(slot,col,along(f,a,12+reach/2),{width:reach,height,angle:a,lift,alpha:fade,ground});
      if(half>=Math.PI)stamp(slot,col,along(f,a+Math.PI,12+reach/2),{width:reach,height,angle:a+Math.PI,lift,alpha:fade,ground});
    };
    switch(skill){
      case 'mira-0':return fan(MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE);
      case 'mira-1':{
        const extension=reduced?1:Math.min(1,progress*4,1.6*(1-progress));
        return stamp(slot,col,along(f,a,(reach??240)*extension),{width:48,angle:a,lift:12,alpha:fade});
      }
      case 'mira-2':return area(f,reach??110);
      case 'mira-3':return area(f,120);
      case 'ustaz-1':return fan(reach??242,f.half??.62);
      case 'sari-1':return fan(reach??130,f.half??1.15);
      case 'nok-0':return fan(reach??89,.85);
      case 'nok-1':return lane(reach??227,2*(f.w??30));
      case 'keo-1':return fan(240,35*Math.PI/180);
      case 'lia-1':return lane(reach??240,35);
      case 'nadi-1':return lane(260,32);
      case 'dani-1':return lane(230,45);
      case 'asha-1':case 'nadi-2':return area({x:f.tx??f.x,y:f.ty??f.y},reach??90);
      case 'ustaz-3':case 'rempit-3':case 'lan-3':case 'nok-2':return area(f,reach??100);
      case 'dani-2':return area(f,reach??100);
      case 'asha-2':return area(f,90);
      case 'dani-3':return area(f,130);
      case 'keo-3':case 'nadi-3':case 'asha-3':return area(f,150);
      case 'vanna-3':return area(f,110);
      case 'lia-3':return area(f,120);
      case 'nok-4':return area(f,f.r??180);
      case 'lia-2':case 'sari-2':case 'rempit-1':
        return stamp(slot,col,g.p,{width:80,angle:a,lift:15,alpha:fade});
      default:{
        // Small, directed hand-off; the body pose stays legible behind it.
        const size=slot===0?42:slot===4?85:60;
        return stamp(slot,col,along(f,a,28+10*v),{width:size,angle:a,lift:26,alpha:fade});
      }
    }
  }

  for(const f of g.fx){
    if(f.life<=0)continue;
    if(f.kind==='spell'&&f.hero===hero&&f.slot!==undefined){release(f,f.slot);continue}
    const frac=clamp(f.life/f.max),v=1-frac,col=reduced?2:v<.5?2:3;
    if(f.hero===hero&&f.kind==='relay'&&f.tx!==undefined&&f.ty!==undefined){
      const dx=f.tx-f.x,dy=f.ty-f.y,travel=reduced&&hero==='asha'?1:v;
      stamp(hero==='dani'?1:hero==='asha'?2:3,col,{x:f.x+dx*travel,y:f.y+dy*travel},{width:38,angle:Math.atan2(dy,dx),alpha:frac});
    }else if(f.flourish==='return'&&hero==='ustaz'){
      stamp(3,col,reduced?f:{x:f.x+(g.p.x-f.x)*v,y:f.y+(g.p.y-f.y)*v},{width:32,lift:18,alpha:frac});
    }else if(f.kind==='impact'&&f.hero===hero&&f.slot!==undefined){
      const y=f.footY??f.y,size=1.8*(f.r??22);
      stamp(f.slot,col,{x:f.x,y},{width:size,angle:f.a,lift:y-f.y,alpha:frac});
    }else if(f.kind==='ring'){
      const slots=CONTACT_SLOTS[hero];
      const slot=(f.flourish?slots?.[f.flourish]:undefined)??f.slot??slots?.[''];
      // Instant casts already cover their opening circle. Additional remote
      // rings (tickets, an old beacon, a crossing) need their own contact.
      if(!f.flourish&&f.slot!==undefined&&
        !(hero==='asha'&&slot===2||hero==='dani'&&slot===2||hero==='vanna'&&slot===3||hero==='nadi'&&slot===1))continue;
      if(slot!==undefined&&(f.hero===hero||f.flourish)){
        const diameter=2*(f.r??30);
        stamp(slot,col,f,{width:diameter,lift:0,alpha:frac*.8,ground:true});
      }
    }
  }

  for(const q of g.projs){
    if('origin' in q&&q.origin==='item')continue;
    const slot=q.hitOptions?.slot??(q.kind==='dragon'||hero==='nok'?1:0);
    const size=q.kind==='dragon'?82:Math.max(32,q.r*4);
    stamp(slot,inFlight,q,{width:size,angle:Math.atan2(q.vy,q.vx)});
  }
  const rescue=g.roster.mira as {wave:(Axis&{width:number;distance:number})|null;braceUntil:number}|undefined;
  if(rescue?.wave){
    const wave=rescue.wave,a=heading(wave);
    stamp(4,inFlight,along(wave,a,wave.distance),{width:Math.min(52,wave.distance),height:wave.width,angle:a,lift:7,originX:1});
  }
  if(rescue&&rescue.braceUntil>g.t)stamp(3,2,g.p,{width:57,lift:13,alpha:.8});
  const courier=g.roster.lia as {shuttles:(Axis&{age:number;ultimate:boolean})[]}|undefined;
  for(const q of courier?.shuttles??[]){
    const angle=q.age>=.45-1e-8?Math.atan2(g.p.y-q.y,g.p.x-q.x):heading(q);
    const size=q.ultimate?64:42;
    stamp(q.ultimate?4:0,inFlight,q,{width:size,angle});
  }
  const lacquer=g.roster.nadi as {discs:(Point&{radius:number;at:number})[];layers:Point[]}|undefined;
  for(const disc of lacquer?.discs??[]){
    // Each warning circle already shows the full damage radius. Hang the
    // smaller seal above its centre until the contact spreads on the floor.
    const size=disc.radius;
    stamp(4,inFlight,disc,{width:size,lift:size/2+(reduced?0:50*clamp(disc.at-g.t)),alpha:.8});
  }
  for(const layer of lacquer?.layers??[])stamp(2,2,layer,{width:85,lift:0,alpha:.72,ground:true});
  const weaver=g.roster.vanna as {q:Axis|null;e:Axis|null;patches:(Point&{at:number})[]}|undefined;
  if(weaver){
    for(const [i,strip] of [weaver.q,weaver.e].entries())if(strip){
      for(const d of [-92,0,92])stamp(i+1,2,along(strip,heading(strip),d),{width:94,height:40,angle:heading(strip),lift:0,alpha:.82,ground:true});
    }
  }
  const marshal=g.roster.dani as {anchor:Point|null;fields:(Point&{start:number})[]}|undefined;
  if(marshal?.anchor)stamp(2,2,marshal.anchor,{width:54});
  const clerk=g.roster.asha as {fields:(Point&{start:number})[]}|undefined;
  function field(p:Point,start:number,radius:number){
    const beat=reduced?.65:(g.t-start)%1,diameter=radius*(1.2+.8*beat);
    stamp(4,inFlight,p,{width:diameter,lift:0,alpha:.62,ground:true});
  }
  for(const f of clerk?.fields??[])field(f,f.start,220);
  for(const f of marshal?.fields??[])field(f,f.start,200);
  for(const f of weaver?.patches??[])field(f,f.at,200);
  const reeds=g.roster.keo as {pulses:(Point&{at:number})[]}|undefined;
  for(const p of reeds?.pulses??[]){
    if(p.at-g.t<=.6)stamp(4,inFlight,p,{width:120,lift:0,alpha:.7,ground:true});
  }
  if(g.orbit){
    const {ang,n,rad,holy}=g.orbit;
    for(let i=0;i<n;i++){
      const a=ang+i*TAU/n;
      stamp(2,inFlight,along(g.p,a,rad*(holy?1.4:1)),{width:holy?42:33});
    }
  }
  for(const z of g.zones){
    if(z.kind==='fire'||z.kind==='barrier'){
      const diameter=z.kind==='barrier'?Math.min(170,2*z.r):2*z.r;
      stamp(z.kind==='fire'?(z.slot??2):(z.slot??4),inFlight,z,{width:diameter,lift:0,alpha:Math.min(.7,z.life/.4),ground:true});
    }
  }
  for(const strike of g.sea?.strikes??[]){
    stamp(4,inFlight,strike,{width:strike.r*1.6,angle:Math.PI/2,lift:reduced?18:90*clamp(strike.t/strike.t0)});
  }
  for(const echo of g.sea?.images??[])stamp(2,2,echo,{width:2*echo.r,lift:0,alpha:.55,ground:true});
  for(const guard of g.sea?.allies??[])stamp(2,inFlight,guard,{width:62,lift:22});
  if(g.sea?.wai&&g.sea.wai>0)stamp(3,2,g.p,{width:66,lift:24,alpha:.72});
  if(g.sea?.stance&&g.sea.stance>0)stamp(3,2,g.p,{width:72,lift:22,alpha:.72});
  if(hero==='rempit'&&g.p.super>0)stamp(4,inFlight,g.p,{width:93,angle:Math.atan2(g.p.face[1],g.p.face[0]),lift:20,alpha:.82});
}

// Projectiles, persistent summons, and a moving breaker take ownership quickly.
const RELEASE_DURATIONS:Record<string,number>={
  'lia-2':.2,'sari-2':.2,'mira-4':.16,'lia-4':.16,'lan-1':.18,
  'ustaz-2':.22,'keo-2':.18,'vanna-1':.2,'vanna-2':.2
};

const CONTACT_SLOTS:Record<string,Record<string,number>>={
  dani:{anchor:3},nok:{tip:1},rempit:{ignition:3},sari:{echo:1},lan:{ripple:2},
  nadi:{seal:4,kiln:3,'':1},keo:{'echo-land':4,downbeat:4},
  vanna:{crossing:4,'':3},asha:{'':2},lia:{'':0}
};
