import {circle,crossLane,lane,polygon} from './folklore-monsters.js';

/** @typedef {'physical'|'fire'|'water'|'lightning'|'spirit'} MonsterElement */
/** @typedef {{name:string,element:MonsterElement,range:number,windup:number,damage:number,cooldown?:number,lead?:number,brine?:number,lunge?:number,disrupt?:number,status?:string,blink?:boolean,shot?:{speed:number,damage:number,r:number,status?:string},
  marks:(enemy:{x:number,y:number},target:{x:number,y:number},angle:number)=>import('./folklore-monsters.js').FolkloreMark[]}} MonsterSkill */

const along=(point,angle,distance)=>({
  x:point.x+Math.cos(angle)*distance,
  y:point.y+Math.sin(angle)*distance
});

/** @type {Record<string, MonsterSkill>} */
export const MONSTER_SKILLS={
  stalker:{
    name:'Briar Rake',element:'physical',range:210,windup:.83,damage:11,
    marks:(e,p,a)=>[-.36,.36].map((turn,i)=>lane(e.x,e.y,a+turn,218,35,{delay:i*.4}))
  },
  lantern:{
    name:'Ember Spill',element:'fire',range:290,windup:.9,damage:12,
    marks:(e,p,a)=>[circle(p.x,p.y,50),...[-1,1].map(side=>{
      const q=along(p,a+side*1.19,83);
      return circle(q.x,q.y,35,.48);
    })]
  },
  neon:{
    name:'Livewire Cross',element:'lightning',range:265,windup:.8,damage:14,
    marks:(e,p,a)=>[crossLane(p.x,p.y,a,228,32),crossLane(p.x,p.y,a+Math.PI/2,228,32,.5)]
  },
  sentinel:{
    name:'Fault Coil',element:'lightning',range:235,windup:1.02,damage:16,
    marks:(e,p)=>[circle(p.x,p.y,43),circle(p.x,p.y,142,.58,72)]
  },
  drifter:{
    name:'Undertow',element:'water',range:245,windup:.91,damage:13,
    marks:(e,p,a)=>[polygon(p,a,[[-96,-46],[25,-48],[100,-15],[70,29],[-91,24]]),
      crossLane(p.x,p.y,a+Math.PI/2,216,35,.53)]
  },
  watcher:{
    name:'Scorched Furrows',element:'fire',range:315,windup:.94,damage:13,
    marks:(e,p,a)=>[-72,0,72].map((side,i)=>{
      const q=along(p,a+Math.PI/2,side);
      return crossLane(q.x,q.y,a+.21,218,39,i*.34);
    })
  },
  nipah:{
    name:'Root Snare',element:'physical',range:280,windup:.91,damage:13,
    marks:(e,p,a)=>[-1,1].map(side=>polygon(p,a,[[-92,11*side],[-35,60*side],[77,79*side],[25,33*side]],side>0?.36:0))
  },
  foam:{
    name:'Breakwater',element:'water',range:250,windup:.87,damage:14,
    marks:(e,p,a)=>[0,1,2].map(i=>{
      const q=along(p,a,88*(i-1));
      return crossLane(q.x,q.y,a+Math.PI/2,188-32*i,38,i*.35);
    })
  },
  kite:{
    name:'Cutting Strings',element:'lightning',range:285,windup:.93,damage:14,
    marks:(e,p,a)=>[0,1,2].map(i=>crossLane(p.x,p.y,a+i*Math.PI/3,224,27,i*.37))
  },
  mooring:{
    name:'Tide Knot',element:'water',range:265,windup:.94,damage:15,
    marks:(e,p,a)=>[circle(p.x,p.y,105,0,66),...[-1,1].map(side=>{
      const q=along(p,a+side*.82,112);
      return circle(q.x,q.y,42,.56);
    })]
  },
  pocong:{
    name:'Shroud Wake',element:'spirit',range:185,windup:.87,damage:10,cooldown:8,
    marks:(e,p,a)=>[72,165].map((distance,i)=>{
      const q=along(e,a,distance);
      return circle(q.x,q.y,37,i*.46);
    })
  },
  toyol:{
    name:'Ember Pounce',element:'fire',range:160,windup:.76,damage:9,cooldown:8.5,
    marks:(e,p,a)=>[polygon(p,a,[[-75,-22],[32,-31],[54,0],[32,31],[-75,22]])]
  },
  minyak:{
    name:'Slick Flare',element:'fire',range:200,windup:.98,damage:14,cooldown:8,
    marks:(e,p,a)=>[circle(e.x,e.y,112,0,53),crossLane(p.x,p.y,a,166,46,.53)]
  },
  penanggal:{
    name:'Spirit Fangs',element:'spirit',range:245,windup:.92,damage:12,cooldown:7.5,
    marks:(e,p,a)=>[-.37,.37].map(turn=>lane(e.x,e.y,a+turn,260,32))
  }
};

export const monsterSkill=type=>Object.hasOwn(MONSTER_SKILLS,type)?MONSTER_SKILLS[type]:undefined;
