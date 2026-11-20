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
      const end=(f.range||242)*(.28+.72*Math.min(1,v*3)),half=f.half??.62;
      const count=half>2?18:7;
      for(let i=0;i<count;i++){
        const b=a-half+(i+.5)*2*half/count,spread=half/count;
        const ridge=polar(f,end,b,14);
        p.face([polar(f,12,b,16),polar(f,end*.84,b-spread,8),ridge],i%2?brass:copper);
        p.face([polar(f,12,b,16),ridge,polar(f,end*.84,b+spread,8)],glass,.78);
      }
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
    case 3:{
      const r=(f.range||200)*(.18+.82*v);
      p.rim(f,r,brass);lantern(p,[f.x,f.y,58+22*(1-v)],1.35);
      for(let i=0;i<8;i++){
        const b=i*TAU/8;
        p.face([polar(f,r,b-.15,5),polar(f,r,b+.15,5),polar(f,r*.78,b,5)],copper);
      }
      break;
    }
    case 4:{
      const r=215,lift=144+12*Math.min(1,v*12);
      for(let i=0;i<8;i++){
        const b=i*TAU/8,next=b+TAU/8;
        const roof=(u:number,angle:number)=>polar(f,r*(1-.82*u),angle,28+lift*u*u);
        p.sheet(6,u=>roof(u,b),u=>roof(u,next),i%2?brass:copper,.15);
        p.line(knots(10,u=>roof(u,b)),3,glass);
        p.line([roof(0,b),polar(f,r*.96,b+TAU/16,14),roof(0,next)],4,brass);
        lantern(p,polar(f,r,b,22),.75);
      }
      lantern(p,[f.x,f.y,lift+32],1);break;
    }
  }
}

function engine(p:Paint,f:Effect,g:RunState,v:number,t:number){
  const a=f.slot===2||f.slot===4?Math.atan2(g.p.face[1],g.p.face[0]):f.a||0;
  const at=(d:number,w:number,h=8)=>local(g.p,a,d,w,h);
  switch(f.slot){
    case 0:
      for(const s of [-1,1])p.face([local(f,a,9,s*5,20),local(f,a,34,s*16,20),local(f,a,24,s*4,20)],steel);
      break;
    case 1:{
      const dx=g.p.x-f.x,dy=g.p.y-f.y,length=Math.hypot(dx,dy);
      const track=(d:number,w:number)=>local(f,Math.atan2(dy,dx),d,w,4);
      for(let d=0;d+8<length;d+=19)for(const s of [-1,1]){
        p.face([track(d,s*3),track(d+6,s*3),track(d+14,s*17),track(d+7,s*17)],iron);
        p.line([track(d+7,s*17),track(d+14,s*17)],2.7,hot);
      }
      break;
    }
    case 2:{
      const flare=85+16*Math.sin(t*9),w=f.w||24;
      for(const s of [-1,1]){
        p.face([at(-12,s*5,14),at(-29,s*14,20),at(-33,s*12,9),at(-18,s*4,7)],steel);
        p.face([at(-27,s*9,13),at(-39,s*w*.8,18),at(-flare,s*w*.64,23),at(-55,s*10,16),at(-65,s*9,9),at(-41,s*5,8)],hot);
        p.face([at(-30,s*10,13),at(-44,s*15,15),at(-36,s*6,10)],glass);
      }
      break;
    }
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
    case 4:
      for(const s of [-1,1]){
        const length=150+12*Math.sin(t*5);
        p.face([at(8,s*13,9),at(-42,s*44,16),at(-length,s*56,19),at(-62,s*25,14)],iron);
        p.face([at(-15,s*24,12),at(-42,s*39,18),at(-length,s*56,19)],cyan);
        p.line([at(-40,s*22,13),at(-86,s*31,15),at(-130,s*31,15)],3,hot);
      }
      break;
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
      const d=(f.range||227)*(.45+.55*Math.min(1,v*3)),w=f.w||30;
      const foot=(x:number,s:number,h:number)=>at(d*x,w*s,h);
      p.face([foot(.08,-.18,18),foot(.72,-.5,28),foot(.85,.36,21),foot(.12,.16,14)],wrap);
      p.face([foot(.70,-.52,28),foot(.86,-.65,35),foot(.96,-.52,39),foot(1,-.18,36),foot(.98,.29,25),foot(.85,.56,18),foot(.76,.39,19)],linen);
      p.line([foot(.80,.30,20),foot(.86,.51,19),foot(.98,.28,25),foot(1,-.16,36)],3,copper);
      for(let i=0;i<4;i++)p.line([foot(.40+i*.085,-.40,25),foot(.32+i*.085,.26,17)],3,ivory);
      break;
    }
    case 2:{
      const pull=!!f.half,r=(f.range||103)*(pull?1-.48*v:.55+.45*v);
      for(let i=0;i<2;i++){
        const b=a+i*Math.PI+v*2.8;
        const edge=(u:number,out:boolean)=>polar(f,r*(out?1:.72+.27*u),b+u*2.2,9+28*u);
        p.sheet(12,u=>edge(u,true),u=>edge(u,false),pull?brass:wrap);
        p.line(knots(12,u=>edge(u,true)),3,linen);
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
    case 'rempit':engine(p,f,g,v,t);break;
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
