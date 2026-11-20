import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ITEMS,EQUIPMENT_SLOTS} from '../src/content/equipment.js';
import {describeEquipmentStats,equipmentCastRank,equipmentWalkMultiplier,incomingEquipmentMultiplier,installEquipment} from '../src/game/equipment.js';

function setup(){
  const g={hero:{id:'lan',hp:100,skills:[{}, {name:'Dragonwake',key:'Q'}, {name:'Relay',key:'E'}, {name:'Flourish',key:'F'}]},pass:{},p:{hp:95},upgradeStats:{health:0,speed:1,cooldown:1,pickup:1,damage:1}};
  const hooks={dmgMul:[],cast:[],newGame:[],cleanup:[]};
  const api={G:g,$:()=>({}),HOOKS:hooks};
  const gear=installEquipment(api);
  hooks.newGame.forEach(fn=>fn(g));
  gear.recalculate();
  return {g,gear,damage:(slot,enemy={},options={})=>hooks.dmgMul[0](enemy,{slot,...options})};
}

test('every registered slot starts empty and supports a three-way non-quest offer',()=>{
  const {g}=setup();
  assert.deepEqual(new Set(EQUIPMENT_SLOTS),new Set(['head','chest','gloves','belt','boots','weapon','charm','relic']));
  for(const slot of EQUIPMENT_SLOTS){
    assert.equal(g.equipment[slot],null);
    assert.ok(Object.values(ITEMS).filter(i=>i.slot===slot&&!i.quest).length>=3);
  }
});

test('typed attack and defense stack with general and conditional gear',()=>{
  const {g,gear,damage}=setup();
  Object.assign(g.equipment,{weapon:'riverNeedle',gloves:'gripWraps',chest:'quiltedVest',head:'rainHood'});
  gear.recalculate();
  assert.equal(damage(0,{slowT:1}),1.4);
  assert.equal(damage(2,{slowT:1}),1.25);
  assert.equal(damage(0,{slowT:1},{dot:true}),1.15);
  assert.equal(incomingEquipmentMultiplier(g,'physical'),.85);
  assert.equal(incomingEquipmentMultiplier(g,'skill'),.9);
  g.equipment.gloves='channelGloves';
  gear.recalculate();
  assert.equal(damage(0),1);
  assert.equal(damage(4),1.15);
  assert.match(describeEquipmentStats(g).join(' '),/15% skill damage/i);
});

test('technique gear raises only the equipped hero’s named Q, including at rank five',()=>{
  const {g,gear}=setup();
  g.equipment.belt='techniqueSash';
  gear.recalculate();
  assert.equal(equipmentCastRank(g,1,5),6);
  for(const slot of [0,2,3,4])assert.equal(equipmentCastRank(g,slot,5),5);
  assert.match(describeEquipmentStats(g).join(' '),/Dragonwake/);
  g.equipment.belt=null;
  gear.recalculate();
  assert.equal(equipmentCastRank(g,1,5),5);
  assert.doesNotMatch(describeEquipmentStats(g).join(' '),/Dragonwake/);
});

test('inspection includes active timed bonuses without applying target-specific damage universally',()=>{
  const {g}=setup();
  Object.assign(g.equipment,{relic:'aftershockBell',weapon:'huntersEdge'});
  g.t=3;
  g.itemState.aftershockBell=8;
  assert.match(describeEquipmentStats(g).join(' '),/25% all damage/);
  assert.doesNotMatch(describeEquipmentStats(g).join(' '),/55% all damage/);
  assert.match(describeEquipmentStats(g).join(' '),/30% more damage to elites and bosses/);
  g.t=8;
  assert.doesNotMatch(describeEquipmentStats(g).join(' '),/25% all damage/);
});

const branches={
  rainHood:['mistHood','squallHood'],
  trailBoots:['reedBoots','switchbackBoots'],
  techniqueSash:['relaySash','flourishSash'],
  gripWraps:['pursuitWraps','breakerWraps'],
  fieldJacket:['watchJacket','runnerJacket']
};

test('sash refinements retain Q and raise only their named second cast',()=>{
  const {g}=setup();
  for(const [index,id] of branches.techniqueSash.entries()){
    g.equipment.belt=id;
    assert.deepEqual([0,1,2,3,4].map(slot=>equipmentCastRank(g,slot,5)),
      index===0?[5,6,6,5,5]:[5,6,5,6,5]);
    assert.ok(describeEquipmentStats(g).some(line=>line.includes(index===0?'(E)':'(F)')));
  }
});

test('wrap refinements add damage only to qualifying direct basic hits',()=>{
  const {g,gear,damage}=setup();
  for(const [id,target] of [['pursuitWraps',{slowT:1}],['breakerWraps',{elite:'Elite'}],['breakerWraps',{boss:true}]]){
    g.equipment.gloves=id;
    gear.recalculate();
    assert.equal(damage(0),1.15);
    assert.equal(damage(0,target),1.4);
    assert.equal(damage(2,target),1);
    assert.equal(damage(0,target,{dot:true}),1.15);
    assert.equal(damage(0,target,{damageType:'environment'}),1);
  }
});

test('both jackets retain the base health once and specialize independently',()=>{
  const {g,gear}=setup();
  for(const id of branches.fieldJacket){
    g.equipment.chest=id;
    gear.recalculate();gear.recalculate();
    assert.equal(g.p.maxHp,135);
    assert.equal(g.p.hp,95);
    assert.equal(g.st.spd,id==='runnerJacket'?1.12:1);
    for(const type of ['skill','physical'])assert.equal(incomingEquipmentMultiplier(g,type),id==='watchJacket'?.9:1);
  }
});

test('queued elite chests offer current refinements across slots and consume one choice',t=>{
  const element=()=>({style:{},children:[],append(...children){this.children.push(...children);},
    setAttribute(){},replaceChildren(...children){this.children=children;},querySelector(){return element();},
    focus(){},get firstChild(){return this.children[0];},dataset:{}});
  globalThis.document={createElement:element};
  t.after(()=>{delete globalThis.document;});
  t.mock.method(Math,'random',()=>0);
  for(const [base,children] of Object.entries(branches)){
    const {g}=setup(),nodes=new Map(),slot=ITEMS[base].slot;
    const $=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
    const gear=installEquipment({G:g,$,HOOKS:{cast:[],newGame:[],cleanup:[],dmgMul:[]},
      canvas:element(),clearInput(){},audio:{setPaused(){}}});
    g.stage={name:'Johor'};
    gear.grant('elite-1',slot);gear.grant('elite-2','boots');gear.grant('elite-3','boots');
    gear.sync();
    const buttons=()=>$('lootChoices').children;
    buttons().find(b=>b.dataset.item===base).onclick();
    gear.sync();
    const offers=buttons().map(b=>b.dataset.item);
    const boots=offers.filter(id=>ITEMS[id].slot==='boots'&&!ITEMS[id].upgradeFrom);
    assert.equal(new Set(boots).size,3);
    assert.deepEqual(offers.filter(id=>!boots.includes(id)).sort(),[...children].sort());
    for(const id of children)assert.equal(ITEMS[id].upgradeFrom,base);
    const [first,second]=children.map(id=>buttons().find(b=>b.dataset.item===id));
    first.onclick();second.onclick();
    assert.equal(g.equipment[slot],children[0]);
    if(slot!=='boots')assert.equal(g.equipment.boots,null);
    gear.sync();
    assert.ok(buttons().every(b=>!ITEMS[b.dataset.item].upgradeFrom));
    $('lootSkip').onclick();
    assert.ok(g.rewards.every(r=>r.consumed));
    assert.equal(g.equipment[slot],children[0]);
  }
});

test('hoods trade sustained skill protection for a wounded skill-damage bonus',()=>{
  const {g,gear,damage}=setup();
  g.equipment.head='mistHood';
  gear.recalculate();
  assert.equal(incomingEquipmentMultiplier(g,'skill'),.75);
  assert.equal(incomingEquipmentMultiplier(g,'physical'),1);
  assert.ok(describeEquipmentStats(g).includes('+25% skill defense'));
  g.equipment.head='squallHood';
  gear.recalculate();
  assert.equal(incomingEquipmentMultiplier(g,'skill'),.9);
  g.p.hp=51;
  assert.equal(damage(1),1);
  assert.ok(!describeEquipmentStats(g).includes('+25% skill damage'));
  g.p.hp=50;
  assert.ok(describeEquipmentStats(g).includes('+25% skill damage'));
  assert.equal(damage(undefined),1.25);
  for(const slot of [1,2,3,4])assert.equal(damage(slot),1.25);
  assert.equal(damage(0),1);
  assert.equal(damage(1,{},{damageType:'environment'}),1);
  assert.ok(describeEquipmentStats(g).includes(ITEMS.squallHood.description));
  assert.ok(!describeEquipmentStats(g).includes('+25% all damage'));
});

test('boots retain trail speed and specialize in pickup reach or proximity movement',()=>{
  const {g,gear}=setup();
  g.pass.kemboja=1;
  g.upgradeStats.pickup=2;
  g.equipment.boots='reedBoots';
  gear.recalculate();
  const base=90*2*1.35;
  assert.equal(g.st.spd,1.1);
  assert.equal(g.st.pickup,base*1.5);
  assert.ok(describeEquipmentStats(g).includes('+50% pickup radius'));
  g.equipment.boots='switchbackBoots';
  Object.assign(g.p,{x:10,y:50});
  g.enemies=[{x:130,y:50,dead:true},{x:131,y:50}];
  gear.recalculate();
  assert.equal(g.st.spd,1.1);
  assert.equal(g.st.pickup,base);
  assert.equal(equipmentWalkMultiplier(g),1);
  g.enemies[1].x--;
  assert.equal(equipmentWalkMultiplier(g),1.2);
  assert.ok(describeEquipmentStats(g).includes(ITEMS.switchbackBoots.description));
  g.enemies=[];
  assert.equal(equipmentWalkMultiplier(g),1);
});
