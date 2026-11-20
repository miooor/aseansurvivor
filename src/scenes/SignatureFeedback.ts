import type {Point,RunState} from '../game/runtime.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

type Ink=Pick<SpellRibbons,'strip'|'glow'>;
interface SignatureFrame{
  readonly hero:Pick<RunState['hero'],'id'|'identity'>;
  readonly p:Point&{readonly face:readonly number[]};
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
  // Two kits do not emit a spend event. Keep just the last observed belt and
  // measure for this run, and age their release in simulation time.
  private owner?:unknown;
  private spools=0;
  private lastBeat:number|null=null;
  private spentAt=-Infinity;
  private spentCount=0;
  private spendAngle=0;

  draw(ink:Ink,g:SignatureFrame,reduced:boolean){
    const {p,identity:s,roster,t}=g,id=g.hero.id;
    const owner=roster[id]??s;
    if(this.owner!==owner){
      this.owner=owner;this.spools=0;this.lastBeat=null;this.spentAt=-Infinity;this.spentCount=0;
    }
    const charge=s.charge,fill=charge/g.hero.identity.max,release=Math.min(1,s.releaseT);
    const drift=reduced?0:Math.sin(t*7);
    switch(id){
      case 'rempit':{
        if(release&&s.castSlot===1)this.spendAngle=s.castAngle;
        const a=release?this.spendAngle:Math.atan2(p.face[1],p.face[0]),dx=Math.cos(a),dy=Math.sin(a);
        const pipe=(back:number,side:number):Knot=>[p.x-dx*back-dy*side,p.y-dy*back+dx*side,16];
        for(const side of [-1,1]){
          const len=16+50*fill+80*release;
          ink.strip([pipe(27,side*11),pipe(36,side*12),pipe(36+len*.45,side*(13+drift)),pipe(36+len,side*16)],
            4+fill*4+release*5,release?0xff4717:fill>=1?0xff7828:0xacb6c1,.48+.48*Math.max(fill,release));
          if(fill>=1||release)ink.glow(pipe(39,side*12),10,gold,1);
        }break;
      }
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
        const buoy=at(p,28,-28),radius=charge?14:8;
        arc(ink,buoy,radius,radius,0,tau,charge?5:2,charge?ice:0x80bdb5);
        if(charge)for(const side of [-1,1])stroke(ink,buoy,[[side*10,-10],[side*6,-6]],4,gold);
        if(release)arc(ink,buoy,15+8*release,12,-2.8,-.3,4,ice);
        break;
      }
      case 'dani':{
        const state=roster.dani as {anchor:(Point&{ready:boolean})|null;shield:{hp:number}};
        const a=state.anchor;
        if(state.shield.hp>0){
          stroke(ink,p,[[-33,-52],[-27,-24],[0,-9],[27,-24],[33,-52]],5,0x61edab);
        }else{
          const base=a??at(p,-27,-16),returned=a?.ready&&Math.hypot(a.x-p.x,a.y-p.y)<=70;
          const height=a?30+18*fill:19,bulb=at(base,0,-height);
          stroke(ink,base,[[-10,0],[10,0],[0,0],[0,-height]],3,0xa8bd92);
          ink.glow(knot(bulb),a?.ready?17:8,a?.ready?0x73ffad:gold,.95);
          if(a?.ready)arc(ink,bulb,19,10,0,tau,2.8,0x70e8a4);
          if(returned)stroke(ink,bulb,[[-12,-17],[-3,-10],[12,-26]],4,0xd9ffbd);
        }break;
      }
      case 'lia':{
        const count=(roster.lia as {spools:number}).spools;
        if(count<this.spools&&s.castT>0&&s.castSlot===2){this.spentAt=t;this.spentCount=this.spools-count;this.spendAngle=s.castAngle}
        this.spools=count;
        const belt=at(p,0,-40);
        stroke(ink,belt,[[-19,-2],[-6,2],[8,3],[20,0]],3,0xa18051);
        for(let i=0;i<count;i++){
          const bobbin=at(belt,(i-1)*14,0);
          stroke(ink,bobbin,[[-5,-5],[5,-5],[2,0],[5,6],[-5,6],[-2,0],[-5,-5]],3,gold);
        }
        const age=t-this.spentAt;
        if(age<.45)for(let i=0;i<this.spentCount;i++){
          const a=this.spendAngle,dx=Math.cos(a),dy=Math.sin(a),len=36+(reduced?16:age*120),side=(i-1)*11;
          ink.strip([knot(at(belt,-dy*side,dx*side)),knot(at(belt,-dx*len*.5-dy*(side+7),-dy*len*.5+dx*(side+7))),
            knot(at(belt,-dx*len-dy*side,-dy*len+dx*side))],5,gold,1-age/.45);
        }break;
      }
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
      case 'vanna':{
        const state=roster.vanna as {q:unknown;e:unknown;cross:Point|null};
        const loom=at(p,-34,-40);
        for(const [i,laid] of [state.q,state.e].entries()){
          const sign=i?1:-1;
          stroke(ink,loom,[[-11,sign*-12],[11,sign*12]],3.5,rose,laid?1:.25);
        }
        if(state.cross&&charge)stroke(ink,state.cross,[[0,-18],[14,0],[0,18],[-14,0],[0,-18]],4,rose);
        for(const f of g.fx)if(f.hero===id&&f.kind==='ring'&&f.r===60&&!f.flourish){
          for(const sign of [-1,1])stroke(ink,f,[[-26,-26*sign],[26,26*sign]],5,rose,f.life/f.max);
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
      case 'nadi':{
        const layers=(roster.nadi as {layers:(Point&{at:number;cured:boolean})[]}).layers;
        if(!layers.length)arc(ink,at(p,-32,-35),10,5,0,tau,2.5,0xb07b51);
        for(const layer of layers){
          const cured=layer.cured||t-layer.at>=2-1e-8;
          arc(ink,layer,20,10,0,tau,3,0xd08653);
          if(cured){
            const inReach=Math.hypot(p.x-layer.x,p.y-layer.y)<=400;
            stroke(ink,layer,[[-13,0],[-3,5],[14,-5]],4,inReach?gold:0xb07b51);
          }
        }
        for(const f of g.fx)if(f.hero===id&&f.kind==='ring'&&f.r===90&&!f.flourish){
          const lift=reduced?12:(1-f.life/f.max)*24;
          stroke(ink,at(f,0,-lift),[[-18,0],[-4,-8],[15,-3],[3,4],[-18,0]],4,gold,f.life/f.max);
        }break;
      }
    }
  }
}
