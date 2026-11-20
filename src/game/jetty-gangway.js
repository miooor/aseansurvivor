export function installJettyGangway(api){
  const panel=api.$('jettyPrompt'),button=api.$('jettyStart');
  const status=api.$('jettyStatus'),progress=api.$('jettyProgress');
  const inReach=(g,gate)=>Math.hypot(g.p.x-gate.winch.x,g.p.y-gate.winch.y)<=gate.radius;
  const blocked=g=>g.paused||g.choosing||g.lootModal||g.over||g.won||g.raid;

  function interrupt(work,message){
    if(!work?.active)return;
    work.active=false;work.elapsed=0;work.message=message;
    if(message)api.banner(message,2);
  }

  button.onclick=()=>{
    const g=api.G,work=g?.jettyWork,gate=g?.world.gangway;
    if(!gate||!work||gate.open||work.active||blocked(g)||!inReach(g,gate))return;
    work.active=true;work.startedAt=g.t;work.message='';
    sync();
  };

  function sync(){
    const g=api.G,work=g?.jettyWork,gate=g?.world.gangway;
    if(!gate||!work||g.over||g.won||g.raid){
      interrupt(work,'');
      panel.hidden=true;
      return;
    }
    const near=inReach(g,gate);
    if(!near)interrupt(work,'Too far from the winch. Start again nearby.');
    if(work.active&&!blocked(g)){
      work.elapsed=Math.min(gate.duration,g.t-work.startedAt);
      if(work.elapsed+1e-9>=gate.duration){
        work.active=false;
        g.world.lowerGangway();
        api.banner('Gangway open. Cross to the Fishing Platform.',3);
      }
    }
    panel.hidden=!near||!!blocked(g);
    if(panel.hidden)return;
    const text=gate.open?'Cross over to the Fishing Platform. Enemies can follow.':
      work.active?'Stay close to the winch.':work.message||'Lower the gangway to open another route to shore.';
    if(status.textContent!==text)status.textContent=text;
    const label=gate.open?'Gangway open':work.active?'Lowering…':'Lower gangway';
    if(button.textContent!==label)button.textContent=label;
    button.setAttribute('aria-disabled',String(gate.open||work.active));
    progress.hidden=!work.active;
    progress.value=work.elapsed/gate.duration;
  }

  api.HOOKS.newGame.push(g=>{
    if(!g.practice&&g.world.gangway)g.jettyWork={active:false,startedAt:0,elapsed:0,message:''};
  });
  api.HOOKS.damage.push(()=>interrupt(api.G.jettyWork,'Hit! Start lowering the gangway again.'));
  api.HOOKS.cleanup.push(()=>{
    interrupt(api.G?.jettyWork,'');
    panel.hidden=true;
  });
  return {sync};
}
