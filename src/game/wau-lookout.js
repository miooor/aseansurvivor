const MESSAGES={
  ready:'Lure ghosts into the marked lane, then raise the wau to sweep them east.',
  raising:'The wau is taking flight. You can leave the station.',
  gust:'The gust is sweeping the lane.',
  cooldown:'The line is reeling in. The wau will be ready again shortly.'
};

export function installWauLookout(api){
  const panel=api.$('wauPrompt'),button=api.$('wauStart');
  const status=api.$('wauStatus'),progress=api.$('wauProgress');
  const inReach=(g,lookout)=>Math.hypot(g.p.x-lookout.station.x,g.p.y-lookout.station.y)<=lookout.radius;
  const blocked=g=>g.paused||g.choosing||g.lootModal||g.over||g.won||g.raid;

  button.onclick=()=>{
    const g=api.G,wind=g?.wauWind,lookout=g?.world.wauLookout;
    if(!wind||wind.phase!=='ready'||blocked(g)||!inReach(g,lookout))return;
    wind.startedAt=g.clock;
    wind.phase='raising';
    sync();
  };

  function sync(){
    const g=api.G,wind=g?.wauWind,lookout=g?.world.wauLookout;
    panel.hidden=!wind||blocked(g)||!inReach(g,lookout);
    if(panel.hidden)return;
    const message=MESSAGES[wind.phase];
    if(status.textContent!==message)status.textContent=message;
    const disabled=String(wind.phase!=='ready');
    if(button.getAttribute('aria-disabled')!==disabled)button.setAttribute('aria-disabled',disabled);
    progress.hidden=wind.phase!=='raising';
    progress.value=wind.progress;
  }

  api.HOOKS.newGame.push(g=>{
    if(g.world.wauLookout)g.wauWind={phase:'ready',progress:0,startedAt:0,caught:new Set()};
  });
  api.HOOKS.update.push(()=>{
    const g=api.G,wind=g.wauWind,lookout=g.world.wauLookout;
    if(!wind||wind.phase==='ready'||g.raid||g.won)return;
    const elapsed=g.clock-wind.startedAt;
    if(elapsed<lookout.windup){wind.progress=elapsed/lookout.windup;return}
    const sweepTime=elapsed-lookout.windup;
    if(wind.phase!=='cooldown'){
      const previous=wind.phase==='gust'?wind.progress:0;
      wind.phase='gust';
      wind.progress=Math.min(1,sweepTime/lookout.sweep);
      const travel=lookout.w+lookout.band;
      const left=lookout.x+Math.max(0,previous*travel-lookout.band);
      const right=lookout.x+Math.min(lookout.w,wind.progress*travel);
      for(const e of g.enemies){
        if(e.dead||e.boss||e.type==='body'||wind.caught.has(e))continue;
        if(e.x<left||e.x>right||e.y<lookout.y||e.y>lookout.y+lookout.h)continue;
        wind.caught.add(e);
        e.kvx+=540;
        e.stun=Math.max(e.stun,.55);
      }
      if(wind.progress===1){wind.phase='cooldown';wind.caught.clear()}
    }
    if(wind.phase==='cooldown'){
      wind.progress=Math.min(1,(sweepTime-lookout.sweep)/lookout.cooldown);
      if(wind.progress===1){wind.phase='ready';wind.progress=0}
    }
  });
  api.HOOKS.cleanup.push(()=>{panel.hidden=true});
  return {sync};
}
