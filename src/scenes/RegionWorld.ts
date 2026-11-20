import * as THREE from 'three';
import type {Actor, SpriteAssets} from './SpriteAssets';
import {buildScenery} from './ScenerySprites';
import {BattleMarks} from './BattleMarks';
import {BattleLabels} from './BattleLabels';
import type {RunState} from '../game/runtime.js';
import {HALF,WORLD_SIZE} from '../content/world.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {citySurface,groundMaterial,materialTile,paintedClearing,paintedTrail} from './terrain-paint';
import {STAGES} from '../content/core.js';
import {SpellRibbons,GROUND_DEPTH} from './SpellRibbons';
import {drawCast,drawCombatTrails,drawImpact,drawGroundSkills} from './three-skill-effects';
import {AtlasActors} from './AtlasActors';
import {drawRosterCues} from './RosterCues';
import {SignatureFeedback} from './SignatureFeedback';
import {WauKite} from './WauLookout';
import {roadWidth} from '../content/road-layout.js';

const DEPTH=GROUND_DEPTH;

export class RegionWorld{
  readonly renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  private scene=new THREE.Scene();
  private camera=new THREE.OrthographicCamera(-1,1,1,-1,1,24000);
  private projectedActor=new THREE.Vector3();
  private materials=new Map<number,THREE.MeshStandardMaterial>();
  private textures:THREE.Texture[]=[];
  private width=0;
  private height=0;
  private sunDirection=new THREE.Vector3(-4,8,5);
  readonly actors=new AtlasActors(this.sunDirection);
  private ribbons=new SpellRibbons();
  private signatures=new SignatureFeedback();
  private region='';
  readonly floor=new BattleMarks(12,12);
  readonly effects=new BattleMarks(74,24);
  readonly labels=new BattleLabels();
  scenery:Actor[]=[];
  private background=new THREE.Color();
  private waterMap?:THREE.Texture;
  private gangwayHinge?:THREE.Group;
  private wau?:WauKite;
  private motion=matchMedia('(prefers-reduced-motion: reduce)');
  constructor(host:HTMLElement,private assets:SpriteAssets){
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    const canvas=this.renderer.domElement;
    canvas.id='game';canvas.tabIndex=0;
    canvas.setAttribute('aria-label','Game field. Move with WASD or arrow keys. Q, E, F and R cast skills. Escape pauses.');
    canvas.hidden=true;host.prepend(canvas);
  }
  setRegion(world:RunState['world'],arena:{x:number;y:number;r:number}){
    if(this.region===world.id)return;
    this.clearTerrain();
    this.region=world.id;
    this.renderer.domElement.dataset.region=world.id;
    this.background.setHex(world.id==='kl'?0x182137:0x426a50);
    this.scene.background=this.background;
    this.scene.add(new THREE.HemisphereLight(0xfff6de,0xb6bbb0,1.85));
    const sun=new THREE.DirectionalLight(0xffe2b6,1.6);sun.position.copy(this.sunDirection);this.scene.add(sun);
    const index=STAGES.findIndex(stage=>stage.id===world.id);
    const materialSheet=this.assets.image('terrain-materials');
    const tile=(i:number)=>this.texture(materialTile(materialSheet,i,2));
    const baseMat=groundMaterial(this.texture(materialTile(this.assets.image('malaysia-ground'),index,3)));
    const stone=tile(0),earth=tile(1),wood=tile(2);
    const painted=(map:THREE.Texture,color:number)=>new THREE.MeshBasicMaterial({
      map,color,transparent:true,depthWrite:false,vertexColors:true
    });
    const pavingMat=new THREE.MeshBasicMaterial({map:stone});
    const deckMat=new THREE.MeshBasicMaterial({map:wood,color:0xc7b08e});
    const city=world.id==='kl';
    const concrete=city?this.texture(citySurface('concrete')):null;
    const stonePath=concrete?painted(concrete,0xe5e7ed):painted(stone,0xefe0cc);
    const earthPath=painted(earth,world.id==='pahang'?0xb5ba9b:0xd4c1a0);
    const asphalt=city?painted(this.texture(citySurface('asphalt')),0xffffff):null;
    const ground=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,lift:number,tileSize=340)=>{
      geometry.rotateX(-Math.PI/2);
      const pos=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
      for(let i=0;i<pos.count;i++)uv.setXY(i,(x+pos.getX(i))/tileSize,(y+pos.getZ(i))/tileSize);
      const mesh=new THREE.Mesh(geometry,material);mesh.scale.z=DEPTH;
      mesh.position.set(x,lift,y*DEPTH);this.scene.add(mesh);return mesh;
    };
    const margin=WORLD_SIZE+3100;
    ground(new THREE.PlaneGeometry(margin,margin),baseMat,0,0,0,world.urban?580:940);
    if(concrete)ground(paintedClearing(2800,2490),painted(concrete,0x8c929a),0,-115,.36,300);
    for(const edge of [-HALF,HALF]){
      this.box(0,edge,2,WORLD_SIZE,5,16,0x695b47);
      this.box(edge,0,2,16,5,WORLD_SIZE,0x695b47);
    }
    for(const {x,y,rx,ry,surface} of world.courts){
      const mesh=ground(paintedClearing(rx,ry),surface==='stone'?stonePath:earthPath,x,y,.62,360);
      mesh.renderOrder=0;
    }
    for(const b of world.buildings){
      if(world.bridges.some(deck=>b.x>=deck.x&&b.x+b.w<=deck.x+deck.w&&b.y>=deck.y&&b.y+b.h<=deck.y+deck.h))continue;
      const surface=world.urban?stonePath:earthPath;
      const pad=paintedClearing(b.w*.67,b.h*.69);
      ground(pad,surface,b.x+b.w/2,b.y+b.h*.58,.75,305).renderOrder=0;
    }
    for(const [p,path] of world.roads.entries()){
      const material=world.urban||p===0&&world.id==='johor'?stonePath:earthPath;
      const width=roadWidth(world,p);
      for(let i=1;i<path.length;i++){
        const [x,y]=path[i-1],[xx,yy]=path[i],dx=xx-x,dy=yy-y;
        const length=Math.hypot(dx,dy),angle=-Math.atan2(dy,dx);
        const lane=(breadth:number,mat:THREE.Material,lift:number)=>{
          const tileSize=city?152:360;
          ground(paintedTrail(length,breadth,city?.95:.78).rotateZ(angle),mat,(x+xx)/2,(y+yy)/2,lift,tileSize).renderOrder=lift;
          ground(paintedClearing(breadth/2,breadth/2),mat,xx,yy,lift,tileSize).renderOrder=lift;
        };
        lane(width,material,1);
        if(asphalt)lane(width-68,asphalt,2);
      }
    }
    if(city)this.cityStreets(world);
    if(world.id==='johor'){
      const disc=(r:number,color:number,h:number)=>ground(new THREE.CircleGeometry(r,64),this.material(color),0,0,h);
      disc(257,0x99896a,2);disc(250,0xd5be91,3);
      ground(new THREE.CircleGeometry(239,64),pavingMat,0,0,4);
      for(const [r,c] of [[160,0xaf987a],[153,0xeddbaf],[147,0x78978c],[141,0xd6bd8c]])
        ground(new THREE.RingGeometry(r-3,r,96),this.material(c),0,0,5);
      // Eight woven lozenges inlaid in the central paving.
      for(let i=0;i<8;i++){
        const shape=new THREE.Shape();shape.moveTo(0,19);shape.lineTo(16,58);shape.lineTo(0,128);shape.lineTo(-16,58);shape.closePath();
        const geom=new THREE.ShapeGeometry(shape);geom.rotateZ(i*Math.PI/4);
        ground(geom,this.material(i%2?0xb99b72:0x7c9a88),0,0,5.3);
      }
    }
    this.waterMap=world.waters.length?tile(3):undefined;
    const waterTint=new THREE.Color(0xe3eee8).lerp(new THREE.Color(world.water),.42);
    const waterMat=this.waterMap?new THREE.MeshBasicMaterial({map:this.waterMap,color:waterTint}):null;
    for(const w of world.waters){
      this.box(w.x+w.w/2,w.y+w.h/2,1,w.w+20,2,w.h+20,world.urban?0x735343:0x5e664d);
      ground(new THREE.PlaneGeometry(w.w,w.h),waterMat!,w.x+w.w/2,w.y+w.h/2,3.5,590);
    }
    for(const b of world.bridges){
      const alongX=b.axis?b.axis==='x':b.w>b.h,run=alongX?b.w:b.h,cross=alongX?b.h:b.w;
      const at=(u:number,v:number,w:number,d:number,h:number,tall:number,c:number)=>{
        this.box(b.x+(alongX?u:v),b.y+(alongX?v:u),h,alongX?w:d,tall,alongX?d:w,c);
      };
      const paved=world.id==='melaka'||world.id==='kelantan'||world.id==='kedah';
      const deck=ground(new THREE.PlaneGeometry(b.w,b.h),paved?pavingMat:deckMat,
        b.x+b.w/2,b.y+b.h/2,10,paved?360:390);
      if(!paved&&alongX){
        const uv=deck.geometry.getAttribute('uv');
        for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getY(i),-uv.getX(i));
      }
      for(const edge of [8,cross-8]){
        const opening=world.gangway;
        const y=b.y+edge;
        const segments=alongX&&opening&&y>=opening.y&&y<=opening.y+opening.h
          ?[[0,Math.max(0,opening.x-b.x)],[Math.min(run,opening.x+opening.w-b.x),run]]
          :[[0,run]];
        for(const [start,end] of segments){
          if(end-start<=0)continue;
          at((start+end)/2,edge,end-start,5,31,5,paved?0x985a48:0x725840);
          for(let u=start+12;u<end;u+=92)at(u,edge,10,10,19,39,paved?0xb4765c:0x766449);
        }
      }
    }
    if(world.gangway){
      const gate=world.gangway,cx=gate.x+gate.w/2,farEnd=gate.y+gate.h;
      const slab=ground(new THREE.PlaneGeometry(gate.w,gate.h),deckMat,cx,gate.y+gate.h/2,10,330);
      slab.position.set(0,0,-gate.h*DEPTH/2);
      slab.material=new THREE.MeshBasicMaterial({map:wood,color:0xc7b08e,side:THREE.DoubleSide});
      this.gangwayHinge=new THREE.Group();
      this.gangwayHinge.position.set(cx,11,farEnd*DEPTH);
      this.gangwayHinge.add(slab);this.scene.add(this.gangwayHinge);
    }
    if(world.wauLookout){
      this.wau=new WauKite(world.wauLookout);
      this.scene.add(this.wau.group);
    }
    this.buildPaddies(world);
    if(world.id==='johor'){
      // Market bunting hangs from the front posts of the two northern houses.
      const start=new THREE.Vector3(-346,115,-310*DEPTH);
      const end=new THREE.Vector3(358,115,-280*DEPTH);
      const point=(t:number)=>start.clone().lerp(end,t).add(new THREE.Vector3(0,-26*Math.sin(Math.PI*t),0));
      const curve=new THREE.CatmullRomCurve3(Array.from({length:17},(_,i)=>point(i/16)));
      this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,1,4,false),this.material(0x746044)));
      for(let i=0;i<26;i++){
        const p=point((i+.5)/26);
        const flag=new THREE.BufferGeometry();
        flag.setAttribute('position',new THREE.Float32BufferAttribute([-9,0,0,1,-15,1.8,9,0,0],3));flag.computeVertexNormals();
        const mesh=new THREE.Mesh(flag,this.material([0xc56e53,0xe1ad63,0x62998b,0xd39b83][i%4]));
        mesh.position.copy(p);this.scene.add(mesh);
      }
      // Mossy planting beds edging the square, with paired ceramic pots and blossoms.
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        if(i%3===2)continue;
        const x=Math.cos(a)*278,y=Math.sin(a)*278;
        const pot=new THREE.Mesh(new THREE.CylinderGeometry(15,10,20,10),this.material(0xad704e));
        pot.position.set(x,10,y*DEPTH);this.scene.add(pot);
        for(let j=0;j<7;j++){
          const t=j*2.4,dx=Math.cos(t)*9,dz=Math.sin(t)*9;
          const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(7+j%3,0),this.material(j%3===0?0xc97967:0x68875c));
          leaf.position.set(x+dx,24+j%4,y*DEPTH+dz);this.scene.add(leaf);
        }
      }
    }
    for(const material of [deckMat,pavingMat,stonePath,earthPath]){
      if(!this.scene.children.some(o=>o instanceof THREE.Mesh&&o.material===material))material.dispose();
    }
    this.scenery=buildScenery(world,this.assets);
    this.buildArena(arena);
    this.batchTerrain();
    this.scene.add(this.ribbons.mesh,this.actors.group,this.labels.group,this.floor.mesh,this.effects.mesh);
  }
  private cityStreets(world:RunState['world']){
    // Mark the two avenues and the crossings that join their side streets.
    const paint=0xa69b7f,ivory=0xc6c3b4,steel=0x393c4b,glow=0xeed0a0;
    const junctionsX=[-1240,0,1190],junctionsY=[-1960,-1170,0,640,1600];
    for(let x=-2500;x<=2500;x+=103)if(junctionsX.every(j=>Math.abs(x-j)>176)){
      this.box(x,0,2.4,48,.8,3,paint);
    }
    for(let y=-2590;y<=2590;y+=103)if(junctionsY.every(j=>Math.abs(y-j)>180)){
      this.box(0,y,2.4,3,.8,48,paint);
    }
    for(const x of junctionsX)for(const side of [-1,1])for(let i=-3;i<=3;i++){
      this.box(x+side*108,i*20,2.4,24,.8,10,ivory);
    }
    for(const y of junctionsY)for(let i=-3;i<=3;i++){
      this.box(i*20,y+115,2.4,10,.8,24,ivory);
      if(y===0)this.box(i*20,y-115,2.4,10,.8,24,ivory);
    }
    const lightPool=paintedClearing(73,63).rotateX(-Math.PI/2);
    const lampLight=new THREE.MeshBasicMaterial({color:0xffb768,transparent:true,vertexColors:true,opacity:.17,depthWrite:false});
    for(const [x,y] of [[-2200,178],[-1570,-180],[-1050,183],[-660,-172],[-270,172],[252,-176],
      [714,177],[1002,-178],[1490,-178],[1960,178],[2320,-178],[170,-605],[-178,820],[178,-1520]]){
      if(!world.walkable(x,y,28))continue;
      this.box(x,y,7,28,14,25,steel);
      this.box(x,y,55,7,104,8,steel);
      this.box(x,y-14,105,9,5,34,steel);
      this.box(x,y-29,103,16,10,13,glow);
      const pool=new THREE.Mesh(lightPool,lampLight);
      pool.position.set(x,2.8,(y-24)*DEPTH);pool.scale.z=DEPTH;pool.renderOrder=3;
      this.scene.add(pool);
    }
    for(const [x,y] of [[-226,-221],[237,211],[-1042,-211],[970,207],[1390,178],[1640,-172],[-384,831]]){
      if(!world.walkable(x,y,43)||!world.clearOfRoads({x:x-37,y:y-19,w:74,h:38}))continue;
      this.box(x,y,8,72,16,38,0x80706c);
      this.box(x,y,16,63,3,31,0x4d493f);
      for(let i=-2;i<=2;i++){
        const hedge=new THREE.Mesh(new THREE.IcosahedronGeometry(12,0),this.material(i%2?0x61745c:0x415d50));
        hedge.scale.set(1,1+(i%2)*.2,.8);
        hedge.position.set(x+i*11,23,(y+(i%2)*7)*DEPTH);this.scene.add(hedge);
      }
    }
  }
  private buildPaddies(world:RunState['world']){
    let material:THREE.MeshBasicMaterial|undefined;
    const width=282,height=236;
    const atlasRow=world.id==='kedah'?0:1; // UV rows start at the bottom of the image.
    for(const [patch,[x,y]] of world.paddies.entries()){
      for(let col=0;col<3;col++)for(let row=0;row<3;row++){
        const px=x+col*320,py=y+row*280;
        if(!world.clearOfRoads({x:px,y:py,w:width,h:height},10)||
          world.blockers.some(w=>px+width>w.x&&px<w.x+w.w&&py+height>w.y&&py<w.y+w.h))continue;
        material??=new THREE.MeshBasicMaterial({map:this.texture(this.assets.image('rice-paddies')),alphaTest:.45});
        const bed=new THREE.PlaneGeometry(width,height*DEPTH);
        const uv=bed.getAttribute('uv'),variant=(patch+col+row)%2;
        for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+variant)/2,(uv.getY(i)+atlasRow)/2);
        bed.rotateX(-Math.PI/2);
        const mesh=new THREE.Mesh(bed,material);
        mesh.position.set(px+width/2,2,(py+height/2)*DEPTH);
        this.scene.add(mesh);
      }
    }
  }
  private batchTerrain(){
    // Static meshes sharing a material and a neighbourhood can be culled and
    // submitted together, especially the tiled courts and rice terraces.
    const groups=new Map<string,THREE.Mesh<THREE.BufferGeometry,THREE.Material>[]>();
    for(const mesh of this.scene.children){
      if(!(mesh instanceof THREE.Mesh)||Array.isArray(mesh.material))continue;
      const key=[mesh.material.uuid,Math.floor(mesh.position.x/800),Math.floor(mesh.position.z/1100),
        Object.keys(mesh.geometry.attributes).sort().join(',')].join(':');
      const group=groups.get(key);
      if(group)group.push(mesh);else groups.set(key,[mesh]);
    }
    const retired=new Set<THREE.BufferGeometry>();
    for(const group of groups.values()){
      if(group.length<3)continue;
      const parts=group.map(mesh=>{
        mesh.updateMatrix();
        const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
        return geometry.applyMatrix4(mesh.matrix);
      });
      const geometry=mergeGeometries(parts);
      for(const part of parts)part.dispose();
      if(!geometry)continue;
      for(const mesh of group){this.scene.remove(mesh);retired.add(mesh.geometry)}
      this.scene.add(new THREE.Mesh(geometry,group[0].material));
    }
    for(const mesh of this.scene.children)if(mesh instanceof THREE.Mesh)retired.delete(mesh.geometry);
    for(const geometry of retired)geometry.dispose();
  }
  private buildArena(arena:{x:number;y:number;r:number}){
    const {x,y,r}=arena;
    // The root wall in the painting sits at roughly 37% of its width from centre.
    const size=r/.37;
    const ground=new THREE.PlaneGeometry(size,size,24,24);
    const uv=ground.getAttribute('uv'),colors=[];
    for(let i=0;i<uv.count;i++){
      const u=uv.getX(i),v=uv.getY(i);
      const edge=Math.min(u,v,1-u,1-v);
      colors.push(1,1,1,THREE.MathUtils.smoothstep(edge,0,.10));
    }
    ground.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
    ground.rotateX(-Math.PI/2);
    const map=this.texture(this.assets.image('raya-lair'));
    const lair=new THREE.Mesh(ground,new THREE.MeshBasicMaterial({
      map,vertexColors:true,transparent:true,depthWrite:false
    }));
    lair.position.set(x,0,y*DEPTH);lair.scale.z=DEPTH;lair.renderOrder=-1;
    this.scene.add(lair);
  }
  private texture(image:HTMLCanvasElement|HTMLImageElement){
    const t=new THREE.Texture(image);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;
    t.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;this.textures.push(t);return t;
  }
  private material(color:number){
    let m=this.materials.get(color);
    if(!m){m=new THREE.MeshStandardMaterial({color,roughness:1});this.materials.set(color,m)}
    return m;
  }
  private box(x:number,y:number,h:number,w:number,height:number,d:number,color:number){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,height,d*DEPTH),this.material(color));
    mesh.position.set(x,h,y*DEPTH);this.scene.add(mesh);
  }
  show(active:boolean){
    if(this.renderer.domElement.hidden===!active)return;
    this.renderer.domElement.hidden=!active;
  }
  draw(g:RunState,w:number,h:number,z:number,x:number,y:number){
    if(!w||!h)return;
    this.floor.finish();this.effects.finish();
    this.background.setHex(g.raid?0x061016:g.world.id==='kl'?0x182137:0x426a50);
    if(w!==this.width||h!==this.height){
      this.renderer.setSize(w,h,false);this.width=w;this.height=h;
    }
    const c=this.camera;c.left=-w/(2*z);c.right=-c.left;c.top=h/(2*z);c.bottom=-c.top;
    c.position.set(x,8000,y*DEPTH+8000);c.lookAt(x,0,y*DEPTH);c.updateProjectionMatrix();
    if(this.waterMap)this.waterMap.offset.x=this.motion.matches?0:(g.t*.027)%2;
    this.wau?.draw(g,this.motion.matches);
    if(this.gangwayHinge&&g.world.gangway){
      const gate=g.world.gangway,work=g.jettyWork;
      const lowered=gate.open?1:work?.active&&!this.motion.matches?work.elapsed/gate.duration:0;
      this.gangwayHinge.rotation.x=(1-lowered)*1.37;
    }
    this.ribbons.begin();
    const painted=this.assets.hasEffects(g.hero.id);
    if(!painted){
      drawGroundSkills(this.ribbons,g,this.motion.matches);
      for(const f of g.fx){
        if(f.kind==='spell')drawCast(this.ribbons,f,g,this.motion.matches);
        else drawImpact(this.ribbons,f,g,this.motion.matches);
      }
      for(const f of g.sea?.fx||[])drawImpact(this.ribbons,f,g,this.motion.matches);
      drawCombatTrails(this.ribbons,g,this.motion.matches);
      drawRosterCues(this.ribbons,g,this.motion.matches);
    }else{
      // Item shots, enemy bursts and encounter feedback keep their own cues.
      for(const f of g.fx){
        if(!f.hero&&!f.flourish&&f.kind!=='spell')drawImpact(this.ribbons,f,g,this.motion.matches);
      }
      for(const q of g.projs)if('origin' in q&&q.origin==='item'){
        this.ribbons.glow([q.x,q.y,10],q.r+3,0xeaaf73,.8);
      }
    }
    this.signatures.draw(this.ribbons,g,this.motion.matches);
    this.ribbons.finish();
    this.renderer.render(this.scene,c);
  }
  labelBounds(sprite:THREE.Sprite){
    const point=sprite.position.clone().project(this.camera);
    const width=sprite.scale.x*this.width/(this.camera.right-this.camera.left);
    const height=sprite.scale.y*this.height/(this.camera.top-this.camera.bottom);
    const left=(point.x+1)*this.width/2-width/2,top=(1-point.y)*this.height/2-height/2;
    return {left,top,right:left+width,bottom:top+height};
  }
  actorHead(actor:Actor,footY:number){
    // Match the atlas shader's screen-facing height and airborne offset.
    const point=this.projectedActor.set(actor.x,0,footY*DEPTH).applyMatrix4(this.camera.matrixWorldInverse);
    point.y+=actor.height*actor.originY+footY-actor.y;
    point.applyMatrix4(this.camera.projectionMatrix);
    return point.set((point.x+1)*this.width/2,(1-point.y)*this.height/2,point.z);
  }
  private clearTerrain(){
    this.wau?.dispose();this.wau=undefined;
    this.scene.remove(this.ribbons.mesh,this.actors.group,this.labels.group,this.floor.mesh,this.effects.mesh);
    const geometries=new Set<THREE.BufferGeometry>();
    const materials=new Set<THREE.Material>();
    this.scene.traverse(obj=>{if(obj instanceof THREE.Mesh){geometries.add(obj.geometry);materials.add(obj.material)}});
    for(const geometry of geometries)geometry.dispose();
    for(const m of materials)m.dispose();
    for(const t of this.textures)t.dispose();
    this.textures=[];this.waterMap=undefined;this.materials.clear();this.scene.clear();
    this.gangwayHinge=undefined;
  }
  destroy(){
    this.clearTerrain();this.ribbons.dispose();this.actors.destroy();
    this.renderer.domElement.remove();
    this.floor.dispose();this.effects.dispose();this.labels.destroy();
    this.renderer.dispose();
  }
}
