import assert from 'node:assert/strict';
import {test} from 'node:test';
import {heroArt} from '../src/content/hero-art.js';
import {drawPaintedEffects} from '../src/scenes/painted-effects.ts';

const battle=id=>({hero:{id},p:{x:10,y:20,face:[1,0]},t:1,fx:[],projs:[],zones:[],roster:{}});
function draw(g,reduced=false){
  const sprites=[];
  drawPaintedEffects(g,reduced,sprite=>sprites.push(sprite));
  return sprites;
}

test('release paint opens on the caster’s selected row or hands off to the live split carriers',()=>{
  for(const id of Object.keys(heroArt))for(let slot=0;slot<5;slot++){
    const g=battle(id);
    g.fx.push({kind:'spell',hero:id,slot,x:10,y:20,a:0,max:.4,life:.4});
    const [sprite]=draw(g);
    if(['lan-2','lia-4','nadi-4','keo-2'].includes(id+'-'+slot)){
      assert.equal(sprite,undefined);
      continue;
    }
    assert.equal(sprite.hero,id);
    assert.equal(sprite.frame,slot*4,id+' '+slot);
  }
});

test('returning parcels and reed bolts follow their live positions after release and vanish on removal',()=>{
  const g=battle('lia');
  const parcel={x:44,y:20,ax:1,ay:0,age:.7,ultimate:true};
  g.roster.lia={shuttles:[parcel]};
  const [sprite]=draw(g,true);
  assert.deepEqual([sprite.x,sprite.y,sprite.frame,sprite.angle],[44,20,18,Math.PI]);
  assert.deepEqual(draw(g,true),[sprite]);
  g.roster.lia.shuttles=[];
  assert.deepEqual(draw(g),[]);
  const k=battle('keo');
  k.projs=[{x:75,y:40,vx:0,vy:-7,r:6,hitOptions:{hero:'keo',slot:2}},{origin:'item',kind:'nur'}];
  const bolts=draw(k,true);
  assert.deepEqual(bolts.map(b=>[b.frame,b.x,b.y,b.angle]),[[10,75,40,-Math.PI/2]]);
});

test('Mira reels along the measured hook lane, sweeps her evolved radius, and breaks at the live crest',()=>{
  const g=battle('mira');
  const cast={hero:'mira',kind:'spell',slot:1,x:5,y:12,max:.4,life:.2,a:Math.PI/2,range:80};
  g.fx=[cast];
  const [hook]=draw(g);
  assert.ok(Math.abs(hook.x-5)<1e-8);
  assert.ok(hook.y>12&&hook.y<=92);
  cast.life=.06;
  assert.ok(draw(g)[0].y<hook.y);
  Object.assign(cast,{slot:2,range:190});
  assert.equal(draw(g)[0].width,380);
  g.fx=[];
  g.roster.mira={wave:{x:5,y:12,ax:0,ay:1,distance:150,length:340,width:120}};
  const [crest]=draw(g,true);
  assert.deepEqual([crest.frame,Math.round(crest.x),crest.y,crest.height],[18,5,162,120]);
  assert.equal(crest.originX,1,'the painted lip ends at the damaging front');
  g.roster.mira.wave=null;
  assert.deepEqual(draw(g),[]);
});

test('delayed seals descend on their individual footprints and dissipate at contact',()=>{
  const g=battle('nadi');
  g.roster.nadi={discs:[{x:20,y:70,at:2,radius:105},{x:100,y:-40,at:2,radius:105}]};
  const seals=draw(g);
  assert.deepEqual(seals.map(s=>[s.x,s.y,s.width]),[[20,70,105],[100,-40,105]]);
  g.t=1.9;
  assert.ok(draw(g)[0].lift<seals[0].lift);
  g.roster.nadi.discs=[];
  g.fx=[{kind:'ring',hero:'nadi',flourish:'seal',x:20,y:70,r:105,life:.03,max:.4}];
  assert.deepEqual(draw(g).map(s=>[s.frame,s.x,s.y]),[[19,20,70]]);
});

test('duration cues follow orbiters, fields, and the actual dash endpoint',()=>{
  const g=battle('ustaz');
  g.orbit={n:2,rad:80,holy:true,ang:0};
  assert.deepEqual(draw(g,true).map(s=>[s.frame,Math.round(s.x),Math.round(s.y)]),[[10,122,20],[10,-102,20]]);
  const l=battle('lia');
  l.fx=[{kind:'spell',hero:'lia',slot:2,x:0,y:0,a:0,life:.15,max:.3}];
  const [rush]=draw(l,true);
  assert.deepEqual([rush.x,rush.y],[10,20]);
});

test('specialization releases use their measured lane width, length and off-caster landing radius',()=>{
  const g=battle('nok');
  const cast={kind:'spell',hero:'nok',slot:1,x:10,y:20,a:Math.PI,max:.6,life:.3,range:270,w:53};
  g.fx=[cast];
  const [teep]=draw(g);
  assert.deepEqual([teep.width,teep.height,teep.x,Math.round(teep.y)],[270,106,-125,20]);
  g.hero.id='asha';Object.assign(cast,{hero:'asha',tx:-16,ty:0,range:135});
  const [stamp]=draw(g,true);
  assert.deepEqual([stamp.width,stamp.x,stamp.y,stamp.ground],[270,-16,0,true]);
});

test('paint advances through the authored cells, holds during pause, and expires on simulation time',()=>{
  const g=battle('sari');
  const cast={hero:'sari',kind:'spell',slot:1,x:0,y:0,a:0,life:.4,max:.4};
  g.fx=[cast];
  for(const [life,expected] of [[.4,4],[.28,5],[.16,6],[.04,7]]){
    cast.life=life;
    assert.equal(draw(g)[0].frame,expected);
    assert.deepEqual(draw(g),draw(g));
    assert.equal(draw(g,true)[0].frame,6);
  }
  cast.life=0;
  assert.deepEqual(draw(g),[]);
});

test('a contact shares the struck actor’s foot depth while the image sits at hit height',()=>{
  const g=battle('lia');
  g.fx=[{hero:'lia',slot:0,kind:'impact',x:14,y:77,footY:100,max:.24,life:.12,r:22}];
  const [hit]=draw(g);
  assert.deepEqual([hit.y,hit.lift],[100,23]);
});

test('split casts show their live carriers without an extra group at the caster',()=>{
  for(const [hero,slot] of [['lia',4],['nadi',4],['keo',2]]){
    const g=battle(hero);
    g.fx=[{kind:'spell',hero,slot,x:10,y:20,max:.5,life:.48}];
    const points=[{x:40,y:50},{x:62,y:40},{x:84,y:30}];
    if(hero==='lia')g.roster.lia={shuttles:points.map(p=>({...p,ax:1,ay:0,age:.1,ultimate:true}))};
    if(hero==='keo')g.projs=points.map(p=>({...p,vx:100,vy:0,r:6,hitOptions:{hero,slot}}));
    if(hero==='nadi')g.roster.nadi={discs:points.map(p=>({...p,radius:80,at:2}))};
    for(const reduced of [false,true]){
      const sprites=draw(g,reduced);
      assert.deepEqual(sprites.map(s=>({x:s.x,y:s.y})),points,hero);
      assert.ok(sprites.every(s=>Math.floor(s.frame/4)===slot));
    }
  }
});

test('a directed punch or fan leaves the caster as one continuous gesture',()=>{
  for(const [hero,slot] of [['ustaz',1],['nok',0],['sari',1],['mira',0],['keo',1]]){
    const g=battle(hero);
    g.fx=[{kind:'spell',hero,slot,x:g.p.x,y:g.p.y,a:0,max:.4,life:.22}];
    const marks=draw(g);
    assert.equal(marks.length,1,hero);
    assert.ok(marks[0].x>g.p.x&&marks[0].x-marks[0].width/2<=g.p.x+20,hero+' connects to the pose');
  }
});

test('wide hand fans and hovering seals keep their painted faces above the terrain',()=>{
  const g=battle('keo');
  g.fx=[{kind:'spell',hero:'keo',slot:1,x:10,y:20,a:0,max:.4,life:.15}];
  const fan=draw(g)[0];
  assert.ok(fan.ground||fan.lift>=fan.height/2);
  const n=battle('nadi');
  n.roster.nadi={discs:[{x:40,y:50,radius:80,at:n.t+.05}]};
  for(const reduced of [false,true]){
    const [seal]=draw(n,reduced);
    assert.ok(seal.lift>=seal.height/2);
  }
});

test('Skyfall paint travels with Nok above the floor warning until landing',()=>{
  const g=battle('nok');
  const destination={x:240,y:120};
  const leap={t:.225,dur:.45,tx:destination.x,ty:destination.y};
  g.sea={leap};g.p.x=120;g.p.y=60;
  g.fx=[{kind:'spell',hero:'nok',slot:4,...destination,r:181,max:1.5,life:1.275}];
  const [air]=draw(g);
  assert.deepEqual([air.x,air.y,air.lift,air.ground],[120,60,110,false]);
  const [still]=draw(g,true);
  assert.deepEqual([still.x,still.y],[120,60]);
  g.sea.leap=null;g.fx[0].life=1;
  const [impact]=draw(g);
  assert.deepEqual([impact.x,impact.y,impact.width,impact.ground],[240,120,362,true]);
});

for(const hero of ['asha','ustaz']){
  test(hero+' decorative return stays stationary in reduced motion',()=>{
    const g=battle(hero);
    const f={kind:hero==='asha'?'relay':'ring',hero,x:90,y:60,tx:10,ty:20,max:.5,life:.4};
    if(hero==='ustaz')f.flourish='return';
    g.fx=[f];
    const position=reduced=>{const [s]=draw(g,reduced);return [s.x,s.y,s.frame]};
    const before=position(true),moving=position(false);
    g.t+=.25;f.life-=.25;
    assert.deepEqual(position(true),before);
    assert.notDeepEqual(position(false).slice(0,2),moving.slice(0,2));
  });
}
