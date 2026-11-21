export function installHunt(api,encounters){
  const {HOOKS}=api;
  const tracks=[{x:-1650,y:1650},{x:-1300,y:1750}],clearing={x:-1100,y:1450};
  function track(event){Object.assign(event,api.safePoint(tracks[event.track].x,tracks[event.track].y,40));}
  encounters.register('hunt',{
    start(event){event.track=0;track(event);},
    progress:event=>event.track<2?`Track ${event.track+1} of 2 · investigate the marked trail`:'Defeat Briarback · Thornbound Palm Stalker',
    canInteract:event=>event.track<2,
    interactLabel:'Investigate track',
    interact(event){event.track++;if(event.track<2)track(event);else{Object.assign(event,api.safePoint(clearing.x,clearing.y,40));const enemy=encounters.spawn(event,'stalker',event.x,event.y,'Thornbound');enemy.name='Briarback';}},
    update(event){if(event.defeated)encounters.complete(event);}
  });
  HOOKS.kill.push((enemy,options)=>{
    const g=api.G;
    if(g.equipment.relic==='bountySeal'&&enemy.elite&&options.damage&&options.origin!=='item'){
      g.p.hp=Math.min(g.p.maxHp,g.p.hp+15);g.ult=Math.min(g.hero.ultNeed,g.ult+g.hero.ultNeed*.1);
      api.text(g.p.x,g.p.y-55,'Bounty Seal','#9ae7b3',16);api.ring(g.p.x,g.p.y,80,'#9ae7b3',.5);
    }
    if(enemy.encounter==='hunt'&&enemy.elite==='Thornbound'&&options.damage)api.G.encounters.hunt.defeated=true;});
  HOOKS.cast.push(slot=>{
    const g=api.G;
    if(g.equipment.relic==='aftershockBell'&&slot===4){g.itemState.aftershockBell=g.t+5;api.text(g.p.x,g.p.y-55,'Aftershock Bell','#ffd98a',16);api.ring(g.p.x,g.p.y,90,'#ffd98a',.5);}
    if(g.equipment.relic==='thornEcho'&&slot>=1&&slot<=3){
      g.itemState.thornEcho=(g.itemState.thornEcho||0)+1;
      if(g.itemState.thornEcho%3===0){api.each(g.p.x,g.p.y,120,enemy=>api.hit(enemy,30,{origin:'item'}));api.ring(g.p.x,g.p.y,120,'#d58ad9',.6);api.text(g.p.x,g.p.y-55,'Thorn Echo','#e9b6e9',16);}
    }
  });
  HOOKS.lethal.push(()=>{const g=api.G;if(g.equipment.relic!=='lastLantern'||g.lastLanternUsed)return;g.lastLanternUsed=true;g.p.hp=Math.max(1,g.p.hp);g.p.invuln=2;api.text(g.p.x,g.p.y-55,'Last Lantern','#ffe6a3',18);api.ring(g.p.x,g.p.y,100,'#ffe6a3',.7);return Math.max(0,g.p.hp-1);});
  HOOKS.update.push(dt=>{
    const g=api.G;
    for(const enemy of g.enemies)if(!enemy.dead&&enemy.elite==='Thornbound'&&enemy.rush>0){
      if(enemy.thornAction!==enemy.actions){enemy.thornAction=enemy.actions;enemy.thornCount=0;enemy.thornTimer=0;}
      enemy.thornTimer-=dt;
      if(enemy.thornTimer<=0&&enemy.thornCount<5){
        enemy.thornTimer+=.1;enemy.thornCount++;
        if(g.zones.filter(z=>z.kind==='thorn').length>=5)continue;
        g.zones.push({...api.safePoint(enemy.x,enemy.y,35),kind:'thorn',encounter:enemy.encounter,r:35,life:4,max:4,c:'#d58ad9'});
      }
    }
    if(g.t>=g.thornHitAt&&g.zones.some(z=>z.kind==='thorn'&&z.life>0&&z.max-z.life>=.6&&Math.hypot(g.p.x-z.x,g.p.y-z.y)<z.r+g.p.r)){
      g.thornHitAt=g.t+1;api.hurtPlayer(8);
    }
  });
  HOOKS.newGame.push(g=>{g.lastLanternUsed=false;g.thornHitAt=0;});
}
