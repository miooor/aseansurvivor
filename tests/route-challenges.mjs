import assert from 'node:assert/strict';
import {test} from 'node:test';
import {STAGES} from '../src/content/core.js';
import {ROUTE_CHALLENGES} from '../src/content/route-challenges.js';
import {REGIONAL_GHOSTS} from '../src/content/regional-ghosts.js';
import {createWorld} from '../src/content/world.js';
import {overlapsMonsterMark} from '../src/game/geometry.js';
import {veteranFormation} from '../src/game/route-challenges.js';

test('each stage has a reachable approach and walkable guard posts',()=>{
  assert.deepEqual(Object.keys(ROUTE_CHALLENGES).sort(),STAGES.map(stage=>stage.id).sort());
  for(const [id,route] of Object.entries(ROUTE_CHALLENGES)){
    const world=createWorld(id);
    assert.ok(world.walkable(route.entry.x,route.entry.y,16),id+' entry');
    assert.ok(world.routePath({x:0,y:0,r:16},route.entry).length,id+' reachable');
    for(const post of route.posts){
      assert.ok(world.walkable(post.x,post.y,REGIONAL_GHOSTS[post.type].r),id+' '+post.type+' post');
    }
    assert.equal(veteranFormation(world,id).length,2,id+' veteran hunting pair');
  }
});

test('Long Jetty attack covers the main deck and leaves the connected bypass open',()=>{
  const world=createWorld('penang');
  const [post]=ROUTE_CHALLENGES.penang.posts;
  const marks=post.skill.marks(post,post,0);
  const route=[{x:430,y:-1020},{x:430,y:-710},{x:1070,y:-710},{x:1070,y:-1020}];
  for(let n=1;n<route.length;n++){
    assert.ok(world.clearLine(route[n-1],route[n],16));
    for(let t=0;t<=1;t+=.05){
      const x=route[n-1].x+(route[n].x-route[n-1].x)*t;
      const y=route[n-1].y+(route[n].y-route[n-1].y)*t;
      assert.ok(!marks.some(mark=>overlapsMonsterMark({x,y,r:16},mark)));
    }
  }
  assert.ok(marks.some(mark=>overlapsMonsterMark({x:750,y:-1070,r:16},mark)));
});

test('Kedah slows the centre and pressures an alternate flank with a ranged lane',()=>{
  const [slow,ranged]=ROUTE_CHALLENGES.kedah.posts;
  const centre={x:1480,y:490,r:16},flank={x:1660,y:490,r:16};
  assert.ok(createWorld('kedah').clearLine({x:1660,y:330},{x:1660,y:630},16));
  assert.ok(slow.skill.brine>0);
  assert.ok(slow.skill.marks().some(mark=>overlapsMonsterMark(centre,mark)));
  assert.ok(!slow.skill.marks().some(mark=>overlapsMonsterMark(flank,mark)));
  assert.ok(ranged.skill.damage>0&&ranged.skill.marks().some(mark=>overlapsMonsterMark(flank,mark)));
  assert.ok(!ranged.skill.marks().some(mark=>overlapsMonsterMark(centre,mark)));
});
