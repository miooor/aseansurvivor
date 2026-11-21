import * as THREE from 'three';
import {STAGE_SCENES} from '../content/stage-scenes';
import type {World} from '../content/world.js';
import type {SceneryActor} from './ScenerySprites';
import {GROUND_DEPTH} from './SpellRibbons';

const AMBER=0xf5aa52;

function hazeTexture(){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d')!;
  const haze=ctx.createRadialGradient(32,32,0,32,32,31);
  haze.addColorStop(0,'rgba(255,255,255,1)');
  haze.addColorStop(.37,'rgba(255,255,255,.46)');
  haze.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=haze;ctx.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(canvas);
}

export class StageAtmosphere{
  readonly group=new THREE.Group();
  private pennants:THREE.Mesh[]=[];
  private mist:{sprite:THREE.Sprite;x:number;y:number;z:number;phase:number}[]=[];
  private lamps:{sprite:THREE.Sprite;phase:number}[]=[];
  private haze=hazeTexture();

  constructor(world:World,scenery:readonly SceneryActor[]){
    this.group.name='stage-atmosphere';
    const wood=new THREE.MeshStandardMaterial({color:0x73553a});
    const cable=new THREE.MeshStandardMaterial({color:0x8e795a});
    const cloth=new Map<number,THREE.MeshStandardMaterial>();
    for(const scene of STAGE_SCENES[world.id]){
      if(!scene.flags||!scene.palette?.length)continue;
      const [ax,ay,bx,by]=scene.flags;
      const startX=scene.x+ax,startY=scene.y+ay,endX=scene.x+bx,endY=scene.y+by;
      const span=Math.hypot(endX-startX,endY-startY);
      const sag=Math.min(27,span*.073);
      const a=new THREE.Vector3(startX,118+world.elevationAt(startX,startY),startY*GROUND_DEPTH);
      const b=new THREE.Vector3(endX,118+world.elevationAt(endX,endY),endY*GROUND_DEPTH);
      const anchor=(t:number)=>a.clone().lerp(b,t).add(new THREE.Vector3(0,-Math.sin(Math.PI*t)*sag,0));
      const curve=new THREE.CatmullRomCurve3(Array.from({length:13},(_,i)=>anchor(i/12)));
      this.group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.85,4),cable));
      for(const end of [a,b]){
        const post=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3.6,124,6),wood);
        post.position.copy(end).y-=58;
        this.group.add(post);
      }
      const count=Math.max(4,Math.floor(span/27));
      for(let i=0;i<count;i++){
        const color=scene.palette[i%scene.palette.length];
        if(!cloth.has(color))cloth.set(color,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide}));
        const points=new THREE.BufferGeometry();
        points.setAttribute('position',new THREE.Float32BufferAttribute([-7,0,0,8,0,0,2,-17,2],3));
        points.computeVertexNormals();
        const flag=new THREE.Mesh(points,cloth.get(color));
        flag.position.copy(anchor((i+.5)/count));
        this.pennants.push(flag);this.group.add(flag);
      }
    }
    if(!this.pennants.length){wood.dispose();cable.dispose()}

    for(const actor of scenery){
      if(!actor.emitter)continue;
      const base=world.elevationAt(actor.x,actor.y),z=actor.y*GROUND_DEPTH;
      if(actor.emitter==='lantern'){
        const sprite=new THREE.Sprite(new THREE.SpriteMaterial({
          map:this.haze,color:AMBER,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
        }));
        sprite.renderOrder=22;
        sprite.position.set(actor.x+actor.width*.31,base+actor.height*.71*GROUND_DEPTH,z+24);
        sprite.scale.setScalar(actor.width*.37);
        this.group.add(sprite);
        this.lamps.push({sprite,phase:actor.x*.043});
      }else{
        for(let n=0;n<3;n++){
          const sprite=new THREE.Sprite(new THREE.SpriteMaterial({
            map:this.haze,color:0xe0dac0,transparent:true,depthWrite:false
          }));
          sprite.renderOrder=22;
          this.group.add(sprite);
          this.mist.push({sprite,x:actor.x+actor.width*.10,y:base+actor.height*.56*GROUND_DEPTH,
            z:z+25,phase:(n/3+Math.abs(actor.x)*.002)%1});
        }
      }
    }
  }

  draw(time:number,reduced:boolean,raid:boolean){
    this.group.visible=!raid;
    if(raid)return;
    const t=reduced?0:time;
    for(const [index,flag] of this.pennants.entries()){
      flag.rotation.x=.25+.39*Math.sin(t*2.1+index*.47);
      flag.rotation.y=.20*Math.cos(t*1.7+index*.58);
      flag.rotation.z=.13*Math.sin(t*1.4+index*.25);
    }
    for(const {sprite,phase} of this.lamps)sprite.material.opacity=.31+.055*Math.sin(phase+t*1.8);
    for(const {sprite,x,y,z,phase} of this.mist){
      const step=(t*.34+phase)%1;
      sprite.position.set(x+24*step*step,y+step*67,z);
      sprite.scale.set(12+step*39,18+step*33,1);
      sprite.material.opacity=.22*Math.sin(Math.PI*step);
    }
  }

  dispose(){
    this.group.removeFromParent();
    const materials=new Set<THREE.Material>();
    this.group.traverse(object=>{
      if(object instanceof THREE.Mesh)object.geometry.dispose();
      if(object instanceof THREE.Mesh||object instanceof THREE.Sprite)materials.add(object.material);
    });
    for(const material of materials)material.dispose();
    this.haze.dispose();
  }
}
