
const frame=document.querySelector('#game'),report=document.querySelector('#report'),run=document.querySelector('#run');
let evidence;
const tick=()=>new Promise(resolve=>setTimeout(resolve,100));
run.onclick=async()=>{
  run.disabled=true;document.querySelector('#download').disabled=true;
  evidence={date:new Date().toISOString(),browser:navigator.userAgent,checks:[],errors:[]};
  const saveKey='aseanSurvivor.v1',originalSave=localStorage.getItem(saveKey);
  let restoreConsole=()=>{};
  const check=(name,condition)=>{evidence.checks.push({name,pass:!!condition});if(!condition)throw new Error(name)};
  const load=()=>new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Game load timed out')),15000);
    frame.onload=()=>{clearTimeout(timeout);resolve()};frame.src='../index.html';
  });
  try{
    await load();
    const w=frame.contentWindow,d=w.document,$=id=>d.getElementById(id);
    w.addEventListener('error',event=>evidence.errors.push(event.message));
    const originalError=w.console.error;
    w.console.error=(...args)=>{evidence.errors.push(args.map(String).join(' '));originalError.apply(w.console,args)};
    restoreConsole=()=>{w.console.error=originalError};
    const deadline=Date.now()+15000;
    while(!w.__asean&&Date.now()<deadline)await tick();
    check('Phaser scene boots',w.__asean?.scene.sys.isActive());
    check('Native Phaser renderer is active',w.__asean.scene.game.renderer.type===2);
    check('All five playable heroes load',$('heroes').querySelectorAll('button.hero').length===5);
    check('Six stage selections load',$('route').querySelectorAll('button').length===6);
    for(const [id,name] of [['ustaz','Ustaz Hakim'],['rempit','Mat Rempit "Jet"'],['nok','Nok'],['lan','Cô Lan'],['sari','Sari']]){
      $('hero-'+id).click();
      check(name+' selection and skill details',$('hero-'+id).getAttribute('aria-pressed')==='true'&&$('selectedHeroName').textContent===name&&$('heroSkills').children.length===5);
      $('start').click();await tick();
      check(name+' starts a run',w.__asean.G.hero.id===id&&$('menu').hidden&&!$('hud').hidden);
      for(let direction=0;direction<8;direction++){
        const angle=direction*Math.PI/4;
        w.__asean.G.p.face=[Math.cos(angle),Math.sin(angle)];await tick();
        check(name+' facing '+direction,w.__asean.scene.children.list.some(o=>o.type==='Image'&&o.visible&&o.texture.key==='hero-directions'&&o.frame.name===String(['ustaz','rempit','nok','lan','sari'].indexOf(id)*8+direction)));
      }
      // Animation failures: missing directional frames, frozen cycles, wrong attack facing,
      // basic attacks interrupting skill poses, and paused/dead runs continuing animation.
      const animRun=w.__asean.G,scene=w.__asean.scene;
      animRun.auto=false;animRun.spawnT=animRun.durianT=999;animRun.cds[0]=999;
      const actor=()=>scene.children.list.find(o=>o.type==='Image'&&o.visible&&o.texture.key==='hero-motion-'+id);
      const directions=[['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW'],['KeyW'],['KeyW','KeyD']];
      for(let direction=0;direction<8;direction++){
        const walkFrames=new Set(),attackFrames=new Set();
        for(const code of directions[direction])w.dispatchEvent(new w.KeyboardEvent('keydown',{code}));
        for(let n=0;n<16;n++){scene.update(0,50);const sprite=actor();if(sprite)walkFrames.add(Number(sprite.frame.name))}
        for(const code of directions[direction])w.dispatchEvent(new w.KeyboardEvent('keyup',{code}));
        check(name+' walks through four frames in direction '+direction,walkFrames.size===4&&[...walkFrames].every(f=>f<32&&f%8===direction));
        scene.update(0,50);
        const angle=direction*Math.PI/4;
        $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+Math.cos(angle)*100,clientY:w.innerHeight/2+Math.sin(angle)*100}));
        animRun.cds[1]=0;w.__asean.tryCast(1);
        for(let n=0;n<20;n++){scene.update(0,40);const sprite=scene.children.list.find(o=>o.type==='Image'&&o.visible&&o.texture.key==='hero-skills-'+id);if(sprite)attackFrames.add(Number(sprite.frame.name))}
        check(name+' plays unique Q windup/release in direction '+direction,attackFrames.size===2&&[...attackFrames].every(f=>f%8===direction));
        for(let n=0;n<10;n++)scene.update(0,50);
      }
      for(let slot=1;slot<=4;slot++)for(let direction=0;direction<8;direction++){
        const angle=direction*Math.PI/4,poses=new Set();
        $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+Math.cos(angle)*100,clientY:w.innerHeight/2+Math.sin(angle)*100}));
        animRun.cds[slot]=0;animRun.ult=animRun.hero.ultNeed;
        w.__asean.tryCast(slot);
        const effect=animRun.fx.findLast(f=>f.kind==='spell');
        check(name+' skill '+slot+' has its own effect '+direction,effect?.skill===id+'-'+slot);
        for(let n=0;n<35;n++){scene.update(0,40);const sprite=scene.children.list.find(o=>o.type==='Image'&&o.visible&&o.texture.key==='hero-skills-'+id);if(sprite)poses.add(Number(sprite.frame.name))}
        check(name+' skill '+slot+' distinct poses '+direction,poses.has((slot-1)*16+direction)&&poses.has((slot-1)*16+8+direction));
      }
      // Crowded battles must not evict a still-active ultimate to make room for hit sparks.
      animRun.ult=animRun.hero.ultNeed;animRun.cds[4]=0;w.__asean.tryCast(4);
      for(let n=0;n<650;n++)animRun.fx.push({kind:'ring',x:0,y:0,r:2,c:'#fff',life:2,max:2});
      for(let n=0;n<6;n++)scene.update(0,50);
      check(name+' ultimate survives effect pressure',animRun.fx.length<=600&&animRun.fx.some(f=>f.skill===id+'-4'));
      for(let n=0;n<30;n++)scene.update(0,50);
      check(name+' returns to directional idle',scene.children.list.some(o=>o.type==='Image'&&o.visible&&o.texture.key==='hero-directions'));
      w.__asean.G.cds[3]=0;$('sk3').click();check(name+' manual skill activates',w.__asean.G.cds[3]>0);
      check(name+' emits its themed skill effect',animRun.fx.some(f=>f.kind==='spell'&&f.hero===id&&f.slot===3));
      $('pauseButton').click();
      check(name+' pauses',!$('pause').hidden&&w.__asean.G.paused);
      const frozenTime=animRun.t;scene.update(0,50);
      check(name+' animation clock freezes on pause',animRun.t===frozenTime);
      $('resume').click();
      check(name+' resumes',$('pause').hidden&&!w.__asean.G.paused);
      $('pauseButton').click();$('quit').click();
      check(name+' returns to lobby',!$('menu').hidden&&$('hud').hidden);
    }
    // Failure cases: idle/cooldown casts farming power, repeated techniques counting as a combo,
    // stale charge after retry, counter charge never expiring, and empowered casts failing to consume.
    for(const id of ['ustaz','rempit','nok','lan','sari']){
      $('hero-'+id).click();$('start').click();await tick();
      const rt=w.__asean,g=rt.G;
      g.auto=false;g.spawnT=g.durianT=999;g.cds[0]=999;g.st.crit=0;
      const advance=seconds=>{for(let t=0;t<seconds;t+=.05)rt.step(50)};
      const foe=(x=70)=>{const e=rt.makeGhost('pocong',g.p.x+x,g.p.y);e.hp=e.maxHp=10000;e.spd=0;e.stun=999;return e};
      canvasAim();
      function canvasAim(){$('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}))}
      check(id+' starts with an empty signature meter',g.identity.charge===0);
      check(id+' explains its combat loop',$('heroTrait').textContent.length>40&&$('signatureName').textContent===g.hero.identity.name);
      if(id==='ustaz'){
        foe(150);g.cds[0]=0;advance(3.1);
        check('Hakim charges Sanctuary through basic attacks',g.identity.charge===4);
        g.p.hp=90;$('sk3').click();
        check('Hakim spends Sanctuary on a healing ward',g.identity.charge===0&&g.zones.some(z=>z.kind==='barrier'));
        advance(.6);check('Sanctuary heals inside its area',g.p.hp>90);
        check('Healing emits green recovery numbers',g.texts.some(t=>t.kind==='heal'&&t.s.startsWith('+')));
      }else if(id==='rempit'){
        advance(1);check('Jet cannot gain Redline while idle',g.identity.charge===0);
        w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyD',key:'d'}));advance(3.3);
        w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
        check('Jet builds Redline from movement',g.identity.charge===100);
        advance(.5);check('Full Redline waits for the player to spend it',g.identity.charge===100);
        const heldCharge=g.identity.charge;g.cds[1]=2;rt.tryCast(1);
        check('A blocked cooldown cast cannot spend Redline',g.identity.charge===heldCharge);g.cds[1]=0;
        $('sk1').click();
        check('Redline powers a longer burning dash',g.identity.charge===0&&g.p.dash.fire&&g.p.dash.t>.3);
      }else if(id==='nok'){
        foe();$('sk1').click();g.cds[1]=0;$('sk1').click();
        check('Repeating a technique does not build Nok rhythm',g.identity.charge===1);
        $('sk2').click();const e=foe(100),hp=e.hp;$('sk3').click();
        check('Three alternating techniques release Nok finisher',g.identity.charge===0&&g.identity.releaseT>0&&e.hp<hp);
        g.cds[1]=0;$('sk1').click();advance(6.5);
        check('Nok rhythm expires when the chain stops',g.identity.charge===0);
      }else if(id==='lan'){
        const e=foe(80);e.slowT=30;$('sk2').click();advance(5);
        check('Lan gains Tide by hitting slowed enemies',g.identity.charge===100);
        g.cds[2]=0;const count=g.sea.allies.length;$('sk2').click();
        check('High Tide creates two additional empowered guards',g.identity.charge===0&&g.sea.allies.length===count+5&&g.sea.allies.slice(-5).every(a=>a.t>=14));
      }else{
        const e=foe(8);$('sk3').click();e.stun=0;advance(.1);
        check('A successful Sari counter readies Riposte',g.identity.charge===1&&g.p.hp===g.p.maxHp);
        const hp=e.hp;g.cds[1]=0;g.cds[2]=5;$('sk1').click();
        check('Riposte consumes charge and refreshes Tiger Step',g.identity.charge===0&&g.cds[2]===0&&e.hp<hp);
        g.p.onContact(e);advance(.5);g.p.onContact(e);e.dead=true;advance(4.5);
        check('Unused Riposte expires',g.identity.charge===0);
      }
      const charge=g.identity.charge,castTime=g.identity.castT;
      $('pauseButton').click();rt.tryCast(1);rt.step(1000);
      check(id+' signature cannot advance or cast while paused',g.identity.charge===charge&&g.identity.castT===castTime);
      $('quit').click();$('start').click();await tick();
      check(id+' signature resets on a new run',w.__asean.G.identity.charge===0);
      $('pauseButton').click();$('quit').click();
    }
    for(const [id,name] of [['johor','Johor'],['melaka','Melaka'],['perak','Perak'],['penang','Pulau Pinang'],['kedah','Kedah'],['kl','Kuala Lumpur']]){
      $('stg-'+id).click();
      check(name+' mission briefing',$('stageTitle').textContent===name&&$('stg-'+id).getAttribute('aria-pressed')==='true');
      $('start').click();await tick();
      check(name+' launches selected stage',w.__asean.G.stage.id===id);
      $('pauseButton').click();$('quit').click();
    }
    $('helpButton').click();check('Controls dialog opens',$('controls').open);
    $('closeControls').click();check('Controls dialog closes',!$('controls').open);
    frame.width=1280;frame.height=720;await tick();
    check('1280×720 launch button stays above the fold',$('start').getBoundingClientRect().bottom<=720);
    frame.height=900;
    for(const width of [1440,768,390,320]){
      frame.width=width;await tick();
      const bounds=$('start').getBoundingClientRect();
      if($('menu').scrollWidth>width)evidence.overflow=[...$('menu').querySelectorAll('*')].map(e=>({tag:e.tagName,id:e.id,class:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left<0||e.right>width);
      check(width+'px lobby has no horizontal overflow',$('menu').scrollWidth<=width&&bounds.left>=0&&bounds.right<=width);
    }
    $('start').click();await tick();
    check('Native sprites render the game',w.__asean.scene.children.list.some(object=>object.type==='Image'&&object.visible));
    const beforeX=w.__asean.G.p.x;
    w.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD',key:'d'}));await tick();await tick();
    w.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
    check('Keyboard movement changes player position',w.__asean.G.p.x>beforeX);
    const beforeTouch=w.__asean.G.p.x,canvas=$('game');
    canvas.dispatchEvent(new w.PointerEvent('pointerdown',{pointerId:7,pointerType:'touch',clientX:60,clientY:300}));
    canvas.dispatchEvent(new w.PointerEvent('pointermove',{pointerId:7,pointerType:'touch',clientX:115,clientY:300}));
    await tick();await tick();
    canvas.dispatchEvent(new w.PointerEvent('pointerup',{pointerId:7,pointerType:'touch'}));
    check('Touch joystick moves and releases',w.__asean.G.p.x>beforeTouch&&w.__asean.joystick===null);
    const target=w.__asean.makeGhost('pocong',w.__asean.G.p.x+50,w.__asean.G.p.y);
    target.hp=target.maxHp=1000;target.stun=999;
    const damageRun=w.__asean.G;
    damageRun.auto=false;damageRun.cds[0]=999;damageRun.cds[1]=0;damageRun.st.crit=1;
    canvas.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
    $('sk1').click();
    const damageMessage=damageRun.texts.find(t=>t.kind==='critical');
    check('Critical popup matches actual damage',damageMessage&&Number(damageMessage.s)===Math.round(1000-target.hp));
    w.__asean.scene.update(0,0);
    const numberLabel=w.__asean.scene.children.list.find(o=>o.type==='Text'&&o.getData('combatKind')==='critical');
    check('Critical numbers have bold outlined styling',numberLabel&&numberLabel.style.strokeThickness>=4&&numberLabel.style.fontStyle.includes('bold'));
    const fixedLife=damageMessage.life;w.__asean.togglePause();w.__asean.scene.update(0,50);
    check('Damage popups freeze with pause',damageMessage.life===fixedLife);w.__asean.togglePause();
    damageRun.eprojs.push({x:damageRun.p.x,y:damageRun.p.y,vx:0,vy:0,r:8,dmg:7,life:1});
    damageRun.p.invuln=0;damageRun.sea.stance=0;damageRun.p.onContact=null;
    for(let n=0;n<10&&!damageRun.texts.some(t=>t.kind==='incoming');n++)w.__asean.scene.update(0,50);
    check('Incoming damage has a separate red number',damageRun.texts.some(t=>t.kind==='incoming'&&t.s==='7'));
    await tick();
    check('Manual attack damages an enemy and renders hit feedback',target.hp<1000);
    target.dead=true;
    const skill=$('sk1').getBoundingClientRect();
    check('Mobile skills have 44px minimum targets',skill.width>=44&&skill.height>=44);
    const g=w.__asean.G;g.pending=1;w.__asean.openLevelUp();
    check('Upgrade choices open',!$('levelup').hidden&&$('ups').children.length===3);
    $('up0').click();check('Upgrade selection resumes gameplay',$('levelup').hidden&&!g.choosing);
    for(const reward of ['orb','xp']){
      w.__asean.raid.force(reward);w.__asean.raid.spawnPortal();
      const portal=w.__asean.raid.state.portal;g.p.x=portal.x;g.p.y=portal.y;await tick();
      check(reward+': walking into portal enters raid',!!g.raid&&!!g.raidBoss);
      check(reward+': raid has native visual guidance',!$('raidGuide').hidden);
      const beforeLevel=g.level,beforeEvolutions=Object.keys(g.evo).length;
      w.__asean.kill(g.raidBoss);
      check(reward+': victory begins reward sequence',g.raid.won);
      const returnDeadline=Date.now()+6000;
      while(g.raid&&Date.now()<returnDeadline){if(g.choosing)$('up0').click();await tick()}
      check(reward+': returns after required reward choices',!g.raid);
      check(reward+': reward is granted',reward==='orb'?Object.keys(g.evo).length>beforeEvolutions:g.level>=beforeLevel+2);
    }
    w.__asean.endGame(false);
    check('Defeat screen opens',!$('end').hidden);
    $('again').click();await tick();
    check('Retry starts a clean run',!w.__asean.G.over&&$('end').hidden);
    $('pauseButton').click();$('quit').click();
    check('No browser runtime errors',evidence.errors.length===0);
    evidence.result='PASS';
  }catch(error){evidence.result='FAIL';evidence.errors.push(error.message)}
  finally{restoreConsole();if(originalSave===null)localStorage.removeItem(saveKey);else localStorage.setItem(saveKey,originalSave);report.textContent=JSON.stringify(evidence,null,2);run.disabled=false;document.querySelector('#download').disabled=false}
};
document.querySelector('#download').onclick=()=>{
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));
  a.href=url;a.download='ui-smoke-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
