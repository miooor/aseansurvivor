import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ITEMS} from '../src/content/equipment.js';
import {installCharms} from '../src/game/charms.js';
import {installEquipment} from '../src/game/equipment.js';

function setup(id,ui={}){
  const hooks={cast:[],newGame:[],cleanup:[],dmgMul:[],damage:[],hurt:[],update:[]};
  const g={t:0,ult:0,hero:{ultNeed:200},p:{x:0,y:0,hp:50,maxHp:100,invuln:0},cds:[0,5,5,5]};
  const target={x:300,y:20,stun:0},hits=[];
  const api={G:g,HOOKS:hooks,$:()=>({}),nearest:()=>target,ring(){},text(){},
    each(x,y,r,apply){if(Math.hypot(target.x-x,target.y-y)<=r)apply(target);},
    hit(e,value,options){hits.push({e,value,options});},...ui};
  const gear=installEquipment(api);
  installCharms(api);
  const reset=()=>hooks.newGame.forEach(fn=>fn(g));
  reset();
  g.equipment[ITEMS[id].slot]=id;
  return {g,gear,hits,target,reset,cast:slot=>hooks.cast.forEach(fn=>fn(slot,1)),hurt:()=>hooks.damage.forEach(fn=>fn(10))};
}

const families=[
  ['weapon','soundingRod','faultRod','tuningRod'],
  ['charm','pulseLocket','refugeLocket','rallyLocket'],
  ['relic','cadenceDrum','thunderDrum','rainDrum']
];

test('each ordinary base has exactly two elite refinements in its slot',()=>{
  for(const [slot,base,...branches] of families){
    assert.equal(ITEMS[base]?.slot,slot);
    assert.ok(!ITEMS[base].upgradeFrom&&!ITEMS[base].quest);
    assert.deepEqual(Object.keys(ITEMS).filter(id=>ITEMS[id].upgradeFrom===base).sort(),branches.sort());
    for(const id of branches)assert.equal(ITEMS[id].slot,slot);
  }
});

for(const id of families[0].slice(1))test(id+' releases one survey pulse after two basics',()=>{
  const {cast,hits,target,g,reset}=setup(id);
  cast(0);cast(1);
  assert.equal(hits.length,0);
  cast(0);cast(4);cast(2);cast(3);
  assert.deepEqual(hits,[{e:target,value:24,options:{origin:'item'}}]);
  assert.equal(target.stun,id==='faultRod'?.65:0);
  assert.deepEqual(g.cds,id==='tuningRod'?[0,4,5,4]:[0,5,5,5]);
  cast(0);reset();
  assert.deepEqual(g.itemState,{});
});

for(const id of families[1].slice(1))test(id+' answers damage with one timely technique',()=>{
  const {cast,hurt,g}=setup(id);
  cast(1);hurt();cast(0);cast(4);
  g.t=3.01;cast(2);
  assert.equal(g.p.hp,50);
  hurt();cast(3);hurt();cast(2);
  assert.equal(g.p.hp,55);
  assert.equal(g.p.invuln,id==='refugeLocket'?1:0);
  assert.equal(g.ult,id==='rallyLocket'?8:0);
  g.t+=8;g.p.hp=99;hurt();cast(2);
  assert.equal(g.p.hp,100);
});

for(const id of families[2].slice(1))test(id+' rewards spaced pairs of different techniques',()=>{
  const {g,cast,target,hits}=setup(id);
  target.x=50;
  cast(1);g.t=.5;cast(2);g.t=1.5;cast(2);g.t=6;cast(3);
  assert.equal(g.ult,0);
  cast(0);cast(4);g.t=7;cast(1);
  assert.equal(g.ult,8);
  assert.equal(g.p.hp,id==='rainDrum'?54:50);
  assert.equal(hits.length,id==='thunderDrum'?1:0);
  if(hits.length)assert.deepEqual(hits[0],{e:target,value:30,options:{origin:'item'}});
  g.t=8;cast(2);
  assert.equal(g.ult,8);
  g.ult=199;g.t=9;cast(1);
  assert.equal(g.ult,200);
});

test('ordinary drops reach elite refinement with fresh item state',t=>{
  function element(){
    return {style:{},dataset:{},children:[],setAttribute(){},focus(){},
      querySelector:element,append(...nodes){this.children.push(...nodes);},
      replaceChildren(...nodes){this.children=nodes;},get firstChild(){return this.children[0];}};
  }
  t.mock.method(Math,'random',()=>0);
  globalThis.document={createElement:element};
  t.after(()=>{delete globalThis.document;});
  for(const [slot,base,...branches] of families){
    for(const branch of branches){
      const nodes=new Map();
      const $=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
      const {g,gear,cast,hurt}=setup(base,{$,canvas:element(),clearInput(){},audio:{setPaused(){}}});
      Object.assign(g,{stage:{name:'Johor'},pass:{},upgradeStats:{damage:1,cooldown:1,speed:1,pickup:1,health:0}});
      g.hero.hp=100;
      g.equipment[slot]=null;
      const pool=Object.entries(ITEMS).filter(([,item])=>item.slot===slot&&!item.quest&&!item.upgradeFrom);
      const index=pool.findIndex(([id])=>id===base);
      Math.random.mock.mockImplementationOnce(()=> (index+.5)/pool.length);
      gear.grant('chest',slot);gear.sync();
      const choices=()=>$('lootChoices').children;
      choices().find(button=>button.dataset.item===base).onclick();
      cast(0);hurt();cast(slot==='relic'?1:0);
      assert.ok(Object.hasOwn(g.itemState,base));
      gear.grant('elite-1','boots');gear.sync();
      assert.ok(branches.every(id=>choices().some(button=>button.dataset.item===id)));
      choices().find(button=>button.dataset.item===branch).onclick();
      assert.equal(g.equipment[slot],branch);
      assert.deepEqual(g.itemState,{});
    }
  }
});
