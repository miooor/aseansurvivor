import type {PaintedSprite} from './painted-effects';
import type {Knot,SpellRibbons} from './SpellRibbons';

type Body=Pick<SpellRibbons,'facet'>;
type Light=Pick<SpellRibbons,'strip'|'glow'>;
type Form='spark'|'wrap'|'wave'|'feather'|'paper'|'foam'|'lantern'|'silk'|'reed'|'sash';
type Finish=readonly [form:Form,shadow:number,colour:number,edge:number];
const kits:Record<string,Finish>={
  rempit:['spark',0xad3121,0xff772a,0xffe79a],nok:['wrap',0x932f38,0xe76948,0xffdda0],
  lan:['wave',0x146783,0x23bfad,0xc5ffec],sari:['feather',0x772e83,0xea65ab,0xffddb8],
  asha:['paper',0xc2306f,0xffd34d,0xfff3d6],
  vanna:['silk',0x853d94,0xee78b7,0xb9baff],
  keo:['reed',0x876333,0xc5c972,0xdeffad],
  lia:['feather',0x282039,0x825ac5,0xdddfff]
};
const turn=Math.PI*2;

// A local frame for the cast, projectile or ground patch. Points use world height,
// so the raised silhouette and its pool of light can be seen at the same time.
function ornament(body:Body,light:Light,x:number,y:number,height:number,angle:number,size:number,
  phase:number,alpha:number,[form,shadow,colour,edge]:Finish){
  const dx=Math.cos(angle),dy=Math.sin(angle),rise=.72+.28*Math.sin(phase*turn);
  const at=(d:number,w:number,h:number):Knot=>[x+size*(dx*d-dy*w),y+size*(dy*d+dx*w),height+size*h];
  light.glow([x,y,0],size*1.35,colour,.48*alpha);
  if(form==='reed'||form==='lantern'){
    // Open bamboo mouth or suspended lantern.
    const reed=form==='reed',sides=reed?8:4;
    const waist=reed?.23:.60,base=reed?waist:.13;
    const floor:Knot[]=[],rim:Knot[]=[];
    const h=rise*(reed?2.65:1.95),stem=reed?.36:.08;
    for(let i=0;i<sides;i++){
      const a=i*turn/sides+(reed?0:phase*.65),u=Math.cos(a),v=Math.sin(a);
      floor.push(at(base*u,base*v,.06));rim.push(at(stem+waist*u,waist*v,h*.73));
    }
    const crown=at(stem,0,h*1.26);
    for(let i=0;i<sides;i++){
      const j=(i+1)%sides,c=i%2?colour:shadow;
      body.facet([floor[i],floor[j],rim[i]],c,alpha*.69);
      body.facet([rim[i],floor[j],rim[j]],c,alpha*.69);
      if(!reed)body.facet([rim[i],rim[j],crown],colour,alpha*.68);
    }
    light.strip([...rim,rim[0]],size*.11,edge,alpha,false);
    light.strip([floor[0],rim[0],reed?rim[1]:crown],size*.10,edge,alpha);
    if(form==='lantern')light.glow(at(stem,0,h*.58),size*.78,edge,.9*alpha);
    return;
  }
  // Loft a pair of shaded faces along the raised seam. Water curls back on
  // itself, cloth twists, paper folds sharply, and feathers taper to a barb.
  const segments=form==='paper'?3:8;
  const ridge:Knot[]=[],left:Knot[]=[],right:Knot[]=[];
  for(let i=0;i<=segments;i++){
    const u=i/segments,arch=Math.sin(Math.PI*u),sway=Math.sin(u*5-phase*turn);
    let d=1.15*u,w=0,h=u*1.9*rise,width=.38*arch,roll=0;
    switch(form){
      case 'wave':case 'foam':
        d=.85*Math.sin(u*Math.PI*1.15);w=(form==='foam'?.45:-.25)*u;
        h=(1-Math.cos(Math.PI*u))*rise;width=(1-.64*u)*.65;roll=.22*arch;break;
      case 'silk':case 'sash':case 'wrap':
        d=(form==='wrap'?.62:1.40)*u;w=.48*sway;
        width=(form==='wrap'?.32:.5)*(.2+.8*arch);roll=width*Math.cos(u*5-phase*turn);break;
      case 'paper':
        d=u*.65;w=.36*Math.abs(2*u-1);width=.48;roll=u*.3;h=.35+u*1.65*rise;break;
      case 'feather':
        d=1.25*u*u;w=.35*arch;width=.54*arch;roll=width*.36;break;
      case 'spark':
        d=u*1.3;w=u*u*.2;width=.20*arch;h=rise*1.6*u-.35*u*u;break;
    }
    ridge.push(at(d,w,h+.19*arch));
    left.push(at(d-.12*arch,w-width,h-roll));right.push(at(d-.12*arch,w+width,h+roll));
    if(i){
      const j=i-1;
      body.facet([left[j],ridge[j],ridge[i]],shadow,.78*alpha);
      body.facet([left[j],ridge[i],left[i]],shadow,.78*alpha);
      body.facet([ridge[j],right[j],right[i]],colour,.78*alpha);
      body.facet([ridge[j],right[i],ridge[i]],colour,.78*alpha);
      if(form==='feather'&&i%2===0)light.strip([left[j],ridge[i],right[j]],size*.07,edge,alpha);
    }
  }
  light.strip(ridge,size*.13,edge,.95*alpha);
  light.strip(left,size*.09,colour,.8*alpha);
  light.glow(ridge[segments],size*.34,edge,.72*alpha);
}

function drawRivetVolume(body:Body,light:Light,s:PaintedSprite){
  const gold=0xf4b740,edge=0xffe59a,bronze=0x805221;
  const at=(d:number,w:number,h:number):Knot=>[
    s.x+d*Math.cos(s.angle)-w*Math.sin(s.angle),
    s.y+d*Math.sin(s.angle)+w*Math.cos(s.angle),h
  ];
  const base=s.lift*Math.SQRT2;
  const tip=at(0,0,base+4),ridge=at(-14.5,0,base+5),left=at(-25,-5,base),right=at(-25,5,base);
  body.facet([tip,left,ridge],bronze,s.alpha);
  body.facet([tip,ridge,right],gold,s.alpha);
  light.strip([left,ridge,tip],2,edge,s.alpha);
  light.glow(tip,5,edge,s.alpha);
}

const copper=0xd17a3e,iron=0x54616a,steel=0xc6d0c5,ember=0xff9b39,ivory=0xffe5ae;

// Use the illustrated body's live transform so the metal, steam and fire
// follow the same release, reversal, or cart travel as the painted frame.
function drawStoveEffect(body:Body,light:Light,s:PaintedSprite,time:number,reduced:boolean){
  const slot=Math.floor(s.frame/4),phase=reduced?.38:time;
  const dx=Math.cos(s.angle),dy=Math.sin(s.angle),alpha=s.alpha;
  const at=(d:number,w:number,h:number):Knot=>[s.x+d*dx-w*dy,s.y+d*dy+w*dx,h];
  const lift=s.ground?4:Math.max(6,s.lift*Math.SQRT2-8);
  const size=Math.min(36,s.width*.31);
  if(size<1)return;
  light.glow(at(0,0,0),size*1.5,ember,.32*alpha);

  if(slot===1||slot===3){
    // A shallow spinning dome when thrown, a taller curved shield when braced.
    const block=slot===3,r=block?size:size*.78;
    const hub=at(block?r*.38:0,0,lift+(block?r:r*.35));
    const rim:Knot[]=[];
    const steps=block?20:16;
    for(let i=0;i<=steps;i++){
      const a=i*turn/steps+(block?0:phase*5);
      rim.push(block?at(r*.25*Math.cos(a),r*Math.cos(a),lift+r+r*Math.sin(a)):
        at(r*Math.cos(a),r*Math.sin(a),lift+r*.20*Math.sin(a)));
      if(i)body.facet([hub,rim[i-1],rim[i]],i%4===1?steel:iron,alpha*.56);
    }
    light.strip(rim,2.8,steel,alpha,false);
    light.strip([rim[steps/2],hub,rim[0]],2.2,copper,.85*alpha);
    return;
  }
  if(slot===2){
    const radius=s.width*.36;
    // Widen each vapour ribbon as it rises around the footprint of the serving.
    for(let jet=0;jet<3;jet++){
      let prev:Knot|undefined,edge:Knot|undefined;
      const seam:Knot[]=[];
      for(let i=0;i<=12;i++){
        const u=i/12,a=jet*turn/3+u*2.7+phase*.9;
        const r=radius*(1-.49*u),w=(1.8+5*Math.sin(Math.PI*u));
        const h=5+u*(41+size*.6);
        const mid=at(r*Math.cos(a),r*Math.sin(a),h);
        const next=at((r+w)*Math.cos(a),(r+w)*Math.sin(a),h+3);
        if(prev&&edge){
          body.facet([prev,edge,next],0xc7b29a,.44*alpha);
          body.facet([prev,next,mid],ivory,.54*alpha);
        }
        seam.push(mid);prev=mid;edge=next;
      }
      light.strip(seam,2.4,ivory,.68*alpha);
    }
    return;
  }
  if(slot===4){
    // Pressure jets trail the firebox. Their tips curl upward as the cart advances.
    for(const side of [-1,0,1]){
      const root=at(-size*.6,side*size*.48,lift+15);
      const lip=at(-size,side*size*.62,lift+10);
      const tip=at(-size*(1.6+.15*Math.cos(phase*9+side)),side*size*.73,lift+38+side*4);
      body.facet([root,lip,tip],ember,alpha);
      light.strip([root,tip],3.5,ivory,.9*alpha);
    }
    return;
  }
  // Crescent of heated metal swept out by the basic wok swing.
  const edge:Knot[]=[];
  for(let i=0;i<=12;i++){
    const a=(i/12-.5)*2.1;
    edge.push(at(size*Math.cos(a),size*Math.sin(a),lift+size*(.35+.22*Math.sin(a))));
    if(i)body.facet([at(-size*.24,0,lift),edge[i-1],edge[i]],i<5?iron:copper,.77*alpha);
  }
  light.strip(edge,3.6,ivory,alpha,false);
}

export function drawSkillVolumes(body:Body,light:Light,sprites:readonly PaintedSprite[],time:number,reduced:boolean){
  for(const s of sprites){
    if(!s.relief||s.alpha<=0)continue;
    if(s.hero==='dani'){
      drawRivetVolume(body,light,s);
      continue;
    }
    if(s.hero==='mira'){
      drawStoveEffect(body,light,s,time,reduced);
      continue;
    }
    const kit=kits[s.hero];
    if(!kit)continue;
    const frameTime=reduced?.42:time*.85;
    const field=s.relief==='field',lane=s.relief==='lane',shot=s.relief==='shot';
    const count=field?(s.frame>=16?6:4):lane?3:1;
    const size=field?Math.min(34,s.width*.10):lane?Math.min(21,s.width*.10):shot?9:15;
    if(size<1)continue;
    for(let i=0;i<count;i++){
      const phase=(frameTime+i*.38196)%1;
      const a=field?s.angle+(i+.5)*turn/count:s.angle;
      const d=field?s.width*.37:lane?(i-1)*s.width*.29:shot?-s.width*.43:s.originX===1?-size*1.5:0;
      const x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d;
      const h=s.ground?0:Math.max(0,s.lift*Math.SQRT2-8);
      ornament(body,light,x,y,h,field?a+Math.PI/2:a,size,phase,s.alpha,kit);
    }
  }
}
