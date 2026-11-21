import assert from 'node:assert/strict';
import test from 'node:test';
import {installVanna,isLoomBound,vannaFamiliarPoint,vannaFamiliarIntercept} from '../src/game/heroes/vanna.js';

function setup(){
  const HOOKS={newGame:[],cleanup:[],update:[]};
  const g={t:0,raid:null,p:{x:0,y:0,r:16},roster:{},evo:[],fx:[],projs:[],enemies:[],technique:{radius:140,pulse:45}};
  const hits=[];
  const api={G:g,HEROES:{},CAST:{},AUTO:{},HOOKS,aimDir:()=>[1,0],movementInput:()=>[0,0],rm:r=>r,
    nearest:(x,y,reach)=>g.enemies.filter(e=>!e.dead&&Math.hypot(e.x-x,e.y-y)<reach)
      .sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0],
    clearLine:(_p,e)=>!e.blocked,moveOnMap:(_x,_y,x,y)=>({x,y}),
    hit:(e,damage,options)=>{hits.push({e,damage,...options});e.hp-=damage;e.dead=e.hp<=0;return true},
    signatureReleased:()=>{g.released=true}};
  installVanna(api);
  g.hero=api.HEROES.vanna;
  HOOKS.newGame[0](g);
  const enemy=(x,y,extra={})=>{const e={x,y,r:10,hp:1000,stun:0,...extra};g.enemies.push(e);return e};
  return {g,hits,enemy,cast:(i,rank=1)=>api.CAST.vanna[i](rank),
    step:t=>{g.t=t;HOOKS.update[0]()},cleanup:()=>HOOKS.cleanup[0]()};
}

test('Running Stitch hops to three visible enemies once and marks them for Ribbon Cut',()=>{
  const {enemy,cast,g,step}=setup();
  const first=enemy(90,0),second=enemy(180,0),third=enemy(265,0),fourth=enemy(345,0);
  const blocked=enemy(55,0,{blocked:true});
  cast(2);
  assert.deepEqual([...g.roster.vanna.stitches.keys()],[first,second,third]);
  assert.deepEqual([first.hp,second.hp,third.hp,fourth.hp,blocked.hp],[974,974,974,1000,1000]);
  cast(1);
  assert.deepEqual([first.hp,second.hp,third.hp],[923,923,923]);
  step(4);
  assert.equal(g.roster.vanna.stitches.size,0);
});

test('Foldstep stays in place, then its familiar follows Vanna and strikes late arrivals repeatedly',()=>{
  const {g,enemy,cast,step}=setup();
  const outside=enemy(180,0);
  cast(3);
  assert.deepEqual([g.p.x,g.p.y],[0,0]);
  assert.equal(g.released,true);
  const {start}=g.roster.vanna.familiar;
  const first=vannaFamiliarPoint(g.p,start,0);
  step(.25);
  assert.notDeepEqual(vannaFamiliarPoint(g.p,start,.25),first);
  assert.equal(outside.hp,1000);
  g.p.x=120;
  step(.3);
  assert.equal(outside.hp,955);
  const nearer=enemy(145,0);
  step(.8);
  assert.equal(nearer.hp,1000);
  step(.9);step(1.5);
  assert.deepEqual([nearer.hp,outside.hp],[910,955]);
  step(4);
  assert.equal(g.roster.vanna.familiar,null);
  assert.equal(nearer.hp,910);
});

test('Foldstep evolution extends targeting range and arena changes clear the familiar',()=>{
  const {g,enemy,cast,step}=setup();
  const target=enemy(185,0);
  cast(3);step(.1);
  assert.equal(target.hp,1000);
  g.raid={};
  step(.2);
  assert.equal(g.roster.vanna.familiar,null);
  g.evo[3]=true;
  cast(3);step(.3);
  assert.equal(target.hp,955);
});

test('the familiar guards its current side, and shots that reach Vanna first go through',()=>{
  const {g,cast,step}=setup();
  const intercept=(fromX,fromY,toX,toY)=>vannaFamiliarIntercept(g,fromX,fromY,{x:toX,y:toY,r:5});
  cast(3);
  assert.ok(intercept(100,0,-100,0));
  assert.equal(intercept(-100,0,100,0),undefined);
  assert.equal(intercept(100,60,-100,60),undefined);
  step(.55);
  assert.ok(intercept(-100,0,100,0));
  assert.equal(intercept(100,0,-100,0),undefined);
  step(4);
  assert.equal(intercept(-100,0,100,0),undefined);
});

test('Silk Loom captures larger square corners and bosses for ten rank-scaled ticks',()=>{
  const {g,hits,enemy,cast,step}=setup();
  const corner=enemy(249,249),boss=enemy(-250,-250,{boss:true}),outside=enemy(251,0);
  cast(4,2);
  assert.deepEqual([corner,boss,outside].map(e=>isLoomBound(g,e)),[true,true,false]);
  step(0);
  assert.equal(hits.length,2);
  assert.ok(hits.every(h=>h.dot&&h.slot===4&&h.damage===72));
  step(.39);
  assert.equal(hits.length,2);
  step(.4);
  assert.equal(hits.length,4);
  step(4);
  assert.deepEqual([corner.hp,boss.hp,outside.hp],[280,280,1000]);
  assert.equal(isLoomBound(g,corner),false);
  assert.equal(g.roster.vanna.loom,null);
});

test('a pack crossing the edge gets caught, damaged on entry and shredded on its own cadence',()=>{
  const {g,hits,enemy,cast,step}=setup();
  const pack=Array.from({length:5},(_,i)=>enemy(251,30*i,{hp:145}));
  cast(4);
  g.p.x=500;
  step(1);
  assert.equal(hits.length,0);
  for(const e of pack)e.x=249;
  step(1.15);
  assert.ok(pack.every(e=>isLoomBound(g,e)&&e.hp===109));
  step(1.54);
  assert.ok(pack.every(e=>e.hp===109));
  step(1.55);
  assert.ok(pack.every(e=>e.hp===73));
  step(2.8);
  assert.ok(pack.every(e=>e.dead));
  const late=enemy(249,0);
  step(3.98);
  assert.equal(late.hp,964);
  const expired=enemy(249,0);
  step(4);
  assert.equal(expired.hp,1000);
  assert.equal(isLoomBound(g,late),false);
});

test('captured foes keep other stuns and are released on arena transitions or cleanup',()=>{
  const {g,enemy,cast,cleanup,step}=setup();
  const target=enemy(75,0,{stun:6});
  cast(4);cast(2);step(.2);
  assert.equal(target.x,75);
  g.raid={};
  assert.equal(isLoomBound(g,target),false);
  step(1);
  assert.equal(g.roster.vanna.stitches.size,0);
  assert.equal(g.roster.vanna.loom,null);
  cast(4);
  g.p.x=0;
  assert.equal(isLoomBound(g,target),true);
  cleanup();
  assert.equal(isLoomBound(g,target),false);
  assert.equal(target.stun,6);
});
