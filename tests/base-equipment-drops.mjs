import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ITEMS} from '../src/content/equipment.js';
import * as equipment from '../src/game/equipment.js';

const slots={markerBlade:'weapon',tideLens:'relic',wayfarerPin:'charm',ferrySandals:'boots',lookoutVisor:'head',rallyGong:'relic'};

function setup(id){
  const g={p:{x:100,y:50,hp:100},cds:[1,0,3,.25],pass:{},hero:{hp:100},upgradeStats:{damage:1,cooldown:1,speed:1,pickup:1,health:0}};
  const hooks={cast:[],newGame:[],cleanup:[],dmgMul:[]};
  const gear=equipment.installEquipment({G:g,HOOKS:hooks,$:()=>({})});
  hooks.newGame.forEach(fn=>fn(g));
  g.equipment[slots[id]]=id;
  gear.recalculate();
  return {g,gear,cast:slot=>hooks.cast.forEach(fn=>fn(slot,1)),hit:(e,options={})=>hooks.dmgMul[0](e,options)};
}

test('six standalone drops appear in their slot and disclose their conditions in inspection',t=>{
  const random=t.mock.method(Math,'random');
  for(const [id,slot] of Object.entries(slots)){
    assert.equal(ITEMS[id]?.slot,slot,id);
    assert.equal(ITEMS[id].quest,undefined);
    const {g,gear}=setup(id);
    const pool=Object.entries(ITEMS).filter(([,item])=>item.slot===slot&&!item.quest&&!item.upgradeFrom);
    random.mock.mockImplementation(()=>((pool.findIndex(([key])=>key===id)+.5)/pool.length));
    gear.grant('elite-1',slot);
    assert.ok(g.rewards[0].offer.includes(id),id);
    assert.ok(equipment.describeEquipmentStats(g).includes(ITEMS[id].description),id);
    assert.ok(!equipment.describeEquipmentStats(g).some(s=>s.endsWith('% all damage')),id);
  }
});

test('Marker Blade boosts direct opening hits only',()=>{
  const {hit}=setup('markerBlade');
  assert.equal(hit({hp:100,maxHp:100}),1.35);
  assert.equal(hit({hp:99,maxHp:100}),1);
  assert.equal(hit({hp:100,maxHp:100},{dot:true}),1);
  assert.equal(hit({hp:100,maxHp:100},{damageType:'environment'}),1);
});

test('Wayfarer Pin checks distance from the hero at impact',()=>{
  const {hit,g}=setup('wayfarerPin');
  const e={x:220,y:210};
  assert.equal(hit(e),1.18);
  g.p.x++;
  assert.equal(hit(e),1);
});

test('Tide Lens refunds other technique timers, capped at ready',()=>{
  const {cast,g}=setup('tideLens');
  g.cds[1]=2;
  cast(0);cast(4);
  assert.deepEqual(g.cds,[1,2,3,.25]);
  cast(1);
  assert.deepEqual(g.cds,[1,2,2.25,0]);
  g.equipment.relic=null;
  cast(2);
  assert.equal(g.cds[1],2);
});

test('Ferry Sandals give walking speed only while Q recharges',()=>{
  const {g}=setup('ferrySandals');
  assert.equal(equipment.equipmentWalkMultiplier(g),1);
  g.cds[1]=1;
  assert.equal(equipment.equipmentWalkMultiplier(g),1.18);
  g.equipment.boots=null;
  assert.equal(equipment.equipmentWalkMultiplier(g),1);
});

test('Lookout Visor reduces both damage types at or below 40% HP before the hit',()=>{
  const {g}=setup('lookoutVisor');
  g.p.hp=41;
  assert.equal(equipment.incomingEquipmentMultiplier(g,'physical'),1);
  g.p.hp=40;
  for(const type of ['physical','skill'])assert.equal(equipment.incomingEquipmentMultiplier(g,type),.78);
});

test('Rally Gong heals a fraction of missing health on ultimate casts',()=>{
  const {g,cast}=setup('rallyGong');
  g.p.hp=40;
  cast(3);
  assert.equal(g.p.hp,40);
  cast(4);
  assert.equal(g.p.hp,55);
  g.p.hp=100;
  cast(4);
  assert.equal(g.p.hp,100);
});
