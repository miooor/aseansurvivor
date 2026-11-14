export const ITEMS={
  thornEcho:{slot:'relic',name:'Thorn Echo',description:'Every third successful Q/E/F cast releases a radius-120 pulse for 30 damage with normal outgoing modifiers.'},
  bountySeal:{slot:'relic',name:'Bounty Seal',description:'When your damage kills an elite, heal 15 HP and gain 10 percentage points of ultimate charge.'},
  aftershockBell:{damage:g=>g.itemState.aftershockBell>g.t?.25:0,slot:'relic',name:'Aftershock Bell',description:'After a successful ultimate cast, gain +25% outgoing damage for five seconds; refreshes without stacking.'},
  lastLantern:{slot:'relic',name:'Last Lantern',description:'Once per run, lethal damage leaves you at 1 HP and grants two seconds of invulnerability.'},
  splitEmber:{slot:'weapon',name:'Split Ember',description:'Every fourth successful basic cast fires two extra aimed bolts at ±15°, each for 40% of unmodified basic damage.'},
  quarryHammer:{damage:.2,speed:-.1,slot:'weapon',name:'Quarry Hammer',description:'+20% outgoing damage; −10% movement speed.'},
  riverNeedle:{damage:(g,e,o)=>e.slowT>0&&!o.dot?.25:0,slot:'weapon',name:'River Needle',description:'Direct, non-periodic hits against slowed enemies deal 25% more damage.'},
  huntersEdge:{damage:(g,e)=>e.elite||e.boss?.3:0,slot:'weapon',name:"Hunter’s Edge",description:'Deal 30% more damage to elites and bosses.'}
};
