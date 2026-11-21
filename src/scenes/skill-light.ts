import {MIRA_BASIC_HALF_ANGLE,MIRA_BASIC_REACH} from '../game/heroes/mira.js';
import type {Effect,Point,RunState} from '../game/runtime.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

type Light=Pick<SpellRibbons,'glow'|'strip'>;
type Palette=readonly [colour:number,highlight:number];
const pigments:Record<string,Palette>={
  ustaz:[0xffa124,0xfff0a4],rempit:[0xff4620,0x80e5ff],nok:[0xff6040,0xffdd82],
  lan:[0x159dc8,0x9affe0],sari:[0xd849bc,0xffb6bd],asha:[0xff5fa2,0xffd34d],
  mira:[0xe57335,0xffdfa0],dani:[0xa7761c,0xffdc78],vanna:[0xec51a9,0xb7a8ff],
  keo:[0x98d35a,0xffe89b],nadi:[0xe8a04d,0xffe7b0],lia:[0x894adc,0xceefff]
};
const turn=2*Math.PI;
const polar=(p:Point,r:number,a:number,h:number):Knot=>[p.x+r*Math.cos(a),p.y+r*Math.sin(a),h];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));

// Stagger the illuminated tiles so light travels around the ward during its five-second life.
function sanctuary(light:Light,z:RunState['zones'][number],reduced:boolean){
  const age=z.max-z.life,fade=clamp(z.life/.45)*clamp(.25+age*4);
  const time=reduced?.48:age;
  light.glow([z.x,z.y,0],z.r*1.08,0xff972c,.42*fade);
  for(let i=0;i<8;i++){
    // Leave a clear sightline to the inscription between the two front tiles.
    const angle=(i+.5)*turn/8+(i===1?-.13:i===2?.13:0);
    const [x,y]=polar(z,z.r*.70,angle,0);
    const phase=(time*.65+i*.375)%1,wave=Math.sin(Math.PI*phase)**2;
    const strength=fade*(.30+.70*wave);
    const w=z.r*.165,h=w*.63;
    const tile:Knot[]=[[x-w,y,0],[x,y-h,0],[x+w,y,0],[x,y+h,0],[x-w,y,0]];
    light.glow([x,y,0],w*1.95,0x40ef89,strength*.86);
    light.strip(tile,6,0xc5ffb8,strength,false);
    const top=52+96*wave;
    const column:Knot[]=[[x,y,0],[x,y,12],[x,y,top*.56],[x,y,top]];
    light.strip(column,w*.88,0x38f899,strength*.60);
    light.strip(column,w*.30,0xe5ffe0,strength*.88);
    // A four-point fleck lifts out of each tile and dissolves before it resets.
    const sx=x+Math.cos(angle+phase)*w*.45,sz=14+phase*108;
    const glint=wave*fade,size=2+5*wave;
    light.strip([[sx-size,y,sz],[sx,y,sz],[sx+size,y,sz]],2,0xeaffdf,glint);
    light.strip([[sx,y,sz-size*1.6],[sx,y,sz],[sx,y,sz+size*1.6]],2,0xeaffdf,glint);
  }
}

function wake(light:Light,p:Point,dx:number,dy:number,length:number,h:number,phase:number,ink:Palette){
  // Two ribbons of different lengths twist out from the back of the painted tip.
  for(const side of [-1,1]){
    const path:Knot[]=[];
    for(let i=0;i<=8;i++){
      const u=i/8,back=8+length*u*(side<0?1:.74);
      const curl=side*(3+9*u)*Math.sin(u*4.8-phase);
      path.push([p.x-dx*back-dy*curl,p.y-dy*back+dx*curl,h+3-9*u+curl*.4]);
    }
    light.strip(path,side<0?6:3,ink[side<0?0:1],.85);
  }
}

function crest(light:Light,p:Point,radius:number,phase:number,alpha:number,ink:Palette){
  // Leave gaps between the wave crests so targets remain visible inside a field.
  const front=radius*(.18+.82*(1-(1-phase)**2));
  for(let i=0;i<5;i++){
    const start=turn*i/5+phase*.38;
    const path:Knot[]=[];
    for(let j=0;j<=9;j++){
      const u=j/9,peak=Math.sin(u*Math.PI);
      path.push(polar(p,front*(.91+.09*peak),start+u*.94,5+peak*(1-phase)*18));
    }
    light.strip(path,6,ink[0],alpha);
    light.strip(path.slice(4,9),2.6,ink[1],alpha);
    light.glow(path[6],8,ink[1],alpha*.65);
  }
}

function contact(light:Light,f:Effect,phase:number,alpha:number,ink:Palette){
  const radius=f.r??22,angle=f.a??0;
  light.glow([f.x,f.y,10],radius*(1.30-.65*phase),ink[0],alpha*.75);
  // Longer splinters leave in the attack direction, shorter ones kick back.
  for(let i=0;i<5;i++){
    const heading=angle+(i-2)*1.28;
    const reach=radius*(i===2?2.1:1.25)*(.35+.65*phase);
    const tip=polar(f,reach,heading,10+15*Math.sin(phase*Math.PI));
    light.strip([polar(f,reach*.35,heading-.16,9),polar(f,reach*.75,heading,tip[2]),tip],
      i===2?5:3,i%2?ink[0]:ink[1],alpha);
  }
}

function release(light:Light,f:Effect,reduced:boolean,ink:Palette){
  if(f.hero==='rempit'&&(f.slot===1||f.slot===2||f.slot===4))return;
  // Skyfall's shockwave starts at touchdown, after its .45 second leap.
  const age=f.max-f.life-(f.skill==='nok-4'?.45:0);
  const duration=Math.min(f.max,(f.skill==='ustaz-1'||f.slot===4)?.62:f.slot===0?.18:.38);
  if(age<0||age>=duration)return;
  const phase=reduced?.55:clamp(age/duration),alpha=clamp((duration-age)/.14)*(reduced?.48:1);
  const heading=f.a??0,ultimate=f.slot===4;
  // Targeted casts gather at their destination. Delayed and split ultimates
  // already carry their warning at each live target until contact.
  if(f.hero==='nadi'||f.hero==='dani'&&f.slot!==0||f.skill==='keo-4'||(f.skill==='vanna-3'||f.skill==='vanna-4'))return;
  if(f.skill==='nok-4'){
    crest(light,f,f.r??180,phase,alpha,ink);
    return;
  }
  const p=f.tx!==undefined&&f.ty!==undefined?{x:f.tx,y:f.ty}:f;
  if(f.skill==='mira-2'){
    crest(light,p,f.range??110,phase,alpha,ink);
    return;
  }
  if(f.skill==='ustaz-1'){
    const half=f.half??.62,radius=f.range??242;
    const front=clamp(.20+.84*(1-(1-phase)**2));
    for(let i=0;i<2;i++){
      const reach=radius*Math.max(.06,front-i*.18),edge:Knot[]=[];
      for(let j=0;j<=40;j++)edge.push(polar(f,reach,heading-half+2*half*j/40,8+i*4));
      light.strip(edge,i?12:19,i?0xff8060:0xffb644,alpha,half<Math.PI);
      if(!i)light.strip(edge,5,0xffffc8,alpha,half<Math.PI);
    }
    // Shafts rise off the moving crest; the bright tips dissolve into sparks.
    const shafts=half>=Math.PI?18:7;
    for(let i=0;i<shafts;i++){
      const a=heading+half*(2*(i+.5)/shafts-1);
      const lift=(19+25*Math.sin(i*2.4)**2)*Math.sin(Math.PI*phase);
      const tip=polar(f,radius*front,a,12+lift);
      light.strip([polar(f,radius*front*.69,a,3),polar(f,radius*front*.9,a,10+lift*.4),tip],7,0xffc76a,alpha*.83);
      light.glow(tip,5+i%3,0xfff8cb,alpha*.92);
    }
    return;
  }
  // The light edge sweeps through the same sector as the painted hand or blade.
  if(f.skill==='nok-0'||f.skill==='nok-1'||f.skill==='mira-0'||f.skill==='sari-1'||f.skill==='keo-1'){
    const radius=f.range??(f.skill==='keo-1'?240:MIRA_BASIC_REACH);
    const half=f.half??(f.skill==='nok-0'?.85:MIRA_BASIC_HALF_ANGLE);
    const edge:Knot[]=[];
    for(let i=0;i<=15;i++){
      const u=i/15,b=heading-half+half*2*clamp(phase*1.7-u*.60);
      edge.push(polar(f.cross??p,radius*(.70+.28*(1-u*u)),b,9+24*(1-u)));
    }
    light.strip(edge,11,ink[0],alpha);
    light.strip(edge.slice(0,10),4,ink[1],alpha);
    light.glow(edge[0],18,ink[1],alpha*.85);
    return;
  }
  const span=ultimate?115:f.slot===0?52:78;
  const front=span*(.32+.68*phase);
  for(const side of [-1,1]){
    const path:Knot[]=[];
    for(let i=0;i<=10;i++){
      const u=i/10,bend=Math.sin(Math.PI*u);
      const angle=heading+side*(.16+.92*(1-u));
      path.push(polar(p,front*(.27+.73*u),angle,18+bend*(ultimate?40:20)+phase*8));
    }
    light.strip(path,ultimate?8:4.8,ink[0],alpha);
    light.strip(path.slice(5),2.7,ink[1],alpha);
    light.glow(path[8],ultimate?18:9,ink[1],alpha*.6);
  }
  if(ultimate)crest(light,p,span,phase,alpha*.85,ink);
}

export function drawSkillLight(light:Light,g:RunState,reduced:boolean){
  const ink=pigments[g.hero.id];
  if(!ink)return;
  const phase=reduced?0:g.t*9;
  for(const q of g.projs){
    if(q.kind==='gold-bar'||'origin' in q&&q.origin==='item')continue;
    const speed=Math.hypot(q.vx,q.vy);
    if(speed<1)continue;
    const height=q.kind==='dragon'?60:Math.max(36,q.r*2.5);
    wake(light,q,q.vx/speed,q.vy/speed,Math.min(90,speed*.15),height*Math.SQRT2,phase,ink);
  }
  for(const f of g.fx){
    if(f.hero!==g.hero.id||f.life<=0)continue;
    const remaining=clamp(f.life/f.max),travel=reduced?.55:1-remaining;
    const alpha=remaining*(reduced?.5:1);
    if(f.kind==='spell')release(light,f,reduced,ink);
    else if(f.kind==='impact')contact(light,f,travel,alpha,ink);
    else if(f.kind==='ring')crest(light,f,f.r??30,travel,alpha,ink);
  }
  if(g.orbit){
    const {ang,n,rad,holy}=g.orbit;
    for(let i=0;i<n;i++){
      const head=ang+i*turn/n,r=rad*(holy?1.4:1);
      const tail:Knot[]=[];
      for(let j=0;j<=8;j++)tail.push(polar(g.p,r,head-j*.073,38-j*.8));
      light.strip(tail,holy?6:4,ink[0],.9);
      light.glow(tail[0],holy?15:10,ink[1],.75);
    }
  }
  const reeds=g.roster.keo as {pulses:(Point&{at:number})[]}|undefined;
  const next=reeds?.pulses[0];
  if(next&&next.at-g.t<=.6){
    const beat=reduced?.5:clamp(1-(next.at-g.t)/.6);
    crest(light,next,180,beat,.32+.46*beat,ink);
  }
  for(const strike of g.sea?.strikes??[]){
    const fall=reduced?.45:clamp(strike.t/strike.t0);
    const h=fall*126+12;
    const lean=strike.kind==='feather'?24:8;
    light.strip([[strike.x+lean,strike.y,h+66],[strike.x+lean*.25,strike.y,h+27],
      [strike.x,strike.y,h]],6,ink[0],.9);
    light.glow([strike.x,strike.y,h],13,ink[1],.78);
  }
  for(const z of g.zones){
    if(z.kind!=='barrier')continue;
    if(z.slot===3){sanctuary(light,z,reduced);continue}
    const beat=reduced?.65:((z.max-z.life)/1.65)%1;
    crest(light,z,z.r,beat,Math.sin(Math.PI*beat)*clamp(z.life/.4)*.65,ink);
  }
}
