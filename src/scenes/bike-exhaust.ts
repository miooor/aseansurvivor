import type {Actor} from './SpriteAssets';
import type {Knot,SpellRibbons} from './SpellRibbons';

export interface ExhaustOutlet {x:number;y:number;dx:number;dy:number}
type Row=readonly (readonly [number,number])[];
// Muffler mouths in 240 × 144 atlas cells, clockwise from east. Wheelies
// shift the entire chassis inside the cell; the foot pivot stays put.
const idle:Row=[[71,110],[49,104],[98,109],[182,105],[191,109],[125,113],[140,113],[126,108]];
const motion:Row[]=[
  [[51,110],[49,99],[99,109],[182,100],[188,109],[124,114],[139,113],[126,108]],
  [[45,107],[46,92],[97,105],[185,96],[197,104],[119,113],[140,112],[126,109]],
  [[30,102],[40,91],[92,97],[191,92],[206,94],[120,112],[142,108],[128,107]],
  [[47,108],[47,98],[98,109],[186,101],[195,106],[125,114],[141,113],[125,108]],
  [[69,111],[52,102],[99,109],[181,102],[189,109],[125,114],[139,115],[125,111]],
  [[73,112],[48,100],[97,110],[183,103],[191,106],[127,114],[140,113],[125,109]],
  [[64,110],[49,105],[97,110],[186,106],[186,110],[126,112],[141,115],[124,108]],idle
];
const skills:Row[]=[
  [[45,106],[52,97],[97,109],[184,98],[190,107],[121,111],[141,113],[126,107]],
  [[110,111],[108,107],[97,97],[136,106],[131,112],[119,111],[142,101],[122,109]],
  [[44,105],[49,96],[99,112],[185,96],[190,105],[123,112],[142,115],[125,108]],
  [[57,111],[60,111],[99,113],[177,111],[184,111],[123,114],[139,114],[124,111]],
  [[49,108],[47,96],[98,110],[187,98],[190,106],[121,112],[140,114],[127,106]],
  [[52,109],[52,104],[98,110],[183,103],[190,105],[128,112],[140,114],[125,109]],
  [[44,105],[48,101],[99,110],[194,101],[192,107],[136,115],[140,116],[126,105]],
  [[41,106],[45,101],[98,111],[194,102],[196,106],[122,111],[140,114],[125,105]]
];
// Projected exit directions. The end-on views expose a single side outlet.
const exits:Row=[[-1,-.23],[-.84,-.54],[-.53,-.64],[.84,-.54],[1,-.23],[.92,.39],[.45,.77],[-.92,.39]];

export function bikeExhaust(actor:Actor):ExhaustOutlet{
  const frame=Number(actor.frame.name),facing=frame%8,row=Math.floor(frame/8);
  const sockets=actor.key==='hero-skills-rempit'?skills[row]:actor.key==='hero-motion-rempit'?motion[row]:idle;
  const [u,v]=sockets[facing],[dx,dy]=exits[facing];
  const x=(u/240-(actor.originX??.5))*actor.width,y=(v/144-actor.originY)*actor.height;
  const c=Math.cos(actor.rotation),s=Math.sin(actor.rotation);
  return {x:actor.x+x*c-y*s,y:actor.y+x*s+y*c,dx:dx*c-dy*s,dy:dx*s+dy*c};
}

export function drawTailpipe(ink:Pick<SpellRibbons,'strip'|'glow'>,outlet:ExhaustOutlet,charge:number,
  release:number,hot:boolean,boost:boolean,speed:number,time:number,reduced:boolean){
  const throttle=Math.min(1,speed/320);
  const power=Math.max(charge*.62,release,hot?.76:0,boost?1:0);
  const pulse=reduced?0:Math.sin(time*28)*.55+Math.sin(time*17)*.45;
  const length=(10+power*53+throttle*(8+power*23))*(hot?2.05:1)*(1+.10*pulse);
  // These points are already in the sprite's projected plane. Cancel the
  // ribbon batch's eight-unit ground lift to keep the core on the muffler.
  const at=(d:number,side=0):Knot=>[outlet.x+outlet.dx*d-outlet.dy*side,
    outlet.y+outlet.dy*d+outlet.dx*side,-8];
  const width=(2.2+power*5)*(hot?2.25:1),colour=boost?0x55cfff:power>.12?0xff742e:0xb3bec5;
  ink.strip([at(0),at(length*.14),at(length*.42,1),at(length*.74,-pulse*2),at(length,pulse*3)],
    width,colour,.5+.48*power);
  if(hot){
    // Two curling tongues open downstream of the narrow muffler mouth.
    for(const side of [-1,1]){
      const tip=at(length*(side>0?.91:1.08),side*width*(.6+.4*pulse));
      tip[2]+=width*(1.1+.35*side*pulse);
      ink.strip([at(0),at(length*.27,side*width*.45),at(length*.54,side*width*1.12),tip],
        width*.82,0xff4913,.96);
      ink.strip([at(0),at(length*.23),at(length*.44,side*width*.63),tip],width*.48,0xffc24e,.98);
    }
    ink.glow(at(length*.39),width*2.4,0xff7427,.67);
  }
  if(power>.12){
    // A hot shear layer flares just beyond the nozzle and narrows into the jet.
    for(const side of [-1,1]){
      ink.strip([at(0),at(length*.18,side*width*.8),at(length*.45,side*width*.62),
        at(length*.80,pulse*2)],width*.55,colour,.82);
    }
    ink.strip([at(0),at(4),at(length*.33),at(length*.55)],width*.55,boost?0xdaffff:0xffed9a,.98);
    if(hot||boost){
      // Compression rings sit across the live jet axis and shrink downstream.
      for(const t of [.24,.47,.68]){
        const radius=width*(1-t),ring:Knot[]=[];
        for(let i=0;i<=8;i++){
          const a=i*Math.PI/4,point=at(length*t,radius*Math.cos(a));
          ring.push([point[0],point[1],-8+radius*Math.sin(a)]);
        }
        ink.strip(ring,1.3,boost?0xc7ffff:0xffdd83,.86,false);
      }
    }
    ink.glow(at(2),4+power*5,colour,.85);
  }
}

// Space the flames along the road, independent of the simulation frame rate.
export function drawWheelieFire(ink:Pick<SpellRibbons,'facet'|'strip'|'glow'>,
  mark:{x:number;y:number;tx?:number;ty?:number;life:number;max:number},time:number,reduced:boolean){
  if(mark.tx===undefined||mark.ty===undefined||mark.life<=0)return;
  const dx=mark.tx-mark.x,dy=mark.ty-mark.y,length=Math.hypot(dx,dy);
  if(length<.1)return;
  const ax=dx/length,ay=dy/length,fade=Math.min(1,mark.life/.42);
  const start:Knot=[mark.x,mark.y,-7],end:Knot=[mark.tx,mark.ty,-7];
  ink.strip([start,end],9,0xff4612,.95*fade,false);
  ink.strip([start,end],3,0xffc449,fade,false);
  const offset=mark.x*ax+mark.y*ay,spacing=16;
  for(let cell=Math.ceil(offset/spacing);cell*spacing<offset+length;cell++){
    const d=cell*spacing-offset,x=mark.x+ax*d,y=mark.y+ay*d;
    const seed=Math.sin(cell*7.17+ax*2+ay)*32;
    const flicker=Math.sin(seed+(reduced?0:time*9));
    const hot=Math.min(1,mark.life/mark.max*2);
    const height=(48+17*Math.sin(seed)+8*flicker)*hot;
    const at=(forward:number,side:number,h:number):Knot=>[x+ax*forward-ay*side,y+ay*forward+ax*side,h-7];
    ink.glow(at(0,0,0),20,0xff6b13,.8*fade);
    if(cell%3===0){
      const drift=reduced?.5:(time*.9+Math.abs(seed))%1;
      const ember=at(-10-12*drift,5*flicker,height+16*drift);
      ink.glow(ember,3,0xffb02b,fade*(1-drift));
    }
    for(const side of [-1,1]){
      const scale=side===1?1:.62;
      const root=at(4,side*8,0),back=at(-10,-side*4,0);
      const curl=at(-3,side*(5+2*flicker),height*.48*scale);
      const neck=at(-9,side*(4+3*flicker),height*.70*scale);
      const tip=at(-9-8*flicker,side*(3-4*flicker),height*scale);
      ink.facet([root,back,curl],0xff4611,fade);
      ink.facet([back,curl,neck],0xff721c,fade);
      ink.facet([curl,neck,tip],0xff8f26,fade);
      ink.strip([at(1,side*2,0),at(-1,side*4,height*.26*scale),tip],4,0xffdb66,fade);
    }
  }
}


// Nearby exhaust patches share a flame cluster when the rider idles or doubles back.
export function drawExhaustPatches(ink:Pick<SpellRibbons,'facet'|'strip'|'glow'>,
  zones:readonly {kind:string;x:number;y:number;r:number;life:number;slot?:number}[],time:number,reduced:boolean){
  const drawn:{x:number;y:number}[]=[];
  for(let i=zones.length-1;i>=0;i--){
    const z=zones[i];
    if(z.kind!=='fire'||z.slot===1||z.life<=0)continue;
    if(drawn.some(p=>Math.hypot(z.x-p.x,z.y-p.y)<z.r*.60))continue;
    drawn.push(z);
    const heat=Math.min(1,z.life/.55),r=z.r,phase=z.x*.13+z.y*.17;
    ink.glow([z.x,z.y,-7],r,0xff6521,.85*heat);
    for(let j=0;j<3;j++){
      const angle=phase+j*2.4,x=z.x+r*.32*Math.cos(angle),y=z.y+r*.32*Math.sin(angle);
      const curl=Math.sin(angle+(reduced?0:time*8));
      const h=r*(1.45+.39*curl)*heat,w=r*.26;
      const base:Knot=[x,y,-7],left:Knot=[x-w,y+2,-7],right:Knot=[x+w,y-2,-7];
      const belly:Knot=[x+w*.45*curl,y+3,h*.48-7],tip:Knot=[x+w*1.3*curl,y-2,h-7];
      ink.facet([left,right,belly],0xff4912,heat);
      ink.facet([left,belly,tip],0xff8326,heat);
      ink.strip([base,belly,tip],w*.74,0xffda65,heat);
    }
  }
}
