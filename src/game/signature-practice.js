// Prompts are derived afresh so expiry, missed casts and retries show a valid next action.
const lessons={
  ustaz:g=>g.identity.charge<4?'Stay near a ghost while four automatic attacks gather light.':'Press F to raise your healing sanctuary.',
  rempit:g=>g.identity.charge<100?'Keep moving until Redline reaches 100. Circle the clearing.':'Press Q to spend Redline on a burning dash.',
  nok:g=>g.identity.charge===0?'Press Q to start Rhythm.':g.identity.charge===1?'Use a different Q, E or F within six seconds.':'Finish with a different Q, E or F before Rhythm expires.',
  lan:g=>g.identity.charge>=100?'Press E to summon the empowered troupe.':g.enemies.some(e=>e.slowT>0)?'Aim Q through the slowed ghosts. Basic hits also build Tide.':'Press F near the ghosts to slow them. Repeat until Tide fills.',
  sari:g=>g.identity.charge?'Press Q before the four-second riposte window closes.':g.sea.stance?'Let the approaching ghost touch your guard.':'Press F as the ghost approaches to guard its attack.',
  asha:g=>g.identity.ready?'Press E near the charged ghost to cash out its chope.':g.roster.asha.tickets.length?'Stay within basic range until a chope is charged.':'Aim at the ghost ahead and press Q to chope it.',
  mira:g=>g.identity.ready?'Press E to serve your portions and vent the stove.':'Aim the lid through the ghosts and press Q to fill the pot.',
  dani:g=>g.roster.dani.rain?'Wait for the coins to land.':'Press F to automatically rain coins on the practice ghosts.',
  vanna:()=>'Press F near a ghost to see the silk familiar circle you and strike it.',
  keo:g=>g.identity.ready?'Cast another available Q, E or F now for the timing bonus.':g.roster.keo.last!==null&&g.t-g.roster.keo.last<1.5?'Wait for the measure to open at 1.5 seconds.':'Cast an available Q, E or F to start a measure.',
  nadi:g=>g.identity.ready?'Aim at the ghost and press E to release Perfect Recall.':'Press Q near the ghost to build Recall with critical palms.',
  lia:()=>'Aim at the ghost and press E to vanish and backstab in one Shadowstep.'
};

export const hasPractice=id=>Object.hasOwn(lessons,id);
// Completion keeps the lesson running so players can repeat the signature.
export const practicePrompt=g=>(g.practice.complete?g.hero.identity.name+' released. Keep practising. ':'')+lessons[g.hero.id](g);

export function placePracticeTargets(g,makeGhost){
  const id=g.hero.id;
  const positions=id==='dani'?[[50,0],[70,0],[90,0],[110,0],[130,0],[95,20]]:id==='lan'?[[65,0],[98,0],[130,0],[160,0],[190,0],[100,30]]:[[id==='asha'?220:id==='sari'?55:id==='nadi'?85:120,0]];
  for(const [x,y] of positions){
    const target=makeGhost('toyol',x,y);
    target.spd=id==='sari'?65:0;
    target.dmg=id==='sari'?1:0;
    target.hp=target.maxHp=1e7;
  }
}
