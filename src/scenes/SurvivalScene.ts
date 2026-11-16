import {drawAsha} from './heroes/asha';
import {drawMira} from './heroes/mira';
import {drawDani} from './heroes/dani';
import {drawVanna} from './heroes/vanna';
import {drawKeo} from './heroes/keo';
import {drawNadi} from './heroes/nadi';
import {drawLia} from './heroes/lia';
import {OpenWorld} from './OpenWorld';
import {Weather} from './Weather';
import Phaser from 'phaser';
import {drawSkillEffect} from './skill-effects.js';
import {heroArt,rosterPortraitUrl} from '../content/hero-art.js';
import {ELITE_ATTACK_ANGLES} from '../content/encounters.js';
import { createRuntime, type GameRuntime, type RunState, type Point, type Effect } from '../game/runtime.js';

const HERO_FRAMES: Record<string, number> = {ustaz:0,rempit:1,nok:2,lan:3,sari:4};
const GHOST_FRAMES: Record<string, number> = {toyol:5,pocong:6,minyak:7,penanggal:8,pontianak:8,body:7,raya:9,shade:9};
const JADE=0x81e6ca,GOLD=0xf1c882,RED=0xf16b82;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

export class SurvivalScene extends Phaser.Scene {
  runtime!: GameRuntime;
  gameplayEnabled=true;
  private world!: OpenWorld;
  floor!: Phaser.GameObjects.Graphics;
  effects!: Phaser.GameObjects.Graphics;
  private screen!: Phaser.GameObjects.Graphics;
  private shadow!: Phaser.GameObjects.Image;
  weather!: Weather;
  private sprites=new Map<object,Phaser.GameObjects.Image>();
  private spareSprites: Phaser.GameObjects.Image[]=[];
  private labels=new Map<object,Phaser.GameObjects.Text>();
  private seen=new Set<object>();
  private previousRun: RunState | null=null;
  private wasRaid=false;
  private previousHp=0;
  private eliteLabelScale=1;
  private guide=document.getElementById('raidGuide')!;

  private preparedHero:string|null=null;
  private pendingHero:string|null=null;
  private pendingPreparation:Promise<void>|null=null;
  private prepareQueue:Promise<void>=Promise.resolve();
  private prepareVersion=0;
  private disposed=false;
  private cancelPreparation:(()=>void)|null=null;

  constructor(){super('Survival')}

  isHeroPrepared(id:string){
    return ['motion','skills'].every(kind=>this.textures.exists('hero-'+kind+'-'+id)&&this.textures.get('hero-'+kind+'-'+id).has('0'));
  }

  private releaseHeroArt(keep:Set<string>){
    for(const id of Object.keys(heroArt))if(!keep.has(id))for(const kind of ['motion','skills']){
      const key='hero-'+kind+'-'+id;
      if(this.textures.exists(key))this.textures.remove(key);
    }
  }

  private registerHeroFrames(id:string){
    const art=heroArt[id as keyof typeof heroArt];
    for(const kind of ['motion','skills'] as const){
      const texture=this.textures.get('hero-'+kind+'-'+id),image=texture.getSourceImage() as HTMLImageElement;
      for(let row=0;row<8;row++)for(let col=0;col<8;col++){
        const crop=art.frames?.[kind]?.[row*8+col];
        if(crop){texture.add(String(row*8+col),0,crop.x,crop.y,crop.w,crop.h);continue}
        const rows=kind==='motion'?art.rows:undefined;
        const x=Math.round(col*image.width/8),y=Math.round((rows?.[row]??row/8)*image.height);
        texture.add(String(row*8+col),0,x,y,Math.round((col+1)*image.width/8)-x,Math.round((rows?.[row+1]??(row+1)/8)*image.height)-y);
      }
    }
  }

  prepareHero(id:string):Promise<void>{
    if(!Object.hasOwn(heroArt,id))return Promise.reject(Error('Unknown hero artwork: '+id));
    if(this.disposed)return Promise.reject(Error('Scene is shut down'));
    if(this.pendingHero===id&&this.pendingPreparation)return this.pendingPreparation;
    const version=++this.prepareVersion;
    const request=this.prepareQueue.then(async()=>{
      if(this.disposed||version!==this.prepareVersion)throw Error('Hero selection superseded');
      const active=this.runtime?.G?.hero.id||this.preparedHero;
      this.releaseHeroArt(new Set(active?[active]:[]));
      if(!this.isHeroPrepared(id)){
        const art=heroArt[id as keyof typeof heroArt];
        await new Promise<void>((resolve,reject)=>{
          let failed=false;
          const finish=(error?:Error)=>{this.load.off('loaderror',onError);this.load.off('complete',onComplete);this.cancelPreparation=null;error?reject(error):resolve()};
          const onError=(file:Phaser.Loader.File)=>{if(file.key==='hero-motion-'+id||file.key==='hero-skills-'+id)failed=true};
          const onComplete=()=>finish(failed||['motion','skills'].some(kind=>!this.textures.exists('hero-'+kind+'-'+id))?Error('Hero artwork failed: '+id):undefined);
          this.cancelPreparation=()=>finish(Error('Scene is shut down'));
          this.load.on('loaderror',onError);this.load.once('complete',onComplete);
          for(const kind of ['motion','skills'] as const)if(!this.textures.exists('hero-'+kind+'-'+id))this.load.image('hero-'+kind+'-'+id,art[kind]);
          this.load.start();
        }).catch(error=>{
          this.releaseHeroArt(new Set(active?[active]:[]));throw error;
        });
        if(this.disposed||version!==this.prepareVersion){this.releaseHeroArt(new Set(active?[active]:[]));throw Error('Hero selection superseded')}
        this.registerHeroFrames(id);
      }
      this.preparedHero=id;
      this.releaseHeroArt(new Set([id,...(this.runtime?.G?[this.runtime.G.hero.id]:[])]));
    });
    this.pendingHero=id;this.pendingPreparation=request;
    this.prepareQueue=request.catch(()=>{});
    void request.finally(()=>{if(version===this.prepareVersion){this.pendingHero=null;this.pendingPreparation=null}}).catch(()=>{});
    return request;
  }

  preload(){
    this.load.image('roster-portraits',rosterPortraitUrl);
    this.load.image('hero-directions',new URL('../../assets/heroes-directions.png',import.meta.url).href);
    this.load.image('terrain',new URL('../../assets/world-terrain.png',import.meta.url).href);
    this.load.image('region-grass',new URL('../../assets/world-ground.png',import.meta.url).href);
    this.load.image('region-enemies',new URL('../../assets/region-enemies.png',import.meta.url).href);
    this.load.image('region-props',new URL('../../assets/region-props.png',import.meta.url).href);
    this.load.image('buildings',new URL('../../assets/kampung-buildings.png',import.meta.url).href);
    this.load.image('actors',new URL('../../assets/survivors-atlas.png',import.meta.url).href);
    this.load.on('loaderror',()=>{
      const start=document.getElementById('start') as HTMLButtonElement;
      start.textContent='Artwork failed to load. Reload to retry.';
    });
  }

  create(){
    if(!this.textures.exists('region-enemies')||!this.textures.exists('region-props')||!this.textures.exists('terrain')||!this.textures.exists('region-grass')||!this.textures.exists('buildings')||!this.textures.exists('actors')||!this.textures.exists('hero-directions'))return;
    this.game.canvas.id='game';this.game.canvas.tabIndex=0;
    this.game.canvas.setAttribute('aria-label','Game field. Move with WASD or arrow keys; Q, E, F, R cast skills; Escape pauses.');
    const sheet=this.textures.get('actors'),source=sheet.getSourceImage() as HTMLImageElement;
    // Generated atlas dimensions need not be divisible by four; round shared cell edges.
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const x=Math.round(col*source.width/4),y=Math.round(row*source.height/4);
      sheet.add(String(row*4+col),0,x,y,Math.round((col+1)*source.width/4)-x,Math.round((row+1)*source.height/4)-y);
    }
    const directions=this.textures.get('hero-directions'),art=directions.getSourceImage() as HTMLImageElement;
    for(let row=0;row<5;row++)for(let col=0;col<8;col++){
      const x=Math.round(col*art.width/8),y=Math.round(row*art.height/5);
      directions.add(String(row*8+col),0,x,y,Math.round((col+1)*art.width/8)-x,Math.round((row+1)*art.height/5)-y);
    }
    for(const key of ['region-enemies','region-props']){
      const atlas=this.textures.get(key),source=atlas.getSourceImage() as HTMLImageElement;
      for(let row=0;row<2;row++)for(let col=0;col<3;col++){const x=Math.round(col*source.width/3),y=Math.round(row*source.height/2);atlas.add(String(row*3+col),0,x,y,Math.round((col+1)*source.width/3)-x,Math.round((row+1)*source.height/2)-y)}
    }
    const terrain=this.textures.get('terrain'),terrainArt=terrain.getSourceImage() as HTMLImageElement;
    for(const [i,name]of ['grass','road','water','paddy','wood','stone'].entries()){
      const col=i%3,row=Math.floor(i/3),x=Math.round(col*terrainArt.width/3),y=Math.round(row*terrainArt.height/2);
      terrain.add(name,0,x,y,Math.round((col+1)*terrainArt.width/3)-x,Math.round((row+1)*terrainArt.height/2)-y);
    }
    if(!this.textures.exists('contact-shadow')){
      const texture=this.textures.createCanvas('contact-shadow',64,32)!;
      const ctx=texture.context;ctx.scale(1,.5);
      const gradient=ctx.createRadialGradient(32,32,0,32,32,32);
      gradient.addColorStop(0,'rgba(0,0,0,.8)');gradient.addColorStop(.5,'rgba(0,0,0,.3)');gradient.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);texture.refresh();
    }
    this.cameras.main.setBackgroundColor('#061517');
    this.world=new OpenWorld(this);
    this.floor=this.add.graphics().setDepth(-5000);
    this.effects=this.add.graphics().setDepth(20000);
    this.screen=this.add.graphics().setScrollFactor(0).setDepth(30000);
    this.shadow=this.add.image(0,0,'contact-shadow').setDisplaySize(38,12).setAlpha(.22).setDepth(-4500).setName('hero-contact-shadow').setVisible(false);
    this.weather=new Weather(this);
    this.runtime=createRuntime(this.game.canvas,{canPlay:()=>this.gameplayEnabled,prepareHero:id=>this.prepareHero(id),isHeroPrepared:id=>this.isHeroPrepared(id)});
    this.resize();
    this.scale.on('resize',this.resize,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.disposed=true;this.prepareVersion++;this.cancelPreparation?.();this.load.reset();
      this.runtime.destroy();
      this.releaseHeroArt(new Set());this.scale.off('resize',this.resize,this);
      this.sprites.clear();this.labels.clear();this.spareSprites=[];
      this.world.destroy();
    });
    if(import.meta.env.DEV)window.__asean=Object.assign(this.runtime,{scene:this,engine:'Phaser '+Phaser.VERSION});
  }

  private resize(){
    if(!this.runtime)return;
    this.eliteLabelScale=Number(getComputedStyle(document.documentElement).getPropertyValue('--elite-label-scale'))||1;
    this.runtime.resize(this.scale.width,this.scale.height);
    this.cameras.main.setZoom(this.runtime.scale);
  }

  private image(source: Point,frame: number,size: number,depth=source.y+10000){
    this.seen.add(source);
    let image=this.sprites.get(source);
    if(!image){
      image=this.spareSprites.pop()||this.add.image(0,0,'actors');
      this.sprites.set(source,image);
    }
    image.setVisible(true).setTexture('actors',String(frame)).setPosition(source.x,source.y)
      .setDisplaySize(size,size).setOrigin(.5,.72).setDepth(depth).setAlpha(1).setRotation(0).setFlipX(false).clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
    return image;
  }

  circle(g: Phaser.GameObjects.Graphics,x: number,y: number,r: number,color: number,alpha=.2,line=0){
    g.fillStyle(color,alpha).fillCircle(x,y,Math.max(0,r));
    if(line)g.lineStyle(line,color,Math.min(1,alpha*3)).strokeCircle(x,y,Math.max(0,r));
  }

  color(css?: string){return css?Phaser.Display.Color.ValueToColor(css).color:GOLD}

  private drawEffect(f: Effect){
    const alpha=Phaser.Math.Clamp(f.life/(f.max||.4),0,1),color=this.color(f.c||this.runtime.G?.hero.identity.color),g=this.effects;
    if(f.kind==='spell'){this.drawSpell(f,alpha,color);return}
    if(f.kind==='impact'){
      const r=(f.r||22)*(1.3-alpha*.7),a=f.a||0;
      for(let k=0;k<6;k++){
        const angle=a+k*Math.PI/3,x=f.x+Math.cos(angle)*r,y=f.y+Math.sin(angle)*r;
        g.lineStyle(7,color,alpha*.18).lineBetween(f.x,f.y,x,y);
        g.lineStyle(2,0xffffff,alpha).lineBetween(f.x,f.y,x,y);
      }
      this.circle(g,f.x,f.y,5*alpha,0xffffff,alpha);
    }else if(f.kind==='crack'||f.kind==='wave'){
      this.circle(this.floor,f.x,f.y,f.r||80,color,alpha*.06,2);
    }else if(f.kind==='ring'||f.kind==='spin'||f.kind==='burst'){
      g.lineStyle(3,color,alpha).strokeCircle(f.x,f.y,(f.r||40)*(1.1-alpha*.6));
      g.lineStyle(9,color,alpha*.12).strokeCircle(f.x,f.y,(f.r||40)*(1.1-alpha*.6));
    }else if(f.kind==='cone'||f.kind==='arc'){
      const radius=f.range||f.r||80,angle=f.a||0,half=f.half||.8;
      g.fillStyle(color,alpha*.25).beginPath().moveTo(f.x,f.y).arc(f.x,f.y,radius,angle-half,angle+half).closePath().fillPath();
      g.lineStyle(3,color,alpha).beginPath().arc(f.x,f.y,radius,angle-half,angle+half).strokePath();
    }else if(f.kind==='line'){
      const angle=f.a||0;g.lineStyle(f.w||5,color,alpha*.4).lineBetween(f.x,f.y,f.x+Math.cos(angle)*(f.len||100),f.y+Math.sin(angle)*(f.len||100));
    }else this.circle(g,f.x,f.y,(f.size||f.r||4)*(.5+alpha*.5),color,alpha*.7);
  }

  private drawSpell(f: Effect,_alpha: number,color: number){
    if(this.runtime.G)drawSkillEffect(f,this.floor,this.effects,this.runtime.G,color,reducedMotion());
  }

  private drawProjectile(q: RunState['projs'][number],color: number){
    const g=this.effects,a=q.kind==='spanner'||q.kind==='kris'?q.spin||0:Math.atan2(q.vy,q.vx);
    const dx=Math.cos(a),dy=Math.sin(a),x=q.x,y=q.y;
    this.circle(g,x,y,q.r+7,color,.1);
    if(q.kind==='spanner'){
      g.lineStyle(4,0xf1e4c9,1).lineBetween(x-dx*10,y-dy*10,x+dx*10,y+dy*10);
      g.lineStyle(3,color,1).strokeCircle(x+dx*10,y+dy*10,5).strokeCircle(x-dx*10,y-dy*10,4);
    }else if(q.kind==='kris'){
      g.fillStyle(0xffe7f8,1).fillTriangle(x+dx*19,y+dy*19,x-dx*10-dy*5,y-dy*10+dx*5,x-dx*10+dy*5,y-dy*10-dx*5);
      g.lineStyle(3,color,1).lineBetween(x-dx*8-dy*9,y-dy*8+dx*9,x-dx*8+dy*9,y-dy*8-dx*9);
    }else if(q.kind==='dragon'){
      for(let i=5;i>=0;i--){const bend=Math.sin((this.runtime.G?.t||0)*16-i*.7)*10;
        this.circle(g,x-dx*i*12-dy*bend,y-dy*i*12+dx*bend,Math.max(3,15-i*2),color,1-i*.13)}
      this.circle(g,x+dx*7-dy*6,y+dy*7+dx*6,3,0xffffff,1);
      this.circle(g,x+dx*7+dy*6,y+dy*7-dx*6,3,0xffffff,1);
    }else if(q.kind==='puppet'){
      g.lineStyle(2,color,.7).lineBetween(x-dx*25,y-dy*25,x,y);
      this.circle(g,x,y,9,color,.9);this.circle(g,x+dx*8,y+dy*8,5,0xe7ffff,1);
    }else{
      g.lineStyle(9,color,.15).lineBetween(x-dx*26,y-dy*26,x,y);
      g.lineStyle(3,color,.8).lineBetween(x-dx*20,y-dy*20,x,y);
      this.circle(g,x,y,q.r,0xfff7da,1);
    }
  }

  private drawRaid(g: RunState){
    const state=this.runtime.raid.state,arena=this.runtime.raid.ARENA;
    if(!state)return;
    if(g.raid){
      this.floor.fillStyle(0x171628,1).fillCircle(arena.x,arena.y,arena.r);
      this.floor.lineStyle(6,0x9572d0,.6).strokeCircle(arena.x,arena.y,arena.r);
      for(let r=100;r<arena.r;r+=100)this.floor.lineStyle(1,0x9572d0,.12).strokeCircle(arena.x,arena.y,r);
      for(const q of state.tele){
        const progress=1-Phaser.Math.Clamp(q.t/q.max,0,1);
        this.circle(this.floor,q.x,q.y,q.r,RED,.13,2);
        this.circle(this.floor,q.x,q.y,q.r*progress,RED,.25);
      }
      for(const q of state.spawns)this.circle(this.floor,q.x,q.y,34,0xbb8cfa,.3,2);
      if(state.lane){
        const l=state.lane,px=-l.dy*l.w,py=l.dx*l.w;
        this.floor.fillStyle(RED,.22).fillPoints([
          new Phaser.Math.Vector2(l.x+px,l.y+py),new Phaser.Math.Vector2(l.x+l.dx*l.len+px,l.y+l.dy*l.len+py),
          new Phaser.Math.Vector2(l.x+l.dx*l.len-px,l.y+l.dy*l.len-py),new Phaser.Math.Vector2(l.x-px,l.y-py)
        ],true);
      }
      if(state.eclipse){const e=state.eclipse;this.circle(this.floor,e.x,e.y,e.r,GOLD,.27,4)}
      if(state.orb)this.image(state.orb,15,55,20500).setTint(GOLD);
      this.guide.hidden=false;this.guide.textContent=state.eclipse?'✦ Eclipse incoming · stand in the gold circle':'HANTU RAYA · Avoid the red attack markers';
    }else if(state.portal){
      const p=state.portal;
      for(let r=0;r<3;r++)this.circle(this.effects,p.x,p.y,32+r*10+Math.sin(g.t*3+r)*3,0xb696fa,.08,2);
      this.circle(this.effects,p.x,p.y,20,JADE,.4);
      const distance=Math.hypot(p.x-g.p.x,p.y-g.p.y),angle=Math.atan2(p.y-g.p.y,p.x-g.p.x);
      const arrows=['→','↘','↓','↙','←','↖','↑','↗'];
      this.guide.hidden=false;this.guide.textContent=arrows[(Math.round(angle/(Math.PI/4))+8)%8]+' Spirit rift · '+Math.round(distance)+' m · '+Math.ceil(p.life)+'s';
    }else this.guide.hidden=true;
  }

  update(_time: number,delta: number){
    if(!this.runtime)return;
    this.runtime.step(delta);
    const g=this.runtime.G;
    this.weather.update(g);
    if(!g){
      this.shadow.setVisible(false);
      this.world.update(null);this.floor.clear();this.effects.clear();this.screen.clear();this.guide.hidden=true;
      for(const image of this.sprites.values())image.setVisible(false);
      for(const text of this.labels.values())text.setVisible(false);
      this.previousRun=null;return;
    }
    const fresh=g!==this.previousRun;
    if(fresh){this.previousRun=g;this.previousHp=g.p.hp;if(!reducedMotion())this.cameras.main.fadeIn(350,6,20,22)}
    if(fresh||!!g.raid!==this.wasRaid){
      this.wasRaid=!!g.raid;
      if(g.raid)this.cameras.main.removeBounds();else this.cameras.main.setBounds(-4000,-4000,8000,8000);
    }
    if(!this.pendingHero)this.releaseHeroArt(new Set([g.hero.id,...(this.preparedHero?[this.preparedHero]:[])]));
    this.world.update(g);
    this.seen.clear();this.floor.clear();this.effects.clear();this.screen.clear();
    this.drawRaid(g);
    if(!g.raid){
      for(const [x,y]of [[-280,-120],[300,170]])for(let i=0;i<4;i++)this.circle(this.floor,x,y,25+i*20,GOLD,.018);
      for(let i=0;i<28;i++){
        const x=Math.sin(i*127.1)*1000+Math.sin(g.t*.4+i)*18,y=Math.cos(i*311.7)*1000+Math.cos(g.t*.3+i)*12;
        const alpha=.2+Math.sin(g.t*1.3+i)*.15;
        this.circle(this.effects,x,y,8,JADE,alpha*.1);this.circle(this.effects,x,y,1.5,JADE,alpha);
      }
    }
    for(const z of g.zones){
      if(z.kind==='thorn'){
        const warning=z.max-z.life<.6;
        this.circle(this.floor,z.x,z.y,z.r,warning?0xffd98a:0xd58ad9,warning?.08:.32,3);
        for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;this.floor.lineStyle(2,warning?0xffd98a:0xe9b6e9,.9).lineBetween(z.x,z.y,z.x+Math.cos(angle)*25,z.y+Math.sin(angle)*25);}
        continue;
      }
      const alpha=Math.min(1,z.life/z.max*2);
      this.circle(this.floor,z.x,z.y,z.r,z.c?this.color(z.c):z.kind==='fire'?0xf69a4d:z.kind==='oil'?0x090f18:GOLD,alpha*(z.kind==='oil'?.7:.13),z.kind==='barrier'?2:0);
      if(z.kind==='fire')this.circle(this.floor,z.x,z.y,z.r*.6,0xffdf92,alpha*.12);
    }
    if(!g.raid)for(const site of g.world.landmarks)if(site.reward&&!g.exploration.claimed.includes(site.id)){
      this.floor.fillStyle(0xf1c882,.12).fillCircle(site.x,site.y,95);
      this.floor.lineStyle(3,0xf1c882,.6).strokeCircle(site.x,site.y,40);
      this.floor.fillStyle(0x9c7442).fillRoundedRect(site.x-22,site.y-16,44,32,5);
      this.floor.lineStyle(3,0xf1c882).strokeRect(site.x-22,site.y-16,44,32);
    }
    if(!g.raid)for(const event of Object.values(g.encounters||{}))if((event.track===undefined||event.track<2)&&(event.status==='active'||event.status==='available'&&event.discovered)){
      this.circle(this.floor,event.x,event.y,42,0xffbd77,.18,3);
      if(event.id==='ward'){
        this.floor.lineStyle(6,0x735d3f,1).lineBetween(event.x,event.y+20,event.x,event.y-55);
        this.floor.fillStyle(0xffbf62,1).fillRoundedRect(event.x-18,event.y-58,36,38,7);
        this.floor.lineStyle(3,0xffe1a8,1).strokeRoundedRect(event.x-18,event.y-58,36,38,7);
        this.floor.fillStyle(0x102c29,1).fillRect(event.x-40,event.y+28,80,7);
        this.floor.fillStyle(0x87ffb5,1).fillRect(event.x-40,event.y+28,80*(event.hp??300)/300,7);
      }else this.image(event,12,72).setTint(0xffd3a0);
    }
    for(const d of g.durians){this.circle(this.floor,d.x,d.y,50,RED,.12,1);this.image(d,13,35).setY(d.y-150*Math.max(0,d.t/1.4))}
    for(const gem of g.gems)this.image(gem,gem.kind==='coin'?14:15,gem.kind==='coin'?19:17).setOrigin(.5);
    for(const u of g.pups){
      this.circle(this.floor,u.x,u.y,25,GOLD,.14,1);
      this.image(u,15,42).setY(u.y-Math.abs(Math.sin(u.t*3))*5).setTint(u.type==='ketupat'?JADE:GOLD);
    }
    for(const m of g.marbles)this.circle(this.floor,m.x,m.y,4,0x9bdaf2,.9);
    for(const e of g.enemies){
      if(e.dead)continue;
      this.circle(this.floor,e.x,e.y+5,e.boss?e.r:14,0x000000,.3);
      const size=e.boss?Math.max(125,e.r*3):e.type==='shade'?55:e.type==='minyak'?84:67;
      const sprite=this.image(e,GHOST_FRAMES[e.type]??5,size);
      const regional=['stalker','lantern','sentinel','neon','drifter','watcher'].indexOf(e.type);
      if(regional>=0)sprite.setTexture('region-enemies',String(regional)).setDisplaySize(e.type==='sentinel'?90:78,78);
      if(e.elite){this.circle(this.floor,e.x,e.y,e.r+9,e.vulnerable?0x8ef4d0:e.elite==='Thornbound'?0xd58ad9:0xffbd77,.16,3);if(e.windup){const offsets=e.attack==='fan'||e.attack==='burst'?ELITE_ATTACK_ANGLES[e.attack]:ELITE_ATTACK_ANGLES.charge;for(const offset of offsets){const angle=(e.attackAngle??0)+offset*Math.PI/180;this.floor.lineStyle(2,0xffbd77,.9).lineBetween(e.x,e.y,e.x+Math.cos(angle)*190,e.y+Math.sin(angle)*190);}}}
      if(e.windup)this.circle(this.floor,e.x,e.y,e.type==='sentinel'?155:55,0xffb56d,.12,3);
      const moving=!g.paused&&!g.choosing&&!g.over;
      sprite.setRotation(reducedMotion()?0:Math.sin(g.t*7+e.phase)*.035);
      if(e.type==='pocong'&&moving)sprite.setY(e.y-Math.max(0,Math.sin(e.phase))*7);
      if(e.flash>0)sprite.setTint(0xffeee3).setTintMode(Phaser.TintModes.FILL);
      else if(e.stun>0)sprite.setTint(0x99c9fa);
      else if(e.p2)sprite.setTint(0xffb6ad);
      if(e.hp<e.maxHp){this.floor.fillStyle(0x021115,.85).fillRect(e.x-18,e.y+16,36,3);this.floor.fillStyle(e.boss?RED:0xd7a66b,1).fillRect(e.x-18,e.y+16,36*Math.max(0,e.hp/e.maxHp),3)}
    }
    const airborne=!!g.sea?.leap;
    this.shadow.setVisible(true).setPosition(g.p.x,g.p.y+2).setDisplaySize(airborne?29:38,airborne?9:12).setAlpha(airborne?.12:.22);
    const accent=this.color(g.hero.identity.color),identity=g.identity,charge=identity.charge/g.hero.identity.max;
    this.circle(this.floor,g.p.x,g.p.y,30,accent,.07,1);
    if(charge>0)this.floor.lineStyle(charge>=1?3:2,accent,.75).beginPath().arc(g.p.x,g.p.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*charge).strokePath();
    if(identity.releaseT>0){
      this.circle(this.floor,g.p.x,g.p.y,48+(1.2-identity.releaseT)*65,accent,identity.releaseT*.07,2);
      for(let k=0;k<6;k++){const a=k*Math.PI/3;this.effects.lineStyle(2,accent,identity.releaseT*.5).lineBetween(g.p.x+Math.cos(a)*40,g.p.y+Math.sin(a)*40,g.p.x+Math.cos(a)*65,g.p.y+Math.sin(a)*65)}
    }
    const art=heroArt[g.hero.id as keyof typeof heroArt];
    if(!art||!this.isHeroPrepared(g.hero.id))throw Error('Hero artwork not prepared: '+g.hero.id);
    const hero=this.image(g.p,HERO_FRAMES[g.hero.id]??15,g.hero.id==='rempit'?94:92);
    const attacking=identity.castT>0;
    const angle=attacking?identity.castAngle:Math.atan2(g.p.face[1],g.p.face[0]);
    const facing=(Math.round(angle/(Math.PI/4))+8)%8;
    const walking=!!g.p.moving;
    if(attacking&&identity.castSlot>0){
      const progress=1-identity.castT/identity.castMax;
      if(progress<.82)hero.setTexture('hero-skills-'+g.hero.id,String(((identity.castSlot-1)*2+(progress<.3?0:1))*8+facing));
      else hero.setTexture('hero-motion-'+g.hero.id,String(7*8+facing));
    }else if(attacking||walking){
      const row=attacking?4+Math.min(3,Math.floor((1-identity.castT/identity.castMax)*4)):Math.floor(g.t*10)%4;
      hero.setTexture('hero-motion-'+g.hero.id,String(row*8+facing));
    }else if(art.idleIndex!==undefined)hero.setTexture('hero-directions',String(art.idleIndex*8+facing));
    else hero.setTexture('hero-motion-'+g.hero.id,String((art.idleRow??7)*8+facing));
    const size=art.size;
    const crop=art.frames?.[hero.texture.key.startsWith('hero-skills-')?'skills':'motion']?.[Number(hero.frame.name)];
    if(crop){
      const source=hero.texture.getSourceImage() as HTMLImageElement;
      hero.setScale(size/(source.width/8)).setOrigin(crop.pivotX,crop.pivotY);
    }else hero.setDisplaySize(size,size*hero.frame.realHeight/hero.frame.realWidth).setOrigin(.5,attacking||walking?(art.originY??.95):(art.idleOriginY??.85));
    if(!reducedMotion()&&g.sea?.leap){const leap=g.sea.leap;hero.setY(hero.y-Math.sin(Math.PI*leap.t/leap.dur)*110)}
    if(g.sea?.leap)this.circle(this.floor,g.sea.leap.tx,g.sea.leap.ty,130,accent,.1,2);
    if(g.p.hurt>0)hero.setTint(0xffb9aa);
    if(g.p.shield>0)this.circle(this.effects,g.p.x,g.p.y-14,40,GOLD,.1,2);
    if(g.sea&&(g.sea.stance>0||g.sea.wai>0))this.circle(this.effects,g.p.x,g.p.y,45,g.sea.stance>0?0xf4aac8:GOLD,.12,2);
    this.cameras.main.centerOn(g.p.x,g.p.y);
    if(g.p.hp<this.previousHp&&!reducedMotion())this.cameras.main.flash(100,110,30,40);
    this.previousHp=g.p.hp;
    if(g.shake>3&&!this.cameras.main.shakeEffect.isRunning&&!reducedMotion())this.cameras.main.shake(70,Math.min(.008,g.shake*.0004));
    for(const q of g.projs)this.drawProjectile(q,accent);
    for(const q of g.eprojs){this.circle(this.effects,q.x,q.y,q.r+5,RED,.14);this.circle(this.effects,q.x,q.y,q.r,this.color(q.c||'#ffb7b9'),.95)}
    if(g.orbit){const o=g.orbit;for(let k=0;k<o.n;k++){const a=o.ang+k*Math.PI*2/o.n,r=o.rad*(o.holy?1.4:1);this.circle(this.effects,g.p.x+Math.cos(a)*r,g.p.y+Math.sin(a)*r,o.holy?10:7,GOLD,.9)}}
    for(const fx of g.fx)this.drawEffect(fx);
    const drawHero={asha:drawAsha,mira:drawMira,dani:drawDani,vanna:drawVanna,keo:drawKeo,nadi:drawNadi,lia:drawLia}[g.hero.id];
    drawHero?.(this,g);
    if(g.sea){
      for(const ally of g.sea.allies)this.image(ally,3,42,ally.y+10000).setTint(0x99e7ff).setAlpha(.8);
      for(const copy of g.sea.images)this.image(copy,4,90).setAlpha(copy.t*.7).setTint(GOLD);
      for(const s of g.sea.strikes){this.circle(this.floor,s.x,s.y,s.r,s.kind==='feather'?GOLD:JADE,.12,2);this.circle(this.effects,s.x,s.y-180*s.t/s.t0,8,s.kind==='feather'?GOLD:JADE,.8)}
      for(const fx of g.sea.fx)this.drawEffect({...fx,max:fx.max||.4});
    }
    const activeLabels=new Set<object>();
    for(const e of g.enemies)if(e.elite&&!e.dead){activeLabels.add(e);let label=this.labels.get(e);if(!label){label=this.add.text(e.x,e.y,'',{fontFamily:'Arial, sans-serif',fontSize:14,align:'center',color:'#ffe0af',stroke:'#18101c',strokeThickness:4}).setOrigin(.5).setDepth(25000);this.labels.set(e,label);}label.setVisible(true).setScale(this.eliteLabelScale*Math.max(1,1/this.cameras.main.zoom)).setPosition(e.x,e.y-(e.objective?115:75)).setText((e.name?e.name+' · ':'')+e.elite+' Palm Stalker'+(e.enraged||e.vulnerable||e.windup?'\n':'')+(e.enraged?'ENRAGED'+(e.vulnerable||e.windup?' · ':''):'')+(e.vulnerable?'VULNERABLE':e.windup?(e.attack||'charge').toUpperCase()+' WARNING':''));}
    for(const event of Object.values(g.encounters||{}))if(!g.raid&&(event.track===undefined||event.track<2)&&(event.status==='active'||event.status==='available'&&event.discovered)){activeLabels.add(event);let label=this.labels.get(event);if(!label){label=this.add.text(event.x,event.y,event.name,{fontFamily:'Arial, sans-serif',fontSize:16,color:'#ffe0af',stroke:'#18101c',strokeThickness:4}).setOrigin(.5).setDepth(25000);this.labels.set(event,label);}label.setVisible(true).setPosition(event.x,event.y-80).setText(event.name+(event.track!==undefined&&event.track<2?' · Track '+(event.track+1)+'/2':'')+(event.hp===undefined?'':` · ${event.hp} / 300 HP`));}
    for(const message of g.texts){
      activeLabels.add(message);let label=this.labels.get(message);
      if(!label){
        label=this.add.text(message.x,message.y,message.s,{fontFamily:message.kind?'Arial Black, Arial, sans-serif':'Chakra Petch, sans-serif',fontStyle:message.kind?'bold italic':'normal',fontSize:message.size,color:message.c,stroke:'#18101c',strokeThickness:message.kind?5:3,padding:{x:6,y:4}}).setOrigin(.5).setDepth(25000);
        if(message.kind)label.setShadow(2,3,'#000000',0,true,true).setData('combatKind',message.kind);
        this.labels.set(message,label);
      }
      const age=1-message.life/message.max,lane=message.lane||0,combat=!!message.kind;
      const lift=combat?(reducedMotion()?12:Math.sin(Math.min(1,age*1.25)*Math.PI*.7)*44):0;
      const x=message.x+(combat?lane*9+(reducedMotion()?0:lane*age*8):0),y=message.y-25-lift;
      const pop=combat&&!reducedMotion()?1+Math.sin(Math.min(1,age/.22)*Math.PI)*(message.kind==='critical'?.45:.22):1;
      label.setVisible(true).setPosition(x,y).setScale(pop).setAlpha(Math.min(1,message.life/message.max*3));
      if(message.kind==='critical'&&age<.4){
        const a=(1-age/.4)*.6;
        for(let k=0;k<8;k++){const angle=k*Math.PI/4,r=message.size*(.6+age);
          this.effects.lineStyle(3,0xffb74f,a).lineBetween(x+Math.cos(angle)*r*.6,y+Math.sin(angle)*r*.45,x+Math.cos(angle)*r,y+Math.sin(angle)*r*.7)}
      }
    }
    for(const [key,label]of this.labels)if(!activeLabels.has(key)){label.destroy();this.labels.delete(key)}
    for(const [key,image]of this.sprites)if(!this.seen.has(key)){image.setVisible(false);this.spareSprites.push(image);this.sprites.delete(key)}
    const joy=this.runtime.joystick;
    if(joy){
      const zoom=this.cameras.main.zoom;
      this.screen.lineStyle(2,0xffffff,.35).strokeCircle(joy.ox/zoom,joy.oy/zoom,55/zoom);
      const dx=joy.x-joy.ox,dy=joy.y-joy.oy,len=Math.min(55,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx);
      this.circle(this.screen,(joy.ox+Math.cos(angle)*len)/zoom,(joy.oy+Math.sin(angle)*len)/zoom,20/zoom,0xffffff,.25);
    }
  }
}
