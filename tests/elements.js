// Elemental affinity, ailments, element HUD badges and the classic ghosts' skills.
// Johor fixtures: stalker is physical (neutral), drifter water, sentinel lightning, pocong spirit.
export function checkElements(w,check){
  const rt=w.__asean,doc=w.document;
  const start=hero=>{rt.newGame(hero,0);const g=rt.G;g.auto=false;g.spawnT=g.durianT=g.pupT=999;g.cds.fill(999);g.st.crit=0;return g};
  const foe=(g,type,x=200)=>{const e=rt.makeGhost(type,g.p.x+x,g.p.y);Object.assign(e,{hp:1000,maxHp:1000,spd:0,stun:999});return e};
  const dealt=(g,type,slot)=>{const e=foe(g,type);rt.hit(e,100,{slot});return 1000-e.hp};
  const near=(a,b)=>Math.abs(a-b)<1e-6;

  let g=start('sari');
  const neutral=dealt(g,'stalker',1);
  check('Lightning deals 1.5× to water monsters',near(dealt(g,'drifter',1),neutral*1.5));
  check('Lightning deals 0.75× to lightning monsters',near(dealt(g,'sentinel',1),neutral*.75));
  const charged=foe(g,'stalker');rt.hit(charged,100,{slot:1});
  check('Lightning shocks on a direct hit',charged.shockUntil>g.t);
  const first=1000-charged.hp;rt.hit(charged,100,{slot:1});
  check('Shocked monsters take 20% more damage',near(1000-charged.hp-first,first*1.2));
  const grounded=foe(g,'sentinel');rt.hit(grounded,100,{slot:1});
  check('A monster never suffers its own element ailment',!(grounded.shockUntil>g.t));

  g=start('rempit');
  const fireNeutral=dealt(g,'stalker',2);
  check('Fire deals 0.75× to water monsters',near(dealt(g,'drifter',2),fireNeutral*.75));
  check('A per-skill override makes Spanar physical',near(dealt(g,'drifter',0),dealt(g,'stalker',0)));
  const burning=foe(g,'stalker');rt.hit(burning,100,{slot:2});const hitDamage=1000-burning.hp;
  check('Fire burns on a direct hit',burning.burnT===2&&burning.burnRaw===true);
  for(let i=0;i<11;i++)rt.step(50);
  check('A burn tick carries its final damage without reapplying multipliers',near(1000-burning.hp-hitDamage,hitDamage*.2*.5));

  g=start('lan');
  const chilled=foe(g,'stalker');rt.hit(chilled,100,{slot:1});
  check('Water chills on a direct hit',chilled.slowT>0);

  g=start('ustaz');
  check('Spirit deals 1.25× to spirit ghosts',near(dealt(g,'pocong',2),dealt(g,'stalker',2)*1.25));
  const weakened=foe(g,'stalker');rt.hit(weakened,100,{slot:2});
  check('Spirit weakens on a direct hit',weakened.weakUntil>g.t);
  g.noElements=true;
  check('noElements isolates kit math from elements',near(dealt(g,'pocong',2),dealt(g,'stalker',2)));

  g=start('rempit');rt.scene.update(0,0);
  check('Skill buttons show each skill element',doc.querySelector('#sk2 .el')?.textContent==='🔥'&&doc.querySelector('#sk3 .el')?.textContent==='⚔');

  g=start('ustaz');g.p.invuln=0;
  const slammer=foe(g,'pocong',95);slammer.stun=0;slammer.slamT=.01;
  rt.step(50);
  check('Pocong telegraphs a ground slam',slammer.slamWind>0&&slammer.slamR===90);
  const hp=g.p.hp;for(let i=0;i<16;i++)rt.step(50);
  check('The slam lands on a hero inside its ring',g.p.hp<hp);
  const spitter=foe(g,'penanggal',220);spitter.stun=0;spitter.spitT=.01;
  rt.step(50);
  check('Penanggal spits an aimed bolt that remembers its owner',g.eprojs.some(q=>q.owner===spitter));
  rt.toMenu();
}
