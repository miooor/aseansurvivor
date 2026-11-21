import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CombatTellAudio,isExposed} from '../src/game/combat-readability.js';
import {EVENT_GAP,renderEvent} from '../src/game/event-audio.js';

test('combat cues stay short and rate limited across separate sources',()=>{
  for(const name of ['danger','slowdown','exposed']){
    const seconds=renderEvent(name).length/22050;
    assert.ok(seconds>0&&seconds<.55,name+' fits into a brief reaction window');
    assert.ok(EVENT_GAP[name]>=seconds,name+' cannot overlap a repeat of itself');
  }
});

test('Exposed follows damage windows for living enemies',()=>{
  const enemy={type:'stalker',elite:'Armoured'};
  assert.equal(isExposed(enemy),false,'armour alone is not an opening');
  assert.equal(isExposed({...enemy,vulnerable:1.5}),true);
  assert.equal(isExposed({...enemy,vulnerable:0}),false);
  assert.equal(isExposed({type:'tenggilingRoller',rush:.1,stun:0}),false);
  assert.equal(isExposed({type:'tenggilingRoller',rush:.1,stun:.15}),true);
  assert.equal(isExposed({type:'tenggilingRoller',vulnerable:1}),true);
  assert.equal(isExposed({type:'belangProwler',packRecovery:.8}),true);
  assert.equal(isExposed({type:'pocong',vulnerable:1}),false);
  assert.equal(isExposed({...enemy,vulnerable:1.5,dead:true}),false);
});

test('simultaneous sources play a bounded number of cues when states begin',()=>{
  const tracker=new CombatTellAudio(),calls=[],audio={cue:name=>calls.push(name)};
  const run={},sources=Array.from({length:100},()=>({})),snare={};
  const frame=()=>{
    tracker.begin(run);
    for(const source of sources){
      tracker.danger(source,true);
      tracker.exposed(source,true);
    }
    tracker.slow(snare);
    tracker.finish(audio,true);
  };
  frame();
  frame();
  assert.deepEqual(calls,['danger','exposed','slowdown']);
});

test('updates seen during pause, offscreen or muted have no deferred cues',()=>{
  const tracker=new CombatTellAudio(),calls=[],audio={cue:name=>calls.push(name)};
  const run={},cast={},enemy={},slow={};
  tracker.begin(run);
  tracker.danger(cast,false);
  tracker.exposed(enemy,true);
  tracker.slow(slow);
  tracker.finish(audio,false);
  tracker.begin(run);
  tracker.danger(cast,true);
  tracker.exposed(enemy,true);
  tracker.slow(slow);
  tracker.finish(audio,true);
  assert.deepEqual(calls,[]);
  tracker.begin(run);
  tracker.finish(audio,true);
  tracker.begin(run);
  tracker.danger(cast,true);
  tracker.exposed(enemy,true);
  tracker.slow(slow);
  tracker.finish({cue:()=>false},true);
  tracker.begin(run);
  tracker.danger(cast,true);
  tracker.exposed(enemy,true);
  tracker.slow(slow);
  tracker.finish(audio,true);
  assert.deepEqual(calls,[],'an audio preference can drop a one-shot');
  tracker.begin({});
  tracker.exposed(enemy,true);
  tracker.finish(audio,true);
  assert.deepEqual(calls,['exposed'],'new run starts with fresh observations');
});
