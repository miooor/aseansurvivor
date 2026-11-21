import {circle,crossLane,lane,polygon} from './folklore-monsters.js';

export const NIGHT_ATLAS='malaysia-night-foes';
export const NIGHT_BUBBLE_RADIUS=145;
export const NIGHT_FADE_HEAL=.45;

/** @typedef {import('./monster-skills.js').MonsterElement} MonsterElement */
/** @typedef {{name:string,frame:number,element:MonsterElement,size:number,hp:number,spd:number,r:number,dmg:number,xp:number,
  hint:string,trait?:string,skillName?:string,skill?:import('./monster-skills.js').MonsterSkill}} NightFoe */

/** @returns {NightFoe} */
function foe(frame,name,element,hint,move){
  return {name,frame,element,hint,size:106,hp:76,spd:98,r:18,dmg:9,xp:6,...move};
}
const trait=(trait,skillName)=>({trait,skillName});
const area=(name,element,range,windup,damage,marks,options={})=>({skill:{name,element,range,windup,damage,marks,...options}});
const bolt=(name,element,speed,windup,damage,status,width)=>area(name,element,380,windup,0,
  (e,p,a)=>[lane(e.x,e.y,a,430,width)],{shot:{speed,damage,status,r:width*.34}});

/** @type {Record<string, NightFoe>} */
export const NIGHT_FOES={
  arangBara:foe(0,'Arang Bara','fire','Keep moving until the ember locks. Then leave its ring.',trait('ember','Runaway Ember')),
  gongJiwa:foe(1,'Gong Jiwa','spirit','Its last note can wake nearby fallen ghosts.',trait('revive','Last Peal')),
  bijihRetak:foe(2,'Bijih Retak','physical','Leave space for the two tin shards when it breaks.',trait('split','Tin Shatter')),
  kafanPenunggu:foe(3,'Kafan Penunggu','spirit','Give its final echo room until it fades.',trait('gasp','Last Vigil')),
  kantungRoh:foe(4,'Kantung Roh','spirit','Defeat the pitcher spirit before clearing its neighbours.',trait('souls','Ember Appetite')),
  pelitaHampa:foe(5,'Pelita Hampa','spirit','Keep clear of its extinguishing flash to hold your blessings.',
    area('Wick Snuff','spirit',190,.76,10,(e,p)=>[circle(e.x,e.y,205,0,42)],{status:'purge'})),
  musangKabut:foe(6,'Musang Kabut','spirit','Watch for the mist circle where the civet will appear.',
    area('Behind the Haze','spirit',300,.83,0,(e,p,a)=>[circle(p.x+Math.cos(a)*85,p.y+Math.sin(a)*85,36)],{blink:true,cooldown:5})),
  kepahBenteng:foe(7,'Kepah Benteng','water','Step inside its shell ring before striking.',trait('bubble','Shell Radius')),
  dulangHarta:foe(8,'Dulang Harta','physical','It carries an exclusive relic.',trait('treasure','Tin Cache')),
  getahMerah:foe(9,'Getah Merah','physical','Space out your attacks so the sap can wear off.',trait('blood','Clinging Sap')),
  ularBisa:foe(10,'Ular Bisa','spirit','Keep out of contact range to avoid its venom.',trait('venom','Venom Touch')),
  batikSumpah:foe(11,'Batik Sumpah','spirit','Leave the moving sequence of curse seals.',
    area('Batik Hexes','spirit',235,.86,6,(e,p,a)=>[0,1,2].map(i=>circle(p.x+Math.cos(a)*i*75,p.y+Math.sin(a)*i*75,38,i*.43)),{status:'hex'})),
  rotanJerut:foe(12,'Rotan Jerut','physical','Sidestep the rattan strip before it snares you.',
    area('Rattan Tether','physical',220,.75,9,(e,p,a)=>[crossLane(p.x,p.y,a,210,50)],{status:'snare'})),
  topengLayu:foe(13,'Topeng Layu','spirit','Dodge the pointed seal to keep your damage.',
    area('Withering Mask','spirit',236,.86,11,(e,p,a)=>[polygon(p,a,[[-68,0],[0,-51],[78,0],[0,51]])],{status:'frail'})),
  kulitDurian:foe(14,'Kulit Durian','physical','Elemental hits bypass its physical thorns.',trait('physicalThorns','Durian Spines')),
  kumbangPualam:foe(15,'Kumbang Pualam','physical','Physical hits bypass its elemental thorns.',trait('elementThorns','Prism Carapace')),
  guruhBukit:foe(16,'Guruh Bukit','lightning','Dodge between the three downbursts.',
    area('Hill Thunder','lightning',260,.86,14,(e,p,a)=>[0,1,2].map(i=>circle(
      p.x-Math.sin(a)*i*66,p.y+Math.cos(a)*i*66,46,i*.42)))),
  wauBulan:foe(17,'Wau Bulan','spirit','Sidestep the pale lane before the bolt flies.',
    bolt('Moon Needle','spirit',360,.64,14,undefined,24)),
  baraRimba:foe(18,'Bara Rimba','fire','Avoid the ember bolt to keep from burning.',
    bolt('Canopy Ember','fire',245,.8,12,'burn',33)),
  kabutCameron:foe(19,'Kabut Cameron','water','Dodge the highland frost bolt to keep your speed.',
    bolt('Highland Rime','water',285,.72,11,'chill',29)),
  berukKilat:foe(20,'Beruk Kilat','lightning','When a double reaches you, leave its lightning ring.',trait('mirage','Thunder Double'))
};

export const NIGHT_ROSTERS={
  johor:['arangBara','getahMerah','kepahBenteng','berukKilat'],
  melaka:['pelitaHampa','gongJiwa','kulitDurian','baraRimba'],
  kl:['musangKabut','kumbangPualam','batikSumpah','guruhBukit'],
  perak:['bijihRetak','kafanPenunggu','dulangHarta','kabutCameron'],
  penang:['kepahBenteng','pelitaHampa','wauBulan','topengLayu'],
  kedah:['kantungRoh','rotanJerut','kulitDurian','guruhBukit'],
  pahang:['ularBisa','getahMerah','kabutCameron','kumbangPualam'],
  terengganu:['rotanJerut','gongJiwa','baraRimba','kepahBenteng'],
  kelantan:['wauBulan','batikSumpah','kafanPenunggu','berukKilat'],
  selangor:['topengLayu','musangKabut','dulangHarta','guruhBukit']
};
