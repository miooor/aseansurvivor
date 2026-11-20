// Run from the combat-effects review frame. Capture the WebGL canvas on the same
// tick as the cast, before the browser clears the default framebuffer.
export async function originalFiveSheet(w,id){
  const rt=w.__asean,scene=rt.scene,screen=w.document.querySelector('#game');
  const sheet=document.createElement('canvas'),width=390,height=284;
  sheet.width=width*5;sheet.height=(height+28)*2;
  const ctx=sheet.getContext('2d');
  await scene.prepareHero(id);
  for(let slot=0;slot<5;slot++){
    rt.newGame(id,0);
    w.document.querySelector('#menu').hidden=true;
    const g=rt.G;
    g.auto=false;g.cds[0]=slot===0?0:999;g.spawnT=g.durianT=999;
    g.ult=g.hero.ultNeed;
    const foe=rt.makeGhost('pocong',g.p.x+(slot===0&&id==='nok'?71:175),g.p.y+5);
    foe.hp=foe.maxHp=9999;foe.spd=0;foe.stun=999;
    screen.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+180,clientY:w.innerHeight/2}));
    if(slot)rt.tryCast(slot);
    for(let tick=1;tick<=24;tick++){
      scene.update(0,24);
      if(tick===1&&!g.fx.some(f=>f.skill===id+'-'+slot))throw Error(id+' '+slot+' missing cast');
      const later=slot===0?(id==='sari'||id==='lan'?22:5):slot===4?24:9;
      if(tick!==2&&tick!==later)continue;
      scene.drawTerrain();
      const row=tick===2?0:1,sx=screen.width/w.innerWidth,sy=screen.height/w.innerHeight;
      const x=slot*width,y=row*(height+28);
      ctx.fillStyle='#15252a';ctx.fillRect(x,y,width,height+28);
      ctx.drawImage(screen,(screen.width-500*sx)/2,(screen.height-364*sy)/2,500*sx,364*sy,x,y+28,width,height);
      ctx.fillStyle='#fff1d3';ctx.font='bold 14px system-ui';
      ctx.fillText(({ustaz:'Fadli',rempit:'Kama',nok:'Nok',lan:'Lan',sari:'Sari'}[id])+'   '+(['Basic','Q','E','F','R'][slot])+'   '+g.hero.skills[slot].name+'   '+(tick*.024).toFixed(2)+'s',x+8,y+19);
      const pixel=ctx.getImageData(x+8,y+38,80,80).data;
      if(!pixel.some((v,i)=>i%4!==3&&v>24))throw Error('Empty WebGL frame '+id+' '+slot);
    }
    g.paused=true;
  }
  return sheet;
}
