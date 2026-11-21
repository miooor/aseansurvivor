import * as THREE from 'three';
import type {RunState} from '../game/runtime.js';
import {SHRINES} from '../content/shrines.js';
import type {Knot,SpellRibbons} from './SpellRibbons';

const HEIGHT=260,turn=Math.PI*2,tint=new THREE.Color();

// A pillar of shrine-coloured light with rising halos, drawn into the additive batch.
export function drawShrineBeacons(light:SpellRibbons,g:RunState,reduced:boolean){
  for(const u of g.pups){
    const shrine=SHRINES[u.type as keyof typeof SHRINES];
    if(!shrine)continue;
    const c=tint.set(shrine.color).getHex(),t=reduced?0:g.t+u.x*.01;
    const pulse=.8+.2*Math.sin(t*3);
    const column=(w:number,a:number,colour:number)=>light.strip([[u.x,u.y,0],[u.x,u.y,HEIGHT*.5],[u.x,u.y,HEIGHT]],w,colour,a*pulse);
    light.glow([u.x,u.y,0],70*pulse,c,.5);
    column(30,.35,c);
    column(9,.8,0xffffff);
    // Halos climb the pillar, widening and fading as they rise.
    for(let k=0;k<3;k++){
      const f=(t*.45+k/3)%1,h=f*HEIGHT*.8,r=22+f*20,ring:Knot[]=[];
      for(let i=0;i<=16;i++){const a=i*turn/16;ring.push([u.x+Math.cos(a)*r,u.y+Math.sin(a)*r,h])}
      light.strip(ring,3.5,c,.7*(1-f),false);
    }
    for(let k=0;k<4;k++){
      const f=(t*.3+k/4)%1,a=k*1.7+t;
      light.glow([u.x+Math.cos(a)*16,u.y+Math.sin(a)*8,f*HEIGHT],5,0xffffff,.8*(1-f));
    }
  }
}
