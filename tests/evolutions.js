// Compare the same cast before and after a real blessing claim.
import {EVOS,PASSIVES} from '../src/content/core.js';

const cases={
  ustaz:['Sheltering Orbit',({foe,cast,step})=>{
    const target=foe(82);
    cast(2);
    step();
    return target.slowT>0;
  }],
  rempit:['Banked Cinders',({g,cast,step})=>{
    cast(2);
    step(4);
    return g.zones.some(z=>z.kind==='fire'&&z.r===g.technique.radius*1.5&&z.max===g.technique.life+1);
  }],
  nok:['Return to Guard',({g,foe,cast})=>{
    foe(50);
    g.cds[1]=5;
    cast(2);
    return g.cds[1]===3;
  }],
  lan:['River Chorus',({foe,cast,step})=>{
    const target=foe(40);
    cast(2);
    step(18);
    return target.slowT>0;
  }],
  sari:['Echo Crescent',({g,cast})=>{
    const echo={x:g.p.x+30,y:g.p.y,t:.5,r:70,dmg:40};
    g.sea.images.push(echo);
    cast(1);
    return echo.t===0&&echo.dmg===60;
  }],
  asha:['Priority Ticket',({g,foe,cast})=>{
    foe(220);
    foe(240);
    cast(1);
    const list=g.roster.asha.tickets;
    return list.length===2&&list[0].served&&!list[1].served;
  }],
  mira:['Harbour Undertow',({foe,cast})=>{
    foe(200);
    const outer=foe(0,162);
    cast(1);
    cast(2);
    return outer.hp<outer.maxHp;
  }],
  dani:['Beacon Handover',({g,foe,cast})=>{
    cast(2);
    const old=foe(10);
    g.p.x+=260;
    cast(2);
    return old.hp<old.maxHp;
  }],
  vanna:['Standing Warp',({g,cast})=>{
    cast(1);
    cast(2);
    cast(3);
    const s=g.roster.vanna;
    return !!s.q&&!s.e&&!s.cross;
  }],
  keo:['Five-Reed Chord',({g,cast})=>{
    cast(1);
    g.t+=1.75;
    cast(2);
    return g.projs.filter(q=>q.hitOptions?.slot===2).length===5;
  }],
  nadi:['Workshop Kiln',({g,cast})=>{
    const s=g.roster.nadi;
    s.layers.push(...[10,30,180].map(x=>({x:g.p.x+x,y:g.p.y,at:g.t})));
    cast(3);
    return s.layers.filter(q=>q.cured).length===2&&!s.layers[2].cured;
  }],
  lia:['Express Dispatch',({g,cast})=>{
    g.roster.lia.spools=2;
    cast(2);
    return Math.abs(Math.hypot(g.p.dash.vx,g.p.dash.vy)*g.p.dash.t-210)<.01&&g.roster.lia.spools===0;
  }]
};

export async function checkEvolutions(w,check){
  const rt=w.__asean,doc=w.document;
  const roster=Object.keys(cases).sort().join();
  check('Evolution registry and combat cases cover every playable hero',
    Object.keys(EVOS).sort().join()===roster&&[...doc.querySelectorAll('[id^="hero-"]')].map(el=>el.id.slice(5)).sort().join()===roster);
  for(const [id,[name,exercise]] of Object.entries(cases)){
    await rt.scene.prepareHero(id);
    const recipes=EVOS[id],recipe=recipes.find(ev=>ev.name===name);
    check(id+' has unique playable recipes',!!recipe&&new Set(recipes.map(ev=>ev.i)).size===recipes.length&&recipes.every(ev=>PASSIVES.some(p=>p.id===ev.item)));
    for(const evolved of [false,true]){
      rt.newGame(id,0);
      const g=rt.G;g.auto=false;g.spawnT=g.durianT=g.cds[0]=999;
      g.ranks.fill(5);
      for(const other of recipes)if(other!==recipe)g.evo[other.i]=true;
      for(const item of PASSIVES)if(item.id!==recipe.item)g.pass[item.id]=5;
      if(evolved){
        g.pending=1;rt.openLevelUp();
        const pin=doc.querySelector('#recipePin');
        pin.value=String(recipe.i);pin.dispatchEvent(new w.Event('change'));
        check(name+' tracks its missing passive',doc.querySelector('#recipeProgress').textContent.includes('0/1'));
        const ingredient=doc.querySelector('#up0');
        check(name+' ingredient previews the unlock',ingredient.querySelector('.available')?.textContent.includes(name));
        ingredient.click();
        check(name+' still needs a claim',g.pass[recipe.item]===1&&!g.evo[recipe.i]);
        g.pending=1;rt.openLevelUp();
        const offer=doc.querySelector('#up0');
        check(name+' offered for separate claim',offer.textContent.includes(name)&&offer.textContent.includes('Claim pinned evolution'));
        offer.click();
        check(name+' claimed and unpinned',g.evo[recipe.i]&&g.trackedEvolution===null);
      }
      g.stop=0;g.st.crit=0;
      doc.querySelector('#game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+200,clientY:w.innerHeight/2}));
      const foe=(x,y=0)=>{
        const e=rt.makeGhost('pocong',g.p.x+x,g.p.y+y);e.hp=e.maxHp=9999;e.spd=0;return e;
      };
      const cast=i=>{g.cds[i]=0;rt.tryCast(i)};
      const step=(count=1)=>{for(let n=0;n<count;n++)rt.step(32)};
      check(name+(evolved?' changes the cast':' is absent before claim'),exercise({g,foe,cast,step})===evolved);
    }

    rt.newGame(id,0);
    const g=rt.G;
    for(const other of recipes)if(other!==recipe)g.evo[other.i]=true;
    g.trackedEvolution=recipe.i;
    rt.raid.force('orb');rt.raid.enter();rt.kill(g.raidBoss);
    check(name+' drops from the raid',rt.raid.state.orb?.ev.name===name);
    for(let frame=0;frame<120&&!g.evo[recipe.i];frame++)rt.step(50);
    check(name+' fuses at rank one without ingredients',g.evo[recipe.i]&&g.trackedEvolution===null&&g.ranks[recipe.i]===1&&!g.pass[recipe.item]);
  }
  rt.toMenu();
}
