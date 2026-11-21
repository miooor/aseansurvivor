// Shared deterministic synthesis for skill and event cues. A layer is
// [timbre, start Hz, end Hz, seconds, delay, gain]. No samples, no dependencies.
export const bell=(f,d=.3,at=0,g=.2)=>['bell',f,f,d,at,g];
export const sweep=(f,to,d,at=0,g=.2)=>['air',f,to,d,at,g];
export const hit=(f,d=.2,at=0,g=.3)=>['drum',f,35,d,at,g];
export const motor=(f,to,d,at=0,g=.18)=>['motor',f,to,d,at,g];

export function renderLayers(layers,rate=22050){
  if(!layers||!layers.length)return new Float32Array(0);
  const duration=Math.max(...layers.map(l=>l[3]+l[4]))+.22;
  const pcm=new Float32Array(Math.ceil(duration*rate));let seed=123456789;
  for(const [kind,from,to,lengthSec,delay,gain]of layers){
    let phase=0,filtered=0;const start=Math.round(delay*rate),length=Math.ceil(lengthSec*rate);
    for(let i=0;i<length;i++){
      const t=i/rate,p=i/length,f=from*Math.pow(to/from,p);phase+=Math.PI*2*f/rate;
      const envelope=Math.min(1,t/.008)*Math.pow(1-p,kind==='bell'?2:1.5);
      seed=(Math.imul(seed,1664525)+1013904223)|0;const noise=seed/2147483648;
      filtered+=(noise-filtered)*Math.min(.85,Math.PI*2*f/rate);
      const tone=kind==='bell'?Math.sin(phase)+.35*Math.sin(phase*2.76)*Math.exp(-t*8):kind==='motor'?(Math.sin(phase)+.35*Math.sin(phase*2)+.15*Math.sin(phase*4))*(.8+.2*Math.sin(t*85)):kind==='drum'?Math.sin(phase)+noise*.12:filtered*2;
      pcm[start+i]+=tone*envelope*gain;
    }
  }
  // Two quiet reflections give the cues space without long overlapping tails.
  const dry=pcm.slice();for(let i=0;i<pcm.length;i++){let v=dry[i];for(const [delay,gain]of [[.09,.16],[.18,.07]])if(i>=delay*rate)v+=dry[i-Math.round(delay*rate)]*gain;pcm[i]=Math.tanh(v)*.8}
  return pcm;
}
