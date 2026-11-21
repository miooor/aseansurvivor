// Run in the development game console. The callback can capture the just-rendered canvas.
import {heroArt} from '../src/content/hero-art.js';

function check(pass,message){if(!pass)throw Error(message)}

export async function sampleCast(id,slot,{baseline=false,ticks=slot===0?3:6,capture=()=>{}}={}){
  const rt=window.__asean,{scene}=rt;
  await scene.prepareHero(id);
  const random=Math.random;
  let seed=28;
  Math.random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
  try{
    rt.newGame(id,0,false,{seed:28});
    const g=rt.G,canvas=scene.terrain.renderer.domElement;
    document.getElementById('menu').hidden=true;
    g.auto=false;g.cds[0]=slot===0?0:999;g.spawnT=g.durianT=999;
    g.st.crit=0;g.ult=g.hero.ultNeed;
    for(const [x,y] of [[id==='nadi'?60:86,0],[172,18],[228,-31]]){
      const foe=rt.makeGhost('pocong',g.p.x+x,g.p.y+y);
      Object.assign(foe,{hp:9999,maxHp:9999,spd:0,stun:999});
    }
    canvas.dispatchEvent(new MouseEvent('mousemove',{clientX:innerWidth/2+200,clientY:innerHeight/2}));
    if(slot){
      const code='Key'+'QEFR'[slot-1];
      window.dispatchEvent(new KeyboardEvent('keydown',{code}));
      window.dispatchEvent(new KeyboardEvent('keyup',{code}));
    }
    for(let i=0;i<ticks;i++)scene.update(i*40,40);
    g.paused=true;
    g.shake=0; // Keep the comparison camera on the same point through hit-stop.
    scene.drawTerrain();
    const result={hero:id,slot,time:+g.t.toFixed(3),damage:g.enemies.slice(0,3).map(e=>9999-e.hp)};
    if(id==='dani'&&slot>0){
      const {channel,rain,dust}=g.roster.dani;
      check((slot===2?dust:slot===3?rain:channel?.slot===slot)&&scene.terrain.ribbons.mesh.geometry.drawRange.count>0,'Gold Sultan draws its live skill effect '+slot);
    }else if(!baseline){
      const body=scene.terrain.actors.group.getObjectByName('hero-effects-'+id);
      check(body?.visible,id+' '+slot+' missing batch');
      const source=body.material.uniforms.atlas.value.image;
      check(new URL(source.currentSrc).pathname.endsWith('/hero-effect-sprites/'+id+'.webp'),id+' requires authored texture');
      const uv=body.geometry.getAttribute('frameRect'),frames=[];
      for(let i=0;i<body.geometry.instanceCount;i++)frames.push((4-Math.round(uv.getY(i)*5))*4+Math.round(uv.getX(i)*4));
      check(frames.some(frame=>Math.floor(frame/4)===slot),id+' '+slot+' missing authored row: '+frames);
      if(id!=='nadi'&&matchMedia('(prefers-reduced-motion: reduce)').matches){
        check(frames.every(frame=>frame%4===2),id+' '+slot+' keeps its static painted cell');
      }
      result.frames=frames;
    }
    capture(canvas,result);
    return result;
  }finally{Math.random=random}
}

export async function checkPaintedBattle(capture){
  const rt=window.__asean,results=[];
  await checkShelterBoundary();
  await checkSanctuary();
  let previousHero;
  try{
    for(const id of Object.keys(heroArt)){
      for(let slot=0;slot<5;slot++)results.push(await sampleCast(id,slot,{capture}));
      const body=rt.scene.terrain.actors.group.getObjectByName('hero-effects-'+id);
      if(previousHero&&heroArt[previousHero].idleIndex===undefined){
        check(!rt.scene.assets.hasEffects(previousHero),id+' evicts the previous optional sheet');
      }
      previousHero=id;
      const resources=[body.geometry,body.material,body.material.uniforms.atlas.value];
      const disposed=new Set();
      for(const resource of resources)resource.addEventListener('dispose',()=>disposed.add(resource));
      rt.toMenu();rt.scene.update(0,0);
      check(disposed.size===resources.length&&!body.parent,id+' releases geometry, material, texture and batch');
    }
    return results;
  }finally{if(rt.G)rt.toMenu()}
}

export async function checkShelterBoundary(){
  await sampleCast('ustaz',4);
  const rt=window.__asean,{scene}=rt,g=rt.G;
  try{
    check(g.zones.some(z=>z.kind==='barrier'),'shelter is live');
    const floorVertices=()=>{
      scene.update(0,0);scene.drawTerrain();
      return scene.floor.mesh.geometry.drawRange.count;
    };
    const withShelter=floorVertices();
    g.zones=g.zones.filter(z=>z.kind!=='barrier');
    check(withShelter>floorVertices(),'the shelter marks its gameplay boundary on the floor');
  }finally{rt.toMenu()}
}

// Inspect the batch after the release pose has handed off to live simulation objects.
export async function checkPaintedPhases(capture=()=>{}){
  const rt=window.__asean,{scene}=rt,results=[];
  function bodies(){
    const batch=scene.terrain.actors.group.getObjectByName('hero-effects-'+rt.G.hero.id);
    if(!batch?.visible)return [];
    const attr=name=>batch.geometry.getAttribute(name);
    const uv=attr('frameRect'),pose=attr('pose'),size=attr('dimensions'),style=attr('style');
    return Array.from({length:batch.geometry.instanceCount},(_,i)=>({
      row:4-Math.round(uv.getY(i)*5),col:Math.round(uv.getX(i)*4),
      x:pose.getX(i),y:pose.getY(i),lift:pose.getZ(i),width:size.getX(i),height:size.getY(i),
      flip:style.getZ(i)===1
    }));
  }
  const near=(a,b)=>Math.abs(a-b)<.01;
  const at=(body,p)=>near(body.x,p.x)&&near(body.y,p.y);
  function advance(frames){
    const g=rt.G;
    g.paused=false;
    for(let i=0;i<frames;i++)scene.update(0,40);
    g.paused=true;scene.drawTerrain();
  }
  function record(label){
    capture(scene.terrain.renderer.domElement,label);
    results.push(label);
  }
  try{
    for(const id of ['lan','sari']){
      await sampleCast(id,0);
      const g=rt.G;g.cds[0]=999;
      advance(11);
      const returning=g.projs[0];
      check(returning&&returning.back&&returning.vx<0,id+' returns');
      check(bodies().some(b=>b.row===0&&at(b,returning)&&b.flip),id+' paints the returning carrier');
      record(id+' return');
      advance(60);
      check(!bodies().some(b=>b.row===0),id+' clears the finished return');
    }
    await sampleCast('lia',4,{ticks:4});
    let run=rt.G;
    const jump=run.fx.find(f=>f.kind==='shadowstep');
    check(jump&&bodies().some(b=>b.row===4&&at(b,{x:jump.tx,y:jump.ty})),'Midnight Hunt paints its landing');
    record('lia hunt');

    await sampleCast('lan',1);
    run=rt.G;run.evo[1]=true;run.cds[1]=0;run.paused=false;rt.tryCast(1);
    advance(18);
    const dragon=run.projs.find(q=>q.kind==='dragon'&&q.ret);
    check(dragon&&bodies().some(b=>b.row===1&&at(b,dragon)&&b.flip),'evolved dragon turns on its own trajectory');
    record('lan evolved dragon');

    await sampleCast('vanna',1);
    run=rt.G;run.paused=false;rt.tryCast(2);rt.tryCast(4);
    advance(30);
    const weave=run.roster.vanna,loom=weave.loom;
    check(loom?.targets.size===3&&scene.terrain.ribbons.mesh.geometry.drawRange.count>0,'square loom persists across its first tick');
    check(!bodies().some(b=>b.row===1||b.row===2),'instant cast sprites expire');
    record('vanna silk loom');
    run.paused=false;rt.tryCast(3);advance(12);
    check(weave.loom===loom&&weave.familiar,'Foldstep summons a familiar while the loom stays active');
    advance(120);
    check(!weave.loom&&!bodies().some(b=>b.row===4),'expired loom clears');

    await sampleCast('mira',4,{ticks:6});
    const g=rt.G,wave=g.roster.mira.wave,body=bodies().find(b=>b.row===4&&near(b.height,120));
    check(wave&&body&&near(body.x,wave.x+wave.ax*wave.distance)&&near(body.y,wave.y+wave.ay*wave.distance),'crest at the advancing front');
    const impact=g.fx.find(f=>f.kind==='impact'&&f.hero==='mira');
    check(impact&&bodies().some(b=>b.row===4&&near(b.x,impact.x)&&near(b.y,impact.footY)&&near(b.lift,impact.footY-impact.y)),'contact at struck foot depth');
    const batch=scene.terrain.actors.group.getObjectByName('hero-effects-mira');
    const actor=scene.terrain.actors.group.children.find(o=>o.visible&&o.name.startsWith('hero-')&&o!==batch);
    check(actor?.material.depthWrite&&actor.renderOrder<batch.renderOrder&&batch.material.depthTest&&!batch.material.depthWrite,'actor occludes translucent paint');
    const paused=JSON.stringify(bodies());
    scene.update(0,160);scene.drawTerrain();
    check(JSON.stringify(bodies())===paused,'paused crest and contact keep their frames and positions');
    record('stove cart and contact');
    advance(26);check(!g.roster.mira.wave&&!bodies().some(b=>b.row===4),'crest and impact clear');

    for(const [choice,radius,duration] of [[0,125,8],[1,220,4]]){
      await scene.prepareHero('nadi');rt.newGame('nadi',0);
      const run=rt.G;run.auto=false;run.cds[0]=999;run.spawnT=999;
      run.level=2;rt.addXP(run.need);rt.step(0);
      document.getElementById('up'+choice).click();
      run.ult=run.hero.ultNeed;rt.tryCast(4);advance(8);
      const ward=run.roster.nadi.ward;
      check(ward.radius===radius&&bodies().some(b=>b.row===4&&at(b,ward)&&b.col===0),'statue anchors the specialized ward');
      check(ward.monks.length===3&&ward.monks.every(m=>bodies().some(b=>b.row===4&&at(b,m))),'three guardian sprites');
      record('nadi '+run.specialization.name);
      advance(duration*25+12);
      check(!run.roster.nadi.ward&&!bodies().some(b=>b.row===4),'ward and guardians expire together');
    }
    await checkCoinRain(canvas=>capture(canvas,'coin rain'));
    results.push('coin rain');
    await checkLanGuards(canvas=>capture(canvas,'lan separated guards'));
    results.push('lan separated guards');
    return results;
  }finally{if(rt.G)rt.toMenu()}
}

// Run with only the ustaz effect image URL returning HTTP 404, from a fresh page.
export async function checkCoreSheetFallback(){
  const failed=performance.getEntriesByType('resource').find(entry=>
    entry.name.endsWith('/hero-effect-sprites/ustaz.webp')&&entry.responseStatus===404);
  check(failed,'exercise an actual missing core effect sheet');
  const rt=window.__asean;
  check(rt,'optional image failure must allow boot');
  document.getElementById('hero-ustaz').click();
  document.getElementById('start').click();
  const g=rt.G,{scene}=rt;
  check(g?.hero.id==='ustaz'&&!scene.assets.hasEffects('ustaz'),'start the selected core hero with fallback');
  try{
    g.auto=false;g.cds[0]=999;
    rt.tryCast(1);scene.update(0,40);scene.drawTerrain();
    const geometry=scene.terrain.ribbons.mesh.geometry;
    const withCast=geometry.drawRange.count;
    check(g.fx.some(f=>f.skill==='ustaz-1'),'Q cast created');
    g.fx=g.fx.filter(f=>f.skill!=='ustaz-1');
    scene.drawTerrain();
    check(withCast>geometry.drawRange.count,'the cast contributes real procedural ribbon geometry');
  }finally{rt.toMenu()}
}

export async function checkCoinRain(capture=()=>{}){
  const rt=window.__asean;
  try{
    await sampleCast('dani',3,{ticks:12});
    const run=rt.G;
    check(run.roster.dani.rain?.wave===1&&run.fx.some(f=>f.kind==='coinfall'),'coin rain impacts after its windup');
    capture(rt.scene.terrain.renderer.domElement);
  }finally{if(rt.G)rt.toMenu()}
}

export async function checkLanGuards(capture=()=>{}){
  const rt=window.__asean,{scene}=rt;
  try{
    await sampleCast('lan',2,{ticks:1});
    const g=rt.G,guards=g.sea.allies;
    check(guards.length===3,'rank-one troupe summons three guards');
    guards.forEach((p,i)=>Object.assign(p,{x:g.p.x+(i-1)*135,y:g.p.y+64}));
    scene.drawTerrain();
    capture(scene.terrain.renderer.domElement);
    const batch=scene.terrain.actors.group.getObjectByName('hero-effects-lan');
    const uv=batch.geometry.getAttribute('frameRect'),pose=batch.geometry.getAttribute('pose');
    check(batch.geometry.instanceCount===guards.length,'one painted body per guard from release');
    for(const guard of guards){
      const i=guards.findIndex((_,index)=>Math.hypot(pose.getX(index)-guard.x,pose.getY(index)-guard.y)<.01);
      check(i>=0&&4-Math.round(uv.getY(i)*5)===2,'the E motif sits on each separated guard');
    }
  }finally{if(rt.G)rt.toMenu()}
}

export async function checkSanctuary(capture=()=>{}){
  const rt=window.__asean,{scene}=rt;
  await sampleCast('ustaz',4);
  const word=()=>scene.terrain.labels.group.getObjectByName('يشفي');
  try{
    check(!word(),'Benteng Doa has its own artwork');
    rt.newGame('ustaz',0);
    const g=rt.G;g.auto=false;g.cds[0]=999;g.spawnT=g.durianT=999;
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'}));
    try{for(let i=0;i<56;i++)scene.update(0,50)}
    finally{window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD'}))}
    g.identity.charge=4;g.cds[3]=0;g.paused=false;rt.tryCast(3);
    for(let i=0;i<24;i++)scene.update(0,50);
    g.paused=true;scene.drawTerrain();
    const field=g.zones.find(z=>z.slot===3&&z.kind==='barrier');
    check(field&&word(),'charged Seruan displays the Sanctuary inscription');
    check(word().position.x===field.x,'inscription shares the field centre line');
    capture(scene.terrain.renderer.domElement);
    g.paused=false;
    for(let i=0;i<130;i++)scene.update(0,50);
    check(!word(),'inscription expires with Sanctuary');
  }finally{rt.toMenu()}
}
