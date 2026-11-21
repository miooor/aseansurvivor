import type {Point,RunState} from '../game/runtime.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

import {drawTailpipe,type ExhaustOutlet} from './bike-exhaust';

type Ink=Pick<SpellRibbons,'strip'|'glow'>;
interface SignatureFrame{
  readonly hero:Pick<RunState['hero'],'id'|'identity'>;
  readonly p:Point&{readonly face:readonly number[];vx:number;vy:number;exhaust:number;super:number};
  readonly identity:Readonly<RunState['identity']>;
  readonly roster:Readonly<RunState['roster']>;
  readonly t:number;
  readonly fx:readonly RunState['fx'][number][];
}
type Offset=[number,number];

// Screen-facing strokes in world units, attached to the foot of a sprite.
function stroke(ink:Ink,p:Point,offsets:Offset[],width:number,color:number,alpha=1){
  ink.strip(offsets.map(([x,y])=>[p.x+x,p.y+y,0]),width,color,alpha,false);
}
function arc(ink:Ink,p:Point,rx:number,ry:number,start:number,end:number,width:number,color:number){
  const points:Offset[]=Array.from({length:17},(_,i)=>{
    const a=start+(end-start)*i/16;return [Math.cos(a)*rx,Math.sin(a)*ry];
  });
  stroke(ink,p,points,width,color);
}
const tau=2*Math.PI;
const at=(p:Point,x:number,y:number):Point=>({x:p.x+x,y:p.y+y});
const knot=(p:Point,h=0):Knot=>[p.x,p.y,h];
const gold=0xffb838,ice=0x47deff,rose=0xff72ac;

export class SignatureFeedback{
  // Keep the last observed measure for Keo’s timing cue.
  private owner?:unknown;
  private lastBeat:number|null=null;
  private spentAt=-Infinity;

  draw(ink:Ink,g:SignatureFrame,reduced:boolean,outlet?:ExhaustOutlet){
    const {p,identity:s,roster,t}=g,id=g.hero.id;
    const owner=roster[id]??s;
    if(this.owner!==owner){
      this.owner=owner;this.lastBeat=null;this.spentAt=-Infinity;
    }
    const charge=s.charge,fill=charge/g.hero.identity.max,release=Math.min(1,s.releaseT);
    switch(id){
      case 'rempit':
        if(outlet)drawTailpipe(ink,outlet,fill,release,p.exhaust>0,p.super>0,Math.hypot(p.vx,p.vy),t,reduced);
        break;
      case 'ustaz':{
        // Four panes of a lantern light up in firing order.
        const lamp=at(p,-43,-56-12*release);
        stroke(ink,lamp,[[-12,-7],[0,-16],[12,-7],[9,12],[-9,12],[-12,-7]],2.8,gold);
        for(let i=0;i<4;i++)ink.glow(knot(at(lamp,(i%2-.5)*9,(Math.floor(i/2)-.5)*10)),7,gold,i<charge||release?1:.18);
        if(release)ink.glow(knot(lamp),31,gold,.7*release);
        break;
      }
      case 'nok':{
        // Corner wraps stack into a double chevron before the third technique.
        for(const side of [-1,1])for(let i=0;i<2;i++){
          const reach=35+10*i+release*18;
          stroke(ink,p,[[side*(reach-8),-45],[side*reach,-36],[side*(reach-8),-27]],3.5,0xff6e52,i<charge||release?1:.24);
        }break;
      }
      case 'lan':{
        for(let i=0;i<2;i++){
          const wave=Array.from({length:17},(_,j):Offset=>{
            const x=j/16;return [(x-.5)*(62+48*fill+48*release),8+i*8-(5+11*fill)*Math.sin(x*tau+(reduced?0:t*2)+i)];
          });
          stroke(ink,p,wave,2+2*fill+3*release,ice,.45+.5*Math.max(fill,release));
        }break;
      }
      case 'sari':{
        const blade=at(p,28+release*19,-36);
        arc(ink,blade,14+14*fill,24+10*release,-1.7,1.6,charge||release?5:2.5,0xd884df);
        if(charge||release)stroke(ink,blade,[[0,-26],[12,-4],[0,26]],3.5,rose);
        break;
      }
      case 'mira':{
        const pot=at(p,28,-28);
        arc(ink,pot,12,8,0,Math.PI,3,gold);
        for(let i=0;i<3;i++){
          const x=pot.x-7+i*7;
          ink.glow([x,pot.y-4,4],i<charge?5:2,i<charge?0xff9f45:0x947f65,i<charge?.95:.34);
        }
        if(release)arc(ink,pot,15+8*release,12,-2.8,-.3,4,gold);
        break;
      }
      case 'dani':
        arc(ink,at(p,25,-30),charge?9:6,8,0,tau,charge?3:1.7,charge?gold:0x775936);
        if(release)arc(ink,at(p,25,-30),9+release*6,12,0,tau,3,gold);
        break;
      case 'vanna':
        stroke(ink,at(p,-28,-32),[[0,-7],[6,0],[0,7],[-6,0],[0,-7]],3,rose,charge?1:.3);
        break;
      case 'lia':
        stroke(ink,at(p,-21,-29),[[-5,6],[4,-7],[2,2],[-5,6]],3,0xb49aff,charge?1:.3);
        if(s.castSlot===2&&s.castT>0){
          const a=s.castAngle;
          for(const side of [-8,8])ink.strip([knot(at(p,0,side)),knot(at(p,-44*Math.cos(a),side-44*Math.sin(a)))],4,0xb49aff,s.castT/s.castMax,false);
        }
        break;
      case 'asha':{
        const tickets=(roster.asha as {tickets:{e:Point;served:boolean}[]}).tickets;
        for(let i=0;i<Math.max(1,tickets.length);i++){
          const slip=at(p,-40+i*10,-44-i*6),ticket=tickets[i];
          stroke(ink,slip,[[-7,-10],[7,-8],[6,8],[-8,6],[-7,-10]],2.8,gold,ticket?1:.35);
          if(ticket?.served){
            const inReach=Math.hypot(p.x-ticket.e.x,p.y-ticket.e.y)<=420;
            stroke(ink,slip,[[-5,0],[-1,4],[6,-4]],2.6,inReach?0x83ffd7:0xa28e69);
          }
        }
        for(const f of g.fx)if(f.hero===id&&f.kind==='ring'&&f.r===65){
          ink.strip([knot(f,32),knot(at(f,8,-8),48),knot(at(f,18,-16),64)],6,gold,f.life/f.max);
        }break;
      }
      case 'keo':{
        const last=(roster.keo as {last:number|null}).last;
        if(last!==null&&this.lastBeat!==null&&last!==this.lastBeat){
          const interval=last-this.lastBeat;
          if(interval>=1.5-1e-8&&interval<=2+1e-8)this.spentAt=last;
        }
        this.lastBeat=last;
        const age=last===null?Infinity:t-last,active=age<=2+1e-8,open=active&&age>=1.5-1e-8;
        for(let i=0;i<4;i++){
          const reed=at(p,-45+i*6,-31);
          const lit=active&&age>=i*.5;
          stroke(ink,reed,[[0,0],[0,-12-i*5]],2.8,open?0xb6ff91:0x83c192,lit?1:.38);
        }
        if(t-this.spentAt<.5)arc(ink,at(p,-38,-52),23,12,-2.8,-.35,4,0xc2ff92);
        break;
      }
      case 'nadi':
        arc(ink,at(p,0,-14),42,24,-Math.PI*.86,-Math.PI*.14,charge?2:1.2,charge?gold:0x8e7249);
        for(let i=0;i<charge;i++){
          const angle=-Math.PI*.82+i*Math.PI*.08;
          ink.glow(knot(at(p,43*Math.cos(angle),24*Math.sin(angle)),8),4,gold,.74);
        }
        if(s.releaseT>0)arc(ink,at(p,0,-14),42,24,0,tau,3,gold);
        break;
    }
  }
}
