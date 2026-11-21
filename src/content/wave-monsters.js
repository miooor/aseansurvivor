import {circle,lane,polygon} from './folklore-monsters.js';

export const WAVE_MONSTER_ATLAS='malaysia-wave-monsters';
export const ROLL_DAMAGE=.55;
export const UNCURLED_DAMAGE=1.3;
export const UNCURLED_TIME=1.15;
export const DISRUPTED_RECHARGE=.65;

/** @type {Record<string, {
  frame:number, size:number, name:string, hp:number, spd:number, r:number, dmg:number, xp:number, hint:string,
  skill:import('./monster-skills.js').MonsterSkill
}>} */
export const WAVE_MONSTERS={
  tenggilingRoller:{
    frame:0,size:112,name:'Tenggiling Roller',hp:82,spd:113,r:19,dmg:10,xp:6,
    hint:'Sidestep the roll and strike while its plates are open.',
    skill:{name:'Iron Roll',element:'physical',range:218,windup:.74,damage:13,cooldown:4.7,lunge:.45,
      marks:(e,p,a)=>[lane(e.x,e.y,a,246,46)]}
  },
  guaKelawar:{
    frame:4,size:106,name:'Gua Kelawar',hp:57,spd:118,r:15,dmg:8,xp:5,
    hint:'Step outside the screech fan to keep your skills recharging.',
    skill:{name:'Cave Screech',element:'spirit',range:195,windup:.78,damage:10,cooldown:4.9,disrupt:2.5,
      marks:(e,p,a)=>[polygon(e,a,[[15,-11],[174,-77],[212,-43],[212,43],[174,77],[15,11]])]}
  },
  biawakArus:{
    frame:8,size:117,name:'Biawak Arus',hp:86,spd:104,r:19,dmg:11,xp:6,
    hint:'The current returns on the same path. Wait for both passes.',
    skill:{name:'Ebb Current',element:'water',range:236,windup:.8,damage:13,cooldown:4.5,
      marks:(e,p,a)=>[
        lane(e.x,e.y,a,268,48),
        lane(e.x+Math.cos(a)*268,e.y+Math.sin(a)*268,a+Math.PI,268,63,{delay:.62,color:0xa7eff5})
      ]}
  },
  dusunBeruk:{
    frame:12,size:110,name:'Dusun Beruk',hp:68,spd:126,r:17,dmg:10,xp:5,
    hint:'Leave the first fruit’s circle, then watch the two bursts farther down your route.',
    skill:{name:'Orchard Volley',element:'fire',range:230,windup:.8,damage:12,cooldown:4.4,lead:.28,
      marks:(e,p,a)=>[
        circle(p.x,p.y,48),
        ...[-.56,.56].map(turn=>circle(p.x+Math.cos(a+turn)*100,p.y+Math.sin(a+turn)*100,41,.53))
      ]}
  }
};

const pangolin='tenggilingRoller',bat='guaKelawar',monitor='biawakArus',macaque='dusunBeruk';
const STAGE_PAIRS={
  johor:[pangolin,macaque],melaka:[monitor,macaque],kl:[bat,pangolin],perak:[bat,pangolin],
  penang:[monitor,bat],kedah:[macaque,pangolin],pahang:[macaque,monitor],
  terengganu:[monitor,pangolin],kelantan:[macaque,bat],selangor:[bat,monitor]
};

export const waveSpecialists=stage=>Object.fromEntries((STAGE_PAIRS[stage]??[]).map((type,index)=>[
  type,{at:index?42:18,weight:index?.48:.58}
]));
