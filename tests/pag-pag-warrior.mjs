import assert from 'node:assert/strict';
import test from 'node:test';
import {installMira} from '../src/game/heroes/mira.js';

function kitchen(){
  const HOOKS={newGame:[],hurt:[],cleanup:[],update:[]};
  const g={p:{x:0,y:0,hp:60,maxHp:100},identity:{},roster:{},evo:[],enemies:[],fx:[],t:0,technique:{duration:3,force:180}};
  const api={HEROES:{},CAST:{},AUTO:{},G:g,HOOKS,rm:()=>1,aimDir:()=>[1,0],
    signatureReleased(){},ring(){},text(){},
    each:(x,y,r,fn)=>g.enemies.filter(e=>Math.hypot(e.x-x,e.y-y)<=r).forEach(e=>fn(e,e.x-x,e.y-y)),
    hit:(e,d)=>{e.hp-=d;return true}};
  installMira(api);g.hero=api.HEROES.mira;HOOKS.newGame[0](g);
  const foe=x=>{const e={x,y:0,r:4,hp:500};g.enemies.push(e);return e};
  return {g,foe,cast:i=>api.CAST.mira[i](1),tick:dt=>{g.t+=dt;HOOKS.update[0](dt)},hurt:HOOKS.hurt[0]};
}

test('a full pot heals once and boils over where it was served',()=>{
  const {g,foe,cast,tick}=kitchen();
  const first=foe(60);foe(75);foe(90);foe(105);
  cast(1);assert.equal(g.identity.charge,3);
  cast(2);assert.equal(g.p.hp,78);assert.equal(g.identity.charge,0);
  const before=first.hp;g.p.x=400;tick(.6);assert.ok(first.hp<before);
  const after=first.hp;tick(1);assert.equal(first.hp,after);
});

test('lid guard catches one portion, portions cool and raid entry clears a pending boil',()=>{
  const {g,cast,hurt,tick,foe}=kitchen();
  cast(3);assert.equal(hurt(20),15);hurt(20);assert.equal(g.identity.charge,1);
  tick(9);assert.equal(g.identity.charge,0);
  const first=foe(60);foe(75);foe(90);cast(1);cast(2);
  const before=first.hp;g.raid={};tick(1);assert.equal(first.hp,before);
});

test('stove cart vents at its destination',()=>{
  const {cast,foe,tick}=kitchen();
  const edge=foe(400);cast(4);tick(.3);assert.equal(edge.hp,500);
  tick(.31);assert.equal(edge.hp,462);tick(1);assert.equal(edge.hp,462);
});
