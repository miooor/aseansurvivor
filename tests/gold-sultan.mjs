import assert from 'node:assert/strict';
import test from 'node:test';
import {SPECIALIZATIONS} from '../src/content/specializations.js';
import {installIdentities} from '../src/game/hero-identities.js';
import {COIN_RAIN_RADIUS,goldDustBuff,goldSpinMoveMultiplier,installDani} from '../src/game/heroes/dani.js';
import {renderSkill} from '../src/game/skill-audio.js';
import {drawDani} from '../src/scenes/heroes/dani.ts';

function setup(){
  const HOOKS={newGame:[],cleanup:[],update:[],dmgMul:[],hit:[],parry:[],cast:[]};
  const g={roster:{},identity:{},p:{x:0,y:0,face:[1,0],invuln:0},cds:[0,0,0,0],fx:[],projs:[],enemies:[],evo:{},
    t:0,raid:null,technique:SPECIALIZATIONS.dani.base};
  const contacts=[],sounds=[];
  let releases=0;
  const api={G:g,HOOKS,HEROES:{},CAST:{},AUTO:{},aimDir:()=>[1,0],rm:r=>1+.25*(r-1),
    text(){},signatureReleased(){releases++},clearLine:()=>true,
    withCastEffects(_slot,cast,rank){return cast(rank)},
    audio:{play(hero,slot){sounds.push({hero,slot,t:g.t})}},
    each(x,y,r,apply){for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-x,e.y-y)<r+e.r)apply(e,e.x-x,e.y-y)},
    hit(e,damage,options){for(const multiplier of HOOKS.dmgMul)damage*=multiplier(e,options);
      contacts.push({e,damage,slot:options.slot});e.hp-=damage;return true}};
  installDani(api);
  installIdentities(api);
  g.hero=api.HEROES.dani;
  HOOKS.newGame.forEach(f=>f(g));
  return {g,contacts,sounds,hit:api.hit,releases:()=>releases,cast:(slot,rank=1)=>api.CAST.dani[slot](rank),
    enemy(x,y){const e={x,y,r:8,hp:1000};g.enemies.push(e);return e},
    advance(seconds){const end=g.t+seconds;
      while(g.t<end-1e-8){const dt=Math.min(.05,end-g.t);g.t+=dt;HOOKS.update.forEach(f=>f(dt));
        for(const fx of g.fx)fx.life-=dt;
        g.fx=g.fx.filter(fx=>fx.life>0);
      }
    },
    cleanup(){HOOKS.cleanup.forEach(f=>f())}};
}

function groundMarks(g){
  const rings=[],fills=[],lines=[];
  let weight=0,color=0,alpha=0;
  const floor={
    lineStyle(w,c,a){weight=w;color=c;alpha=a;return this},
    fillStyle(c,a){color=c;alpha=a;return this},
    strokeCircle(x,y,r){rings.push({x,y,r,weight,color,alpha});return this},
    fillCircle(x,y,r){fills.push({x,y,r,color,alpha});return this},
    lineBetween(x,y,tx,ty){lines.push({x,y,tx,ty,weight,color,alpha});return this}
  };
  drawDani({floor},g);
  return {rings,fills,lines};
}

test('Gold Melting Flamethrower plays one short punch at the start of each revolution',()=>{
  const {cast,advance,sounds}=setup();
  const qSounds=()=>sounds.filter(({hero,slot})=>hero==='dani'&&slot===1).map(({t})=>Number(t.toFixed(4)));
  cast(1);
  assert.deepEqual(qSounds(),[0]);
  assert.equal(cast(1),false);
  advance(.59);
  assert.deepEqual(qSounds(),[0]);
  advance(.01);
  assert.deepEqual(qSounds(),[0,.6]);
  advance(.6);
  advance(.6);
  assert.deepEqual(qSounds(),[0,.6,1.2]);
  cast(1);
  advance(.2);
  cast(4);
  advance(1.5);
  assert.deepEqual(qSounds(),[0,.6,1.2,1.8]);

  const pcm=renderSkill('dani-1');
  assert.ok(pcm.length/22050<.6&&pcm.some(v=>Math.abs(v)>.15));
});

test('the Sultan leaves a short ground trail only along resolved movement during Q',()=>{
  const {g,cast,advance,cleanup}=setup();
  const trail=()=>g.roster.dani.trail;
  g.p.normalMove={x:12,y:0,dx:12,dy:0};
  advance(.05);
  assert.equal(trail().length,0);
  cast(1);
  g.p.normalMove={x:0,y:0,dx:0,dy:0};
  advance(.05);
  assert.equal(trail().length,0);
  Object.assign(g.p,{x:12,y:4,normalMove:{x:12,y:4,dx:12,dy:4}});
  advance(.05);
  assert.ok(trail()[0].until-g.t<=.25);
  const {lines}=groundMarks(g);
  assert.ok(lines.length&&lines.every(({x,y,tx,ty})=>x===0&&y===0&&tx===12&&ty===4));
  g.p.normalMove=null;
  advance(.1);
  assert.equal(trail().length,1);
  assert.ok(groundMarks(g).lines[0].alpha<lines[0].alpha);
  advance(.15);
  assert.equal(groundMarks(g).lines.length,0);
  g.p.normalMove={x:24,y:4,dx:12,dy:0};
  advance(.05);
  assert.equal(trail().length,1);
  cleanup();
  assert.equal(trail().length,0);
});

test('Coin Rain outlines its fixed target immediately and flashes on the first wave even if it misses',()=>{
  const {g,cast,advance,enemy,contacts}=setup();
  assert.equal(cast(3),false);
  assert.equal(groundMarks(g).rings.length,0);
  const target=enemy(170,10);
  cast(3);
  const before=groundMarks(g);
  assert.ok(before.rings.some(({x,y,r,alpha})=>x===170&&y===10&&r===COIN_RAIN_RADIUS&&alpha>=.8));
  target.x=600;
  g.p.x=-200;
  advance(.37);
  assert.deepEqual(groundMarks(g),before);
  advance(.01);
  const first=groundMarks(g);
  assert.equal(contacts.length,0);
  assert.ok(first.fills.some(({x,y,r,alpha})=>x===170&&y===10&&r===COIN_RAIN_RADIUS&&alpha>.2));
  assert.ok(first.rings.every(({x,y})=>x===170&&y===10));
  advance(.36);
  assert.deepEqual(groundMarks(g),before);
});

test('Gold Melting Flamethrower makes three full turns and boosts movement only while active',()=>{
  const {g,cast,enemy,advance,contacts}=setup();
  const foes=[enemy(140,0),enemy(0,120),enemy(-140,0),enemy(0,-120)];
  const far=enemy(0,400);
  assert.equal(goldSpinMoveMultiplier(g),1);
  cast(1,2);advance(.07);
  assert.equal(goldSpinMoveMultiplier(g),1.35);
  assert.ok(foes[0].hp<1000);
  assert.ok(foes.slice(1).every(e=>e.hp===1000));
  assert.equal(contacts[0].damage,7.5);

  g.p.x=25;g.p.y=-20;
  g.p.moving=true;g.p.face=[0,-1];
  cast(2);
  Object.assign(g.identity,{castSlot:2,castT:.35});
  advance(.08);
  assert.ok(Math.abs(g.roster.dani.channel.ax)<1e-8&&g.roster.dani.channel.ay>.99);
  assert.equal(g.identity.castSlot,1);
  assert.deepEqual([g.p.x,g.p.y,...g.p.face],[25,-20,0,-1]);

  let previous=foes.map(()=>1000);
  for(const step of [.45,.6,.6]){
    advance(step);
    assert.ok(foes.every((foe,i)=>foe.hp<previous[i]));
    previous=foes.map(foe=>foe.hp);
    if(g.roster.dani.channel){
      assert.ok(g.roster.dani.channel.ax>.99&&Math.abs(g.roster.dani.channel.ay)<1e-8);
      assert.equal(goldSpinMoveMultiplier(g),1.35);
    }
  }
  assert.equal(far.hp,1000);
  assert.equal(g.roster.dani.channel,null);
  assert.equal(goldSpinMoveMultiplier(g),1);
});

test('Gold Dust adds damage and fire rate, expires, and never moves the player',()=>{
  const {g,cast,enemy,hit,advance}=setup();
  const e=enemy(140,0);
  g.p.moving=true;g.p.face=[0,1];
  cast(2,2);
  assert.deepEqual([g.p.x,g.p.y,g.p.dash],[0,0,undefined]);
  const buff=goldDustBuff(g);
  assert.equal(buff.fireRate,1.5);
  assert.equal(buff.until,5.5);
  hit(e,100,{slot:0});assert.equal(e.hp,875);
  hit(e,100,{slot:4});assert.equal(e.hp,750);
  hit(e,100,{origin:'item'});assert.equal(e.hp,650);
  cast(4);assert.equal(g.roster.dani.channel.ay,1);
  advance(5.5);
  assert.equal(goldDustBuff(g),null);
  hit(e,100,{slot:0});assert.equal(e.hp,550);
});

test('Rain picks the largest nearby cluster even when aiming away from it',()=>{
  const {g,cast,enemy}=setup();
  const closest=enemy(50,0);
  enemy(-210,8);enemy(-246,44);enemy(-230,-37);
  const dead=enemy(3,0);dead.dead=true;
  const hidden=enemy(10,0);hidden.type='body';
  g.p.face=[1,0];
  cast(3);
  assert.ok(g.roster.dani.rain.x<0);
  assert.notEqual(g.roster.dani.rain.x,closest.x);
});

test('Rain holds its cast when it has no valid target and can target a lone foe',()=>{
  const {g,cast,enemy}=setup();
  const hidden=enemy(5,0);hidden.type='body';
  const far=enemy(410,0);
  assert.equal(cast(3),false);
  assert.equal(g.roster.dani.rain,null);
  far.x=-300;
  cast(3);
  assert.equal(g.roster.dani.rain.x,-300);
});

test('Make It Rain casts without currency and strikes a fixed area five times',()=>{
  const {g,cast,enemy,advance,contacts,releases}=setup();
  const inside=enemy(170,0),outside=enemy(170,-190);
  cast(3);
  assert.deepEqual([g.roster.dani.rain.x,g.roster.dani.rain.y],[170,0]);
  assert.equal(inside.hp,1000);
  advance(.4);
  g.p.x=-200;
  advance(2);
  assert.equal(contacts.filter(c=>c.slot===3&&c.e===inside).length,5);
  assert.equal(outside.hp,1000);
  assert.equal(releases(),1);
  assert.equal(g.roster.dani.rain,null);
});

test('Bullion Barrage replaces Q and launches new gold bars along the latest movement direction',()=>{
  const {g,cast,advance,cleanup,enemy}=setup();
  cast(1);assert.equal(goldSpinMoveMultiplier(g),1.35);
  cast(4);assert.equal(goldSpinMoveMultiplier(g),1);
  assert.equal(cast(1),false);
  advance(.25);
  assert.ok(g.projs.length);
  const first=g.projs[0];
  assert.ok(first.vx>0&&first.vy===0&&first.hitOptions.slot===4);
  g.p.moving=true;g.p.face=[0,-1];advance(.25);
  assert.ok(g.projs.at(-1).vy<0&&g.projs.at(-1).vx===0);
  g.p.moving=false;advance(.25);
  assert.ok(g.projs.at(-1).vy<0);
  g.raid={};advance(.1);
  assert.equal(g.roster.dani.channel,null);
  assert.equal(g.projs.length,0);
  cast(2);enemy(85,0);cast(3);
  assert.ok(g.roster.dani.rain);
  cleanup();
  assert.equal(goldDustBuff(g),null);
  assert.equal(g.roster.dani.rain,null);
});
