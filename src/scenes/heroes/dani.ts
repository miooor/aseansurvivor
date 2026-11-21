import {COIN_RAIN_INTERVAL,COIN_RAIN_RADIUS,GOLD_DUST_HALF,GOLD_DUST_RANGE,SPIN_TRAIL_LIFE} from '../../game/heroes/dani.js';
import type {Point,RunState} from '../../game/runtime.js';
import type {Knot,SpellRibbons} from '../SpellRibbons';
import type {SurvivalScene} from '../SurvivalScene';

interface DaniState {
  channel:{slot:1|4;ax:number;ay:number;started:number;end:number}|null;
  rain:(Point&{next:number;wave:number})|null;
  dust:{started:number;until:number}|null;
  trail:(Point&{tx:number;ty:number;until:number})[];
}
type Ink=Pick<SpellRibbons,'strip'|'facet'|'glow'>;
const GOLD=0xffbd35, WHITE=0xfff0aa, AMBER=0xf98116, BRONZE=0xa8490c;
const TAU=2*Math.PI, ANGLE=2.399963;
const clamp=(value:number)=>Math.max(0,Math.min(1,value));

export function drawDani(scene:SurvivalScene,g:RunState){
  const s=g.roster.dani as DaniState|undefined;
  if(!s)return;
  const floor=scene.floor;
  for(const f of s.trail){
    const fade=clamp((f.until-g.t)/SPIN_TRAIL_LIFE);
    floor.lineStyle(16,AMBER,.55*fade).lineBetween(f.x,f.y,f.tx,f.ty);
    floor.lineStyle(8,GOLD,.95*fade).lineBetween(f.x,f.y,f.tx,f.ty);
    floor.lineStyle(3,WHITE,.9*fade).lineBetween(f.x,f.y,f.tx,f.ty);
  }
  if(s.rain){
    const {x,y}=s.rain;
    floor.fillStyle(GOLD,.07).fillCircle(x,y,COIN_RAIN_RADIUS);
    floor.lineStyle(12,0x50240a,.75).strokeCircle(x,y,COIN_RAIN_RADIUS);
    floor.lineStyle(6,GOLD,.97).strokeCircle(x,y,COIN_RAIN_RADIUS);
    floor.lineStyle(2,WHITE,.9).strokeCircle(x,y,COIN_RAIN_RADIUS);
  }
  for(const f of g.fx){
    const age=f.max-f.life;
    if(f.kind==='coinfall'&&f.waveIndex===0&&age<.2){
      const flash=1-age/.2;
      floor.fillStyle(WHITE,.38*flash).fillCircle(f.x,f.y,COIN_RAIN_RADIUS);
      floor.lineStyle(8,WHITE,.94*flash).strokeCircle(f.x,f.y,COIN_RAIN_RADIUS);
    }
  }
}

function spark(ink:Ink,[x,y,z]:Knot,size:number,alpha:number){
  ink.glow([x,y,z],size*1.8,GOLD,alpha*.60);
  ink.strip([[x-size,y,z],[x,y,z],[x+size,y,z]],2,WHITE,alpha,false);
  ink.strip([[x,y,z-size*1.4],[x,y,z],[x,y,z+size*1.4]],2,WHITE,alpha,false);
}

// The billboard uses eight angles, so the flash follows the drawn bore.
function melterMuzzle(p:Point,ax:number,ay:number):Knot{
  const step=Math.PI/4,angle=Math.round(Math.atan2(ay,ax)/step)*step;
  const x=Math.cos(angle),y=Math.sin(angle);
  return [p.x+50*x-(y<-.95?19:0),p.y+19*y,54+20*y];
}

function drawFlame(ink:Ink,p:Point,s:NonNullable<DaniState['channel']>,now:number,reduced:boolean){
  const angle=Math.atan2(s.ay,s.ax),age=now-s.started;
  const fade=Math.min(1,.38+age*4,(s.end-now)*9);
  const muzzle=melterMuzzle(p,s.ax,s.ay);
  const point=(heading:number,reach:number,z:number,u:number):Knot=>[
    muzzle[0]+(p.x-muzzle[0])*u+Math.cos(heading)*reach,
    muzzle[1]+(p.y-muzzle[1])*u+Math.sin(heading)*reach,
    muzzle[2]+(z-muzzle[2])*u
  ];
  ink.glow(muzzle,45,AMBER,.76*fade);
  // Splayed ribbons make the whole active cone visible, with an ivory hot core.
  for(let i=0;i<9;i++){
    const side=(i-4)/4,phase=reduced?.46:(age*6+i*.27)%1;
    const path:Knot[]=[];
    for(let j=0;j<=12;j++){
      const u=j/12;
      const a=angle+side*GOLD_DUST_HALF*u+Math.sin(u*9+phase*TAU)*u*.085;
      const reach=GOLD_DUST_RANGE*u*(.77+.23*Math.sin(phase*Math.PI));
      path.push(point(a,reach,12+(31+12*Math.sin(u*8+phase*TAU))*(1-.50*u),u));
    }
    ink.strip(path,19,AMBER,.28*fade);
    ink.strip(path.slice(0,10),9,GOLD,.80*fade);
    ink.strip(path.slice(0,6),4,WHITE,.86*fade);
  }
  for(let i=0;i<(reduced?12:24);i++){
    const u=reduced?(i+.5)/12:(age*3+i*.619)%1;
    const a=angle+Math.sin(i*ANGLE)*GOLD_DUST_HALF*u;
    const p=point(a,u*GOLD_DUST_RANGE,18+u*(22+22*Math.sin(i)),u);
    if(i%3===0)spark(ink,p,2.5+u*3,(1-.7*u)*fade);
    else ink.glow(p,4+u*4,WHITE,(1-.65*u)*fade);
  }
}

function coinPoint(center:Point,i:number,beat:number):Point{
  const a=(i+beat*.53)*ANGLE,d=COIN_RAIN_RADIUS*Math.sqrt((i+.5)/13);
  return {x:center.x+Math.cos(a)*d,y:center.y+Math.sin(a)*d};
}

function coin(ink:Ink,p:Point,z:number,phase:number,alpha:number){
  const rx=4+9*Math.abs(Math.cos(phase*TAU)),center:Knot=[p.x,p.y,z];
  const edge:Knot[]=Array.from({length:9},(_,i)=>{
    const a=i*TAU/8;
    return [p.x+rx*Math.cos(a),p.y+2*Math.sin(a),z+13*Math.sin(a)];
  });
  ink.strip([[p.x,p.y,z+86],[p.x,p.y,z+22],center],5,AMBER,.65*alpha);
  ink.strip([[p.x,p.y,z+61],[p.x,p.y,z+12]],2,WHITE,alpha);
  ink.glow(center,21,GOLD,.28*alpha);
  for(let i=1;i<edge.length;i++)ink.facet([center,edge[i-1],edge[i]],i<4?GOLD:AMBER,alpha);
  ink.strip(edge,1.8,WHITE,alpha,false);
  ink.strip([[p.x-rx*.52,p.y,z],[p.x+rx*.51,p.y,z]],1.5,BRONZE,alpha,false);
  if(phase>.55)spark(ink,[p.x-rx*.7,p.y,z+7],5,alpha);
}

function goldBar(ink:Ink,q:RunState['projs'][number]){
  const speed=Math.hypot(q.vx,q.vy)||1,ax=q.vx/speed,ay=q.vy/speed;
  const point=(d:number,w:number,z:number):Knot=>[q.x+ax*d-ay*w,q.y+ay*d+ax*w,z];
  const base=[point(-25,-11,20),point(25,-11,20),point(25,11,20),point(-25,11,20)];
  const top=[point(-21,-8,33),point(21,-8,33),point(21,8,33),point(-21,8,33)];
  for(let i=0;i<4;i++){
    const j=(i+1)%4,shade=i%2===0?BRONZE:AMBER;
    ink.facet([base[i],base[j],top[i]],shade,1);
    ink.facet([base[j],top[j],top[i]],shade,1);
  }
  ink.facet([top[0],top[1],top[2]],GOLD,1);
  ink.facet([top[0],top[2],top[3]],GOLD,1);
  ink.strip([...top,top[0]],2.4,WHITE,.95,false);
  ink.strip([point(-12,0,33.3),point(13,0,33.3)],3,BRONZE,.72,false);
  ink.strip([point(-70,0,21),point(-40,0,23),point(-21,0,26)],8,GOLD,.64);
  spark(ink,top[1],5,.90);
}

export function drawGoldSultanEffects(ink:Ink,g:RunState,reduced:boolean){
  const s=g.roster.dani as DaniState|undefined;
  if(!s)return;
  const {channel,rain,dust}=s;
  if(channel?.slot===1)drawFlame(ink,g.p,channel,g.t,reduced);
  if(channel?.slot===4){
    const muzzle=melterMuzzle(g.p,channel.ax,channel.ay);
    ink.glow(muzzle,52,GOLD,.73);
    spark(ink,muzzle,11,.8);
  }
  if(dust&&dust.until>g.t){
    const {x,y}=g.p,fade=clamp((dust.until-g.t)*4);
    const spin=reduced?.4:(g.t-dust.started)*2.8;
    ink.glow([x,y,1],48,AMBER,.64*fade);
    for(let side=0;side<2;side++){
      const stream:Knot[]=Array.from({length:15},(_,i)=>{
        const u=i/14,a=side*Math.PI+spin+u*2.75,r=41-15*u;
        return [x+Math.cos(a)*r,y+Math.sin(a)*r,5+52*u];
      });
      ink.strip(stream,10,GOLD,.66*fade);
      ink.strip(stream,3,WHITE,.88*fade);
      spark(ink,stream[11],5,.9*fade);
    }
    for(let i=0;i<11;i++){
      const u=(i*.61+(reduced?.3:spin*.25))%1,a=i*ANGLE+spin;
      ink.glow([x+Math.cos(a)*40,y+Math.sin(a)*40,10+u*68],4,GOLD,(1-u)*.8*fade);
    }
  }
  if(rain){
    const fall=reduced?.52:clamp(1-(rain.next-g.t)/COIN_RAIN_INTERVAL);
    for(let i=0;i<13;i++){
      const u=fall**(1.25+(i%4)*.32);
      const z=20+(160+(i%5)*25)*(1-u);
      const p=coinPoint(rain,i,rain.wave);
      coin(ink,p,z,reduced?.6:fall*1.8+i*.23,clamp(.68+fall*.52));
    }
  }
  for(const f of g.fx){
    if(f.kind!=='coinfall')continue;
    const alpha=f.life/f.max,progress=1-alpha;
    for(let i=0;i<13;i+=reduced?3:1){
      const p=coinPoint(f,i,f.waveIndex??0);
      ink.glow([p.x,p.y,1],19+progress*17,AMBER,.73*alpha);
      spark(ink,[p.x,p.y,6+22*(reduced?.3:progress)],5+4*progress,alpha);
    }
  }
  for(const q of g.projs)if(q.kind==='gold-bar')goldBar(ink,q);
}
