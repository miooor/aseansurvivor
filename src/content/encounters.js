import {REGIONAL_QUESTS} from './regional-quests.js';

export const ENCOUNTERS={
  hunt:{name:'Thorn Hunt',landmark:'grove',x:-1800,y:1400,slot:'relic',description:'Investigate two tracks, then defeat Briarback, a Thornbound Palm Stalker. Beware its thorn patches. Reward: choose one relic.'},
  ward:{name:'Lantern Ward',landmark:'fields',x:-1700,y:-1350,slot:'charm',description:'Protect a 300-HP lantern through three waves of 4, 6 and 8 enemies. Final wave: Armoured Palm Stalker. Reward: choose one charm.'},
  rescue:{name:'Trapped Traveller',landmark:'market',x:2400,y:1300,slot:'weapon',description:'Defeat six captors, including an Armoured Palm Stalker, then free the traveller and escort them through an ambush to the market bridge. Reward: choose one weapon.'}
};

export function stageDestinations(stageId){
  if(stageId==='johor')return Object.entries(ENCOUNTERS).map(([id,event])=>({id,...event}));
  const quest=REGIONAL_QUESTS[stageId];
  return quest?[quest]:[];
}
