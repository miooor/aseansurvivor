import * as THREE from 'three';
import regions from '../../assets/malaya-boundaries.json';

// The texture spans 99–105°E, 1–7°N. Integer path units are 0.001°.
const WEST=-11,NORTH=2,SPAN=6,UNITS=1000;
const stages:Record<string,string|undefined>={
  'MY-01':'johor','MY-02':'kedah','MY-03':'kelantan','MY-04':'melaka','MY-06':'pahang',
  'MY-07':'penang','MY-08':'perak','MY-10':'selangor','MY-11':'terengganu','MY-14':'kl'
};

export class CampaignBoundaries {
  private canvas=document.createElement('canvas');
  private ctx:CanvasRenderingContext2D;
  private paths=regions.map(({code,path})=>({stage:stages[code],path:new Path2D(path)}));
  private outline=new Path2D();
  private texture:THREE.CanvasTexture;
  private selected?:string;

  constructor(){
    this.canvas.width=this.canvas.height=1024;
    this.ctx=this.canvas.getContext('2d')!;
    this.texture=new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace=THREE.SRGBColorSpace;
    for(const {path} of this.paths)this.outline.addPath(path);
    this.paint();
  }

  select(stage:string|undefined){
    if(this.selected===stage)return;
    this.selected=stage;
    this.paint();
  }

  private paint(){
    const scale=this.canvas.width/(SPAN*UNITS),ctx=this.ctx;
    ctx.save();ctx.scale(scale,scale);
    ctx.clearRect(0,0,SPAN*UNITS,SPAN*UNITS);
    const region=this.selected && this.paths.find(candidate=>candidate.stage===this.selected);
    if(region){
      ctx.fillStyle='rgba(252,193,91,.31)';
      ctx.fill(region.path,'evenodd');
    }
    ctx.strokeStyle='rgba(34,51,43,.60)';ctx.lineWidth=20;ctx.lineJoin='round';
    ctx.stroke(this.outline);
    ctx.strokeStyle='rgba(247,230,186,.77)';ctx.lineWidth=10;
    ctx.stroke(this.outline);
    ctx.restore();
    this.texture.needsUpdate=true;
  }

  stageAt(x:number,z:number){
    const u=(x-WEST)*UNITS,v=(z-NORTH)*UNITS;
    if(u<0||v<0||u>SPAN*UNITS||v>SPAN*UNITS)return;
    return this.paths.find(({path})=>this.ctx.isPointInPath(path,u,v,'evenodd'))?.stage;
  }

  // Both terrain meshes bake atlas x/z into their vertices. Sample on the
  // terrain triangles themselves, so the border cannot float or z-fight.
  apply(material:THREE.MeshLambertMaterial){
    material.onBeforeCompile=shader=>{
      shader.uniforms.adminMap={value:this.texture};
      shader.vertexShader='varying vec2 adminUv;\n'+shader.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
         adminUv=vec2((position.x-(${WEST}.0))/${SPAN}.0,1.0-(position.z-${NORTH}.0)/${SPAN}.0);`);
      shader.fragmentShader='uniform sampler2D adminMap;\nvarying vec2 adminUv;\n'+shader.fragmentShader.replace(
        '#include <map_fragment>',`#include <map_fragment>
         vec4 admin=texture2D(adminMap,adminUv);
         diffuseColor.rgb=mix(diffuseColor.rgb,admin.rgb,admin.a);`);
    };
    material.needsUpdate=true;
  }

  drawFlat(ctx:CanvasRenderingContext2D,project:(p:THREE.Vector3)=>{x:number;y:number}){
    const a=project(new THREE.Vector3(WEST,0,NORTH));
    const b=project(new THREE.Vector3(WEST+SPAN,0,NORTH));
    const c=project(new THREE.Vector3(WEST,0,NORTH+SPAN));
    ctx.save();
    ctx.transform(b.x-a.x,b.y-a.y,c.x-a.x,c.y-a.y,a.x,a.y);
    ctx.drawImage(this.canvas,0,0,1,1);
    ctx.restore();
  }

  dispose(){this.texture.dispose()}
}
