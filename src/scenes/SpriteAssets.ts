import {heroArt} from '../content/hero-art.js';
import {FOLKLORE_ATLAS,FOLKLORE_COMPANION_ATLAS,FOLKLORE_THIRD_ATLAS} from '../content/folklore-monsters.js';

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
const effectUrls=import.meta.glob<string>('../../assets/hero-effect-sprites/*.webp',{eager:true,query:'?url',import:'default'});
const effectUrl=(id:string)=>effectUrls['../../assets/hero-effect-sprites/'+id+'.webp'];
const coreHeroes=Object.keys(heroArt).filter(id=>heroArt[id].idleIndex!==undefined);

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
      this.load('hero-directions',new URL('../../assets/heroes-directions.png',import.meta.url).href,8,5),
      this.load('malaysia-ground',new URL('../../assets/malaysia-ground.webp',import.meta.url).href),
      this.load('rice-paddies',new URL('../../assets/malaysia-rice-paddies.webp',import.meta.url).href,2,2),
      this.load('terrain-materials',new URL('../../assets/malaysia-terrain-materials.webp',import.meta.url).href),
      this.load('malaysia-landmarks',new URL('../../assets/malaysia-landmarks.webp',import.meta.url).href,3,3),
      this.load('kampung-buildings',new URL('../../assets/kampung-buildings.png',import.meta.url).href,2,2),
      this.load('region-props',new URL('../../assets/region-props.png',import.meta.url).href,3,2),
      this.load('malaysia-scenery',new URL('../../assets/malaysia-scenery.webp',import.meta.url).href,3,3),
      this.load('malaysia-buildings',new URL('../../assets/malaysia-buildings.webp',import.meta.url).href,4,2),
      this.load('kl-buildings',new URL('../../assets/kl-buildings.webp',import.meta.url).href,3,2),
      this.load('raya-portal',new URL('../../assets/hantu-raya-portal.webp',import.meta.url).href),
      this.load('raya-lair',new URL('../../assets/hantu-raya-lair.webp',import.meta.url).href),
      this.load('briarback-thorns',new URL('../../assets/briarback-thorns.webp',import.meta.url).href,2,1),
      this.load('campaign-pickups',new URL('../../assets/campaign-pickups.webp',import.meta.url).href,4,2),
      this.load('quest-props',new URL('../../assets/malaysia-quest-props.webp',import.meta.url).href,4,3),
      this.load('regional-workstations',new URL('../../assets/regional-workstations.webp',import.meta.url).href,2,1),
      this.load('regional-workers',new URL('../../assets/regional-workers.webp',import.meta.url).href,3,8),
      this.load('penanggal-pair',new URL('../../assets/penanggal-pair.webp',import.meta.url).href,2,1),
      this.load('traveller',new URL('../../assets/johor-traveller-motion.webp',import.meta.url).href,3,1),
      this.load('malaysia-monsters',new URL('../../assets/malaysia-monsters-motion.webp',import.meta.url).href,3,9),
      this.load(FOLKLORE_ATLAS,new URL('../../assets/malaysia-folklore.webp',import.meta.url).href,5,2),
      this.load(FOLKLORE_COMPANION_ATLAS,new URL('../../assets/malaysia-folklore-companion.webp',import.meta.url).href,3,3),
      this.load(FOLKLORE_THIRD_ATLAS,new URL('../../assets/malaysia-folklore-third.webp',import.meta.url).href,3,3),
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

  isHeroPrepared(id:string){
    return this.sheets.has('hero-motion-'+id)&&this.sheets.has('hero-skills-'+id);
  }

  prepareHero(id:string):Promise<void>{
    const art=heroArt[id];
    if(!art)return Promise.reject(new Error('Unknown hero artwork: '+id));
    const pending=this.pending.get(id);
    if(pending)return pending;
    const request=Promise.allSettled([
      this.load('hero-motion-'+id,art.motion,8,8),
      this.load('hero-skills-'+id,art.skills,8,8),
      ...(effectUrl(id)?[this.load('hero-effects-'+id,effectUrl(id),4,5)]:[])
    ]).then(([motion,skills])=>{
      // The scene draws procedural effects when the optional sheet is absent.
      if(motion.status==='rejected')throw motion.reason;
      if(skills.status==='rejected')throw skills.reason;
    }).finally(()=>this.pending.delete(id));
    this.pending.set(id,request);
    return request;
  }

  retainHeroes(keep:Set<string>,release:(key:string)=>void){
    for(const id of Object.keys(heroArt)){
      if(keep.has(id)||this.pending.has(id))continue;
      const effectKey='hero-effects-'+id;
      release(effectKey);
      if(coreHeroes.includes(id))continue;
      this.sheets.delete(effectKey);
      for(const kind of ['motion','skills']){
        const key='hero-'+kind+'-'+id;
        if(this.sheets.delete(key))release(key);
      }
    }
  }
}
