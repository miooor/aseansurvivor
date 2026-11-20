import * as THREE from 'three';
import type {Actor} from './SpriteAssets';
import {GROUND_DEPTH} from './SpellRibbons';


// Both passes use exactly the same frame, trim, pivot and rotation. For the
// shadow pass the upright cutout is projected onto the ground along the sun.
const vertex=`
  attribute vec4 pose, dimensions, frameRect, ink;
  attribute vec3 style;
  uniform vec3 lightDirection;
  varying vec2 atlasUV;
  varying vec4 crop, tint;
  varying float fill, airborne;
  void main(){
    vec2 p=(uv-vec2(dimensions.z,1.-dimensions.w))*dimensions.xy;
    float a=-style.x;
    p=mat2(cos(a),sin(a),-sin(a),cos(a))*p;
    vec3 foot=vec3(pose.x,0.,pose.y*${GROUND_DEPTH});
    #ifdef SILHOUETTE
      float height=(pose.z+p.y)*${GROUND_DEPTH};
      // Lift the receiver slightly above paving, keeping its screen position.
      vec3 projected=foot+vec3(p.x,0.,0.)-vec3(lightDirection.x,0.,lightDirection.z)*height/lightDirection.y;
      vec4 mv=modelViewMatrix*vec4(projected,1.);
      mv.z+=20.;
    #else
      vec4 mv=modelViewMatrix*vec4(foot,1.);
      mv.xy+=vec2(p.x,p.y+pose.z);
      mv.z+=24.;
    #endif
    gl_Position=projectionMatrix*mv;
    vec2 cropUV=vec2(style.z>0.5?1.-uv.x:uv.x,uv.y);
    atlasUV=frameRect.xy+cropUV*frameRect.zw;crop=frameRect;tint=ink;fill=style.y;airborne=pose.z;
    #ifdef SILHOUETTE
      tint.a*=pose.w;
    #endif
  }`;
const fragment=`
  uniform sampler2D atlas;
  uniform vec2 texel;
  varying vec2 atlasUV;
  varying vec4 crop,tint;
  varying float fill,airborne;
  vec2 clipped(vec2 p){return clamp(p,crop.xy+.5*texel,crop.xy+crop.zw-.5*texel);}
  void main(){
    #ifdef SILHOUETTE
      vec2 d=texel*(1.25+min(airborne*.055,4.));
      float mask=.4*texture2D(atlas,clipped(atlasUV)).a;
      mask+=.15*(texture2D(atlas,clipped(atlasUV+d)).a+texture2D(atlas,clipped(atlasUV-d)).a+
        texture2D(atlas,clipped(atlasUV+vec2(d.x,-d.y))).a+texture2D(atlas,clipped(atlasUV+vec2(-d.x,d.y))).a);
      gl_FragColor=vec4(.021,.028,.032,mask*tint.a*.36/(1.+airborne*.007));
    #else
      vec4 pixel=texture2D(atlas,clipped(atlasUV));
      gl_FragColor=vec4(mix(pixel.rgb*tint.rgb,tint.rgb,fill),pixel.a*tint.a);
    #endif
    if(gl_FragColor.a<.025)discard;
    #include <colorspace_fragment>
  }`;

class ActorSheet{
  readonly geometry=new THREE.InstancedBufferGeometry();
  readonly body:THREE.Mesh;
  readonly shadow:THREE.Mesh;
  private capacity=16;
  private colour=new THREE.Color();
  constructor(private atlas:THREE.Texture<HTMLImageElement|HTMLCanvasElement>,light:THREE.Vector3){
    const quad=new THREE.PlaneGeometry(1,1);
    this.geometry.setIndex(quad.index);
    this.geometry.setAttribute('position',quad.getAttribute('position'));
    this.geometry.setAttribute('uv',quad.getAttribute('uv'));
    this.allocate();
    const material=(shadow:boolean)=>new THREE.ShaderMaterial({
      defines:shadow?{SILHOUETTE:1}:{},vertexShader:vertex,fragmentShader:fragment,
      uniforms:{atlas:{value:atlas},lightDirection:{value:light},texel:{value:new THREE.Vector2(1/atlas.image.width,1/atlas.image.height)}},
      transparent:true,depthWrite:!shadow,side:THREE.DoubleSide,forceSinglePass:true
    });
    this.body=new THREE.Mesh(this.geometry,material(false));this.shadow=new THREE.Mesh(this.geometry,material(true));
    this.body.frustumCulled=this.shadow.frustumCulled=false;
    this.shadow.renderOrder=3;this.body.renderOrder=20;
  }
  private allocate(){
    for(const [name,size] of Object.entries({pose:4,dimensions:4,frameRect:4,ink:4,style:3})){
      const buffer=new Float32Array(this.capacity*size),old=this.geometry.getAttribute(name);
      if(old)buffer.set(old.array);
      this.geometry.setAttribute(name,new THREE.InstancedBufferAttribute(buffer,size).setUsage(THREE.DynamicDrawUsage));
    }
  }
  add(image:Actor,footY:number,casts:boolean){
    const i=this.geometry.instanceCount++;
    if(i===this.capacity){this.capacity*=2;this.geometry.dispose();this.allocate()}
    const f=image.frame,w=this.atlas.image.width,h=this.atlas.image.height;
    this.geometry.getAttribute('pose').setXYZW(i,image.x,footY,footY-image.y,casts?1:0);
    this.geometry.getAttribute('dimensions').setXYZW(i,image.width,image.height,.5,image.originY);
    this.geometry.getAttribute('frameRect').setXYZW(i,f.x/w,1-(f.y+f.height)/h,f.width/w,f.height/h);
    this.colour.setHex(image.tint);
    this.geometry.getAttribute('ink').setXYZW(i,this.colour.r,this.colour.g,this.colour.b,image.alpha);
    this.geometry.getAttribute('style').setXYZ(i,image.rotation,image.flash?1:0,image.flipX?1:0);
  }
  finish(){
    const count=this.geometry.instanceCount;
    this.body.visible=this.shadow.visible=count>0;
    if(!count)return;
    for(const attr of Object.values(this.geometry.attributes)){
      if(attr instanceof THREE.InstancedBufferAttribute){
        attr.clearUpdateRanges();attr.addUpdateRange(0,count*attr.itemSize);attr.needsUpdate=true;
      }
    }
  }
  dispose(){
    this.geometry.dispose();(this.body.material as THREE.Material).dispose();
    (this.shadow.material as THREE.Material).dispose();this.atlas.dispose();
  }
}

export class AtlasActors{
  readonly group=new THREE.Group();
  private sheets=new Map<string,ActorSheet>();
  constructor(private light:THREE.Vector3){}
  begin(){for(const sheet of this.sheets.values())sheet.geometry.instanceCount=0}
  add(image:Actor,footY:number,casts:boolean){
    if(image.alpha<=0)return;
    const key=image.key;
    let sheet=this.sheets.get(key);
    if(!sheet){
      const texture=new THREE.Texture(image.frame.image);
      texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
      texture.generateMipmaps=false;texture.needsUpdate=true;
      sheet=new ActorSheet(texture,this.light);sheet.geometry.instanceCount=0;
      this.sheets.set(key,sheet);this.group.add(sheet.shadow,sheet.body);
    }
    sheet.add(image,footY,casts);
  }
  finish(){for(const sheet of this.sheets.values())sheet.finish()}
  release(key:string){
    const sheet=this.sheets.get(key);
    if(!sheet)return;
    this.group.remove(sheet.body,sheet.shadow);sheet.dispose();this.sheets.delete(key);
  }
  destroy(){for(const sheet of this.sheets.values())sheet.dispose();this.sheets.clear();this.group.clear()}
}
