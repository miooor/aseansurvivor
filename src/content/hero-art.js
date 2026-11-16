import {rosterFrames} from './roster-frames.js';
import {animationRows} from './animation-layouts.js';
// Explicit URLs let Vite and the Astrocade exporter discover every asset.
export const rosterPortraitUrl=new URL('../../assets/roster-portraits.webp',import.meta.url).href;
/** @type {Record<string,{motion:string,skills:string,rows?:number[],idleIndex?:number,idleRow?:number,portraitIndex?:number,size:number,originY:number,idleOriginY:number,frames?:{motion:{x:number,y:number,w:number,h:number,pivotX:number,pivotY:number}[],skills:{x:number,y:number,w:number,h:number,pivotX:number,pivotY:number}[]}}>} */
export const heroArt={
  ustaz:{originY:.95,idleOriginY:.85,motion:new URL('../../assets/ustaz-motion.png',import.meta.url).href,skills:new URL('../../assets/ustaz-skills.png',import.meta.url).href,idleIndex:0,rows:animationRows.ustaz,size:104},
  rempit:{originY:.95,idleOriginY:.85,motion:new URL('../../assets/rempit-motion.png',import.meta.url).href,skills:new URL('../../assets/rempit-skills.png',import.meta.url).href,idleIndex:1,rows:animationRows.rempit,size:110},
  nok:{originY:.95,idleOriginY:.85,motion:new URL('../../assets/nok-motion.png',import.meta.url).href,skills:new URL('../../assets/nok-skills.png',import.meta.url).href,idleIndex:2,rows:animationRows.nok,size:104},
  lan:{originY:.95,idleOriginY:.85,motion:new URL('../../assets/lan-motion.png',import.meta.url).href,skills:new URL('../../assets/lan-skills.png',import.meta.url).href,idleIndex:3,rows:animationRows.lan,size:104},
  sari:{originY:.95,idleOriginY:.85,motion:new URL('../../assets/sari-motion.png',import.meta.url).href,skills:new URL('../../assets/sari-skills.png',import.meta.url).href,idleIndex:4,rows:animationRows.sari,size:104},
  asha:{frames:rosterFrames.asha,originY:.99,idleOriginY:.99,motion:new URL('../../assets/asha-motion.webp',import.meta.url).href,skills:new URL('../../assets/asha-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:0,rows:animationRows.asha,size:104},
  mira:{frames:rosterFrames.mira,originY:.99,idleOriginY:.99,motion:new URL('../../assets/mira-motion.webp',import.meta.url).href,skills:new URL('../../assets/mira-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:1,rows:animationRows.mira,size:104},
  dani:{frames:rosterFrames.dani,originY:.99,idleOriginY:.99,motion:new URL('../../assets/dani-motion.webp',import.meta.url).href,skills:new URL('../../assets/dani-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:2,rows:animationRows.dani,size:104},
  vanna:{frames:rosterFrames.vanna,originY:.99,idleOriginY:.99,motion:new URL('../../assets/vanna-motion.webp',import.meta.url).href,skills:new URL('../../assets/vanna-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:3,rows:animationRows.vanna,size:104},
  keo:{frames:rosterFrames.keo,originY:.99,idleOriginY:.99,motion:new URL('../../assets/keo-motion.webp',import.meta.url).href,skills:new URL('../../assets/keo-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:4,rows:animationRows.keo,size:104},
  nadi:{frames:rosterFrames.nadi,originY:.99,idleOriginY:.99,motion:new URL('../../assets/nadi-motion.webp',import.meta.url).href,skills:new URL('../../assets/nadi-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:5,rows:animationRows.nadi,size:104},
  lia:{frames:rosterFrames.lia,originY:.99,idleOriginY:.99,motion:new URL('../../assets/lia-motion.webp',import.meta.url).href,skills:new URL('../../assets/lia-skills.webp',import.meta.url).href,idleRow:7,portraitIndex:6,rows:animationRows.lia,size:104},
};
