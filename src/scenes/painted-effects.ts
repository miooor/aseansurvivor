import {THOUSAND_PALMS_BEAT} from '../game/heroes/nadi.js';
import type {MonkKit} from './heroes/nadi';
import {LOOM_HALF_SIZE,vannaFamiliarPoint} from '../game/heroes/vanna.js';
import {BLADE_WHEEL_RADIUS,CRESCENT_CUT_WIDTH} from '../game/heroes/lia.js';
import {SPECIALIZATIONS} from '../content/specializations.js';
import {MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE} from '../game/heroes/mira.js';
import type {ExhaustOutlet} from './bike-exhaust';
import type {Effect,Point,RunState} from '../game/runtime.js';

type Relief='field'|'lane'|'shot'|'point';
export interface PaintedSprite extends Point {
  relief?:Relief;
  hero:string; frame:number; width:number; height:number; angle:number; originX:number; lift:number; alpha:number; ground:boolean;
}
interface StampStyle {
  relief?:Relief;
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
export function drawPaintedEffects(g:RunState,reduced:boolean,emit:Emit,outlet?:ExhaustOutlet){
  if(g.hero.id==='nadi')return drawMonkPaint(g,reduced,emit);
  const hero=g.hero.id,inFlight=reduced?2:1+Math.floor(g.t*8)%2;
  function stamp(slot:number,col:number,p:Point,style:StampStyle){
    const {width,height=width,angle=0,lift=14,alpha=1,ground=false,originX=.5}=style;
    emit({hero,relief:style.relief,frame:slot*4+col,x:p.x,y:p.y,width,height,angle,originX,lift,alpha,ground});
  }
  function release(f:Effect,slot:number){
    const skill=hero+'-'+slot,a=f.a??0;
    // These skills already launch one illustrated body per live carrier.
    if(skill==='rempit-2'||skill==='rempit-4'||skill==='lan-2'||skill==='lia-4'||skill==='keo-2')return;
    if(hero==='dani'&&slot>0)return;
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
    const area=(p:Point,r:number)=>{
      // Skyfall lands at full size. Safe Harbour shows both contact radii immediately.
      const bloom=reduced||skill==='nok-4'?1:1-.50*Math.pow(1-Math.min(1,progress*2.4),2);
      stamp(slot,col,p,{relief:'field',width:2*r*bloom,lift:0,alpha:fade*.92,ground:true});
    };
    const lane=(length:number,width:number)=>{
      const end=length*(.16+.84*Math.min(1,v*2));
      stamp(slot,col,along(f,a,end/2),{relief:'lane',width:end,height:width,angle:a,lift:3,alpha:fade,ground:true});
    };
    const fan=(radius:number,half:number)=>{
      const reach=radius*(.7+.3*Math.min(1,v*2.2)),height=Math.min(reach*1.4,2*radius*Math.sin(Math.min(half,Math.PI/2)));
      // The illustration already contains the sweep. Start it at the hand
      // or foot, with a second facing only for Sari's all-around stance.
      const ground=slot!==0;
      const lift=ground?0:Math.max(32,height/2);
      stamp(slot,col,along(f,a,12+reach/2),{relief:'lane',width:reach,height,angle:a,lift,alpha:fade,ground});
      if(half>=Math.PI)stamp(slot,col,along(f,a+Math.PI,12+reach/2),{relief:'lane',width:reach,height,angle:a+Math.PI,lift,alpha:fade,ground});
    };
    switch(skill){
      case 'mira-0':return fan(MIRA_BASIC_REACH,MIRA_BASIC_HALF_ANGLE);
      case 'mira-1':{
        const extension=reduced?1:Math.min(1,progress*4,1.6*(1-progress));
        return stamp(slot,col,along(f,a,(reach??240)*extension),{relief:'point',width:77,angle:a,lift:38,alpha:fade});
      }
      case 'mira-2':return area(f,reach??110);
      case 'mira-3':return area(f,120);
      case 'ustaz-1':{
        if((f.half??.62)<Math.PI)return fan(reach??242,f.half??.62);
        const radius=(reach??242)*(.7+.3*Math.min(1,v*2.2));
        for(let i=0;i<8;i++){
          const angle=a+i*TAU/8;
          stamp(slot,col,along(f,angle,radius/2),{width:radius,height:radius*.82,angle,lift:0,alpha:fade*.72,ground:true});
        }
        return;
      }
      case 'sari-1':return fan(reach??130,f.half??1.15);
      case 'nok-0':return fan(reach??89,.85);
      case 'nok-1':return; // The flying knee carries its own sprite and raised arc.
      case 'keo-1':return fan(240,35*Math.PI/180);
      case 'lia-1':return lane(reach??SPECIALIZATIONS.lia.base.length,CRESCENT_CUT_WIDTH);
      case 'asha-1':return area({x:f.tx??f.x,y:f.ty??f.y},reach??90);
      case 'ustaz-3':return stamp(slot,col,f,{width:2*(reach??200),lift:0,alpha:fade*.26,ground:true});
      case 'rempit-3':case 'lan-3':case 'nok-2':return area(f,reach??100);
      case 'asha-2':return; // Each payout relay carries its own sprite.
      case 'keo-3':return area(f,150);
      case 'asha-3':return fan(240,50*Math.PI/180);
      case 'vanna-1':return lane(280,50);
      case 'vanna-2':return stamp(slot,col,f,{width:54,lift:32,angle:a,alpha:fade*.72});
      case 'vanna-3':return stamp(slot,col,f,{width:85,lift:32,angle:a,alpha:fade*.53});
      case 'vanna-4':
        for(const dx of [-LOOM_HALF_SIZE,LOOM_HALF_SIZE])for(const dy of [-LOOM_HALF_SIZE,LOOM_HALF_SIZE]){
          stamp(slot,col,{x:f.x+dx,y:f.y+dy},{relief:'point',width:60,lift:20,alpha:fade*.86});
        }
        return;
      case 'lia-3':return area(g.p,BLADE_WHEEL_RADIUS);
      case 'nok-4':return area(f,f.r??180);
      case 'rempit-1':
        return stamp(1,col,f,{relief:'lane',width:96,height:42,angle:a,lift:0,alpha:fade,ground:true});
      case 'lia-2':case 'sari-2':
        return stamp(slot,col,g.p,{relief:'point',width:110,angle:a,lift:32,alpha:fade});
      default:{
        // Set the release just beyond the silhouette, at hand height.
        const size=slot===0?82:slot===4?118:96;
        return stamp(slot,col,along(f,a,35+14*v),{width:size,angle:a,lift:40,alpha:fade});
      }
    }
  }

  for(const f of g.fx){
    if(f.life<=0)continue;
    if(f.kind==='spell'&&f.hero===hero&&f.slot!==undefined){release(f,f.slot);continue}
    const frac=clamp(f.life/f.max),v=1-frac,col=reduced?2:v<.5?2:3;
    if(f.hero===hero&&f.kind==='relay'&&f.tx!==undefined&&f.ty!==undefined){
      const dx=f.tx-f.x,dy=f.ty-f.y,travel=reduced&&hero==='asha'?1:v;
      stamp(f.slot??(hero==='asha'?2:3),col,{x:f.x+dx*travel,y:f.y+dy*travel},{width:64,lift:32,angle:Math.atan2(dy,dx),alpha:frac});
    }else if(f.kind==='shadowstep'&&hero==='lia'&&f.tx!==undefined&&f.ty!==undefined){
      stamp(f.slot??2,col,{x:f.tx,y:f.ty},{width:100,angle:Math.atan2(f.ty-f.y,f.tx-f.x),lift:36,alpha:frac});
    }else if(f.flourish==='return'&&hero==='ustaz'){
      stamp(3,col,reduced?f:{x:f.x+(g.p.x-f.x)*v,y:f.y+(g.p.y-f.y)*v},{width:52,lift:26,alpha:frac});
    }else if(f.kind==='impact'&&f.hero===hero&&f.slot!==undefined){
      const y=f.footY??f.y,size=Math.max(56,2.3*(f.r??22));
      if(hero==='dani'){
        stamp(0,3,{x:f.x,y},{width:size*.78,angle:f.a,lift:y-f.y,alpha:Math.sqrt(frac)});
      }else stamp(f.slot,col,{x:f.x,y},{width:size,angle:f.a,lift:y-f.y,alpha:Math.sqrt(frac)});
    }else if(f.kind==='ring'){
      const slots=CONTACT_SLOTS[hero];
      const slot=(f.flourish?slots?.[f.flourish]:undefined)??f.slot??slots?.[''];
      // Instant casts already cover their opening circle. Additional remote
      // rings (tickets, an old beacon, a crossing) need their own contact.
      if(!f.flourish&&f.slot!==undefined&&
        !(hero==='asha'&&slot===2))continue;
      if(slot!==undefined&&(f.hero===hero||f.flourish)){
        const diameter=2*(f.r??30);
        stamp(slot,col,f,{width:diameter,lift:0,alpha:frac*.8,ground:true});
      }
    }
  }

  for(const q of g.projs){
    if(q.kind==='gold-bar'||'origin' in q&&q.origin==='item')continue;
    const slot=q.hitOptions?.slot??(q.kind==='dragon'||hero==='nok'?1:0);
    const size=q.kind==='dragon'?120:Math.max(72,q.r*5);
    stamp(slot,inFlight,q,{relief:'shot',width:size,lift:size/2,angle:Math.atan2(q.vy,q.vx)});
  }
  const weave=g.roster.vanna as {raid:RunState['raid'];familiar:{start:number;until:number}|null}|undefined;
  const familiar=weave?.familiar;
  if(hero==='vanna'&&weave?.raid===g.raid&&familiar&&familiar.until>g.t){
    const p=vannaFamiliarPoint(g.p,familiar.start,g.t);
    stamp(3,reduced?2:1+Math.floor((g.t-familiar.start)*7)%2,p,
      {width:93,height:73,lift:41,angle:p.angle+Math.PI/2,alpha:Math.min(1,(familiar.until-g.t)/.17)});
  }
  const rescue=g.roster.mira as {wave:(Axis&{width:number;distance:number})|null;braceUntil:number}|undefined;
  if(rescue?.wave){
    const wave=rescue.wave,a=heading(wave);
    stamp(4,inFlight,along(wave,a,wave.distance),{relief:'point',width:Math.min(52,wave.distance),height:wave.width,angle:a,lift:7,originX:1});
  }
  if(rescue&&rescue.braceUntil>g.t)stamp(3,2,g.p,{relief:'point',width:82,lift:32,alpha:.9});
  const clerk=g.roster.asha as {fields:(Point&{start:number})[]}|undefined;
  function field(p:Point,start:number,radius:number){
    const beat=reduced?.65:(g.t-start)%1,diameter=radius*(1.2+.8*beat);
    stamp(4,inFlight,p,{relief:'field',width:diameter,lift:0,alpha:.62,ground:true});
  }
  for(const f of clerk?.fields??[])field(f,f.start,220);
  const reeds=g.roster.keo as {pulses:(Point&{at:number})[]}|undefined;
  for(const p of reeds?.pulses??[]){
    if(p.at-g.t<=.6)stamp(4,inFlight,p,{relief:'field',width:120,lift:0,alpha:.7,ground:true});
  }
  if(g.orbit){
    const {ang,n,rad,holy}=g.orbit;
    for(let i=0;i<n;i++){
      const a=ang+i*TAU/n;
      stamp(2,inFlight,along(g.p,a,rad*(holy?1.4:1)),{width:holy?62:49,lift:28});
    }
  }
  for(const z of g.zones){
    if(z.kind==='barrier'&&hero==='ustaz'&&z.slot===3)continue;
    if(z.kind==='fire'&&hero==='rempit')continue; // The road renderer paints the scorched contact patch.
    if(z.kind==='fire'||z.kind==='barrier'){
      const diameter=z.kind==='barrier'?Math.min(230,2*z.r):2*z.r;
      stamp(z.kind==='fire'?(z.slot??2):(z.slot??4),inFlight,z,{width:diameter,lift:0,alpha:Math.min(.7,z.life/.4),ground:true});
    }
  }
  for(const strike of g.sea?.strikes??[]){
    stamp(4,inFlight,strike,{relief:'point',width:strike.r*1.6,angle:Math.PI/2,lift:reduced?18:90*clamp(strike.t/strike.t0)});
  }
  for(const echo of g.sea?.images??[])stamp(2,2,echo,{width:2*echo.r,lift:0,alpha:.55,ground:true});
  for(const guard of g.sea?.allies??[])stamp(2,inFlight,guard,{relief:'point',width:84,lift:42});
  if(g.sea?.wai&&g.sea.wai>0)stamp(3,2,g.p,{relief:'point',width:100,lift:38,alpha:.9});
  if(g.sea?.stance&&g.sea.stance>0)stamp(3,2,g.p,{relief:'point',width:100,lift:38,alpha:.9});
  if(outlet&&(g.p.super>0||g.p.exhaust>0)){
    const boost=g.p.super>0;
    const hot=g.p.exhaust>0;
    const length=(hot?115:80)+Math.min(1,Math.hypot(g.p.vx,g.p.vy)/320)*32;
    // The long end of the illustration points left. Keep its right edge at
    // the outlet and blend the wake just behind the rider's foot depth.
    const depth=g.p.y-2;
    stamp(boost?4:2,inFlight,{x:outlet.x,y:depth},{width:length,height:hot?72:54,
      angle:Math.atan2(-outlet.dy,-outlet.dx),lift:depth-outlet.y,originX:.90,alpha:boost?.58:.45});
  }
}

// Projectiles, persistent summons, and a moving breaker take ownership quickly.
const RELEASE_DURATIONS:Record<string,number>={
  'lia-2':.2,'sari-2':.2,'mira-4':.16,'lia-4':.16,'lan-1':.18,
  'ustaz-2':.22,'keo-2':.18,'vanna-1':.42,'vanna-2':.48
};

const CONTACT_SLOTS:Record<string,Record<string,number>>={
  nok:{tip:1},rempit:{ignition:3},sari:{echo:1},lan:{ripple:2},
  keo:{'echo-land':4,downbeat:4},
  asha:{'':2},lia:{'':0}
};

function drawMonkPaint(g:RunState,reduced:boolean,emit:Emit){
  const s=g.roster.nadi as MonkKit|undefined;
  function stamp(p:Point,frame:number,width:number,height:number,lift:number,style:Partial<PaintedSprite>={}){
    emit({hero:'nadi',frame,x:p.x,y:p.y,width,height,lift,angle:0,originX:.5,alpha:1,ground:false,...style});
  }
  for(const f of g.fx){
    if(f.hero!=='nadi')continue;
    const alpha=Math.min(1,f.life/.10),angle=f.a??0;
    if(f.kind==='spell'&&f.slot===0){
      const d=32+(reduced?.55:1-f.life/f.max)*30;
      stamp({x:f.x+d*Math.cos(angle),y:f.y+d*Math.sin(angle)},0,42,52,35,{alpha});
    }else if(f.kind==='impact'&&f.slot!==4){
      const y=f.footY??f.y;
      const size=f.c==='#ffe66b'?56:37;
      stamp({x:f.x,y},2,size,size*1.05,y-f.y,{alpha:Math.min(.8,f.life/f.max)});
    }
  }
  if(s?.barrage){
    const {beat,next}=s.barrage;
    const v=reduced?.6:1-Math.min(1,(next-g.t)/THOUSAND_PALMS_BEAT);
    for(let i=0;i<5;i++){
      const angle=i*Math.PI*2/5+(reduced?0:beat*.44);
      const distance=48+45*v;
      const p={x:g.p.x+Math.cos(angle)*distance,y:g.p.y+Math.sin(angle)*distance};
      stamp(p,reduced?6:4+(i+beat)%4,53,69,34+14*v,{alpha:reduced?.65:.50+.4*(1-v)});
    }
  }
  for(const wave of s?.waves??[]){
    const {distance,ax,ay,width}=wave;
    const p={x:wave.x+ax*distance,y:wave.y+ay*distance};
    stamp(p,8,Math.min(58,Math.max(1,distance)),width,5,
      {angle:Math.atan2(ay,ax),ground:true,originX:1,alpha:wave.empowered?.98:.8});
    if(wave.empowered)stamp(p,0,64,82,39);
  }
  if(s?.guard&&s.guard.until>g.t)stamp(g.p,12,68,72,42,{alpha:.42});
  const ward=s?.ward;
  if(!ward||ward.until<=g.t)return;
  const fade=Math.min(1,(ward.until-g.t)*4);
  stamp(ward,16,112,122,60,{alpha:fade});
  for(const monk of ward.monks){
    const swing=monk.swingUntil>g.t,side=Math.cos(monk.angle);
    const lift=37+(reduced?0:2*Math.sin(g.t*8+monk.angle));
    stamp(monk,side<0?18:17,61,74,lift,{alpha:(swing?.96:.82)*fade});
    if(swing)stamp({x:monk.x+side*25,y:monk.y+Math.sin(monk.angle)*25},19,37,42,34,{alpha:fade});
  }
}
