import {questPropFrames} from '../content/quest-art.js';
import {drawAsha} from './heroes/asha';
import {drawMira} from './heroes/mira';
import {drawDani} from './heroes/dani';
import {drawVanna} from './heroes/vanna';
import {drawKeo} from './heroes/keo';
import {drawNadi} from './heroes/nadi';
import {drawLia} from './heroes/lia';
import * as THREE from 'three';
import {CampaignAtlas} from './CampaignAtlas';
import {RegionWorld} from './RegionWorld';
import {RegionMap} from './RegionMap';
import {SpriteAssets,type Actor} from './SpriteAssets';
import type {BattleMarks} from './BattleMarks';
import {heroArt} from '../content/hero-art.js';
import {recoveryPose} from './hero-recovery';
import {regionalPose,travellerPose} from './regional-animation';
import {regionalGhost} from '../content/regional-ghosts.js';
import {BUNIAN_WAYFARER,FOLKLORE_ATLAS,FOLKLORE_IMPACT,type FolkloreMark} from '../content/folklore-monsters.js';
import {createRuntime,type GameRuntime,type RunState,type Encounter,type Point} from '../game/runtime.js';
import {drawWauLane} from './WauLookout';

const rosterEffects:Record<string,(scene:SurvivalScene,g:RunState)=>void>={asha:drawAsha,mira:drawMira,dani:drawDani,vanna:drawVanna,keo:drawKeo,nadi:drawNadi,lia:drawLia};
const GHOST_FRAMES: Record<string, number> = {toyol:5,pocong:6,minyak:7,pontianak:8,raya:9,shade:9};
const powerUpFrames:Record<string,number>={ketupat:0,magnet:1,mercun:2,kopi:3,payung:4};
const JADE=0x81e6ca,GOLD=0xf1c882,RED=0xf16b82;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each occupation has three adjacent frames: waiting, beckoning, and thanking.
const questLocals:Record<string,[string,number]>={
  quayManifest:['Quay clerk',0],hawkerDelivery:['Hawker',1],
  tinAssay:['Assayer',2],jettyEscort:['Fisher',3],
  paddyWater:['Irrigation keeper',4],nipahPlanting:['Nursery keeper',5],
  duyongLaunch:['Boatbuilder',6],wauFlight:['Kite maker',7]
};

type ActiveActor=Actor&{casts:boolean};

export class SurvivalScene {
  readonly runtime:GameRuntime;
  readonly terrain:RegionWorld;
  readonly atlas:CampaignAtlas;
  readonly sprites=new Map<Point,ActiveActor>();
  private map=new RegionMap();
  private previousRun:RunState|null=null;
  private recoveryStart=Infinity;
  private stridePhase=0;
  private rideHeading:number|null=null;
  private rideFacing=0;
  private rideBank=0;
  private previousHp=0;
  private flash=0;
  private elapsed=0;
  private guide=document.getElementById('raidGuide')!;
  private joystick=document.getElementById('touchStick')!;
  private damage=document.getElementById('damageTint')!;
  private playerHealth=document.getElementById('playerHealth')!;
  private width=0;
  private height=0;

  constructor(host:HTMLElement,private assets:SpriteAssets){
    this.terrain=new RegionWorld(host,assets);
    this.runtime=createRuntime(this.terrain.renderer.domElement,assets);
    this.atlas=new CampaignAtlas();
  }

  prepareHero(id:string){return this.assets.prepareHero(id)}

  get floor(){return this.terrain.floor}
  get effects(){return this.terrain.effects}

  start(){
    const canvas=this.terrain.renderer.domElement;
    const observer=new ResizeObserver(()=>{
      this.width=canvas.parentElement!.clientWidth;
      this.height=canvas.parentElement!.clientHeight;
      this.runtime.resize(this.width,this.height);
    });
    observer.observe(canvas.parentElement!);
    let time=0;
    this.terrain.renderer.setAnimationLoop(now=>{
      const delta=time?Math.min(50,now-time):0;
      time=now;
      this.update(now,delta);
      this.drawTerrain();
    });
    window.addEventListener('pagehide',event=>{
      if(event.persisted)return;
      observer.disconnect();
      this.terrain.renderer.setAnimationLoop(null);
      this.runtime.destroy();this.atlas.destroy();this.map.destroy();this.terrain.destroy();
    });
  }

  private image(source:Point,frame:number,size:number,casts=false,key='actors'){
    const actor:ActiveActor={x:source.x,y:source.y,key,frame:this.assets.frame(key,frame),width:size,height:size,
      originY:.72,rotation:0,tint:0xffffff,alpha:1,casts};
    this.sprites.set(source,actor);
    return actor;
  }

  private setFrame(actor:Actor,key:string,index:number){
    actor.key=key;actor.frame=this.assets.frame(key,index);
  }

  circle(batch:BattleMarks,x:number,y:number,r:number,color:number,alpha=.2,line=0){
    batch.fillStyle(color,alpha).fillCircle(x,y,Math.max(0,r));
    if(line)batch.lineStyle(line,color,Math.min(1,alpha*3)).strokeCircle(x,y,Math.max(0,r));
  }

  color(css?:string){return css?new THREE.Color(css).getHex():GOLD}

  private drawFolkloreMark(mark:FolkloreMark,color:number,age:number){
    const {x,y,delay,fired}=mark;
    const alpha=fired?.6*Math.max(0,1-(age-delay)/FOLKLORE_IMPACT):delay>age?.13:.22;
    const outline=fired?alpha:delay>age?.48:.86;
    if(mark.kind==='lane'){
      const {dx,dy,length,width}=mark;
      const tx=x+dx*length,ty=y+dy*length,ox=-dy*width/2,oy=dx*width/2;
      const tint=mark.color??color;
      this.floor.lineStyle(width,tint,alpha).lineBetween(x,y,tx,ty);
      this.floor.lineStyle(2,tint,outline).beginPath()
        .moveTo(x+ox,y+oy).lineTo(tx+ox,ty+oy).lineTo(tx-ox,ty-oy).lineTo(x-ox,y-oy).closePath().strokePath();
    }else if(mark.kind==='polygon'){
      const tint=mark.color??color;
      this.floor.fillStyle(tint,alpha).fillPoints(mark.points);
      this.floor.lineStyle(2,tint,outline).beginPath();
      for(const {x,y} of mark.points)this.floor.lineTo(x,y);
      this.floor.closePath().strokePath();
    }else{
      const {r,inner}=mark;
      if(inner){
        this.floor.fillStyle(color,alpha).fillRing(x,y,r,inner);
        this.floor.lineStyle(2,color,outline).strokeCircle(x,y,inner);
      }else this.floor.fillStyle(color,alpha).fillCircle(x,y,r);
      this.floor.lineStyle(2,color,outline).strokeCircle(x,y,r);
    }
  }

  private drawEncounter(g:RunState,event:Encounter,reduced:boolean){
    const active=event.status==='active';
    if(!active&&!(event.status==='available'&&event.discovered))return;
    if(event.track!==undefined&&event.track>=2)return;
    const labels=this.terrain.labels;
    const actorPoint=event.companion??event;
    this.circle(this.floor,actorPoint.x,actorPoint.y,42,GOLD,.18,3);
    if(event.id==='ward'){
      this.questProp(event,2,85);
      this.floor.fillStyle(0x102c29,1).fillRect(event.x-40,event.y+28,80,7);
      this.floor.fillStyle(0x87ffb5,1).fillRect(event.x-40,event.y+28,80*(event.hp??300)/300,7);
      labels.show(event,event.name+(event.hp===undefined?'':` · ${event.hp} / 300 HP`),event.x,event.y,80,{size:16,color:'#ffe0af'});
      return;
    }
    if(event.id==='hunt'){
      this.questProp(event,1,82,true);
      const tracker=event.track===undefined?'':' · Track '+(event.track+1)+'/2';
      labels.show(event,event.name+tracker,event.x,event.y,80,{size:16,color:'#ffe0af'});
      return;
    }

    const local=questLocals[event.id];
    const role=local?.[0]??'Traveller';
    const sheet=local?'regional-workers':'traveller';
    const base=local?local[1]*3:0;
    const npc=this.image(actorPoint,base,88,true,sheet);
    const guidance=active?event.guidance:undefined;
    const cleared=event.id==='rescue'&&active&&!g.enemies.some(e=>e.encounter==='rescue'&&!e.dead);
    const companion=event.companion;
    const pose=companion?(companion.moving?0:2):travellerPose(npc,g.t,cleared||!!local&&active,reduced);
    this.setFrame(npc,sheet,base+pose);
    npc.originY=.91;
    npc.flipX=(companion?.moving&&guidance?guidance.x:g.p.x)<actorPoint.x;
    if(companion?.moving&&!reduced){
      const step=Math.sin(g.t*12);
      npc.y-=Math.abs(step)*3;
      npc.rotation=step*.06;
    }
    const atActor=guidance&&Math.hypot(guidance.x-actorPoint.x,guidance.y-actorPoint.y)<100;
    if(!atActor)labels.show(actorPoint,active?role:role+' · '+event.name,actorPoint.x,actorPoint.y,85,{size:16,color:'#ffe0af'});
    if(!guidance)return;
    const {x,y,verb,label}=guidance;
    this.circle(this.floor,x,y,48,JADE,.16,3);
    this.floor.fillStyle(JADE,.9).fillTriangle(x-9,y-53,x+9,y-53,x,y-43);
    if(!atActor&&verb!=='Defeat')this.questProp(guidance,questPropFrames[event.id]??11,72);
    labels.show(guidance,verb+' · '+label,x,y,atActor||verb==='Defeat'?107:76,{size:16,color:'#b9ffe8'});
  }

  private questProp(point:Point,frame:number,size:number,ground=false){
    const actor=this.image(point,0,size,!ground);
    this.setFrame(actor,'quest-props',frame);
    actor.originY=ground?.64:.91;
  }

  private drawRaid(g: RunState){
    const state=this.runtime.raid.state;
    if(!state)return;
    if(g.raid){
      for(const q of state.tele){
        const progress=1-THREE.MathUtils.clamp(q.t/q.max,0,1);
        this.floor.fillStyle(RED,.16).fillCircle(q.x,q.y,q.r);
        this.floor.lineStyle(3,RED,.88).strokeCircle(q.x,q.y,q.r);
        this.circle(this.floor,q.x,q.y,q.r*progress,RED,.25);
      }
      for(const q of state.spawns)this.circle(this.floor,q.x,q.y,34,0xbb8cfa,.3,2);
      if(state.lane){
        const l=state.lane,px=-l.dy*l.w,py=l.dx*l.w;
        this.floor.fillStyle(RED,.22).fillPoints([
          {x:l.x+px,y:l.y+py},{x:l.x+l.dx*l.len+px,y:l.y+l.dy*l.len+py},
          {x:l.x+l.dx*l.len-px,y:l.y+l.dy*l.len-py},{x:l.x-px,y:l.y-py}
        ]);
      }
      if(state.eclipse){const e=state.eclipse;this.circle(this.floor,e.x,e.y,e.r,GOLD,.27,4)}
      if(state.orb)this.image(state.orb,15,55).tint=GOLD;
      this.guide.hidden=false;this.guide.textContent=state.eclipse?'✦ Eclipse incoming · stand in the gold circle':'HANTU RAYA · Avoid the red attack markers';
    }else if(state.portal){
      const p=state.portal;
      const gate=this.image(p,0,150);
      this.setFrame(gate,'raya-portal',0);
      gate.height=gate.width*gate.frame.height/gate.frame.width;
      gate.originY=.92;
      const distance=Math.hypot(p.x-g.p.x,p.y-g.p.y),angle=Math.atan2(p.y-g.p.y,p.x-g.p.x);
      const arrows=['→','↘','↓','↙','←','↖','↑','↗'];
      this.guide.hidden=false;this.guide.textContent=arrows[(Math.round(angle/(Math.PI/4))+8)%8]+' Spirit rift · '+Math.round(distance)+' m · '+Math.ceil(p.life)+'s';
    }else this.guide.hidden=true;
  }

  update(_time:number,delta:number){
    const previousTime=this.runtime.G?.t??0;
    this.runtime.step(delta);
    this.map.update(this.runtime.G);
    const g=this.runtime.G;
    this.terrain.show(!!g);
    this.sprites.clear();
    this.terrain.labels.begin();
    if(!g){
      this.atlas.update(delta);
      this.terrain.labels.finish();this.guide.hidden=true;
      this.joystick.hidden=true;this.playerHealth.hidden=true;this.damage.style.opacity='0';
      this.previousRun=null;return;
    }
    const reduced=reducedMotion();
    const fresh=g!==this.previousRun;
    if(fresh){
      this.recoveryStart=Infinity;
      this.stridePhase=0;
      this.rideHeading=null;this.rideBank=0;
      this.atlas.stop();this.previousRun=g;this.previousHp=g.p.hp;this.flash=0;
      this.assets.retainHeroes(new Set([g.hero.id]),key=>this.terrain.actors.release(key));
    }
    this.terrain.setRegion(g.world,this.runtime.raid.ARENA);
    this.floor.clear();this.effects.clear();
    this.drawRaid(g);
    if(!g.raid){
      const wayfarer=g.bunian;
      if(wayfarer&&Math.hypot(g.p.x-wayfarer.x,g.p.y-wayfarer.y)<540){
        const actor=this.image(wayfarer,BUNIAN_WAYFARER.frame,94,true);
        this.setFrame(actor,FOLKLORE_ATLAS,BUNIAN_WAYFARER.frame);
        actor.originY=.91;
        this.terrain.labels.show(wayfarer,BUNIAN_WAYFARER.name,wayfarer.x,wayfarer.y,88,{size:14,color:'#d9f2d1'});
      }
      drawWauLane(this.floor,g,reduced);
      const gate=g.world.gangway;
      if(gate&&!gate.open&&Math.hypot(g.p.x-gate.winch.x,g.p.y-gate.winch.y)<560){
        const {x,y}=gate.winch;
        this.circle(this.floor,x,y,58,GOLD,.14,3);
        if(g.jettyWork?.active){
          const start=-Math.PI/2,end=start+g.jettyWork.elapsed/gate.duration*2*Math.PI;
          this.floor.lineStyle(7,GOLD,.96).beginPath().arc(x,y,58,start,end).strokePath();
        }
      }
      for(const [x,y]of [[-280,-120],[300,170]])for(let i=0;i<4;i++)this.circle(this.floor,x,y,25+i*20,GOLD,.018);
      for(let i=0;i<28;i++){
        const x=Math.sin(i*127.1)*1000+Math.sin(g.t*.4+i)*18,y=Math.cos(i*311.7)*1000+Math.cos(g.t*.3+i)*12;
        const alpha=.2+Math.sin(g.t*1.3+i)*.15;
        this.circle(this.effects,x,y,8,JADE,alpha*.1);this.circle(this.effects,x,y,1.5,JADE,alpha);
      }
    }
    for(const z of g.zones){
      if(z.kind==='fire'||z.kind==='barrier')continue;
      if(z.kind==='thorn'){
        const warning=z.max-z.life<.6;
        this.circle(this.floor,z.x,z.y,z.r,warning?0xffd98a:0xd58ad9,warning?.08:.32,3);
        const roots=this.image(z,0,z.r*2);
        this.setFrame(roots,'briarback-thorns',warning?0:1);
        roots.originY=.78;
        continue;
      }
      const alpha=Math.min(1,z.life/z.max*2);
      this.circle(this.floor,z.x,z.y,z.r,z.c?this.color(z.c):z.kind==='fire'?0xf69a4d:z.kind==='oil'?0x090f18:GOLD,alpha*(z.kind==='oil'?.7:.13),z.kind==='barrier'?2:0);
      if(z.kind==='fire')this.circle(this.floor,z.x,z.y,z.r*.6,0xffdf92,alpha*.12);
    }
    if(!g.raid)for(const site of g.world.landmarks)if(site.reward&&!g.exploration.claimed.includes(site.id)){
      this.floor.fillStyle(0xf1c882,.12).fillCircle(site.x,site.y,95);
      this.floor.lineStyle(3,0xf1c882,.6).strokeCircle(site.x,site.y,40);
      this.questProp(site,0,69);
    }
    if(!g.raid)for(const event of Object.values(g.encounters))this.drawEncounter(g,event,reduced);
    for(const d of g.durians){
      this.circle(this.floor,d.x,d.y,50,RED,.12,1);
      const fruit=this.image(d,5,42,false,'campaign-pickups');
      fruit.y-=150*Math.max(0,d.t/1.4);
    }
    for(const gem of g.gems){
      const icon=gem.kind==='coin'?this.image(gem,14,19):this.image(gem,6,25,false,'campaign-pickups');
      icon.originY=.5;
    }
    for(const drop of g.equipmentDrops){
      const {x,y}=drop;
      this.circle(this.floor,x,y,24,0xffce69,.28,2);
      this.questProp(drop,0,48);
      this.terrain.labels.show(drop,'Equipment · '+drop.slot,x,y,38,{size:16,color:'#ffe0a0'});
    }
    for(const u of g.pups){
      this.circle(this.floor,u.x,u.y,25,GOLD,.14,1);
      const icon=this.image(u,powerUpFrames[u.type],42,false,'campaign-pickups');
      if(!reduced)icon.y-=Math.abs(Math.sin(g.t*3))*5;
    }
    for(const m of g.marbles)this.circle(this.floor,m.x,m.y,4,0x9bdaf2,.9);
    for(const e of g.enemies){
      if(e.dead)continue;
      const regional=regionalGhost(e.type);
      const folklore=regional?.folklore;
      const size=regional?regional.size*(e.scale??1):e.boss?Math.max(125,e.r*3):e.type==='shade'?55:e.type==='minyak'?84:67;
      const head=e.type==='penanggal';
      const paired=head||e.type==='body';
      const sprite=this.image(e,paired?(head?0:1):GHOST_FRAMES[e.type]??5,size,true,paired?'penanggal-pair':'actors');
      if(regional){
        const pose=regionalPose(sprite,regional.frame,e,g.p,g.t,reduced,!folklore);
        this.setFrame(sprite,regional.atlas??(folklore?FOLKLORE_ATLAS:'malaysia-monsters'),pose);
      }else if(paired){
        sprite.originY=.91;
        sprite.flipX=g.p.x<e.x;
        if(head)sprite.y-=12+(reduced?0:3*Math.sin(e.phase));
      }else sprite.rotation=reduced?0:Math.sin(g.t*7+e.phase)*.035;
      if(e.type==='pocong')sprite.y-=Math.max(0,Math.sin(e.phase))*7;
      if(e.flash>0){sprite.tint=0xffeee3;sprite.flash=true}
      else if(e.stun>0)sprite.tint=0x99c9fa;
      else if(e.p2)sprite.tint=0xffb6ad;
      else if(e.windup&&regional)sprite.tint=0xffd598;
      if(e.elite){this.circle(this.floor,e.x,e.y,e.r+9,e.vulnerable?0x8ef4d0:e.elite==='Thornbound'?0xd58ad9:0xffbd77,.16,3);if(e.windup&&e.type==='stalker'){const target=e.objective||g.p,angle=Math.atan2(target.y-e.y,target.x-e.x);this.floor.lineStyle(2,0xffbd77,.9).lineBetween(e.x,e.y,e.x+Math.cos(angle)*160,e.y+Math.sin(angle)*160);}}
      if(folklore&&e.folkloreMarks){
        for(const mark of e.folkloreMarks)this.drawFolkloreMark(mark,folklore.color,e.windup?0:e.folkloreRelease??0);
      }else if(e.windup&&regional){
        const warning=e.warningPoint??e;
        this.circle(this.floor,warning.x,warning.y,regional.warning,0xffb56d,.16,3);
        if(e.type==='foam'){
          const a=e.attackAngle??0,dx=Math.cos(a),dy=Math.sin(a);
          for(const offset of [-52,52]){
            const x=e.x-dy*offset,y=e.y+dx*offset;
            this.floor.lineStyle(13,0x9ae6e5,.4).lineBetween(x,y,x+dx*360,y+dy*360);
          }
        }
        if(e.type==='kite'){
          const a=e.attackAngle??0;
          this.floor.lineStyle(3,JADE,.8).lineBetween(e.x,e.y,e.x+Math.cos(a)*150,e.y+Math.sin(a)*150);
        }
      }
      if(e.hp<e.maxHp){this.floor.fillStyle(0x021115,.85).fillRect(e.x-18,e.y+16,36,3);this.floor.fillStyle(e.boss?RED:0xd7a66b,1).fillRect(e.x-18,e.y+16,36*Math.max(0,e.hp/e.maxHp),3)}
    }
    const accent=this.color(g.hero.identity.color),identity=g.identity,charge=identity.charge/g.hero.identity.max;
    this.circle(this.floor,g.p.x,g.p.y,30,accent,.07,1);
    if(charge>0)this.floor.lineStyle(charge>=1?3:2,accent,.75).beginPath().arc(g.p.x,g.p.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*charge).strokePath();
    if(identity.releaseT>0){
      this.circle(this.floor,g.p.x,g.p.y,48+(1.2-identity.releaseT)*65,accent,identity.releaseT*.07,2);
      for(let k=0;k<6;k++){const a=k*Math.PI/3;this.effects.lineStyle(2,accent,identity.releaseT*.5).lineBetween(g.p.x+Math.cos(a)*40,g.p.y+Math.sin(a)*40,g.p.x+Math.cos(a)*65,g.p.y+Math.sin(a)*65)}
    }
    const art=heroArt[g.hero.id as keyof typeof heroArt];
    const hero=this.image(g.p,art.idleIndex??15,art.size,true);
    const attacking=identity.castT>0;
    const direction=(angle:number)=>(Math.round(angle/(Math.PI/4))+8)%8;
    const castFacing=direction(identity.castAngle);
    let travelFacing=direction(Math.atan2(g.p.face[1],g.p.face[0]));
    const walking=!!g.p.moving;
    const riding=g.hero.id==='rempit'&&walking;
    const dt=fresh?0:Math.max(0,g.t-previousTime);
    const movement=g.p.normalMove;
    if(movement&&dt>0){
      const distance=Math.hypot(movement.dx,movement.dy);
      this.stridePhase=(this.stridePhase+Math.min(distance/29,dt*6.5))%4;
    }
    if(riding&&movement&&Math.hypot(movement.dx,movement.dy)>.01){
      const heading=Math.atan2(movement.dy,movement.dx);
      if(dt>0||this.rideHeading===null){
        const deltaAngle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
        const turn=this.rideHeading===null?0:deltaAngle(heading-this.rideHeading);
        // Hysteresis around atlas octants keeps a steady diagonal on one frame.
        if(this.rideHeading===null||Math.abs(deltaAngle(heading-this.rideFacing*Math.PI/4))>Math.PI/8+.055)
          this.rideFacing=direction(heading);
        const target=Math.max(-.11,Math.min(.11,turn/Math.max(dt,.001)*.037));
        this.rideBank+=(target-this.rideBank)*(1-Math.exp(-dt*12));
        if(Math.abs(this.rideBank)<.0001)this.rideBank=0;
        this.rideHeading=heading;
      }
      travelFacing=this.rideFacing;
    }else{
      this.rideHeading=null;this.rideBank=0;
    }
    const walkRow=riding||reduced?0:Math.floor(this.stridePhase);
    const ridingBasic=riding&&identity.castSlot===0;
    const facing=attacking&&!ridingBasic?castFacing:travelFacing;
    // Begin on the last beat of the cast and finish on the simulation clock,
    // so pause freezes the pose and a new cast immediately takes precedence.
    if(attacking)this.recoveryStart=g.t+identity.castT-identity.castMax*.18;
    const recovery=!ridingBasic&&recoveryPose(g.hero.id,g.t-this.recoveryStart,castFacing,travelFacing,walking,reduced,walkRow);
    if(recovery){
      this.setFrame(hero,'hero-'+recovery.sheet+'-'+g.hero.id,recovery.frame);
      hero.rotation=recovery.rotation;
    }else if(attacking&&identity.castSlot>0){
      const progress=1-identity.castT/identity.castMax;
      this.setFrame(hero,'hero-skills-'+g.hero.id,((identity.castSlot-1)*2+(progress<.3?0:1))*8+facing);
    }else if(attacking||walking){
      const row=attacking&&!ridingBasic?4+Math.min(3,Math.floor((1-identity.castT/identity.castMax)*4)):walkRow;
      if(riding&&!reduced)hero.rotation=this.rideBank;
      this.setFrame(hero,'hero-motion-'+g.hero.id,row*8+facing);
    }else if(art.idleIndex!==undefined)this.setFrame(hero,'hero-directions',art.idleIndex*8+facing);
    else this.setFrame(hero,'hero-motion-'+g.hero.id,7*8+facing);
    const size=art.size;
    hero.height=size*hero.frame.height/hero.frame.width;hero.originY=180/192;
    if(!reduced&&g.sea?.leap){const leap=g.sea.leap;hero.y-=Math.sin(Math.PI*leap.t/leap.dur)*110}
    if(g.sea?.leap)this.circle(this.floor,g.sea.leap.tx,g.sea.leap.ty,130,accent,.1,2);
    if(g.p.hurt>0)hero.tint=0xffb9aa;
    if(g.p.shield>0)this.circle(this.effects,g.p.x,g.p.y-14,40,GOLD,.1,2);
    if(g.sea&&(g.sea.stance>0||g.sea.wai>0))this.circle(this.effects,g.p.x,g.p.y,45,g.sea.stance>0?0xf4aac8:GOLD,.12,2);
    this.elapsed+=delta;
    if(g.p.hp<this.previousHp&&!reduced)this.flash=1;
    this.flash=Math.max(0,this.flash-delta/180);
    this.damage.style.opacity=String(reduced?0:this.flash*.65);
    this.previousHp=g.p.hp;
    for(const q of g.eprojs){
      this.circle(this.effects,q.x,q.y,q.r+5,RED,.14);
      this.circle(this.effects,q.x,q.y,q.r,this.color(q.c||'#ffb7b9'),.95);
    }
    const drawHero=rosterEffects[g.hero.id];
    if(drawHero)drawHero(this,g);
    if(g.sea){
      for(const ally of g.sea.allies){const actor=this.image(ally,3,42);actor.tint=0x99e7ff;actor.alpha=.8}
      for(const copy of g.sea.images){const actor=this.image(copy,4,90);actor.tint=GOLD;actor.alpha=copy.t*.7}
      for(const s of g.sea.strikes)this.circle(this.floor,s.x,s.y,s.r,s.kind==='feather'?GOLD:JADE,.12,2);
    }
    const labels=this.terrain.labels;
    for(const e of g.enemies)if(!e.dead&&(e.elite||e.encounter)){
      if(!e.elite){
        labels.show(e,e.encounter==='rescue'?(g.encounters.rescue?.companion?'◆ Ambusher':'◆ Captor'):'◆',e.x,e.y,84,{size:15,color:'#ffdf86'});
        continue;
      }
      labels.show(e,(e.encounter?'◆ ':'')+(e.name?e.name+' · ':'')+e.elite+' '+(regionalGhost(e.type)?.name??e.type)+(e.vulnerable?' · VULNERABLE':e.windup?(e.type==='stalker'?' · CHARGE WARNING':' · CASTING'):''),
        e.x,e.y,e.objective?115:75,{size:14,color:'#ffe0af'});
    }
    for(const message of g.texts){
      const age=1-message.life/message.max,lane=message.lane||0,combat=!!message.kind;
      const lift=combat?(reduced?12:Math.sin(Math.min(1,age*1.25)*Math.PI*.7)*44):0;
      const x=message.x+(combat?lane*9+(reduced?0:lane*age*8):0),y=message.y-25-lift;
      const pop=combat&&!reduced?1+Math.sin(Math.min(1,age/.22)*Math.PI)*(message.kind==='critical'?.45:.22):1;
      labels.show(message,message.s,x,message.y,25+lift,{size:message.size,color:message.c,combat},pop,Math.min(1,message.life/message.max*3));
      if(message.kind==='critical'&&age<.4){
        const a=(1-age/.4)*.6;
        for(let k=0;k<8;k++){const angle=k*Math.PI/4,r=message.size*(.6+age);
          this.effects.lineStyle(3,0xffb74f,a).lineBetween(x+Math.cos(angle)*r*.6,y+Math.sin(angle)*r*.45,x+Math.cos(angle)*r,y+Math.sin(angle)*r*.7)}
      }
    }
    labels.finish();
    this.drawJoystick();
  }

  private drawJoystick(){
    const joy=this.runtime.joystick,stick=this.joystick;
    stick.hidden=!joy;
    if(!joy)return;
    const dx=joy.x-joy.ox,dy=joy.y-joy.oy;
    const factor=Math.min(1,55/(Math.hypot(dx,dy)||1));
    stick.style.left=joy.ox+'px';stick.style.top=joy.oy+'px';
    stick.style.setProperty('--stick-x',dx*factor+'px');
    stick.style.setProperty('--stick-y',dy*factor+'px');
  }

  drawTerrain(){
    const g=this.runtime.G;
    if(!g)return;
    const zoom=this.runtime.scale,actors=this.terrain.actors;
    const shake=reducedMotion()?0:Math.min(11,g.shake*.48);
    const x=g.p.x+Math.sin(this.elapsed*.083)*shake,y=g.p.y+Math.cos(this.elapsed*.069)*shake;
    const halfWidth=this.width/(2*zoom),halfHeight=this.height/(2*zoom);
    actors.begin();
    if(!g.raid)for(const actor of this.terrain.scenery){
      if(Math.abs(actor.x-x)<=halfWidth+actor.width&&Math.abs(actor.y-y)<=halfHeight+actor.height)actors.add(actor,actor.y,true);
    }
    for(const [source,actor] of this.sprites){
      if(Math.abs(actor.x-x)>halfWidth+actor.width||Math.abs(source.y-y)>halfHeight+actor.height)continue;
      actors.add(actor,source.y,actor.casts);
    }
    actors.finish();
    this.terrain.draw(g,this.width,this.height,zoom,x,y);
    const hero=this.sprites.get(g.p);
    this.playerHealth.hidden=!hero||g.over||!this.width||!this.height;
    if(hero&&!this.playerHealth.hidden){
      const head=this.terrain.actorHead(hero,g.p.y);
      const fraction=THREE.MathUtils.clamp(g.p.hp/g.p.maxHp,0,1);
      this.playerHealth.style.setProperty('--health',String(fraction));
      this.playerHealth.style.transform=`translate3d(${head.x}px,${head.y-7}px,0) translate(-50%,-100%)`;
    }
  }
}
