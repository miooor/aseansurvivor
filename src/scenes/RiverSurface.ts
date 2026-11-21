import * as THREE from 'three';
import {HALF,type MapRect} from '../content/world.js';
import {GROUND_DEPTH} from './SpellRibbons';

export function riverSurface(map:THREE.Texture,color:number,horizontal:boolean){
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms:{
      surface:{value:map},
      flowTime:{value:0},
      current:{value:new THREE.Vector2(horizontal?1:0,horizontal?0:1)},
      tint:{value:new THREE.Color(0xffffff).lerp(new THREE.Color(color),.22)},
      shallows:{value:new THREE.Color(0x537c63)},
      silt:{value:new THREE.Color(0x696449)}
    },
    vertexShader:`
      attribute vec4 bankDistances;
      varying vec4 vBank;
      varying vec2 vPosition;
      void main(){
        vec4 worldPosition=modelMatrix*vec4(position,1.);
        vPosition=vec2(worldPosition.x,worldPosition.z/${GROUND_DEPTH});
        vBank=bankDistances;
        gl_Position=projectionMatrix*viewMatrix*worldPosition;
      }
    `,
    fragmentShader:`
      uniform sampler2D surface;
      uniform float flowTime;
      uniform vec2 current;
      uniform vec3 tint,shallows,silt;
      varying vec4 vBank;
      varying vec2 vPosition;
      float bankWobble(float along){
        return sin(along*.056)*3.6+sin(along*.141)*1.8+sin(along*.026)*4.;
      }
      void main(){
        vec2 across=vec2(-current.y,current.x);
        vec2 course=vec2(dot(vPosition,current),dot(vPosition,across));
        vec2 uv=course/530.;
        float eddy=sin(course.y*.019+flowTime*.65)*.028;
        float drift=sin(course.x*.011-flowTime*.8)*.018;
        vec3 water=texture2D(surface,uv+vec2(eddy-flowTime*.093,drift)).rgb;
        vec3 ripples=texture2D(surface,uv*1.67+vec2(.41-flowTime*.245,.63-drift)).rgb;
        vec3 color=mix(water,ripples,.26)*tint*1.18;

        float bankX=min(vBank.x,vBank.y)+bankWobble(vPosition.y);
        float bankY=min(vBank.z,vBank.w)+bankWobble(vPosition.x);
        float alongBank=bankX<bankY?vPosition.y:vPosition.x;
        float edge=min(bankX,bankY);
        if(edge<1.)discard;
        float wash=1.-smoothstep(4.,32.,edge);
        float streak=smoothstep(.25,.9,sin(alongBank*.028-flowTime*1.8)+ripples.g*3.);
        color=mix(color,shallows,wash*(.28+.42*streak));
        color=mix(color,silt,1.-smoothstep(1.,8.,edge));
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }
    `
  });
}

export function channelUnderBridge(bridge:MapRect,alongX:boolean,waters:MapRect[]):MapRect[]{
  // Navigation cuts a gap for the deck. Connect the banks beneath it for rendering.
  const [cross,size,run,length]=alongX?(['x','w','y','h'] as const):(['y','h','x','w'] as const);
  const across=waters.filter(water=>water[cross]<bridge[cross]+bridge[size]&&water[cross]+water[size]>bridge[cross]);
  const near=across.find(water=>water[run]+water[length]===bridge[run]);
  const far=across.find(water=>water[run]===bridge[run]+bridge[length]);
  if(!near||!far)return [];
  const half=bridge[length]/2;
  return [near,far].map((bank,i)=>{
    const start=Math.max(bridge[cross],bank[cross]);
    const end=Math.min(bridge[cross]+bridge[size],bank[cross]+bank[size]);
    return {...bridge,[cross]:start,[size]:end-start,[run]:bridge[run]+i*half,[length]:half};
  });
}

export function riverPatch(water:MapRect,waters:MapRect[],material:THREE.ShaderMaterial){
  const {x,y,w,h}=water;
  // Leave connected water and the edge of the map open so the current can continue across them.
  const touchesWater=(px:number,py:number,width:number,height:number)=>waters.some(other=>
    other!==water&&px<other.x+other.w&&px+width>other.x&&py<other.y+other.h&&py+height>other.y
  );
  const left=x>-HALF&&!touchesWater(x-1,y,1,h);
  const right=x+w<HALF&&!touchesWater(x+w,y,1,h);
  const top=y>-HALF&&!touchesWater(x,y-1,w,1);
  const bottom=y+h<HALF&&!touchesWater(x,y+h,w,1);
  const geometry=new THREE.PlaneGeometry(w,h*GROUND_DEPTH).rotateX(-Math.PI/2);
  const uv=geometry.getAttribute('uv'),banks=[];
  const noBank=10000;
  for(let i=0;i<uv.count;i++){
    const dx=uv.getX(i)*w,dy=(1-uv.getY(i))*h;
    banks.push(left?dx:noBank,right?w-dx:noBank,top?dy:noBank,bottom?h-dy:noBank);
  }
  geometry.setAttribute('bankDistances',new THREE.Float32BufferAttribute(banks,4));
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x+w/2,3.5,(y+h/2)*GROUND_DEPTH);
  return mesh;
}
