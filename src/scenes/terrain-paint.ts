import * as THREE from 'three';

export function materialTile(sheet:HTMLImageElement,index:number,grid:number){
  const width=Math.floor(sheet.width/grid),height=Math.floor(sheet.height/grid),trim=6;
  const tile=document.createElement('canvas');
  tile.width=width-trim*2;tile.height=height-trim*2;
  tile.getContext('2d')!.drawImage(sheet,index%grid*width+trim,Math.floor(index/grid)*height+trim,
    tile.width,tile.height,0,0,tile.width,tile.height);
  return tile;
}

export function groundMaterial(map:THREE.Texture){
  const material=new THREE.MeshBasicMaterial({map});
  // A low-frequency, world-space wash varies the repeated paint without edge seams.
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
      #include <map_fragment>
      vec2 tile = vMapUv;
      float wash = .5 + .25*sin(tile.x * 1.2 + tile.y * .78)
                     + .25*cos(tile.y * 1.1 - tile.x * .51);
      diffuseColor.rgb *= mix(.84, 1.04, wash);
    `);
  };
  return material;
}

export function citySurface(kind:'asphalt'|'concrete'){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d')!;
  const grain=ctx.createImageData(256,256);
  const concrete=kind==='concrete';
  let noise=0x34c0f1;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    noise=(Math.imul(noise,1664525)+1013904223)>>>0;
    const speck=(noise>>>24)/255-.5;
    const slab=(x>>6)+(y>>6)*4;
    const seam=concrete&&(x%64<2||y%64<2);
    const shade=concrete?125+((slab*73)%19-9)-(seam?26:0):71;
    const mottling=Math.cos(x*Math.PI/64)*Math.sin(y*Math.PI/128)*4;
    const value=shade+mottling+speck*(concrete?13:25),i=(y*256+x)*4;
    grain.data[i]=value;
    grain.data[i+1]=value+(concrete?3:4);
    grain.data[i+2]=value+(concrete?8:13);
    grain.data[i+3]=255;
  }
  ctx.putImageData(grain,0,0);
  return canvas;
}

function fade(geometry:THREE.BufferGeometry,sample:(x:number,y:number)=>number){
  const pos=geometry.getAttribute('position');
  const ink=new Float32Array(pos.count*4);
  for(let i=0;i<pos.count;i++){
    ink[i*4]=ink[i*4+1]=ink[i*4+2]=1;
    ink[i*4+3]=sample(pos.getX(i),pos.getY(i));
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(ink,4));
  return geometry;
}

export function paintedTrail(length:number,width:number,edge=.78){
  const strip=new THREE.PlaneGeometry(length,width,1,4);
  const pos=strip.getAttribute('position');
  for(let i=0;i<pos.count;i++){
    const y=pos.getY(i);
    if(Math.abs(y)<width/2)pos.setY(i,y*edge*2);
  }
  return fade(strip,(_x,y)=>Math.abs(y)>=width/2-.001?0:1);
}

export function paintedClearing(width:number,depth:number){
  const surface=new THREE.RingGeometry(0,1,40,6);
  return fade(surface,(x,y)=>1-THREE.MathUtils.smoothstep(Math.hypot(x,y),.82,1)).scale(width,depth,1);
}
