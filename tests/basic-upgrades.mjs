import test from 'node:test';
import assert from 'node:assert/strict';
import {upgradeBasicShot, basicContact, startBasicReturn, steerBasicReturn} from '../src/game/basic-volley.js';

test('a rank-five basic pierces, chains once, forks once and can strike again on return',()=>{
  const foe={x:20,y:0},other={x:20,y:50};
  const g={hero:{id:'lia',identity:{color:'#ccc'}},p:{x:0,y:0,r:12},fx:[]};
  const q={x:20,y:0,vx:100,vy:0,pierce:1,dmg:20,r:4,hit:new Set([foe]),life:.1,hitOptions:{slot:0}};
  upgradeBasicShot(q,5);
  const children=[],hits=[];
  const contact=()=>basicContact(g,q,foe,()=>other,(e,d)=>hits.push([e,d]),children);
  contact();contact();
  assert.equal(q.pierce,2);
  assert.deepEqual(hits,[[other,13]]);
  assert.equal(children.length,2);
  assert.ok(children[0].vy*children[1].vy<0);
  assert.ok(children.every(c=>c.dmg===10&&c.hit.has(foe)&&!c.basicRank));
  q.life=0;
  startBasicReturn(q);
  assert.ok(q.back&&!q.hit.size&&q.life>0);
  steerBasicReturn(q,g.p,.01);
  assert.ok(q.vx<0);
  q.life=0;startBasicReturn(q);assert.equal(q.life,0);
});
