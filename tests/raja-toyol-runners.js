export function checkRajaToyolRunners(w,check){
  const rt=w.__asean;
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  const start=()=>{
    rt.newGame('ustaz',0);
    const g=rt.G;
    g.clock=180;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;
    g.noElements=true;g.st.crit=0;g.p.invuln=999;
    rt.raid.state.portalAt=Infinity;
    for(const id of Object.keys(g.stage.folklore))g.events.add('arrival:'+id);
    g.events.add('ring1');g.events.add('ring2');
    step();
    const boss=g.boss;
    Object.assign(boss,{x:200,y:0,stun:999,hp:boss.maxHp*.5001});
    g.stop=0;step(15);
    return g;
  };
  const runners=g=>g.enemies.filter(e=>!e.dead&&e.emberRunner);
  const g=start(),boss=g.boss;
  check('Raja Toyol begins with the ward and no ember runners',boss.wardEscort&&!runners(g).length);
  boss.hp=boss.maxHp*.5;
  step(15);
  const pair=runners(g);
  check('Exactly two identifiable Toyol join at half HP',pair.length===2&&
    pair.every(e=>e.type==='toyol'&&g.world.walkable(e.x,e.y,e.r)));
  if(pair.length===2){
    const [first,second]=pair;
    const ember={x:150,y:0,v:11,kind:'ember',mag:false};
    const coin={x:125,y:0,v:7,kind:'coin',mag:false};
    g.gems.push(ember,coin);
    Object.assign(first,{x:120,y:0,stun:0});
    Object.assign(second,{x:220,y:0,stun:999});
    const origin=first.x;
    step(15);
    check('A runner actively approaches an ember and takes it without taking the nearer coin',
      first.carry===11&&!g.gems.includes(ember)&&g.gems.includes(coin)&&first.x>origin);
    const before=first.x;
    step(4);
    check('A loaded runner flees away from the player',first.flee>0&&first.x>before);
    const ground=()=>g.gems.filter(gem=>!gem.got&&gem.kind!=='coin').reduce((xp,gem)=>xp+gem.v,0);
    const expected=ground()+11+first.xp;
    rt.kill(first);rt.kill(first);
    check('Catching a runner returns exactly the carried XP once',ground()===expected&&first.carry===0);
    check('The half-health pair does not respawn after killing a runner',runners(g).length===1);

    const secondEmber={x:245,y:0,v:13,kind:'ember',mag:false};
    g.gems.push(secondEmber);
    Object.assign(second,{x:245,y:0,stun:0,scan:0});
    step();
    check('The surviving runner can carry a separate ember',second.carry===13);
    const victoryXP=ground()+13+150;
    rt.kill(boss);rt.kill(boss);
    check('Victory cleanup returns every held ember exactly once',g.won&&second.dead&&second.carry===0&&
      ground()===victoryXP&&g.gems.includes(coin));
  }
  const expiry=start();
  expiry.boss.hp=expiry.boss.maxHp*.5;
  step(15);
  const [runner,other]=runners(expiry);
  check('A fresh boss fight can enter the runner phase again',!!runner&&!!other);
  if(runner&&other){
    const ember={x:245,y:0,v:7,kind:'ember',mag:false};
    expiry.gems.push(ember);
    Object.assign(runner,{x:245,y:0,stun:0,scan:0});
    Object.assign(other,{stun:999});
    step();
    check('The expiry fixture starts with an actual seven-XP theft',runner.carry===7&&!expiry.gems.includes(ember));
    runner.flee=.01;
    step(35);
    check('An escaping runner drops exactly its load and expires without replacements',
      runner.dead&&runner.carry===0&&runners(expiry).length===1&&
      expiry.gems.length===1&&expiry.gems[0].v===7&&expiry.gems[0].kind==='ember');
  }
  expiry.boss.stun=0;
  for(let i=0;i<4;i++){
    expiry.boss.bt=0;
    step();
  }
  check('Repeated calls for ordinary Toyol stay at four live summons',
    expiry.enemies.filter(e=>!e.dead&&e.bossSummon).length===4);
  rt.toMenu();
}
