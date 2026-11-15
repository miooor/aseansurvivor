export function installCharms(api){
  const {HOOKS}=api;
  HOOKS.hurt.push(damage=>api.G.equipment.charm==='reedGuard'&&api.G.p.slip?damage*.8:damage);
  HOOKS.newGame.push(g=>{g.lastDamageAt=0;});
  HOOKS.damage.push(()=>{api.G.lastDamageAt=api.G.t;if(api.G.equipment.charm==='reedGuard'&&api.G.p.slip)api.text(api.G.p.x,api.G.p.y-50,'Reed Guard −20%','#87ffb5',14);});
  HOOKS.update.push(dt=>{
    const g=api.G;if(g.over||g.won)return;
    if(g.equipment.charm==='stillwaterBeads'){
      let s=g.itemState.stillwaterBeads;
      if(!s||s.raid!==g.raid||g.sea?.leap||s.leaping||Math.hypot(g.p.x-s.x,g.p.y-s.y)>30)s=g.itemState.stillwaterBeads={x:g.p.x,y:g.p.y,time:0,ready:false,raid:g.raid,leaping:!!g.sea?.leap};
      else s.time+=dt;
      if(!s.ready&&s.time>=2){s.ready=true;api.text(g.p.x,g.p.y-50,'Stillwater +20%','#87ffb5',14);}
    }
    if(g.equipment.charm==='lanternHeart'&&g.t-g.lastDamageAt>5){
      const healed=Math.min(g.p.maxHp-g.p.hp,2*Math.min(dt,g.t-g.lastDamageAt-5));g.p.hp+=healed;
      const s=g.itemState.lanternHeart??={feedback:0};s.feedback+=healed;
      if(s.feedback>=2){api.text(g.p.x,g.p.y-50,'Lantern Heart +2 HP','#87ffb5',14);s.feedback-=2;}
    }
  });
}
