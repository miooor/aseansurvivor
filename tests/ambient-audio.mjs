// Procedural ambience checks: one distinct modal bed per stage, bounded notes,
// mood-sensitive density, and a safe fallback. Run: node tests/ambient-audio.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {AMBIENCE,stageProfile,ambientNote,melodyNote,renderMelodyPhrase} from '../src/game/ambient-audio.js';

const stageIds=[...readFileSync('src/content/core.js','utf8').matchAll(/^\s{2}\{id:'(\w+)',name:[^\n]*\blon:/gm)].map(m=>m[1]);

test('every stage has its own finite ambient profile',()=>{
  assert.ok(stageIds.length>=10,'found the stage registry');
  for(const id of stageIds)assert.ok(AMBIENCE[id],id+' has a profile');
  const shapes=stageIds.map(id=>JSON.stringify(AMBIENCE[id]));
  assert.equal(new Set(shapes).size,stageIds.length,'no two stages share a profile');
  for(const [id,p] of Object.entries(AMBIENCE)){
    assert.ok(Number.isFinite(p.root)&&p.root>40&&p.root<300,id+' root');
    assert.ok(p.scale.length>=4&&p.scale.every(n=>Number.isInteger(n)&&n>=0&&n<12),id+' mode');
    assert.ok(p.plucks.length>=4&&p.plucks.every(n=>Number.isInteger(n)&&n>=0),id+' pattern');
    assert.ok(p.beat>.3&&p.beat<2,id+' beat');
    assert.ok(p.gain>0&&p.gain<=.3,id+' gain');
    assert.ok(['sine','triangle','sawtooth'].includes(p.wave)&&['sine','triangle','sawtooth'].includes(p.pad),id+' timbre');
  }
});

test('notes follow the stage mode and stay in audible range for every mood',()=>{
  for(const [id,p] of Object.entries(AMBIENCE))for(const mood of ['explore','combat','boss','raid'])for(let step=0;step<32;step++){
    const n=ambientNote(p,mood,step);
    assert.ok(Number.isFinite(n.freq)&&n.freq>40&&n.freq<2000,id+' '+mood+' '+step+' frequency');
    assert.ok(Number.isFinite(n.gain)&&n.gain>=0&&n.gain<=.5,id+' '+mood+' '+step+' gain');
    const semis=Math.round(12*Math.log2(n.freq/p.root));
    assert.ok(p.scale.includes(((semis%12)+12)%12),id+' '+mood+' '+step+' stays in the mode');
  }
});

test('every stage has a melodic motif in its own mode',()=>{
  for(const [id,p] of Object.entries(AMBIENCE)){
    assert.ok(Array.isArray(p.motif)&&p.motif.length>=6,id+' motif');
    assert.ok(p.melodyGain>0&&p.melodyGain<=.2,id+' melody gain');
    for(const mood of ['explore','combat','boss','raid'])for(let step=0;step<48;step++){
      const n=melodyNote(p,mood,step);if(!n)continue;
      assert.ok(Number.isFinite(n.freq)&&n.freq>40&&n.freq<2000,id+' '+mood+' '+step+' frequency');
      const semis=Math.round(12*Math.log2(n.freq/p.root));
      assert.ok(p.scale.includes(((semis%12)+12)%12),id+' '+mood+' '+step+' stays in the mode');
    }
  }
});

test('the melody is a varying four-phrase cycle, not a random walk',()=>{
  const p=AMBIENCE.johor,len=p.motif.length;
  for(let step=0;step<len;step++)assert.deepEqual(melodyNote(p,'explore',step),melodyNote(p,'explore',step+len*4),'the cycle repeats');
  const first=melodyNote(p,'explore',0).freq;
  assert.notEqual(melodyNote(p,'explore',len).freq,first,'second phrase transposes');
  assert.notEqual(melodyNote(p,'explore',len*2).freq,first,'third phrase is retrograde');
  const pcm=renderMelodyPhrase(p,'explore',16);
  assert.ok(pcm.length>0&&pcm.every(Number.isFinite),'phrase renders to PCM');
});

test('mood changes melodic density and register',()=>{
  const p=AMBIENCE.johor;
  const active=mood=>Array.from({length:32},(_,i)=>melodyNote(p,mood,i)).filter(Boolean).length;
  assert.ok(active('combat')>active('explore'),'combat plays more melody notes');
  assert.ok(melodyNote(p,'boss',0).freq<melodyNote(p,'explore',0).freq,'boss sits lower');
  assert.ok(melodyNote(p,'raid',0).freq>melodyNote(p,'explore',0).freq,'raid sits higher');
});

test('tension moods are denser and the fallback is safe',()=>{
  const count=(mood)=>Array.from({length:24},(_,i)=>ambientNote(AMBIENCE.johor,mood,i)).filter(n=>n.layer==='pluck'||n.layer==='pulse').length;
  assert.ok(count('boss')>count('explore'),'boss adds pulse hits');
  assert.ok(count('raid')>count('combat'),'raid is denser than ordinary combat');
  assert.equal(stageProfile('missing-stage'),AMBIENCE.johor);
});
