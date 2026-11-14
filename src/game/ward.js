export function installWard(api,encounters){
  const remaining=event=>api.G.enemies.filter(e=>e.encounter===event.id&&!e.dead);
  function wave(event){
    const count=[4,6,8][event.wave-1];
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count;
      encounters.spawn(event,event.wave===3&&i===0?'stalker':'pocong',event.x+Math.cos(a)*240,event.y+Math.sin(a)*240,event.wave===3&&i===0?'Armoured':null);
    }
  }
  encounters.register('ward',{
    start(event){event.hp=300;event.wave=1;wave(event);},
    progress:event=>`Ward ${event.hp} / 300 HP · Wave ${event.wave} / 3 · ${remaining(event).length} remaining`,
    update(event){if(!remaining(event).length){if(event.wave===3)encounters.complete(event);else{event.wave++;wave(event);}}}
  });
}
