import {sceneryPose} from './ScenerySprites';
import {SHRINES,shrineIds} from '../content/shrines.js';
import {questPropFrames} from '../content/quest-art.js';
import {drawAsha} from './heroes/asha';
import {drawMira} from './heroes/mira';
import {drawDani} from './heroes/dani';
import {isLoomBound} from '../game/heroes/vanna.js';
import {drawKeo} from './heroes/keo';
import {drawNadi} from './heroes/nadi';
import {bladeWheelAngle,drawBladeWheel,drawLia,drawShadowstep} from './heroes/lia';
import * as THREE from 'three';
import {CampaignAtlas} from './CampaignAtlas';
import {bikeExhaust} from './bike-exhaust';
import {RegionWorld} from './RegionWorld';
import {RegionMap} from './RegionMap';
import {SpriteAssets,type Actor} from './SpriteAssets';
import type {BattleMarks} from './BattleMarks';
import {heroArt} from '../content/hero-art.js';
import {recoveryPose} from './hero-recovery';
import {regionalPose,travellerPose} from './regional-animation';
import {regionalGhost} from '../content/regional-ghosts.js';
import {HUNTING_ATLAS,HUNTING_MONSTERS,PACK_GUARD_RADIUS} from '../content/hunting-monsters.js';
import {activePackGuard,guardedByPack} from '../game/hunting-packs.js';
import {BOSS_ESCORT_ATLAS,BOSS_ESCORTS} from '../content/boss-escorts.js';
import {activeBossWard} from '../game/boss-ward.js';
import {WAVE_MONSTER_ATLAS,WAVE_MONSTERS} from '../content/wave-monsters.js';
import {NIGHT_ATLAS,NIGHT_FOES,NIGHT_BUBBLE_RADIUS} from '../content/night-foes.js';
import {ELEMENTS,monsterElement} from '../content/elements.js';
import {BUNIAN_WAYFARER,FOLKLORE_ATLAS,FOLKLORE_IMPACT,type FolkloreMark} from '../content/folklore-monsters.js';
import {createRuntime,type GameRuntime,type RunState,type Encounter,type Point} from '../game/runtime.js';
import {CombatTellAudio,isExposed} from '../game/combat-readability.js';
import {damageCircle,damageLane,damagePolygon,slowField,exposedBrackets,EXPOSED_INK} from './combat-tells';
import {drawPaintedEffects,skyfallLift,type PaintedSprite} from './painted-effects';
import {drawWauLane} from './WauLookout';

const rosterEffects:Record<string,(scene:SurvivalScene,g:RunState,painted:boolean)=>void>={asha:drawAsha,mira:drawMira,dani:drawDani,keo:drawKeo,nadi:drawNadi,lia:drawLia};
const CLASSIC_FRAMES: Record<string,number|undefined>={pocong:0,toyol:4,minyak:8,pontianak:12};
const CLASSIC_SIZES: Record<string,number>={pocong:77,toyol:61,minyak:96,penanggal:81,body:70,pontianak:108,shade:58};
const powerUpFrames:Record<string,number>={ketupat:0,magnet:1,mercun:2,kopi:3,payung:4};
const JADE=0x81e6ca,GOLD=0xf1c882,RED=0xf16b82;
const WINDUP_TINT={physical:0xffede0,fire:0xffc7a6,water:0xb9e7ff,lightning:0xfff1ae,spirit:0xe7c8ff};
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each occupation has three adjacent frames: waiting, beckoning, and thanking.
const questLocals:Record<string,[string,number]>={
  quayManifest:['Quay clerk',0],harbourLedger:['Harbour clerk',0],hawkerDelivery:['Hawker',1],
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
  private paint:PaintedSprite[]=[];
  private map=new RegionMap();
  private previousRun:RunState|null=null;
  private tellAudio=new CombatTellAudio();
  private recoveryStart=Infinity;
  private stridePhase=0;
  private rideHeading:number|null=null;
  private rideFacing=0;
  private rideBank=0;
  private previousHp=0;
  private flash=0;
  private elapsed=0;
  private guide=document.getElementById('raidGuide')!;
  private riftStatus=document.getElementById('riftStatus')!;
  private riftCountdown=document.getElementById('riftCountdown')!;
  private joystick=document.getElementById('touchStick')!;
  private damage=document.getElementById('damageTint')!;
  private shrineBuff=document.getElementById('shrineBuff')!;
  private talkCue={};
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

  private cueNear(g:RunState,{x,y}:Point,r=0){
    return Math.hypot(x-g.p.x,y-g.p.y)<=310+r;
  }

  private cueNearLane(g:RunState,{x,y}:Point,dx:number,dy:number,length:number,width:number){
    const offsetX=g.p.x-x,offsetY=g.p.y-y;
    const along=THREE.MathUtils.clamp(offsetX*dx+offsetY*dy,0,length);
    return Math.hypot(offsetX-along*dx,offsetY-along*dy)<=310+width/2;
  }

  private drawCoin(coin:Point,time:number,reduced:boolean){
    const {x,y}=coin;
    const phase=time*2.2+x*.003+y*.004;
    const gleam=reduced?.45:Math.pow(.5+.5*Math.cos(phase),6);
    const icon=this.image(coin,14,42);
    icon.originY=.5;
    icon.y-=reduced?8:8+Math.sin(phase)*3;

    this.floor.fillStyle(0xffa531,.14).fillCircle(x,y,25);
    this.floor.fillStyle(0xffdf76,.27).fillCircle(x,y,16);

    const sx=x+8,sy=icon.y-8,reach=4+gleam*5;
    this.effects.fillStyle(0xfff4c7,.56+gleam*.4)
      .fillPoints([{x:sx-reach,y:sy},{x:sx,y:sy-1.6},{x:sx+reach,y:sy},{x:sx,y:sy+1.6}])
      .fillPoints([{x:sx,y:sy-reach},{x:sx+1.4,y:sy},{x:sx,y:sy+reach},{x:sx-1.4,y:sy}]);
  }

  private drawFolkloreMark(mark:FolkloreMark,color:number,age:number,damaging:boolean,charge=0){
    const {x,y,delay,fired}=mark;
    const active=delay<=age;
    const fade=fired?Math.max(0,1-(age-delay)/FOLKLORE_IMPACT):0;
    const alpha=fired?.68*fade:active?.2+.16*charge:.13;
    const outline=fired?fade:active?.9:.48;
    if(damaging&&!fired){
      const weight=active?.86+.14*charge:.6;
      if(mark.kind==='lane')damageLane(this.floor,mark,mark.dx,mark.dy,mark.length,mark.width,weight,mark.color??color);
      else if(mark.kind==='polygon')damagePolygon(this.floor,mark.points,weight,mark.color??color);
      else damageCircle(this.floor,mark,mark.r,mark.inner,weight,color);
      return;
    }
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

  private drawMonsterImpact(mark:FolkloreMark,color:number,age:number,reduced:boolean){
    const life=Math.max(0,1-(age-mark.delay)/FOLKLORE_IMPACT);
    if(!life)return;
    const x=mark.kind==='lane'?mark.x+mark.dx*mark.length*.6:mark.x;
    const y=mark.kind==='lane'?mark.y+mark.dy*mark.length*.6:mark.y;
    const spread=mark.kind==='circle'?(mark.r+mark.inner)*.5:20;
    for(let i=0;i<4;i++){
      const angle=(i+.25)*Math.PI/2,reach=spread*(reduced?1:1.16-.16*life);
      const sx=x+Math.cos(angle)*reach,sy=y+Math.sin(angle)*reach;
      const height=reduced?8:8+(1-life)*23;
      this.effects.lineStyle(5,color,.55*life).lineBetween(sx,sy,sx,sy-height);
      this.effects.lineStyle(1.5,0xfff8ec,life).lineBetween(sx,sy-2,sx,sy-height);
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

  private drawRaid(g: RunState,reduced:boolean){
    const state=this.runtime.raid.state;
    if(!state)return;
    let status='',countdown='';
    if(g.raid){
      for(const q of state.tele){
        damageCircle(this.floor,q,q.r,0,.9);
        if(!reduced){
          const progress=1-THREE.MathUtils.clamp(q.t/q.max,0,1);
          this.circle(this.floor,q.x,q.y,q.r*progress,RED,.21);
        }
        this.tellAudio.danger(q,this.cueNear(g,q,q.r));
      }
      for(const q of state.spawns)this.circle(this.floor,q.x,q.y,34,0xbb8cfa,.3,2);
      if(state.lane){
        const l=state.lane;
        damageLane(this.floor,l,l.dx,l.dy,l.len,l.w*2);
        this.tellAudio.danger(l,this.cueNearLane(g,l,l.dx,l.dy,l.len,2*l.w));
      }
      if(state.eclipse){
        const e=state.eclipse;
        this.circle(this.floor,e.x,e.y,e.r,GOLD,.27,4);
        this.tellAudio.danger(e,true);
      }
      if(state.orb)this.image(state.orb,15,55).tint=GOLD;
      status=state.eclipse?'✦ Eclipse incoming · stand in the gold circle':'HANTU RAYA · Avoid the attack markers';
    }else if(state.portal&&!g.over){
      const p=state.portal;
      const gate=this.image(p,0,150);
      this.setFrame(gate,'raya-portal',0);
      gate.height=gate.width*gate.frame.height/gate.frame.width;
      gate.originY=.92;
      const active=Object.values(g.encounters).find(event=>event.status==='active');
      status=active?'Spirit Rift blocked · Finish or abandon '+active.name+' to enter':'Spirit Rift';
      countdown=active?'':' · '+Math.ceil(p.life)+'s';
    }
    this.guide.hidden=g.over||!status;
    if(this.riftStatus.textContent!==status)this.riftStatus.textContent=status;
    if(this.riftCountdown.textContent!==countdown)this.riftCountdown.textContent=countdown;
  }

  update(_time:number,delta:number){
    const previousTime=this.runtime.G?.t??0;
    this.runtime.step(delta);
    this.map.update(this.runtime.G,this.runtime.raid.state?.portal??null);
    const g=this.runtime.G;
    this.tellAudio.begin(g);
    this.terrain.show(!!g);
    this.sprites.clear();
    this.terrain.labels.begin();
    if(!g){
      this.atlas.update(delta);
      this.terrain.labels.finish();this.guide.hidden=true;
      this.joystick.hidden=true;this.playerHealth.hidden=true;this.damage.style.opacity='0';
      if(this.previousRun)this.terrain.actors.release('hero-effects-'+this.previousRun.hero.id);
      this.tellAudio.finish(this.runtime.audio,false);
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
    this.drawRaid(g,reduced);
    if(!g.raid){
      const wayfarer=g.bunian;
      if(wayfarer&&Math.hypot(g.p.x-wayfarer.x,g.p.y-wayfarer.y)<540){
        const actor=this.image(wayfarer,BUNIAN_WAYFARER.frame,94,true);
        this.setFrame(actor,FOLKLORE_ATLAS,BUNIAN_WAYFARER.frame);
        actor.originY=.91;
        this.terrain.labels.show(wayfarer,BUNIAN_WAYFARER.name,wayfarer.x,wayfarer.y,88,{size:14,color:'#d9f2d1'});
        // Talk cue: invites the player to walk up; hidden while the dialogue box is open.
        if(!wayfarer.talking)this.terrain.labels.show(this.talkCue,'💬',wayfarer.x,wayfarer.y,118+(reduced?0:Math.sin(g.t*3)*5),{size:24,color:'#fff4c7'});
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
    let slowGround=false;
    for(const z of g.zones){
      if(z.kind==='barrier'&&z.slot===3&&g.hero.id==='ustaz'){
        const fade=Math.min(1,z.life/.45,(z.max-z.life)*10+.2);
        const breath=reduced?.85:.85+.15*Math.cos((z.max-z.life)*Math.PI);
        const floor=this.floor,r=z.r,fire=0xff730f;
        floor.fillStyle(0xff8420,.09*fade).fillCircle(z.x,z.y,r);
        floor.lineStyle(16,fire,.19*fade*breath).strokeCircle(z.x,z.y,r-4);
        floor.lineStyle(6,0xff6911,.96*fade).strokeCircle(z.x,z.y,r-2);
        floor.lineStyle(2,0xffca77,.97*fade).strokeCircle(z.x,z.y,r-2);
        floor.lineStyle(1.5,0xff942d,.86*fade).strokeCircle(z.x,z.y,r-12);
        // Eight small diamond inlays break up the rim without obscuring the field.
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a),x=z.x+(r-9)*c,y=z.y+(r-9)*s;
          floor.fillStyle(0xffab43,.95*fade).fillPoints([
            {x:x+7*c,y:y+7*s},{x:x-3*s,y:y+3*c},
            {x:x-7*c,y:y-7*s},{x:x+3*s,y:y-3*c}
          ]);
        }
        this.terrain.labels.show(z,'يشفي',z.x,z.y+r*.32,0,
          {size:44,color:'#aaffb3',glow:'#00ef62'},1,fade*breath);
      }else if(z.kind==='barrier'&&this.assets.hasEffects(g.hero.id)){
        this.floor.lineStyle(2,GOLD,.62*Math.min(1,z.life/.4)).strokeCircle(z.x,z.y,z.r);
      }
      if(z.kind==='fire'&&g.hero.id==='rempit'){
        const heat=Math.min(1,z.life/.45);
        this.circle(this.floor,z.x,z.y,z.r,0x6a291d,heat*.14);
        // Short ember seams stay on the hot road after the bike has passed.
        const slant=Math.sin(z.x*.17+z.y*.29);
        for(const side of [-1,1]){
          const x=z.x+side*z.r*.31,y=z.y+slant*z.r*.23;
          this.floor.lineStyle(2,0xff943c,.8*heat).lineBetween(x-4,y+slant*2,x+4,y-2);
        }
      }
      if(z.kind==='fire'||z.kind==='barrier')continue;
      if(z.kind==='monster-brine'||z.kind==='oil'){
        slowField(this.floor,z,z.r);
        if(Math.hypot(z.x-g.p.x,z.y-g.p.y)<z.r)slowGround=true;
        continue;
      }
      if(z.kind==='thorn'){
        const warning=z.max-z.life<.6;
        damageCircle(this.floor,z,z.r,0,warning?.72:1,0xd58ad9);
        this.tellAudio.danger(z,this.cueNear(g,z,z.r));
        const roots=this.image(z,0,z.r*2);
        this.setFrame(roots,'briarback-thorns',warning?0:1);
        roots.originY=.78;
        continue;
      }
      const alpha=Math.min(1,z.life/z.max*2);
      this.circle(this.floor,z.x,z.y,z.r,z.c?this.color(z.c):GOLD,alpha*.13);
    }
    if(slowGround)this.tellAudio.slow('ground');
    if(!g.raid)for(const site of g.world.landmarks)if(site.reward&&!g.exploration.claimed.includes(site.id)){
      this.floor.fillStyle(0xf1c882,.12).fillCircle(site.x,site.y,95);
      this.floor.lineStyle(3,0xf1c882,.6).strokeCircle(site.x,site.y,40);
      this.questProp(site,0,69);
    }
    if(!g.raid)for(const event of Object.values(g.encounters))this.drawEncounter(g,event,reduced);
    for(const d of g.durians){
      damageCircle(this.floor,d,50,0,.75);
      this.tellAudio.danger(d,this.cueNear(g,d,50));
      const fruit=this.image(d,5,42,false,'campaign-pickups');
      fruit.y-=150*Math.max(0,d.t/1.4);
    }
    const pickupHalfWidth=this.width/(2*this.runtime.scale)+48;
    const pickupHalfHeight=this.height/(2*this.runtime.scale)+48;
    for(const gem of g.gems){
      if(gem.kind==='coin'){
        if(Math.abs(gem.x-g.p.x)<=pickupHalfWidth&&Math.abs(gem.y-g.p.y)<=pickupHalfHeight)this.drawCoin(gem,g.t,reduced);
      }else this.image(gem,6,25,false,'campaign-pickups').originY=.5;
    }
    for(const drop of g.equipmentDrops){
      const {x,y}=drop;
      this.circle(this.floor,x,y,24,0xffce69,.28,2);
      this.questProp(drop,0,48);
      this.terrain.labels.show(drop,drop.item?'Dulang Timah':'Equipment · '+drop.slot,x,y,38,{size:16,color:'#ffe0a0'});
    }
    for(const u of g.pups){
      this.circle(this.floor,u.x,u.y,25,GOLD,.14,1);
      const shrineFrame=shrineIds.indexOf(u.type);
      if(shrineFrame>=0){
        const shrine=SHRINES[u.type as keyof typeof SHRINES];
        this.image(u,shrineFrame,72,false,'shrines').originY=.92;
        this.terrain.labels.show(u,shrine.name+' Shrine',u.x,u.y,66,{size:14,color:shrine.color});
        continue;
      }
      const icon=this.image(u,powerUpFrames[u.type],42,false,'campaign-pickups');
      if(!reduced)icon.y-=Math.abs(Math.sin(g.t*3))*5;
    }
    for(const h of g.nightHazards){
      const tint=h.kind==='ember'?0xff844a:h.kind==='mirage'?0xffec77:0xcb9aff;
      const locked=h.kind==='revive'||(h.anchored?!h.waiting:h.t<=.62);
      if(h.kind!=='revive'&&locked){
        damageCircle(this.floor,h,h.r,0,.95,tint);
        this.tellAudio.danger(h,this.cueNear(g,h,h.r));
      }else this.circle(this.floor,h.x,h.y,h.r,tint,locked?.21:.06,locked?2:0);
      if(h.kind==='mirage'){
        const echo=this.image(h,NIGHT_FOES.berukKilat.frame,77,false,NIGHT_ATLAS);
        echo.originY=.91;echo.alpha=locked?.8:.6;
      }else if(h.kind==='ember'){
        this.circle(this.effects,h.x,h.y-16,17,tint,.3);
        this.circle(this.effects,h.x,h.y-16,9,0xffc975,.9);
      }else this.floor.lineStyle(2,tint,.8).strokeCircle(h.x,h.y,h.r*(1-h.t/h.max));
    }
    for(const m of g.marbles)this.circle(this.floor,m.x,m.y,4,0x9bdaf2,.9);
    const ward=g.raid?null:activeBossWard(g.boss);
    if(ward&&g.boss){
      const {x,y,r}=g.boss;
      this.floor.lineStyle(12,JADE,.22).lineBetween(ward.x,ward.y,x,y);
      this.floor.lineStyle(2.5,0xc1ffee,.88).lineBetween(ward.x,ward.y,x,y);
      this.circle(this.floor,x,y,r+13,JADE,.12,3);
      this.circle(this.floor,ward.x,ward.y,ward.r+10,JADE,.14,3);
    }
    for(const e of g.enemies){
      if(e.dead)continue;
      const regional=regionalGhost(e.type);
      const folklore=regional?.folklore;
      const size=regional?regional.size*(e.scale??1):e.boss?Math.max(125,e.r*3):CLASSIC_SIZES[e.type]??67;
      const classic=CLASSIC_FRAMES[e.type];
      const head=e.type==='penanggal';
      const paired=head||e.type==='body';
      const sprite=this.image(e,classic??(paired?(head?0:1):9),size,true,
        classic!==undefined?'classic-ghost-motion':paired?'penanggal-pair':'actors');
      const newcomer=NIGHT_FOES[e.type];
      const motionAtlas=WAVE_MONSTERS[e.type]?WAVE_MONSTER_ATLAS:
        BOSS_ESCORTS[e.type]?BOSS_ESCORT_ATLAS:HUNTING_MONSTERS[e.type]?HUNTING_ATLAS:null;
      if(newcomer){
        regionalPose(sprite,newcomer.frame,e,g.p,g.t,reduced,0);
        this.setFrame(sprite,NIGHT_ATLAS,newcomer.frame);
      }else if(motionAtlas&&regional){
        this.setFrame(sprite,motionAtlas,regionalPose(sprite,regional.frame,e,g.p,g.t,reduced,1,true));
      }else if(regional){
        const pose=regionalPose(sprite,regional.frame,e,g.p,g.t,reduced,folklore?0:regional.poseStride);
        this.setFrame(sprite,regional.atlas??(folklore?FOLKLORE_ATLAS:'malaysia-monsters'),pose);
      }else if(classic!==undefined){
        this.setFrame(sprite,'classic-ghost-motion',regionalPose(sprite,classic,e,g.p,g.t,reduced,1,true));
      }else if(e.type==='body'){
        sprite.originY=.91;
        sprite.flipX=g.p.x<e.x;
      }else{
        regionalPose(sprite,0,e,g.p,g.t,reduced,0);
        if(head)sprite.y-=12;
        if(e.type==='shade'){sprite.tint=0xc39fea;sprite.alpha=.82}
      }
      const element=ELEMENTS[e.monsterSkill?.element??monsterElement(e.type)];
      if(e.flash>0){sprite.tint=0xffeee3;sprite.flash=true}
      else if(isLoomBound(g,e))sprite.tint=0xffa6cb;
      else if(e.stun>0)sprite.tint=0x99c9fa;
      else if(e.p2)sprite.tint=0xffb6ad;
      else if(e.windup||e.slamWind)sprite.tint=e.monsterSkill?WINDUP_TINT[e.monsterSkill.element]:0xffd598;
      // Ailment tints: shock, chill, burn, weaken.
      else if((e.shockUntil??0)>g.t)sprite.tint=0xfff3a0;
      else if((e.slowT??0)>0)sprite.tint=0xa9dcff;
      else if(e.burnT>0)sprite.tint=0xffb08a;
      else if((e.weakUntil??0)>g.t)sprite.tint=0xd2b8ff;
      else if(e.emberRunner&&(e.carry??0)>0)sprite.tint=0xffcb85;
      if(e.nightEcho){
        sprite.alpha=e.nightEcho==='fragment'?.94:.58;
        if(e.nightEcho==='gasp')sprite.tint=0xccb7ff;
      }else if(newcomer){
        if(newcomer.trait==='bubble'){
          const outside=Math.hypot(e.x-g.p.x,e.y-g.p.y)>NIGHT_BUBBLE_RADIUS;
          this.circle(this.floor,e.x,e.y,NIGHT_BUBBLE_RADIUS,JADE,outside?.10:.035,2);
        }else if(newcomer.trait==='physicalThorns'||newcomer.trait==='elementThorns'){
          const ink=newcomer.trait==='physicalThorns'?0xd9d2c3:0xffa978;
          this.floor.lineStyle(2,ink,.68).strokeCircle(e.x,e.y,e.r+9);
        }else if(e.nightSouls){
          this.circle(this.floor,e.x,e.y,e.r+6+e.nightSouls*3,0xd4a1ff,.05+e.nightSouls*.023,2);
          sprite.width*=1+.045*e.nightSouls;
          sprite.height*=1+.045*e.nightSouls;
        }
      }
      const exposed=isExposed(e);
      if(exposed){
        exposedBrackets(this.floor,e,e.r);
        this.tellAudio.exposed(e,this.cueNear(g,e,e.r));
      }
      if(activePackGuard(e)){
        this.floor.lineStyle(2,JADE,.55);
        for(let i=0;i<4;i++){
          const angle=Math.PI/2*i;
          this.floor.beginPath().arc(e.x,e.y,PACK_GUARD_RADIUS,angle,angle+Math.PI*.32).strokePath();
        }
      }else if(guardedByPack(e,g.enemies)){
        this.circle(this.floor,e.x,e.y,e.r+9,JADE,.15,2);
      }
      if(e.type==='tenggilingRoller'&&!exposed&&(e.rush??0)>0){
        this.circle(this.floor,e.x,e.y,e.r+11,GOLD,.2,3);
      }
      if((e.slamWind??0)>0){
        damageCircle(this.floor,e,e.slamR??0);
        this.tellAudio.danger(e,this.cueNear(g,e,e.slamR));
      }
      if(e.elite&&!exposed)this.circle(this.floor,e.x,e.y,e.r+9,e.elite==='Thornbound'?0xd58ad9:0xffbd77,.16,3);
      if(e.folkloreMarks){
        const color=e.monsterSkill?this.color(element.color):folklore?.color??GOLD;
        const age=e.windup?0:e.folkloreRelease??0;
        const charge=!reduced&&e.windup?1-e.windup/(e.castMax??1):0;
        const skill=e.monsterSkill??folklore;
        const damaging=!!skill&&(skill.damage>0||'shot' in skill&&!!skill.shot);
        let near=false;
        for(const mark of e.folkloreMarks){
          this.drawFolkloreMark(mark,color,age,damaging,charge);
          if(damaging&&!near&&!mark.fired){
            if(mark.kind==='circle')near=this.cueNear(g,mark,mark.r);
            else if(mark.kind==='polygon')near=mark.points.some(point=>this.cueNear(g,point));
            else near=this.cueNearLane(g,mark,mark.dx,mark.dy,mark.length,mark.width);
          }
          if(mark.fired&&e.monsterSkill)this.drawMonsterImpact(mark,color,age,reduced);
        }
        if(damaging)this.tellAudio.danger(e.folkloreMarks,near);
      }else if(e.windup&&regional){
        const warning=e.warningPoint??e;
        let near=this.cueNear(g,warning,regional.warning);
        if(e.type==='nipah'||e.type==='sentinel')damageCircle(this.floor,warning,regional.warning);
        else this.circle(this.floor,warning.x,warning.y,regional.warning,0xffb56d,.16,3);
        if(e.type==='stalker'||e.type==='neon'){
          const a=e.attackAngle??0,reach=e.type==='stalker'?160:110;
          damageLane(this.floor,e,Math.cos(a),Math.sin(a),reach,e.r*2,.82);
        }
        if(e.type==='mooring'){
          const a=e.attackAngle??0,dx=Math.cos(a),dy=Math.sin(a);
          const reach=855; // Fastest bolt travels 285 units per second for three seconds.
          damageLane(this.floor,e,dx,dy,reach,15,.82);
          near=this.cueNearLane(g,e,dx,dy,reach,15);
        }
        if(e.type==='foam'){
          const a=e.attackAngle??0,dx=Math.cos(a),dy=Math.sin(a);
          for(const offset of [-52,52]){
            const x=e.x-dy*offset,y=e.y+dx*offset;
            const lane={x,y};
            damageLane(this.floor,lane,dx,dy,360,22,.82,0x9ae6e5);
            near ||= this.cueNearLane(g,lane,dx,dy,360,22);
          }
        }
        if(e.type==='kite'){
          const a=e.attackAngle??0;
          this.floor.lineStyle(3,JADE,.8).lineBetween(e.x,e.y,e.x+Math.cos(a)*150,e.y+Math.sin(a)*150);
        }
        this.tellAudio.danger(e,near);
      }
      if(e.hp<e.maxHp){this.floor.fillStyle(0x021115,.85).fillRect(e.x-18,e.y+16,36,3);this.floor.fillStyle(e.boss?RED:0xd7a66b,1).fillRect(e.x-18,e.y+16,36*Math.max(0,e.hp/e.maxHp),3)}
    }
    if(g.hero.id==='rempit')for(const mark of g.fx){
      if(mark.kind==='tyre'&&mark.tx!==undefined&&mark.ty!==undefined){
        this.floor.lineStyle(6,0x302a2b,.65*mark.life/mark.max).lineBetween(mark.x,mark.y,mark.tx,mark.ty);
      }
    }
    const accent=this.color(g.hero.identity.color),identity=g.identity,charge=identity.charge/g.hero.identity.max;
    this.circle(this.floor,g.p.x,g.p.y,30,accent,.07,1);
    const snared=(g.p.nightStatus.snare??0)>g.t,chilled=(g.p.nightStatus.chill??0)>g.t;
    const disrupted=(g.p.disruptedUntil??0)>g.t;
    if(snared||chilled||disrupted)slowField(this.floor,g.p,25,true);
    if(snared)this.tellAudio.slow('snared');
    if(chilled)this.tellAudio.slow('chilled');
    if(disrupted)this.tellAudio.slow('disrupted');
    if(charge>0)this.floor.lineStyle(charge>=1?3:2,accent,.75).beginPath().arc(g.p.x,g.p.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*charge).strokePath();
    if(identity.releaseT>0&&g.hero.id!=='rempit'){
      this.circle(this.floor,g.p.x,g.p.y,48+(1.2-identity.releaseT)*65,accent,identity.releaseT*.07,2);
      for(let k=0;k<6;k++){const a=k*Math.PI/3;this.effects.lineStyle(2,accent,identity.releaseT*.5).lineBetween(g.p.x+Math.cos(a)*40,g.p.y+Math.sin(a)*40,g.p.x+Math.cos(a)*65,g.p.y+Math.sin(a)*65)}
    }
    const art=heroArt[g.hero.id as keyof typeof heroArt];
    const hero=this.image(g.p,art.idleIndex??15,art.size,true);
    const attacking=identity.castT>0;
    const spinningFlamethrower=g.hero.id==='dani'&&identity.castSlot===1&&attacking;
    const wheelAngle=g.hero.id==='lia'?bladeWheelAngle(g,reduced):null;
    const direction=(angle:number)=>(Math.round(angle/(Math.PI/4))+8)%8;
    const castFacing=direction(identity.castAngle);
    let travelFacing=direction(Math.atan2(g.p.face[1],g.p.face[0]));
    const walking=!!g.p.moving;
    const riding=g.hero.id==='rempit'&&walking;
    const dt=fresh?0:Math.max(0,g.t-previousTime);
    const movement=g.p.normalMove;
    const liaStride=g.hero.id==='lia'&&walking;
    if(movement&&dt>0){
      const distance=Math.hypot(movement.dx,movement.dy);
      if(liaStride&&distance>.05)travelFacing=direction(Math.atan2(movement.dy,movement.dx));
      this.stridePhase=(this.stridePhase+(liaStride?Math.min(distance/22,dt*9):Math.min(distance/29,dt*6.5)))%4;
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
    // Moving knife throws keep the run cycle and its heading between footfalls.
    const movingBasic=(riding||liaStride)&&identity.castSlot===0;
    const chassisFacing=riding&&identity.castSlot>=2?travelFacing:castFacing;
    const facing=attacking&&!movingBasic?chassisFacing:travelFacing;
    // Begin on the last beat of the cast and finish on the simulation clock,
    // so pause freezes the pose and a new cast immediately takes precedence.
    if(attacking)this.recoveryStart=g.t+identity.castT-identity.castMax*.18;
    const recovery=wheelAngle===null&&!movingBasic&&!spinningFlamethrower&&recoveryPose(g.hero.id,g.t-this.recoveryStart,chassisFacing,travelFacing,walking,reduced,walkRow);
    const knee=g.sea?.knee;
    if(knee){
      this.setFrame(hero,'nok-flying-knee',0);
      hero.flipX=knee.ax<0;
      const airborne=Math.sin(Math.PI*knee.elapsed/knee.duration);
      hero.width=176+(reduced?0:airborne*22);
      hero.y-=reduced?12:12+airborne*49;
      hero.rotation=reduced?0:knee.ay*(hero.flipX?-1:1)*.23;
    }else if(wheelAngle!==null){
      this.setFrame(hero,'hero-skills-lia',5*8+direction(wheelAngle));
    }else if(recovery){
      this.setFrame(hero,'hero-'+recovery.sheet+'-'+g.hero.id,recovery.frame);
      hero.rotation=recovery.rotation;
    }else if(attacking&&identity.castSlot>0){
      const progress=1-identity.castT/identity.castMax;
      const palms=g.hero.id==='nadi'&&identity.castSlot===1;
      const preparation=palms&&!reduced?Math.floor((identity.castMax-identity.castT)/.06)%2===0
        :!spinningFlamethrower&&(progress<.3||g.hero.id==='nok'&&identity.castSlot===1);
      this.setFrame(hero,'hero-skills-'+g.hero.id,((identity.castSlot-1)*2+Number(!preparation))*8+facing);
    }else if(attacking||walking){
      const row=attacking&&!movingBasic?4+Math.min(3,Math.floor((1-identity.castT/identity.castMax)*4)):walkRow;
      if(riding&&!reduced)hero.rotation=this.rideBank;
      this.setFrame(hero,'hero-motion-'+g.hero.id,row*8+facing);
    }else if(art.idleIndex!==undefined)this.setFrame(hero,'hero-directions',art.idleIndex*8+facing);
    else this.setFrame(hero,'hero-motion-'+g.hero.id,7*8+facing);
    hero.height=hero.width*hero.frame.height/hero.frame.width;hero.originY=180/192;
    if(g.sea?.leap){
      hero.y-=skyfallLift(g.sea.leap,reduced);
      const radius=g.fx.find(f=>f.skill==='nok-4')?.r??130;
      this.circle(this.floor,g.sea.leap.tx,g.sea.leap.ty,radius,accent,.1,2);
    }
    if(g.hero.id==='lia'){
      const s=g.roster.lia as {shadow:{until:number}|null;hunt:unknown};
      if(liaStride&&!reduced&&(!attacking||movingBasic)){
        hero.y-=1.6*Math.sin(Math.PI*this.stridePhase/2)**2;
        hero.rotation+=.014*Math.sin(Math.PI*this.stridePhase/2);
      }
      hero.tint=0xbea6e4;
      if(s.shadow&&s.shadow.until>g.t||s.hunt){hero.alpha=.14;hero.casts=false}
    }
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
    const painted=this.assets.hasEffects(g.hero.id);
    if(drawHero)drawHero(this,g,painted);
    if(g.sea){
      if(!painted)for(const ally of g.sea.allies){const actor=this.image(ally,3,42);actor.tint=0x99e7ff;actor.alpha=.8}
      if(!painted)for(const copy of g.sea.images){const actor=this.image(copy,4,90);actor.tint=GOLD;actor.alpha=copy.t*.7}
      for(const s of g.sea.strikes)this.circle(this.floor,s.x,s.y,s.r,s.kind==='feather'?GOLD:JADE,.12,2);
    }
    const labels=this.terrain.labels;
    for(const e of g.enemies){
      if(e.dead)continue;
      if(isExposed(e)){
        if(this.cueNear(g,e,e.r)){
          const height=this.sprites.get(e)?.height??75;
          labels.show(e,'Exposed',e.x,e.y,height+6,{size:16,color:EXPOSED_INK},Math.max(1,.85/this.runtime.scale));
        }
        continue;
      }
      if(e.emberRunner){
        if(this.cueNear(g,e)){
          const carrying=(e.carry??0)>0;
          labels.show(e,carrying?'Carrying ember':'Ember runner',e.x,e.y,58,
            {size:14,color:carrying?'#ffd28b':'#ffe9c0'},Math.max(1,.85/this.runtime.scale));
        }
        continue;
      }
      if(e.windup&&e.monsterSkill){
        const {name,element}=e.monsterSkill;
        const ink=ELEMENTS[element];
        const height=regionalGhost(e.type)?.size??CLASSIC_SIZES[e.type]??75;
        const scale=Math.max(1,.8/this.runtime.scale);
        labels.show(e,ink.name+' · '+name,e.x,e.y,height+9,{size:14,color:ink.color},scale);
        continue;
      }
      if(e.routeGuard&&this.cueNear(g,e,e.r)){
        const monster=regionalGhost(e.type);
        if(monster)labels.show(e,monster.name,e.x,e.y,monster.size+8,{size:14,color:'#f5d3a6'},Math.max(1,.8/this.runtime.scale));
        continue;
      }
      const newcomer=NIGHT_FOES[e.type];
      if(newcomer&&!e.nightEcho){
        const range=Math.hypot(e.x-g.p.x,e.y-g.p.y);
        if(range<330&&range>65)labels.show(e,newcomer.name+(newcomer.skillName?' · '+newcomer.skillName:''),
          e.x,e.y,newcomer.size+7,{size:13,color:ELEMENTS[newcomer.element].color},Math.max(1,.8/this.runtime.scale));
        continue;
      }
      if(e.bossEscort||e.packId){
        const monster=e.bossEscort?BOSS_ESCORTS[e.type]:HUNTING_MONSTERS[e.type];
        const protecting=e===ward||activePackGuard(e);
        if(!protecting&&Math.hypot(e.x-g.p.x,e.y-g.p.y)<100)continue;
        const title=monster.name+(e===ward?' · Ward keeper':protecting?' · Guarding':'');
        labels.show(e,title,e.x,e.y,monster.size+8,
          {size:14,color:protecting?'#9af1d1':'#f5d3a6'},Math.max(1,.8/this.runtime.scale));
        continue;
      }
      if(!e.elite){
        if(e.encounter)labels.show(e,e.encounter==='rescue'?(g.encounters.rescue?.companion?'◆ Ambusher':'◆ Captor'):'◆',e.x,e.y,84,{size:15,color:'#ffdf86'});
        continue;
      }
      labels.show(e,(e.encounter?'◆ ':'')+(e.name?e.name+' · ':'')+e.elite+' '+(regionalGhost(e.type)?.name??e.type)+(e.windup?(e.type==='stalker'?' · CHARGE WARNING':' · CASTING'):''),
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
    this.tellAudio.finish(this.runtime.audio,!g.paused&&!g.choosing&&!g.lootModal&&!g.over);
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
    const depth=g.world.projectedDepth(x,y);
    const inView=(px:number,py:number,w:number,h:number)=>
      Math.abs(px-x)<=halfWidth+w&&Math.abs(g.world.projectedDepth(px,py)-depth)<=halfHeight+h;
    const animateScenery=!reducedMotion();
    actors.begin();
    if(!g.raid)for(const actor of this.terrain.scenery){
      if(inView(actor.x,actor.y,actor.width,actor.height)){
        actors.add(animateScenery?sceneryPose(actor,g.t):actor,actor.y,actor.motion!=='bob');
      }
    }
    for(const [source,actor] of this.sprites){
      if(!inView(actor.x,source.y,actor.width,actor.height))continue;
      actors.add(actor,source.y,actor.casts);
    }
    const hero=this.sprites.get(g.p);
    if(hero&&g.hero.id==='lia'){
      const angle=bladeWheelAngle(g,!animateScenery);
      if(angle!==null)drawBladeWheel(actors,this.assets,hero,g.p.y,angle);
      drawShadowstep(actors,this.assets,g,hero,reducedMotion());
      const s=g.roster.lia as {smoke:unknown;shadow:{x:number;y:number;until:number}|null};
      if(!s.smoke&&s.shadow&&s.shadow.until>g.t)actors.add({...hero,x:s.shadow.x,y:s.shadow.y,alpha:.32,tint:0x8f82dc},s.shadow.y,false);
    }
    const outlet=g.hero.id==='rempit'&&hero?bikeExhaust(hero):undefined;
    if(this.assets.hasEffects(g.hero.id)){
      const key='hero-effects-'+g.hero.id;
      drawPaintedEffects(g,reducedMotion(),s=>{
        const extent=Math.max(s.width,s.height);
        if(!inView(s.x,s.y,extent,extent+s.lift))return;
        this.paint.push(s);
      },outlet);
      // Transparent instances share a draw call. Lay the floor down first,
      // then blend airborne marks back to front using the same feet as actors.
      this.paint.sort((a,b)=>Number(b.ground)-Number(a.ground)||
        a.y-b.y+(g.world.elevationAt(a.x,a.y)-g.world.elevationAt(b.x,b.y))*Math.SQRT1_2);
      for(const s of this.paint){
        const flipX=Math.cos(s.angle)<0;
        actors.add({key,frame:this.assets.frame(key,s.frame),x:s.x,y:s.y-s.lift,width:s.width,height:s.height,
          ground:s.ground,originX:flipX?1-s.originX:s.originX,originY:.5,flipX,rotation:s.angle-(flipX?Math.PI:0),tint:0xffffff,alpha:s.alpha},s.y,false);
      }
    }
    actors.finish();
    this.terrain.draw(g,this.width,this.height,zoom,x,y,outlet,this.paint);
    this.paint.length=0;
    this.playerHealth.hidden=!hero||g.over||!this.width||!this.height;
    if(hero&&!this.playerHealth.hidden){
      this.shrineBuff.hidden=!g.shrineId;
      if(g.shrineId&&this.shrineBuff.dataset.shrine!==g.shrineId){
        const shrine=SHRINES[g.shrineId];
        this.shrineBuff.dataset.shrine=g.shrineId;
        this.shrineBuff.textContent=g.shrineId==='monsoon'?'':shrine.glyph;
        this.shrineBuff.style.color=shrine.color;
        this.shrineBuff.title=shrine.name+' Shrine · '+shrine.description;
      }
      const head=this.terrain.actorHead(hero,g.p.y);
      const fraction=THREE.MathUtils.clamp(g.p.hp/g.p.maxHp,0,1);
      this.playerHealth.style.setProperty('--health',String(fraction));
      this.playerHealth.style.transform=`translate3d(${head.x}px,${head.y-7}px,0) translate(-50%,-100%)`;
    }
  }
}
