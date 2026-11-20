import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createWorld} from '../src/content/world.js';
import {ITEMS} from '../src/content/equipment.js';
import {REGIONAL_QUESTS} from '../src/content/regional-quests.js';
import {installEquipment} from '../src/game/equipment.js';
import {installEncounters} from '../src/game/encounters.js';
import {installJettyGangway} from '../src/game/jetty-gangway.js';
import {installWauLookout} from '../src/game/wau-lookout.js';

function run(stage,practice=false){
  const elements=new Map();
  const $=id=>{
    if(!elements.has(id))elements.set(id,{dataset:{},style:{},setAttribute(){},getAttribute(){}});
    return elements.get(id);
  };
  const world=createWorld(stage);
  const g={world,t:0,clock:0,stage:{id:stage},practice,p:{x:0,y:0},exploration:{visited:[]},enemies:[],projs:[],eprojs:[],zones:[],fx:[]};
  const HOOKS={newGame:[],cleanup:[],update:[],dmgMul:[],damage:[]}, rewards=[];
  const api={G:g,$,HOOKS,safePoint:world.safePoint,banner(){},makeGhost(type,x,y){
    const enemy={...world.safePoint(x,y,24),type,hp:10,maxHp:10,dmg:1};
    g.enemies.push(enemy);
    return enemy;
  }};
  const encounters=installEncounters(api,{grant:(id,slot)=>rewards.push([id,slot]),sync(){}});
  const jetty=installJettyGangway(api);
  installWauLookout(api);
  HOOKS.newGame.forEach(fn=>fn(g));
  const event=g.encounters.rescue||Object.values(g.encounters)[0];
  const at=point=>Object.assign(g.p,{x:point.x,y:point.y});
  const tick=()=>{g.t+=.05;g.clock+=.05;HOOKS.update.forEach(fn=>fn(.05));encounters.sync();jetty.sync();};
  function start(){at(event);encounters.sync();$('eventStart').onclick();}
  return {g,event,at,tick,start,rewards,$,interact:()=>$('eventInteract').onclick(),abandon:encounters.abandon,
    cleanup:()=>HOOKS.cleanup.forEach(fn=>fn())};
}

test('Johor rescue, regroup, one ambush and joint arrival',()=>{
  const {g,event,at,start,tick,interact,rewards}=run('johor');
  start();interact();assert.equal(event.companion,undefined);
  assert.equal(g.enemies.length,6);
  g.enemies.forEach(e=>e.dead=true);tick();
  assert.equal(event.guidance,undefined);interact();
  const companion=event.companion;
  at({x:1350,y:900});tick();assert.equal(event.guidance.verb,'Regroup');
  assert.equal(companion.moving,false);assert.deepEqual(rewards,[]);
  let waves=0;
  for(let i=0;i<2000&&event.status==='active';i++){
    at(companion);tick();
    assert.ok(g.world.walkable(companion.x,companion.y,24));
    const wave=g.enemies.filter(e=>!e.dead);
    if(wave.length){waves++;assert.equal(event.guidance.verb,'Defeat');wave.forEach(e=>e.dead=true);}
  }
  assert.ok(Math.hypot(companion.x-1350,companion.y-900)<28);
  assert.equal(waves,1);assert.deepEqual(rewards,[['rescue','weapon']]);
  tick();interact();assert.equal(rewards.length,1);assert.equal(event.guidance,undefined);
});

for(const stage of ['melaka','kl','perak','penang','kedah','pahang','terengganu','kelantan']){
  for(const initiallyOpen of stage==='penang'?[false,true]:[false]){
    test(stage+' completes its landmark route'+(initiallyOpen?' with gangway already open':''),()=>{
      const {event,g,start,tick,at,interact,rewards,$}=run(stage);
      if(initiallyOpen)g.world.lowerGangway();
      start();
      const labels=new Set(),companion=event.companion;
      let neededWinch=false,crossedGangway=false;
      for(let i=0;i<4000&&event.status==='active';i++){
        const target=event.guidance;
        assert.ok(target.label&&target.verb&&g.world.walkable(target.x,target.y,20));
        labels.add(target.label);
        if(event.companion){
          assert.equal(event.companion,companion);at(companion);
          const gate=g.world.gangway;
          if(companion.y>=gate.y&&companion.y<=gate.y+gate.h&&companion.x>=gate.x&&companion.x<=gate.x+gate.w){
            assert.ok(gate.open);crossedGangway=true;
          }
        }else at(target);
        if(target.verb==='Lower'){neededWinch=true;$('jettyStart').onclick();}
        if(target.verb==='Raise')$('wauStart').onclick();
        if(target.verb==='Defeat')g.enemies.forEach(e=>e.dead=true);
        interact();tick();
      }
      assert.ok(labels.size>=2);assert.equal(rewards.length,1);assert.equal(event.status,'completed');
      assert.equal(event.companion,undefined);
      if(stage==='penang'){assert.equal(neededWinch,!initiallyOpen);assert.ok(crossedGangway);}
    });
  }
}
test('practice, abandonment and cleanup discard quest state',()=>{
  assert.deepEqual(run('kl',true).g.encounters,{});
  for(const end of ['abandon','cleanup']){
    const runState=run('penang');runState.start();runState[end]();runState.tick();
    assert.equal(runState.event.status,'abandoned');assert.equal(runState.event.companion,undefined);
    assert.equal(runState.event.guidance,undefined);assert.deepEqual(runState.rewards,[]);
  }
});

test('delivery requires each handoff in order and within reach',()=>{
  const {event,at,g,start,interact,rewards}=run('kl');
  start();const first={...event.guidance};
  interact();assert.deepEqual(event.guidance,first);
  at(first);g.paused=true;interact();assert.deepEqual(event.guidance,first);
  g.paused=false;interact();
  assert.equal(event.guidance.label,'Monorail Depot');assert.deepEqual(rewards,[]);
  interact();assert.deepEqual(rewards,[]);
  at(event.guidance);interact();interact();assert.deepEqual(rewards,[['hawkerDelivery','charm']]);
});

test('a regional offer includes its local reward and two ordinary choices',()=>{
  const g={rewards:[]},api={G:g,HOOKS:{dmgMul:[],cast:[],newGame:[],cleanup:[]},$:()=>({})};
  const equipment=installEquipment(api);
  for(const {id,slot} of [...Object.values(REGIONAL_QUESTS),{id:'rescue',slot:'weapon'}]){
    equipment.grant(id,slot);equipment.grant(id,slot);
    const entries=g.rewards.filter(r=>r.event===id);
    assert.equal(entries.length,1);
    const offer=entries[0].offer;
    assert.equal(new Set(offer).size,3);
    assert.ok(offer.every(key=>ITEMS[key].slot===slot));
    assert.deepEqual(offer.map(key=>ITEMS[key].quest).filter(Boolean),id==='rescue'?[]:[id]);
  }
});
