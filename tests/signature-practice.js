const frame=document.querySelector('iframe'),report=document.querySelector('#report');
document.querySelector('#run').onclick=async()=>{
  const w=frame.contentWindow,d=w.document,$=id=>d.getElementById(id);
  const results=[];
  document.querySelector('#run').disabled=true;
  const check=(ok,message)=>{if(!ok)throw Error(message)};
  const wait=async predicate=>{
    const until=Date.now()+20000;
    while(!predicate()&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,50));
    check(predicate(),'Timed out waiting for game');
  };
  try{
    await wait(()=>w.__asean);
    const rt=w.__asean,save=localStorage.getItem('aseanSurvivor.v1');
    const key=(code,down)=>w.dispatchEvent(new w.KeyboardEvent(down?'keydown':'keyup',{code,bubbles:true}));
    const step=(seconds)=>{for(let i=0;i<Math.ceil(seconds*60);i++)rt.step(1000/60)};
    const move=(code,seconds)=>{key(code,true);step(seconds);key(code,false)};
    const cast=k=>{key('Key'+k,true);key('Key'+k,false)};
    const until=(predicate,seconds)=>{for(let i=0;i<seconds*60&&!predicate();i++)step(1/60);check(predicate(),'Readiness timed out')};
    const ready=()=>rt.G.identity.ready??rt.G.identity.charge>=rt.G.hero.identity.max;
    const freshSignature=id=>{
      const g=rt.G;
      if(id==='lia')return g.cds[2]===0&&!g.roster.lia.shadow;
      if(id==='dani')return g.cds[3]===0&&!g.roster.dani.rain&&!g.roster.dani.channel;
      return id==='vanna'?g.cds[3]===0:g.identity.charge===0;
    };
    const lessons={
      ustaz(){until(ready,10);cast('F')},
      rempit(){move('KeyD',2);move('KeyA',2);cast('Q')},
      nok(){cast('Q');cast('E');cast('F')},
      lan(){for(let i=0;i<6&&!ready();i++){cast('F');cast('Q');step(10)}check(ready(),'High Tide did not charge');cast('E')},
      sari(){cast('F');until(ready,2.5);cast('Q')},
      asha(){cast('Q');until(ready,5);cast('E')},
      mira(){cast('Q');check(ready(),'Lid banks heat immediately');cast('E')},
      dani(){cast('F')},
      vanna(){cast('F')},
      keo(){cast('Q');cast('E');check(!rt.G.practice.complete,'Early cast completed Keo');until(ready,2);cast('F')},
      nadi(){rt.G.st.crit=1;cast('Q');step(1.3);check(ready(),'Recall did not charge');cast('E')},
      lia(){$('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));cast('E')}
    };
    check(Object.keys(lessons).length===$('heroes').children.length,'Every picker hero needs an action test');
    for(const [id,perform] of Object.entries(lessons)){
      report.textContent=results.join('\n')+'\nTesting '+id;
      $('hero-'+id).click();$('practiceStart').click();await wait(()=>rt.G?.practice);
      check(!rt.G.auto&&!rt.G.over&&freshSignature(id),'Initial practice state '+id);
      key('KeyT',true);key('KeyT',false);
      perform();step(1.6);
      check(rt.G.practice.complete,'Signature did not release for '+id);
      check(!rt.G.over&&!$('skills').inert,'Practice keeps running after release for '+id);
      $('practiceRetry').click();
      check(!rt.G.over&&!rt.G.practice.complete&&freshSignature(id),'Retry failed '+id);
      if(id==='ustaz'){
        const toggle=$('practiceNoCooldown');
        const spell=slot=>rt.G.fx.findLast(f=>f.kind==='spell'&&f.slot===slot);
        check(!toggle.checked,'No cooldown starts off in Practice');
        cast('Q');const first=spell(1);
        cast('Q');cast('R');
        check(first&&spell(1)===first&&!spell(4),'Default Practice gates recasts and ultimates');
        toggle.click();
        check($('sk1').querySelector('.cdn').textContent===''&&$('sk4').classList.contains('ready'),'The HUD shows skills ready immediately');
        cast('Q');cast('R');
        const ultimate=spell(4);
        $('sk4').click();
        check(spell(1)!==first&&ultimate&&spell(4)!==ultimate,'No cooldown allows immediate keyboard and button recasts');
        toggle.click();const recent=spell(1);
        cast('Q');
        check(spell(1)===recent&&!$('sk4').classList.contains('ready'),'Turning the option off restores normal cooldown and charge');
        toggle.click();$('practiceRetry').click();
        check(toggle.checked&&$('sk4').classList.contains('ready'),'Retry keeps the practice option enabled');
      }
      if(id==='dani'){
        $('practiceNoCooldown').click();
        cast('F');step(.6);
        check(rt.G.practice.complete,'Coin rain is usable immediately on retry');
        rt.G.cds[3]=99;cast('F');
        check(rt.G.roster.dani.rain.wave===0,'No cooldown lets coin rain be cast again');
      }
      if(id==='nok'){
        cast('Q');step(6.5);
        check(rt.G.identity.charge===0&&!rt.G.practice.complete,'Expired Rhythm chain');
        $('pauseButton').click();const pausedAt=rt.G.t;step(1);
        check(rt.G.t===pausedAt&&$('practiceGuide').hidden,'Pause freezes lesson');
        $('resume').click();
      }
      if(id==='rempit'){
        frame.width=390;frame.height=720;await new Promise(resolve=>setTimeout(resolve,100));
        const canvas=$('game'),touch=(type,x)=>canvas.dispatchEvent(new w.PointerEvent(type,{
          pointerId:31,pointerType:'touch',clientX:x,clientY:370,bubbles:true
        }));
        touch('pointerdown',50);touch('pointermove',115);step(3.8);touch('pointerup',115);
        check(ready(),'Joystick earns Redline');$('sk1').click();step(1.6);
        check(rt.G.practice.complete,'Touch skill spends Redline');
        const guide=$('practiceGuide').getBoundingClientRect(),skill=$('sk1').getBoundingClientRect();
        check(guide.left>=0&&guide.right<=390&&guide.bottom<skill.top,'Guide clears phone skill buttons');
        frame.width=1000;
      }
      $('practiceReturn').click();
      check(!rt.G&&!$('menu').hidden&&$('hero-'+id).getAttribute('aria-pressed')==='true','Return failed '+id);
      check($('practiceGuide').hidden,'No cooldown is available only in Practice');
      check(localStorage.getItem('aseanSurvivor.v1')===save,'Practice wrote save for '+id);
      results.push(id+' PASS');
    }
    $('start').click();check(!rt.G.practice,'Practice leaked into campaign');rt.toMenu();
    report.textContent=results.join('\n')+'\nPASS';
  }catch(error){report.textContent+='\nFAIL '+error.message}
  finally{document.querySelector('#run').disabled=false}
};
