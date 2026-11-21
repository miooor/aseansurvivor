import assert from 'node:assert/strict';
import {SHRINES, shrineIds, rollShrine} from '../src/content/shrines.js';

assert.ok(shrineIds.length>=21);
assert.equal(new Set(shrineIds.map(id=>SHRINES[id].glyph)).size,shrineIds.length);
for(const [i,id] of shrineIds.entries()){
  assert.equal(rollShrine((i+.5)/shrineIds.length),id);
  assert.ok(SHRINES[id].description);
}
assert.equal(SHRINES.kingfisher.damage({hp:100,maxHp:100},{}),1.6);
assert.equal(SHRINES.kingfisher.damage({hp:80,maxHp:100},{}),1);
assert.equal(SHRINES.crocodile.damage({hp:25,maxHp:100},{}),1.75);
assert.equal(SHRINES.crocodile.damage({hp:26,maxHp:100},{}),1);
assert.equal(SHRINES.banyan.damage({boss:true},{}),1.5);
assert.equal(SHRINES.banyan.damage({},{}),1);
assert.equal(SHRINES.cinder.damage({},{dot:true}),2);
assert.equal(SHRINES.cinder.damage({},{}),1);
console.log('PASS · shrine catalog, equal-weight selection and conditional damage');
