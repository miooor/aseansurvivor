import * as THREE from 'three';

export const GROUND_DEPTH=Math.SQRT2;
export type Knot=[x:number,y:number,height:number];

// Tactical strokes and the missing-sheet fallback use a muted core and a soft edge.
// All active spells share one geometry upload and one transparent draw call.
export class SpellRibbons{
  private capacity=8192;
  private used=0;
  private positions=new Float32Array(this.capacity*3);
  private colours=new Float32Array(this.capacity*4);
  private profile=new Float32Array(this.capacity*2);
  private geometry=new THREE.BufferGeometry();
  private material=new THREE.ShaderMaterial({
    transparent:true,forceSinglePass:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,
    vertexShader:`attribute vec4 tint;attribute vec2 profile;varying vec4 vTint;varying vec2 vProfile;
      void main(){vTint=tint;vProfile=profile;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec4 vTint;varying vec2 vProfile;
      void main(){float e=length(vProfile);float body=1.-smoothstep(.24,.98,e);
        vec3 c=mix(vTint.rgb*.65,vTint.rgb,body);
        c=mix(c,vec3(.72,.63,.46),.18*(1.-smoothstep(.04,.32,e)));
        gl_FragColor=vec4(c,vTint.a*body*.68);
        #include <colorspace_fragment>
      }`
  });
  readonly mesh=new THREE.Mesh(this.geometry,this.material);
  private colour=new THREE.Color();
  constructor(){this.bind();this.mesh.frustumCulled=false;this.mesh.renderOrder=50}
  private bind(){
    this.geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('tint',new THREE.BufferAttribute(this.colours,4).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('profile',new THREE.BufferAttribute(this.profile,2).setUsage(THREE.DynamicDrawUsage));
  }
  begin(){this.used=0}
  finish(){
    this.mesh.visible=this.used>0;
    this.geometry.setDrawRange(0,this.used);
    if(!this.used)return;
    for(const attr of Object.values(this.geometry.attributes)){
      if(attr instanceof THREE.BufferAttribute){
        attr.clearUpdateRanges();attr.addUpdateRange(0,this.used*attr.itemSize);attr.needsUpdate=true;
      }
    }
  }
  private reserve(extra:number){
    if(this.used+extra>this.capacity){
      while(this.used+extra>this.capacity)this.capacity*=2;
      const p=new Float32Array(this.capacity*3),c=new Float32Array(this.capacity*4),e=new Float32Array(this.capacity*2);
      p.set(this.positions);c.set(this.colours);e.set(this.profile);
      this.geometry.dispose();this.positions=p;this.colours=c;this.profile=e;this.bind();
    }
  }
  glow([x,y,h]:Knot,r:number,c:number,alpha:number){
    if(r<=0||alpha<=0)return;
    this.reserve(6);this.colour.setHex(c);
    for(const corner of [0,1,2,2,1,3]){
      const u=(corner%2)*2-1,v=Math.floor(corner/2)*2-1,i=this.used++;
      this.positions[i*3]=x+u*r;this.positions[i*3+1]=h+8;
      this.positions[i*3+2]=(y+v*r)*GROUND_DEPTH;
      this.colour.toArray(this.colours,i*4);this.colours[i*4+3]=alpha;
      this.profile[i*2]=u;this.profile[i*2+1]=v;
    }
  }
  facet(points:[Knot,Knot,Knot],colour:number,alpha:number){
    this.reserve(3);
    this.colour.setHex(colour);
    for(const [x,y,height] of points){
      const i=this.used++;
      this.positions.set([x,height+8,y*GROUND_DEPTH],i*3);
      this.colour.toArray(this.colours,i*4);
      this.colours[i*4+3]=alpha;
      // Sample the coloured body of the ribbon shader across the face.
      this.profile[i*2]=.36;
      this.profile[i*2+1]=0;
    }
  }
  strip(points:Knot[],width:number,colour:number,alpha:number,taper=true){
    const count=points.length;
    if(count<2||alpha<=0)return;
    this.reserve(6*(count-1));
    this.colour.setHex(colour);
    let lastX=0,lastY=0;
    const vertex=(point:Knot,nx:number,ny:number,edge:number)=>{
      const i=this.used++;
      this.positions[i*3]=point[0]+nx*edge;
      this.positions[i*3+1]=point[2]+8;
      this.positions[i*3+2]=(point[1]+ny*edge)*GROUND_DEPTH;
      this.colours[i*4]=this.colour.r;this.colours[i*4+1]=this.colour.g;this.colours[i*4+2]=this.colour.b;
      this.colours[i*4+3]=alpha;this.profile[i*2]=edge;this.profile[i*2+1]=0;
    };
    for(let i=0;i<count;i++){
      const before=points[Math.max(0,i-1)],after=points[Math.min(count-1,i+1)];
      const dx=after[0]-before[0],dy=after[1]-before[1]-(after[2]-before[2])/GROUND_DEPTH;
      const r=width*(taper?.06+.94*Math.sin(Math.PI*i/(count-1)):1)/(Math.hypot(dx,dy)||1);
      const nx=-dy*r,ny=dx*r;
      if(i){
        const a=points[i-1],b=points[i];
        vertex(a,lastX,lastY,-1);vertex(a,lastX,lastY,1);vertex(b,nx,ny,-1);
        vertex(b,nx,ny,-1);vertex(a,lastX,lastY,1);vertex(b,nx,ny,1);
      }
      lastX=nx;lastY=ny;
    }
  }
  dispose(){this.geometry.dispose();this.material.dispose()}
}
