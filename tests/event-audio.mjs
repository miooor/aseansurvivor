// Event-cue checks: every gameplay beat has a distinct, finite sound and is
// actually wired into a runtime or raid event site. Run: node tests/event-audio.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {EVENT_SOUNDS,renderEvent,EVENT_GAP} from '../src/game/event-audio.js';

test('every event cue is a distinct, finite, audible waveform',()=>{
  const names=Object.keys(EVENT_SOUNDS);
  assert.ok(names.length>=10,'a full set of gameplay beats is registered');
  const hashes=new Set();
  for(const name of names){
    const pcm=renderEvent(name);
    let peak=0,energy=0,hash=0;
    for(const v of pcm){
      assert.ok(Number.isFinite(v),name+' is finite');
      peak=Math.max(peak,Math.abs(v));energy+=v*v;hash=(hash*31+Math.round(v*32767))|0;
    }
    assert.ok(peak>.02&&peak<=.86,name+' is audible and unclipped');
    assert.ok(energy/pcm.length>.00001,name+' has energy');
    hashes.add(hash);
  }
  assert.equal(hashes.size,names.length,'no two cues share a waveform');
});

test('frequent pickups are rate-limited harder than one-shot events',()=>{
  assert.ok(EVENT_GAP.ember>=.3,'embers cannot machine-gun');
  assert.ok(EVENT_GAP.ember>EVENT_GAP.coin);
  assert.ok(EVENT_GAP.levelup>EVENT_GAP.coin);
});

test('every registered cue is wired to an event site',()=>{
  const src=readFileSync('src/game/runtime.js','utf8')+readFileSync('src/game/raid.js','utf8');
  const scene=readFileSync('src/scenes/SurvivalScene.ts','utf8');
  const tell=readFileSync('src/game/combat-readability.js','utf8');
  for(const name of Object.keys(EVENT_SOUNDS)){
    const combatTell=tell.includes("'"+name+"'")&&scene.includes('this.tellAudio.finish(this.runtime.audio');
    assert.ok(src.includes("cue('"+name+"'")||combatTell,name+' is played somewhere');
  }
});
