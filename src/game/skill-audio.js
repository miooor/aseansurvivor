// Layers: timbre, start Hz, end Hz, seconds, delay, gain. Original synthesis; no samples.
const bell=(f,d=.3,at=0,g=.2)=>['bell',f,f,d,at,g];
const sweep=(f,to,d,at=0,g=.2)=>['air',f,to,d,at,g];
const hit=(f,d=.2,at=0,g=.3)=>['drum',f,35,d,at,g];
const motor=(f,to,d,at=0,g=.18)=>['motor',f,to,d,at,g];
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
  'mira-0':[bell(570,0.13,0,0.09),sweep(1140,190,0.1,0.02,.1)],
  'mira-1':[bell(810,0.24,0,0.18),sweep(1620,270,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'mira-2':[bell(1090,0.32,0,0.18),sweep(2180,363,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'mira-3':[bell(430,0.38,0,0.18),sweep(860,143,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'mira-4':[bell(1320,0.85,0,0.18),sweep(2640,440,0.65,0.1,.1),hit(174,.22,.08,.16)],
  'dani-0':[bell(410,0.13,0,0.09),sweep(820,136,0.1,0.02,.1)],
  'dani-1':[bell(670,0.24,0,0.18),sweep(1340,223,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'dani-2':[bell(920,0.32,0,0.18),sweep(1840,306,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'dani-3':[bell(520,0.38,0,0.18),sweep(1040,173,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'dani-4':[bell(1180,0.85,0,0.18),sweep(2360,393,0.65,0.1,.1),hit(174,.22,.08,.16)],
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
  'nadi-0':[bell(780,0.13,0,0.09),sweep(1560,260,0.1,0.02,.1)],
  'nadi-1':[bell(990,0.24,0,0.18),sweep(1980,330,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'nadi-2':[bell(610,0.32,0,0.18),sweep(1220,203,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'nadi-3':[bell(470,0.38,0,0.18),sweep(940,156,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'nadi-4':[bell(1390,0.85,0,0.18),sweep(2780,463,0.65,0.1,.1),hit(174,.22,.08,.16)],
  'lia-0':[bell(1470,0.13,0,0.09),sweep(2940,490,0.1,0.02,.1)],
  'lia-1':[bell(1060,0.24,0,0.18),sweep(2120,353,0.2,0.04,.1),hit(111,.22,.08,.16)],
  'lia-2':[bell(760,0.32,0,0.18),sweep(1520,253,0.27,0.06,.1),hit(132,.22,.08,.16)],
  'lia-3':[bell(940,0.38,0,0.18),sweep(1880,313,0.34,0.08,.1),hit(153,.22,.08,.16)],
  'lia-4':[bell(1620,0.85,0,0.18),sweep(3240,540,0.65,0.1,.1),hit(174,.22,.08,.16)]
};

export function renderSkill(key,rate=22050){
  const layers=SKILL_SOUNDS[key];if(!layers)return new Float32Array(0);
  const duration=Math.max(...layers.map(l=>l[3]+l[4]))+.22;
  const pcm=new Float32Array(Math.ceil(duration*rate));let seed=123456789;
  for(const [kind,from,to,duration,delay,gain]of layers){
    let phase=0,filtered=0;const start=Math.round(delay*rate),length=Math.ceil(duration*rate);
    for(let i=0;i<length;i++){
      const t=i/rate,p=i/length,f=from*Math.pow(to/from,p);phase+=Math.PI*2*f/rate;
      const envelope=Math.min(1,t/.008)*Math.pow(1-p,kind==='bell'?2:1.5);
      seed=(Math.imul(seed,1664525)+1013904223)|0;const noise=seed/2147483648;
      filtered+=(noise-filtered)*Math.min(.85,Math.PI*2*f/rate);
      const tone=kind==='bell'?Math.sin(phase)+.35*Math.sin(phase*2.76)*Math.exp(-t*8):kind==='motor'?(Math.sin(phase)+.35*Math.sin(phase*2)+.15*Math.sin(phase*4))*(.8+.2*Math.sin(t*85)):kind==='drum'?Math.sin(phase)+noise*.12:filtered*2;
      pcm[start+i]+=tone*envelope*gain;
    }
  }
  // Two quiet reflections give the fantasy cues space without long overlapping reverb tails.
  const dry=pcm.slice();for(let i=0;i<pcm.length;i++){let v=dry[i];for(const [delay,gain]of [[.09,.16],[.18,.07]])if(i>=delay*rate)v+=dry[i-Math.round(delay*rate)]*gain;pcm[i]=Math.tanh(v)*.8}
  return pcm;
}

export class SkillAudio {
  context=null;voices=new Map();buffers=new Map();lastCue=null;playCount=0;volume=.6;muted=false;paused=true;
  constructor(){
    this.controller=new AbortController();this.recent=new Map();
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
  setPaused(value){this.paused=value;if(value)this.stop()}
  stop(){for(const [source,gain]of this.voices){source.onended=null;source.stop();source.disconnect();gain.disconnect()}this.voices.clear();this.recent.clear()}
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
  destroy(){this.controller.abort();this.stop();void this.context?.close();this.buffers.clear()}
}
