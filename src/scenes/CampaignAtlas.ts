import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {markStageProgress} from '../ui/stage-progress';
import {expeditions,playableStops,type CampaignRoute} from '../content/expedition';
import {CampaignBoundaries} from './CampaignBoundaries';
import {RegionalTerrain} from './RegionalTerrain';
import {AtlasExploration} from './AtlasExploration';
import {atlasRegions,worldTerrainPatches} from './atlas-regions';
import reliefUrl from '../../assets/asean-relief.webp';
import heightsUrl from '../../assets/asean-heights.bin?url';

const byId=(id:string)=>document.getElementById(id)!;
const vec=(lon:number,lat:number)=>new THREE.Vector3(lon-110,0,9-lat);
const ROUTES=['west','east'] as const;
const ROUTE_COLORS={west:0xf2ce83,east:0x86e1d3};
const peninsula=vec(101.9,4.14);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const labels:[string,number,number,boolean?][]=[
  ['Myanmar',95,23.7],['Thailand',99.4,15.4],['Laos',104,18.6],['Vietnam',108.9,16.4],
  ['Cambodia',105,11.8],['Brunei',115.6,6.6],['Singapore',104.3,-.2],
  ['Indonesia',114,-3.1],['Timor-Leste',126.3,-10],['Philippines',123.6,13.6],
  ['Andaman Sea',93.7,9.2,true],['South China Sea',113.1,13,true],['Banda Sea',128,-4,true]
];

export class CampaignAtlas {
  private view=byId('atlasView');
  private overlay=byId('atlasLabels');
  private missionList=byId('route');
  private route:CampaignRoute='west';
  private pinLabel=document.createElement('span');
  private stageLabels=playableStops.map(stop=>{
    const id=stop.stageId!;
    const route=expeditions.east.includes(stop)?'east':'west';
    const element=document.createElement('button');
    element.type='button';element.id='atlas-stage-'+id;element.className='atlas-stage';
    element.dataset.route=id==='johor'?'shared':route;
    element.hidden=true;
    const label=document.createElement('span');label.textContent=stop.place;element.append(label);
    this.overlay.append(element);return {element,id,point:vec(stop.lon,stop.lat)};
  });
  private texts=labels.map(([name,lon,lat,water])=>{
    const element=document.createElement('span');
    element.className='map-label'+(water?' water':'');element.textContent=name;
    element.setAttribute('aria-hidden','true');
    this.overlay.append(element);return {element,point:vec(lon,lat)};
  });
  private scene=new THREE.Scene();
  private camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,180);
  private renderer?:THREE.WebGLRenderer;
  private flat?:CanvasRenderingContext2D;
  private relief=new Image();
  private terrain?:RegionalTerrain;
  private borneo?:RegionalTerrain;
  private borneoRequested=false;
  private exploration:AtlasExploration;
  private campaign=new THREE.Group();
  private boundaries=new CampaignBoundaries();
  private worldPatches:THREE.Mesh<THREE.PlaneGeometry>[]=[];
  private frustum=new THREE.Frustum();
  private projectionView=new THREE.Matrix4();
  private heights=new Uint8Array(0);
  private pin=new THREE.Group();
  private center=peninsula.clone();
  private distance=7.35;
  private paths:Record<CampaignRoute,THREE.Vector3[][]>={west:[],east:[]};
  private roads={west:new THREE.Group(),east:new THREE.Group()};
  private planned={west:new THREE.Group(),east:new THREE.Group()};
  private routeMaterials={
    west:new THREE.MeshBasicMaterial({color:ROUTE_COLORS.west,transparent:true,depthWrite:false}),
    east:new THREE.MeshBasicMaterial({color:ROUTE_COLORS.east,transparent:true,depthWrite:false})
  };
  private get expedition(){return expeditions[this.route]}
  private get routeLines(){return this.paths[this.route]}
  private startStop=0;
  private cursorStop=0;
  private cursor=vec(playableStops[0].lon,playableStops[0].lat);
  private fraction=1;
  private index=0;
  private playing=false;
  private pausedInFlight=false;
  private overview=false;
  private hold=0;
  private dirty=true;
  private width=0;
  private height=0;
  private observer:ResizeObserver;
  private abort=new AbortController();
  private previous=byId('atlasPrevious') as HTMLButtonElement;
  private next=byId('atlasNext') as HTMLButtonElement;
  private tour=byId('atlasTour') as HTMLButtonElement;

  constructor(){
    this.pinLabel.className='atlas-pin';this.pinLabel.setAttribute('aria-hidden','true');this.overlay.append(this.pinLabel);
    this.observer=new ResizeObserver(()=>{this.dirty=true});
    this.observer.observe(this.view);
    const signal=this.abort.signal;
    this.scene.add(this.campaign);
    this.exploration=new AtlasExploration(this.view,()=>{
      this.dirty=true;
      if(this.exploration.region===atlasRegions.borneo && this.renderer && !this.borneoRequested)void this.loadBorneo();
    },signal);
    this.previous.addEventListener('click',()=>this.jump(this.index-1),{signal});
    this.next.addEventListener('click',()=>this.jump(this.index+1),{signal});
    this.tour.addEventListener('click',()=>{
      if(this.playing){this.playing=false;this.pausedInFlight=true}
      else{
        if((this.index===this.expedition.length-1 && !this.pausedInFlight) || this.overview)this.select(0,true);
        this.overview=false;this.playing=true;this.pausedInFlight=false;this.hold=0;
      }
      this.controls();this.dirty=true;
    },{signal});
    byId('atlasOverview').addEventListener('click',()=>{
      this.playing=false;this.pausedInFlight=false;this.overview=true;this.select(0,true);
    },{signal});
    for(const {element,id} of this.stageLabels)element.addEventListener('click',()=>{
      this.overlay.dispatchEvent(new CustomEvent('select-mission',{detail:id}));
    },{signal});
    this.missionList.addEventListener('stage-preview',()=>this.syncMission(),{signal});
    this.syncMission(true);
    this.relief.onload=()=>{if(!signal.aborted)this.dirty=true};
    this.relief.src=reliefUrl;
    try{
      this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
      this.renderer.domElement.setAttribute('aria-hidden','true');
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setClearColor(0x183b40);
      this.view.prepend(this.renderer.domElement);
    }catch{
      const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');this.view.prepend(canvas);
      this.flat=canvas.getContext('2d')??undefined;
    }
    const canvas=this.renderer?.domElement??this.flat?.canvas;
    canvas?.addEventListener('click',event=>{
      if(this.view.dataset.exploring !== 'true' && !this.overview && this.expedition[this.index].stageId)
        this.pickBoundary(event,canvas);
    },{signal});
    this.load();
  }

  private pickBoundary(event:MouseEvent,canvas:HTMLCanvasElement){
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const screen=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
    const ray=new THREE.Raycaster();
    ray.setFromCamera(screen,this.camera);
    const surface=this.terrain?.group.children??this.worldPatches;
    const point=this.renderer?ray.intersectObjects(surface,false)[0]?.point:
      ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0)),new THREE.Vector3());
    if(!point)return;
    const stage=this.boundaries.stageAt(point.x,point.z);
    if(stage)this.stageLabels.find(({id})=>id===stage)?.element.click();
  }

  private syncMission(initial=false){
    this.exploration.exit(false);
    const route=this.missionList.dataset.campaignRoute==='east'?'east':'west';
    const changed=route!==this.route;
    this.route=route;this.view.dataset.campaignRoute=route;
    const selectedId=this.missionList.querySelector('[aria-pressed="true"]')?.id.slice(4);
    this.boundaries.select(selectedId);
    const open=this.missionList.dataset.openStages?.split(' ')??[];
    const cleared=this.missionList.dataset.clearedStages?.split(' ')??[];
    const next=this.missionList.dataset.nextStages?.split(' ')??[];
    for(const {element,id} of this.stageLabels){
      markStageProgress(element,id,cleared,next);
      element.disabled=!open.includes(id);
      element.setAttribute('aria-pressed',String(id===selectedId));
    }
    for(const branch of ROUTES){
      this.routeMaterials[branch].opacity=branch===route?1:.67;
      this.roads[branch].renderOrder=branch===route?2:1;
      this.planned[branch].visible=branch===route;
    }
    const index=Math.max(0,this.expedition.findIndex(stop=>stop.stageId===selectedId));
    this.jump(index,initial||changed);
  }

  private async loadBorneo(){
    this.borneoRequested=true;
    const signal=this.abort.signal;
    try{
      const terrain=await RegionalTerrain.load(atlasRegions.borneo,signal);
      if(signal.aborted){this.disposeTerrain(terrain.group);return}
      this.borneo=terrain;
      this.scene.add(terrain.group);
      this.dirty=true;
    }catch{
      // Keep the coarse Borneo patch available if the detailed inset fails.
    }
  }

  private async load(){
    const signal=this.abort.signal;
    if(this.renderer){
      const [world,region]=await Promise.allSettled([
        fetch(heightsUrl,{signal}).then(response=>response.ok?response.arrayBuffer():new ArrayBuffer(0)),
        RegionalTerrain.load(atlasRegions.peninsula,signal)
      ]);
      if(signal.aborted){
        if(region.status==='fulfilled')this.disposeTerrain(region.value.group);
        return;
      }
      if(world.status==='fulfilled')this.heights=new Uint8Array(world.value);
      if(region.status==='fulfilled'){
        this.terrain=region.value;
        const tile=this.terrain.group.children[0] as THREE.Mesh<THREE.BufferGeometry,THREE.MeshLambertMaterial>;
        this.boundaries.apply(tile.material);
        this.scene.add(this.terrain.group);
      }
      const map=new THREE.Texture(this.relief);
      map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
      if(this.relief.complete && this.relief.naturalWidth)map.needsUpdate=true;
      else this.relief.addEventListener('load',()=>{map.needsUpdate=true;this.dirty=true},{once:true,signal:this.abort.signal});
      const material=new THREE.MeshLambertMaterial({map});
      if(!this.terrain)this.boundaries.apply(material);
      for(const {left,top,right,bottom,region} of worldTerrainPatches(!!this.terrain)){
        const cols=right-left,rows=bottom-top;
        const geo=new THREE.PlaneGeometry(cols/4,rows/4,cols,rows);
        geo.rotateX(-Math.PI/2);
        geo.translate(-35+(left+right)/8,0,-33+(top+bottom)/8);
        const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');
        for(let i=0;i<pos.count;i++){
          const col=left+i%(cols+1),row=top+Math.floor(i/(cols+1));
          pos.setY(i,(this.heights[row*301+col]??0)*.011);
          uv.setXY(i,col/300,1-row/260);
        }
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        const patch=new THREE.Mesh(geo,material);
        patch.userData.region=region;
        this.worldPatches.push(patch);
        this.scene.add(patch);
      }
      this.scene.add(new THREE.HemisphereLight(0xfff7e4,0x769eaa,1.55));
      const sun=new THREE.DirectionalLight(0xffecce,1.65);sun.position.set(-35,52,-20);this.scene.add(sun);
    }
    const gold=new THREE.MeshBasicMaterial({color:0xffe6a5});
    const dark=new THREE.MeshBasicMaterial({color:0x33483c});
    const casing=new THREE.MeshBasicMaterial({color:0x405044,depthWrite:false});
    const planned=new THREE.LineDashedMaterial({color:0xb7d1c7,dashSize:.20,gapSize:.14,transparent:true,opacity:.72});
    for(const route of ROUTES){
      const stops=expeditions[route];
      const casings:THREE.BufferGeometry[]=[],surfaces:THREE.BufferGeometry[]=[];
      this.campaign.add(this.roads[route],this.planned[route]);
      for(let i=1;i<stops.length;i++){
        const path=Array.from({length:65},(_,j)=>this.arc(stops[i-1],stops[i],j/64));
        this.paths[route].push(path);
        if(!this.renderer)continue;
        if(stops[i].stageId){
          const curve=new THREE.CatmullRomCurve3(path);
          casings.push(new THREE.TubeGeometry(curve,64,.029,5,false).translate(0,-.009,0));
          surfaces.push(new THREE.TubeGeometry(curve,64,.018,5,false));
        }else{
          const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(path),planned);
          line.computeLineDistances();this.planned[route].add(line);
        }
      }
      if(surfaces.length){
        const road=new THREE.Mesh(mergeGeometries(surfaces),this.routeMaterials[route]);
        road.renderOrder=1;
        this.roads[route].add(new THREE.Mesh(mergeGeometries(casings),casing),road);
        for(const geometry of [...casings,...surfaces])geometry.dispose();
      }
    }
    if(this.renderer){
      const baseGeometry=new THREE.CylinderGeometry(.096,.126,.13,16);
      const markerGeometry=new THREE.OctahedronGeometry(.085);
      const bases=new THREE.InstancedMesh(baseGeometry,dark,this.stageLabels.length);
      this.campaign.add(bases);
      for(const [i,{element,point}] of this.stageLabels.entries()){
        const branch=element.dataset.route as CampaignRoute|'shared';
        const y=this.elevation(point)+.12;
        bases.setMatrixAt(i,new THREE.Matrix4().makeTranslation(point.x,y,point.z));
        const marker=new THREE.Mesh(markerGeometry,branch==='shared'?gold:this.routeMaterials[branch]);
        marker.position.set(point.x,y+.125,point.z);marker.scale.y=1.45;
        this.campaign.add(marker);
      }
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.60,.07,8,32),gold);ring.rotation.x=-Math.PI/2;
      const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.34),gold);
      beacon.scale.y=1.6;beacon.position.y=.94;this.pin.add(ring,beacon);this.campaign.add(this.pin);
    }else{gold.dispose();dark.dispose();casing.dispose();planned.dispose()}
    this.dirty=true;
  }

  private elevation(p:THREE.Vector3){
    const height=this.terrain?.elevation(p.x,p.z);
    if(height!==undefined)return height;
    const u=THREE.MathUtils.clamp((p.x+35)*4,0,299.9999),v=THREE.MathUtils.clamp((p.z+33)*4,0,259.9999);
    const col=Math.floor(u),row=Math.floor(v),x=u-col,y=v-row,i=row*301+col;
    // Interpolate the same two triangles as PlaneGeometry so short legs hug the terrain.
    if(!this.renderer || !this.heights.length)return 0;
    const h=this.heights;
    return .011*(x+y<=1 ? h[i]*(1-x-y)+h[i+1]*x+h[i+301]*y :
      h[i+302]*(x+y-1)+h[i+301]*(1-x)+h[i+1]*(1-y));
  }

  private arc(from:(typeof playableStops)[number],to:(typeof playableStops)[number],t:number){
    const a=vec(from.lon,from.lat),b=vec(to.lon,to.lat);
    const p=a.clone().lerp(b,t);
    const arch=Math.sin(t*Math.PI);
    const dx=b.x-a.x,dz=b.z-a.z;
    const local=!!to.stageId;
    const bend=(dx<0?-1:1)*arch*(local ? .025 : .09);
    p.x-=dz*bend;p.z+=dx*bend;
    p.y=this.elevation(p)+.05+(local?0:arch*Math.min(1.8,Math.hypot(dx,dz)*.085));
    return p;
  }

  private disposeTerrain(root:THREE.Object3D){
    const materials=new Set<THREE.Material & {map?:THREE.Texture}>();
    root.traverse(o=>{
      if(o instanceof THREE.Mesh || o instanceof THREE.Line){
        if(o instanceof THREE.InstancedMesh)o.dispose();
        o.geometry.dispose();materials.add(o.material);
      }
    });
    for(const material of materials){material.map?.dispose();material.dispose()}
  }

  private controls(){
    this.previous.disabled=this.index===0;this.next.disabled=this.index===this.expedition.length-1;
    this.tour.setAttribute('aria-pressed',String(this.playing));
    this.tour.textContent=this.playing?'Pause tour':this.pausedInFlight?'Resume tour':this.index===this.expedition.length-1?'Replay route':'Tour route';
  }

  private describe(){
    const stop=this.expedition[this.index],place=stop.place;
    byId('atlasHeading').textContent=!this.overview && stop.stageId?'Malaysia':'Southeast Asia';
    byId('atlasPlace').textContent=place;
    this.pinLabel.textContent=place;
    byId('atlasCountry').textContent=stop.country;
    byId('atlasCount').textContent=String(this.index+1).padStart(2,'0')+' / '+this.expedition.length;
    byId('atlasState').textContent=stop.stageId?'Playable chapter':'Planned chapter';this.controls();
  }

  private select(index:number,instant=false){
    this.startStop=this.cursorStop;
    this.index=index;this.fraction=instant||this.cursorStop===index?1:0;
    if(instant)this.cursorStop=index;
    this.hold=0;this.dirty=true;this.describe();
  }

  private positionOnRoute(){
    const leg=Math.min(Math.floor(this.cursorStop),this.expedition.length-2),t=this.cursorStop-leg;
    const path=this.routeLines[leg];
    if(!path){this.cursor.copy(this.arc(this.expedition[leg],this.expedition[leg+1],t));return}
    const u=t*(path.length-1),i=Math.min(Math.floor(u),path.length-2);
    this.cursor.lerpVectors(path[i],path[i+1],u-i);
  }

  private jump(index:number,instant=false){
    this.playing=false;this.pausedInFlight=false;this.overview=false;this.select(index,instant);
  }

  private project(p:THREE.Vector3){
    const v=p.clone().project(this.camera);
    return {x:(v.x+1)*this.width/2,y:(1-v.y)*this.height/2};
  }

  update(ms:number){
    const dt=Math.min(ms/1000,.12);
    const exploring=!!this.exploration.region;
    if(!exploring && this.fraction<1 && !this.pausedInFlight){
      this.fraction=reduced()?1:Math.min(1,this.fraction+dt/1.65);
      this.cursorStop=THREE.MathUtils.lerp(this.startStop,this.index,THREE.MathUtils.smoothstep(this.fraction,0,1));
      this.dirty=true;
    }else if(!exploring && this.playing && (this.hold+=dt)>1.65){
      if(this.index<this.expedition.length-1)this.select(this.index+1);
      else{this.playing=false;this.controls()}
    }
    if(this.dirty){
      this.width=this.view.clientWidth;this.height=this.view.clientHeight;
      if(!this.width||!this.height)return;
    }
    if(this.dirty&&!exploring)this.positionOnRoute();
    const aspect=this.width/this.height;
    const local=!!this.expedition[this.index].stageId;
    const desired=this.overview?vec(111,8.5):local?peninsula:this.cursor;
    const span=this.overview?Math.max(42,44/aspect):local?Math.max(7.35,5.7/aspect):Math.max(18,18/aspect);
    const amount=reduced()?1:1-Math.exp(-dt*4);
    const moving=this.center.distanceToSquared(desired)>.0001||Math.abs(this.distance-span)>.012;
    if((exploring||!moving)&&!this.dirty)return;
    this.dirty=false;
    if(!exploring){
      this.center.lerp(desired,amount);this.distance=THREE.MathUtils.lerp(this.distance,span,amount);
    }
    const center=exploring?this.exploration.center:this.center,distance=exploring?this.exploration.span:this.distance;
    this.campaign.visible=!exploring;
    this.camera.left=-distance*aspect/2;this.camera.right=-this.camera.left;
    this.camera.top=distance/2;this.camera.bottom=-this.camera.top;
    this.camera.position.copy(center).add(new THREE.Vector3(0,50,36));
    this.camera.lookAt(center);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    this.pin.position.copy(this.cursor);this.pin.position.y+=.055;
    this.pin.scale.setScalar(THREE.MathUtils.clamp(this.distance/48,.25,1));
    if(this.renderer){
      const canvas=this.renderer.domElement;
      if(canvas.clientWidth && (canvas.width!==Math.floor(this.width*this.renderer.getPixelRatio())||canvas.height!==Math.floor(this.height*this.renderer.getPixelRatio())))this.renderer.setSize(this.width,this.height,false);
      this.frustum.setFromProjectionMatrix(this.projectionView.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse));
      const showBorneo=!!this.borneo && this.exploration.region===atlasRegions.borneo;
      if(this.borneo)this.borneo.group.visible=showBorneo;
      for(const patch of this.worldPatches)patch.visible=!(showBorneo && patch.userData.region===atlasRegions.borneo)
        && this.frustum.intersectsBox(patch.geometry.boundingBox!);
      this.renderer.render(this.scene,this.camera);
    }else if(this.flat)this.drawFlat(this.flat);
    if(exploring){
      this.exploration.projectLabels(p=>this.project(p),p=>this.renderer?(this.borneo?.elevation(p.x,p.z)??this.elevation(p)):0);
      return;
    }
    const active=this.project(this.pin.position);
    this.pinLabel.style.left=active.x+'px';this.pinLabel.style.top=active.y+'px';
    this.pinLabel.hidden=local||this.fraction<.92;
    const projectedStages=this.stageLabels.map(({element,point})=>{
      const p=point.clone();p.y=this.elevation(p)+.22;
      const {x,y}=this.project(p);
      element.hidden=!local||this.overview||this.distance>14||x<22||x>this.width-22||y<22||y>this.height-22;
      return {element,x,y};
    });
    const visibleLabels=projectedStages.filter(({element})=>!element.hidden)
      .map(stage=>({...stage,label:stage.element.firstElementChild as HTMLElement,
        bounds:stage.element.firstElementChild!.getBoundingClientRect()}))
      .sort((a,b)=>a.y-b.y);
    const placed:{left:number;right:number;bottom:number}[]=[];
    for(const {element,label,bounds,x,y} of visibleLabels){
      element.style.left=x+'px';element.style.top=y+'px';
      const space=bounds.width+12;
      const leftSide=element.dataset.route==='west'?x>space:x+space>this.width;
      element.dataset.side=leftSide?'left':'right';
      const left=leftSide?x-9-bounds.width:x+9,right=left+bounds.width;
      const naturalTop=y-bounds.height/2;
      let top=naturalTop;
      for(const other of placed){
        if(left<other.right+2 && right>other.left-2)top=Math.max(top,other.bottom+2);
      }
      label.style.transform='translateY('+(top-naturalTop)+'px)';
      placed.push({left,right,bottom:top+bounds.height});
    }
    for(const {element,point} of this.texts){
      const {x,y}=this.project(point),half=(element.textContent?.length??0)*3.3+5;
      element.hidden=(local&&!this.overview)||x<half||x>this.width-half||y<54||y>this.height-52||(Math.abs(y-active.y)<16&&x+half>active.x-9&&x-half<active.x+90);
      if(element.hidden)continue;
      element.style.left=x+'px';element.style.top=y+'px';
    }
  }

  private drawFlat(ctx:CanvasRenderingContext2D){
    if(ctx.canvas.width!==this.width||ctx.canvas.height!==this.height){ctx.canvas.width=this.width;ctx.canvas.height=this.height}
    const a=this.project(vec(75,42)),b=this.project(vec(150,-23));
    ctx.fillStyle='#183b40';ctx.fillRect(0,0,this.width,this.height);
    if(this.relief.naturalWidth)ctx.drawImage(this.relief,a.x,a.y,b.x-a.x,b.y-a.y);
    if(this.exploration.region){this.exploration.drawFlat(ctx,p=>this.project(p));return}
    this.boundaries.drawFlat(ctx,p=>this.project(p));
    for(const route of ROUTES){
      ctx.globalAlpha=route===this.route?1:.67;
      for(const [index,line] of this.paths[route].entries()){
        const playable=!!expeditions[route][index+1].stageId;
        if(!playable&&route!==this.route)break;
        ctx.strokeStyle=playable?'#'+ROUTE_COLORS[route].toString(16):'#b7d1c7';ctx.lineWidth=playable?3:1;
        ctx.setLineDash(playable?[]:[4,4]);
        ctx.beginPath();line.forEach((p,i)=>{const v=this.project(p);if(i)ctx.lineTo(v.x,v.y);else ctx.moveTo(v.x,v.y)});ctx.stroke();
      }
    }
    ctx.globalAlpha=1;ctx.setLineDash([]);ctx.strokeStyle='#ffe0a1';
    const pin=this.project(this.pin.position);ctx.beginPath();ctx.arc(pin.x,pin.y,5,0,Math.PI*2);ctx.stroke();
  }

  stop(){this.exploration.exit(false);if(this.playing){this.playing=false;this.pausedInFlight=true;this.controls()}}
  destroy(){
    this.exploration.exit(false);this.abort.abort();this.observer.disconnect();this.relief.onload=null;
    this.boundaries.dispose();
    this.disposeTerrain(this.scene);
    for(const material of Object.values(this.routeMaterials))material.dispose();
    this.renderer?.dispose();this.view.querySelector('canvas')?.remove();this.overlay.replaceChildren();
  }
}
