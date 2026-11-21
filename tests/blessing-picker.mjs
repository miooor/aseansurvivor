import assert from 'node:assert/strict';
import {HEROES} from '../src/content/core.js';
import {availableEvolutions, newlyAvailableEvolutions, trackingCue, applyEvolution, skillChanges} from '../src/game/blessing-picker.js';

const first = {i:0,item:'kopi'}, second = {i:1,item:'kopi'};
const recipes = [first,second];
const game = {ranks:[5,5],pass:{},evo:{}};
const passive = {type:'pass',id:'kopi'};
assert.deepEqual(newlyAvailableEvolutions(game,recipes,passive), recipes);
game.evo[0] = true;
assert.deepEqual(newlyAvailableEvolutions(game,recipes,passive), [second]);
game.pass.kopi = 1;
assert.deepEqual(newlyAvailableEvolutions(game,recipes,passive), []);
assert.deepEqual(availableEvolutions(game,recipes), [second]);
game.evo = {};
game.ranks[1] = 4;
assert.deepEqual(newlyAvailableEvolutions(game,recipes,{type:'skill',i:1}), [second]);
game.ranks[1] = 3;
assert.deepEqual(newlyAvailableEvolutions(game,recipes,{type:'skill',i:1}), []);
game.trackedEvolution = 1;
assert.equal(trackingCue(game, second, {type:'skill',i:1}), 'Advances pin');
assert.equal(trackingCue(game, second, {type:'skill',i:0}), '');
assert.equal(trackingCue(game, second, passive), '');
game.pass.kopi = 0;
assert.equal(trackingCue(game, second, passive), 'Advances pin');
assert.equal(trackingCue(game, second, {type:'evo',ev:second}), 'Claim pinned evolution');
applyEvolution(game, first);
assert.equal(game.trackedEvolution, 1);
applyEvolution(game, second);
assert.equal(game.trackedEvolution, null);
assert.equal(game.evo[1], true);
const run = (id,i,rank,cd,extra={}) => skillChanges({
  hero:{id,skills:{[i]:{cd,ult:i===4}},basicDamage:12},ranks:{[i]:rank},st:{cd:.8},evo:{},...extra
},i).join(' · ');
assert.ok(run('ustaz',0,2,.85).includes('Bolts 1 → 2'));
assert.ok(!run('ustaz',0,1,.85).includes('Bolts'));
assert.ok(run('rempit',0,2,.7,{evo:{0:true}}).includes('Bounces 3 → 4'));
assert.ok(run('lan',2,4,14).includes('Base guards 4 → 5'));
assert.ok(run('nok',3,2,16).includes('Duration 8.75 → 9.5 s'));
assert.ok(!run('nok',3,2,16).includes('damage'));
assert.ok(run('ustaz',1,4,6,{equipment:{belt:'techniqueSash'}}).includes('Cooldown 3.46 → 3.12 s'));
assert.ok(!run('sari',4,2,0).includes('Cooldown'));
assert.ok(run('sari',4,2,0).includes('Feathers 13 → 14'));
assert.ok(run('sari',3,1,12,{technique:{duration:1.4,counter:.7}}).includes('Stance 3.5 → 3.85 s'));
assert.ok(run('ustaz',3,3,10,{technique:{stun:1.5}}).includes('Stun 1.95 → 2.175 s'));
assert.ok(run('ustaz',0,3,.85).includes('Targets per bolt 2 → 3'));
assert.ok(run('ustaz',1,4,6,{hero:HEROES.ustaz,equipment:{belt:'techniqueSash'}})
  .includes('Base hit 76 → 85.5'));
assert.ok(run('sari',3,1,12,{technique:{duration:1.4,counter:.7}})
  .includes('Base counter 28 → 35'));
assert.ok(run('rempit',0,2,.7,{hero:HEROES.rempit,evo:{0:true}})
  .includes('Base hit 17.875 → 21.45'));
console.log('Blessing picker behavior passed');

for(const id of ['rempit','nok','mira','asha','dani','vanna','keo','lia','sari']){
  const first=1;
  assert.ok(run(id,0,2,1).includes('Projectiles '+first+' → '+(first+1)),id);
}
assert.ok(run('nadi',0,2,1).includes('Targets 1 → 2'));
assert.ok(run('lan',0,4,1).includes('Puppets 3 → 4'));
assert.ok(run('sari',0,4,1,{evo:{0:true}}).includes('Projectiles 3 → 4'));
