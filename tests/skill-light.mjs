import assert from 'node:assert/strict';
import {test} from 'node:test';
import {drawSkillLight} from '../src/scenes/skill-light.ts';

const run=()=>({hero:{id:'ustaz'},fx:[],projs:[],roster:{},zones:[],t:1});
function sample(g,reduced=false){
  const marks=[];
  drawSkillLight({
    strip:(points,...style)=>marks.push({points,style}),
    glow:(point,...style)=>marks.push({points:[point],style})
  },g,reduced);
  return marks;
}

test('a returning shot trails behind its current direction and item shots keep their own cues',()=>{
  const g=run();
  g.projs=[{x:60,y:4,vx:-510,vy:0,r:6}];
  const marks=sample(g);
  assert.ok(marks.some(m=>m.points.some(([x])=>x>92)));
  assert.deepEqual(sample(g),marks);
  g.projs[0].origin='item';
  assert.deepEqual(sample(g),[]);
});

test('wave light expands inside its contact radius and reduced motion holds the geometry',()=>{
  const g=run(),f={kind:'ring',hero:'ustaz',x:300,y:10,r:120,max:.5,life:.43};
  g.fx=[f];
  const points=reduced=>sample(g,reduced).flatMap(m=>m.points);
  const first=points(false),still=points(true);
  f.life=.14;
  assert.notDeepEqual(points(false),first);
  assert.deepEqual(points(true),still);
  assert.ok(points(false).every(([x,y])=>Math.hypot(x-300,y-10)<=120.001));
  g.fx=[];
  assert.deepEqual(sample(g),[]);
});

test('Skyfall releases its light at the landing point after the leap',()=>{
  const g=run(),f={kind:'spell',skill:'nok-4',hero:'nok',slot:4,x:250,y:60,r:180,max:1.5,life:1.2};
  g.hero.id='nok';
  g.fx=[f];
  assert.deepEqual(sample(g),[]);
  f.life=.98;
  assert.ok(sample(g).length>0);
  f.life=.2;
  assert.deepEqual(sample(g),[]);
});

test('Sanctuary lights the ground and sends light upward until the ward expires',()=>{
  const g=run(),ward={kind:'barrier',slot:3,x:80,y:10,r:150,max:5,life:4};
  g.zones=[ward];
  const first=sample(g),still=sample(g,true);
  assert.ok(first.some(mark=>mark.points.length===1&&mark.style[0]>=ward.r));
  assert.ok(first.some(mark=>mark.points.some(point=>point[2]>70)));
  ward.life-=.3;
  assert.notDeepEqual(sample(g),first);
  assert.deepEqual(sample(g,true),still);
  g.zones=[];
  assert.deepEqual(sample(g),[]);
});
