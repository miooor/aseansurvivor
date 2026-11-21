import {ambientNote,melodyNote,moodBeat,stageProfile} from './ambient-audio.js';
import {bell,sweep,hit,motor,renderLayers} from './synth.js';
import {EVENT_SOUNDS,renderEvent,EVENT_GAP} from './event-audio.js';
export const SKILL_SOUNDS={
  'ustaz-0':[bell(880,.16,0,.09)],
  'ustaz-1':[sweep(400,1600,.22),bell(1046,.4,.07),bell(1568,.3,.12,.12)],
  'ustaz-2':[bell(659,.4),bell(784,.4,.07),bell(988,.5,.14),bell(1318,.5,.21)],
  'ustaz-3':[sweep(180,700,.45,0,.3),bell(392,.55,.08),hit(110,.25,.04,.16)],
  'ustaz-4':[sweep(240,1800,.45,0,.15),hit(95,.7,.18,.4),bell(262,1.6,.18,.28),bell(392,1.5,.24,.24),bell(523,1.3,.3,.2),bell(1046,1,.4,.12)],
  'rempit-0':[motor(180,80,.12,0,.08),bell(1400,.09,.02,.07)],
  'rempit-1':[motor(90,360,.35,0,.3),sweep(1400,250,.2,.06,.15),hit(100,.18,.06)],
  'rempit-2':[motor(65,120,.5,0,.2),sweep(1200,120,.4,0,.25),hit(200,.08,.1,.2),hit(160,.1,.27,.2)],
  'rempit-3':[motor(330,330,.25,0,.2),motor(440,440,.25,0,.18),motor(330,330,.18,.32,.15)],
  'rempit-4':[motor(65,500,.9,0,.28),motor(130,1000,.85,.08,.13),sweep(300,2600,.6,.1,.18),hit(85,.65,.24,.4),sweep(1800,120,.9,.55,.15)],
  'nok-0':[sweep(900,200,.1,0,.1),hit(180,.12,.035,.14)],
  'nok-tip':[bell(1175,.32,0,.34),bell(1780,.18,.008,.11)],
  'nok-1':[sweep(1100,180,.18),hit(180,.27,.07,.45)],
  'nok-2':[sweep(500,1800,.16),sweep(1700,250,.22,.12),hit(260,.2,.18,.35)],
  'nok-3':[hit(320,.18,0,.22),bell(587,.45,.07,.16),hit(440,.17,.2,.18),bell(880,.7,.3,.13)],
  'nok-4':[sweep(180,1500,.42,0,.22),hit(65,.75,.55,.6),hit(150,.35,.55,.28),sweep(1500,75,.65,.55,.35),hit(90,.22,.72,.15)],
  'lan-0':[bell(740,.18,0,.09),sweep(1200,500,.12,0,.05)],
  'lan-1':[sweep(240,1300,.3,0,.24),bell(1175,.25,.08),bell(784,.3,.19,.12)],
  'lan-2':[bell(523,.3),bell(659,.3,.1),bell(784,.4,.2),sweep(600,220,.35,.1,.1)],
  'lan-3':[sweep(1800,120,.48,0,.3),bell(1568,.18,.05,.12),bell(1046,.22,.14,.12),bell(659,.3,.24,.1)],
  'lan-4':[sweep(120,1800,.45,0,.2),hit(75,.6,.25,.3),sweep(2200,140,.95,.3,.22),...[523,659,784,1046,1318,1568].map((f,i)=>bell(f,.8,.2+i*.12,.17))],
  'sari-0':[sweep(1800,500,.13,0,.08),bell(1800,.13,.04,.06)],
  'sari-1':[sweep(350,2400,.2),bell(1568,.3,.07,.16),hit(220,.2,.1,.25)],
  'sari-2':[sweep(1900,120,.27,0,.25),hit(130,.18,.02,.22),sweep(900,80,.2,.1,.14)],
  'sari-3':[bell(1760,.4,0,.2),bell(2349,.4,.035,.12),sweep(200,1000,.3,.06,.12)],
  'sari-4':[sweep(250,2100,.4,0,.24),hit(80,.65,.2,.35),bell(440,1.4,.2,.22),bell(659,1.2,.25,.18),...[0,.13,.26,.39,.52].map((at,i)=>sweep(2600-i*260,250,.32,.35+at,.15))],
  // Original tool-inspired synthesis: paper clicks, reel arcs, floats, shuttles,
  // invented resonator tones, workshop taps and courier returns; no samples.
  'asha-0':[bell(960,0.13,0,0.09),sweep(1920,320,0.1,0.02,.1)],
  'asha-1':[bell(1210,0.24,0,0.18),sweep(2420,403,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'asha-2':[bell(730,0.32,0,0.18),sweep(1460,243,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'asha-3':[bell(560,0.38,0,0.18),sweep(1120,186,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'asha-4':[bell(1450,0.85,0,0.18),sweep(2900,483,0.65,0.1,.1),hit(174,.22,.08,.16)],
  'mira-0':[hit(185,.08,0,.16),bell(804,.13,.01,.13)],
  'mira-1':[bell(930,.12,0,.17),bell(1380,.12,.08,.13),bell(780,.16,.16,.12)],
  'mira-2':[hit(143,.14,0,.2),sweep(380,1660,.28,.05,.17)],
  'mira-3':[hit(115,.15,0,.22),bell(520,.25,.02,.16)],
  'mira-4':[hit(105,.12,0,.22),hit(132,.12,.1,.2),sweep(190,900,.39,.16,.19),hit(78,.35,.6,.24)],
  'dani-0':[bell(410,0.13,0,0.09),sweep(820,136,0.1,0.02,.1)],
  'dani-1':[hit(165,.14,0,.48),sweep(1580,235,.16,0,.26)],
  'dani-2':[sweep(420,1360,.34,0,.13),bell(698,.35,.04,.12),bell(1047,.38,.15,.09),bell(1568,.36,.23,.08)],
  'dani-3':Array.from({length:5},(_,i)=>[
    bell(1470+i*96,.21,.24+i*.36,.12),bell(2410+i*74,.19,.33+i*.36,.10),hit(115,.10,.38+i*.36,.09)
  ]).flat(),
  'dani-4':Array.from({length:15},(_,i)=>[hit(116,.10,.06+i*.20,.10),bell(770+i%3*130,.15,.09+i*.20,.08)]).flat(),
  'vanna-0':[bell(1250,0.13,0,0.09),sweep(2500,416,0.1,0.02,.1)],
  'vanna-1':[bell(870,0.24,0,0.18),sweep(1740,290,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'vanna-2':[bell(1130,0.32,0,0.18),sweep(2260,376,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'vanna-3':[bell(640,0.38,0,0.18),sweep(1280,213,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'vanna-4':[bell(1530,0.85,0,0.18),sweep(3060,510,0.65,0.1,.1),hit(174,.22,.08,.16)],
  'keo-0':[bell(330,0.13,0,0.09),sweep(660,110,0.1,0.02,.1)],
  'keo-1':[bell(294,0.24,0,0.18),sweep(588,98,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'keo-2':[bell(440,0.32,0,0.18),sweep(880,146,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'keo-3':[bell(247,0.38,0,0.18),sweep(494,90,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'keo-4':[bell(523,0.85,0,0.18),sweep(1046,174,0.65,0.1,.1),hit(174,.22,.08,.16)],
  'nadi-0':[sweep(440,145,.10,0,.11),hit(114,.13,.025,.14)],
  'nadi-1':Array.from({length:9},(_,i)=>hit(125+i*9,.065,.12*(i+1),.073)),
  'nadi-2':[sweep(470,85,.36,0,.24),sweep(1480,390,.24,.02,.12),hit(67,.25,.04,.18)],
  'nadi-3':[bell(784,.47,0,.12),bell(1175,.40,.04,.07)],
  'nadi-4':[bell(330,.95,0,.18),bell(495,.82,.09,.14),bell(660,.75,.19,.13),bell(990,.62,.32,.08)],
  'lia-0':[sweep(1500,420,.09,0,.10)],
  'lia-1':[sweep(1900,210,.24),hit(134,.10,.09,.13)],
  'lia-2':[sweep(105,1200,.09),sweep(1400,170,.16,.09),hit(150,.12,.1,.17)],
  'lia-3':[0,.07,.14].map(t=>sweep(1750,265,.17,t,.13)),
  'lia-4':[0,.18,.36].flatMap(t=>[sweep(1500,160,.16,t),hit(130,.12,t+.06,.15)])
};

export function renderSkill(key,rate=22050){
  return renderLayers(SKILL_SOUNDS[key],rate);
}

export class SkillAudio {
  context=null;voices=new Map();buffers=new Map();lastCue=null;playCount=0;volume=.6;muted=false;paused=true;
  constructor(){
    this.controller=new AbortController();this.recent=new Map();
    this.profile=null;this.mood='menu';this.musicNext=0;this.musicStep=0;this.musicVoices=new Set();
    this.cueVoices=new Map();this.recentCues=new Map();this.cueCount=0;this.lastEvent=null;
    try{const s=JSON.parse(localStorage.getItem('aseanSurvivor.audio'));if(s){if(Number.isFinite(s.volume))this.volume=Math.max(0,Math.min(1,s.volume));this.muted=s.muted===true}}catch{}
    const signal=this.controller.signal;
    const unlock=e=>{if(e.isTrusted)void this.unlock()};
    document.addEventListener('pointerdown',unlock,{signal});document.addEventListener('keydown',unlock,{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop()},{signal});
    for(const input of document.querySelectorAll('[data-sound-volume]'))input.addEventListener('input',()=>this.setVolume(Number(input.value)/100),{signal});
    for(const button of document.querySelectorAll('[data-sound-mute]'))button.addEventListener('click',()=>this.setMuted(!this.muted),{signal});
    this.updateControls();
  }
  async unlock(){
    try{
      if(!this.context){
        this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=this.muted?0:this.volume*.65;
        const compressor=this.context.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=6;compressor.attack.value=.003;compressor.release.value=.15;
        this.master.connect(compressor);compressor.connect(this.context.destination);
      }
      if(this.context.state==='suspended')await this.context.resume();
    }catch{ /* Audio support or autoplay denial must never prevent play. */ }
  }
  updateControls(){
    for(const input of document.querySelectorAll('[data-sound-volume]'))input.value=String(Math.round(this.volume*100));
    for(const button of document.querySelectorAll('[data-sound-mute]')){button.textContent=this.muted?'Sound off':'Sound on';button.setAttribute('aria-pressed',String(this.muted))}
  }
  persist(){try{localStorage.setItem('aseanSurvivor.audio',JSON.stringify({volume:this.volume,muted:this.muted}))}catch{}this.updateControls();if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*.65,this.context.currentTime,.015)}
  setVolume(value){if(!Number.isFinite(value))return;this.volume=Math.max(0,Math.min(1,value));if(!this.volume)this.stop();this.persist()}
  setMuted(value){this.muted=!!value;if(this.muted)this.stop();this.persist()}
  setPaused(value){if(this.paused===value)return;this.paused=value;if(value)this.stop()}
  stop(){for(const [source,gain]of this.voices){source.onended=null;source.stop();source.disconnect();gain.disconnect()}this.voices.clear();this.recent.clear();this.stopCues();this.stopMusic()}
  stopCues(){for(const [source,gain]of this.cueVoices){source.onended=null;try{source.stop()}catch{}source.disconnect();gain.disconnect()}this.cueVoices.clear();this.recentCues.clear()}

  // One-shot gameplay cues share the master bus but have their own small voice
  // budget, so a level-up chime can never evict an ultimate. `ui` cues ignore
  // the paused flag because level-up cards and menus are intentionally paused.
  cue(name,ui=false){
    const ctx=this.context;
    if(!ctx||ctx.state!=='running'||(!ui&&this.paused)||this.muted||this.volume===0||document.hidden||!EVENT_SOUNDS[name])return false;
    const now=ctx.currentTime;
    if(now-(this.recentCues.get(name)??-1)<(EVENT_GAP[name]??.15))return false;
    if(this.cueVoices.size>=6)return false;
    if(!this.cueBuffers)this.cueBuffers=new Map();
    if(!this.cueBuffers.has(name)){const samples=renderEvent(name),buffer=ctx.createBuffer(1,samples.length,22050);buffer.copyToChannel(samples,0);this.cueBuffers.set(name,buffer)}
    const source=ctx.createBufferSource(),gain=ctx.createGain();
    source.buffer=this.cueBuffers.get(name);
    gain.gain.value=name==='ember'?.4:name==='coin'?.55:.8;
    source.connect(gain);gain.connect(this.master);
    source.onended=()=>{source.disconnect();gain.disconnect();this.cueVoices.delete(source)};
    this.cueVoices.set(source,gain);this.recentCues.set(name,now);this.lastEvent=name;this.cueCount++;source.start();
    return true;
  }

  /* ---------- Per-stage ambience ---------- */
  // The frame loop calls setScene every tick; switching only on a real change
  // keeps this idempotent and avoids restarting the bed on every frame.
  setScene(stageId,mood='explore'){
    const profile=stageId?stageProfile(stageId):null;
    if(this.profile===profile&&this.mood===mood)return;
    this.profile=profile;this.mood=mood;this.musicStep=0;
    this.musicNext=this.context?this.context.currentTime+.06:0;
    this.stopMusic();
  }
  stopMusic(){
    for(const {osc,gain,filter} of this.musicVoices){
      osc.onended=null;try{osc.stop()}catch{}
      osc.disconnect();filter.disconnect();gain.disconnect();
    }
    this.musicVoices.clear();
  }
  tickMusic(){
    const ctx=this.context;
    if(!ctx||ctx.state!=='running'||this.paused||this.muted||this.volume===0||document.hidden||!this.profile)return;
    const now=ctx.currentTime;
    if(this.musicNext<now||this.musicNext>now+1)this.musicNext=now+.05;
    const beat=moodBeat(this.profile,this.mood);
    while(this.musicNext<now+.25){
      const step=this.musicStep++,note=ambientNote(this.profile,this.mood,step);
      if(note.gain>0&&this.musicVoices.size<32)this.scheduleMusic(note,this.musicNext);
      const melody=melodyNote(this.profile,this.mood,step);
      if(melody&&this.musicVoices.size<32)this.scheduleMusic(melody,this.musicNext);
      this.musicNext+=beat;
    }
  }
  scheduleMusic(note,at){
    const ctx=this.context;
    const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    osc.type=note.wave;osc.frequency.setValueAtTime(note.freq,at);
    filter.type='lowpass';filter.frequency.setValueAtTime(note.cutoff,at);
    const isPad=note.layer==='pad',isMelody=note.layer==='melody';
    const peak=note.gain*(isPad?.5:1);
    gain.gain.setValueAtTime(0,at);
    gain.gain.linearRampToValueAtTime(peak,at+(isMelody?.035:.02));
    gain.gain.setTargetAtTime(0,at+Math.max(.05,note.duration*.4),isPad?.6:isMelody?.35:.18);
    osc.connect(filter);filter.connect(gain);gain.connect(this.master);
    const voice={osc,gain,filter};this.musicVoices.add(voice);
    osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();this.musicVoices.delete(voice)};
    osc.start(at);osc.stop(at+note.duration+(isPad?.8:isMelody?.25:.15));
  }
  play(hero,slot){
    const key=hero+'-'+slot,ctx=this.context;
    if(!ctx||ctx.state!=='running'||this.paused||this.muted||this.volume===0||document.hidden||!SKILL_SOUNDS[key])return;
    const now=ctx.currentTime;if(now-(this.recent.get(key)??-1)<.09)return;
    if(this.voices.size>=8){if(slot===0)return;const victim=[...this.voices].find(([source])=>!source.ultimate);if(!victim)return;victim[0].stop();victim[0].disconnect();victim[1].disconnect();this.voices.delete(victim[0])}
    if(!this.buffers.has(key)){const samples=renderSkill(key),buffer=ctx.createBuffer(1,samples.length,22050);buffer.copyToChannel(samples,0);this.buffers.set(key,buffer)}
    const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=this.buffers.get(key);source.ultimate=slot===4;
    gain.gain.value=slot===0?.42:slot===4?1:.75;source.connect(gain);gain.connect(this.master);
    source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(source)};
    if(slot===4)for(const [voice,level]of this.voices)if(!voice.ultimate)level.gain.setTargetAtTime(.2,now,.02);
    this.voices.set(source,gain);this.recent.set(key,now);this.lastCue=key;this.playCount++;source.start();
  }
  destroy(){this.controller.abort();this.stop();void this.context?.close();this.buffers.clear();this.cueBuffers?.clear()}
}
