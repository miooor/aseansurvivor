import assert from 'node:assert/strict';
import test from 'node:test';
import {SPECIALIZATIONS} from '../src/content/specializations.js';
import {installNadi} from '../src/game/heroes/nadi.js';

function setup(){
  const HOOKS={newGame:[],update:[],cleanup:[],hurt:[]};
  const g={t:0,raid:null,p:{x:0,y:0,face:[1,0]},roster:{},identity:{},projs:[],fx:[],enemies:[],evo:{},technique:SPECIALIZATIONS.nadi.base};
  let released=0;
  const contacts=[];
  const api={G:g,HEROES:{},CAST:{},AUTO:{},HOOKS,rm:rank=>1+.25*(rank-1),aimDir:()=>[1,0],
    nearest:(x,y,r,skip)=>g.enemies.find(e=>!e.dead&&!skip?.has(e)&&Math.hypot(e.x-x,e.y-y)<r),
    each(x,y,r,fn){for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-x,e.y-y)<r+e.r)fn(e)},
    clearLine:()=>true,moveOnMap:(_x,_y,x,y)=>({x,y}),
    resolveHitFeedback(){},signatureReleased(){released++},
    hit(e,damage,o){if(e.dodge)return;const critical=e.critical||o.forceCritical;e.hp-=damage;
      contacts.push({e,slot:o.slot,damage,critical});
      if(o.batch){o.batch.damage+=damage;if(critical)o.batch.criticals++}
      return true;}
  };
  installNadi(api);
  g.hero=api.HEROES.nadi;
  HOOKS.newGame.forEach(fn=>fn(g));
  return {g,contacts,releases:()=>released,enemy(x,y,critical=false){
    const e={x,y,r:10,hp:1000,critical};g.enemies.push(e);return e;
  },cast:(slot,rank=1)=>api.CAST.nadi[slot](rank),hurt:amount=>HOOKS.hurt[0](amount),
  advance(seconds){
    const end=g.t+seconds;
    while(g.t<end-1e-8){const dt=Math.min(.05,end-g.t);g.t+=dt;HOOKS.update.forEach(fn=>fn(dt))}
  },clear:()=>HOOKS.cleanup.forEach(fn=>fn())};
}

test('Thousand Palms strikes 99 times per nearby foe and counts landed criticals',()=>{
  const {g,enemy,cast,advance,contacts}=setup();
  const near=enemy(46,0,true),rear=enemy(-45,0),far=enemy(160,0);
  cast(1);advance(.25);
  assert.ok(contacts.length>0&&contacts.length<198);
  advance(1);
  for(const [e,count] of [[near,99],[rear,99],[far,0]])assert.equal(contacts.filter(h=>h.e===e).length,count);
  assert.equal(g.identity.charge,9);
  assert.equal(g.identity.ready,true);
});

test('Hand of Buddha consumes critical charge, travels and hits each foe once',()=>{
  const {g,enemy,cast,advance,contacts,releases}=setup();
  enemy(48,0,true);const far=enemy(270,0),side=enemy(180,120),rear=enemy(-160,0);
  cast(1);advance(1.2);cast(2);
  assert.equal(g.identity.charge,0);
  assert.equal(releases(),1);
  assert.equal(far.hp,1000);
  advance(.6);
  assert.deepEqual(contacts.filter(h=>h.slot===2&&h.e===far).map(h=>h.damage),[81]);
  assert.equal(side.hp,1000);
  assert.equal(rear.hp,1000);
});

test('Critical charge expires, dodges add no charge and switching arenas clears pending skills',()=>{
  const {g,enemy,cast,advance,contacts,clear}=setup();
  const foe=enemy(55,0,true);
  foe.dodge=true;
  cast(1);advance(1.1);assert.equal(g.identity.charge,0);
  foe.dodge=false;
  cast(1);advance(1.1);assert.equal(g.identity.charge,9);
  advance(6);assert.equal(g.identity.charge,0);
  cast(1);cast(2);cast(4);g.raid={};
  const prior=contacts.length;
  advance(1);
  assert.equal(contacts.length,prior);
  assert.equal(g.roster.nadi.ward,null);
  assert.equal(g.identity.charge,0);
  cast(4);clear();assert.equal(g.roster.nadi.ward,null);
});

test('The Buddha statue wards the hero and deploys three monks that pursue and strike',()=>{
  const {g,enemy,cast,advance,hurt,contacts}=setup();
  const foe=enemy(135,0);
  cast(4);
  const ward=g.roster.nadi.ward;
  assert.equal(ward.x,62);
  assert.equal(ward.monks.length,3);
  assert.equal(hurt(100),70);
  const start=ward.monks.map(m=>m.x);
  advance(1);
  assert.ok(ward.monks.some((m,i)=>m.x!==start[i]));
  assert.ok(contacts.some(h=>h.slot===4&&h.e===foe));
  assert.ok(ward.monks.every((m,i)=>ward.monks.slice(i+1).every(other=>Math.hypot(m.x-other.x,m.y-other.y)>30)));
  g.p.x=300;assert.equal(hurt(100),100);
  advance(5);
  assert.equal(g.roster.nadi.ward,null);
});

test('Still Palm protects one hit and the evolved guard lasts three seconds',()=>{
  const {g,enemy,cast,advance,hurt,contacts}=setup();
  enemy(80,0);g.evo[3]=true;
  cast(3);advance(2);
  assert.equal(hurt(100),50);
  assert.equal(hurt(100),100);
  assert.equal(contacts.filter(h=>h.slot===3&&h.critical).length,1);
  cast(3);advance(3);assert.equal(hurt(100),100);
});
