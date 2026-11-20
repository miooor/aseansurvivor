import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createWorld} from '../src/content/world.js';
import {STAGES} from '../src/content/core.js';

for (const {id} of STAGES) {
  test(id + ' cache previews follow clear segments in both directions', () => {
    const world = createWorld(id);
    const origin = {x:0,y:0};
    for (const site of world.landmarks.filter(s => s.reward)) {
      for (const [start,end] of [[origin,site],[site,origin]]) {
        const route = world.routePath({...start,r:24},end);
        assert.ok(route.length >= 2,site.name);
        assert.deepEqual(route.map(({x,y}) => [x,y]).at(0),[start.x,start.y]);
        assert.deepEqual(route.map(({x,y}) => [x,y]).at(-1),[end.x,end.y]);
        assert.ok(route.slice(1).every((p,i) => world.clearLine(route[i],p,24)),site.name);
      }
    }
    const block = world.buildings[0];
    assert.deepEqual(world.routePath(origin,block),[]);
  });
}

test('Penang previews switch to the lowered gangway', () => {
  const world=createWorld('penang');
  const gate=world.gangway;
  const x=gate.x+gate.w/2;
  const north={x,y:gate.y-80,r:16},south={x,y:gate.y+gate.h+80};
  const detour=world.routePath(north,south);
  assert.ok(detour.length>2);
  assert.ok(detour.slice(1).every((p,i)=>world.clearLine(detour[i],p,16)));
  world.lowerGangway();
  assert.deepEqual(world.routePath(north,south),[north,south]);
});
