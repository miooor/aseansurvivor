import * as THREE from 'three';
import type {Point} from '../game/runtime.js';
import {GROUND_DEPTH} from './SpellRibbons';

// Ground markings share a single draw call per layer. Coordinates match the
// simulation plane, even with the camera tilted at 45 degrees.
export class BattleMarks {
  private positions:number[]=[];
  private colours:number[]=[];
  private path:Point[]=[];
  private fill=new THREE.Color();
  private stroke=new THREE.Color();
  private fillAlpha=1;
  private strokeAlpha=1;
  private weight=1;
  private geometry=new THREE.BufferGeometry();
  private material=new THREE.MeshBasicMaterial({
    vertexColors:true,transparent:true,side:THREE.DoubleSide,depthWrite:false
  });
  readonly mesh=new THREE.Mesh(this.geometry,this.material);
  constructor(private height:number,order:number){
    this.mesh.frustumCulled=false;this.mesh.renderOrder=order;
  }
  clear(){this.positions.length=0;this.colours.length=0}
  fillStyle(color:number,alpha=1){this.fill.setHex(color);this.fillAlpha=alpha;return this}
  lineStyle(width:number,color:number,alpha=1){this.weight=width;this.stroke.setHex(color);this.strokeAlpha=alpha;return this}
  private triangle(a:Point,b:Point,c:Point,color:THREE.Color,alpha:number){
    if(alpha<=0)return;
    for(const {x,y} of [a,b,c]){
      this.positions.push(x,this.height,y*GROUND_DEPTH+this.height);this.colours.push(color.r,color.g,color.b,Math.min(alpha,1));
    }
  }
  private segment(a:Point,b:Point){
    const dx=b.x-a.x,dy=b.y-a.y,scale=this.weight/(2*(Math.hypot(dx,dy)||1));
    const x=-dy*scale,y=dx*scale;
    const aa={x:a.x+x,y:a.y+y},ab={x:a.x-x,y:a.y-y},ba={x:b.x+x,y:b.y+y},bb={x:b.x-x,y:b.y-y};
    this.triangle(aa,ab,ba,this.stroke,this.strokeAlpha);this.triangle(ab,bb,ba,this.stroke,this.strokeAlpha);
  }
  lineBetween(x:number,y:number,tx:number,ty:number){this.segment({x,y},{x:tx,y:ty});return this}
  fillRect(x:number,y:number,width:number,height:number){
    return this.fillPoints([{x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}]);
  }
  strokeRect(x:number,y:number,width:number,height:number){
    return this.beginPath().moveTo(x,y).lineTo(x+width,y).lineTo(x+width,y+height).lineTo(x,y+height).closePath().strokePath();
  }
  fillTriangle(x:number,y:number,tx:number,ty:number,bx:number,by:number){
    return this.fillPoints([{x,y},{x:tx,y:ty},{x:bx,y:by}]);
  }
  strokeTriangle(x:number,y:number,tx:number,ty:number,bx:number,by:number){
    return this.beginPath().moveTo(x,y).lineTo(tx,ty).lineTo(bx,by).closePath().strokePath();
  }
  fillPoints(points:Point[]){
    for(let i=2;i<points.length;i++)this.triangle(points[0],points[i-1],points[i],this.fill,this.fillAlpha);
    return this;
  }
  fillCircle(x:number,y:number,r:number){return this.beginPath().moveTo(x,y).arc(x,y,r,0,Math.PI*2).fillPath()}
  fillRing(x:number,y:number,outer:number,inner:number){
    const segments=48;
    let a={x:x+inner,y},b={x:x+outer,y};
    for(let i=1;i<=segments;i++){
      const angle=i*Math.PI*2/segments,dx=Math.cos(angle),dy=Math.sin(angle);
      const c={x:x+dx*outer,y:y+dy*outer},d={x:x+dx*inner,y:y+dy*inner};
      this.fillPoints([a,b,c,d]);
      a=d;b=c;
    }
    return this;
  }
  strokeCircle(x:number,y:number,r:number){return this.beginPath().arc(x,y,r,0,Math.PI*2).strokePath()}
  beginPath(){this.path=[];return this}
  moveTo(x:number,y:number){return this.lineTo(x,y)}
  lineTo(x:number,y:number){this.path.push({x,y});return this}
  closePath(){if(this.path.length)this.path.push(this.path[0]);return this}
  arc(x:number,y:number,r:number,from:number,to:number,_reverse=false){
    const segments=Math.max(4,Math.ceil(Math.abs(to-from)*Math.min(9,2+r/20)));
    for(let i=0;i<=segments;i++){
      const a=from+(to-from)*i/segments;
      this.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
    }
    return this;
  }
  fillPath(){return this.fillPoints(this.path)}
  strokePath(){for(let i=1;i<this.path.length;i++)this.segment(this.path[i-1],this.path[i]);return this}
  finish(){
    const count=this.positions.length/3;
    this.geometry.setDrawRange(0,count);
    this.mesh.visible=count>0;
    if(!count)return;
    const capacity=this.geometry.getAttribute('position')?.count??0;
    if(count>capacity){
      this.geometry.dispose();
      const size=2**Math.ceil(Math.log2(count));
      for(const [name,stride] of [['position',3],['color',4]] as const){
        this.geometry.setAttribute(name,new THREE.BufferAttribute(new Float32Array(size*stride),stride).setUsage(THREE.DynamicDrawUsage));
      }
    }
    for(const [name,data] of [['position',this.positions],['color',this.colours]] as const){
      const attr=this.geometry.getAttribute(name) as THREE.BufferAttribute;
      (attr.array as Float32Array).set(data);
      attr.clearUpdateRanges();attr.addUpdateRange(0,data.length);attr.needsUpdate=true;
    }
  }
  dispose(){this.geometry.dispose();this.material.dispose()}
}
