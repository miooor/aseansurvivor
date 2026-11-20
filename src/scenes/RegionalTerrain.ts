import * as THREE from 'three';
import {regionSide,type AtlasRegion} from './atlas-regions';

// A 12° square in atlas coordinates, split into nine independently culled tiles.
const SIDE=384, TILE=128, STRIDE=SIDE+1, STEP=regionSide/SIDE;
const xOf=(id:number)=>id%STRIDE;
const zOf=(id:number)=>Math.floor(id/STRIDE);

export class RegionalTerrain {
  readonly group=new THREE.Group();
  private heights=new Uint8Array(STRIDE*STRIDE);
  private roots:number[]=[];
  private rightChild:Int32Array;

  static async load(region:AtlasRegion,signal:AbortSignal){
    const [height,relief]=await Promise.all([fetch(region.heights,{signal}),fetch(region.relief,{signal})]);
    if(!height.ok||!relief.ok)throw new Error('Regional terrain unavailable');
    const [bytes,blob]=await Promise.all([height.arrayBuffer(),relief.blob()]);
    const image=await createImageBitmap(blob,{imageOrientation:'flipY'});
    if(signal.aborted){image.close();throw signal.reason}
    const map=new THREE.Texture(image);
    map.colorSpace=THREE.SRGBColorSpace;map.needsUpdate=true;
    map.addEventListener('dispose',()=>image.close());
    return new RegionalTerrain(region.west-110,9-region.north,new Uint8Array(bytes),map);
  }

  private constructor(private west:number,private north:number,private splits:Uint8Array,map:THREE.Texture){
    this.rightChild=new Int32Array(splits.length);
    const material=new THREE.MeshLambertMaterial({map});
    let cursor=0;
    for(let z=0;z<SIDE;z+=TILE)for(let x=0;x<SIDE;x+=TILE){
      const position:number[]=[],uv:number[]=[],indices:number[]=[];
      const vertices=new Map<number,number>();
      const index=(id:number)=>{
        const existing=vertices.get(id);
        if(existing!==undefined)return existing;
        const i=vertices.size,gx=xOf(id),gz=zOf(id);
        vertices.set(id,i);
        position.push(this.west+gx*STEP,this.heights[id]*.011,this.north+gz*STEP);
        uv.push(gx/SIDE,1-gz/SIDE);
        return i;
      };
      const decode=(a:number,b:number,c:number,span:number)=>{
        // Quarter the area every two splits. Unit triangles have no stream entry.
        if(span>1){
          const node=cursor++,encoded=splits[node];
          if(encoded){
            const m=(a+b)/2;
            this.heights[m]=encoded-1;
            decode(c,a,m,span/2);
            this.rightChild[node]=cursor;
            decode(b,c,m,span/2);
            return;
          }
        }
        indices.push(index(a),index(c),index(b));
      };
      const nw=z*STRIDE+x,ne=nw+TILE,sw=nw+TILE*STRIDE,se=sw+TILE;
      for(const [a,b,c] of [[ne,sw,nw],[sw,ne,se]]){
        for(const id of [a,b,c])this.heights[id]=splits[cursor++];
        this.roots.push(cursor);
        decode(a,b,c,TILE*TILE);
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.Float32BufferAttribute(position,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();geo.computeBoundingBox();
      this.group.add(new THREE.Mesh(geo,material));
    }
    if(cursor!==splits.length)throw new Error('Invalid regional terrain');
  }

  elevation(x:number,z:number){
    x=(x-this.west)/STEP;z=(z-this.north)/STEP;
    if(x<0||z<0||x>=SIDE||z>=SIDE)return undefined;
    const tx=Math.floor(x/TILE),tz=Math.floor(z/TILE);
    const nw=tz*TILE*STRIDE+tx*TILE,ne=nw+TILE,sw=nw+TILE*STRIDE;
    const lower=x-tx*TILE+z-tz*TILE>TILE;
    let a=lower?sw:ne,b=lower?ne:sw,c=lower?sw+TILE:nw;
    let node=this.roots[2*(tz*3+tx)+Number(lower)];
    for(let span=TILE*TILE;span>1&&this.splits[node];span/=2){
      const m=(a+b)/2,cx=xOf(c),cz=zOf(c);
      if((xOf(m)-cx)*(z-cz)-(zOf(m)-cz)*(x-cx)<=0){
        b=a;a=c;node++;
      }else{a=b;b=c;node=this.rightChild[node]}
      c=m;
    }
    const ax=xOf(a)-xOf(c),az=zOf(a)-zOf(c),bx=xOf(b)-xOf(c),bz=zOf(b)-zOf(c);
    const dx=x-xOf(c),dz=z-zOf(c),area=ax*bz-az*bx;
    return .011*(this.heights[c]+((dx*bz-dz*bx)*(this.heights[a]-this.heights[c])+
      (ax*dz-az*dx)*(this.heights[b]-this.heights[c]))/area);
  }
}
