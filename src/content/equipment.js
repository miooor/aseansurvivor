export const ITEMS={
  splitEmber:{slot:'weapon',name:'Split Ember',description:'Every fourth successful basic cast fires two extra aimed bolts at ±15°, each for 40% of unmodified basic damage.'},
  quarryHammer:{damage:.2,speed:-.1,slot:'weapon',name:'Quarry Hammer',description:'+20% outgoing damage; −10% movement speed.'},
  riverNeedle:{damage:(g,e,o)=>e.slowT>0&&!o.dot?.25:0,slot:'weapon',name:'River Needle',description:'Direct, non-periodic hits against slowed enemies deal 25% more damage.'},
  huntersEdge:{damage:(g,e)=>e.elite||e.boss?.3:0,slot:'weapon',name:"Hunter’s Edge",description:'Deal 30% more damage to elites and bosses.'}
};
