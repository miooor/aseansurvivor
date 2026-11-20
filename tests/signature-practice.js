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
    const lessons={
      ustaz(){until(ready,10);cast('F')},
      rempit(){move('KeyD',2);move('KeyA',2);cast('Q')},
      nok(){cast('Q');cast('E');cast('F')},
      lan(){for(let i=0;i<6&&!ready();i++){cast('F');cast('Q');step(10)}check(ready(),'High Tide did not charge');cast('E')},
      sari(){cast('F');until(ready,2.5);cast('Q')},
      asha(){cast('Q');until(ready,5);cast('E')},
      mira(){cast('Q');check(ready(),'Hook primes immediately');cast('E')},
      dani(){cast('E');move('KeyD',1.2);move('KeyA',1.2);cast('F')},
      vanna(){cast('Q');cast('E');cast('F')},
      keo(){cast('Q');cast('E');check(!rt.G.over,'Early cast completed Keo');until(ready,2);cast('F')},
      nadi(){cast('E');step(2.2);cast('Q')},
      lia(){move('KeyS',1.8);cast('E')}
    };
    check(Object.keys(lessons).length===$('heroes').children.length,'Every picker hero needs an action test');
    for(const [id,perform] of Object.entries(lessons)){
      report.textContent=results.join('\n')+'\nTesting '+id;
      $('hero-'+id).click();$('practiceStart').click();await wait(()=>rt.G?.practice);
      check(!rt.G.auto&&!rt.G.over&&rt.G.identity.charge===0,'Initial practice state '+id);
      key('KeyT',true);key('KeyT',false);
      perform();step(1.6);
      check(rt.G.over&&rt.G.practice.complete,'Signature did not release for '+id);
      $('practiceRetry').click();
      check(!rt.G.over&&!rt.G.practice.complete&&rt.G.identity.charge===0,'Retry failed '+id);
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
      check(localStorage.getItem('aseanSurvivor.v1')===save,'Practice wrote save for '+id);
      results.push(id+' PASS');
    }
    $('start').click();check(!rt.G.practice,'Practice leaked into campaign');rt.toMenu();
    report.textContent=results.join('\n')+'\nPASS';
  }catch(error){report.textContent+='\nFAIL '+error.message}
  finally{document.querySelector('#run').disabled=false}
};
