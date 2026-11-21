// Failure cases: storage denied, assets missing, host reload duplicates, controls too
// small, edit mode playing, unordered saves, load failure overwriting a real save.
const frame=document.querySelector('#game'),output=document.querySelector('#report');
const mobile=document.documentElement.dataset.checks==='mobile';
if(mobile){
  const resize=()=>{const scale=Math.min(innerWidth/720,(innerHeight-90)/1280);frame.style.transform=`scale(${scale})`;document.querySelector('#stage').style.height=(1280*scale)+'px'};
  window.addEventListener('resize',resize);resize();
  frame.onload=()=>{document.querySelector('#begin').disabled=false};
  document.querySelector('#begin').onclick=()=>frame.contentWindow.postMessage({type:'run-mobile-checks'},'*');
}
let evidence;
document.querySelector('#run').onclick=async()=>{
  output.textContent='Running…';
  // Raw imports exercise the exact export; unique URLs bypass Vite's ignored-dist cache.
  const [html,code]=await Promise.all(['index.html','game.js'].map(async name=>
    (await import(/* @vite-ignore */ '../dist/astrocade/'+name+'?raw&v='+Date.now())).default));
  const driver=mobile?'window.addEventListener("message",e=>{if(e.data?.type==="run-mobile-checks")('+mobileChecks.toString()+')()})':'('+checks.toString()+')()';
  frame.srcdoc=html.replace('<script src="./game.js"></script>',
    '<script>('+sandbox.toString()+')();</script><script>'+code.replaceAll('</script','<\\/script')+'</script><script>'+driver+';</script>');
};
window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.data?.type!=='astrocade-acceptance')return;
  evidence=event.data.report;output.textContent=JSON.stringify(evidence,null,2);
  document.querySelector('#download').disabled=false;
});
document.querySelector('#download').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='astrocade-report.json';a.click();URL.revokeObjectURL(url);
};
function sandbox(){
  window.testBridge={state:null,saves:[],active:0,maxActive:0,failLoad:false,failSave:false,errors:[]};
  const bridge=window.testBridge;
  window.addEventListener('error',e=>bridge.errors.push(e.message));
  window.addEventListener('unhandledrejection',e=>bridge.errors.push(String(e.reason)));
  window.lib={
    log(){},haptics:{play(){}},
    async getUserGameState(){if(bridge.failLoad)throw Error('offline');return {state:bridge.state,success:true}},
    async saveUserGameState(state){
      bridge.active++;bridge.maxActive=Math.max(bridge.active,bridge.maxActive);
      await new Promise(resolve=>setTimeout(resolve,bridge.delay||40));bridge.active--;
      if(bridge.failSave)throw Error('offline');
      bridge.state=structuredClone(state);bridge.saves.push(bridge.state);return {success:true,state:bridge.state};
    }
  };
}

// Failure cases: HUD under canvas, offscreen/overlapping controls, lost touch
// movement while casting, scrolling instead of moving, missing textures, pause
// continuing play, and a new format causing slow startup or rendering stalls.
async function mobileChecks(){
  const report={date:new Date().toISOString(),checks:[],errors:[],result:'FAIL',environment:{width:innerWidth,height:innerHeight,userAgent:navigator.userAgent,cores:navigator.hardwareConcurrency}};
  const check=(name,pass)=>{report.checks.push({name,pass:!!pass})};
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const until=async fn=>{for(let n=0;n<600&&!fn();n++)await wait(100)};
  const $=id=>document.getElementById(id),rect=id=>$(id).getBoundingClientRect();
  const touching=(type,x,y)=>$('game').dispatchEvent(new PointerEvent(type,{pointerId:7,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));
  try{
    const started=performance.now();await window.run('play');await until(()=>!$('start').disabled);
    report.startupMs=Math.round(performance.now()-started);
    check('Export boots with all required artwork',!$('start').disabled);
    $('start').click();await wait(150);
    check('HUD above the battlefield',Number(getComputedStyle($('hud')).zIndex)>Number(getComputedStyle($('gameHost')).zIndex||0));
    check('Controls keep a larger compact-phone target',rect('pauseButton').width>=112&&rect('sk1').width>=112&&rect('sk1').height>=112);
    for(const id of ['pauseButton','skills','equipmentButton','worldMap']){
      const r=rect(id);check(id+' stays inside portrait frame',r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight);
    }
    const skills=rect('skills'),equipment=rect('equipmentButton');
    check('Equipment does not overlap skills',equipment.right<=skills.left||equipment.bottom<=skills.top);
    const before=Number($('mapPlayer').getAttribute('cx'));
    touching('pointerdown',120,950);touching('pointermove',200,950);
    $('sk2').click();await wait(650);touching('pointerup',200,950);
    check('Touch movement continues while casting',Number($('mapPlayer').getAttribute('cx'))>before);
    check('Touch movement does not scroll',scrollY===0);
    $('pauseButton').click();check('Touch pause opens',!$('pause').hidden);
    const time=$('time').textContent;await wait(1100);check('Pause freezes gameplay',$('time').textContent===time);
    $('resume').click();check('Resume returns to play',$('pause').hidden);
    await until(()=>!$('equipmentButton').disabled);
    $('equipmentButton').click();check('Equipment opens without leaving play',!$('lootPanel').hidden);
    $('lootClose').click();check('Equipment closes',$('lootPanel').hidden);
    // Profile ordinary play, including automatic spells and upgrade/result screens.
    const intervals=[];let previous=performance.now(),elapsed=0;
    await new Promise(resolve=>{
      const sample=now=>{
        const delta=now-previous;previous=now;elapsed+=delta;intervals.push(delta);
        if(!$('levelup').hidden)$('ups').querySelector('button')?.click();
        if(elapsed<15000)requestAnimationFrame(sample);else resolve();
      };requestAnimationFrame(sample);
    });
    const sorted=intervals.slice().sort((a,b)=>a-b);
    report.profile={durationMs:Math.round(elapsed),frames:intervals.length,meanFps:Number((intervals.length*1000/elapsed).toFixed(2)),medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],over50ms:intervals.filter(x=>x>50).length,gameTime:$('time').textContent,kills:$('kills').textContent};
    check('Game clock advances during mobile profile',$('time').textContent!==time);
    report.assets=[...new Set(performance.getEntriesByType('resource').map(x=>x.name).filter(x=>x.includes('cloudfront.net/images/')))];
    check('All artwork uses the smaller WebP assets',report.assets.length===18&&report.assets.every(url=>url.endsWith('.webp')));
    check('No runtime errors',window.testBridge.errors.length===0);
    if($('pause').hidden&&$('end').hidden&&$('levelup').hidden)$('pauseButton').click();
    report.result=report.checks.every(x=>x.pass)?'PASS':'FAIL';
  }catch(error){report.errors.push(String(error))}
  report.runtimeErrors=window.testBridge.errors;
  parent.postMessage({type:'astrocade-acceptance',report},'*');
}
async function checks(){
  const report={date:new Date().toISOString(),checks:[],errors:[],result:'FAIL'};
  const check=(name,condition)=>{report.checks.push({name,pass:!!condition});if(!condition)throw Error(name)};
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const until=async predicate=>{for(let n=0;n<100&&!predicate();n++)await wait(100)};
  const ready=async()=>{for(let n=0;n<400;n++){const start=document.querySelector('#start');if(!start.disabled||start.textContent.startsWith('Edit preview'))return;await wait(100)}throw Error('Artwork/start timed out')};
  const $=id=>document.getElementById(id),bridge=window.testBridge;
  try{
    let blocked=false;try{localStorage.getItem('x')}catch{blocked=true}
    check('Browser storage is blocked by the real sandbox',blocked);
    await window.run('play');await ready();
    check('Exactly one Phaser canvas',document.querySelectorAll('canvas#game').length===1);
    check('All five heroes',document.querySelectorAll('.hero').length===5);
    check('All six regions',document.querySelectorAll('.stg').length===6);
    check('Portrait viewport',innerWidth===720&&innerHeight===1280);
    check('Lobby button targets meet the portrait minimum',[...document.querySelectorAll('#menu button')].every(button=>{
      const rect=button.getBoundingClientRect();return rect.width>=96&&rect.height>=96;
    }));
    for(const id of ['ustaz','rempit','nok','lan','sari']){
      $('hero-'+id).click();$('start').click();await wait(120);
      check(id+' starts',!$('hud').hidden&&$('menu').hidden);
      $('sk1').click();await until(()=>$('sk1').querySelector('.cdn').textContent!=='');check(id+' skill button casts',$('sk1').querySelector('.cdn').textContent!=='');
      check(id+' touch skill target',document.querySelector('#sk1').getBoundingClientRect().width>=96&&document.querySelector('#sk1').getBoundingClientRect().height>=96);
      $('pauseButton').click();check(id+' pauses',!$('pause').hidden);
      const time=$('time').textContent;await wait(150);check(id+' stays paused',$('time').textContent===time);
      $('resume').click();check(id+' resumes',$('pause').hidden);
      $('pauseButton').click();$('quit').click();check(id+' returns to lobby',!$('menu').hidden);
    }
    for(const stage of [...document.querySelectorAll('.stg')].map(el=>el.id)){
      $(stage).click();$('start').click();await wait(150);
      check(stage+' plays',!$('hud').hidden&&!$('worldMap').hidden);
      $('pauseButton').click();$('quit').click();
    }
    $('hero-ustaz').click();$('start').click();await wait(100);
    let x=Number($('mapPlayer').getAttribute('cx'));
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'}));await wait(350);
    window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD'}));
    check('Keyboard moves the hero',Number($('mapPlayer').getAttribute('cx'))>x);
    x=Number($('mapPlayer').getAttribute('cx'));
    $('game').dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,pointerType:'touch',clientX:150,clientY:900}));
    $('game').dispatchEvent(new PointerEvent('pointermove',{pointerId:1,pointerType:'touch',clientX:220,clientY:900}));await wait(350);
    $('game').dispatchEvent(new PointerEvent('pointerup',{pointerId:1,pointerType:'touch'}));
    check('Touch drag moves the hero',Number($('mapPlayer').getAttribute('cx'))>x);
    $('pauseButton').click();$('quit').click();
    document.querySelector('[data-sound-mute]').click();await until(()=>bridge.state!==null);
    check('Audio setting saved through the bridge',JSON.parse(bridge.state.values['aseanSurvivor.audio']).muted===true);
    await window.run('play');await ready();
    check('Host reload keeps one canvas',document.querySelectorAll('canvas#game').length===1);
    check('Audio setting survives host reload',document.querySelector('[data-sound-mute]').getAttribute('aria-pressed')==='true');
    bridge.delay=300;
    const volume=document.querySelector('[data-sound-volume]');
    volume.value='30';volume.dispatchEvent(new Event('input'));
    await until(()=>bridge.active>0);
    volume.value='20';volume.dispatchEvent(new Event('input'));
    await until(()=>JSON.parse(bridge.state.values['aseanSurvivor.audio']).volume===.2);
    check('A change during a pending save keeps the newest value',JSON.parse(bridge.state.values['aseanSurvivor.audio']).volume===.2);
    bridge.delay=40;
    $('start').click();$('autobtn').click();await until(()=>bridge.state?.values['aseanSurvivor.v1']);
    check('Progression saved through the bridge',typeof JSON.parse(bridge.state.values['aseanSurvivor.v1']).autoMode==='number');
    check('Cloud writes never overlap',bridge.maxActive===1);
    bridge.failSave=true;document.querySelector('[data-sound-mute]').click();await until(()=>!$('cloudStatus').hidden);
    check('Save failure is visible',!$('cloudStatus').hidden);
    bridge.failSave=false;document.querySelector('[data-sound-mute]').click();await until(()=>$('cloudStatus').hidden);
    check('A later save recovers',$('cloudStatus').hidden);
    await window.run('edit');await ready();
    check('Edit mode prevents play',$('start').disabled&&$('hud').hidden);
    check('Edit mode has no active game controls',$('skills').hidden);
    bridge.failLoad=true;const before=bridge.saves.length;
    await window.run('play');await ready();
    document.querySelector('[data-sound-mute]').click();await wait(600);
    check('Load failure allows session play',!$('start').disabled);
    check('Load failure protects the existing cloud save',bridge.saves.length===before&&!$('cloudStatus').hidden);
    check('No runtime errors',bridge.errors.length===0);
    report.result='PASS';
  }catch(error){report.errors.push(String(error))}
  report.runtimeErrors=bridge.errors;
  report.cloudWrites=bridge.saves.length;
  parent.postMessage({type:'astrocade-acceptance',report},'*');
}
