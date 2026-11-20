import assert from 'node:assert/strict';
import {test} from 'node:test';
import {EQUIPMENT_SLOTS,ITEMS} from '../src/content/equipment.js';

import {installEquipment} from '../src/game/equipment.js';

const bases={
  weapon:'soundingRod',charm:'pulseLocket',relic:'cadenceDrum',head:'rainHood',
  chest:'fieldJacket',gloves:'gripWraps',belt:'techniqueSash',boots:'trailBoots'
};

function element(){
  return {style:{},dataset:{},children:[],setAttribute(){},focus(){},querySelector:element,
    append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},
    get firstChild(){return this.children[0];}};
}

test('elite selection splits equipped and starter draws evenly across eight eligible slots',t=>{
  globalThis.document={createElement:element};
  t.after(()=>{delete globalThis.document;});
  let roll=0;
  t.mock.method(Math,'random',()=>roll);
  for(const equipped of [true,false]){
    const counts=new Map();
    for(let index=0;index<8;index++){
      const nodes=new Map(),g={stage:{name:'Johor'}};
      const $=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
      const HOOKS={newGame:[],cleanup:[],dmgMul:[],cast:[]};
      const gear=installEquipment({G:g,HOOKS,$,canvas:element(),audio:{setPaused(){}},clearInput(){}});
      HOOKS.newGame[0](g);
      if(equipped)Object.assign(g.equipment,bases);
      const before={...g.equipment};
      // A regular offer already containing a family must still allow every
      // other empty slot to win the starter draw.
      const ordinary=[bases.head,'trailHelmet','lookoutCap'];
      g.rewards.push({event:'elite-1',slot:'head',offer:[...ordinary],consumed:false});
      roll=(index+.5)/8;
      gear.sync();
      const offer=g.rewards[0].offer;
      assert.deepEqual(offer.slice(0,3),ordinary);
      assert.equal(new Set(offer).size,offer.length);
      const added=offer.slice(3);
      const base=equipped?ITEMS[added[0]].upgradeFrom:(added[0]??bases.head);
      if(equipped)assert.deepEqual(added.sort(),Object.keys(ITEMS).filter(id=>ITEMS[id].upgradeFrom===base).sort());
      const slot=ITEMS[base].slot;
      counts.set(slot,(counts.get(slot)??0)+1);
      $('lootSkip').onclick();
      assert.deepEqual(g.equipment,before);
      assert.ok(g.rewards[0].consumed);
      gear.grant('quayManifest','relic');
      gear.sync();
      assert.equal(g.rewards[1].offer.length,3);
      assert.ok(g.rewards[1].offer.includes('quaySeal'));
      assert.ok(g.rewards[1].offer.every(id=>!ITEMS[id].upgradeFrom));
    }
    assert.deepEqual(Object.fromEntries(counts),Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,1])));
  }
});
