// Checks for the combat-integrity fixes: swept projectile hits, separate
// contact/telegraph i-frames, retryable elite waves, and the Shadow Lunge hitbox.
// Run: node tests/combat-integrity.mjs
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {segmentHitsCircle} from '../src/game/geometry.js';
import {blocksHit,armHitGrace,advanceHitGrace,CONTACT} from '../src/game/combat-policy.js';
import {runEliteWave,eliteWaveKey,eliteWaveDue} from '../src/game/elite-waves.js';
import {installRaid} from '../src/game/raid.js';

test('swept projectile hits catch a ghost crossed between frames',()=>{
  // A 50 ms clamped step moves a basic shot ~24 units; small ghosts are r=12.
  assert.equal(segmentHitsCircle(0,0,27,0,13,0,18),true,'crossed mid-step');
  assert.equal(segmentHitsCircle(0,0,27,0,13,25,18),false,'off the path');
  assert.equal(segmentHitsCircle(0,0,27,0,60,0,18),false,'beyond the step');
  assert.equal(segmentHitsCircle(0,0,0,0,5,0,6),true,'stationary overlap');
});

test('contact grace never swallows a telegraphed hit',()=>{
  const p={invuln:0,contactCd:0,super:0,shield:0};
  armHitGrace(p,CONTACT,.35);
  assert.equal(p.invuln,0,'contact must not arm global i-frames');
  assert.equal(blocksHit(p,CONTACT),true);
  assert.equal(blocksHit(p,'skill'),false,'a touching ghost cannot block a slam');
  armHitGrace(p,'skill',.35);
  assert.equal(blocksHit(p,CONTACT),true,'a real avoidable hit still protects');
  advanceHitGrace(p,.36);
  assert.equal(blocksHit(p,'skill'),false);
  assert.equal(blocksHit(p,CONTACT),false);
  p.invuln=.45; // dash/raid-entry i-frames still stop everything
  assert.equal(blocksHit(p,CONTACT),true);
});

test('a living elite leaves its wave armed instead of consuming the drop',()=>{
  const events=new Set(),calls=[];
  const elite={elite:'Elite',encounter:null,dead:false};
  const base={clock:100,bossAt:180,boss:null,won:false,events,enemies:[elite],spawn:i=>calls.push(i)};
  assert.equal(eliteWaveDue(1),100);
  assert.equal(runEliteWave(base),false,'wave held while the old elite lives');
  assert.equal(events.size,0,'the key must stay unused');
  elite.dead=true;
  assert.equal(runEliteWave(base),true,'the held wave spawns as soon as it can');
  assert.ok(events.has(eliteWaveKey(1)));
  assert.deepEqual(calls,[1]);
  assert.equal(runEliteWave(base),false,'each wave can fire only once');
  assert.deepEqual(calls,[1]);
  assert.equal(runEliteWave({...base,clock:45,events:new Set()}),true,'first wave independent');
  assert.equal(runEliteWave({...base,clock:100,boss:{}}),false,'boss suppresses waves');
});

test('Shadow Lunge hits inside its drawn lane, once, and misses outside it',()=>{
  const HOOKS={newGame:[],update:[],kill:[]};
  const hits=[],noop=()=>{};
  const api={
    rand:()=>.5,GHOSTS:{},TAU:Math.PI*2,banner:noop,juice:noop,puff:noop,
    $:()=>({textContent:'',classList:{add:noop}}),makeGhost:()=>({x:0,y:0,r:12}),
    showBossBar:noop,ring:noop,hideBossBar:noop,each:noop,text:noop,
    hurtPlayer:(a,type)=>hits.push({a,type}),tryCast:noop,updateSkillBar:noop,
    addXP:noop,dropCoin:noop,EVOS:{},HOOKS
  };
  const raid=installRaid(api);
  const A=raid.ARENA,start=A.x-260;
  const G={raid:null,raidBoss:null,p:null,enemies:[],eprojs:[],fx:[],gems:[],
    equipmentDrops:[],zones:[],durians:[],pups:[],auto:false,ult:0,hero:{ultNeed:100}};
  api.G=G;
  HOOKS.newGame[0](G);
  G.raid={t:0,entry:{x:start,y:A.y},stash:{},goal:'',outro:0,won:false};
  const R=raid.state;
  R.boss={x:start+220,y:A.y,r:40,state:'lunge',dmg:24,dead:false,p2:false,phase:0};
  G.raidBoss=R.boss;
  R.lane={x:start,y:A.y,dx:1,dy:0,len:400,w:50,k:1,wind:1,hit:false};
  G.p={x:start+200,y:A.y+10,r:16,hp:100};
  HOOKS.update[0](.016);
  assert.deepEqual(hits,[{a:24,type:'skill'}]);
  HOOKS.update[0](.016);
  assert.equal(hits.length,1,'one hit per lunge');

  hits.length=0;R.lane.hit=false;
  G.p={x:start+200,y:A.y+120,r:16,hp:100};
  HOOKS.update[0](.016);
  assert.equal(hits.length,0,'outside the telegraph is safe');
});
