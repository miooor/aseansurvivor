import {renderLayers} from './synth.js';

// Original procedural ambience: one modal profile per stage, scheduled as
// sparse plucks over a sustained pad with a short generative melody on top.
// No samples and no external audio files. Modes and motifs are invented
// pentatonic/heptatonic colours, not quotations of any traditional piece;
// regional identity comes from register, tempo, motif and timbre.
export const AMBIENCE={
  johor:{name:'Johor palm groves',root:110,scale:[0,2,4,7,9],beat:.62,pad:'sine',wave:'triangle',cutoff:900,plucks:[0,2,4,3,1,4,2,3],gain:.11,motif:[0,1,2,3,2,1,0,2],melodyGain:.095,melodyWave:'triangle'},
  melaka:{name:'Melaka river quays',root:98,scale:[0,2,3,5,7,10],beat:.58,pad:'triangle',wave:'sine',cutoff:760,plucks:[0,3,1,4,2,5,3,1],gain:.10,motif:[0,2,1,3,2,4,3,1],melodyGain:.09,melodyWave:'sine'},
  kl:{name:'Kuala Lumpur after dark',root:123,scale:[0,1,5,7,8],beat:.46,pad:'sawtooth',wave:'triangle',cutoff:1250,plucks:[0,4,2,3,1,4,0,2],gain:.095,motif:[0,1,2,3,4,3,2,1],melodyGain:.085,melodyWave:'triangle'},
  perak:{name:'Perak limestone basin',root:92,scale:[0,2,5,7,10],beat:.7,pad:'sine',wave:'triangle',cutoff:620,plucks:[0,2,3,4,1,3,2,4],gain:.115,motif:[0,1,2,1,3,2,4,3],melodyGain:.1,melodyWave:'triangle'},
  penang:{name:'Penang timber jetties',root:104,scale:[0,2,4,7,9],beat:.6,pad:'triangle',wave:'sine',cutoff:820,plucks:[0,1,3,2,4,3,1,2],gain:.10,motif:[0,2,3,2,4,3,1,0],melodyGain:.09,melodyWave:'sine'},
  kedah:{name:'Kedah sawah',root:116,scale:[0,2,4,7,9],beat:.68,pad:'sine',wave:'triangle',cutoff:980,plucks:[0,2,4,1,3,4,2,0],gain:.105,motif:[0,1,2,4,3,2,1,0],melodyGain:.095,melodyWave:'triangle'},
  pahang:{name:'Pahang mangrove reach',root:87,scale:[0,3,5,7,10],beat:.74,pad:'sawtooth',wave:'sine',cutoff:540,plucks:[0,3,2,4,1,3,0,2],gain:.12,motif:[0,1,2,1,3,2,1,0],melodyGain:.105,melodyWave:'sine'},
  terengganu:{name:'Terengganu boatyards',root:98,scale:[0,2,4,7,9],beat:.55,pad:'triangle',wave:'triangle',cutoff:880,plucks:[0,4,2,3,1,2,4,0],gain:.105,motif:[0,2,1,3,4,3,2,0],melodyGain:.09,melodyWave:'triangle'},
  kelantan:{name:'Kelantan kite fields',root:110,scale:[0,2,3,7,9],beat:.5,pad:'triangle',wave:'sawtooth',cutoff:1100,plucks:[0,2,1,4,3,2,0,3],gain:.10,motif:[0,1,3,2,4,3,1,0],melodyGain:.09,melodyWave:'triangle'},
  selangor:{name:'Selangor river warehouses',root:103,scale:[0,2,5,7,10],beat:.56,pad:'sawtooth',wave:'triangle',cutoff:940,plucks:[0,3,4,1,2,4,3,0],gain:.10,motif:[0,2,3,1,4,2,3,0],melodyGain:.09,melodyWave:'triangle'}
};

export const stageProfile=id=>AMBIENCE[id]||AMBIENCE.johor;

// Deterministic note for one scheduling step. Keeping this pure makes the
// musical rules checkable without a browser or an AudioContext.
export function ambientNote(profile,mood,step){
  const tense=mood==='boss'||mood==='raid';
  const every=tense?2:mood==='combat'?3:4;
  const degree=profile.plucks[step%profile.plucks.length];
  const scale=profile.scale;
  const semis=scale[degree%scale.length]+12*Math.floor(degree/scale.length);
  const freq=profile.root*Math.pow(2,semis/12);
  if(step%8===0)return {layer:'pad',freq:profile.root,gain:profile.gain*.55,duration:profile.beat*7.5,wave:profile.pad,cutoff:profile.cutoff*.6};
  if(step%every===0)return {layer:'pluck',freq,gain:profile.gain,duration:profile.beat*(tense?1.4:2.2),wave:profile.wave,cutoff:profile.cutoff};
  if(tense)return {layer:'pulse',freq:profile.root*2,gain:profile.gain*.45,duration:profile.beat*.5,wave:'triangle',cutoff:profile.cutoff*1.4};
  return {layer:'rest',freq,gain:0,duration:0,wave:profile.wave,cutoff:profile.cutoff};
}

// Short motifs vary over a four-phrase cycle: plain, up a scale degree,
// retrograde, then displaced. The cycle repeats every 32 steps, so the tune
// feels composed rather than random while still changing over time.
export function melodyNote(profile,mood,step){
  const motif=profile.motif,len=motif.length,phrase=Math.floor(step/len),pos=step%len;
  let degree=motif[pos];
  if(phrase%4===1)degree+=1;
  else if(phrase%4===2)degree=motif[len-1-pos];
  else if(phrase%4===3)degree=motif[(pos+2)%len]+(pos%3===0?1:0);
  const scale=profile.scale;
  const octave=mood==='raid'?1:mood==='boss'?-1:0;
  const wrapped=((degree%scale.length)+scale.length)%scale.length;
  const semis=scale[wrapped]+12*Math.floor(degree/scale.length)+12*octave;
  const freq=profile.root*Math.pow(2,semis/12);
  const every=mood==='explore'||mood==='raid'?2:1;
  if(pos%every!==0)return null;
  const gain=profile.melodyGain*(mood==='boss'?1.2:mood==='combat'?1.08:1);
  return {layer:'melody',freq,gain,duration:profile.beat*(mood==='boss'?.9:1.5),wave:profile.melodyWave,cutoff:profile.cutoff*1.2};
}

export const moodBeat=(profile,mood)=>profile.beat*(mood==='boss'?.72:mood==='raid'?1.15:mood==='combat'?.85:1);

// Audition helper: renders a melody phrase to PCM using the shared renderer.
export function renderMelodyPhrase(profile,mood='explore',steps=16,rate=22050){
  const beat=moodBeat(profile,mood),layers=[];
  for(let i=0;i<steps;i++){
    const n=melodyNote(profile,mood,i);
    if(n)layers.push(['bell',n.freq,n.freq,Math.min(n.duration,beat*1.4),i*beat,n.gain]);
  }
  return renderLayers(layers,rate);
}
