import {drawSilatSaka} from '../silat-saka';
import type {Knot,SpellRibbons} from '../SpellRibbons';
import type {Effect,RunState} from '../../game/runtime.js';

const TAU=2*Math.PI;
const brass=0xffb744, copper=0xb85827, glass=0xffdc81, ivory=0xfff1ce;
const steel=0x8eafc3, iron=0x283c51, hot=0xff542e, cyan=0x81f5ff;
const wrap=0xc33c4c, linen=0xffce93, indigo=0x483259;
const jade=0x149e98, lake=0x176fa4, lacquer=0xd64a39;
const plum=0x673072, violet=0xb351ad, rose=0xff989b;
type Path=(u:number)=>Knot;
type XY=[number,number];
type Point={x:number;y:number};
const local=(p:Point,a:number,d:number,w:number,h:number):Knot=>
  [p.x+Math.cos(a)*d-Math.sin(a)*w,p.y+Math.sin(a)*d+Math.cos(a)*w,h];
const polar=(p:Point,r:number,a:number,h:number):Knot=>[p.x+r*Math.cos(a),p.y+r*Math.sin(a),h];
const knots=(n:number,path:Path)=>Array.from({length:n+1},(_,i)=>path(i/n));

// Only appends geometry to the spell batch. Upright cutouts face the camera;
// folded strips occupy world space and keep their width when aiming north.
class Paint {
  constructor(readonly batch:SpellRibbons,readonly alpha:number){}
  face(points:Knot[],color:number,opacity=1){
    for(let i=2;i<points.length;i++)this.batch.facet([points[0],points[i-1],points[i]],color,this.alpha*opacity);
  }
  line(points:Knot[],width:number,color:number,opacity=1){
    this.batch.strip(points,width,color,this.alpha*opacity,false);
  }
  sheet(n:number,left:Path,right:Path,color:number,opacity=1){
    let l=left(0),r=right(0);
    for(let i=1;i<=n;i++){
      const nextL=left(i/n),nextR=right(i/n);
      this.face([l,r,nextR,nextL],color,opacity);l=nextL;r=nextR;
    }
  }
  cut(p:Knot,shape:XY[],color:number,scale=1){
    this.face(shape.map(([x,h])=>[p[0]+x*scale,p[1],p[2]+h*scale]),color);
  }
  rim(p:Point,r:number,color:number,h=4){
    this.line(knots(48,u=>polar(p,r,TAU*u,h)),2.6,color);
  }
}

function lantern(p:Paint,at:Knot,size:number){
  p.cut(at,[[-10,9],[10,9],[7,-12],[-7,-12]],copper,size);
  p.cut(at,[[-6,7],[5,7],[3,-8],[-4,-8]],glass,size);
  p.cut(at,[[-14,9],[0,20],[14,9]],brass,size);
  p.cut(at,[[-8,-12],[8,-12],[0,-18]],brass,size);
}

// Projectile geometry follows the live velocity on ricochet and on both legs
// of a return. Spin only rotates the tool, never the rider.
export function drawOriginalProjectile(batch:SpellRibbons,q:RunState['projs'][number],reduced:boolean,time:number){
  if(q.kind!=='nur'&&q.kind!=='spanner'&&q.kind!=='puppet'&&q.kind!=='dragon'&&q.kind!=='kris')return false;
  const p=new Paint(batch,1),a=Math.atan2(q.vy,q.vx);
  const at=(d:number,w:number,h=15)=>local(q,a,d,w,h);
  const blade=(shape:XY[],color:number)=>p.face(shape.map(([d,w])=>at(d,w)),color);
  switch(q.kind){
    case 'nur':
      blade([[-35,0],[-2,-11],[16,0],[-2,11]],copper);
      blade([[-22,0],[1,-7],[16,0],[1,4]],glass);
      p.line([at(-29,0),at(10,0)],2,ivory);break;
    case 'spanner':{
      const metal=(d:number,w:number)=>local(q,reduced?0:q.spin||0,d,w,16);
      const part=(shape:XY[],c:number)=>p.face(shape.map(([d,w])=>metal(d,w)),c);
      part([[-23,-4],[10,-4],[10,4],[-23,4]],steel);
      for(const s of [-1,1])part([[5,0],[9,s*12],[23,s*11],[15,s*5],[13,0]],ivory);
      part([[-20,-4],[-9,-4],[-9,4],[-20,4]],hot);
      blade([[17,-3],[30,0],[17,3]],ivory);
      p.line([at(-38,0),at(-17,0)],3,hot);break;
    }
    case 'puppet':{
      const h=q.back?19:15;
      p.cut(at(0,0,h),[[-15,0],[-9,14],[6,14],[14,0],[8,-8],[-9,-8]],jade);
      p.cut(at(0,0,h+20),[[-10,-4],[-8,7],[7,9],[11,-2],[4,-8]],linen);
      p.cut(at(0,0,h+26),[[-13,0],[0,10],[13,0]],lacquer);
      for(const s of [-1,1])p.line([at(-30,s*15,5),at(-5,s*9,5),at(9,0,5)],2.6,q.back?glass:cyan);
      break;
    }
    case 'dragon':{
      const bend=(u:number)=>Math.sin(u*7+(reduced?0:time*9))*10;
      for(let i=0;i<4;i++){
        const d=-i*15,w=bend(i/4),h=20+5*Math.cos(i);
        p.face([at(d+10,w,h),at(d,w-12,h+5),at(d-16,w,h),at(d,w+12,h-3)],i%2?jade:lake);
        p.face([at(d+5,w,h+3),at(d-6,w,h+22),at(d-12,w,h+2)],brass);
      }
      blade([[0,-12],[16,-14],[30,-5],[31,6],[9,13]],jade);
      for(const s of [-1,1]){
        p.face([at(4,s*8,23),at(-12,s*22,42),at(13,s*9,22)],brass);
        p.line([at(20,s*7,22),at(14,s*11,23)],3.4,ivory);
      }
      break;
    }
    case 'kris':{
      const edge=(u:number,s:number)=>at(-16+46*u,(Math.sin(u*11)*5+s*7)*(1-u));
      const mid=(u:number)=>edge(u,0);
      p.sheet(10,u=>edge(u,-1),mid,q.back?rose:ivory);
      p.sheet(10,mid,u=>edge(u,1),violet);
      p.line([at(-17,-10),at(-17,9)],3,brass);
      p.line([at(-28,0),at(-16,0)],4,copper);
      if(q.back)p.line([at(-50,17),at(-39,18),at(-25,6),at(-14,4)],4,rose);
      break;
    }
    default:return false;
  }
  return true;
}

function dawn(p:Paint,f:Effect,g:RunState,v:number,reduced:boolean){
  const a=f.a||0;
  switch(f.slot){
    case 0:
      p.line([local(f,a,8,-10,22),local(f,a,24,0,28),local(f,a,8,10,22)],3,brass);break;
    case 1:{
      // A bright half-disc rises from a thin horizon, facing the camera
      // independently of the direction that the light travels.
      const full=(f.half??.62)>=Math.PI;
      const sun=local(f,a,full?0:74,0,(full?130:31)+35*v);
      const radius=30+17*Math.sin(Math.PI*v);
      const limb=(angle:number,scale:number):Knot=>[sun[0]+radius*scale*Math.cos(angle),sun[1],sun[2]+radius*scale*Math.sin(angle)];
      p.batch.glow(sun,radius*2.15,0xff8c32,.93*p.alpha);
      for(let i=0;i<20;i++){
        const left=i*Math.PI/20,right=(i+1)*Math.PI/20;
        p.face([sun,limb(left,1),limb(right,1)],brass);
        p.face([sun,limb(left,.85),limb(right,.85)],0xffffe1);
      }
      for(let i=0;i<9;i++){
        const angle=(i+.5)*Math.PI/9;
        const length=1.2+(i%2?.16:.40)*Math.sin(Math.PI*v);
        p.line([limb(angle,1.06),limb(angle,length)],i%2?2:3,glass,.88);
      }
      p.line([limb(Math.PI,1.45),sun,limb(0,1.45)],4.4,ivory);
      break;
    }
    case 2:{
      const o=g.orbit;if(!o)break;
      const radius=o.rad*(o.holy?1.4:1);
      for(let i=0;i<o.n;i++){
        const b=(reduced?0:o.ang)+i*TAU/o.n;
        const cord=knots(9,u=>polar(g.p,radius,b+u*TAU/o.n,25-12*Math.sin(Math.PI*u)));
        p.line(cord,2,copper);lantern(p,cord[0],.66);
      }
      break;
    }
    case 3:drawSilatSaka(p.batch,f,reduced);break;
    case 4:{
      const age=f.max-f.life;
      const open=reduced?1:1-Math.pow(1-Math.min(1,age/.55),3);
      const r=215*(.28+.72*open),lift=55+101*open;
      const beat=reduced?.5:(age/1.65)%1;
      // A crest of light climbs each rib from its lantern to the crown.
      const shine=Math.sin(Math.PI*beat);
      for(let i=0;i<8;i++){
        const b=i*TAU/8,next=b+TAU/8;
        const roof=(u:number,angle:number)=>polar(f,r*(1-.82*u),angle,28+lift*u*u);
        p.sheet(6,u=>roof(u,b),u=>roof(u,next),i%2?brass:copper,.15);
        p.line(knots(10,u=>roof(u,b)),3,glass);
        const tip=roof(beat,b);
        p.line(knots(7,u=>roof(Math.max(0,beat-.22*(1-u)),b)),6,ivory,.9*shine);
        p.batch.glow(tip,12,glass,p.alpha*shine);
        const ember=reduced?.5:(beat+i*.38196)%1;
        const light=polar(f,r*(.76+.18*ember),b+.16*ember,22+76*ember);
        p.cut(light,[[0,7],[3,0],[0,-7],[-3,0]],ivory,Math.sin(Math.PI*ember));
        p.line([roof(0,b),polar(f,r*.96,b+TAU/16,14),roof(0,next)],4,brass);
        lantern(p,polar(f,r,b,22),.75);
      }
      lantern(p,[f.x,f.y,lift+32],1);break;
    }
  }
}

function engine(p:Paint,f:Effect,v:number){
  const a=f.a||0;
  switch(f.slot){
    case 0:
      for(const s of [-1,1])p.face([local(f,a,9,s*5,20),local(f,a,34,s*16,20),local(f,a,24,s*4,20)],steel);
      break;
    case 3:{
      const r=(f.range||222)*(.12+.88*v);
      for(let i=0;i<10;i++){
        const b=i*TAU/10;
        const tooth=(u:number,inner:boolean)=>polar(f,r*(inner?.80:(u>.18&&u<.78?1:.91)),b+u*TAU/10,7);
        p.sheet(8,u=>tooth(u,true),u=>tooth(u,false),i%2?iron:steel);
        p.line(knots(8,u=>tooth(u,false)),3,hot);
      }
      break;
    }

  }
}

function boxing(p:Paint,f:Effect,g:RunState,v:number,t:number,age:number,reduced:boolean){
  const a=f.a||0;
  const at=(d:number,w:number,h:number)=>local(f,a,d,w,h);
  switch(f.slot){
    case 0:{
      const d=(f.range||89)*(.38+.55*v);
      p.face([at(d-39,-8,25),at(d-15,-12,29),at(d,-9,30),at(d,10,30),at(d-35,8,24)],wrap);
      for(let i=0;i<3;i++)p.line([at(d-10-i*9,-9,30),at(d-15-i*9,8,27)],2.8,linen);
      break;
    }
    case 1:{
      const center=f.cross??f,r=f.range??104,half=f.half??Math.PI/3;
      const lift=reduced?24:12+40*Math.sin(Math.min(1,age/.32)*Math.PI);
      const crest=(u:number,inner:boolean)=>{
        const arch=Math.sin(Math.PI*u);
        return polar(center,r*(inner?1-.23*arch:1),a+half*(2*u-1),8+arch*(inner?lift+19:lift));
      };
      p.sheet(28,u=>crest(u,false),u=>crest(u,true),hot,.82);
      p.line(knots(28,u=>crest(u,true)),4,ivory);
      for(let i=0;i<9;i++){
        const u=(i+.5)/9,b=a+half*(2*u-1),h=crest(u,false)[2];
        p.face([polar(center,r*.93,b-.045,h),polar(center,r,b,h+10+18*Math.sin(i*2.7)**2),polar(center,r*.89,b+.04,h-7)],brass);
      }
      for(const side of [-1,1]){
        p.line(knots(12,u=>[
          f.x+(center.x-f.x)*u-Math.sin(a)*side*16,
          f.y+(center.y-f.y)*u+Math.cos(a)*side*16,
          6+(lift+10)*u*u
        ]),3,linen,.72);
      }
      break;
    }
    case 2:{
      const pull=!!f.half,r=(f.range||103)*(pull?1-.48*v:.55+.45*v);
      for(let i=0;i<2;i++){
        const b=a+i*Math.PI+v*2.8;
        const edge=(u:number,out:boolean)=>polar(f,r*(out?1:.72+.27*u),b+u*2.2,9+28*u);
        p.sheet(12,u=>edge(u,true),u=>edge(u,false),pull?brass:wrap);
        p.line(knots(12,u=>edge(u,true)),3,linen);
        // Fold the leading elbow up into a hooked ridge at shoulder height.
        const ridge=polar(f,r*.9,b+2.2,54);
        p.face([edge(.64,true),edge(1,true),ridge],pull?linen:brass);
        p.face([edge(.64,false),ridge,edge(1,false)],pull?brass:copper);
        for(const u of [.15,.28,.41])p.line([edge(u,false),edge(u+.06,true)],2,ivory);
      }
      break;
    }
    case 3:{
      // A braided headband and two hanging ends, clear of the character's face.
      const braid=(u:number,s:number)=>polar(g.p,39,u*TAU,12+s*4*Math.sin(u*TAU*5+t));
      p.sheet(40,u=>braid(u,1),u=>braid(u,-1),wrap);
      p.line(knots(40,u=>braid(u,1)),2.7,linen);
      for(let i=0;i<12;i++){
        const u=i/12;
        p.line([braid(u,1),braid(u+.035,-1)],3.4,i%3?brass:wrap);
      }
      for(const s of [-1,1]){
        const base=polar(g.p,39,Math.PI/2,14);
        p.cut(base,[[0,0],[s*8,4],[s*23,-13],[s*31,-23],[s*18,-20]],s<0?wrap:linen);
      }
      break;
    }
    case 4:{
      const r=f.r||181;
      if(age<.45){
        p.rim(f,r,linen);
        for(let i=0;i<4;i++){
          const b=i*TAU/4;
          p.face([polar(f,r,b-.14,5),polar(f,r*.78,b,5),polar(f,r,b+.14,5)],wrap);
        }
        const h=reduced?90:145*(1-age/.45);
        p.cut([f.x,f.y,h],[[0,-16],[-16,12],[0,3],[16,12]],brass);
      }else{
        const land=reduced?.6:Math.min(1,(age-.45)/.55);
        for(let i=0;i<9;i++){
          const b=i*TAU/9,rim=r*(.4+.6*land),h=64*(1-land);
          const tip=polar(f,rim,b,h+8);
          p.face([polar(f,rim*.54,b-.13,3),tip,polar(f,rim*.9,b+.13,4)],copper);
          p.face([polar(f,rim*.54,b-.13,3),tip,polar(f,rim*.78,b-.18,8)],linen);
        }
      }
      break;
    }
  }
}

function theatre(p:Paint,f:Effect,g:RunState,v:number,t:number){
  const a=f.a||0;
  switch(f.slot){
    case 0:
    case 1:{
      // The puppet carries the head and body. Its launch leaves a parted wake.
      const size=f.slot===0?33:76;
      for(const s of [-1,1]){
        const foam=(u:number,outer:boolean)=>local(f,a,u*size,s*(1-u)*(outer?27:12),5+8*Math.sin(u*Math.PI));
        p.sheet(10,u=>foam(u,true),u=>foam(u,false),lake,.8);
        p.line(knots(10,u=>foam(u,true)),2.2,cyan);
      }
      break;
    }
    case 2:
      for(const guard of g.sea?.allies||[]){
        const head:Knot=[guard.x,guard.y,38];
        p.line([[g.p.x,g.p.y,18],[guard.x,guard.y,14]],2.3,copper);
        p.cut(head,[[-17,0],[0,15],[17,0],[10,-3],[-10,-3]],lacquer);
        p.cut(head,[[-5,3],[0,12],[5,3]],brass);
      }
      break;
    case 3:{
      const r=(f.range||218)*(.19+.81*v);
      for(let i=0;i<8;i++){
        const b=i*TAU/8;
        const crest=(u:number,top:boolean)=>polar(f,r*(top?1:.80),b+u*TAU/8,top?9+28*Math.sin(Math.PI*u)**2:3);
        p.sheet(8,u=>crest(u,true),u=>crest(u,false),i%2?jade:lake,.92);
        p.line(knots(8,u=>crest(u,true)),3,cyan);
      }
      break;
    }
    case 4:{
      // Lacquered festival canopy with scalloped eaves. Falling strikes mark victims.
      for(let i=0;i<6;i++){
        const b=i*TAU/6;
        const eave=(u:number,upper:boolean)=>polar(g.p,upper?121:143,b+u*TAU/6,
          upper?98:72-10*Math.sin(Math.PI*u)+3*Math.sin(t*2+i));
        p.sheet(8,u=>eave(u,true),u=>eave(u,false),i%2?jade:lake,.88);
        p.line(knots(8,u=>eave(u,false)),3,glass);
        const knot=eave(0,false);
        p.cut(knot,[[-5,0],[5,0],[7,-14],[0,-23],[-7,-14]],lacquer);
      }
      break;
    }
  }
}

function silat(p:Paint,f:Effect,g:RunState,v:number,t:number){
  const a=f.a||0;
  switch(f.slot){
    case 0:
      p.line([local(f,a,0,-14,25),local(f,a,21,-7,22),local(f,a,32,4,19)],3.6,rose);break;
    case 1:{
      const half=f.half??1.15,r=f.range||130;
      const edge=(u:number,outer:boolean)=>polar(f,r*(outer?1:1-.30*Math.sin(Math.PI*u)),
        a-half+2*half*u*Math.min(1,.32+3*v),12+23*u+7*Math.sin(Math.PI*(u-v)));
      p.sheet(32,u=>edge(u,true),u=>edge(u,false),plum);
      p.line(knots(32,u=>edge(u,true)),4,rose);
      for(let i=1;i<8;i++)p.line([edge(i/9,false),edge(i/9+.04,true)],2,brass);
      break;
    }
    case 2:
      for(const echo of g.sea?.images||[]){
        for(let i=0;i<3;i++){
          const at=(d:number,w:number,h:number)=>local(echo,a,d,w+i*6,h);
          p.face([at(-28,-10,4),at(-3,-6,24),at(18,0,41),at(5,2,18)],i===1?rose:violet);
          p.line([at(-27,-9,5),at(-3,-5,25),at(16,0,39)],2,i===1?ivory:brass);
        }
      }
      break;
    case 3:{
      // Upright palm with individually separated fingers on overlapping cuffs.
      const hand:Knot=[g.p.x+30,g.p.y,48+2*Math.sin(t*2)];
      p.cut(hand,[[-12,-9],[9,-11],[15,6],[6,12],[-9,11],[-15,1]],violet);
      for(let i=0;i<4;i++){
        const x=-10+i*6,h=[20,29,26,19][i];
        p.cut(hand,[[x,5],[x-2,h-3],[x+1,h],[x+4,h-2],[x+5,6]],rose);
      }
      p.cut(hand,[[-11,1],[-23,13],[-25,9],[-18,-4],[-9,-9]],rose);
      p.line([[hand[0]-8,hand[1],hand[2]+4],[hand[0]+3,hand[1],hand[2]-2],[hand[0]+8,hand[1],hand[2]+3]],2,plum);
      p.cut(hand,[[-12,-7],[10,-11],[8,-19],[-10,-14]],brass);
      break;
    }
    case 4:{
      const spread=.52+.48*Math.min(1,v*10);
      for(const s of [-1,1])for(let i=0;i<7;i++){
        const root:Knot=[g.p.x+s*(9+i*3),g.p.y-i*2,29+i*3];
        const length=(74+16*Math.sin(i*.54)+i*7)*spread,height=(3+i*21)*spread+4*Math.sin(t*2);
        const shape:XY[]=[[0,0],[s*length*.32,height*.12-6],[s*length*.78,height*.6-5],[s*length,height],[s*length*.62,height*.67+6],[s*length*.25,height*.3+6]];
        p.cut(root,shape,i%2?plum:violet);
        p.cut(root,[[s*length*.58,height*.47],[s*length*.83,height*.66-4],[s*length,height],[s*length*.74,height*.71]],i%2?rose:brass);
        p.line([root,[root[0]+s*length*.62,root[1],root[2]+height*.56],[root[0]+s*length,root[1],root[2]+height]],2.3,i%2?brass:rose);
      }
      break;
    }
  }
}

export function drawOriginalCast(batch:SpellRibbons,f:Effect,g:RunState,reduced:boolean){
  const age=f.max-f.life,v=reduced?.59:Math.min(1,age/f.max),t=reduced?0:age;
  const p=new Paint(batch,Math.min(1,.7+age*6,f.life/.12));
  switch(f.hero){
    case 'ustaz':dawn(p,f,g,v,reduced);break;
    case 'rempit':engine(p,f,v);break;
    case 'nok':boxing(p,f,g,v,t,age,reduced);break;
    case 'lan':theatre(p,f,g,v,t);break;
    case 'sari':silat(p,f,g,v,t);break;
  }
}

export function drawOriginalStrike(batch:SpellRibbons,strike:NonNullable<RunState['sea']>['strikes'][number],reduced:boolean){
  const p=new Paint(batch,.97),h=12+147*(reduced?.45:strike.t/strike.t0);
  const point:Knot=[strike.x,strike.y,h];
  if(strike.kind==='feather'){
    p.cut(point,[[0,-14],[-7,14],[-4,27],[15,52],[13,29],[8,16]],violet);
    p.cut(point,[[0,-14],[7,17],[15,52],[2,27]],brass);
    p.line([[strike.x,strike.y,h-13],[strike.x+14,strike.y,h+50]],2.2,ivory);
  }else{
    p.cut(point,[[0,-14],[-10,2],[-7,12],[0,25],[8,12],[11,2]],jade);
    p.cut(point,[[0,-12],[-3,3],[0,19],[6,4]],cyan);
    p.cut(point,[[-10,12],[0,24],[10,12]],lacquer);
  }
}
