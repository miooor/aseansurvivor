import {circle,crossLane,lane,polygon} from './folklore-monsters.js';

export const BOSS_ESCORT_ATLAS='malaysia-boss-escorts';
export const BOSS_WARD_DAMAGE=.55;
export const BOSS_WARD_RANGE=224;

/** @type {Record<string, {
  frame:number,size:number,name:string,hp:number,spd:number,r:number,dmg:number,xp:number,hint:string,
  skill:import('./monster-skills.js').MonsterSkill
}>} */
export const BOSS_ESCORTS={
  kompangHusk:{
    frame:0,size:114,name:'Kompang Husk',hp:125,spd:106,r:20,dmg:11,xp:9,
    hint:'The outer beat lands first. Move out of the center before the second.',
    skill:{name:'Rolling Thunder',element:'lightning',range:235,windup:.9,damage:15,cooldown:4.2,
      marks:(e,p)=>[circle(p.x,p.y,139,0,76),circle(p.x,p.y,56,.68)]}
  },
  bubuSnapjaw:{
    frame:4,size:116,name:'Bubu Snapjaw',hp:113,spd:114,r:20,dmg:12,xp:9,
    hint:'Run out the open end of the bamboo jaws.',
    skill:{name:'Closing Weave',element:'water',range:260,windup:.86,damage:15,cooldown:4.1,
      marks:(e,p,a)=>[
        polygon(p,a,[[-96,-95],[74,-88],[94,-56],[-52,-38]]),
        polygon(p,a,[[-96,95],[-52,38],[94,56],[74,88]]),
        crossLane(p.x,p.y,a,180,49,.52)
      ]}
  },
  getahBinder:{
    frame:8,size:126,name:'Getah Binder',hp:136,spd:108,r:22,dmg:13,xp:10,
    hint:'The tapping marks travel toward you. Cross the row instead of following it.',
    skill:{name:'Tapping Trail',element:'spirit',range:270,windup:.88,damage:16,cooldown:4.3,
      marks:(e,p,a)=>[-98,0,98].map((forward,i)=>circle(
        p.x+Math.cos(a)*forward,p.y+Math.sin(a)*forward,42,i*.43
      ))}
  },
  becaRevenant:{
    frame:12,size:123,name:'Beca Revenant',hp:98,spd:146,r:20,dmg:13,xp:9,
    hint:'Dodge the wheel tracks sideways and watch for the sparks at the far end.',
    skill:{name:'Hot Lap',element:'fire',range:248,windup:.79,damage:16,cooldown:3.9,lunge:.27,
      marks:(e,p,a)=>[
        lane(e.x,e.y,a,263,52),
        circle(e.x+Math.cos(a+.24)*243,e.y+Math.sin(a+.24)*243,42,.48),
        circle(e.x+Math.cos(a-.24)*243,e.y+Math.sin(a-.24)*243,42,.48)
      ]}
  }
};

const drum='kompangHusk',trap='bubuSnapjaw',rubber='getahBinder',trishaw='becaRevenant';
// The first monster in the opening pair keeps the ward.
export const BOSS_LINEUPS={
  johor:[[rubber,drum],[trap,trishaw]],
  melaka:[[trishaw,trap],[drum,rubber]],
  kl:[[trishaw,drum],[rubber,trap]],
  perak:[[rubber,trishaw],[drum,trap]],
  penang:[[trap,trishaw],[trishaw,drum]],
  kedah:[[drum,rubber],[trap,rubber]],
  pahang:[[rubber,trap],[trap,drum]],
  terengganu:[[trap,drum],[rubber,trap]],
  kelantan:[[drum,trap],[trishaw,rubber]],
  selangor:[[trap,rubber],[drum,trishaw]]
};
