import assert from 'node:assert/strict';
import {planPackMovement,selectPackAttack} from '../src/game/pack-tactics.js';

const field={walkable:()=>true,clearLine:()=>true};
const player={x:0,y:0,r:16,vx:150,vy:0,face:[1,0]};
const member=(type,x,y,extra={})=>({type,x,y,r:20,skillT:0,stun:0,...extra});
const prowler=member('belangProwler',180,30);
const crab=member('bakauBelangkas',70,-105);
const hornbill=member('enggangStormwing',100,130);
const guard=member('limestoneSeladang',215,80);
const pack=[prowler,crab,hornbill,guard];
const goals=planPackMovement(pack,player,player,field);
assert.ok(goals.get(prowler).x>0,'Prowler cuts ahead of moving player');
assert.ok(goals.get(crab).y<0&&goals.get(hornbill).y>0,'Ranged roles look for different flanks');
assert.ok(Math.hypot(goals.get(crab).x,goals.get(crab).y)>Math.hypot(crab.x,crab.y),'Crab backs out toward casting range');
assert.ok(Math.hypot(goals.get(guard).x-prowler.x,goals.get(guard).y-prowler.y)<156,'Seladang stays with its frontliner');

assert.equal(planPackMovement(pack,player,player,{...field,clearLine:()=>false}).size,0,
  'Blocked local positions fall back to shared navigation');

const reverse={...player,vx:-150,face:[-1,0]};
const reverseGoals=planPackMovement(pack,reverse,reverse,field);
assert.ok(reverseGoals.get(prowler)?.x<0||!reverseGoals.has(prowler),'A reversal invalidates the old forward goal');

const mate=member('enggangStormwing',-19,12);
const cast=selectPackAttack([mate,prowler],player,player,150,0,field);
assert.equal(cast.enemy,prowler,'Attack selection favors a usable angle over array order');
assert.deepEqual(cast.marks.map(mark=>mark.fired),[undefined],'Selection does not release damage');
assert.equal(selectPackAttack([prowler],player,player,150,0,{...field,walkable:(x,y,r)=>Math.abs(y)+r<=30}),null,
  'A warning that fills a narrow corridor waits for a viable dodge');
assert.equal(selectPackAttack([prowler],player,player,150,0,{...field,clearLine:()=>false}),null,'Blocked line prevents a charge');
assert.equal(selectPackAttack([{...prowler,packRecovery:.3}],player,player,150,0,field),null,'A recovering role cannot wind up');
assert.equal(selectPackAttack([{...prowler,stun:.2}],player,player,150,0,field),null,'A stunned role cannot take the cast turn');
const decoy={x:0,y:42,r:16};
const decoyCast=selectPackAttack([crab],player,decoy,150,0,field);
assert.equal(decoyCast.marks[0].y,decoy.y,'The pack aims at the existing decoy target');
console.log('PASS pack tactics');
