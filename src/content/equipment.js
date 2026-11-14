export const ITEMS={
  stillwaterBeads:{damage:g=>{const s=g.itemState.stillwaterBeads;return s?.ready&&s.raid===g.raid&&!g.sea?.leap&&!s.leaping&&Math.hypot(g.p.x-s.x,g.p.y-s.y)<=30?.2:0;},slot:'charm',name:'Stillwater Beads',description:'Stay within 30 units for two seconds: +20% outgoing damage until you leave. Teleports, leap landings and raid transitions reset it.'},
  reedGuard:{slot:'charm',name:'Reed Guard',description:'Take 20% less damage while hindered by enemy oil. Equipment speed penalties do not qualify.'},
  lanternHeart:{health:40,slot:'charm',name:'Lantern Heart',description:'+40 maximum HP; restore 2 HP per second after five seconds without taking damage.'},
  travellersKnot:{speed:.12,slot:'charm',name:"Traveller’s Knot",description:'+12% movement speed.'},
  splitEmber:{slot:'weapon',name:'Split Ember',description:'Every fourth successful basic cast fires two extra aimed bolts at ±15°, each for 40% of unmodified basic damage.'},
  quarryHammer:{damage:.2,speed:-.1,slot:'weapon',name:'Quarry Hammer',description:'+20% outgoing damage; −10% movement speed.'},
  riverNeedle:{damage:(g,e,o)=>e.slowT>0&&!o.dot?.25:0,slot:'weapon',name:'River Needle',description:'Direct, non-periodic hits against slowed enemies deal 25% more damage.'},
  huntersEdge:{damage:(g,e)=>e.elite||e.boss?.3:0,slot:'weapon',name:"Hunter’s Edge",description:'Deal 30% more damage to elites and bosses.'}
};
