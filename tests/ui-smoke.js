import {checkShrinePickups} from './shrine-pickups.js';
import {checkElements} from './elements.js';
import {checkEvolutions} from './evolutions.js';
import {STAGES,LEVEL_UP_HEAL} from '../src/content/core.js';
import {stageAvailable} from '../src/content/campaign-routes.js';

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
    const clearState=(cleared,retainedStages=[])=>({cleared,retainedStages});
    check('Both branches unlock after clearing shared Johor',
      !stageAvailable('east','pahang',clearState([])) &&
      stageAvailable('west','melaka',clearState(['johor'])) &&
      stageAvailable('east','pahang',clearState(['johor'])));
    check('Stage locks follow route predecessors and honor retained legacy access',
      !stageAvailable('east','pahang',clearState(['kedah'])) &&
      !stageAvailable('east','kelantan',clearState(['pahang'])) &&
      stageAvailable('east','kelantan',clearState(['terengganu'])) &&
      stageAvailable('west','perak',clearState(['melaka'],['perak'])));
    check('Selangor opens after Kuala Lumpur and preserves earlier Perak access',
      !stageAvailable('west','selangor',clearState(['melaka'])) &&
      stageAvailable('west','selangor',clearState(['kl'])) &&
      stageAvailable('west','perak',clearState(['kl'])) &&
      stageAvailable('west','perak',clearState(['selangor'])));
    localStorage.removeItem(saveKey);
    await load();
    const w=frame.contentWindow;
    let d=w.document;
    const $=id=>d.getElementById(id);
    w.addEventListener('error',event=>evidence.errors.push(event.message));
    const originalError=w.console.error;
    w.console.error=(...args)=>{evidence.errors.push(args.map(String).join(' '));originalError.apply(w.console,args)};
    restoreConsole=()=>{w.console.error=originalError};
    const deadline=Date.now()+15000;
    while(!w.__asean&&Date.now()<deadline)await tick();
    check('Three.js scene boots',w.__asean?.engine.startsWith('Three.js'));
    const checkStops=(label,cleared,next)=>{
      const buttons=[...$('atlasLabels').querySelectorAll('.atlas-stage')];
      check(label,buttons.length===STAGES.length && buttons.every(button=>{
        const id=button.id.slice('atlas-stage-'.length);
        const state=cleared.includes(id)?'cleared':next.includes(id)?'next':'';
        const description={cleared:'Cleared',next:'Next available stop'}[state];
        return (button.dataset.progress||'')===state &&
          button.getAttribute('aria-description')===(description||null);
      }));
    };
    check('Mission briefing has no duplicate stage picker',!d.querySelector('.mission-sheet [aria-pressed], #route'));
    checkStops('Fresh save marks shared Johor once',[],['johor']);
    const continueTo=id=>{
      const before=localStorage.getItem(saveKey),button=$('continueExpedition');
      check('Continue available for '+id,!button.disabled);
      button.click();
      const name=STAGES.find(stage=>stage.id===id).name;
      check('Continue briefs '+name,d.activeElement===$('stageTitle') && $('stageTitle').textContent===name &&
        $('atlas-stage-'+id).getAttribute('aria-pressed')==='true' &&
        $('start').textContent==='Enter '+name && !w.__asean.G && !$('menu').hidden);
      check('Preview preserves save for '+id,localStorage.getItem(saveKey)===before);
    };
    $('atlas-stage-kedah').click();continueTo('johor');
    const setProgress=async save=>{
      const updated=new Promise(resolve=>w.addEventListener('storage',resolve,{once:true}));
      localStorage.setItem(saveKey,JSON.stringify(save));await updated;
    };
    await setProgress(clearState(['johor','pahang']));
    checkStops('Partial branches advance independently',['johor','pahang'],['melaka','terengganu']);
    continueTo('melaka');
    $('route-east').click();
    continueTo('terengganu');
    checkStops('Switching branch preserves clears',['johor','pahang'],['melaka','terengganu']);
    const east=['johor','pahang','terengganu','kelantan'];
    await setProgress(clearState(east));
    checkStops('Completed east has no next stop',east,['melaka']);
    $('continueExpedition').click();
    check('Completed coast keeps its briefing and allows replay',$('continueExpedition').disabled &&
      $('continueExpedition').textContent==='East Coast complete' && $('stageTitle').textContent==='Terengganu' && !$('start').disabled);
    $('route-west').click();
    await setProgress({cleared:[...east,'melaka']});
    checkStops('Legacy Perak access keeps earlier Kuala Lumpur next',[...east,'melaka'],['kl']);
    continueTo('kl');
    await setProgress(clearState([...east,'melaka','kl']));
    checkStops('Kuala Lumpur clear makes Selangor the next mission',[...east,'melaka','kl'],['selangor']);
    continueTo('selangor');
    const complete=STAGES.map(stage=>stage.id);
    await setProgress(clearState(complete));
    checkStops('Fully cleared atlas has no next stops',complete,[]);
    check('Completed west disables Continue',$('continueExpedition').disabled);
    await setProgress(clearState([]));
    continueTo('johor');
    check('One Three.js canvas owns gameplay',w.__asean.scene.terrain.renderer.isWebGLRenderer && d.querySelectorAll('#gameHost canvas').length===1);
    check('All twelve playable heroes load',$('heroes').querySelectorAll('button.hero').length===12);
    const lineupIsCentered=()=>{
      const selected=$('heroes').querySelector('[aria-pressed=true]').getBoundingClientRect();
      const row=$('heroes').getBoundingClientRect();
      const peers=[...$('heroes').querySelectorAll('[aria-pressed=false]')].map(b=>b.getBoundingClientRect());
      return Math.abs((selected.left+selected.right-row.left-row.right)/2)<2 && peers.every(peer=>peer.height<selected.height && peer.bottom<selected.bottom);
    };
    check('Selected survivor stands in front at the center of the lineup',lineupIsCentered());
    $('heroPrevious').click();
    check('Wheel wraps from Fadli to Lia',$('hero-lia').getAttribute('aria-pressed')==='true' && $('selectedHeroName').textContent==='Lia Soares');
    const wheelKey=key=>d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
    $('hero-lia').focus();wheelKey('ArrowRight');
    check('Keyboard wraps forward and focuses the selected portrait',d.activeElement===$('hero-ustaz') && $('hero-ustaz').getAttribute('aria-pressed')==='true');
    $('heroWheel').dispatchEvent(new w.WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));
    check('Scrolling synchronizes the selected hero and skill strip',$('hero-rempit').getAttribute('aria-pressed')==='true' && $('heroSkills').querySelectorAll('strong')[1].textContent==='Wheelie');
    const skillButton=$('heroSkills').children[1];skillButton.click();
    check('The selected skill opens below the entire row',skillButton.getAttribute('aria-expanded')==='true' && !$('menuSkillDescription').hidden && $('menuSkillDescription').offsetWidth >= $('heroSkills').offsetWidth-1);
    $('heroNext').click();
    const layoutDeadline=Date.now()+1500;
    while(!lineupIsCentered() && Date.now()<layoutDeadline)await tick();
    check('Cycling places the new survivor at the front',lineupIsCentered());
    check('Turning the wheel clears the previous hero skill description',$('menuSkillDescription').hidden);
    check('Wheel navigation keeps the current mission',$('selectedHeroName').textContent==='Nok' && $('start').textContent==='Enter Johor');
    $('hero-ustaz').click();
    const preview=$('hero-ustaz').querySelector('.hero-preview'),previewToggle=$('heroPreviewToggle');
    if(w.matchMedia('(prefers-reduced-motion: reduce)').matches){
      check('Reduced motion keeps the larger idle portrait',preview.hidden&&previewToggle.hidden&&!$('hero-ustaz').querySelector('i').hidden);
    }else{
      w.__asean.step(310);
      for(let i=0;i<$('heroSkills').children.length;i++){
        check('Lineup previews skill '+(i+1),!preview.hidden&&$('heroSkills').children[i].classList.contains('preview-cast'));
        if(i<$('heroSkills').children.length-1)w.__asean.step(1050);
      }
      previewToggle.click();w.__asean.step(1050);
      check('Pause freezes the skill preview',$('heroSkills').lastElementChild.classList.contains('preview-cast'));
      previewToggle.click();
    }
    d.activeElement.blur();
    const lobbyKey=(type,key,code,repeat=false)=>d.activeElement.dispatchEvent(
      new w.KeyboardEvent(type,{key,code,repeat,bubbles:true,cancelable:true})
    );
    lobbyKey('keydown','a','KeyA');
    check('A selects the previous survivor without lineup focus',$('hero-lia').getAttribute('aria-pressed')==='true');
    lobbyKey('keydown','d','KeyD');
    check('D selects the next survivor without lineup focus',$('hero-ustaz').getAttribute('aria-pressed')==='true');
    $('controls').showModal();
    lobbyKey('keydown','a','KeyA');
    lobbyKey('keydown',' ','Space');
    lobbyKey('keyup',' ','Space');
    check('Lobby shortcuts are inactive while the field guide is open',!w.__asean.G&&$('hero-ustaz').getAttribute('aria-pressed')==='true');
    $('controls').close();
    check('Campaign atlas opens in Johor', $('atlasPlace').textContent==='Johor' && $('atlasPrevious').disabled);
    const stages=[['johor','Johor'],['melaka','Melaka'],['kl','Kuala Lumpur'],['selangor','Selangor'],['perak','Perak'],['penang','Pulau Pinang'],['kedah','Kedah']];
    const stops=[...stages.map(([,name])=>name),'Chiang Mai','Bagan','Luang Prabang','Hanoi','Siem Reap','Singapore','Yogyakarta','Dili','Bandar Seri Begawan','Cebu'];
    const atlas=w.__asean.scene.atlas,routeDeadline=Date.now()+3000;
    while(atlas.routeLines.length<stops.length-1 && Date.now()<routeDeadline)await tick();
    const matchesPin=(point,stage)=>point && Math.abs(point.x-(stage.lon-110))<.001 && Math.abs(point.z-(9-stage.lat))<.001;
    check('Each gold leg connects two consecutive playable level coordinates',stages.slice(1).every(([id],i)=>{
      const leg=atlas.routeLines[i];
      const from=STAGES.find(stage=>stage.id===stages[i][0]),to=STAGES.find(stage=>stage.id===id);
      return leg && matchesPin(leg[0],from) && matchesPin(leg.at(-1),to);
    }));
    const countries=new Set([$('atlasCountry').textContent]);
    for(let i=1;i<stops.length;i++){
      $('atlasNext').click();countries.add($('atlasCountry').textContent);
      check('Tour stop '+(i+1)+' matches '+stops[i],$('atlasPlace').textContent===stops[i] && $('atlasCount').textContent===String(i+1).padStart(2,'0')+' / '+stops.length);
      check(stops[i]+' preview keeps the selected mission',$('atlasState').textContent===(i<stages.length?'Playable chapter':'Planned chapter') && $('start').textContent==='Enter Johor');
    }
    check('Tour reaches all eleven countries',countries.size===11 && $('atlasNext').disabled);
    $('atlasTour').click();
    check('Tour replays from Johor',$('atlasPlace').textContent==='Johor' && $('atlasTour').getAttribute('aria-pressed')==='true');
    $('atlasTour').click();
    check('Tour can be paused',$('atlasTour').getAttribute('aria-pressed')==='false');
    $('atlasOverview').click();
    check('Overview returns to the Johor origin',$('atlasPrevious').disabled && $('atlasPlace').textContent==='Johor');
    $('hero-ustaz').focus();
    lobbyKey('keydown',' ','Space');
    lobbyKey('keydown',' ','Space',true);
    check('Holding Space does not start a run before release',!w.__asean.G);
    lobbyKey('keyup',' ','Space');
    const launchDeadline=Date.now()+3000;
    while(!w.__asean.G&&Date.now()<launchDeadline)await tick();
    check('Space starts the selected stage and survivor',w.__asean.G?.stage.id==='johor'&&w.__asean.G?.hero.id==='ustaz');
    w.__asean.toMenu();
    {
      const ready=w.__asean;
      ready.newGame('ustaz',0);
      const blessings=ready.G;
      blessings.ranks=[4,5,5,5,5];
      blessings.pass={teh:5,sambal:5,kopi:0,nasi:5,kemboja:5,pelita:5,guli:5};
      function openBlessings(){
        blessings.pending=1;ready.openLevelUp();
        return [...$('ups').children];
      }
      const offers=openBlessings();
      const bolts=offers.find(card=>card.textContent.includes('Nur'));
      const coffee=offers.find(card=>card.textContent.includes('Kopi O'));
      check('Rank five previews the bolt breakpoint and its completed recipe',
        bolts?.querySelector('.up-values')?.textContent.includes('Bolts 2 → 3') &&
        bolts.querySelector('.available')?.textContent.includes('Nur Purnama'));
      check('First matching passive names the newly eligible evolution',
        coffee?.querySelector('.available')?.textContent.includes('Fajar Penuh'));
      check('Passive items keep their category without a skill slot',
        coffee.querySelector('.up-meta strong').textContent==='Passive item' && !coffee.dataset.slot);
      const pin=$('recipePin');
      const track=value=>{
        pin.value=value;
        pin.dispatchEvent(new w.Event('change',{bubbles:true}));
      };
      track('0');
      check('Pin highlights the matching rank',bolts.querySelector('.up-tracking').textContent==='Advances pin');
      track('');
      check('Removing the pin clears its guidance',blessings.trackedEvolution===null && !$('recipeProgress').textContent);
      track('1');
      pin.focus();
      pin.dispatchEvent(new w.KeyboardEvent('keydown',{key:'1',code:'Digit1',bubbles:true,cancelable:true}));
      check('Changing recipes keeps the original offer and consumes no pick',
        blessings.choosing && blessings.pending===0 && offers.every((card,i)=>$('ups').children[i]===card) &&
        bolts.querySelector('.up-tracking').hidden && coffee.querySelector('.up-tracking').textContent==='Advances pin');
      coffee.click();
      check('Picking the ingredient leaves evolution for a separate choice',!blessings.evo[1]);
      check('Next picker offers the completed recipe',
        openBlessings()[0].querySelector('.up-title').textContent==='Fajar Penuh');
      check('Evolution header identifies its target slot and card names the original skill',
        $('up0').querySelector('.up-meta .up-slot')?.textContent===blessings.hero.skills[1].key &&
        $('up0').querySelector('.up-rank')?.textContent.includes(blessings.hero.skills[1].name));
      check('Next picker carries the ready pin',pin.value==='1' && $('recipeProgress').textContent==='Recipe ready' &&
        $('up0').querySelector('.up-tracking').textContent==='Claim pinned evolution');
      $('up0').click();
      check('Claiming the tracked evolution clears the pin',blessings.evo[1] && blessings.trackedEvolution===null);
      blessings.ranks=[5,2,2,5,5];
      Object.keys(blessings.pass).forEach(id=>{blessings.pass[id]=5});
      const paired=openBlessings();
      const skillCard=key=>paired.find(card=>card.querySelector('.up-meta .up-slot')?.textContent===key);
      const q=skillCard('Q'),e=skillCard('E');
      check('Q and E have distinct header accents and independent numbered picks',
        q && e && w.getComputedStyle(q).borderTopColor!==w.getComputedStyle(e).borderTopColor &&
        [q,e].every(card=>Number(card.querySelector('kbd').textContent)===paired.indexOf(card)+1));
      e.click();
      openBlessings();
      track('0');
      ready.newGame('ustaz',0);
      check('A new run starts without a pin',ready.G.trackedEvolution===null);
      ready.toMenu();
    }
    await checkEvolutions(w,check);
    for(const button of $('heroes').querySelectorAll('button.hero')){
      const id=button.id.slice(5),rt=w.__asean;
      await rt.scene.prepareHero(id);
      for(const rank of [1,2,3,4,5]){
        rt.newGame(id,0,true);
        const g=rt.G;
        g.auto=false;g.enemies=[];g.ranks[0]=rank;g.cds[0]=0;
        const enemy=rt.makeGhost('pocong',g.p.x+62,g.p.y);
        enemy.hp=enemy.maxHp=9999;enemy.spd=0;
        if(id==='nadi'){
          g.st.crit=0;g.noElements=true;
          const targets=[enemy,...[-25,25].map(dy=>rt.makeGhost('pocong',g.p.x+43,g.p.y+dy))];
          for(const foe of targets)Object.assign(foe,{hp:9999,maxHp:9999,spd:0,stun:999});
          rt.step(16);
          const expected=1+Math.floor((rank-1)/2);
          check('Open Palm hits '+expected+' melee targets at rank '+rank,g.projs.length===0&&targets.filter(e=>e.hp<9999).length===expected);
          continue;
        }
        rt.step(16);
        const melee=id==='nok'||id==='mira';
        const count=(melee?Number(rank>=2):1)+Math.floor((rank-1)/2)+Number(id==='lan'&&rank>=4);
        check(id+' basic rank '+rank+' launches '+count+' projectiles',g.projs.length===count);
        check(id+' basic shots inherit their unlocked rank '+rank,g.projs.every(q=>q.basicRank===(rank===1?undefined:rank)));
        check(id+' projectiles have independent contacts at rank '+rank,new Set(g.projs.map(q=>q.hit)).size===count);
      }
      rt.toMenu();
    }
    const rosterIcons=new Set();
    for(const [id,country] of [['asha','sg'],['mira','ph'],['dani','bn'],['vanna','kh'],['keo','la'],['nadi','mm'],['lia','tl']]){
      $('hero-'+id).click();
      const flag=w.getComputedStyle($('hero-'+id),'::before');
      check(id+' shows its own flag behind the portrait at 30% opacity',flag.backgroundImage.includes('/flags/'+country+'.webp')&&flag.opacity==='0.3');
      const icons=[...$('heroSkills').querySelectorAll('.ability-art')].map(icon=>w.getComputedStyle(icon));
      const artwork=id==='mira'?'pag-pag-icons.webp':id==='lia'?'lia-shadow-icons.svg':id==='nadi'?'mingun-icons.webp':id==='dani'?'gold-sultan-icons.webp':'roster-skill-icons.webp';
      check(id+' shows dedicated artwork for all five attacks',icons.length===5&&icons.every(icon=>icon.backgroundImage.includes(artwork)));
      const positions=icons.map(icon=>icon.backgroundPosition);
      positions.forEach(position=>rosterIcons.add(artwork+position));
      $('start').click();
      const until=Date.now()+12000;
      while(!w.__asean.G && Date.now()<until)await tick();
      const rt=w.__asean,g=rt.G;
      check(id+' starts from the wheel with the selected kit',g?.hero.id===id && $('heroSkills').children[1].textContent.includes(g.hero.skills[1].name));
      if(!g)continue;
      check(id+' uses the same active-skill icons in the combat HUD',[...$('skills').querySelectorAll('.skill-art')].every((icon,i)=>{
        const art=w.getComputedStyle(icon);
        return art.backgroundImage.includes(artwork)&&art.backgroundPosition===positions[i+1];
      }));
      g.auto=false;g.cds[0]=999;rt.scene.update(0,0);
      const sprite=rt.scene.sprites.get(g.p);
      check(id+' uses its own idle sprite and feet pivot',sprite.key==='hero-motion-'+id && Number(sprite.frame.name)>=56 && sprite.originY>.5);
      rt.scene.drawTerrain();
      const sheet=rt.scene.terrain.actors.sheets.get('hero-motion-'+id);
      check(id+' projects a shadow from its gameplay sprite',sheet?.geometry.instanceCount===1 && sheet.body.geometry===sheet.shadow.geometry && sheet.body.material.uniforms.atlas.value===sheet.shadow.material.uniforms.atlas.value);
      for(let slot=1;slot<=4;slot++){
        if(id==='dani'&&slot===2){
          // The spin owns the visible pose until it completes.
          g.spawnT=999;
          for(let i=0;i<37;i++)rt.step(50);
        }
        if(id==='dani'&&slot===3)rt.makeGhost('pocong',g.p.x+95,g.p.y);
        if(id==='vanna'&&slot===2){
          const e=rt.makeGhost('pocong',g.p.x+95,g.p.y);e.hp=e.maxHp=1000;
          $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
        }
        if(id==='lia'&&slot===4)rt.makeGhost('pocong',g.p.x+70,g.p.y);
        if(id==='asha'&&slot===2){const e=rt.makeGhost('pocong',g.p.x+70,g.p.y);g.roster.asha.tickets.push({e,served:true,duration:6,until:g.t+6})}
        g.ult=g.hero.ultNeed;rt.tryCast(slot);rt.scene.update(0,0);
        const cast=rt.scene.sprites.get(g.p);
        check(id+' uses its own '+g.hero.skills[slot].key+' cast pose',cast.key==='hero-skills-'+id && Math.floor(Number(cast.frame.name)/16)===slot-1);
      }
      rt.newGame(id,0);
      const trial=rt.G,p=trial.p;
      trial.auto=false;trial.cds[0]=999;trial.spawnT=trial.durianT=999;trial.st.crit=0;trial.noElements=true;
      $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
      const target=(dx,dy=0)=>{const foe=rt.makeGhost('pocong',p.x+dx,p.y+dy);foe.hp=foe.maxHp=1000;foe.spd=0;return foe};
      if(id==='asha'){
        const served=target(220),recipient=target(350);
        rt.tryCast(1);const ticket=trial.roster.asha.tickets.find(q=>q.e===served);
        ticket.served=true;rt.tryCast(2);
        check('Cash Out sends a receipt beyond the collected burst',recipient.hp===988&&trial.fx.some(f=>f.kind==='relay'&&f.tx===recipient.x));
      }
      if(id==='mira'){
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);
        check('Last Stove Express travels along the aimed heading',trial.roster.mira.wave.ax>.99&&Math.abs(trial.roster.mira.wave.ay)<.01);
      }
      if(id==='dani'){
        rt.tryCast(3);
        check('Make It Rain stays ready without a target',trial.cds[3]===0&&!trial.roster.dani.rain);
        const foe=target(100);
        rt.tryCast(1);
        for(let i=0;i<5;i++)rt.step(50);
        check('Gold Melting Flamethrower begins its sweep and hits the first foe',trial.roster.dani.channel?.slot===1&&foe.hp<1000);
        rt.tryCast(3);
        check('Make It Rain automatically targets the foe',trial.roster.dani.rain?.x===foe.x&&trial.roster.dani.rain.y===foe.y&&trial.cds[3]>0);
        const hp=foe.hp;
        for(let i=0;i<42;i++)rt.step(50);
        check('Coins fall in repeated waves and damage nearby enemies',!trial.roster.dani.rain&&foe.hp<hp);
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);
        for(let i=0;i<4;i++)rt.step(50);
        check('Bullion Barrage spawns piercing gold bars',trial.projs.some(q=>q.kind==='gold-bar'&&q.hitOptions.slot===4));
        const x=p.x,y=p.y,dustAt=trial.t;
        rt.tryCast(2);
        check('Gold Dust buffs attacks while Barrage continues',!p.dash&&p.x===x&&p.y===y&&trial.roster.dani.dust?.until===dustAt+5&&trial.roster.dani.channel?.slot===4);
        trial.cds[0]=.9;rt.step(50);
        check('Gold Dust makes Gold Rivet fire 50% faster',Math.abs(trial.cds[0]-.825)<1e-8);
        const dustButton=$('sk2'),buffTime=dustButton.querySelector('.buff-time');
        check('Gold Dust shows buff time separately from cooldown',buffTime?.textContent==='5s'&&!buffTime.hidden&&
          dustButton.querySelector('.cdn').textContent==='10'&&dustButton.getAttribute('aria-description')==='Buff active for 5 more seconds'&&
          !buffTime.closest('[aria-live]'));
        rt.togglePause();
        for(let i=0;i<22;i++)rt.step(50);
        check('Gold Dust timer freezes while paused',buffTime.textContent==='5s');
        rt.togglePause();
        for(let i=0;i<21;i++)rt.step(50);
        check('Gold Dust timer counts down after resume',buffTime.textContent==='4s');
        const dust=trial.roster.dani.dust;
        trial.t=dust.until;rt.step(0);
        check('Gold Dust expiry clears its timer and description while cooldown continues',buffTime.hidden&&
          !dustButton.hasAttribute('aria-description')&&!!dustButton.querySelector('.cdn').textContent);
      }
      if(id==='vanna'){
        const foe=target(80),flank=target(0,90),rear=target(-85,0);
        rt.tryCast(2);
        check('Running Stitch links three foes',trial.roster.vanna.stitches.size===3&&[foe,flank,rear].every(e=>e.hp===974));
        const origin={x:p.x,y:p.y};
        rt.tryCast(3);
        check('Foldstep summons the silk familiar without moving Vanna',p.x===origin.x&&p.y===origin.y&&trial.roster.vanna.familiar);
        rt.step(50);
        check('The silk familiar attacks the nearest foe',foe.hp===929&&flank.hp===974);
        for(let i=0;i<15;i++)rt.step(50);
        check('The silk familiar attacks again as enemies stay nearby',foe.hp===884&&flank.hp===974);
        trial.roster.vanna.familiar=null;
        const corner=target(249,249),outside=target(251,-249);
        Object.assign(corner,{spd:60,kvx:100});
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);
        const x=corner.x,y=corner.y;
        for(let i=0;i<20;i++)rt.step(50);
        check('Silk Loom holds its target against knockback while active',corner.x===x&&corner.y===y&&corner.kvx===0);
        const late=target(-251,-80),late2=target(-251,-130);
        for(const e of [late,late2])Object.assign(e,{hp:70,maxHp:70,kvx:100});
        rt.step(50);
        check('Silk Loom shreds mobs immediately when they enter its square',late.hp===34&&late2.hp===34&&trial.roster.vanna.loom.targets.has(late));
        for(let i=0;i<61;i++)rt.step(50);
        check('Silk Loom ticks ten times on a square corner',corner.hp===640&&!trial.roster.vanna.loom);
        check('Silk Loom kills incoming mobs and leaves enemies outside the square free',late.dead&&late2.dead&&outside.hp===1000);
      }
      if(id==='keo'){
        rt.tryCast(1);for(let i=0;i<31;i++)rt.step(50);
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);rt.tryCast(2);
        check('A timed register moves the next echo to the aimed beat',trial.roster.keo.pulses[0].x>p.x+150&&trial.roster.keo.pulses[0].damage===42);
      }
      if(id==='nadi'){
        const foe=target(72);trial.st.crit=1;rt.tryCast(1);
        for(let i=0;i<33;i++)rt.step(50);
        check('Critical palms fill Perfect Recall',trial.identity.ready&&foe.hp<foe.maxHp);
        rt.tryCast(2);
        check('Hand of Buddha spends Recall on a travelling wave',!trial.identity.ready&&trial.roster.nadi.waves[0]?.empowered);
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);
        check('Buddha’s Refuge raises a statue with three guardians',trial.roster.nadi.ward?.monks.length===3);
      }
      if(id==='lia'){
        const prey=target(110),start=p.x;
        rt.tryCast(2);const shadow=trial.roster.lia.shadow;
        check('Shadowstep blinks past its target and backstabs on one press',p.x>prey.x&&!p.dash&&prey.hp===928);
        check('Shadowstep leaves a shadow at Lia’s last visible position',shadow?.x===start&&shadow.until>trial.t);
        const pursuer=rt.makeGhost('minyak',start+60,p.y);
        pursuer.spd=80;p.x=start+100;trial.cds[0]=0;
        rt.step(50);
        check('Pursuit follows the afterimage while automatic knives pause',pursuer.x<start+60&&trial.projs.length===0);
        pursuer.dead=true;trial.cds[0]=999;
        rt.tryCast(3);
        check('Blade Wheel reveals Lia and slows nearby enemies',prey.hp===886&&prey.slowT===2&&!trial.roster.lia.shadow);
        trial.ult=trial.hero.ultNeed;rt.tryCast(4);
        for(let i=0;i<20;i++)rt.step(50);
        check('Midnight Hunt completes three cuts on a lone target',prey.hp===886-3*34&&!trial.roster.lia.hunt);
        Object.assign(prey,{x:p.x+85,y:p.y,stun:999});
        trial.cds[2]=0;
        rt.tryCast(2);
        const hidden=!!trial.roster.lia.shadow,before=prey.hp;
        trial.auto=true;trial.autoMode=0;
        rt.step(50);
        trial.auto=false;
        check('Auto Crescent Cut attacks out of Shadowstep',hidden&&!trial.roster.lia.shadow&&trial.identity.castSlot===1&&prey.hp<before);
      }
      rt.openLevelUp();check(id+' can rank up',$('levelup').hidden===false);
      rt.toMenu();
    }
    check('The seven new survivors use 35 distinct icon crops',rosterIcons.size===35);
    for(const [id,name] of [['ustaz','Ustaz Fadli'],['rempit','Mat Rempit "Kama"'],['nok','Nok'],['lan','Cô Lan'],['sari','Sari']]){
      $('hero-'+id).click();
      check(name+' selection and skill details',$('hero-'+id).getAttribute('aria-pressed')==='true'&&$('selectedHeroName').textContent===name&&$('heroSkills').children.length===5);
      $('start').click();await tick();
      if(id==='ustaz'){
        const canvas=$('game');
        check('Johor opens its Three.js village',canvas&&!canvas.hidden&&canvas.dataset.region==='johor');
        const rt=w.__asean,g=rt.G,xp=$('xpbar'),notice=$('banner');
        check('Experience has a full-width progress bar at the top',xp instanceof w.HTMLProgressElement&&
          xp.getBoundingClientRect().bottom<$('time').getBoundingClientRect().top&&xp.getBoundingClientRect().width>w.innerWidth*.8);
        check('Announcements are compact, centered and below the clock',
          parseFloat(w.getComputedStyle(notice).fontSize)>=14&&
          Math.abs(notice.getBoundingClientRect().left+notice.getBoundingClientRect().width/2-w.innerWidth/2)<2&&
          notice.getBoundingClientRect().top>$('time').getBoundingClientRect().bottom);
        rt.addXP(3);g.p.hp=g.p.maxHp/2;rt.scene.update(0,0);rt.scene.drawTerrain();
        check('Experience progress follows the current level threshold',xp.value===3&&xp.max===g.need);
        const health=$('playerHealth'),box=health.getBoundingClientRect();
        check('The player meter shows half health above the sprite',!health.hidden&&box.bottom<w.innerHeight/2-30&&
          Math.abs(box.left+box.width/2-w.innerWidth/2)<2&&health.style.getPropertyValue('--health')==='0.5');
        g.p.hp=g.p.maxHp;rt.scene.update(0,0);rt.scene.drawTerrain();
        check('Healing refills the player meter',health.style.getPropertyValue('--health')==='1');
      }
      check(name+' starts a run',w.__asean.G.hero.id===id&&$('menu').hidden&&!$('hud').hidden);
      for(let direction=0;direction<8;direction++){
        const angle=direction*Math.PI/4;
        w.__asean.G.p.face=[Math.cos(angle),Math.sin(angle)];w.__asean.scene.update(0,0);
        check(name+' facing '+direction,[...w.__asean.scene.sprites.values()].some(o=>o.key==='hero-directions'&&o.frame.name===String(['ustaz','rempit','nok','lan','sari'].indexOf(id)*8+direction)));
      }
      const runtime=w.__asean;
      runtime.scene.drawTerrain();
      const actorLayer=runtime.scene.terrain.actors;
      const idleSheet=actorLayer.sheets.get('hero-directions');
      check(name+' uses one Three.js body and matching shadow atlas',idleSheet.geometry.instanceCount===1&&idleSheet.shadow.geometry===idleSheet.body.geometry&&idleSheet.shadow.material.uniforms.atlas.value===idleSheet.body.material.uniforms.atlas.value);
      check(name+' status and signature share the hero panel',$('playerStatus').contains($('signature'))&&$('hudHero').textContent===name);
      if(id==='nok'){
        const g=runtime.G,health=$('playerHealth'),grounded=health.getBoundingClientRect().bottom;
        g.auto=false;g.ult=g.hero.ultNeed;runtime.tryCast(4);
        for(let i=0;i<4;i++)runtime.scene.update(0,50);
        runtime.scene.drawTerrain();
        const airborne=actorLayer.sheets.get('hero-skills-nok').geometry.getAttribute('pose');
        check('Leap shadow uses ground coordinates and a separate lift',Math.abs(airborne.getY(0)-g.p.y)<.01&&airborne.getZ(0)>60&&airborne.getW(0)===1);
        check('The player health bar follows Nok into the air',health.getBoundingClientRect().bottom<grounded-20);
        runtime.newGame(id,0);runtime.scene.update(0,0);
      }
      // Animation failures: missing directional frames, frozen cycles, wrong attack facing,
      // basic attacks interrupting skill poses, and paused/dead runs continuing animation.
      const animRun=w.__asean.G,scene=w.__asean.scene;
      // Timed encounters can redirect casts or open rewards during the scripted pose sequence.
      animRun.events.add('regionalElite');
      for(const type of Object.keys(animRun.stage.folklore))animRun.events.add('arrival:'+type);
      animRun.auto=false;animRun.spawnT=animRun.durianT=999;animRun.cds[0]=999;
      const actor=()=>[...scene.sprites.values()].find(o=>o.key==='hero-motion-'+id);
      const directions=[['KeyD'],['KeyD','KeyS'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyA','KeyW'],['KeyW'],['KeyW','KeyD']];
      for(let direction=0;direction<8;direction++){
        const walkFrames=new Set(),rideAngles=new Set(),attackFrames=new Set();
        for(const code of directions[direction])w.dispatchEvent(new w.KeyboardEvent('keydown',{code}));
        for(let n=0;n<16;n++){scene.update(0,50);const sprite=actor();if(sprite){walkFrames.add(Number(sprite.frame.name));rideAngles.add(sprite.rotation)}}
        for(const code of directions[direction])w.dispatchEvent(new w.KeyboardEvent('keyup',{code}));
        if(id==='rempit')check('Kama rides straight without suspension jitter in direction '+direction,
          walkFrames.size===1&&walkFrames.has(direction)&&rideAngles.size===1&&rideAngles.has(0));
        else if(w.matchMedia('(prefers-reduced-motion: reduce)').matches)check(name+' holds a quiet walk pose in direction '+direction,walkFrames.size===1&&walkFrames.has(direction));
        else check(name+' walks through four frames in direction '+direction,walkFrames.size===4&&[...walkFrames].every(f=>f<32&&f%8===direction));
        scene.update(0,50);
        const angle=direction*Math.PI/4;
        $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+Math.cos(angle)*100,clientY:w.innerHeight/2+Math.sin(angle)*100}));
        animRun.cds[1]=0;w.__asean.tryCast(1);
        for(let n=0;n<20;n++){scene.update(0,40);const sprite=[...scene.sprites.values()].find(o=>o.key==='hero-skills-'+id);if(sprite)attackFrames.add(Number(sprite.frame.name));if(scene.sprites.get(animRun.p)?.key==='nok-flying-knee')attackFrames.add('knee')}
        check(name+' plays unique Q windup/release in direction '+direction,id==='nok'?attackFrames.has('knee')&&!animRun.sea.knee&&Math.cos(animRun.identity.castAngle-angle)>.99:attackFrames.has(direction)&&attackFrames.has(8+direction)&&[...attackFrames].every(f=>f%8===direction));
        for(let n=0;n<10;n++)scene.update(0,50);
      }
      if(id==='rempit'){
        const enemy=runtime.makeGhost('pocong',animRun.p.x-100,animRun.p.y);
        enemy.stun=999;
        animRun.cds[0]=0;
        w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyD'}));
        scene.update(0,50);
        const rider=scene.sprites.get(animRun.p);
        check('Kama keeps riding east while throwing his spanner west',animRun.projs.some(p=>p.kind==='spanner'&&p.vx<0)&&
          rider.key==='hero-motion-rempit'&&Number(rider.frame.name)===0);
        w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyD'}));
        enemy.dead=true;
        animRun.cds[0]=999;
      }
      for(let slot=1;slot<=4;slot++)for(let direction=0;direction<8;direction++){
        const angle=direction*Math.PI/4,poses=new Set();
        $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+Math.cos(angle)*100,clientY:w.innerHeight/2+Math.sin(angle)*100}));
        const steer=id==='rempit'&&slot===1?directions[direction]:[];
        for(const code of steer)w.dispatchEvent(new w.KeyboardEvent('keydown',{code}));
        animRun.cds[slot]=0;animRun.ult=animRun.hero.ultNeed;
        w.__asean.tryCast(slot);
        for(const code of steer)w.dispatchEvent(new w.KeyboardEvent('keyup',{code}));
        const effect=animRun.fx.findLast(f=>f.kind==='spell');
        check(name+' skill '+slot+' has its own effect '+direction,effect?.skill===id+'-'+slot);
        for(let n=0;n<35;n++){scene.update(0,40);const sprite=[...scene.sprites.values()].find(o=>o.key==='hero-skills-'+id);if(sprite)poses.add(Number(sprite.frame.name));if(scene.sprites.get(animRun.p)?.key==='nok-flying-knee')poses.add('knee')}
        check(name+' skill '+slot+' distinct poses '+direction,id==='nok'&&slot===1?poses.has('knee')&&!animRun.sea.knee:poses.has((slot-1)*16+direction)&&poses.has((slot-1)*16+8+direction));
      }
      // Crowded battles must not evict a still-active ultimate to make room for hit sparks.
      animRun.ult=animRun.hero.ultNeed;animRun.cds[4]=0;w.__asean.tryCast(4);
      for(let n=0;n<650;n++)animRun.fx.push({kind:'ring',x:0,y:0,r:2,c:'#fff',life:2,max:2});
      for(let n=0;n<6;n++)scene.update(0,50);
      check(name+' ultimate survives effect pressure',animRun.fx.length<=600&&animRun.fx.some(f=>f.skill===id+'-4'));
      for(let n=0;n<30;n++)scene.update(0,50);
      check(name+' returns to directional idle',[...scene.sprites.values()].some(o=>o.key==='hero-directions'));
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
      check(name+' player health meter is hidden in the lobby',$('playerHealth').getBoundingClientRect().width===0);
    }
    for(const id of ['ustaz','rempit','nok','lan','sari']){
      const rt=w.__asean;
      rt.newGame(id,0);
      const g=rt.G;
      g.auto=false;g.cds[0]=999;g.st.crit=0;g.spawnT=g.durianT=999;g.noElements=true;
      const foe=x=>{const e=rt.makeGhost('pocong',x,0);e.hp=e.maxHp=1000;e.spd=0;return e};
      $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
      if(id==='ustaz'){
        foe(60).burnT=2;g.p.hp-=20;const before=g.p.hp;rt.tryCast(3);
        check('Seruan restores health from burning enemies',g.p.hp===before+4);
      }else if(id==='rempit'){
        const target=foe(245);
        for(let i=0;i<2;i++)g.zones.push({kind:'fire',x:204+i,y:0,r:24,life:2,max:2,dps:20,acc:0});
        g.cds[1]=3;rt.tryCast(3);check('Two ignited patches refund two seconds of Wheelie',g.cds[1]===1);check('Horn ignites nearby exhaust once per target',target.hp===980&&g.zones.length===0);
      }else if(id==='nok'){
        const close=foe(70),tip=foe(190);rt.tryCast(1);
        for(let i=0;i<10;i++)rt.step(50);
        check('Flying Knee rewards full extension',close.hp-tip.hp===27&&tip.stun>0);
        close.x=g.p.x+45;close.y=g.p.y;
        rt.tryCast(3);close.kvx=0;rt.tryCast(2);
        check('Wai Khru changes Turning Elbow into an inward sweep',close.kvx<0&&close.stun>0);
      }else if(id==='lan'){
        const soaked=foe(40),nearby=foe(100);soaked.slowT=3;rt.tryCast(2);
        Object.assign(g.sea.allies[0],{x:40,y:0,tg:soaked,cd:0});g.sea.allies.slice(1).forEach(a=>a.cd=1);
        rt.step(16);check('A guard splashes a neighbour of its soaked target',nearby.hp<1000);
      }else{
        g.sea.images.push({x:65,y:0,t:.4,r:60,dmg:20},{x:-65,y:0,t:.4,r:60,dmg:20});
        rt.tryCast(1);rt.step(16);
        check('Crescent kick detonates only echoes inside its arc',g.sea.images.length===1&&g.sea.images[0].x<0);
      }
      rt.toMenu();
    }
    {
      const rt=w.__asean;
      rt.newGame('ustaz',0);
      const g=rt.G,p=g.p;
      p.hp=p.maxHp*.5;
      g.pupT=0;
      rt.step(0);
      const food=g.pups[0];
      check('At half health the next roaming pickup is Ketupat',food?.type==='ketupat');
      Object.assign(p,{x:food.x,y:food.y});
      rt.step(0);
      check('Collecting Ketupat restores 35% of max HP once',
        Math.abs(p.hp-p.maxHp*.85)<.001&&g.pups.length===0);
      rt.dropPup(p.x,p.y,'ketupat');
      g.stop=0;
      rt.step(0);
      check('Ketupat healing caps at full health',p.hp===p.maxHp);
      p.hp=1;
      const level=g.level;
      rt.addXP(g.need-g.xp-1);
      check('XP below the level threshold leaves HP alone',g.level===level&&p.hp===1);
      rt.addXP(1);
      check('Earning a level restores 25% of maximum HP and queues a blessing',
        g.level===level+1&&p.hp===1+p.maxHp*LEVEL_UP_HEAL&&g.pending===1);
      rt.toMenu();
    }
    {
      const rt=w.__asean;
      rt.newGame('ustaz',0);
      const g=rt.G,p=g.p,icon=$('shrineBuff');
      rt.dropPup(p.x+80,p.y,'monsoon');
      rt.scene.update(0,0);rt.scene.drawTerrain();
      check('Monsoon Shrine appears on the ground before contact',
        rt.scene.sprites.get(g.pups[0])?.key==='shrines'&&icon.hidden);
      Object.assign(p,{x:g.pups[0].x,y:g.pups[0].y});
      rt.scene.update(0,0);rt.scene.drawTerrain();
      check('Crossing the shrine consumes it and shows the overhead buff',
        !g.pups.length&&g.shrineT===12&&!icon.hidden&&
        icon.getBoundingClientRect().bottom<=$('playerHealth').getBoundingClientRect().top);
      g.stop=0;
      rt.togglePause();rt.step(50);
      check('Pausing freezes Monsoon Shrine duration',g.shrineT===12);
      rt.togglePause();
      const stride=()=>{
        p.vx=p.vy=0;
        w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyD',key:'d'}));
        rt.step(50);
        w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
        return p.vx;
      };
      const buffed=stride();
      rt.dropPup(p.x,p.y,'monsoon');rt.step(0);
      check('A second shrine refreshes the buff',g.shrineT===12);
      g.shrineT=.01;g.stop=0;
      rt.scene.update(0,50);rt.scene.drawTerrain();
      const normal=stride();
      check('Expiry hides the emblem and restores normal walking speed',
        icon.hidden&&g.shrineT===0&&normal>0&&Math.abs(buffed/normal-1.35)<.001);
      rt.toMenu();
    }
    checkShrinePickups(w,check);
    checkElements(w,check);
    // Two runs at the same timestamp and camera position can have different spells.
    // Inspect the submitted geometry immediately, before another simulation tick.
    for(const slot of [1,4]){
      const rt=w.__asean;rt.newGame('ustaz',0);
      const g=rt.G;g.ult=g.hero.ultNeed;g.auto=false;g.cds[0]=999;
      rt.tryCast(slot);rt.scene.update(0,50);rt.scene.drawTerrain();
      const batch=rt.scene.terrain.actors.group.getObjectByName('hero-effects-ustaz');
      const frames=batch?.geometry.getAttribute('frameRect');
      const rows=batch?.visible?Array.from({length:batch.geometry.instanceCount},(_,i)=>4-Math.round(frames.getY(i)*5)):[];
      check('Fresh run submits only the selected spell row '+slot,rows.length>0&&rows.every(row=>row===slot));
      rt.toMenu();
    }
    // Failure cases: idle/cooldown casts farming power, repeated techniques counting as a combo,
    // stale charge after retry, counter charge never expiring, and empowered casts failing to consume.
    for(const id of ['ustaz','rempit','nok','lan','sari']){
      $('hero-'+id).click();$('start').click();await tick();
      const rt=w.__asean,g=rt.G;
      g.auto=false;g.spawnT=g.durianT=999;g.cds[0]=999;g.st.crit=0;g.noElements=true;
      const advance=seconds=>{for(let t=0;t<seconds;t+=.05)rt.step(50)};
      const foe=(x=70)=>{const e=rt.makeGhost('pocong',g.p.x+x,g.p.y);e.hp=e.maxHp=10000;e.spd=0;e.stun=999;return e};
      canvasAim();
      function canvasAim(){$('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}))}
      check(id+' starts with an empty signature meter',g.identity.charge===0);
      check(id+' explains its combat loop',$('heroTrait').textContent.length>40&&$('signatureName').textContent===g.hero.identity.name);
      if(id==='ustaz'){
        foe(150);g.cds[0]=0;advance(3.1);
        check('Fadli charges Sanctuary through basic attacks',g.identity.charge===4);
        g.p.hp=90;$('sk3').click();
        check('Fadli spends Sanctuary on a healing ward',g.identity.charge===0&&g.zones.some(z=>z.kind==='barrier'));
        advance(.6);check('Sanctuary heals inside its area',g.p.hp>90);
        check('Healing emits green recovery numbers',g.texts.some(t=>t.kind==='heal'&&t.s.startsWith('+')));
      }else if(id==='rempit'){
        const canvas=$('game'),key=(type,code)=>w.dispatchEvent(new w.KeyboardEvent(type,{code}));
        rt.makeGhost('pocong',0,-170).stun=999;
        canvas.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2,clientY:w.innerHeight/2-100}));
        g.cds[0]=0;advance(.05);
        check('Kama auto-fires a spanner at the enemy to the north',g.projs.some(p=>p.kind==='spanner'&&p.vy<0));
        const startY=g.p.y;
        key('keydown','KeyS');key('keydown','KeyQ');
        key('keyup','KeyQ');key('keyup','KeyS');
        check('Kama dashes south when down and Q arrive in the same frame',g.p.dash?.vy>0&&Math.abs(g.p.dash.vx)<1);
        check('Wheelie effects and pose face in the dash direction',Math.sin(g.identity.castAngle)>.99&&
          Math.sin(g.fx.findLast(f=>f.skill==='rempit-1').a)>.99);
        advance(.4);check('Kama escapes south while his spanner flies north',g.p.y>startY+150);
        key('keydown','ArrowLeft');advance(.05);key('keyup','ArrowLeft');
        g.cds[1]=0;rt.tryCast(1);
        check('Manual Wheelie uses the last movement direction with neutral input',g.p.dash?.vx<0&&Math.abs(g.p.dash.vy)<1);
        g.p.dash=null;g.cds[1]=0;
        const touch=(type,x,y)=>canvas.dispatchEvent(new w.PointerEvent(type,{pointerId:7,pointerType:'touch',clientX:x,clientY:y}));
        touch('pointerdown',60,300);touch('pointermove',104,344);$('sk1').click();touch('pointerup',104,344);
        check('Touch Wheelie follows the joystick before the next movement tick',
          g.p.dash?.vx>0&&g.p.dash?.vy>0&&Math.abs(g.p.dash.vx-g.p.dash.vy)<1&&Math.abs(Math.hypot(g.p.dash.vx,g.p.dash.vy)-1250)<1);
        g.p.dash=null;g.enemies=[];
        for(const x of [-40,40])rt.makeGhost('pocong',g.p.x+x,g.p.y-100).stun=999;
        g.auto=true;g.autoMode=0;g.cds[1]=g.cds[2]=0;
        advance(.05);
        check('An automatically triggered Wheelie still targets enemies for its linked combo',g.p.dash?.vy<0&&g.p.exhaust>0);
        g.auto=false;g.p.dash=null;g.p.exhaust=0;g.cds[1]=0;g.identity.charge=0;g.enemies=[];
        advance(1);check('Kama cannot gain Redline while idle',g.identity.charge===0);
        w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyD',key:'d'}));advance(3.3);
        w.dispatchEvent(new w.KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
        check('Kama builds Redline from movement',g.identity.charge===100);
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
    for(const id of ['ustaz','rempit','nok','lan','sari','asha','mira','dani','vanna','keo','nadi','lia']){
      const rt=w.__asean;
      await rt.scene.prepareHero(id);
      rt.newGame(id,0);
      const g=rt.G;
      g.auto=false;
      g.cds[0]=999;
      rt.tryCast(1);
      const baseCooldown=g.cds[1];
      if(id==='nadi'||id==='dani')for(let i=0;i<(id==='dani'?38:25);i++)rt.step(50);
      g.rewards.push({event:'check-sash',slot:'belt',offer:['techniqueSash'],consumed:false});
      rt.step(0);
      d.querySelector('[data-item="techniqueSash"]').click();
      g.cds[1]=0;
      rt.tryCast(1);
      check(id+' casts an upgraded '+g.hero.skills[1].name,
        baseCooldown>0&&Math.abs(g.cds[1]-baseCooldown*.93)<1e-8&&g.ranks[1]===1);
      rt.toMenu();
    }
    const westStages=stages.map(([id])=>id);
    const checkVictoryRoute=async(route,cleared,win,title,nextRoute,nextId)=>{
      await setProgress(clearState(cleared));
      $('route-'+route).click();
      $('atlas-stage-'+win).click();$('start').click();await tick();
      await w.__asean.endGame(true);
      check(win+' victory shows '+title,$('endt').textContent===title);
      const nextName=STAGES.find(stage=>stage.id===nextId).name;
      check(win+' victory offers '+nextName,!$('next').hidden && d.activeElement===$('next') &&
        $('ends').textContent.includes(nextName));
      $('next').click();
      check(win+' victory continues on '+nextRoute+' at '+nextId,
        w.__asean.G.stage.id===nextId && w.__asean.G.campaignRoute===nextRoute && !w.__asean.G.over);
      w.__asean.toMenu();
    };
    await checkVictoryRoute('west',['melaka'],'kedah','Kedah is safe','west','johor');
    await checkVictoryRoute('east',['johor'],'kelantan','Kelantan is safe','east','pahang');
    await checkVictoryRoute('west',[...westStages.filter(id=>id!=='kl'),'pahang'],'kl',
      'West Coast complete','east','terengganu');
    await checkVictoryRoute('east',[...east.filter(id=>id!=='pahang'),'melaka'],'pahang',
      'East Coast complete','west','kl');
    $('route-west').click();
    await setProgress(clearState(complete.filter(id=>id!=='kedah')));
    $('atlas-stage-kedah').click();$('start').click();await tick();
    const beforeFinal=localStorage.getItem(saveKey),write=w.Storage.prototype.setItem;
    try{
      w.Storage.prototype.setItem=()=>{throw new w.DOMException('Storage full','QuotaExceededError')};
      await w.__asean.endGame(true);
    }finally{w.Storage.prototype.setItem=write}
    check('Failed final clear shows ordinary victory and storage failure',
      $('endt').textContent==='Kedah is safe' && !$('ends').textContent && $('next').hidden &&
      $('endShopHint').textContent.includes('could not be saved') && d.activeElement===$('again'));
    check('Failed final clear preserves the previous save',localStorage.getItem(saveKey)===beforeFinal);
    $('again').click();
    check('Failed final clear can retry Kedah',w.__asean.G.stage.id==='kedah' && !w.__asean.G.over);
    $('pauseButton').click();$('quit').click();
    await setProgress(clearState([]));
    for(const [index,[id,name]] of stages.entries()){
      $('atlas-stage-'+id).click();
      check(name+' map pin follows the selected mission',$('atlasPlace').textContent===name && $('atlasCount').textContent.startsWith(String(index+1).padStart(2,'0')) && $('atlasState').textContent==='Playable chapter');
      check(name+' mission briefing',$('stageTitle').textContent===name&&$('atlas-stage-'+id).getAttribute('aria-pressed')==='true');
      $('start').click();await tick();
      check(name+' launches selected stage',w.__asean.G.stage.id===id);
      await w.__asean.endGame(true);
      if(index<stages.length-1){
        $('next').click();await tick();
        check('Victory in '+name+' advances to '+stages[index+1][1],w.__asean.G.stage.id===stages[index+1][0]);
        $('pauseButton').click();$('quit').click();
      }else{
        check('Kedah completes the West Coast and points to Pahang',$('endt').textContent==='West Coast complete' && !$('next').hidden && $('ends').textContent.includes('Pahang'));
        $('tomenu').click();
      }
    }
    $('route-east').click();
    const eastStages=['johor','pahang','terengganu','kelantan'];
    check('East Coast becomes the active campaign branch',$('route-east').getAttribute('aria-pressed')==='true');
    check('East Coast starts from shared Johor',$('start').textContent==='Enter Johor' && $('atlasCount').textContent==='01 / 14');
    const eastDeadline=Date.now()+3000;
    while($('atlas-stage-pahang')?.hidden && Date.now()<eastDeadline)await tick();
    check('Pahang is selectable from the 3D map',!$('atlas-stage-pahang').hidden);
    $('atlas-stage-pahang').click();
    check('Map pins select the actual mission',$('start').textContent==='Enter Pahang' && $('atlasPlace').textContent==='Pahang');
    check('East Coast route legs connect the playable pins',eastStages.slice(1).every((id,i)=>{
      const leg=atlas.routeLines[i];
      return leg && matchesPin(leg[0],STAGES.find(stage=>stage.id===eastStages[i])) && matchesPin(leg.at(-1),STAGES.find(stage=>stage.id===id));
    }));
    $('atlas-stage-johor').click();$('start').click();await tick();
    for(const [index,id] of eastStages.entries()){
      check('East Coast campaign reaches '+id,w.__asean.G.stage.id===id && w.__asean.G.world.id===id);
      await w.__asean.endGame(true);
      if(index<eastStages.length-1){
        $('next').click();await tick();
      }else{
        check('All ten clears finish Malaysia',$('endt').textContent==='Malaysia complete' && $('next').hidden && d.activeElement===$('again'));
        $('tomenu').click();
      }
    }
    check('Returning to the atlas keeps the East Coast route',$('route-east').getAttribute('aria-pressed')==='true' && $('start').textContent==='Enter Kelantan');
    $('route-west').click();
    check('Switching to the West Coast returns to shared Johor',$('route-west').getAttribute('aria-pressed')==='true' && $('start').textContent==='Enter Johor');
    $('helpButton').click();check('Controls dialog opens',$('controls').open);
    $('closeControls').click();check('Controls dialog closes',!$('controls').open);
    frame.width=1280;frame.height=720;await tick();
    check('1280×720 launch button stays above the fold',$('start').getBoundingClientRect().bottom<=720);
    frame.width=375;frame.height=667;await tick();
    const inView=id=>{
      const box=$(id).getBoundingClientRect();
      return box.height>0&&box.top>=0&&box.bottom<=w.innerHeight;
    };
    check('Phone shows stage, survivor and launch together',['stageTitle','selectedHeroName','start'].every(inView));
    $('changeStage').click();
    check('Stage chooser opens the atlas',inView('atlasHeading'));
    const phonePin=$('atlas-stage-melaka'),pinDeadline=Date.now()+3000;
    while((phonePin.hidden||!inView(phonePin.id))&&Date.now()<pinDeadline)await tick();
    check('Melaka is visible in the phone atlas',inView(phonePin.id));
    phonePin.click();
    check('Phone atlas updates the mission briefing',$('stageTitle').textContent==='Melaka' && phonePin.getAttribute('aria-pressed')==='true');
    $('pickerDone').click();
    check('Phone lobby keeps the stage chosen on the map',$('start').textContent==='Enter Melaka' && inView('start'));
    frame.width=320;await tick();
    $('changeStage').click();
    const kedahPin=$('atlas-stage-kedah');
    const reachable=()=>{
      const {x,y,width,height}=kedahPin.getBoundingClientRect();
      return width>0&&d.elementFromPoint(x+width/2,y+height/2)?.closest('.atlas-stage')===kedahPin;
    };
    const kedahDeadline=Date.now()+3000;
    while(!reachable()&&Date.now()<kedahDeadline)await tick();
    check('Narrow phone route controls leave Kedah tappable',reachable());
    $('atlas-stage-johor').click();
    $('pickerDone').click();
    frame.width=375;await tick();
    $('changeSurvivor').click();
    check('Survivor chooser opens the lineup',inView('heroWheel'));
    $('pickerDone').click();
    frame.height=900;
    for(const width of [1440,768,390,320]){
      frame.width=width;await tick();
      const bounds=$('start').getBoundingClientRect();
      if($('menu').scrollWidth>width)evidence.overflow=[...$('menu').querySelectorAll('*')].map(e=>({tag:e.tagName,id:e.id,class:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left<0||e.right>width);
      check(width+'px lobby has no horizontal overflow',$('menu').scrollWidth<=width&&bounds.left>=0&&bounds.right<=width);
    }
    $('start').click();
    const firstFrameDeadline=Date.now()+3000;
    while(!$('playerHealth').getBoundingClientRect().height && Date.now()<firstFrameDeadline)await tick();
    check('Three.js renders an instanced player sprite',w.__asean.scene.terrain.actors.sheets.get('hero-directions')?.body.visible);
    const phoneNotice=$('banner').getBoundingClientRect();
    // The compact notice sits just above the skill bar on phones.
    check('Phone announcements stay readable and fit the viewport',parseFloat(w.getComputedStyle($('banner')).fontSize)>=14&&
      phoneNotice.left>=8&&phoneNotice.right<=w.innerWidth-8&&phoneNotice.bottom<=$('skills').getBoundingClientRect().top);
    $('pauseButton').click();$('pauseGear').click();
    check('Phone inventory opens from Pause',w.__asean.G.paused&&!$('lootPanel').hidden);
    $('lootClose').click();
    check('Closing inventory returns to Pause',!$('pause').hidden&&w.__asean.G.paused);
    $('resume').click();
    const beforeX=w.__asean.G.p.x;
    w.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD',key:'d'}));
    const movementDeadline=Date.now()+2500;
    while(w.__asean.G.p.x<=beforeX&&Date.now()<movementDeadline)await tick();
    w.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD',key:'d'}));
    check('Keyboard movement changes player position',w.__asean.G.p.x>beforeX);
    const beforeTouch=w.__asean.G.p.x,canvas=$('game');
    canvas.dispatchEvent(new w.PointerEvent('pointerdown',{pointerId:7,pointerType:'touch',clientX:60,clientY:300}));
    canvas.dispatchEvent(new w.PointerEvent('pointermove',{pointerId:7,pointerType:'touch',clientX:115,clientY:300}));
    check('Touch drag updates the joystick before the frame renders',w.__asean.joystick?.x===115);
    const touchDeadline=Date.now()+2500;
    while(w.__asean.G.p.x<=beforeTouch&&Date.now()<touchDeadline)await tick();
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
    const numberLabel=w.__asean.scene.terrain.labels.group.children.find(o=>o.name===damageMessage.s);
    check('Critical numbers render as Three.js text billboards',numberLabel?.isSprite&&numberLabel.material.map.isCanvasTexture);
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
      const portal=w.__asean.raid.state.portal;g.p.x=portal.x;g.p.y=portal.y;
      // The previous reward can leave a few frames of hit-stop before portal entry.
      for(let frame=0;frame<40&&!g.raid;frame++)w.__asean.scene.update(0,50);
      check(reward+': walking into portal enters raid',!!g.raid&&!!g.raidBoss);
      check(reward+': raid has native visual guidance',!$('raidGuide').hidden);
      const beforeLevel=g.level,beforeEvolutions=Object.keys(g.evo).length;
      w.__asean.kill(g.raidBoss);
      check(reward+': victory begins reward sequence',g.raid.won);
      for(let frame=0;g.raid&&frame<160;frame++){
        if(g.choosing)$('up0').click();
        if(g.lootModal==='reward')$('lootSkip').click();
        w.__asean.step(50);
      }
      check(reward+': returns after required reward choices',!g.raid);
      check(reward+': reward is granted',reward==='orb'?Object.keys(g.evo).length>beforeEvolutions:g.level>=beforeLevel+2);
      if(reward==='xp')check('Experience displays the new level threshold after the raid',$('xpbar').value===g.xp&&$('xpbar').max===g.need);
    }
    const resultsApi=w.__asean;
    const beforeResults=localStorage.getItem(saveKey);
    const seed={cleared:['melaka'],owned:['ustaz','rempit'],heroUpgrades:{ustaz:{strength:2}},coins:5};
    await setProgress(seed);
    resultsApi.newGame('rempit',1);
    const first=resultsApi.G;
    first.clock=57;first.coins=40;
    const payout=resultsApi.endGame(false);
    check('Defeat blocks shop until payout and focuses a safe target',
      !$('end').hidden&&$('endShop')?.disabled&&!d.activeElement.matches('button'));
    $('again').click();
    check('An immediate activation cannot skip defeat',resultsApi.G===first);
    await payout;
    check('Early defeat names the boss and time remaining',
      $('ends').textContent.includes(first.stage.boss.name)&&$('ends').textContent.includes('2:03'));
    await new Promise(resolve=>setTimeout(resolve,450));
    $('endShop').focus();$('endShop').click();
    check('Results open the existing shop fixed to the defeated survivor',
      $('upgradeShop').open&&$('shopHero').disabled&&$('shopHero').value==='rempit'&&d.activeElement===$('shopBack'));
    d.querySelector('[data-upgrade="vitality"]').click();
    const expected={...seed,coins:0,heroUpgrades:{...seed.heroUpgrades,rempit:{vitality:1}}};
    const purchaseTimeout=Date.now()+3000;
    while(JSON.parse(localStorage.getItem(saveKey)).coins!==0&&Date.now()<purchaseTimeout)await tick();
    check('Payout and purchase preserve every other saved byte',localStorage.getItem(saveKey)===JSON.stringify(expected));
    $('shopBack').click();
    check('Defeat shows cheapest available shortfall',$('endShopHint').textContent.includes('need 40 more coins for Magnet'));
    $('again').click();
    check('Play again keeps survivor and stage and applies the new rank',
      resultsApi.G.hero.id==='rempit'&&resultsApi.G.si===1&&!resultsApi.G.over&&$('end').hidden&&resultsApi.G.upgradeStats.health===3);
    const overtime=resultsApi.G;
    $('pauseButton').click();
    check('End run is unavailable before three minutes',$('pauseEndRun').hidden);
    $('resume').click();
    overtime.clock=179.98;
    resultsApi.step(50);
    check('Crossing 3:00 starts hard mode without ending the run',!overtime.over&&overtime.boss&&$('goal').textContent==='Hard mode');
    const {spd:bossSpeed,dmg:bossDamage}=overtime.boss;
    overtime.clock=481;
    overtime.stop=0;
    resultsApi.step(50);
    check('The boss continues to enrage past the old deadline',!overtime.over&&overtime.boss.spd>bossSpeed&&overtime.boss.dmg>bossDamage);
    overtime.coins=27;
    $('pauseButton').click();
    const endRun=$('pauseEndRun');
    check('End run is available at three minutes and beyond',!endRun.hidden);
    endRun.click();endRun.click();
    const endRunDeadline=Date.now()+3000;
    while($('endShop').disabled&&Date.now()<endRunDeadline)await tick();
    check('Ending a run saves coins once and keeps stage progress',
      !$('endShop').disabled&&$('endt').textContent==='Run ended'&&$('next').hidden&&
      JSON.stringify(JSON.parse(localStorage.getItem(saveKey)))===JSON.stringify({...expected,coins:27}));
    resultsApi.newGame('rempit',1);
    for(const reason of ['boss','raid']){
      const battle=resultsApi.G;
      if(reason==='raid'){
        resultsApi.raid.spawnPortal();
        const portal=resultsApi.raid.state.portal;battle.p.x=portal.x;battle.p.y=portal.y;
        resultsApi.step(50);
      }else{battle.clock=180;resultsApi.step(50)}
      const boss=reason==='raid'?battle.raidBoss:battle.boss;
      boss.hp=boss.maxHp*.37;
      await resultsApi.endGame(false);
      const line=$('ends').textContent;
      check(reason+' defeat labels remaining health',line.includes(boss.name)&&line.includes('37% health left')&&
        (reason!=='raid'||/raid boss/i.test(line)));
      resultsApi.newGame('rempit',1);
    }
    $('pauseButton').click();$('quit').click();
    localStorage.setItem(saveKey,beforeResults);
    check('No browser runtime errors',evidence.errors.length===0);
    await load();
    d=w.document;
    const shopDeadline=Date.now()+15000;
    while(!w.__asean&&Date.now()<shopDeadline)await tick();
    const ready=w.__asean;
    ready.newGame('ustaz',0);ready.G.coins=450;await ready.endGame(false);ready.toMenu();
    const saved=()=>JSON.parse(localStorage.getItem(saveKey));
    const startingCoins=saved().coins;
    $('openUpgradeShop').focus();$('openUpgradeShop').click();
    const shop=$('upgradeShop'),hero=$('shopHero');
    const buy=id=>shop.querySelector('[data-upgrade="'+id+'"]');
    const rank=id=>buy(id).closest('article').querySelector('.shop-rank').textContent;
    check('Upgrade shop opens on the lobby hero',shop.open&&hero.value==='ustaz'&&hero.options.length===12);
    const shopFlag=() => w.getComputedStyle(shop.querySelector('.shop-portrait'),'::before');
    check('Shop portrait opens with the selected hero flag',shopFlag().backgroundImage.includes('/flags/my.webp')&&shopFlag().opacity==='0.3');
    hero.value='mira';hero.dispatchEvent(new w.Event('change'));
    check('Changing the shop hero updates the flag',shopFlag().backgroundImage.includes('/flags/ph.webp'));
    hero.value='ustaz';hero.dispatchEvent(new w.Event('change'));
    check('The shop uses nine upgrade cards',shop.querySelectorAll('article').length===9);
    const price=Number(buy('vitality').dataset.price);
    buy('vitality').click();
    const purchaseDeadline=Date.now()+3000;
    while(rank('vitality')==='0 / 5'&&Date.now()<purchaseDeadline)await tick();
    check('Purchase spends saved coins and increments the hero rank',saved().coins===startingCoins-price&&rank('vitality')==='1 / 5'&&$('coinsMenu').textContent===String(saved().coins));
    check('Next rank costs more',Number(buy('vitality').dataset.price)>price);
    hero.value='rempit';hero.dispatchEvent(new w.Event('change'));
    check('Switching shop hero shows independent ranks',rank('vitality')==='0 / 5');
    hero.value='ustaz';hero.dispatchEvent(new w.Event('change'));
    check('Switching back preserves the purchased rank',rank('vitality')==='1 / 5');
    $('shopBack').click();
    check('Shop closes and restores lobby focus',!shop.open&&d.activeElement===$('openUpgradeShop'));
    $('start').click();
    check('Vitality applies to the next run at full health',ready.G.p.maxHp===ready.G.hero.hp+3&&ready.G.p.hp===ready.G.p.maxHp);
    ready.toMenu();$('hero-rempit').click();$('start').click();
    check('A different hero starts at base health',ready.G.p.hp===ready.G.hero.hp);
    ready.toMenu();
    const legacy={...saved(),coins:0};
    await load();
    d=w.document;
    const reloadDeadline=Date.now()+15000;
    while(!w.__asean&&Date.now()<reloadDeadline)await tick();
    $('openUpgradeShop').click();
    check('Purchased rank survives reloading the game',$('upgradeShop').querySelector('[data-upgrade="vitality"]').closest('article').querySelector('.shop-rank').textContent==='1 / 5');
    localStorage.setItem(saveKey,JSON.stringify(legacy));
    const balanceDeadline=Date.now()+3000;
    while($('shopCoins').textContent!=='0'&&Date.now()<balanceDeadline)await tick();
    const poorBuy=$('upgradeShop').querySelector('[data-upgrade="vitality"]');
    const before=saved();
    check('An open shop refreshes after a balance change',poorBuy.disabled&&$('shopCoins').textContent==='0');
    poorBuy.click();
    check('Insufficient funds preserves the save',JSON.stringify(saved())===JSON.stringify(before));
    evidence.result='PASS';
  }catch(error){evidence.result='FAIL';evidence.errors.push(error.message)}
  finally{restoreConsole();if(originalSave===null)localStorage.removeItem(saveKey);else localStorage.setItem(saveKey,originalSave);report.textContent=JSON.stringify(evidence,null,2);run.disabled=false;document.querySelector('#download').disabled=false}
};
document.querySelector('#download').onclick=()=>{
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));
  a.href=url;a.download='ui-smoke-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
