import assert from 'node:assert/strict';
import test from 'node:test';
import {BUILDINGS,createWorld} from '../src/content/world.js';
import {SPECIALIZATIONS} from '../src/content/specializations.js';
import {installLia,liaShadow,inLiaSmoke,smokeMiss} from '../src/game/heroes/lia.js';

function setup(x=0,y=0){
  const world=createWorld(),HOOKS={newGame:[],cleanup:[],update:[]};
  const g={t:0,p:{x,y,r:16,hp:50,maxHp:95,face:[1,0]},identity:{castT:0,castSlot:0},cds:[0,0,0,0,0],roster:{},evo:[],fx:[],projs:[],enemies:[]};
  const api={G:g,HEROES:{},CAST:{},AUTO:{},HOOKS,aimDir:()=>[1,0],rm:()=>1,
    clearLine:world.clearLine,moveOnMap:world.moveOnMap,signatureReleased(){},text(){},
    hit:(enemy,damage)=>{if(enemy.dodge)return;enemy.hp-=damage;return true}};
  installLia(api);
  g.hero=api.HEROES.lia;
  g.technique=SPECIALIZATIONS.lia.base;
  HOOKS.newGame[0](g);
  const enemy=(x,y)=>{const e={x,y,r:16,hp:200};g.enemies.push(e);return e};
  return {g,enemy,auto:api.AUTO.lia,cast:(slot,rank=1)=>api.CAST.lia[slot](rank),step:t=>{g.t=t;HOOKS.update[0]()}};
}

test('an auto-cast follow-up can reveal Lia before Shadowstep expires',()=>{
  for(const slot of [1,3,4]){
    const {g,enemy,cast,auto}=setup();
    cast(2);
    enemy(g.p.x+45,0);enemy(g.p.x+65,0);
    const nearby=radius=>g.enemies.filter(e=>Math.hypot(e.x-g.p.x,e.y-g.p.y)<radius).length;
    assert.equal(auto.when[slot](nearby),true,'an attack can follow up while hidden');
    assert.equal(auto.when[2](nearby),false,'do not re-cast Shadowstep while hidden');
    cast(slot);
    assert.equal(liaShadow(g),null);
  }
});

test('Crescent Cut reaches farther ahead and to the side',()=>{
  const {enemy,cast}=setup();
  const far=enemy(275,0),flank=enemy(110,52),outside=enemy(110,66);
  cast(1);
  assert.deepEqual([far.hp,flank.hp,outside.hp],[168,168,200]);
});

test('an aimed blink stops at a building and cannot backstab through it',()=>{
  const wall=BUILDINGS.find(b=>b.id==='house-b'),start=wall.x-60,y=wall.y+wall.h/2;
  const {g,enemy,cast}=setup(start,y);
  const foe=enemy(wall.x+40,y);
  cast(2);
  assert.ok(g.p.x>start&&g.p.x<=wall.x-g.p.r);
  assert.equal(foe.hp,200);
});

test('Shadowstep ranks extend concealment and leaving the arena invalidates the afterimage',()=>{
  const {g,cast,step}=setup();
  cast(2,5);
  g.p.x=45;
  step(4.5);
  assert.equal(liaShadow(g).x,0);
  assert.equal(cast(0),false);
  step(4.61);
  assert.equal(liaShadow(g),null);
  cast(2);
  g.raid={};
  assert.equal(liaShadow(g),null);
  step(5);
  assert.equal(g.roster.lia.shadow,null);
});

test('Midnight Hunt needs a target and switches between surviving foes',()=>{
  const {g,enemy,cast,step}=setup();
  assert.equal(cast(4),false);
  const first=enemy(80,0),second=enemy(160,0);
  cast(4);step(.19);step(.38);
  assert.deepEqual([first.hp,second.hp],[132,166]);
  assert.equal(g.roster.lia.hunt,null);
});

test('only a damaging concealed Shadowstep steals life, capped by both health pools',()=>{
  for(const [dodge,hp,enemyHp,expected] of [
    [false,50,200,68], [true,50,200,50],
    [false,50,8,52], [false,93,200,95]
  ]){
    const {g,enemy,cast}=setup();
    Object.assign(enemy(80,0),{hp:enemyHp,dodge});
    g.p.hp=hp;
    cast(2);
    assert.equal(g.p.hp,expected);
  }
});

test('Shadowstep leaves smoke at takeoff for three seconds, with one 60% miss roll',()=>{
  const {g,cast,step}=setup();
  cast(2);
  assert.equal(inLiaSmoke(g,g.p),false);
  assert.equal(inLiaSmoke(g,{x:125,y:0}),true);
  assert.equal(inLiaSmoke(g,{x:126,y:0}),false);
  assert.equal(smokeMiss(true,()=>.5999),true);
  assert.equal(smokeMiss(true,()=>.6),false);
  assert.equal(smokeMiss(false,()=>assert.fail('clear attacker rolled')),false);
  step(3);
  assert.equal(inLiaSmoke(g,{x:0,y:0}),false);
  assert.equal(g.roster.lia.smoke,null);
});

test('Blade Wheel reveals Lia and hits foes on both sides once',()=>{
  const {g,enemy,cast}=setup();
  cast(2);
  const front=enemy(g.p.x+80,0),rear=enemy(g.p.x-95,0),outside=enemy(g.p.x+180,0);
  cast(3);
  assert.equal(liaShadow(g),null);
  assert.deepEqual([front.hp,rear.hp,outside.hp],[158,158,200]);
  assert.equal(rear.slowT,2);
  assert.ok(g.roster.lia.smoke);
});
