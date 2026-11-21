import {NIGHT_FOES,NIGHT_ROSTERS} from '../src/content/night-foes.js';

export function checkNightFoes(w,check){
  const rt=w.__asean;
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  const start=(type,x=110)=>{
    rt.newGame('ustaz',0);
    const g=rt.G;
    g.auto=false;g.cds.fill(999);g.spawnT=g.pupT=g.durianT=999;g.st.crit=0;g.noElements=true;
    rt.raid.state.portalAt=Infinity;
    const e=rt.makeGhost(type,x,0);
    Object.assign(e,{spd:0,skillT:0});
    return {g,e};
  };
  check('Each of the 21 night foes has exactly one authored mechanic',Object.keys(NIGHT_FOES).length===21&&
    Object.values(NIGHT_FOES).every(m=>!!m.skill!==!!m.trait)&&new Set(Object.values(NIGHT_ROSTERS).flat()).size===21);

  for(const [type,monster] of Object.entries(NIGHT_FOES)){
    const {g,e}=start(type);
    rt.scene.update(0,0);
    check(monster.name+' has its own painted sprite',rt.scene.sprites.get(e)?.key==='malaysia-night-foes'&&
      rt.scene.sprites.get(e)?.frame.name===String(monster.frame));
    if(monster.skill){
      check(monster.name+' telegraphs '+monster.skill.name,e.windup>0&&g.p.hp===g.p.maxHp);
      for(let i=0;i<24&&!e.actions;i++)step();
      check(monster.name+' releases its single skill',e.actions===1);
    }
  }

  const wave=start('pocong',500).g;
  const rares=()=>wave.enemies.filter(enemy=>!enemy.dead&&NIGHT_FOES[enemy.type]);
  const spawnAt=clock=>{
    wave.clock=clock;wave.spawnT=0;
    step();
    wave.spawnT=999;
  };
  spawnAt(28);
  check('Regional rares wait for the first unlocked wave',rares().length===0);
  spawnAt(29);
  check('Johor introduces its first rare in a normal wave',rares()[0]?.type===NIGHT_ROSTERS.johor[0]);
  spawnAt(51);
  check('A new local rare enters when its clock unlocks',rares().some(e=>e.type===NIGHT_ROSTERS.johor[1]));
  // Johor resumes ordinary rare spawns after the 1:27 surround begins.
  spawnAt(88);
  check('Regular waves cap living regional rares at two',rares().length===2);

  const death=type=>{
    const {g,e}=start(type,190);
    rt.hit(e,9999,{element:'physical'});
    return {g,e};
  };
  const fire=death('arangBara');
  check('A charcoal brazier leaves a delayed ember on death',fire.g.nightHazards.length===1&&fire.g.p.hp===fire.g.p.maxHp);
  const fracture=death('bijihRetak');
  check('Fracturing tin splits once into two rewardless fragments',
    fracture.g.enemies.filter(e=>e.nightEcho==='fragment').length===2);
  const kills=fracture.g.kills;
  for(const e of fracture.g.enemies.filter(e=>e.nightEcho))rt.hit(e,9999);
  check('Fragments cannot split or generate additional rewards',fracture.g.kills===kills&&fracture.g.enemies.every(e=>e.dead));
  const gasp=death('kafanPenunggu');
  const echo=gasp.g.enemies.find(e=>e.nightEcho==='gasp');
  rt.hit(echo,9999);
  check('Final vigil persists briefly after death',!echo.dead);
  step(54);
  check('Final vigil expires on the combat clock',echo.dead);

  const {g,e}=start('gongJiwa',120);
  rt.hit(rt.makeGhost('pocong',180,0),9999);
  rt.hit(e,9999);
  step(24);
  const revived=g.enemies.find(e=>e.nightEcho==='revived');
  check('The gong restores a nearby fallen mob once',revived?.type==='pocong'&&!revived.dead);
  const drops=g.gems.length;
  rt.hit(revived,9999);
  check('Revived enemies do not generate another reward',g.gems.length===drops);

  const souls=start('kantungRoh',140);
  const oldDamage=souls.e.dmg;
  for(let i=0;i<7;i++)rt.hit(rt.makeGhost('pocong',160+i*7,0),9999);
  check('Ember Appetite gains damage from nearby deaths and caps its stacks',souls.e.nightSouls===5&&souls.e.dmg>oldDamage);

  const shell=start('kepahBenteng',210);
  const shellHp=shell.e.hp;
  rt.hit(shell.e,10);
  check('Shell Radius blocks attacks from outside its ring',shell.e.hp===shellHp);
  shell.g.p.x=95;
  rt.hit(shell.e,10);
  check('Shell Radius allows attacks from inside its ring',shell.e.hp===shellHp-10);

  for(const [type,absorbed,reflected] of [
    ['kulitDurian','fire','physical'],['kumbangPualam','physical','fire']
  ]){
    const {g,e}=start(type,170);
    rt.hit(e,10,{element:absorbed});
    check(type+' only reflects the advertised damage type',g.p.hp===g.p.maxHp);
    rt.hit(e,20,{element:reflected});
    check(type+' returns a bounded amount of matching damage',g.p.hp<g.p.maxHp&&g.p.hp>=g.p.maxHp-8);
  }
  const sap=start('getahMerah',180);
  rt.hit(sap.e,1);
  rt.hit(sap.e,1);
  check('Clinging Sap rate-limits repeated hits',sap.g.p.nightStatus.sapStacks===1);
  step(12);
  check('Clinging Sap deals delayed damage',sap.g.p.hp<sap.g.p.maxHp);

  const mirage=start('berukKilat',200);
  rt.hit(mirage.e,1);
  rt.hit(mirage.e,1);
  check('Thunder Double spawns one double per cooldown',mirage.g.nightHazards.length===1&&mirage.g.nightHazards[0].kind==='mirage');

  const lamp=start('pelitaHampa',130);
  lamp.g.kopiT=20;
  lamp.g.shrineId='monsoon';lamp.g.shrineT=6;
  step(18);
  check('Wick Snuff removes active timed pickup buffs on a hit',!lamp.g.kopiT&&!lamp.g.shrineId);

  const venom=start('ularBisa',25);
  step();
  check('Venom Touch poisons on real contact damage',venom.g.p.nightStatus.venom>venom.g.t);
  const frost=start('kabutCameron',160);
  step(36);
  check('Highland Rime chills on projectile impact',frost.g.p.nightStatus.chill>frost.g.t);

  const treasure=death('dulangHarta');
  rt.hit(rt.makeGhost('dulangHarta',190,0),9999);
  const chest=treasure.g.equipmentDrops[0];
  check('Treasure carrier drops one exclusive item per run',treasure.g.equipmentDrops.length===1&&chest.item==='dulangTimah');
  treasure.g.gems=[];
  Object.assign(treasure.g.p,{x:chest.x,y:chest.y});
  step(20);
  check('The player can collect the exclusive relic through the equipment flow',
    treasure.g.rewards.some(reward=>reward.offer.join()==='dulangTimah'));
  const option=w.document.querySelector('#lootChoices [data-item="dulangTimah"]');
  option?.click();
  check('The unique relic equips in the relic slot',treasure.g.equipment.relic==='dulangTimah');
  rt.toMenu();
}
