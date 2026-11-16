// Agreed seams: real lobby controls, prepared synchronous runtime and Phaser textures.
// Failure cases: eager sheets, wrong/undecodable flags, start-before-art, selection race,
// retry leaks, unknown fallback, original basic metadata drift, failed-cast feedback/spend.
const $=id=>document.getElementById(id),frame=$('game');let rt,doc,checks=[];
const ids=['ustaz','rempit','nok','lan','sari'],damage=[12,11,15,9,10];
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);doc=frame.contentDocument;$('run').disabled=false;$('dash').disabled=false;$('host').disabled=false;$('status').textContent='Ready'}},100);
const check=(name,pass)=>checks.push({name,pass:!!pass});
const tick=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
function pairs(){return rt.scene.textures.getTextureKeys().filter(k=>/^hero-(motion|skills)-/.test(k))}
async function run(){
  checks=[];let error;
  try{
    await tick();
    check('Scene exposes explicit hero preparation',typeof rt.scene.prepareHero==='function');
    check('Fresh default requests no inactive large hero sheets',!frame.contentWindow.performance.getEntriesByType('resource').some(e=>/(rempit|nok|lan|sari|asha|mira|dani|vanna|keo|nadi|lia)-(motion|skills)/.test(e.name)));
    for(let i=0;i<ids.length;i++){
      const id=ids[i];rt.toMenu();doc.getElementById('hero-'+id).click();
      const card=doc.getElementById('hero-'+id),flag=card.querySelector('.hero-flag');
      check(id+' card keeps independent base name and country',!!card.querySelector('.hero-name')&&card.querySelector('.hc').textContent.length>0);
      check(id+' has a static flag beside its card name',flag?.tagName==='IMG'&&flag.src.startsWith('data:image/svg+xml')&&flag.nextElementSibling?.classList.contains('hero-name'));
      if(flag)try{await flag.decode();check(id+' flag decodes',flag.naturalWidth>0)}catch{check(id+' flag decodes',false)}
      if(rt.scene.prepareHero)await rt.scene.prepareHero(id);
      check(id+' selection retains at most current plus incoming pair',pairs().length<=4);
      doc.getElementById('start').click();await tick();
      const g=rt.G;check(id+' real Start enters only with selected textures',g?.hero.id===id&&rt.scene.textures.exists('hero-motion-'+id)&&rt.scene.textures.exists('hero-skills-'+id));
      if(!g)continue;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;
      check(id+' original basic damage metadata retained',g.hero.basicDamage===damage[i]);
      check(id+' HUD flag and independent name present',!!doc.getElementById('hudHero').querySelector('.hero-flag')&&doc.getElementById('hudHero').querySelector('.hero-name')?.textContent===g.hero.name);
      const before=g.identity.castT;g.cds[1]=10;rt.tryCast(1);check(id+' rejected cooldown spends and poses nothing',g.cds[1]===10&&g.identity.castT===before);
      rt.addXP(12);rt.scene.update(0,0);check(id+' first level-up has real choices',g.choosing&&doc.querySelectorAll('#ups button').length>0);
      g.choosing=false;rt.endGame(false);doc.getElementById('again').click();check(id+' retry keeps synchronous prepared runtime',rt.G.hero.id===id&&rt.scene.textures.exists('hero-motion-'+id));
    }
    rt.toMenu();
    if(rt.scene.prepareHero){
      const results=await Promise.allSettled([rt.scene.prepareHero('ustaz'),rt.scene.prepareHero('sari'),rt.scene.prepareHero('nok')]);
      check('Rapid selection loads serialize without losing final pair',results[2].status==='fulfilled'&&rt.scene.textures.exists('hero-motion-nok')&&pairs().length<=4);
      try{await rt.scene.prepareHero('unknown');check('Unknown hero preparation rejects',false)}catch{check('Unknown hero preparation rejects',true)}
      await rt.scene.prepareHero('ustaz');
      rt.newGame('ustaz');let active=rt.G;active.auto=false;active.cds.fill(999);
      await rt.scene.prepareHero('lan');rt.scene.update(0,0);
      check('Preparing incoming hero preserves live hero and both texture pairs',rt.G===active&&rt.scene.textures.exists('hero-motion-ustaz')&&rt.scene.textures.exists('hero-motion-lan')&&pairs().length===4);
      rt.newGame('lan');rt.scene.update(0,0);active=rt.G;
      check('Switching run releases previous pair only after new hero is active',!rt.scene.textures.exists('hero-motion-ustaz')&&pairs().length===2);
      try{rt.newGame('nok');check('Unprepared synchronous start rejects',false)}catch{check('Unprepared synchronous start rejects before clearing live run',rt.G===active)}
      // Network-boundary fault: use an absent URL, then restore the authored URL.
      const loader=rt.scene.load,loadImage=loader.image;
      loader.image=function(key,url,...args){return loadImage.call(this,key,key==='hero-motion-rempit'?'/tests/missing-roster-motion.webp':url,...args)};
      try{
      try{await rt.scene.prepareHero('rempit');check('Failed artwork preparation rejects',false)}catch{check('Failed artwork leaves live run and removes partial pair',rt.G===active&&!rt.scene.textures.exists('hero-skills-rempit')&&rt.scene.textures.exists('hero-motion-lan'))}
      rt.toMenu();doc.getElementById('hero-rempit').click();
      try{await rt.scene.prepareHero('rempit')}catch{}
      check('Failed selected artwork keeps lobby usable with explicit Retry',!doc.getElementById('menu').hidden&&!doc.getElementById('start').disabled&&doc.getElementById('start').textContent.includes('Retry'));
      }finally{loader.image=loadImage}doc.getElementById('start').click();await rt.scene.prepareHero('rempit');await tick();rt.scene.update(0,0);
      check('Retry after asset failure loads real frames and starts synchronously',rt.G.hero.id==='rempit'&&rt.scene.isHeroPrepared('rempit')&&pairs().length===2);
      const {heroNameHtml}=await import('../src/content/hero-flags.js');
      for(const country of ['Malaysia','Thailand','Vietnam','Indonesia','Singapore','Philippines','Brunei','Cambodia','Laos','Myanmar','Timor-Leste']){
        const wrapper=document.createElement('span');wrapper.innerHTML=heroNameHtml({name:'Flag check',country});const flag=wrapper.querySelector('img');
        await flag.decode();check(country+' trusted SVG decodes with accessible country',flag.naturalWidth>0&&flag.alt===country+' flag');
      }
      const {SKILL_SOUNDS,renderSkill}=await import('../src/game/skill-audio.js'),hashes=new Set();
      for(const key of Object.keys(SKILL_SOUNDS)){const pcm=renderSkill(key);let hash=2166136261;for(let i=0;i<pcm.length;i++)hash=Math.imul(hash^Math.round(pcm[i]*32767),16777619);hashes.add(hash)}
      check('All sixty original procedural cues produce distinct nonempty waveforms',Object.keys(SKILL_SOUNDS).length===60&&hashes.size===60);
      const pending=rt.scene.prepareHero('sari');rt.scene.scene.stop();
      check('Scene destruction rejects queued preparation and releases hero textures',(await Promise.allSettled([pending]))[0].status==='rejected'&&pairs().length===0&&rt.G===null);
    }

  }catch(e){error=e.message;check('Harness completes',false)}
  const report={date:new Date().toISOString(),resources:frame.contentWindow.performance.getEntriesByType('resource').filter(e=>/(hero-art\.js|rempit-motion|missing-roster)/.test(e.name)).map(e=>e.name),result:checks.every(c=>c.pass)?'PASS':'FAIL',error,checks};
  $('status').textContent=report.result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+' checks';$('report').textContent=JSON.stringify(report,null,2);
}
$('run').onclick=()=>rt.scene.sys.isActive()?run():location.reload();
$('download').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([$('report').textContent],{type:'application/json'}));a.href=url;a.download='roster-foundation-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

$('dash').onclick=async()=>{
  checks=[];let error;
  try{
    rt.toMenu();await rt.scene.prepareHero('rempit');rt.newGame('rempit');doc.getElementById('menu').hidden=true;
    const g=rt.G;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;g.st.crit=0;rt.raid.enter();
    const arena=rt.raid.ARENA;Object.assign(g.p,{x:arena.x+arena.r-g.p.r-5,y:arena.y,face:[1,0]});
    const enemy=rt.makeGhost('pocong',arena.x+arena.r-g.p.r+40,arena.y);Object.assign(enemy,{hp:1000,maxHp:1000,r:5,stun:999});g.enemies=[enemy];
    doc.getElementById('game').dispatchEvent(new frame.contentWindow.MouseEvent('mousemove',{clientX:frame.contentWindow.innerWidth/2+300,clientY:frame.contentWindow.innerHeight/2}));
    g.cds[1]=0;rt.tryCast(1);g.stop=0;rt.scene.update(0,50);
    check('Original Jet dash remains collision-bounded at raid wall',Math.hypot(g.p.x-arena.x,g.p.y-arena.y)<=arena.r-g.p.r+.00001);
    check('Original Jet dash cancels immediately at raid wall',g.p.dash===null);
    check('Dash cannot damage the enemy at its unclipped endpoint',enemy.hp===1000);
    check('Final dash tick cannot qualify as ordinary ground movement',g.p.normalMove===null);
    g.paused=true;
  }catch(e){error=e.message;check('Dash harness completes',false)}
  const report={date:new Date().toISOString(),result:checks.every(c=>c.pass)?'PASS':'FAIL',error,checks};$('status').textContent=report.result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+' checks';$('report').textContent=JSON.stringify(report,null,2);
};

$('host').onclick=async()=>{
  checks=[];let error;
  try{
    rt.toMenu();rt.scene.gameplayEnabled=false;doc.getElementById('hero-rempit').click();await rt.scene.prepareHero('rempit');await tick();
    check('Edit preview selection finishes with Start disabled',doc.getElementById('start').disabled);
    doc.getElementById('start').click();check('Edit preview cannot enter through the real Start control',rt.G===null&&!doc.getElementById('menu').hidden);
    rt.toMenu();try{rt.newGame('rempit');check('Edit preview rejects synchronous starts',false)}catch{check('Edit preview rejects synchronous starts before creating a run',rt.G===null)}
  }catch(e){error=e.message;check('Host harness completes',false)}finally{rt.scene.gameplayEnabled=true;rt.toMenu()}
  const report={date:new Date().toISOString(),result:checks.every(c=>c.pass)?'PASS':'FAIL',error,checks};$('status').textContent=report.result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+' checks';$('report').textContent=JSON.stringify(report,null,2);
};
