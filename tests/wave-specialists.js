import {STAGES,LEVEL_UP_HEAL} from '../src/content/core.js';
import {WAVE_MONSTERS,ROLL_DAMAGE,UNCURLED_DAMAGE} from '../src/content/wave-monsters.js';

export function checkWaveSpecialists(w,check){
  const rt=w.__asean;
  const start=index=>{
    rt.newGame('ustaz',index);
    const g=rt.G;
    g.auto=false;
    g.cds.fill(999);
    g.spawnT=g.durianT=g.pupT=999;
    g.noElements=true;
    g.st.crit=0;
    rt.raid.state.portalAt=Infinity;
    return g;
  };
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  for(const [index,stage] of STAGES.entries()){
    const g=start(index);
    const [first,second]=Object.keys(stage.waveSpecialists);
    const wave=clock=>{
      g.clock=clock;
      g.spawnT=0;
      const random=g.random;
      g.random=()=>.999;
      try{step();}finally{g.random=random;}
      g.spawnT=999;
    };
    wave(17.8);
    check(stage.name+' keeps wave specialists out of the opening',!g.enemies.some(e=>WAVE_MONSTERS[e.type]));
    wave(18);
    check(stage.name+' can draw its first regional specialist at 0:18',g.enemies.some(e=>e.type===first));
    wave(42);
    check(stage.name+' can draw its second regional specialist at 0:42',g.enemies.some(e=>e.type===second));
  }

  const g=start(0);
  const roller=rt.makeGhost('tenggilingRoller',186,0);
  Object.assign(roller,{spd:0,hp:1000,maxHp:1000,skillT:0});
  g.p.invuln=999;
  step();
  check('Pangolin roll telegraphs before committing',roller.windup>0&&!roller.rush);
  for(let i=0;i<24&&!roller.rush;i++)step();
  const damage=()=>{
    const before=roller.hp;
    rt.hit(roller,100,{slot:0});
    return before-roller.hp;
  };
  check('Rolling armor reduces damage',roller.rush>0&&Math.abs(damage()-100*ROLL_DAMAGE)<1e-7);
  roller.stun=.1;
  step();
  check('Interrupting the roll exposes the pangolin',!roller.rush&&roller.vulnerable>0&&
    Math.abs(damage()-100*UNCURLED_DAMAGE)<1e-7);
  step(30);
  check('The pangolin returns to normal defense after uncoiling',!roller.vulnerable&&damage()===100);

  const batHit=invulnerable=>{
    const g=start(0),e=rt.makeGhost('guaKelawar',120,0);
    Object.assign(e,{spd:0,skillT:0});
    g.cds.fill(20);
    g.p.invuln=invulnerable?999:0;
    step();
    for(let i=0;i<26&&e.windup>0;i++)step();
    return g;
  };
  const exposed=batHit(false);
  check('A damaging screech disrupts skill recharge',exposed.p.disruptedUntil>exposed.t);
  const [basic,spell]=exposed.cds;
  exposed.stop=0;
  step();
  check('Disruption slows skills while basic recharge continues',Math.abs(basic-exposed.cds[0]-.05)<1e-7&&
    spell-exposed.cds[1]>0&&spell-exposed.cds[1]<.05);
  exposed.t=exposed.p.disruptedUntil;
  const restored=exposed.cds[1];
  step();
  check('Normal recharge resumes when the screech expires',Math.abs(restored-exposed.cds[1]-.05)<1e-7);
  check('A blocked screech cannot disrupt recharge',!batHit(true).p.disruptedUntil);

  const currentHit=depart=>{
    const g=start(0),e=rt.makeGhost('biawakArus',185,0);
    Object.assign(e,{spd:0,skillT:0});
    step();
    for(let i=0;i<24&&e.windup>0;i++)step();
    const afterFirst=g.p.hp;
    if(depart)g.p.y+=75;
    for(let i=0;i<20&&!e.folkloreMarks?.[1]?.fired;i++)step();
    return {afterFirst,afterReturn:g.p.hp};
  };
  const still=currentHit(false),sidestep=currentHit(true);
  check('The returning current punishes standing in the lane again',still.afterReturn<still.afterFirst);
  check('Leaving the lane after the first pass avoids the return',sidestep.afterReturn===sidestep.afterFirst);
  const injured=start(0);
  injured.p.hp=Math.floor(injured.p.maxHp/4);
  const before=injured.p.hp;
  rt.addXP(injured.need);
  check('Level-up heals a quarter of maximum HP and queues a blessing',
    injured.p.hp===before+injured.p.maxHp*LEVEL_UP_HEAL&&injured.pending===1);
  injured.p.hp=injured.p.maxHp-1;
  rt.addXP(injured.need);
  check('Level-up healing caps at full health',injured.p.hp===injured.p.maxHp);
  rt.toMenu();
}
