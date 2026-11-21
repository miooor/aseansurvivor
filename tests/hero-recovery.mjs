import assert from 'node:assert/strict';
import {heroArt} from '../src/content/hero-art.js';
import {skillPoses} from '../src/content/skill-visuals.js';
import {recoveryPose} from '../src/scenes/hero-recovery.ts';

assert.deepEqual(Object.keys(heroArt).sort(), Object.keys(skillPoses).sort());
assert.equal(Object.keys(heroArt).length, 12);
for (const id of Object.keys(heroArt)) {
  for (let dir = 0; dir < 8; dir++) {
    const travel = (dir + 4) % 8;
    const sample = (age, moving, reduced = false) => recoveryPose(id, age, dir, travel, moving, reduced, id==='rempit'||reduced ? 0 : 2);
    assert.equal(sample(-1, false), null);
    assert.equal(sample(1, true), null);
    for (const moving of [false, true]) {
      const frames = new Set();
      let last;
      for (let tick = 0; tick < 60; tick++) {
        const pose = sample(tick / 120, moving);
        if (!pose) break;
        assert.ok(['motion', 'skills'].includes(pose.sheet));
        assert.ok(Number.isInteger(pose.frame) && pose.frame >= 0 && pose.frame < 64);
        assert.equal(sample(tick / 120, moving, true).rotation, 0);
        frames.add(pose.sheet + pose.frame);
        last = pose;
      }
      assert.ok(frames.size >= 2, id);
      assert.equal(last.frame % 8, moving ? travel : dir);
      if (moving) assert.ok(last.frame < 32 && last.sheet === 'motion');
    }
  }
}
console.log('PASS · 12 heroes × 8 facings · stationary, moving, reduced motion and expiry');
