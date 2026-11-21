export function checkJohorRhythm(w,check){
  const rt=w.__asean;
  const start=stage=>{
    rt.newGame('ustaz',stage);
    const g=rt.G;
    g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;
    g.noElements=true;g.st.crit=0;g.p.invuln=999;
    rt.raid.state.portalAt=Infinity;
    for(const id of Object.keys(g.stage.folklore))g.events.add('arrival:'+id);
    g.events.add('regionalElite');
    g.events.add('regionalElite-1');
    return g;
  };
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  const g=start(0);
  const at=clock=>{g.t+=clock-g.clock;g.clock=clock;step()};
  at(58);
  const pack=g.enemies.filter(e=>e.packId);
  check('Johor opens the pursuit beat with the first hunting pack at 0:58',pack.length===2&&
    !g.enemies.some(e=>e.type==='arangBara'));
  for(const e of pack)e.stun=999;
  at(69);
  const arang=g.enemies.find(e=>e.type==='arangBara');
  check('Johor follows pursuit with one Arang Bara at 1:09',!!arang);
  if(arang){
    rt.hit(arang,9999,{element:'physical'});
    const hazard=g.nightHazards[0];
    const reward=g.gems.find(gem=>gem.kind==='ember'&&gem.x===arang.x&&gem.y===arang.y);
    check('Death ember warns at the position of its recoverable XP',hazard?.kind==='ember'&&!!reward&&
      hazard.x===reward.x&&hazard.y===reward.y);
    if(hazard&&reward){
      const {x,y}=hazard;
      const challenger=rt.makeGhost('stalker',150,0);
      Object.assign(challenger,{skillT:0,spd:0});
      Object.assign(g.p,{x,y});
      step(4);
      check('The death ember holds position and defers new major warnings and its own XP collection',
        hazard.x===x&&hazard.y===y&&!challenger.windup&&!reward.mag&&g.gems.includes(reward));
      Object.assign(g.p,{x:0,y:0});
      step(35);
      check('After the blast, the player can return for the same XP',!g.nightHazards.length&&g.gems.includes(reward));
      Object.assign(g.p,{x,y});
      step(2);
      check('Returning to the extinguished ember collects the drop',!g.gems.includes(reward));
      challenger.dead=true;
      if(g.choosing)w.document.querySelector('#choices button')?.click();
    }
  }
  at(75);
  check('Johor staggers the Pocong surround beyond the ember beat',!g.events.has('ring1'));
  at(82);
  const horde=g.enemies.length;
  g.spawnT=0;g.durianT=0;
  step();
  check('Breathing room still spawns the ordinary horde while holding the durian tell',
    g.enemies.length>horde&&!g.durians.length);
  at(87);
  check('The Pocong surround returns at 1:27 when the previous threats have cleared',g.events.has('ring1'));
  at(180);
  check('Johor still spawns Raja Toyol at 3:00',g.boss?.name==='Raja Toyol');
  const delayed=start(0);
  delayed.clock=69;step();
  check('A late hunting pack gets its own pursuit lead before Arang Bara',
    delayed.enemies.filter(e=>e.packId).length===2&&!delayed.events.has('johor:arang'));
  for(const e of delayed.enemies)e.stun=999;
  delayed.clock=74;step();
  check('A delayed Arang Bara can enter once pursuit has had its lead',delayed.events.has('johor:arang'));

  const overlap=start(0);
  overlap.clock=75;
  const stalker=rt.makeGhost('stalker',150,0);
  Object.assign(stalker,{windup:.65,castMax:.65,attackAngle:Math.PI});
  rt.hit(rt.makeGhost('arangBara',230,0),9999,{element:'physical'});
  const queued=overlap.nightHazards[0];
  step();
  check('An existing major attack finishes before the death ember countdown begins',
    queued?.waiting&&queued.t===queued.max);
  stalker.dead=true;
  step();
  check('The queued death ember starts once the previous threat clears',
    !queued.waiting&&queued.t<queued.max);
  const other=start(1);
  other.clock=75;step();
  check('Melaka keeps the original 1:15 Pocong surround',other.events.has('ring1'));
  rt.toMenu();
}
