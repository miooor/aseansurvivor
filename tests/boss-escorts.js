import {BOSS_ESCORTS,BOSS_LINEUPS,BOSS_WARD_DAMAGE,BOSS_WARD_RANGE} from '../src/content/boss-escorts.js';
import {activeBossWard} from '../src/game/boss-ward.js';

export function checkBossEscorts(w,check){
  const rt=w.__asean,doc=w.document;
  const start=()=>{
    rt.newGame('ustaz',0);
    const g=rt.G;
    g.clock=180;
    g.auto=false;
    g.spawnT=g.durianT=g.pupT=999;
    g.cds.fill(999);
    g.p.invuln=999;
    g.noElements=true;
    g.st.crit=0;
    g.events.add('ring1');
    g.events.add('ring2');
    for(const id of Object.keys(g.stage.folklore))g.events.add('arrival:'+id);
    rt.raid.state.portalAt=Infinity;
    return g;
  };
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  for(const [stage,groups] of Object.entries(BOSS_LINEUPS)){
    check(stage+' has a localized pair for both boss phases',
      groups.length===2&&groups.every(group=>group.length===2&&new Set(group).size===2&&
        group.every(type=>Object.hasOwn(BOSS_ESCORTS,type))));
  }

  const g=start();
  step();
  const boss=g.boss;
  const escorts=()=>g.enemies.filter(e=>!e.dead&&e.bossEscort);
  // Exercise placement in the starting clearing, independent of the random boss spawn.
  Object.assign(boss,{x:200,y:0,stun:999});
  step(15);
  check('The first boss group includes the local ward keeper',escorts().map(e=>e.type).join(',')===BOSS_LINEUPS.johor[0].join(',')&&
    boss.wardEscort?.type===BOSS_LINEUPS.johor[0][0]);
  const ward=boss.wardEscort;
  check('Boss escorts start on walkable ground outside contact range',escorts().every(e=>g.world.walkable(e.x,e.y,e.r)&&
    Math.hypot(e.x-g.p.x,e.y-g.p.y)>e.r+g.p.r));
  Object.assign(ward,{x:200,y:75,stun:0,fear:0,spd:0,skillT:999});
  step();
  check('Boss HUD identifies the live ward',!doc.getElementById('bossWard').hidden);
  const damage=()=>{
    const hp=boss.hp;
    rt.hit(boss,100,{slot:0});
    return hp-boss.hp;
  };
  check('The tether reduces damage to the boss',Math.abs(damage()-100*BOSS_WARD_DAMAGE)<1e-7);
  ward.stun=1;
  check('Stunning the keeper exposes the boss immediately',damage()===100&&!activeBossWard(boss));
  ward.stun=0;
  ward.x=boss.x+BOSS_WARD_RANGE+5;
  check('Separating the keeper exposes the boss',damage()===100&&!activeBossWard(boss));
  ward.x=boss.x+50;
  rt.kill(ward);
  step();
  check('Defeating the keeper drops the ward for good',damage()===100&&
    doc.getElementById('bossWard').hidden);

  boss.hp=boss.maxHp*.49;
  step(15);
  check('Half health brings one unwarded reinforcement pair',escorts().filter(e=>e.bossEscort==='reinforcement').map(e=>e.type).join(',')===
    BOSS_LINEUPS.johor[1].join(',')&&!activeBossWard(boss));
  step(30);
  check('Reinforcements do not repeat below half health',escorts().length===3);
  rt.kill(boss);
  check('Defeating the boss dispels its escorts and awards victory',g.won&&escorts().length===0);
  const raid=start();
  rt.raid.enter();
  step(10);
  check('The Spirit Rift does not spawn stage escorts or apply a campaign ward',
    raid.raid&&raid.raidBoss?.type==='raya'&&!raid.boss&&!raid.enemies.some(e=>e.bossEscort)&&
    doc.getElementById('bossWard').hidden);
  rt.toMenu();
}
