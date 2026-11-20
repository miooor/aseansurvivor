import type {Effect,Point,RunState} from '../game/runtime.js';

export interface PaintedSprite extends Point {
  hero:string; frame:number; width:number; height:number; angle:number; originX:number; lift:number; alpha:number; ground:boolean;
}
type Emit=(sprite:PaintedSprite)=>void;
interface Axis extends Point {ax:number;ay:number}
const along=(p:Point,a:number,d:number)=>({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d});
const heading=(p:Axis)=>Math.atan2(p.ay,p.ax);
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const tau=Math.PI*2;

// Short release beats hand over to the simulation's live carriers and markers.
// No emitter timers or object references survive a frame, pause, or run change.
export function drawPaintedEffects(g:RunState,reduced:boolean,emit:Emit){
  const hero=g.hero.id,inFlight=reduced?2:1+Math.floor(g.t*8)%2;
  function stamp(slot:number,col:number,p:Point,width:number,height=width,angle=0,lift=14,alpha=1,ground=false,originX=.5){
    emit({hero,frame:slot*4+col,x:p.x,y:p.y,width,height,angle,originX,lift,alpha,ground});
  }
  function release(f:Effect,slot:number){
    const skill=hero+'-'+slot,a=f.a??0;
    // These skills already launch one illustrated body per live carrier.
    if(skill==='lia-4'||skill==='nadi-4'||skill==='keo-2')return;
    let age=f.max-f.life;
    if(skill==='nok-4'){
      // Skyfall lands after the leap. Its warning belongs to the floor.
      if(g.sea?.leap){
        const leap=g.sea.leap;
        stamp(4,reduced?2:0,f,75,75,a,reduced?20:100*(1-leap.t/leap.dur));
        return;
      }
      age=Math.max(0,age-.45);
    }
    const duration=Math.min(releaseDurations[skill]??.65,f.max);
    if(age>=duration)return;
    const progress=clamp(age/duration),v=reduced?.65:progress;
    const col=reduced?2:Math.min(3,Math.floor(progress*4)),fade=Math.min(1,(1-progress)*5);
    const reach=f.range;
    const area=(p:Point,r:number)=>stamp(slot,col,p,2*r,2*r,0,0,fade*.76,true);
    const lane=(length:number,width:number)=>{
      const end=length*(.16+.84*Math.min(1,v*2));
      stamp(slot,col,along(f,a,end/2),end,width,a,3,fade,true);
    };
    const fan=(radius:number,half:number)=>{
      const reach=radius*(.45+.55*v),height=Math.min(reach*1.4,2*radius*Math.sin(Math.min(half,Math.PI/2)));
      // The illustration already contains the sweep. Start it at the hand
      // or foot, with a second facing only for Sari's all-around stance.
      const ground=slot!==0;
      const lift=ground?0:Math.max(32,height/2);
      stamp(slot,col,along(f,a,12+reach/2),reach,height,a,lift,fade,ground);
      if(half>=Math.PI)stamp(slot,col,along(f,a+Math.PI,12+reach/2),reach,height,a+Math.PI,lift,fade,ground);
    };
    switch(skill){
      case 'mira-0':return fan(100,35*Math.PI/180);
      case 'mira-1':{
        const extension=reduced?1:Math.min(1,progress*4,1.6*(1-progress));
        return stamp(slot,col,along(f,a,(reach??240)*extension),48,48,a,12,fade);
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
        return stamp(slot,col,g.p,80,80,a,15,fade);
      default:{
        // Small, directed hand-off; the body pose stays legible behind it.
        const size=slot===0?42:slot===4?85:60;
        return stamp(slot,col,along(f,a,28+10*v),size,size,a,26,fade);
      }
    }
  }

  for(const f of g.fx){
    if(f.life<=0)continue;
    if(f.kind==='spell'&&f.hero===hero&&f.slot!==undefined){release(f,f.slot);continue}
    const frac=clamp(f.life/f.max),v=1-frac,col=reduced?2:v<.5?2:3;
    if(f.hero===hero&&f.kind==='relay'&&f.tx!==undefined&&f.ty!==undefined){
      const dx=f.tx-f.x,dy=f.ty-f.y;
      stamp(hero==='dani'?1:hero==='asha'?2:3,col,{x:f.x+dx*v,y:f.y+dy*v},38,38,Math.atan2(dy,dx),14,frac);
    }else if(f.flourish==='return'&&hero==='ustaz'){
      stamp(3,col,{x:f.x+(g.p.x-f.x)*v,y:f.y+(g.p.y-f.y)*v},32,32,0,18,frac);
    }else if(f.kind==='impact'&&f.hero===hero&&f.slot!==undefined){
      const y=f.footY??f.y,size=1.8*(f.r??22);
      stamp(f.slot,col,{x:f.x,y},size,size,f.a,y-f.y,frac);
    }else if(f.kind==='ring'){
      const slots=contactSlots[hero];
      const slot=(f.flourish?slots?.[f.flourish]:undefined)??f.slot??slots?.[''];
      // Instant casts already cover their opening circle. Additional remote
      // rings (tickets, an old beacon, a crossing) need their own contact.
      if(!f.flourish&&f.slot!==undefined&&
        !(hero==='asha'&&slot===2||hero==='dani'&&slot===2||hero==='vanna'&&slot===3||hero==='nadi'&&slot===1))continue;
      if(slot!==undefined&&(f.hero===hero||f.flourish)){
        const diameter=2*(f.r??30);
        stamp(slot,col,f,diameter,diameter,0,0,frac*.8,true);
      }
    }
  }

  for(const q of g.projs){
    if('origin' in q&&q.origin==='item')continue;
    const slot=q.hitOptions?.slot??(q.kind==='dragon'||hero==='nok'?1:0);
    const size=q.kind==='dragon'?82:Math.max(32,q.r*4);
    stamp(slot,inFlight,q,size,size,Math.atan2(q.vy,q.vx));
  }
  const rescue=g.roster.mira as {wave:(Axis&{width:number;distance:number})|null;braceUntil:number}|undefined;
  if(rescue?.wave){
    const wave=rescue.wave,a=heading(wave);
    stamp(4,inFlight,along(wave,a,wave.distance),Math.min(52,wave.distance),wave.width,a,7,1,false,1);
  }
  if(rescue&&rescue.braceUntil>g.t)stamp(3,2,g.p,57,57,0,13,.8);
  const courier=g.roster.lia as {shuttles:(Axis&{age:number;ultimate:boolean})[]}|undefined;
  for(const q of courier?.shuttles??[]){
    const angle=q.age>=.45-1e-8?Math.atan2(g.p.y-q.y,g.p.x-q.x):heading(q);
    const size=q.ultimate?64:42;
    stamp(q.ultimate?4:0,inFlight,q,size,size,angle);
  }
  const lacquer=g.roster.nadi as {discs:(Point&{radius:number;at:number})[];layers:Point[]}|undefined;
  for(const disc of lacquer?.discs??[]){
    // Each warning circle already shows the full damage radius. Hang the
    // smaller seal above its centre until the contact spreads on the floor.
    const size=disc.radius;
    stamp(4,inFlight,disc,size,size,0,size/2+(reduced?0:50*clamp(disc.at-g.t)),.8);
  }
  for(const layer of lacquer?.layers??[])stamp(2,2,layer,85,85,0,0,.72,true);
  const weaver=g.roster.vanna as {q:Axis|null;e:Axis|null;patches:(Point&{at:number})[]}|undefined;
  if(weaver){
    for(const [i,strip] of [weaver.q,weaver.e].entries())if(strip){
      for(const d of [-92,0,92])stamp(i+1,2,along(strip,heading(strip),d),94,40,heading(strip),0,.82,true);
    }
  }
  const marshal=g.roster.dani as {anchor:Point|null;fields:(Point&{start:number})[]}|undefined;
  if(marshal?.anchor)stamp(2,2,marshal.anchor,54);
  const clerk=g.roster.asha as {fields:(Point&{start:number})[]}|undefined;
  function field(p:Point,start:number,radius:number){
    const beat=reduced?.65:(g.t-start)%1,diameter=radius*(1.2+.8*beat);
    stamp(4,inFlight,p,diameter,diameter,0,0,.62,true);
  }
  for(const f of clerk?.fields??[])field(f,f.start,220);
  for(const f of marshal?.fields??[])field(f,f.start,200);
  for(const f of weaver?.patches??[])field(f,f.at,200);
  const reeds=g.roster.keo as {pulses:(Point&{at:number})[]}|undefined;
  for(const p of reeds?.pulses??[]){
    if(p.at-g.t<=.6)stamp(4,inFlight,p,120,120,0,0,.7,true);
  }
  if(g.orbit){
    const {ang,n,rad,holy}=g.orbit;
    for(let i=0;i<n;i++){
      const a=ang+i*tau/n;
      stamp(2,inFlight,along(g.p,a,rad*(holy?1.4:1)),holy?42:33);
    }
  }
  for(const z of g.zones){
    if(z.kind==='fire'||z.kind==='barrier'){
      const diameter=z.kind==='barrier'?Math.min(170,2*z.r):2*z.r;
      stamp(z.kind==='fire'?(z.slot??2):(z.slot??4),inFlight,z,diameter,diameter,0,0,Math.min(.7,z.life/.4),true);
    }
  }
  for(const strike of g.sea?.strikes??[]){
    stamp(4,inFlight,strike,strike.r*1.6,strike.r*1.6,Math.PI/2,reduced?18:90*clamp(strike.t/strike.t0));
  }
  for(const echo of g.sea?.images??[])stamp(2,2,echo,2*echo.r,2*echo.r,0,0,.55,true);
  for(const ally of g.sea?.allies??[])stamp(2,inFlight,ally,48);
  if(g.sea?.wai&&g.sea.wai>0)stamp(3,2,g.p,66,66,0,24,.72);
  if(g.sea?.stance&&g.sea.stance>0)stamp(3,2,g.p,72,72,0,22,.72);
  if(hero==='rempit'&&g.p.super>0)stamp(4,inFlight,g.p,93,93,Math.atan2(g.p.face[1],g.p.face[0]),20,.82);
}

// Projectiles, persistent summons, and a moving breaker take ownership quickly.
const releaseDurations:Record<string,number>={
  'lia-2':.2,'sari-2':.2,'mira-4':.16,'lia-4':.16,'lan-1':.18,
  'lan-2':.25,'ustaz-2':.22,'keo-2':.18,'vanna-1':.2,'vanna-2':.2
};

const contactSlots:Record<string,Record<string,number>>={
  nok:{tip:1},rempit:{ignition:3},sari:{echo:1},lan:{ripple:2},
  nadi:{seal:4,kiln:3,'':1},keo:{'echo-land':4,downbeat:4},
  vanna:{crossing:4,'':3},asha:{'':2},lia:{'':0}
};
