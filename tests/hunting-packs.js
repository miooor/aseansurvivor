import {HUNTING_MONSTERS,HUNTING_PACKS,PACK_GUARD_MULTIPLIER} from '../src/content/hunting-monsters.js';
import {PACK_RECOVERY_DAMAGE} from '../src/game/pack-tactics.js';
import {STAGES} from '../src/content/core.js';

export function checkHuntingPacks(w,check){
  const rt=w.__asean;
  const start=(stage=0)=>{
    rt.newGame('ustaz',stage);
    const g=rt.G;
    g.auto=false;
    g.cds.fill(999);
    g.spawnT=g.durianT=g.pupT=999;
    g.p.invuln=999;
    g.noElements=true;
    g.st.crit=0;
    rt.raid.state.portalAt=Infinity;
    for(const id of Object.keys(g.stage.folklore))g.events.add('arrival:'+id);
    return g;
  };
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};

  for(const stage of Object.keys(HUNTING_PACKS)){
    check(stage+' fields packs of familiar local roles',HUNTING_PACKS[stage].length===3&&
      HUNTING_PACKS[stage].every((pack,i)=>pack.length===(i?3:2)&&new Set(pack).size===pack.length&&
        pack.every(type=>Object.hasOwn(HUNTING_MONSTERS,type))));
  }
  const g=start();
  const members=()=>g.enemies.filter(e=>!e.dead&&e.packId);
  g.clock=57;
  step();
  check('The first hunting pack waits until 0:58',members().length===0);
  g.clock=58;
  step();
  const pack=members();
  check('Johor’s first hunting pack brings two different monsters',pack.map(e=>e.type).join(',')===HUNTING_PACKS.johor[0].join(','));
  check('Pack members approach from separate walkable directions',pack.every(e=>g.world.clearLine(e,g.p,g.p.r))&&
    Math.hypot(pack[0].x-pack[1].x,pack[0].y-pack[1].y)>=80);
  check('The pack gives the player time to react',pack.every(e=>!e.windup&&e.skillT>0));
  g.clock=112;
  step();
  check('A live pack prevents overlapping reinforcements',members().every(e=>pack.includes(e)));
  for(const e of pack)e.dead=true;
  step(24);
  check('The second pack arrives when the first is gone',members().map(e=>e.type).join(',')===HUNTING_PACKS.johor[1].join(','));

  const second=members();
  for(const [i,e] of second.entries())Object.assign(e,{x:130,y:(i-1)*70,spd:0,skillT:0});
  step();
  check('Packmates take turns winding up',second.filter(e=>e.windup>0).length===1);

  const guarded=start();
  const guard=rt.makeGhost('limestoneSeladang',140,0);
  const ally=rt.makeGhost('belangProwler',180,0);
  const outsider=rt.makeGhost('belangProwler',180,60);
  Object.assign(guard,{packId:1});
  Object.assign(ally,{packId:1,hp:1000,maxHp:1000});
  Object.assign(outsider,{packId:2,hp:1000,maxHp:1000});
  rt.hit(ally,100,{slot:0});
  rt.hit(outsider,100,{slot:0});
  check('Seladang protects nearby packmates only',ally.hp===1000-100*PACK_GUARD_MULTIPLIER&&outsider.hp===900);
  guard.stun=1;
  const before=ally.hp;
  rt.hit(ally,100,{slot:0});
  check('Stunning Seladang drops its protection',ally.hp===before-100);
  guard.stun=0;
  rt.kill(guard);
  const unguarded=ally.hp;
  rt.hit(ally,100,{slot:0});
  check('Killing Seladang drops its protection',ally.hp===unguarded-100&&guarded.enemies.includes(ally));

  const tide=start();
  const crab=rt.makeGhost('bakauBelangkas',175,0);
  Object.assign(crab,{skillT:0,spd:0});
  step();
  const spot=crab.folkloreMarks[0];
  Object.assign(tide.p,{x:-100,y:30});
  for(let i=0;i<24&&crab.windup>0;i++)step();
  const pool=tide.zones.find(z=>z.kind==='monster-brine');
  check('Breaking tide leaves a slow pool on its original warning',pool?.x===spot.x&&pool?.y===spot.y&&pool.life>0);
  const drift=x=>{
    Object.assign(tide.p,{x,y:10,vx:0,vy:0});
    w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyD'}));
    step(3);
    w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyD'}));
    return tide.p.x-x;
  };
  check('Brine slows traversal only inside its footprint',drift(0)<drift(-100)*.8);
  pool.life=.01;
  step();
  check('The brine pool expires with the combat clock',!tide.zones.includes(pool));

  const chase=start();
  const tiger=rt.makeGhost('belangProwler',185,0);
  Object.assign(tiger,{skillT:0,spd:0});
  chase.p.vy=155;
  step();
  const lane=tiger.folkloreMarks[0],dy=lane.dy;
  chase.p.vy=-155;
  step();
  check('The pouncer leads movement and keeps its aim locked',dy>0&&lane.dy===dy);
  const dodge=move=>{
    const g=start(),e=rt.makeGhost('belangProwler',190,0);
    Object.assign(e,{spd:0,skillT:0});
    g.p.invuln=0;
    step();
    if(move){
      w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyW'}));
      step(10);
      w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyW'}));
    }
    for(let i=0;i<20&&e.windup>0;i++)step();
    return g.p.maxHp-g.p.hp;
  };
  check('Cinder Pounce hits a stationary survivor and misses a sidestep',dodge(false)>0&&dodge(true)===0);

  const hunt=start();
  const pouncer=rt.makeGhost('belangProwler',190,0);
  Object.assign(pouncer,{packId:1,skillT:0,spd:125,hp:1000,maxHp:1000});
  hunt.p.invuln=0;
  step();
  const warning=pouncer.folkloreMarks?.[0];
  check('Johor commits to a locked warning before the pack pounces',pouncer.windup>0&&warning?.kind==='lane');
  w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyW'}));
  step(14);
  w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyW'}));
  for(let i=0;i<24&&!pouncer.packRecovery;i++)step();
  check('Sidestepping the pounce earns a real recovery window',
    pouncer.packRecovery>0&&hunt.p.hp===hunt.p.maxHp&&Math.abs(pouncer.attackAngle-Math.atan2(warning.dy,warning.dx))<1e-7);
  rt.hit(pouncer,50,{element:'physical'});
  check('An exposed pack member takes extra damage',pouncer.hp===1000-50*PACK_RECOVERY_DAMAGE);
  pouncer.skillT=0;
  step(3);
  check('An exposed pack member holds position and waits to recast',pouncer.packRecovery>0&&!pouncer.moving&&!pouncer.windup);

  for(const [index,stage] of STAGES.entries()){
    const run=start(index);
    const times=stage.bossAt===120?[59,94,110]:[58,112,153];
    for(const event of ['ring1','ring2','regionalElite','regionalElite-1'])run.events.add(event);
    for(const [phase,clock] of times.entries()){
      run.clock=clock;
      step();
      const pack=run.enemies.filter(e=>e.packId===phase+1&&!e.dead);
      check(stage.name+' gets its coordinated pack at '+clock+' seconds',
        pack.map(e=>e.type).join(',')===HUNTING_PACKS[stage.id][phase].join(',')&&!!run.packPlan);
      const goals=[...run.packPlan.goals];
      check(stage.name+' pack '+(phase+1)+' selects distinct walkable positions',goals.length>0&&
        goals.every(([e,goal])=>pack.includes(e)&&run.world.walkable(goal.x,goal.y,e.r)&&run.world.clearLine(e,goal,e.r)&&
          goals.every(([other,point])=>other===e||Math.hypot(goal.x-point.x,goal.y-point.y)>=65)));
      for(const e of pack)e.dead=true;
    }
  }
  rt.toMenu();
}
