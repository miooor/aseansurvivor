import * as THREE from 'three';
import type {Actor} from './SpriteAssets';
import {GROUND_DEPTH} from './SpellRibbons';
import {HALF} from '../content/world.js';
import {ELEVATION_SPACING,ELEVATION_STRIDE} from '../content/regional-landforms.js';


// Both passes use exactly the same frame, trim, pivot and rotation. For the
// shadow pass the upright cutout is projected onto the ground along the sun.
const vertex=`
  attribute vec4 pose, dimensions, frameRect, ink;
  attribute vec4 style;
  uniform vec3 lightDirection;
  uniform sampler2D heightMap;
  varying vec2 atlasUV;
  varying vec4 crop, tint;
  varying float fill, airborne;
  float elevation(vec2 point){
    vec2 grid=(vec2(point.x,point.y/${GROUND_DEPTH})+${HALF.toFixed(1)})/${ELEVATION_SPACING.toFixed(1)};
    if(any(lessThan(grid,vec2(0.)))||any(greaterThanEqual(grid,vec2(${ELEVATION_STRIDE-1}.))))return 0.;
    ivec2 cell=ivec2(grid);
    vec2 t=fract(grid);
    float right=texelFetch(heightMap,cell+ivec2(1,0),0).r;
    float bottom=texelFetch(heightMap,cell+ivec2(0,1),0).r;
    return t.x+t.y<=1.
      ? texelFetch(heightMap,cell,0).r*(1.-t.x-t.y)+right*t.x+bottom*t.y
      : texelFetch(heightMap,cell+ivec2(1),0).r*(t.x+t.y-1.)+right*(1.-t.y)+bottom*(1.-t.x);
  }
  void main(){
    vec2 p=(uv-vec2(dimensions.z,1.-dimensions.w))*dimensions.xy;
    float a=-style.x;
    p=mat2(cos(a),sin(a),-sin(a),cos(a))*p;
    vec3 foot=vec3(pose.x,0.,pose.y*${GROUND_DEPTH});
    #ifdef SILHOUETTE
      float height=(pose.z+p.y)*${GROUND_DEPTH};
      // Lift the receiver slightly above paving, keeping its screen position.
      vec3 projected=foot+vec3(p.x,0.,0.)-vec3(lightDirection.x,0.,lightDirection.z)*height/lightDirection.y;
      projected.y=elevation(projected.xz);
      vec4 mv=modelViewMatrix*vec4(projected,1.);
      mv.z+=20.;
    #else
      foot.y=elevation(foot.xz);
      vec4 mv=modelViewMatrix*vec4(foot,1.);
      mv.xy+=vec2(p.x,p.y+pose.z);
      mv.z+=24.;
      // Ground paint spans multiple foot depths across its own quad.
      if(style.w>.5){
        vec3 surface=foot+vec3(p.x,0.,-p.y*${GROUND_DEPTH});
        surface.y=elevation(surface.xz);
        mv=modelViewMatrix*vec4(surface,1.);
        mv.z+=17.;
      }
    #endif
    gl_Position=projectionMatrix*mv;
    vec2 cropUV=vec2(style.z>0.5?1.-uv.x:uv.x,uv.y);
    #ifdef SKILL_PAINT
      // Narrow ground lanes use the painted band in the middle of a square cell.
      float lane=style.w*smoothstep(1.8,3.8,dimensions.x/max(1.,dimensions.y));
      cropUV.y=.5+(cropUV.y-.5)*mix(1.,.55,lane);
    #endif
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
      #ifdef SKILL_PAINT
        // Preserve the painted colours with a dark keyline against bright terrain.
        vec2 d=min(3.*texel,max(1.5*texel,fwidth(atlasUV)));
        float edge=max(max(texture2D(atlas,clipped(atlasUV+vec2(d.x,0.))).a,
                           texture2D(atlas,clipped(atlasUV-vec2(d.x,0.))).a),
                       max(texture2D(atlas,clipped(atlasUV+vec2(0.,d.y))).a,
                           texture2D(atlas,clipped(atlasUV-vec2(0.,d.y))).a));
        float outline=.8*edge*(1.-pixel.a);
        float alpha=pixel.a+outline;
        pixel.rgb=(pixel.rgb*1.16*pixel.a+vec3(.027,.017,.024)*outline)/max(.001,alpha);
        pixel.a=alpha;
      #endif
      #ifdef SHADOW_ART
        vec2 p=(atlasUV-crop.xy)/crop.zw*2.-1.;
        float slot=4.-floor(crop.y*5.+.5);
        float phase=floor(crop.x*4.+.5)/3.;
        float cut;
        if(slot<.5){
          cut=abs(p.y)-max(0.,(.94-p.x)*.13)*smoothstep(-.91,-.43,p.x);
          cut=max(cut,max(p.x-.94,-.88-p.x));
        }else if(slot<1.5){
          cut=abs(length(p*vec2(.91,1.25)+vec2(.04,.38))-.77)-.045;
          cut=max(cut,-p.y-.08);
        }else if(slot<2.5){
          cut=abs(abs(p.x*.78-p.y+.13*sin(4.*p.y))-.21)-.036;
        }else if(slot<3.5){
          float arc=fract(atan(p.y,p.x)*.477465-phase*.45);
          float radius=mix(.38,.85,arc);
          cut=max(abs(length(p)-radius)-.085*(1.-arc),.09-arc);
        }else{
          float rake=p.y-.64*p.x+.25*p.x*p.x;
          cut=min(abs(rake),abs(abs(rake)-.34))-.045;
        }
        float envelope=1.-smoothstep(.73,1.,length(p));
        float core=1.-smoothstep(-.012,.035,cut);
        float halo=exp(-8.*max(0.,cut));
        pixel=vec4(mix(vec3(.23,.065,.55),vec3(.88,.8,1.),core),envelope*(.65*halo+.35*core));
      #endif
      #ifdef DAWN_LIGHT
        // The second row carries Cahaya Fajar. Draw its floor wash and hit
        // flashes as translucent streaks of first light along the cast axis.
        if(abs(crop.y-.6)<.001){
          vec2 uv=(atlasUV-crop.xy)/crop.zw;
          float phase=floor(crop.x*4.+.5)/3.;
          float width=mix(.17,.54,uv.x);
          float side=(uv.y-.5)/width;
          float haze=exp(-2.*side*side);
          float envelope=smoothstep(0.,.14,uv.x)*(1.-smoothstep(.68,1.,uv.x));
          float wisps=.5+.5*cos(side*19.+sin(uv.x*7.+phase*2.)*.8);
          float core=pow(wisps,3.)*haze;
          pixel=vec4(mix(vec3(1.,.30,.10),vec3(1.,.96,.65),core),
            envelope*min(1.,.58*haze+.72*core));
        }
      #endif
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
  constructor(private atlas:THREE.Texture<HTMLImageElement|HTMLCanvasElement>,light:THREE.Vector3,
    heightMap:THREE.IUniform<THREE.DataTexture|null>,private effect:boolean,effectKey:string){
    const quad=new THREE.PlaneGeometry(1,1,effect?4:2,effect?4:2);
    this.geometry.setIndex(quad.index);
    this.geometry.setAttribute('position',quad.getAttribute('position'));
    this.geometry.setAttribute('uv',quad.getAttribute('uv'));
    this.allocate();
    const material=(shadow:boolean)=>new THREE.ShaderMaterial({
      defines:shadow?{SILHOUETTE:1}:effect&&effectKey!=='lia-smoke'?(effectKey==='hero-effects-lia'?{SHADOW_ART:1}:effectKey==='hero-effects-ustaz'?{SKILL_PAINT:1,DAWN_LIGHT:1}:{SKILL_PAINT:1}):{},vertexShader:vertex,fragmentShader:fragment,
      uniforms:{atlas:{value:atlas},lightDirection:{value:light},heightMap,texel:{value:new THREE.Vector2(1/atlas.image.width,1/atlas.image.height)}},
      transparent:true,depthWrite:!shadow&&!effect,side:THREE.DoubleSide,forceSinglePass:true
    });
    this.body=new THREE.Mesh(this.geometry,material(false));this.shadow=new THREE.Mesh(this.geometry,material(true));
    this.body.frustumCulled=this.shadow.frustumCulled=false;
    this.shadow.renderOrder=3;this.body.renderOrder=effectKey==='lia-smoke'?19:effect?21:20;
  }
  private allocate(){
    for(const [name,size] of Object.entries({pose:4,dimensions:4,frameRect:4,ink:4,style:4})){
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
    this.geometry.getAttribute('dimensions').setXYZW(i,image.width,image.height,image.originX??.5,image.originY);
    this.geometry.getAttribute('frameRect').setXYZW(i,f.x/w,1-(f.y+f.height)/h,f.width/w,f.height/h);
    this.colour.setHex(image.tint);
    this.geometry.getAttribute('ink').setXYZW(i,this.colour.r,this.colour.g,this.colour.b,image.alpha);
    this.geometry.getAttribute('style').setXYZW(i,image.rotation,image.flash?1:0,image.flipX?1:0,image.ground?1:0);
  }
  finish(){
    const count=this.geometry.instanceCount;
    this.body.visible=count>0;this.shadow.visible=!this.effect&&count>0;
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
  readonly heightMap:THREE.IUniform<THREE.DataTexture|null>={value:null};
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
      sheet=new ActorSheet(texture,this.light,this.heightMap,key.startsWith('hero-effects-')||key==='lia-smoke',key);
      sheet.body.name=key;sheet.geometry.instanceCount=0;
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
