// Explicit URLs let Vite and the Astrocade exporter discover every asset.
/** @type {Record<string,{motion:string,skills:string,idleIndex?:number,portraitIndex?:number,size:number}>} */
export const heroArt={
  ustaz:{motion:new URL('../../assets/ustaz-motion.png',import.meta.url).href,skills:new URL('../../assets/ustaz-skills.png',import.meta.url).href,idleIndex:0,size:197},
  rempit:{motion:new URL('../../assets/rempit-motion.png',import.meta.url).href,skills:new URL('../../assets/rempit-skills.png',import.meta.url).href,idleIndex:1,size:220},
  nok:{motion:new URL('../../assets/nok-motion.png',import.meta.url).href,skills:new URL('../../assets/nok-skills.png',import.meta.url).href,idleIndex:2,size:197},
  lan:{motion:new URL('../../assets/lan-motion.png',import.meta.url).href,skills:new URL('../../assets/lan-skills.png',import.meta.url).href,idleIndex:3,size:197},
  sari:{motion:new URL('../../assets/sari-motion.png',import.meta.url).href,skills:new URL('../../assets/sari-skills.png',import.meta.url).href,idleIndex:4,size:197},
  asha:{motion:new URL('../../assets/asha-motion.webp',import.meta.url).href,skills:new URL('../../assets/asha-skills.webp',import.meta.url).href,portraitIndex:0,size:192},
  mira:{motion:new URL('../../assets/pag-pag-motion.webp',import.meta.url).href,skills:new URL('../../assets/pag-pag-skills.webp',import.meta.url).href,portraitIndex:1,size:197},
  dani:{motion:new URL('../../assets/dani-motion.webp',import.meta.url).href,skills:new URL('../../assets/dani-skills.webp',import.meta.url).href,portraitIndex:2,size:205},
  vanna:{motion:new URL('../../assets/vanna-motion.webp',import.meta.url).href,skills:new URL('../../assets/vanna-skills.webp',import.meta.url).href,portraitIndex:3,size:197},
  keo:{motion:new URL('../../assets/keo-motion.webp',import.meta.url).href,skills:new URL('../../assets/keo-skills.webp',import.meta.url).href,portraitIndex:4,size:197},
  nadi:{motion:new URL('../../assets/nadi-motion.webp',import.meta.url).href,skills:new URL('../../assets/nadi-skills.webp',import.meta.url).href,portraitIndex:5,size:185},
  lia:{motion:new URL('../../assets/lia-motion.webp',import.meta.url).href,skills:new URL('../../assets/lia-skills.webp',import.meta.url).href,portraitIndex:6,size:197},
};

// Four-column menu atlas, cropped from the south-facing gameplay idle frame.
export function menuFrame(id){
  const art=heroArt[id];
  return art.idleIndex??5+art.portraitIndex;
}

export function menuPortraitPosition(frame){
  return (frame%4)*100/3+'% '+Math.floor(frame/4)*50+'%';
}

const flagCodes={
  Malaysia:'my',Thailand:'th',Vietnam:'vn',Indonesia:'id',Singapore:'sg',
  Philippines:'ph',Brunei:'bn',Cambodia:'kh',Laos:'la',Myanmar:'mm','Timor-Leste':'tl'
};

export function menuFlag(country){
  const code=flagCodes[country];
  return code ? 'url("'+new URL(`../../assets/flags/${code}.webp`,import.meta.url).href+'")' : 'none';
}
