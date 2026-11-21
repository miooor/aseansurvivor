import {STAGES} from './core.js';
import {HUNTING_MONSTERS} from './hunting-monsters.js';
import {BOSS_ESCORTS} from './boss-escorts.js';
import {WAVE_MONSTERS} from './wave-monsters.js';
import {NIGHT_FOES} from './night-foes.js';

// Elements: every hero deals one element, every monster family has one.
// Physical is untyped: no affinity, no ailment.
export const ELEMENTS={
  physical:{name:'Physical',glyph:'⚔',color:'#d9d2c3'},
  fire:{name:'Fire',glyph:'🔥',color:'#ff8a4c',ailment:'burn'},
  water:{name:'Water',glyph:'💧',color:'#6fc8ff',ailment:'chill'},
  lightning:{name:'Lightning',glyph:'⚡',color:'#ffe66b',ailment:'shock'},
  spirit:{name:'Spirit',glyph:'✦',color:'#c9a8ff',ailment:'weaken'}
};

// Per-hero defaults (one element per kit), from each hero's theme.
export const HERO_ELEMENTS={
  ustaz:'spirit',rempit:'fire',nok:'physical',lan:'water',sari:'lightning',asha:'lightning',
  dani:'fire',keo:'water',lia:'spirit',mira:'fire',nadi:'physical',vanna:'spirit'
};

// Skill overrides by slot (0 basic, 1 Q, 2 E, 3 F, 4 R) where a skill plainly isn't the hero's element.
export const SKILL_ELEMENTS={
  ustaz:{1:'fire'},                         // Cahaya Fajar burns
  rempit:{0:'physical',3:'physical'},       // Spanar, Hon Kuat
  nok:{1:'fire',4:'lightning'},             // Ember Flying Knee, Hanuman Skyfall
  sari:{0:'physical'},                      // Returning Kris
  dani:{0:'physical',2:'physical',3:'physical',4:'physical'}, // Gold Melting Flamethrower uses fire
  lia:{0:'physical',3:'physical'},          // Dusk Knife, Blade Wheel
  mira:{0:'physical'},                      // Wok Knuckle
  nadi:{2:'spirit',4:'spirit'},              // Hand of Buddha, Buddha’s Refuge
  vanna:{1:'physical'}                      // Ribbon Cut
};

// Regional and folklore monsters take their home stage's element; the classic ghosts are spirits.
const STAGE_ELEMENTS={
  johor:'physical',melaka:'water',kl:'fire',perak:'lightning',penang:'water',
  kedah:'fire',pahang:'water',terengganu:'water',kelantan:'lightning',selangor:'lightning'
};
const SPIRITS=['pocong','toyol','penanggal','body','minyak','pontianak'];
const MONSTER_ELEMENTS={};
for(const S of STAGES){
  const element=STAGE_ELEMENTS[S.id]??'physical';
  for(const type of [...Object.keys(S.ghosts??{}),...(Array.isArray(S.folklore)?S.folklore:Object.keys(S.folklore??{})),S.boss?.type])MONSTER_ELEMENTS[type]??=element;
}
for(const type of SPIRITS)MONSTER_ELEMENTS[type]='spirit';
for(const [type,{packSkill}] of Object.entries(HUNTING_MONSTERS))MONSTER_ELEMENTS[type]=packSkill.element;
for(const [type,{skill}] of Object.entries({...BOSS_ESCORTS,...WAVE_MONSTERS}))MONSTER_ELEMENTS[type]=skill.element;
for(const [type,{element}] of Object.entries(NIGHT_FOES))MONSTER_ELEMENTS[type]=element;
export const skillElement=(hero,slot)=>SKILL_ELEMENTS[hero]?.[slot]??HERO_ELEMENTS[hero]??'physical';
/** @param {string} type @returns {keyof typeof ELEMENTS} */
export const monsterElement=type=>MONSTER_ELEMENTS[type]??'physical';

// Damage taken by a monster of element (key) from each damage element. Missing pairs are 1×.
// Kept mild: resists cost 25%, and spirits (on every stage) only take a 1.25× bonus.
// Cycle: water quenches fire, lightning conducts through water, fire burns out lightning;
// spirits are banished by spirit and shrug off lightning.
const AFFINITY={
  fire:{water:1.5,fire:.75},
  water:{lightning:1.5,fire:.75},
  lightning:{fire:1.5,lightning:.75},
  spirit:{spirit:1.25,lightning:.85}
};
export const elementAffinity=(defender,damage)=>AFFINITY[defender]?.[damage]??1;
export const affinity=(type,damage)=>elementAffinity(monsterElement(type),damage);
