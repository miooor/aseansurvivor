import {SHRINES,shrineIds,SHRINE_DURATION} from '../src/content/shrines.js';

export function checkShrinePickups(w,check){
  const rt=w.__asean;
  rt.newGame('ustaz',0);
  const g=rt.G,p=g.p,icon=w.document.getElementById('shrineBuff');
  function collect(id){
    rt.dropPup(p.x+80,p.y,id);
    const drop=g.pups.at(-1);
    rt.scene.update(0,0);
    check(id+' shrine uses its atlas frame',rt.scene.sprites.get(drop)?.frame.name===String(shrineIds.indexOf(id)));
    Object.assign(drop,{x:p.x,y:p.y});
    g.stop=0;rt.scene.update(0,0);rt.scene.drawTerrain();
    check(id+' shrine replaces the blessing and updates its overhead emblem',
      !g.pups.includes(drop)&&g.shrineId===id&&g.shrineT===SHRINE_DURATION&&
      !icon.hidden&&icon.dataset.shrine===id&&icon.title.includes(SHRINES[id].name));
  }
  for(const id of shrineIds)collect(id);
  collect('spring');
  p.hp=p.maxHp/2;const before=p.hp;
  g.stop=0;rt.step(50);
  check('Hot Spring regenerates health',Math.abs(p.hp-before-(g.upgradeStats.regen+p.maxHp*.03)*.05)<.001);
  collect('harvest');
  const coins=g.coins;
  g.gems.push({x:p.x,y:p.y,v:3,kind:'coin',mag:true});
  g.stop=0;rt.step(0);
  check('Harvest doubles a collected coin pile',g.coins===coins+6);
  collect('scholar');
  const xp=g.xp;
  g.gems.push({x:p.x,y:p.y,v:2,kind:'ember',mag:true});
  g.stop=0;rt.step(0);
  check('Firefly increases collected ember XP',Math.abs(g.xp-xp-3*(g.xpMul||1)*g.upgradeStats.xp)<.001);
  collect('gong');
  g.ult=0;rt.kill(rt.makeGhost('pocong',p.x+90,p.y));
  check('Gong grants extra ultimate charge on a kill',g.ult===2);
  collect('orchid');
  p.hp=1;rt.kill(rt.makeGhost('pocong',p.x+90,p.y));
  check('Orchid heals on a kill',p.hp===3);
  rt.newGame('ustaz',0);rt.scene.update(0,0);rt.scene.drawTerrain();
  check('New run clears the shrine and hides its icon',!rt.G.shrineId&&!rt.G.shrineT&&icon.hidden);
  rt.toMenu();
}
