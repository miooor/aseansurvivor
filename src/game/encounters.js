import {ENCOUNTERS} from '../content/encounters.js';

export function installEncounters(api,equipment){
  const {$,HOOKS}=api;
  const active=()=>Object.values(api.G?.encounters||{}).find(e=>e.status==='active');
  const remaining=e=>api.G.enemies.filter(n=>n.encounter===e.id&&!n.dead).length;
  function remove(id){
    for(const key of ['enemies','projs','eprojs','zones','fx'])api.G[key]=api.G[key].filter(e=>e.encounter!==id);
  }
  function spawn(event,type,x,y,elite){
    const enemy=api.makeGhost(type,x,y);enemy.encounter=event.id;
    if(elite){enemy.elite=elite;enemy.hp*=3;enemy.maxHp*=3;enemy.dmg*=1.25;enemy.vulnerable=0;}
    return enemy;
  }
  function abandon(event=active()){
    if(!event||event.status!=='active')return;
    event.status='abandoned';remove(event.id);api.banner(event.name+' abandoned. No reward.',3);sync();
  }
  function complete(event){
    const g=api.G;if(!event||event.status!=='active'||g.over||g.won)return;
    event.status='completed';remove(event.id);equipment.grant(event.id,event.slot);
    api.banner(event.name+' completed · choose your '+event.slot,3);sync();
  }
  const behaviors={rescue:{
    start(event){for(let i=0;i<6;i++){const a=i*Math.PI/3;spawn(event,i?'pocong':'stalker',event.x+Math.cos(a)*180,event.y+Math.sin(a)*180,i?null:'Armoured');}},
    progress:event=>remaining(event)?`${remaining(event)} captors remaining`:'Captors defeated · return to the traveller',
    canInteract:event=>!remaining(event),
    interact:event=>complete(event),
    interactLabel:'Rescue traveller'
  }};
  const blocked=g=>g.paused||g.choosing||!!g.lootModal||g.over||g.won||!!g.raid;
  function start(id){
    const g=api.G,event=g?.encounters[id];
    if(!event||event.status!=='available'||active()||blocked(g)||Math.hypot(g.p.x-event.x,g.p.y-event.y)>120)return;
    event.status='active';behaviors[id].start(event);sync();
  }
  function interact(){
    const g=api.G,event=active();if(!event||blocked(g)||Math.hypot(g.p.x-event.x,g.p.y-event.y)>120||!behaviors[event.id].canInteract?.(event))return;
    behaviors[event.id].interact(event);sync();equipment.sync();
  }
  function sync(){
    const g=api.G,event=active();
    if(g)for(const e of Object.values(g.encounters))if(g.exploration.visited.includes(e.landmark))e.discovered=true;
    const near=g&&!g.raid?Object.values(g.encounters).find(e=>e.status==='available'&&Math.hypot(g.p.x-e.x,g.p.y-e.y)<=120):null,prompt=$('encounterPrompt');
    prompt.hidden=!g||g.over||g.won||!!g.raid||(!event&&!near);if(prompt.hidden)return;
    const shown=event||near,behavior=behaviors[shown.id];
    $('eventName').textContent=shown.name;$('eventDescription').textContent=shown.description;
    $('eventProgress').textContent=event?behavior.progress(event):'Optional encounter';$('raidRestriction').hidden=!event;
    $('eventStart').hidden=!!event;$('eventStart').disabled=blocked(g);$('eventStart').onclick=()=>start(shown.id);
    $('eventAbandon').hidden=!event;$('eventAbandon').disabled=blocked(g);
    $('eventInteract').textContent=behavior.interactLabel||'Investigate';$('eventInteract').hidden=!event||!behavior.canInteract?.(event);
    $('eventInteract').disabled=blocked(g)||Math.hypot(g.p.x-shown.x,g.p.y-shown.y)>120;
  }
  HOOKS.dmgMul.push(e=>e.elite==='Armoured'&&!(e.vulnerable>0)?.7:1);
  HOOKS.newGame.push(g=>{g.encounters=g.stage.id==='johor'?Object.fromEntries(Object.entries(ENCOUNTERS).map(([id,d])=>[id,{...d,...api.safePoint(d.x,d.y,40),id,status:'available',discovered:false}])):{};});
  HOOKS.cleanup.push(()=>{if(api.G)for(const event of Object.values(api.G.encounters)){if(event.status==='active')event.status='abandoned';remove(event.id)}$('encounterPrompt').hidden=true;});
  HOOKS.update.push(dt=>{const event=active();if(event)behaviors[event.id].update?.(event,dt);});
  $('eventAbandon').onclick=()=>abandon();$('eventInteract').onclick=interact;
  return {active,sync,spawn,complete,abandon,register(id,behavior){behaviors[id]=behavior;}};
}
