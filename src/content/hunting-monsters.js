import {circle,crossLane,lane} from './folklore-monsters.js';

export const HUNTING_ATLAS='malaysia-hunting-monsters';
export const PACK_GUARD_RADIUS=156;
export const PACK_GUARD_MULTIPLIER=.65;
export const BRINE_SPEED=.72;

/** @type {Record<string, {
  frame:number,size:number,name:string,hp:number,spd:number,r:number,dmg:number,xp:number,hint:string,
  packSkill:import('./monster-skills.js').MonsterSkill
}>} */
export const HUNTING_MONSTERS={
  belangProwler:{
    frame:0,size:117,name:'Belang Prowler',hp:92,spd:169,r:20,dmg:13,xp:8,
    hint:'Change direction when the pounce lane locks.',
    packSkill:{
      name:'Cinder Pounce',element:'fire',range:305,windup:.66,damage:16,cooldown:3.8,lead:.44,lunge:.34,
      marks:(e,p,a)=>[lane(e.x,e.y,a,345,48)]
    }
  },
  bakauBelangkas:{
    frame:4,size:103,name:'Bakau Belangkas',hp:114,spd:79,r:21,dmg:11,xp:8,
    hint:'Skirt the blue pool. It slows you after the tide breaks.',
    packSkill:{
      name:'Breaking Tide',element:'water',range:272,windup:.86,damage:12,cooldown:5.4,brine:3,
      marks:(e,p)=>[circle(p.x,p.y,62)]
    }
  },
  limestoneSeladang:{
    frame:8,size:128,name:'Limestone Seladang',hp:144,spd:108,r:25,dmg:16,xp:10,
    hint:'Stun or defeat the gaur to expose its nearby packmates.',
    packSkill:{
      name:'Faultline',element:'physical',range:220,windup:.89,damage:19,cooldown:4.4,
      marks:(e,p,a)=>[lane(e.x,e.y,a,252,65),crossLane(p.x,p.y,a+Math.PI/2,180,40,.46)]
    }
  },
  enggangStormwing:{
    frame:12,size:122,name:'Enggang Stormwing',hp:83,spd:133,r:18,dmg:11,xp:8,
    hint:'Cross the first wing lane, then watch the second sweep.',
    packSkill:{
      name:'Wing Shear',element:'lightning',range:330,windup:.77,damage:14,cooldown:3.9,
      marks:(e,p,a)=>[-.7,.7].map((turn,i)=>crossLane(p.x,p.y,a+turn,280,38,i*.48))
    }
  }
};

const prowler='belangProwler',crab='bakauBelangkas',gaur='limestoneSeladang',hornbill='enggangStormwing';
export const HUNTING_PACKS={
  johor:[[prowler,gaur],[crab,prowler,hornbill],[gaur,prowler,hornbill]],
  melaka:[[crab,prowler],[prowler,gaur,crab],[crab,hornbill,gaur]],
  kl:[[prowler,hornbill],[hornbill,prowler,gaur],[prowler,crab,hornbill]],
  perak:[[gaur,prowler],[gaur,crab,hornbill],[prowler,gaur,hornbill]],
  penang:[[crab,hornbill],[crab,prowler,gaur],[hornbill,crab,prowler]],
  kedah:[[hornbill,gaur],[prowler,gaur,hornbill],[gaur,hornbill,crab]],
  pahang:[[prowler,crab],[crab,gaur,prowler],[prowler,hornbill,crab]],
  terengganu:[[crab,prowler],[hornbill,crab,gaur],[crab,prowler,hornbill]],
  kelantan:[[hornbill,prowler],[gaur,hornbill,prowler],[hornbill,crab,gaur]],
  selangor:[[crab,gaur],[crab,prowler,hornbill],[gaur,crab,prowler]]
};
