import {TERRAIN_TEXTURES} from './terrain-paint';
import {heroArt} from '../content/hero-art.js';
import {HUNTING_ATLAS} from '../content/hunting-monsters.js';
import {BOSS_ESCORT_ATLAS} from '../content/boss-escorts.js';
import {WAVE_MONSTER_ATLAS} from '../content/wave-monsters.js';
import {NIGHT_ATLAS} from '../content/night-foes.js';
import {FOLKLORE_ATLAS,FOLKLORE_COMPANION_ATLAS,FOLKLORE_THIRD_ATLAS,FOLKLORE_FOURTH_ATLAS} from '../content/folklore-monsters.js';

export type Frame = {
  image: HTMLImageElement;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Actor = {
  x: number;
  y: number;
  key: string;
  frame: Frame;
  width: number;
  height: number;
  originX?: number;
  originY: number;
  rotation: number;
  tint: number;
  ground?: boolean;
  flash?: boolean;
  flipX?: boolean;
  alpha: number;
};

type Sheet = {image: HTMLImageElement; cols: number; rows: number; frames: Map<string, Frame>};
const terrainUrls=import.meta.glob<string>('../../assets/terrain/*.webp',{eager:true,query:'?url',import:'default'});
const effectUrls=import.meta.glob<string>('../../assets/hero-effect-sprites/*.webp',{eager:true,query:'?url',import:'default'});
const effectUrl=(id:string)=>effectUrls['../../assets/hero-effect-sprites/'+id+'.webp'];
const coreHeroes=Object.keys(heroArt).filter(id=>heroArt[id].idleIndex!==undefined);
const liaExtras={
  'lia-smoke':new URL('../../assets/lia-smoke.svg',import.meta.url).href,
  'lia-blade-wheel':new URL('../../assets/lia-blade-wheel.png',import.meta.url).href
};

export class SpriteAssets {
  private sheets=new Map<string,Sheet>();
  private pending=new Map<string,Promise<void>>();

  async load(key:string,url:string,cols=1,rows=1){
    if(this.sheets.has(key))return;
    const image=new Image();
    image.src=url;
    await image.decode();
    this.sheets.set(key,{image,cols,rows,frames:new Map()});
  }

  boot(){
    return Promise.all([
      this.load('actors',new URL('../../assets/survivors-atlas.png',import.meta.url).href,4,4),
      this.load('nok-flying-knee',new URL('../../assets/nok-flying-knee.webp',import.meta.url).href),
      this.load('hero-directions',new URL('../../assets/heroes-directions.png',import.meta.url).href,8,5),
      ...Array.from(TERRAIN_TEXTURES,key=>this.load(key,terrainUrls['../../assets/terrain/'+key+'.webp'])),
      this.load('rice-paddies',new URL('../../assets/malaysia-rice-paddies.webp',import.meta.url).href,2,2),
      this.load('river-current',new URL('../../assets/river-current.webp',import.meta.url).href),
      this.load('kampung-timber-bridge',new URL('../../assets/kampung-timber-bridge.webp',import.meta.url).href),
      this.load('malaysia-landmarks',new URL('../../assets/malaysia-landmarks.webp',import.meta.url).href,3,3),
      this.load('klang-warehouse',new URL('../../assets/klang-warehouse.webp',import.meta.url).href),
      this.load('mooring-wraith',new URL('../../assets/mooring-wraith.webp',import.meta.url).href,3,1),
      this.load('kampung-buildings',new URL('../../assets/kampung-buildings.png',import.meta.url).href,2,2),
      this.load('regional-foliage',new URL('../../assets/regional-foliage.webp',import.meta.url).href,4,3),
      this.load('region-props',new URL('../../assets/region-props.png',import.meta.url).href,3,2),
      this.load('stage-scene-props',new URL('../../assets/stage-scene-props.webp',import.meta.url).href,4,4),
      this.load('malaysia-scenery',new URL('../../assets/malaysia-scenery.webp',import.meta.url).href,3,3),
      this.load('malaysia-buildings',new URL('../../assets/malaysia-buildings.webp',import.meta.url).href,4,2),
      this.load('kl-buildings',new URL('../../assets/kl-buildings.webp',import.meta.url).href,3,2),
      this.load('raya-portal',new URL('../../assets/hantu-raya-portal.webp',import.meta.url).href),
      this.load('raya-lair',new URL('../../assets/hantu-raya-lair.webp',import.meta.url).href),
      this.load('briarback-thorns',new URL('../../assets/briarback-thorns.webp',import.meta.url).href,2,1),
      this.load('shrines',new URL('../../assets/shrines.webp',import.meta.url).href,7,3),
      this.load('campaign-pickups',new URL('../../assets/campaign-pickups.webp',import.meta.url).href,4,2),
      this.load('quest-props',new URL('../../assets/malaysia-quest-props.webp',import.meta.url).href,4,3),
      this.load('regional-workstations',new URL('../../assets/regional-workstations.webp',import.meta.url).href,2,1),
      this.load('regional-workers',new URL('../../assets/regional-workers.webp',import.meta.url).href,3,8),
      this.load(NIGHT_ATLAS,new URL('../../assets/malaysia-night-foes.webp',import.meta.url).href,4,6),
      this.load(WAVE_MONSTER_ATLAS,new URL('../../assets/malaysia-wave-monsters.webp',import.meta.url).href,4,4),
      this.load(BOSS_ESCORT_ATLAS,new URL('../../assets/malaysia-boss-escorts.webp',import.meta.url).href,4,4),
      this.load(HUNTING_ATLAS,new URL('../../assets/malaysia-hunting-monsters.webp',import.meta.url).href,4,4),
      this.load('classic-ghost-motion',new URL('../../assets/classic-ghost-motion.webp',import.meta.url).href,4,4),
      this.load('penanggal-pair',new URL('../../assets/penanggal-pair.webp',import.meta.url).href,2,1),
      this.load('traveller',new URL('../../assets/johor-traveller-motion.webp',import.meta.url).href,3,1),
      this.load('malaysia-monsters',new URL('../../assets/malaysia-monsters-motion.webp',import.meta.url).href,3,9),
      this.load(FOLKLORE_ATLAS,new URL('../../assets/malaysia-folklore.webp',import.meta.url).href,5,2),
      this.load(FOLKLORE_COMPANION_ATLAS,new URL('../../assets/malaysia-folklore-companion.webp',import.meta.url).href,3,3),
      this.load(FOLKLORE_THIRD_ATLAS,new URL('../../assets/malaysia-folklore-third.webp',import.meta.url).href,3,3),
      this.load(FOLKLORE_FOURTH_ATLAS,new URL('../../assets/malaysia-folklore-fourth.webp',import.meta.url).href,3,3),
      ...coreHeroes.map(id=>this.prepareHero(id))
    ]);
  }

  image(key:string){return this.sheets.get(key)!.image}

  frame(key:string,index:number):Frame{
    const {image,cols,rows,frames}=this.sheets.get(key)!;
    const name=String(index);
    const cached=frames.get(name);
    if(cached)return cached;
    const col=index%cols,row=Math.floor(index/cols);
    const x=Math.round(col*image.width/cols),y=Math.round(row*image.height/rows);
    const frame={image,name,x,y,width:Math.round((col+1)*image.width/cols)-x,height:Math.round((row+1)*image.height/rows)-y};
    frames.set(name,frame);
    return frame;
  }

  hasEffects(id:string){return this.sheets.has('hero-effects-'+id)}

  previewEffect(id:string,slot:number,beat:number){
    if(id==='dani'&&slot>0)return this.sheets.has('gold-sultan-preview')?this.frame('gold-sultan-preview',slot-1):undefined;
    if(this.hasEffects(id))return this.frame('hero-effects-'+id,slot*4+beat);
  }

  isHeroPrepared(id:string){
    return this.sheets.has('hero-motion-'+id)&&this.sheets.has('hero-skills-'+id)&&(id!=='lia'||Object.keys(liaExtras).every(key=>this.sheets.has(key)));
  }

  prepareHero(id:string):Promise<void>{
    const art=heroArt[id];
    if(!art)return Promise.reject(new Error('Unknown hero artwork: '+id));
    const pending=this.pending.get(id);
    if(pending)return pending;
    const request=Promise.allSettled([
      this.load('hero-motion-'+id,art.motion,8,8),
      this.load('hero-skills-'+id,art.skills,8,8),
      ...(id==='lia'?[Promise.all(Object.entries(liaExtras).map(([key,url])=>this.load(key,url)))]:[]),
      ...(effectUrl(id)?[this.load('hero-effects-'+id,effectUrl(id),4,5)]:[]),
      ...(id==='dani'?[this.load('gold-sultan-preview',new URL('../../assets/gold-sultan-preview.webp',import.meta.url).href,4,1)]:[])
    ]).then(([motion,skills,extra])=>{
      // The scene draws procedural effects when the optional sheet is absent.
      if(motion.status==='rejected')throw motion.reason;
      if(skills.status==='rejected')throw skills.reason;
      if(id==='lia'&&extra.status==='rejected')throw extra.reason;
    }).finally(()=>this.pending.delete(id));
    this.pending.set(id,request);
    return request;
  }

  retainHeroes(keep:Set<string>,release:(key:string)=>void){
    for(const id of Object.keys(heroArt)){
      if(keep.has(id)||this.pending.has(id))continue;
      const effectKey='hero-effects-'+id;
      release(effectKey);
      if(id==='lia')for(const key of Object.keys(liaExtras))if(this.sheets.delete(key))release(key);
      if(id==='dani')this.sheets.delete('gold-sultan-preview');
      if(coreHeroes.includes(id))continue;
      this.sheets.delete(effectKey);
      for(const kind of ['motion','skills']){
        const key='hero-'+kind+'-'+id;
        if(this.sheets.delete(key))release(key);
      }
    }
  }
}
