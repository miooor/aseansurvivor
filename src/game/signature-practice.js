// Prompts are derived afresh so expiry, missed casts and retries show a valid next action.
const lessons={
  ustaz:g=>g.identity.charge<4?'Stay near a ghost while four automatic attacks gather light.':'Press F to raise your healing sanctuary.',
  rempit:g=>g.identity.charge<100?'Keep moving until Redline reaches 100. Circle the clearing.':'Press Q to spend Redline on a burning dash.',
  nok:g=>g.identity.charge===0?'Press Q to start Rhythm.':g.identity.charge===1?'Use a different Q, E or F within six seconds.':'Finish with a different Q, E or F before Rhythm expires.',
  lan:g=>g.identity.charge>=100?'Press E to summon the empowered troupe.':g.enemies.some(e=>e.slowT>0)?'Aim Q through the slowed ghosts. Basic hits also build Tide.':'Press F near the ghosts to slow them. Repeat until Tide fills.',
  sari:g=>g.identity.charge?'Press Q before the four-second riposte window closes.':g.sea.stance?'Let the approaching ghost touch your guard.':'Press F as the ghost approaches to guard its attack.',
  asha:g=>g.identity.ready?'Press E near the served ghost to collect its ticket.':g.roster.asha.tickets.length?'Stay within basic range until a ticket is served.':'Aim at the ghost ahead and press Q to give it a ticket.',
  mira:g=>g.identity.ready?'Press E now for your empowered Harbour Sweep.':'Aim at the ghost and press Q to hook it into reach.',
  dani:g=>g.identity.ready?'Press F to secure the landing and gain a shield.':g.roster.dani.anchor?.ready?'Walk back to within 70 units of your anchor.':g.roster.dani.anchor?'Walk 160 units away from the anchor.':'Press E to leave a landing anchor.',
  vanna:g=>g.identity.ready?'Press F to detonate the crossing.':g.roster.vanna.q?'Keep the same aim and press E to cross the first strip.':'Press Q to lay the first strip.',
  keo:g=>g.identity.ready?'Cast another available Q, E or F now for the timing bonus.':g.roster.keo.last!==null&&g.t-g.roster.keo.last<1.5?'Wait for the measure to open at 1.5 seconds.':'Cast an available Q, E or F to start a measure.',
  nadi:g=>g.identity.ready?'Press Q within 400 units to release the mature coat.':g.roster.nadi.layers.length?'Wait two seconds for the coat to mature, or cure it with F.':'Press E to lay a coat.',
  lia:g=>g.identity.ready?'Press E to spend your Spool on a stronger dash.':'Walk sideways near the ghost to intercept a returning basic shuttle.'
};

export const hasPractice=id=>Object.hasOwn(lessons,id);
export const practicePrompt=g=>g.practice.complete?g.hero.identity.name+' released.':lessons[g.hero.id](g);

export function placePracticeTargets(g,makeGhost){
  const id=g.hero.id;
  const positions=id==='lan'?[[65,0],[98,0],[130,0],[160,0],[190,0],[100,30]]:[[id==='asha'?220:id==='sari'?55:120,0]];
  for(const [x,y] of positions){
    const target=makeGhost('toyol',x,y);
    target.spd=id==='sari'?65:0;
    target.dmg=id==='sari'?1:0;
    target.hp=target.maxHp=1e7;
  }
}
