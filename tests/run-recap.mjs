import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRunRecap,observeExposure} from '../src/game/run-recap.js';
import {seededRandom} from '../src/game/run-random.js';

test('an Exposed window counts once across multiple hits and can reopen',()=>{
  const g={recap:createRunRecap(),p:{x:0,y:0}};
  const enemy={x:100,y:0,r:15,packRecovery:.75};
  observeExposure(g,enemy);
  observeExposure(g,enemy,true);
  observeExposure(g,enemy,true);
  assert.equal(g.recap.openings,1);
  assert.equal(g.recap.converted,1);
  enemy.packRecovery=0;
  observeExposure(g,enemy);
  enemy.packRecovery=.75;
  observeExposure(g,enemy);
  assert.equal(g.recap.openings,2);
  assert.equal(g.recap.converted,1);
});

test('offscreen openings count if converted at range',()=>{
  const g={recap:createRunRecap(),p:{x:0,y:0}};
  const enemy={x:800,y:0,r:15,packRecovery:.75};
  observeExposure(g,enemy);
  assert.equal(g.recap.openings,0);
  observeExposure(g,enemy,true);
  assert.equal(g.recap.openings,1);
  assert.equal(g.recap.converted,1);
});

test('run random streams restart at the same seed, including zero',()=>{
  const draws=seed=>{
    const random=seededRandom(seed);
    return Array.from({length:100},random);
  };
  assert.deepEqual(draws(0),draws(0));
  assert.notDeepEqual(draws(0),draws(1));
  assert.ok(draws(0xffffffff).every(n=>n>=0&&n<1));
});
