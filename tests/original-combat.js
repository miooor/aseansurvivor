// Run against a loaded gameplay window. Advance the normal scene loop synchronously
// so the captured frame and the assertions refer to the same simulation tick.
export async function checkOriginalCombat(w, capture=()=>{}) {
  const rt=w.__asean, scene=rt.scene, canvas=w.document.querySelector('#game');
  const check=(value,message)=>{if(!value)throw Error(message)};
  const key=(type,code)=>w.dispatchEvent(new w.KeyboardEvent(type,{code}));
  const press=code=>{key('keydown',code);key('keyup',code)};
  const step=(count=1)=>{for(let i=0;i<count;i++)scene.update(0,32)};
  const shot=name=>{scene.drawTerrain();capture(name,canvas)};
  const start=async id=>{
    await scene.prepareHero(id);rt.newGame(id,0);
    w.document.querySelector('#menu').hidden=true;
    const g=rt.G;g.auto=false;g.spawnT=g.durianT=g.cds[0]=999;
    scene.update(0,0);
    return g;
  };
  const foe=(dx,dy=0,type='pocong')=>{
    const g=rt.G,e=rt.makeGhost(type,g.p.x+dx,g.p.y+dy);
    e.hp=e.maxHp=9999;e.stun=999;e.spd=0;return e;
  };
  for(const [slot,name,active] of [
    [1,'Wheelie',p=>p.dash?.t>0],
    [4,'Mode Superman',p=>p.super>0]
  ]){
    const g=await start('rempit');
    g.ult=g.hero.ultNeed;
    g.p.hp=1;
    rt.tryCast(slot);
    check(active(g.p),name+' is active');
    rt.hurtPlayer(10,'contact');
    check(g.p.hp===1,name+' protects Kama from body contact');
    rt.hurtPlayer(10,'skill');
    check(g.p.hp===0&&g.over,name+' lets a lethal enemy skill end the run');
    rt.toMenu();
  }
  let g=await start('rempit');
  foe(-235);g.cds[0]=0;key('keydown','KeyD');step(2);
  check(g.projs.some(q=>q.kind==='spanner'&&q.vx<0),'backward throw');
  check(scene.sprites.get(g.p).rotation===0&&Number(scene.sprites.get(g.p).frame.name)===0,'steady east-facing chassis');
  step(2);shot('Kama · backward throw');
  key('keyup','KeyD');
  const stick=(type,x,y)=>canvas.dispatchEvent(new w.PointerEvent(type,{pointerId:9,pointerType:'touch',clientX:96+x,clientY:120+y}));
  stick('pointerdown',0,0);
  let low=0,high=0,shots=0;
  for(let i=0;i<120;i++){
    const a=i*2*Math.PI/120,dx=Math.cos(a),dy=Math.cos(2*a),d=Math.hypot(dx,dy);
    stick('pointermove',60*dx/d,60*dy/d);step();
    const roll=scene.sprites.get(g.p).rotation;
    low=Math.min(low,roll);high=Math.max(high,roll);
    if(g.fx.some(f=>f.skill==='rempit-0'))shots++;
    if(i===35||i===85)shot('Kama · bend '+(i===35?'one':'two'));
  }
  stick('pointerup',0,0);
  if(w.matchMedia('(prefers-reduced-motion: reduce)').matches)check(low===0&&high===0,'reduced chassis');
  else check(low<-.02&&high>.02,'opposite figure-eight banks');
  check(shots>0,'firing on figure eight');

  g=await start('nok');g.autoAim=false;
  const aim=()=>canvas.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+200,clientY:w.innerHeight/2}));
  const startX=g.p.x;
  const flank=foe(65,60),behind=foe(-65),far=foe(204),victim=foe(75,-48);
  victim.hp=1;g.st.crit=0;
  aim();press('KeyQ');step(2);
  check(flank.hp===9999-54&&victim.dead&&behind.hp===9999,'knee cleaves the front arc only');
  check(scene.sprites.get(g.p).key==='nok-flying-knee','airborne knee sprite');
  shot('Nok · flying knee');
  step(13);
  check(g.p.x>startX+110&&!g.sea.knee&&far.hp===9999-81&&flank.hp===9999-54,'lunge reaches outer targets and hits each once');
  foe(42);press('KeyE');check(g.cds[1]===0,'connected follow-up elbow readies knee');
  press('KeyQ');check(g.identity.releaseT>0&&g.identity.charge===0,'return knee finishes Rhythm');
  step(3);shot('Nok · return knee');

  g=await start('sari');foe(280);g.cds[0]=0;step(5);
  check(g.projs.some(q=>q.kind==='kris'&&!q.back),'outbound blade');shot('Sari · outbound');
  for(let i=0;i<15&&!g.projs.some(q=>q.back);i++)step();
  check(g.projs.some(q=>q.back),'blade reached turning point');shot('Sari · turn');
  step(5);check(g.projs.some(q=>q.back&&q.vx<0),'returning blade');shot('Sari · return');
  g=await start('ustaz');foe(125);g.p.hp-=20;aim();press('KeyQ');step(23);press('KeyF');
  check(g.fx.some(f=>f.flourish==='return')&&g.p.hp>g.p.maxHp-20,'burn recalled');step(6);shot('Fadli · recall');
  g=await start('lan');foe(60);press('KeyF');step(12);press('KeyE');
  for(let i=0;i<90&&!g.fx.some(f=>f.flourish==='ripple');i++)step();
  check(g.fx.some(f=>f.flourish==='ripple'),'soaked guard splash');shot('Lan · troupe splash');
  rt.toMenu();
}
