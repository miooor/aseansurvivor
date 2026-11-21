import {STAGES} from '../src/content/core.js';
import {ROUTE_CHALLENGES} from '../src/content/route-challenges.js';

export async function checkVeteranRuns(w,check){
  const rt=w.__asean,$=id=>w.document.getElementById(id);
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  const quiet=g=>{
    g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;
    rt.raid.state.portalAt=Infinity;
  };
  for(const [index,stage] of STAGES.entries()){
    rt.newGame('ustaz',index,false,{seed:712});
    const g=rt.G,route=ROUTE_CHALLENGES[stage.id];
    quiet(g);step();
    check(stage.name+' standard run opens without the veteran pack',!g.routeChallenge.started);
    Object.assign(g.p,route.entry);g.clock=10;step();
    check(stage.name+' route encounter activates at its authored approach',g.routeChallenge.enemies.length===route.posts.length);
    rt.newGame('ustaz',index,false,{veteran:true,seed:712});
    const veteran=rt.G;quiet(veteran);step();
    check(stage.name+' veteran starts at the encounter with a hunting pair and reinforced guards',
      veteran.p.x===route.entry.x&&veteran.p.y===route.entry.y&&veteran.routeChallenge.enemies.length===route.posts.length+2&&
      veteran.routeChallenge.enemies.filter(e=>e.packId===-1).length===2&&
      veteran.routeChallenge.enemies[0].maxHp>g.routeChallenge.enemies[0].maxHp);
  }

  const kedah=STAGES.findIndex(stage=>stage.id==='kedah');
  rt.newGame('ustaz',kedah);
  const g=rt.G;quiet(g);g.clock=10;Object.assign(g.p,ROUTE_CHALLENGES.kedah.entry);step(36);
  check('Kedah guard releases actual slow water on the crossing',g.zones.some(zone=>zone.kind==='monster-brine'&&zone.x===1480));
  Object.assign(g.p,{x:1660,y:490,invuln:0});
  g.p.hp=g.p.maxHp;step(40);
  check('The Paddy Watcher damages the detour when its lane resolves',g.recap.damage.skills>0&&g.recap.sources.has('Paddy Watcher'));

  const store=w.localStorage,key='aseanSurvivor.v1',saved=store.getItem(key);
  try{
    const legacy=JSON.stringify({coins:0,owned:['ustaz'],cleared:[],heroUpgrades:{ustaz:{vitality:2}}});
    store.setItem(key,legacy);
    rt.newGame('ustaz',0,false,{veteran:true,seed:7,autoMode:4});
    quiet(rt.G);step();
    await rt.endGame(true);
    check('A clear with living challenge enemies earns no veteran medal',
      !JSON.parse(store.getItem(key)).veteranMedals.length&&!$('recapMedal').textContent.includes('earned'));
    store.setItem(key,legacy);
    rt.newGame('ustaz',0,false,{veteran:true,seed:7,autoMode:4});
    const run=rt.G;quiet(run);step();
    const firstWave=()=>rt.G.routeChallenge.enemies.map(e=>[e.type,e.x,e.y,e.maxHp,e.phase]);
    const opening=firstWave();
    const originalSetup=JSON.stringify(run.setup);
    const originalHp=run.p.maxHp;
    const example=run.routeChallenge.enemies.find(e=>e.packId===-1);
    run.p.invuln=0;rt.hurtPlayer(9,'skill',false,example);
    run.p.invuln=0;rt.hurtPlayer(5,'physical',false,undefined,'Falling durian');
    example.packRecovery=.75;rt.hit(example,1);rt.hit(example,1);
    rt.addXP(run.need);run.pending=0;
    check('Recap records applied damage, effective level healing and one conversion per Exposed window',
      run.recap.damage.skills>0&&run.recap.damage.hazards>0&&run.recap.levelHealing>0&&run.recap.converted===1);
    for(const enemy of run.routeChallenge.enemies)rt.kill(enemy);
    const cache=run.world.landmarks.find(site=>site.id==='fields');
    Object.assign(run.p,{x:cache.x,y:cache.y});step();
    for(const enemy of run.exploration.guards.fields)rt.kill(enemy);
    run.p.hp=run.p.maxHp-18;step();
    check('Cache recap counts effective recovery instead of the full 30 HP offer',run.recap.cacheHealing===18);

    run.clock=180;step(6);
    rt.kill(run.boss);
    await rt.endGame(true);
    const bank=JSON.parse(store.getItem(key));
    check('Winning after clearing the veteran pack saves a single medal alongside the ordinary clear payout',
      bank.veteranMedals.join()==='johor'&&bank.cleared.join()==='johor'&&
      bank.coins===run.coins+run.stage.clearCoins&&$('recapMedal').textContent.includes('earned'));
    check('The results show damage, healing, openings and the seed',
      $('recapMetrics').children.length===7&&$('recapSourceMetrics').textContent.includes('Falling durian')&&
      $('recapSetup').textContent.includes('00000007'));
    bank.heroUpgrades.ustaz={vitality:4};store.setItem(key,JSON.stringify(bank));
    $('replaySetup').click();quiet(rt.G);step();
    check('Replay restores the same hero, upgrades, veteran stage, seed and opening pack',
      rt.G.hero.id==='ustaz'&&rt.G.p.maxHp===originalHp&&JSON.stringify(rt.G.setup)===originalSetup&&
      JSON.stringify(firstWave())===JSON.stringify(opening)&&!rt.G.recap.levelHealing);
  }finally{
    if(saved===null)store.removeItem(key);else store.setItem(key,saved);
    rt.toMenu();
  }
}
