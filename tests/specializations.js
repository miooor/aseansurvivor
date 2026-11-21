// Rank-one campaign casts. Each pair measures two different tactical benefits.
const trials={
  ustaz:{slot:3, points:[[80,0],[250,0]], read:({targets:[near,far]})=>[near.stun,damage(far)]},
  rempit:{slot:2, points:[[-140,0],[-14,32]], read:({g,rt,targets:[trail,flank]})=>{
    advance(rt,.1);
    const patch=g.zones.find(z=>z.kind==='fire');
    // Follow one deposited patch. Measure a pursuer entering after 2.5s and a flank at 32 units.
    g.p.exhaust=0;patch.acc=0;flank.hp=1000;
    advance(rt,.5);
    const flankDamage=damage(flank);
    advance(rt,2);
    Object.assign(trail,{x:patch.x,y:patch.y});
    const before=trail.hp;
    advance(rt,.5);
    return [before-trail.hp,flankDamage];
  }},
  nok:{slot:1, points:[[270,0],[16,65]], read:({rt,targets})=>{advance(rt,.45);return targets.map(damage)}},
  lan:{slot:3, points:[[80,0],[265,0]], read:({targets:[near,far]})=>[near.slowT,damage(far)]},
  sari:{slot:3, points:[[40,0]], read:({rt,g,targets:[near]})=>{
    g.p.onContact(near);
    const counter=damage(near);
    advance(rt,2.8);
    return [Number(!!g.p.onContact),counter];
  }},
  asha:{slot:1, points:[[220,0],[220,126]], read:({rt,g,targets:[,far]})=>{
    const edge=damage(far);
    advance(rt,7);
    return [g.roster.asha.tickets.length,edge];
  }},
  mira:{slot:3, points:[[80,0]], read:({rt,g,targets:[near]})=>{
    const shove=near.kvx;
    advance(rt,3.5);
    const before=g.p.hp;
    g.p.invuln=0;
    g.eprojs.push({x:g.p.x,y:g.p.y,vx:0,vy:0,r:8,dmg:20,life:1});
    advance(rt,.05);
    return [20-(before-g.p.hp),shove];
  }},
  dani:{slot:2, points:[], read:({g})=>[g.roster.dani.dust.damage,g.roster.dani.dust.fireRate].map(value=>(value-1)*100)},
  vanna:{slot:3,points:[[0,45],[0,170]],read:({rt,targets:[near,far]})=>{
    rt.step(50);near.dead=true;advance(rt,.7);return [damage(near),damage(far)];
  }},
  keo:{slot:3, points:[[60,0]], read:({targets:[near]})=>[near.stun,damage(near)]},
  nadi:{slot:4,points:[],read:({g})=>{
    const ward=g.roster.nadi.ward;
    return [ward.until-g.t,ward.radius];
  }},
  lia:{slot:1, points:[[330,0],[70,0]], read:({targets:[far,near]})=>[damage(far),damage(near)]}
};
function advance(rt,seconds){
  const end=rt.G.t+seconds;
  for(let i=0;i<seconds*60+30&&rt.G.t<end-1e-8;i++)rt.step(50);
  check(rt.G.t>=end-1e-8,'Encounter simulation stalled');
}
function damage(enemy){return 1000-enemy.hp}

const baseExpected={
  ustaz:[1,0],rempit:[0,0],nok:[0,0],lan:[3,0],sari:[0,40],asha:[0,0],
  mira:[0,180],dani:[25,50],vanna:[45,0],keo:[.8,18],nadi:[6,170],lia:[0,32]
};
const frame=document.querySelector('iframe'),report=document.querySelector('#report');
const check=(ok,message)=>{if(!ok)throw Error(message)};
const wait=async predicate=>{
  const deadline=Date.now()+30000;
  while(!predicate()&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
  check(predicate(),'Game failed to load');
};
document.querySelector('#run').onclick=async event=>{
  const button=event.currentTarget,rows=[];
  button.disabled=true;
  const w=frame.contentWindow,d=w.document,$=id=>d.getElementById(id);
  try{
    await wait(()=>w.__asean);
    const rt=w.__asean,save=localStorage.getItem('aseanSurvivor.v1');
    const key=(key)=>w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Digit'+key,key,bubbles:true}));
    check(Object.keys(trials).length===$('heroes').children.length,'Cover entire picker');
    for(const [id,trial] of Object.entries(trials)){
      $('hero-'+id).click();$('start').click();await wait(()=>rt.G?.hero.id===id);
      const samples=[];
      for(const pick of [null,0,1]){
        rt.newGame(id,0);
        const g=rt.G;
        check(g.specialization===null,'Fresh run '+id);
        if(pick!==null){
          // A queued level 2 must still precede the level 3 offer.
          rt.addXP(g.need+17);rt.step(0);
          const paths=()=>d.querySelectorAll('[data-category="Specialization"]');
          check(g.choosing&&paths().length===0,'Early offer '+id);
          // Choose a random blessing in a throwaway run so it cannot affect measurements.
          $('up0').click();rt.step(0);
          check(paths().length===2,'Queued level 3 '+id);
          $('up2').click();rt.addXP(g.need);rt.step(0);
          check(!g.specialization&&paths().length===2,'Deferred pair '+id);
          rt.newGame(id,0);
          const run=rt.G;
          run.level=2;rt.addXP(run.need);rt.step(0);
          check(run.level===3&&paths().length===2,'Pair at level 3 '+id);
          if(!pick)key('1');else $('up1').click();
          check(run.specialization&&!run.choosing,'Choice resumes '+id);
        }
        const run=rt.G,p=run.p;
        run.p.invuln=999;run.auto=false;run.spawnT=run.durianT=run.cds[0]=999;run.st.crit=0;run.noElements=true;run.ult=run.hero.ultNeed;
        $('game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
        const targets=trial.points.map(([dx,dy])=>{
          const foe=rt.makeGhost('pocong',p.x+dx,p.y+dy);
          Object.assign(foe,{x:p.x+dx,y:p.y+dy,hp:1000,maxHp:1000,r:4,spd:0});return foe;
        });
        if(trial.setup){trial.setup(rt);for(const foe of targets)foe.hp=1000}
        rt.tryCast(trial.slot,false);
        samples.push(trial.read({rt,g:run,targets}).map(n=>Math.round(n*100)/100));
        if(pick!==null){
          rt.addXP(run.need);rt.step(0);
          check(run.choosing&&!d.querySelector('[data-category="Specialization"]'),'Cannot combine paths '+id);
        }
      }
      const [base,first,second]=samples;
      rows.push(id+'  '+samples.map(pair=>pair.join('/')).join(' | '));
      check(String(base)===String(baseExpected[id]),'Base mechanics '+id);
      check(first[0]>second[0]&&second[1]>first[1],'Both paths need a winning encounter '+id);
      rt.newGame(id,0,true);rt.openLevelUp();
      check(!rt.G.choosing&&!rt.G.specialization,'Practice isolated '+id);
      rt.toMenu();check(localStorage.getItem('aseanSurvivor.v1')===save,'Save changed '+id);
      report.textContent=rows.join('\n');
    }
    report.textContent+='\nPASS';
  }catch(error){report.textContent=rows.join('\n')+'\nFAIL '+error.message}
  finally{button.disabled=false}
};
