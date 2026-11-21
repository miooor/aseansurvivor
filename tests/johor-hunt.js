import {ITEMS} from '../src/content/equipment.js';
// Accepted seam: real runtime in browser, actual HTML controls, deterministic staging.
// Failure scope: accidental activation, ambient kills resolving the event, duplicate
// rewards, stale run state, blocked actors, modal overlap and compounding modifiers.
const $=id=>document.getElementById(id),frame=$('game');let rt,doc;
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);doc=frame.contentDocument;$('run').disabled=false;$('status').textContent='Ready'}},100);
let checks=[];
function check(name,pass){checks.push({name,pass:!!pass});if(!pass)throw Error(name)}
function start(hero='ustaz',stage=0){rt.toMenu();rt.newGame(hero,stage);doc.getElementById('menu').hidden=true;const g=rt.G;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;g.p.invuln=999;g.noElements=true;return g}
function step(n=1){for(let i=0;i<n;i++)rt.scene.update(0,50)}
function click(id){if(id==='eventAbandon')doc.getElementById('eventDetails').open=true;const b=doc.getElementById(id);check(id+' is available',!!b&&!b.hidden&&!b.disabled);b.click()}
// The results screen ignores clicks for 350 ms after a defeat; step past that guard without running frames.
function pastGuard(fn){const perf=frame.contentWindow.performance,now=perf.now;perf.now=()=>now.call(perf)+1000;try{fn()}finally{delete perf.now}}
// Phones open the inventory from Pause (the HUD Gear button is hidden there); returns where focus should come back.
function openInventory(){const b=doc.getElementById('equipmentButton');if(b.getClientRects().length){click('equipmentButton');return b}step();click('pauseButton');click('pauseGear');return doc.getElementById('pauseGear')}
function equip(id,slot='relic'){const g=rt.G;g.rewards.push({event:'fixture-'+g.rewards.length,slot,offer:[id],consumed:false});step();const b=doc.querySelector('[data-item="'+id+'"]');check('Can choose '+id,!!b);b.click();}
function incoming(amount){const g=rt.G;g.p.invuln=0;g.eprojs.push({x:g.p.x,y:g.p.y,vx:0,vy:0,r:8,dmg:amount,life:1});step();}
function lantern(){const g=start();equip('lastLantern');g.p.hp=10;incoming(20);check('Lethal damage leaves hero at one HP',g.p.hp===1&&!g.over);check('Lethal rescue grants two seconds invulnerability',g.p.invuln>=1.95);}
$('run').onclick=async()=>{checks=[];let result='PASS',error;try{await rt.audio.unlock();equipmentArt();mixedReward();equipmentDrop();lantern();hunt();thorns();echo();bell();bounty();relicBoundaries();everyHero();eventBoundaries();queuedReward();reducedMotion();await rewardBoundaries()}catch(e){result='FAIL';error=e.message}finally{$('status').textContent=result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+' checks'+(error?' · '+error:'');$('report').textContent=JSON.stringify({date:new Date().toISOString(),result,error,checks},null,2);if(rt.G)rt.G.paused=true}};
$('download').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([$('report').textContent],{type:'application/json'}));a.href=url;a.download='johor-hunt-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

function equipmentArt(){
  const sheets=[
    ['items',5,5,'quaySeal supperCarrier tinMallet jettyKnot padiSheaf nipahBraid cengalMallet wauSpool thornEcho bountySeal aftershockBell lastLantern stillwaterBeads reedGuard lanternHeart travellersKnot splitEmber quarryHammer riverNeedle huntersEdge'],
    ['armor',5,3,'rainHood quiltedVest gripWraps techniqueSash trailBoots trailHelmet stormCape channelGloves toolBelt deckBoots lookoutCap fieldJacket workGloves wovenBelt monsoonBoots'],
    ['expansion',4,3,'relaySash flourishSash pursuitWraps breakerWraps watchJacket runnerJacket markerBlade tideLens wayfarerPin ferrySandals lookoutVisor rallyGong'],
    ['survey',4,4,'soundingRod faultRod tuningRod pulseLocket refugeLocket rallyLocket cadenceDrum thunderDrum rainDrum mistHood squallHood reedBoots switchbackBoots']
  ];
  const g=start();
  for(const [sheet,columns,rows,order] of sheets){
    const ids=order.split(' ');
    g.rewards.push({event:'art-'+sheet,slot:'weapon',offer:ids,consumed:false});
    step();
    for(const [i,id] of ids.entries()){
      const style=frame.contentWindow.getComputedStyle(doc.querySelector('[data-item="'+id+'"] .gear-art'));
      const matches=style.backgroundImage.includes('equipment-'+sheet+'.webp')
        &&style.backgroundSize===columns*100+'% '+rows*100+'%'
        &&Math.abs(parseFloat(style.backgroundPositionX)-(i%columns)*100/(columns-1))<.001
        &&Math.abs(parseFloat(style.backgroundPositionY)-Math.floor(i/columns)*100/(rows-1))<.001;
      check(id+' reward uses its illustrated tile',matches);
    }
    doc.getElementById('lootSkip').click();
    if(sheet==='survey')for(const id of ids){
      const {slot,upgradeFrom,name,description}=ITEMS[id];
      g.equipment[slot]=upgradeFrom??null;
      equip(id,slot);
      doc.getElementById('equipmentButton').click();
      const tile=doc.querySelector('.gear-slot[data-slot="'+slot+'"]');
      tile.click();
      check(id+' inventory has its illustration and effect',tile.querySelector('.gear-art.survey')
        &&tile.textContent.includes(name)&&doc.querySelector('.gear-detail').textContent.includes(description));
      doc.getElementById('lootClose').click();
    }
  }
}

function mixedReward(){
  const g=start();
  equip('techniqueSash','belt');
  equip('trailBoots','boots');
  g.rewards.push({event:'fixture-mixed',slot:'boots',offer:['deckBoots','relaySash'],consumed:false});
  step();
  const boots=doc.querySelector('[data-item="deckBoots"]'),sash=doc.querySelector('[data-item="relaySash"]');
  check('Each offer compares the item in its own slot',boots.textContent.includes('Trail Boots')
    &&sash.textContent.includes('Technique Sash')&&!sash.textContent.includes('Trail Boots'));
  check('Mixed offers show the effects being replaced',boots.textContent.includes('+10% movement speed.')
    &&sash.textContent.includes('Cast your Q skill one rank higher'));
  check('Reward opens with keyboard focus on the first choice',doc.activeElement===boots);
  sash.click();
  check('Taking the sash keeps equipped boots',g.equipment.belt==='relaySash'&&g.equipment.boots==='trailBoots');
  click('equipmentButton');
  doc.querySelector('.gear-slot[data-slot="belt"]').click();
  check('Inventory retains the upgrade ancestry',doc.querySelector('.gear-detail').textContent.includes('Technique Sash'));
  click('lootClose');
}

function equipmentDrop(){
  const g=start('ustaz',1);
  g.clock=45;step();
  const elite=g.enemies.find(e=>e.elite&&!e.encounter);
  check('Campaign spawns a regional elite',elite?.type==='lantern');
  const ordinary=rt.makeGhost('lantern',elite.x,elite.y);
  check('Elite has larger collision radius, health and damage',elite.r>ordinary.r&&elite.maxHp>ordinary.maxHp&&elite.dmg>ordinary.dmg);
  rt.kill(ordinary);step();
  check('Ordinary death leaves no equipment',g.equipmentDrops.length===0);
  Object.assign(elite,g.world.safePoint(g.p.x+160,g.p.y,elite.r));
  elite.skillT=0;step(15);
  check('Elite casts the regional three-bolt attack',elite.actions===1&&g.eprojs.length===3);
  elite.hp=1;damage(elite,100);
  const drop=g.equipmentDrops[0];
  check('Damage kill leaves one reachable drop without opening loot',g.equipmentDrops.length===1&&g.world.walkable(drop.x,drop.y,g.p.r)&&!g.lootModal&&!g.rewards.length);
  check('Ground equipment label is rendered',rt.scene.terrain.labels.group.children.some(o=>o.visible&&o.name.includes('Equipment')));
  rt.kill(elite);step();
  check('Repeated death leaves one drop',g.equipmentDrops.length===1);
  rt.raid.force('orb');rt.raid.enter();step();
  check('Raid isolates the ground drop',!!g.raid&&!g.equipmentDrops.length&&!g.rewards.length);
  rt.kill(g.raidBoss);step(65);
  check('Raid exit restores the same unclaimed drop',!g.raid&&g.equipmentDrops[0]===drop);
  Object.assign(g.p,{x:drop.x-50,y:drop.y});
  const win=frame.contentWindow;
  win.dispatchEvent(new win.KeyboardEvent('keydown',{code:'KeyD',key:'d'}));
  step(10);
  win.dispatchEvent(new win.KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
  check('Walking over equipment consumes it and opens one offer',!g.equipmentDrops.length&&g.rewards.length===1&&g.lootModal==='reward');
  const upgrades=Object.entries(ITEMS).filter(([,item])=>item.upgradeFrom);
  const choice=[...doc.querySelectorAll('#lootChoices button')].find(b=>upgrades.some(([,item])=>item.upgradeFrom===b.dataset.item));
  check('The first elite chest offers a refinable base',!!choice);
  const id=choice.dataset.item,slot=ITEMS[id].slot;
  const [child]=upgrades.find(([,item])=>item.upgradeFrom===id);
  choice.click();step(2);
  check('Equipment choice is applied once',g.equipment[slot]===id&&g.rewards.length===1&&!g.lootModal);
  g.clock=100;step(3);
  check('A later campaign elite can supply a second chest',g.enemies.filter(e=>e.elite&&!e.encounter&&!e.dead).length===1);
  g.clock=155;step(2);
  check('A surviving regional elite does not accumulate reinforcements',g.enemies.filter(e=>e.elite&&!e.encounter&&!e.dead).length===1);
  const nextElite=g.enemies.find(e=>e.elite&&!e.encounter&&!e.dead);
  rt.kill(nextElite,{damage:true});
  const secondDrop=g.equipmentDrops[0];
  Object.assign(g.p,{x:secondDrop.x,y:secondDrop.y});step(16);
  const refinement=doc.querySelector('[data-item="'+child+'"]');
  check('The second chest offers a branch for the chosen base',!!refinement);
  refinement.click();
  check('The branch replaces its base and restores gameplay focus',g.equipment[slot]===child&&!g.lootModal&&doc.activeElement===doc.getElementById('game'));
}

function hunt(){const g=start();Object.assign(g.p,{x:-1800,y:1400});step();check('Nearby hunt explains two sequential tracks',doc.getElementById('encounterPrompt').textContent.includes('two tracks'));check('Walking past never starts hunt',!g.enemies.some(e=>e.encounter==='hunt'));click('eventStart');check('First track is explicitly indicated',doc.getElementById('eventProgress').textContent.includes('Track 1 of 2'));let event=g.encounters.hunt;const first={x:event.x,y:event.y};Object.assign(g.p,first);step();click('eventInteract');check('Second track replaces first indication',doc.getElementById('eventProgress').textContent.includes('Track 2 of 2')&&Math.hypot(event.x-first.x,event.y-first.y)>120);Object.assign(g.p,{x:event.x,y:event.y});step();click('eventInteract');check('Two tracks reveal one named elite',g.enemies.filter(e=>e.encounter==='hunt').length===1&&g.enemies.some(e=>e.elite==='Thornbound'&&e.name==='Briarback'));check('Track controls disappear during hunt combat',doc.getElementById('eventInteract').hidden);const elite=g.enemies.find(e=>e.encounter==='hunt');elite.stun=999;elite.hp=1;g.st.crit=0;g.projs.push({x:elite.x,y:elite.y,vx:0,vy:0,r:6,dmg:10,life:1,pierce:1,hit:new Set()});step(2);check('Elite defeat offers three relic choices',doc.querySelectorAll('#lootChoices button').length===3&&doc.getElementById('lootCurrent').textContent.startsWith('relic'));}

function beginHunt(){const g=start();Object.assign(g.p,{x:-1800,y:1400});step();click('eventStart');for(let i=0;i<2;i++){Object.assign(g.p,{x:g.encounters.hunt.x,y:g.encounters.hunt.y});step();click('eventInteract')}g.enemies=g.enemies.filter(e=>e.encounter==='hunt');g.gems=[];return g;}
function thorns(){const g=beginHunt(),e=g.enemies[0];e.dmg=0;Object.assign(g.p,{x:e.x+150,y:e.y});e.skillT=0;step();check('Thornbound charge warns before rushing',e.windup>0);step(13);const patch=g.zones.find(z=>z.kind==='thorn');check('Thornbound charge leaves radius-35 warning patch',patch&&patch.r===35);e.stun=999;Object.assign(g.p,{x:patch.x,y:patch.y,invuln:0});const hp=g.p.hp;step(8);check('Thorn warning causes no damage before 0.6 seconds',g.p.hp===hp);step(5);check('Active thorn patch deals exactly eight damage',g.p.hp===hp-8);g.p.invuln=0;step(5);check('Thorns share a one-second player cooldown',g.p.hp===hp-8);g.paused=true;const life=patch.life;step(30);check('Pause freezes thorn lifetime',patch.life===life);g.paused=false;step(90);check('Thorn patches expire after four seconds',!g.zones.some(z=>z.kind==='thorn'));}

function target(g,x=100){const e=rt.makeGhost('pocong',g.p.x+x,g.p.y);e.hp=e.maxHp=10000;e.stun=999;g.st.crit=0;return e;}
function cast(slot){rt.G.cds[slot]=0;if(slot===4)rt.G.ult=rt.G.hero.ultNeed;rt.tryCast(slot);}
function echo(){const g=start();equip('thornEcho');equip('quarryHammer','weapon');step();const e=target(g),outside=target(g,150),audio=rt.audio.playCount;cast(2);cast(2);check('First two successful E casts do not pulse',e.hp===10000);rt.tryCast(2);check('Blocked cast does not pulse',e.hp===10000);cast(2);check('Third cast pulse receives additive weapon damage',Math.abs(e.hp-9964)<.001);check('Pulse does not hit beyond radius120',outside.hp===10000);check('Pulse has visible named feedback',g.texts.some(t=>t.s==='Thorn Echo'));check('Pulse creates no additional audio cue beyond throttled repeated E',rt.audio.playCount===audio+1&&rt.audio.lastCue==='ustaz-2');}

function damage(e,amount=100,options={}){const g=rt.G;g.st.crit=0;const before=e.hp;g.projs.push({x:e.x,y:e.y,vx:0,vy:0,r:6,dmg:amount,life:1,pierce:1,hit:new Set(),...options});step(4);return before-e.hp;}
function bell(){const g=start();equip('aftershockBell');equip('quarryHammer','weapon');const e=target(g,400);check('Bell inactive before ultimate',Math.abs(damage(e)-120)<.001);cast(4);check('Bell adds25 percent to weapon20 percent',Math.abs(damage(e)-145)<.001);g.zones=[];step(60);cast(4);g.zones=[];check('Second ultimate refreshes without stacking',Math.abs(damage(e)-145)<.001);g.paused=true;step(120);g.paused=false;check('Pause cannot expire Bell',Math.abs(damage(e)-145)<.001);step(101);check('Bell expires after five simulation seconds',Math.abs(damage(e)-120)<.001);}

const previews=document.createElement('div');previews.style.margin='12px 0';frame.before(previews);
for(const mode of ['track','thorns','reward','equipped']){const b=document.createElement('button');b.textContent='Preview '+mode;b.onclick=()=>{frame.style.width='100%';let g;if(mode==='track'){g=start();Object.assign(g.p,{x:-1800,y:1400});step();doc.getElementById('eventStart').click();Object.assign(g.p,{x:g.encounters.hunt.x,y:g.encounters.hunt.y});step();}else{g=beginHunt();const e=g.enemies.find(e=>e.elite);Object.assign(g.p,{x:e.x+150,y:e.y});if(mode==='thorns'){e.skillT=0;step(20);}else{e.stun=999;damage(e,10000);step();if(mode==='equipped'){doc.querySelector('#lootChoices button').click();step();click('equipmentButton');}}}g.paused=true;step();};previews.append(b);}

function bounty(){const g=start();equip('bountySeal');g.p.hp=50;g.ult=0;let e=target(g,250);e.elite='Thornbound';damage(e,1);check('Nonlethal elite hit gives no Bounty',g.p.hp===50&&g.ult===0);e.hp=1;damage(e,10);check('Confirmed elite death heals exactly15',g.p.hp===65);check('Confirmed elite death grants10 percentage points plus ordinary kill charge',Math.abs(g.ult-(g.hero.ultNeed*.1+1))<.001);const charge=g.ult,kills=g.kills;rt.kill(e);check('Duplicate death cannot duplicate Bounty or ordinary reward',g.p.hp===65&&g.ult===charge&&g.kills===kills);e=target(g,250);e.elite='Thornbound';rt.kill(e);check('Direct despawn cannot trigger Bounty',g.p.hp===65&&g.ult===charge+1);e=target(g,250);e.elite='Thornbound';e.hp=1;damage(e,10,{origin:'item'});check('Item-origin death cannot recursively trigger Bounty',g.p.hp===65&&g.ult===charge+2);g.p.hp=g.p.maxHp-1;g.ult=g.hero.ultNeed-1;e=target(g,250);e.elite='Thornbound';e.hp=1;damage(e,10,{dot:true});check('Periodic hero death grants Bounty with resource caps',g.p.hp===g.p.maxHp&&g.ult===g.hero.ultNeed);}

function relicBoundaries(){
  let g=start('lan');equip('thornEcho');const e=target(g);e.slowT=99;cast(2);cast(2);cast(2);check('Item pulse does not generate Lan signature charge',g.identity.charge===0);const count=g.itemState.thornEcho;damage(e,10,{origin:'item'});check('Item projectile cannot advance pulse counter',g.itemState.thornEcho===count);g.sea.allies=[];g.projs=[];g.cds[0]=0;step();check('Basic casts never advance pulse counter',g.itemState.thornEcho===count);cast(4);check('Ultimate never advances pulse counter',g.itemState.thornEcho===count);equip('aftershockBell');equip('thornEcho');check('Removing pulse item resets its count',!g.itemState.thornEcho);
  g=start();equip('lastLantern');g.p.hp=10;incoming(20);step(41);equip('aftershockBell');equip('lastLantern');incoming(20);check('Replacement cannot restore consumed lethal rescue',g.over&&g.p.hp===0);g=start();equip('lastLantern');g.p.hp=10;incoming(20);check('New run restores one lethal rescue',!g.over&&g.p.hp===1);
  g=start('nok');equip('lastLantern');cast(3);g.p.hp=10;incoming(12);check('Hero mitigation happens before lethal decision',Math.abs(g.p.hp-1.6)<.001&&!g.lastLanternUsed);step(8);incoming(20);check('Mitigated lethal damage still triggers Lantern',g.p.hp===1&&g.lastLanternUsed);
  g=start('sari');equip('lastLantern');cast(3);g.p.hp=10;incoming(20);check('Parry does not consume Last Lantern',g.p.hp===10&&!g.lastLanternUsed);
  g=start();equip('aftershockBell');cast(4);g.zones=[];equip('thornEcho');equip('aftershockBell');let probe=target(g,400);check('Replacing Bell removes its temporary bonus',Math.abs(damage(probe)-100)<.001);g.ult=0;rt.tryCast(4);check('Uncharged ultimate cannot activate Bell',Math.abs(damage(probe)-100)<.001);cast(4);g.zones=[];rt.raid.enter();check('Relic remains equipped in raid',!!g.raid&&g.equipment.relic==='aftershockBell');probe=target(g,300);check('Bell damage works inside raid',Math.abs(damage(probe)-125)<.001);
}
function everyHero(){
  for(const hero of ['ustaz','rempit','nok','lan','sari']){
    let g=start(hero);equip('thornEcho');const e=target(g,100);cast(2);cast(2);cast(2);check(hero+' can trigger Thorn Echo',g.texts.filter(t=>t.s==='Thorn Echo').length===1&&e.hp<10000);
    g=start(hero);equip('lastLantern');g.p.hp=10;incoming(20);check(hero+' survives lethal damage at one HP',g.p.hp===1&&!g.over);step(41);incoming(20);check(hero+' second lethal damage defeats normally',g.over&&g.p.hp===0);
    g=start(hero);equip('bountySeal');g.p.hp=50;g.ult=0;const elite=target(g,250);elite.elite='Thornbound';elite.hp=1;damage(elite,10);check(hero+' gets capped-compatible elite sustain',g.p.hp===65&&Math.abs(g.ult-(g.hero.ultNeed*.1+1))<.001);
    g=start(hero);equip('aftershockBell');const distant=target(g,1000);cast(4);check(hero+' gains ultimate damage bonus',Math.abs(damage(distant)-125)<.001);
  }
}
function reachable(g,point,label){check(label+' is collision-valid',g.world.walkable(point.x,point.y,35));const actor={x:0,y:0,r:24};for(let i=0;i<3000&&Math.hypot(actor.x-point.x,actor.y-point.y)>100;i++){const [dx,dy]=g.world.routeDirection(actor,point);Object.assign(actor,g.world.moveOnMap(actor.x,actor.y,actor.x+dx*30,actor.y+dy*30,24))}check(label+' is reachable from village',Math.hypot(actor.x-point.x,actor.y-point.y)<100);}
function eventBoundaries(){
  let g=start();const save=frame.contentWindow.localStorage.getItem('aseanSurvivor.v1');reachable(g,g.encounters.hunt,'Hunt marker');Object.assign(g.p,{x:-1800,y:1400});step();check('Hunt appears as named minimap marker',doc.querySelector('[data-event="hunt"]')?.textContent.includes('Thorn Hunt'));click('eventStart');reachable(g,g.encounters.hunt,'First track');Object.assign(g.p,{x:g.encounters.hunt.x,y:g.encounters.hunt.y});step();click('eventInteract');reachable(g,g.encounters.hunt,'Second track');Object.assign(g.p,{x:g.encounters.hunt.x,y:g.encounters.hunt.y});step();click('eventInteract');const elite=g.enemies.find(e=>e.encounter==='hunt');reachable(g,elite,'Briarback clearing');check('Thornbound health triples stage-scaled ordinary health once',Math.abs(elite.maxHp-195*(1+g.clock/150))<.2);check('Thornbound contact damage scales once',Math.abs(elite.dmg-15*Math.sqrt((1+g.clock/150)*g.diff))<.01);const ambient=target(g,250);rt.kill(ambient);step();check('Ambient death cannot complete hunt',g.encounters.hunt.status==='active'&&g.rewards.length===0);Object.assign(g.p,{x:0,y:0});step();check('Leaving grove does not abandon hunt',g.encounters.hunt.status==='active');rt.raid.spawnPortal();const portal=rt.raid.state.portal;rt.raid.enter();step(4);check('Hunt blocks raid without consuming rift lifetime',!g.raid&&portal.life===60);click('eventAbandon');check('Abandon is final and gives no reward',g.encounters.hunt.status==='abandoned'&&!g.rewards.length);check('Abandon removes all owned entities',!['enemies','projs','eprojs','zones','fx'].some(key=>g[key].some(x=>x.encounter==='hunt')));rt.raid.enter();check('Rift works after hunt abandonment',!!g.raid);check('Hunt operations preserve progression save',frame.contentWindow.localStorage.getItem('aseanSurvivor.v1')===save);
  g=beginHunt();const e=g.enemies[0];e.dmg=0;Object.assign(g.p,{x:e.x+150,y:e.y});e.skillT=0;step(24);check('One charge leaves at most five thorn patches',g.zones.filter(z=>z.kind==='thorn').length===5);const oldest=g.zones.find(z=>z.kind==='thorn');e.skillT=0;e.rush=0;step(14);check('Patch cap never truncates an existing four-second lifetime',g.zones.includes(oldest)&&oldest.life>0);e.stun=999;g.zones.forEach(z=>{z.x=g.p.x;z.y=g.p.y;z.life=3;});g.p.invuln=0;g.thornHitAt=0;const hp=g.p.hp;step();check('Five overlapping patches deal only one eight-damage hit',g.p.hp===hp-8);g.p.invuln=0;step(10);check('Overlap cannot bypass global one-second cooldown',g.p.hp===hp-8);click('eventAbandon');check('Abandon removes active thorn hazards',!g.zones.some(z=>z.kind==='thorn'));
  g=beginHunt();const victim=g.enemies[0];victim.stun=999;rt.kill(victim);step();check('Elite despawn cannot falsely grant completion',g.encounters.hunt.status==='active'&&g.rewards.length===0);rt.endGame(false);check('Defeat abandons unresolved hunt and clears choices',g.encounters.hunt.status==='abandoned'&&g.rewards.length===0);pastGuard(()=>click('again'));check('Retry returns hunt and equipment to fresh state',rt.G.encounters.hunt.status==='available'&&Object.values(rt.G.equipment).every(x=>x===null));
  g=beginHunt();const boss=target(g,400);boss.boss=true;boss.name='Fixture boss';rt.kill(boss);check('Boss victory abandons unresolved hunt without reward',g.encounters.hunt.status==='abandoned'&&g.rewards.length===0);
  for(let stage=1;stage<6;stage++){g=start('ustaz',stage);check('Stage '+stage+' has no Johor events or relic leakage',['rescue','ward','hunt'].every(id=>!g.encounters[id])&&Object.values(g.equipment).every(x=>x===null));}
}
async function rewardBoundaries(){
  for(const width of [320,390]){
    frame.style.width=width+'px';await new Promise(resolve=>setTimeout(resolve,150));let g=beginHunt();check(width+'px hunt prompt does not overflow',doc.documentElement.scrollWidth<=width);check(width+'px event touch targets are44px',[...doc.querySelectorAll('#encounterPrompt button, #eventDetails summary')].filter(b=>b.getClientRects().length).every(b=>b.getBoundingClientRect().height>=44));const elite=g.enemies[0];elite.stun=999;elite.hp=1;damage(elite,10);step();const choices=[...doc.querySelectorAll('#lootChoices button')];check(width+'px offers three distinct relics',choices.length===3&&new Set(choices.map(b=>b.dataset.item)).size===3);check(width+'px comparison does not overflow',doc.documentElement.scrollWidth<=width);const buttons=[...doc.querySelectorAll('#lootPanel button')].filter(b=>!b.hidden);check(width+'px reward targets are44px',buttons.every(b=>b.getBoundingClientRect().height>=44));buttons.at(-1).focus();frame.contentWindow.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown',{key:'Tab',code:'Tab',bubbles:true}));check(width+'px keyboard focus wraps',doc.activeElement===buttons[0]);const time=g.clock;step(10);check('Relic choice freezes survival clock',g.clock===time);const id=choices[0].dataset.item;choices[0].click();choices[1].click();check('Duplicate click cannot replace chosen relic',g.equipment.relic===id&&g.rewards.filter(r=>r.consumed).length===1);step();const inventory=openInventory();check('Inspection names equipped relic and all slots',doc.getElementById('lootCurrent').textContent.includes('relic:')&&doc.getElementById('lootCurrent').textContent.includes('weapon:'));frame.contentWindow.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));check('Escape closes inspection and restores focus',doc.getElementById('lootPanel').hidden&&doc.activeElement===inventory);
  }
  frame.style.width='100%';const g=beginHunt(),elite=g.enemies[0];elite.stun=999;elite.hp=1;damage(elite,10);g.gems=[];step();click('lootSkip');check('Skipping consumes relic reward without equipping',g.rewards[0].consumed&&g.equipment.relic===null);step();check('Skipped reward cannot reopen',doc.getElementById('lootPanel').hidden);
}

function queuedReward(){const g=beginHunt(),elite=g.enemies[0];elite.stun=999;elite.hp=1;g.st.crit=0;g.projs.push({x:elite.x,y:elite.y,vx:0,vy:0,r:6,dmg:10,life:1,pierce:1,hit:new Set()});step();g.gems=[];rt.addXP(g.need);step();check('Hunt level-up and reward never stack',g.choosing&&doc.getElementById('lootPanel').hidden);const time=g.clock;step(10);check('Level-up freezes hunt completion clock',g.clock===time);click('up0');step(2);check('Hunt relic choice survives queued level-up',g.encounters.hunt.status==='completed'&&!doc.getElementById('lootPanel').hidden&&g.rewards.length===1);click('lootSkip');}

function reducedMotion(){const win=frame.contentWindow,original=win.matchMedia;win.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:original.call(win,query);try{const g=beginHunt(),e=g.enemies[0];Object.assign(g.p,{x:e.x+150,y:e.y});e.skillT=0;step(20);check('Reduced motion retains thorn warning hazards',g.zones.some(z=>z.kind==='thorn'&&z.max-z.life<.6));check('Reduced motion retains named modifier label',rt.scene.terrain.labels.group.children.some(o=>o.isSprite&&o.name.includes('Briarback · Thornbound')));check('Reduced motion disables enemy swaying',[...rt.scene.sprites.values()].some(o=>o.key==='malaysia-monsters')&&[...rt.scene.sprites.values()].filter(o=>o.key==='malaysia-monsters').every(o=>o.rotation===0));}finally{win.matchMedia=original}}
