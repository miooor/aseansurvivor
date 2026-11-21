import {STAGES} from '../src/content/core.js';
import {FOLKLORE_GHOSTS} from '../src/content/folklore-monsters.js';

const ARRIVALS=[
  {at:24,atlas:'malaysia-folklore'},
  {at:36,atlas:'malaysia-folklore-companion'},
  {at:53,atlas:'malaysia-folklore-third'},
  {at:66,atlas:'malaysia-folklore-fourth'}
];
const THIRD_DODGES={
  johor:['endauEagle','KeyS'],melaka:['rebanaEcho','KeyS'],kl:['nanasBramble','KeyD'],
  perak:['lenggongSnag','KeyS'],penang:['batuMaungPrint','KeyS'],kedah:['padiEmber','KeyS'],
  pahang:['whitewaterCroc','KeyD'],terengganu:['songketMoth','KeyS'],kelantan:['beringinShadow','KeyW']
};
// Points are offsets from the original aim. Probe a hit after the stated delay
// and a nearby safe point, then play the authored dodge with each input.
const FOURTH_CASTS={
  johor:{id:'wovenSteed',direction:[1,0],beat:.38,hit:[0,0],safe:[58,0]},
  melaka:{id:'lacquerClogs',direction:[1,0],beat:.56,hit:[-60,60],safe:[-60,7]},
  kl:{id:'crossStreetPewter',direction:[0,-1],beat:.52,hit:[70,0],safe:[70,-63]},
  perak:{id:'sayongSpill',direction:[0,-1],beat:.54,hit:[65,46],safe:[65,-8]},
  penang:{id:'jettyBanner',direction:[0,1],beat:.54,hit:[65,0],safe:[65,40]},
  kedah:{id:'twinPeaks',direction:[0,-1],beat:.55,hit:[0,0],safe:[0,-70]},
  pahang:{id:'candlenutRicochet',direction:[0,1],beat:.78,hit:[105,28],safe:[105,77]},
  terengganu:{id:'brassFoilfish',direction:[-1,0],steps:12,beat:0,hit:[0,0],safe:[-58,0]},
  kelantan:{id:'merbauSpinner',direction:[0,-1],beat:.46,hit:[-54,65],safe:[-137,65]}
};
const baseGates={pocong:0,toyol:15,penanggal:40,minyak:60};
const lastArrival=ARRIVALS.at(-1).at;
const variants=Object.fromEntries(STAGES.map(stage=>[stage.id,Object.keys(stage.folklore)]));
const selangorRoster=['quayPelanduk','quaysideSamambu','whitewaterCroc','jettyBanner'];

export function checkFolkloreMonsters(rt,document,check){
  const step=(count=1)=>{for(let i=0;i<count;i++)rt.scene.update(0,50);};
  function start(stage,practice=false){
    rt.toMenu();
    rt.newGame('ustaz',STAGES.findIndex(entry=>entry.id===stage),practice);
    const g=rt.G;
    g.auto=false;
    g.cds.fill(999);
    g.spawnT=g.pupT=g.durianT=999;
    return g;
  }

  const frames=new Set();
  for(const stage of STAGES){
    const g=start(stage.id),ids=variants[stage.id];
    g.p.invuln=999;
    // The randomly timed raid notice shares the banner with campaign arrivals.
    rt.raid.state.portalAt=Infinity;
    const count=type=>g.enemies.filter(e=>e.type===type).length;
    const spawnWave=(time,value)=>{
      g.clock=time;
      g.spawnT=0;
      const random=g.random;
      g.random=()=>value;
      try{step();}finally{g.random=random;}
      g.spawnT=999;
    };
    const weightedSample=(time,type)=>{
      const eligible=Object.entries(stage.ghosts).filter(([id])=>time>=(baseGates[id]??stage.folklore[id]?.waveAt??stage.waveSpecialists[id]?.at??8));
      const total=eligible.reduce((sum,[,weight])=>sum+weight,0);
      let start=0;
      for(const [id,weight] of eligible){
        if(id===type)return (start+weight/2)/total;
        start+=weight;
      }
      throw Error(type+' is missing from the wave pool at '+time+' seconds');
    };
    check(stage.name+' has '+ARRIVALS.length+' local folklore variants with a combined recurring weight of 0.5',
      ids.length===ARRIVALS.length&&(stage.id==='selangor'?ids.join()===selangorRoster.join():
        ids[2]===THIRD_DODGES[stage.id][0]&&ids[3]===FOURTH_CASTS[stage.id].id)&&
      Object.keys(stage.ghosts).filter(id=>id in FOLKLORE_GHOSTS).join()===ids.join()&&
      Math.abs(ids.reduce((sum,id)=>sum+stage.ghosts[id],0)-.5)<1e-9);
    if(ids.length!==ARRIVALS.length)throw Error(stage.name+' folklore roster is incomplete');
    spawnWave(23.9,.999);
    check(stage.name+' holds all variants back before their arrivals',ids.every(id=>!count(id)));

    for(const [slot,{at,atlas}] of ARRIVALS.entries()){
      const type=ids[slot];
      if(slot===2){
        g.clock=44.99;
        step();
        check(stage.name+' shows the regional elite banner before the third folklore debut',
          count(type)===0&&g.enemies.some(e=>e.elite&&e.type===g.world.signature)&&
          document.querySelector('#banner').textContent.startsWith('Elite '));
        step(70);
        check(stage.name+' clears the elite banner before the third folklore debut',
          count(type)===0&&!document.querySelector('#banner').classList.contains('show'));
      }
      g.clock=at-.1;
      step();
      check(stage.name+' holds variant '+(slot+1)+' until its debut time',count(type)===0);
      g.clock=at-.01;
      step();
      const enemies=g.enemies.filter(e=>e.type===type);
      const enemy=enemies[0],sprite=rt.scene.sprites.get(enemy);
      check(stage.name+' introduces variant '+(slot+1)+' once at '+at+' seconds',
        enemies.length===1&&document.querySelector('#banner').textContent.startsWith(FOLKLORE_GHOSTS[type].name+'!'));
      step(2);
      check(stage.name+' does not duplicate variant '+(slot+1)+' on the next updates',count(type)===1);
      check(stage.name+' places the arrival nearby on walkable ground',
        !!enemy&&Math.hypot(enemy.x-g.p.x,enemy.y-g.p.y)<=280&&g.world.walkable(enemy.x,enemy.y,enemy.r));
      check(stage.name+' renders variant '+(slot+1)+' on its assigned atlas frame',
        sprite?.key===atlas&&Number(sprite.frame.name)===FOLKLORE_GHOSTS[type].frame);
      if(sprite)frames.add(sprite.key+'/'+sprite.frame.name);
      spawnWave(at+5.9,.999);
      check(stage.name+' keeps variant '+(slot+1)+' out of waves for six seconds after its debut',count(type)===1);
      const before=ids.map(count);
      spawnWave(at+6,weightedSample(at+6,type));
      check(stage.name+' includes variant '+(slot+1)+' in ordinary waves after its grace period',
        ids.every((id,i)=>count(id)-before[i]===(i===slot?1+Math.floor((at+6)/50):0)));
    }
    const allEligibleAt=lastArrival+6;
    check(stage.name+' keeps the pocong ring after the final debut',!g.events.has('ring1'));
    for(const [slot,type] of ids.entries()){
      const before=count(type);
      spawnWave(allEligibleAt,weightedSample(allEligibleAt,type));
      check(stage.name+' retains variant '+(slot+1)+' in ordinary waves once all are eligible',count(type)===before+2);
    }
    g.clock=74.99;
    step();
    if(stage.id==='johor'){
      check(stage.name+' holds the pocong ring past 75 seconds',!g.events.has('ring1'));
    }else{
      check(stage.name+' still triggers the pocong ring at 75 seconds',g.events.has('ring1'));
    }
  }
  const expectedFrames=new Set(Object.values(variants).flat()).size;
  check('All '+expectedFrames+' folklore enemies use unique atlas frames',
    frames.size===expectedFrames&&Object.keys(FOLKLORE_GHOSTS).length===expectedFrames);
  const retried=start('johor');
  retried.clock=lastArrival;
  step();
  check('Retry resets all one-time folklore arrivals',variants.johor.every(id=>retried.enemies.filter(e=>e.type===id).length===1));
  const practice=start('johor',true);
  practice.clock=lastArrival+6;
  practice.spawnT=0;
  step();
  check('Practice excludes folklore arrivals and waves',!practice.enemies.some(e=>variants.johor.includes(e.type)));

  const raiding=start('johor');
  raiding.clock=lastArrival+6;
  raiding.spawnT=0;
  rt.raid.enter();
  step();
  check('The Hantu Raya raid excludes all campaign folklore variants and their arrivals',
    raiding.raid&&raiding.raidBoss?.type==='raya'&&!raiding.enemies.some(e=>variants.johor.includes(e.type)));

  function encounter(stage,x,slot=0){
    const g=start(stage);
    Object.assign(g.p,{x,y:0});
    const e=rt.makeGhost(variants[stage][slot],0,0);
    Object.assign(e,{spd:0,skillT:0});
    step();
    check(stage+' telegraphs before it deals skill damage',e.windup>0&&g.p.hp===g.p.maxHp);
    return {g,e};
  }
  const ledang=encounter('johor',140);
  const windup=ledang.e.windup;
  ledang.g.paused=true;
  step(20);
  check('Pausing freezes folklore windups',ledang.e.windup===windup&&ledang.e.actions===0);
  ledang.g.paused=false;
  Object.assign(ledang.g.p,{x:140,y:52});
  step(22);
  check('Ledang bridge lanes keep their original bearing and hit a player who crosses one',
    ledang.e.actions===1&&ledang.g.p.hp<ledang.g.p.maxHp);
  const gap=encounter('johor',140);
  step(22);
  check('The gap between the Ledang bridge lanes is safe',gap.e.actions===1&&gap.g.p.hp===gap.g.p.maxHp);

  const galah=encounter('kl',120);
  galah.g.p.x=54;
  step(22);
  check('The Galah sweep has a safe inner pocket',galah.e.actions===1&&galah.g.p.hp===galah.g.p.maxHp);
  const caught=encounter('kl',120);
  step(22);
  check('Standing in the Galah sweep damages the player',caught.g.p.hp<caught.g.p.maxHp);

  const tide=encounter('penang',160);
  tide.g.p.x=258;
  for(let i=0;i<25&&!tide.e.actions;i++)step();
  check('Leaving the marked Jetty Tideback splash avoids its first hit',tide.g.p.hp===tide.g.p.maxHp);
  step(12);
  check('The outer surge follows the splash around its original center',tide.g.p.hp<tide.g.p.maxHp);

  const wake=encounter('pahang',225);
  for(let i=0;i<25&&!wake.e.actions;i++)step();
  check('Chini Wake strikes the first mark before the second',wake.e.actions===1&&wake.g.p.hp===wake.g.p.maxHp);
  step(8);
  check('Chini Wake hits the second marked spot after a delay',wake.g.p.hp<wake.g.p.maxHp);
  const cancelled=encounter('pahang',225);
  cancelled.e.dead=true;
  step(30);
  check('Defeating Chini Wake during windup cancels the cast',cancelled.g.p.hp===cancelled.g.p.maxHp);

  const drongo=encounter('kl',175,1);
  Object.assign(drongo.g.p,{x:175,y:78});
  for(let i=0;i<25&&!drongo.e.actions;i++)step();
  check('A sidestep clears the first Drongo lane',drongo.e.actions===1&&drongo.g.p.hp===drongo.g.p.maxHp);
  step(13);
  check('The delayed cross lane still hits at the original bearing',drongo.g.p.hp<drongo.g.p.maxHp);

  const gold=encounter('penang',165,1);
  for(let i=0;i<25&&!gold.e.actions;i++)step();
  check('The Gold Jar ring leaves the original position safe initially',gold.e.actions===1&&gold.g.p.hp===gold.g.p.maxHp);
  step(14);
  check('Its delayed center strike punishes staying in the pocket',gold.g.p.hp<gold.g.p.maxHp);
  const escaped=encounter('penang',165,1);
  for(let i=0;i<25&&!escaped.e.actions;i++)step();
  const win=document.defaultView;
  const move=event=>win.dispatchEvent(new win.KeyboardEvent(event,{code:'KeyS'}));
  move('keydown');
  try{step(14);}finally{move('keyup');}
  check('Fadli can walk from the center into the spent ring after it breaks',
    escaped.e.folkloreMarks[1].fired&&escaped.g.p.y>53+escaped.g.p.r&&escaped.g.p.hp===escaped.g.p.maxHp);
  const broken=encounter('penang',165,1);
  for(let i=0;i<25&&!broken.e.actions;i++)step();
  broken.e.dead=true;
  step(16);
  check('Defeating the Gold Jar after the ring cancels its pending center strike',broken.g.p.hp===broken.g.p.maxHp);

  const goldWarning=encounter('penang',165,1);
  const ring=goldWarning.e.folkloreMarks[0],floor=rt.scene.floor;
  const matchMedia=win.matchMedia,fillRing=floor.fillRing;
  let drewWarning=false;
  win.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:matchMedia.call(win,query);
  floor.fillRing=function(x,y,r,inner){
    if(x===ring.x&&y===ring.y&&r===ring.r&&inner===ring.inner)drewWarning=true;
    return fillRing.call(this,x,y,r,inner);
  };
  try{
    step(4);
    check('Reduced motion keeps the Gold Jar ring legible and holds the sprite still',
      drewWarning&&rt.scene.sprites.get(goldWarning.e)?.rotation===0);
  }finally{
    floor.fillRing=fillRing;
    win.matchMedia=matchMedia;
  }

  const wells=encounter('kedah',175,1);
  check('Seven Wells Shard telegraphs seven fixed pools',wells.e.folkloreMarks?.length===7);
  Object.assign(wells.g.p,{x:175,y:-75});
  step(40);
  check('The gap between the marked pools stays safe through both pulses',wells.e.actions===1&&wells.g.p.hp===wells.g.p.maxHp);

  for(const [stage,[id,code]] of Object.entries(THIRD_DODGES)){
    const standing=encounter(stage,145,2);
    step(34);
    check(id+' punishes standing on the aim point',
      standing.e.actions===1&&standing.g.p.hp<standing.g.p.maxHp);
    const dodged=encounter(stage,145,2);
    const move=type=>win.dispatchEvent(new win.KeyboardEvent(type,{code}));
    move('keydown');
    try{step(26);}finally{move('keyup');}
    step(8);
    check(id+' gives Fadli time to clear the full cast with the indicated dodge',
      dodged.e.actions===1&&dodged.g.p.hp===dodged.g.p.maxHp&&Math.hypot(dodged.g.p.x-145,dodged.g.p.y)>50);
  }

  const edge=encounter('johor',145,2);
  Object.assign(edge.g.p,{x:145,y:35});
  step(34);
  check('The eagle dive catches a player whose hit radius overlaps the tapered edge',
    edge.g.p.hp<edge.g.p.maxHp);

  const bramble=encounter('kl',145,2);
  for(let i=0;i<30&&!bramble.e.actions;i++)step();
  check('Nanas Bramble leaves the middle of the hedge safe for the first strike',
    bramble.e.actions===1&&bramble.g.p.hp===bramble.g.p.maxHp);
  step(13);
  check('Nanas Bramble closes the middle on the delayed strike',bramble.g.p.hp<bramble.g.p.maxHp);

  const drum=encounter('melaka',145,2);
  const canvas=document.querySelector('#gameHost canvas');
  const pointer=(type,y)=>canvas.dispatchEvent(new win.PointerEvent(type,{
    pointerType:'touch',pointerId:7,clientX:60,clientY:y,bubbles:true
  }));
  pointer('pointerdown',200);
  pointer('pointermove',260);
  try{step(34);}finally{pointer('pointerup',260);}
  check('The touch joystick can carry Fadli clear of both Rebana Echo beats',
    drum.e.actions===1&&drum.g.p.y>122&&drum.g.p.hp===drum.g.p.maxHp&&!rt.joystick);

  const eagleWarning=encounter('johor',145,2);
  const eaglePoints=eagleWarning.e.folkloreMarks[0].points,fillPoints=floor.fillPoints;
  let drewPolygon=false;
  win.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:matchMedia.call(win,query);
  floor.fillPoints=function(points){
    drewPolygon ||=points===eaglePoints;
    return fillPoints.call(this,points);
  };
  try{
    step(4);
    check('Reduced motion keeps the tapered polygon visible and holds the eagle sprite still',
      drewPolygon&&rt.scene.sprites.get(eagleWarning.e)?.rotation===0);
  }finally{
    floor.fillPoints=fillPoints;
    win.matchMedia=matchMedia;
  }

  const aim=145;
  function touch(type,dx=0,dy=0){
    canvas.dispatchEvent(new win.PointerEvent(type,{
      pointerType:'touch',pointerId:7,clientX:80+dx*60,clientY:200+dy*60,bubbles:true
    }));
  }
  for(const [stage,{id,direction:[dx,dy],steps=31,beat,hit,safe}] of Object.entries(FOURTH_CASTS)){
    const name=FOLKLORE_GHOSTS[id].name;
    const standing=encounter(stage,aim,3);
    step(48);
    check(name+' punishes standing on the original aim point',standing.e.actions===1&&standing.g.p.hp<standing.g.p.maxHp);

    for(const [point,damaged] of [[hit,true],[safe,false]]){
      const {g,e}=encounter(stage,aim,3);
      const marks=e.folkloreMarks.filter(mark=>mark.delay===beat);
      check(name+' locks the expected '+beat+' second beat before release',marks.length>0);
      // Let earlier beats pass with invulnerability, then sample just the specified beat.
      g.p.invuln=beat>0?999:0;
      for(let i=0;i<30&&!e.actions&&beat>0;i++)step();
      for(let i=0;i<25&&!marks.some(mark=>mark.fired);i++){
        if(beat===0||e.folkloreRelease+.05>=beat){
          Object.assign(g.p,{x:aim+point[0],y:point[1],invuln:0});
        }
        step();
      }
      check(name+(damaged?' hits inside':' leaves clear space outside')+' the marked footprint',
        marks.every(mark=>mark.fired)&&(g.p.hp<g.p.maxHp)===damaged);
    }

    const code=dx<0?'KeyA':dx>0?'KeyD':dy<0?'KeyW':'KeyS';
    const key=type=>win.dispatchEvent(new win.KeyboardEvent(type,{code}));
    for(const input of ['keyboard','touch joystick']){
      const {g,e}=encounter(stage,aim,3);
      if(input==='keyboard')key('keydown');
      else{touch('pointerdown');touch('pointermove',dx,dy);}
      try{step(steps);}finally{
        if(input==='keyboard')key('keyup');
        else touch('pointerup',dx,dy);
      }
      step(48-steps);
      check(name+' can be dodged with '+input+' through the full cast',
        e.actions===1&&!e.folkloreMarks&&g.p.hp===g.p.maxHp&&!rt.joystick&&
        (g.p.x-aim)*dx+g.p.y*dy>50);
    }

    const reduced=encounter(stage,aim,3);
    const marks=reduced.e.folkloreMarks;
    const draw=rt.scene.drawFolkloreMark,seen=new Set();
    win.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:matchMedia.call(win,query);
    rt.scene.drawFolkloreMark=function(mark,color,age){
      seen.add(mark);
      return draw.call(this,mark,color,age);
    };
    try{
      step(3);
      check(name+' submits every warning in reduced motion with a still sprite',
        marks.every(mark=>seen.has(mark)&&!mark.fired)&&rt.scene.sprites.get(reduced.e)?.rotation===0);
    }finally{
      rt.scene.drawFolkloreMark=draw;
      win.matchMedia=matchMedia;
    }
  }

  const johor=start('johor');
  check('The orang bunian is separate from the enemy roster',johor.bunian&&!johor.enemies.includes(johor.bunian));
  Object.assign(johor.p,johor.bunian);
  step();
  const talk=document.querySelector('#npcDialogue'),next=document.querySelector('#npcNext');
  check('Approaching the orang bunian opens a peaceful dialogue',
    !talk.hidden&&document.querySelector('#npcName').textContent==='Orang bunian wayfarer'&&
    rt.scene.sprites.get(johor.bunian)?.key==='malaysia-folklore'&&
    rt.scene.sprites.get(johor.bunian)?.frame.name==='9'&&johor.enemies.length===0&&johor.p.hp===johor.p.maxHp);
  const lines=[document.querySelector('#npcLine').textContent];
  while(next.textContent!=='Farewell'){next.click();lines.push(document.querySelector('#npcLine').textContent)}
  check('Next pages through every wayfarer line',lines.length>2&&new Set(lines).size===lines.length);
  next.click();step(10);
  check('Farewell closes the dialogue while the hero stays nearby',talk.hidden&&johor.bunian.greeted);
  johor.p.x+=400;step();johor.p.x-=400;step();
  check('Walking away and back reopens the dialogue from the start',!talk.hidden&&document.querySelector('#npcLine').textContent===lines[0]);
  johor.p.x+=400;step();
  check('Leaving the wayfarer closes the dialogue',talk.hidden);
  check('Retry restores the Johor wayfarer encounter',start('johor').bunian&&!rt.G.bunian.greeted);
  check('Practice and other stages exclude the authored cameo',!start('johor',true).bunian&&!start('melaka').bunian);
}
