import {questPropFrames} from '../content/quest-art.js';
import {stageDestinations} from '../content/encounters.js';
import {REGIONAL_QUESTS} from '../content/regional-quests.js';
import {questRoutes} from './quest-routes.js';

export function installEncounters(api,equipment){
  const {$,HOOKS}=api;
  const active=()=>Object.values(api.G?.encounters||{}).find(e=>e.status==='active');
  const remaining=e=>api.G.enemies.filter(n=>n.encounter===e.id&&!n.dead).length;
  function remove(event){
    const id=event.id;
    delete event.companion;delete event.guidance;delete event.destination;
    for(const key of ['enemies','projs','eprojs','zones','fx'])api.G[key]=api.G[key].filter(e=>e.encounter!==id);
  }
  function spawn(event,type,x,y,elite){
    const enemy=api.makeGhost(type,x,y);
    if(event)enemy.encounter=event.id;
    if(elite){
      enemy.elite=elite;enemy.scale=1.35;enemy.r*=enemy.scale;
      Object.assign(enemy,api.safePoint(enemy.x,enemy.y,enemy.r));
      enemy.hp*=3;enemy.maxHp*=3;enemy.dmg*=1.25;enemy.vulnerable=0;
    }
    return enemy;
  }
  function abandon(event=active()){
    if(!event||event.status!=='active')return;
    event.status='abandoned';remove(event);api.banner(event.name+' abandoned. No reward.',3);sync();
  }
  function complete(event){
    const g=api.G;if(!event||event.status!=='active'||g.over||g.won)return;
    event.status='completed';remove(event);equipment.grant(event.id,event.slot);
    api.banner(event.name+' completed · choose your '+event.slot,3);sync();
  }
  const routes=questRoutes(api,spawn,complete);
  const behaviors=Object.fromEntries(Object.values(REGIONAL_QUESTS).map(d=>[d.id,routes]));
  behaviors.rescue={
    start(event){for(let i=0;i<6;i++){const a=i*Math.PI/3;spawn(event,i?'pocong':'stalker',event.x+Math.cos(a)*180,event.y+Math.sin(a)*180,i?null:'Armoured');}},
    meter:event=>event.companion?routes.meter(event):[6-remaining(event),6],
    progress:event=>event.companion?routes.progress(event):remaining(event)?`${remaining(event)} captors remaining`:'Captors defeated · return to the traveller',
    canInteract:event=>!event.companion&&!remaining(event),
    interact:routes.start,
    update(event,dt){if(event.companion)routes.update(event,dt);},
    interactLabel:'Rescue traveller'
  };
  const inReach=(g,e)=>{const target=e.guidance||e;return Math.hypot(g.p.x-target.x,g.p.y-target.y)<=120;};
  const blocked=g=>g.paused||g.choosing||!!g.lootModal||g.over||g.won||!!g.raid;
  function start(id){
    const g=api.G,event=g?.encounters[id];
    if(!event||event.status!=='available'||active()||blocked(g)||!inReach(g,event))return;
    $('eventDetails').open=false;event.status='active';behaviors[id].start(event);sync();
  }
  function interact(){
    const g=api.G,event=active();if(!event||blocked(g)||!inReach(g,event)||!behaviors[event.id].canInteract?.(event))return;
    behaviors[event.id].interact(event);sync();equipment.sync();
  }
  function sync(){
    const g=api.G,event=active();
    if(g)for(const e of Object.values(g.encounters))if(g.exploration.visited.includes(e.landmark))e.discovered=true;
    const near=g&&!g.raid?Object.values(g.encounters).find(e=>e.status==='available'&&Math.hypot(g.p.x-e.x,g.p.y-e.y)<=120):null,prompt=$('encounterPrompt');
    prompt.hidden=!g||g.over||g.won||!!g.raid||(!event&&!near);if(prompt.hidden)return;
    const shown=event||near,behavior=behaviors[shown.id];
    const view=shown.id+(event?'-active':'-offer');
    if(prompt.dataset.view!==view){
      prompt.dataset.view=view;
      const frame=questPropFrames[shown.id]??11;
      $('eventArt').style.backgroundPosition=(frame%4*100/3)+'% '+(Math.floor(frame/4)*50)+'%';
      $('eventReward').textContent='Reward · '+shown.slot;
      $('eventReward').hidden=!!event;
      $('eventState').textContent=event?'Active quest':'Optional quest';
      $('eventName').textContent=shown.name;
      $('eventDescription').textContent=shown.description.split(' Reward:')[0];
    }
    $('eventDescription').hidden=!!event;
    const progress=$('eventProgress'),message=event?behavior.progress(event):'';
    if(progress.textContent!==message)progress.textContent=message;
    progress.hidden=!event;
    $('eventDetails').hidden=!event;
    $('eventBrief').textContent=shown.description;
    const meter=$('eventMeter');
    meter.hidden=!event;
    if(event){const [value,max]=behavior.meter(event);meter.max=max;meter.value=value;}
    $('raidRestriction').hidden=!event;
    $('eventStart').hidden=!!event;$('eventStart').disabled=blocked(g);$('eventStart').onclick=()=>start(shown.id);
    $('eventAbandon').hidden=!event;$('eventAbandon').disabled=blocked(g);
    const button=$('eventInteract');
    button.hidden=!event||!behavior.canInteract?.(event);
    if(!button.hidden){
      button.textContent=typeof behavior.interactLabel==='function'?behavior.interactLabel(event):behavior.interactLabel;
      button.disabled=blocked(g)||!inReach(g,event);
    }
  }
  HOOKS.dmgMul.push(e=>e.elite==='Armoured'&&!(e.vulnerable>0)?.7:1);
  HOOKS.newGame.push(g=>{
    g.encounters={};
    if(g.practice)return;
    for(const d of stageDestinations(g.stage.id)){
      const site=d.steps?g.world.landmarks.find(place=>place.id===d.landmark):d;
      const point=api.safePoint(site.x,site.y,40);
      const event={...d,...point,status:'available',discovered:false};
      if(d.steps){
        event.guidance={...point,verb:'Visit',label:d.name};
        event.description+=' Reward: choose one '+d.slot+'.';
      }
      g.encounters[d.id]=event;
    }
  });
  HOOKS.cleanup.push(()=>{if(api.G)for(const event of Object.values(api.G.encounters)){if(event.status==='active')event.status='abandoned';remove(event)}$('encounterPrompt').hidden=true;});
  HOOKS.update.push(dt=>{const event=active();if(event)behaviors[event.id].update?.(event,dt);});
  $('eventAbandon').onclick=()=>abandon();$('eventInteract').onclick=interact;
  return {active,sync,spawn,complete,abandon,register(id,behavior){behaviors[id]=behavior;}};
}
