// These are the runtime's damage windows: reduced armour, an uncurled
// Tenggiling, or the damage bonus during a pack member's recovery.
export function isExposed(enemy){
  if(enemy.dead)return false;
  return enemy.packRecovery>0||
    (enemy.elite==='Armoured'&&enemy.vulnerable>0)||
    (enemy.type==='tenggilingRoller'&&(enemy.vulnerable>0||enemy.rush>0&&enemy.stun>0));
}

const cueNames=['danger','exposed','slowdown'];

export class CombatTellAudio {
  run=null;
  channels=new Map(cueNames.map(name=>[name,{previous:new Set(),current:new Set(),started:false}]));

  begin(run){
    if(run===this.run)return;
    this.run=run;
    for(const channel of this.channels.values())channel.previous.clear();
  }

  observe(channel,key,near){
    const state=this.channels.get(channel);
    if(near&&!state.previous.has(key))state.started=true;
    state.current.add(key);
  }

  danger(key,near){this.observe('danger',key,near)}
  exposed(key,near){this.observe('exposed',key,near)}
  slow(key){this.observe('slowdown',key,true)}

  finish(audio,audible){
    for(const [name,channel] of this.channels){
      if(channel.started&&audible)audio.cue(name);
      // Record state even if playback was dropped by mute, pause, or the voice budget.
      const previous=channel.previous;
      channel.previous=channel.current;
      channel.current=previous;
      channel.current.clear();
      channel.started=false;
    }
  }
}
