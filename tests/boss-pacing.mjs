// Unit checks for boss enrage. Run: node tests/boss-pacing.mjs
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {bossPace, BOSS_SPEED_FLOOR, ENRAGE_INTERVAL, ENRAGE_SPEED, ENRAGE_DAMAGE} from '../src/game/boss-pacing.js';

const boss = {speed: 72, damage: 20};
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

// Speed floor scales to the survivor; a boss already faster keeps its own speed.
for (const heroSpeed of [150, 235]) close(bossPace({...boss, heroSpeed, age: 0}).speed, heroSpeed * BOSS_SPEED_FLOOR);
assert.equal(bossPace({speed: 200, damage: 20, heroSpeed: 150, age: 0}).speed, 200);

// First minute matches today's damage; enrage steps land exactly on each interval.
assert.equal(bossPace({...boss, heroSpeed: 150, age: 59.9}).damage, 20);
assert.equal(bossPace({...boss, heroSpeed: 150, age: 59.9}).enrage, 0);
for (const level of [1, 2, 3, 4]) {
  const pace = bossPace({...boss, heroSpeed: 150, age: level * ENRAGE_INTERVAL});
  assert.equal(pace.enrage, level);
  close(pace.speed, 150 * BOSS_SPEED_FLOOR * (1 + ENRAGE_SPEED * level));
  close(pace.damage, 20 * (1 + ENRAGE_DAMAGE * level));
}

// By the third enrage the boss outpaces every survivor in the roster.
const sources = ['src/content/core.js', 'src/game/heroes-sea.js', ...readdirSync('src/game/heroes').map(f => 'src/game/heroes/' + f)];
const speeds = sources.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/\bid:'(\w+)'[^\n]*?\bspeed:(\d+)/g)].map(m => [m[1], +m[2]]));
assert.ok(speeds.length >= 12, 'found every survivor');
for (const [id, heroSpeed] of speeds) {
  assert.ok(bossPace({...boss, heroSpeed, age: 3 * ENRAGE_INTERVAL}).speed >= heroSpeed, id + ' is caught by the third enrage');
}

// Enrage continues increasing through and beyond the old five-minute limit.
for (const enrage of [5, 6, 15]) {
  assert.deepEqual(bossPace({...boss, heroSpeed: 150, age: enrage * ENRAGE_INTERVAL}), {
    enrage,
    speed: 120 * (1 + ENRAGE_SPEED * enrage),
    damage: 20 * (1 + ENRAGE_DAMAGE * enrage)
  });
}

console.log('PASS boss-pacing');
