import * as THREE from 'three';
import {atlasRegions,regionSide,type AtlasRegion} from './atlas-regions';

const byId=(id:string)=>document.getElementById(id)!;
const clamp=THREE.MathUtils.clamp;
const northScale=Math.hypot(50,36)/50; // Foreshortening of the atlas ground plane.
type Point={x:number;y:number};

export class AtlasExploration {
  region?:AtlasRegion;
  readonly center=new THREE.Vector3();
  private zoom=1;
  private pointers=new Map<number,Point>();
  private labels:{element:HTMLElement;point:THREE.Vector3}[]=[];
  private images=new Map<AtlasRegion,HTMLImageElement>();

  constructor(private view:HTMLElement,private changed:()=>void,private signal:AbortSignal){
    byId('atlasExplore').addEventListener('click',()=>this.select(atlasRegions.peninsula),{signal});
    byId('atlasReturn').addEventListener('click',()=>this.exit(),{signal});
    byId('atlasPeninsula').addEventListener('click',()=>this.select(atlasRegions.peninsula),{signal});
    byId('atlasEastMalaysia').addEventListener('click',()=>this.select(atlasRegions.borneo),{signal});
    byId('atlasZoomIn').addEventListener('click',()=>this.scale(1.4),{signal});
    byId('atlasZoomOut').addEventListener('click',()=>this.scale(1/1.4),{signal});
    view.addEventListener('wheel',event=>{
      if(!this.region)return;
      event.preventDefault();
      const units=event.deltaMode===1?16:event.deltaMode===2?view.clientHeight:1;
      this.scale(Math.exp(clamp(-event.deltaY*units*.002,-1,1)),this.local(event));
    },{signal,passive:false});
    view.addEventListener('pointerdown',event=>{
      if(!this.region||event.button!==0||this.pointers.size>=2)return;
      view.focus({preventScroll:true});
      view.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId,this.local(event));
    },{signal});
    view.addEventListener('pointermove',event=>{
      if(!this.pointers.has(event.pointerId))return;
      const before=this.gesture();
      this.pointers.set(event.pointerId,this.local(event));
      const after=this.gesture();
      this.pan(before.x-after.x,before.y-after.y);
      if(before.distance>1&&after.distance>1)this.scale(after.distance/before.distance,after);
    },{signal});
    const release=(event:PointerEvent)=>this.pointers.delete(event.pointerId);
    for(const type of ['pointerup','pointercancel','lostpointercapture'] as const)view.addEventListener(type,release,{signal});
    view.parentElement!.addEventListener('keydown',event=>{
      if(!this.region)return;
      const step=Math.min(view.clientWidth,view.clientHeight)*.09;
      switch(event.key){
        case 'ArrowLeft':this.pan(-step,0);break;
        case 'ArrowRight':this.pan(step,0);break;
        case 'ArrowUp':this.pan(0,-step);break;
        case 'ArrowDown':this.pan(0,step);break;
        case '+':case '=':this.scale(1.25);break;
        case '-':this.scale(.8);break;
        case 'Escape':this.exit();break;
        default:return;
      }
      event.preventDefault();event.stopPropagation();
    },{signal});
  }

  get span(){
    const r=this.region!;
    return Math.max(r.frameHeight,r.frameWidth*this.view.clientHeight/Math.max(1,this.view.clientWidth))/this.zoom;
  }

  private select(region:AtlasRegion){
    this.clearGesture();
    this.region=region;this.zoom=1;
    this.center.set(region.focus[0]-110,0,9-region.focus[1]);
    this.view.dataset.exploring='true';
    this.view.tabIndex=0;this.view.setAttribute('role','region');
    this.view.setAttribute('aria-label',region.name+' terrain. Arrow keys pan. Plus and minus zoom. Escape returns to route.');
    byId('atlasPeninsula').setAttribute('aria-pressed',String(region===atlasRegions.peninsula));
    byId('atlasEastMalaysia').setAttribute('aria-pressed',String(region===atlasRegions.borneo));
    for(const {element} of this.labels)element.remove();
    this.labels=region.states.map(({name,lon,lat,flag})=>{
      const element=document.createElement('span'),img=document.createElement('img');
      element.className='terrain-state';img.alt='';img.src=flag;
      element.append(img,name);byId('atlasLabels').append(element);
      return {element,point:new THREE.Vector3(lon-110,0,9-lat)};
    });
    this.view.focus({preventScroll:true});
    this.changed();
  }

  exit(focus=true){
    if(!this.region)return;
    this.clearGesture();
    this.region=undefined;this.view.dataset.exploring='false';
    this.view.removeAttribute('tabindex');this.view.removeAttribute('role');this.view.removeAttribute('aria-label');
    for(const {element} of this.labels)element.remove();
    this.labels=[];
    this.changed();
    if(focus)byId('atlasExplore').focus({preventScroll:true});
  }

  private clearGesture(){
    for(const id of this.pointers.keys())if(this.view.hasPointerCapture(id))this.view.releasePointerCapture(id);
    this.pointers.clear();
  }
  private local(event:MouseEvent){
    const rect=this.view.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  }
  private gesture(){
    const [a,b]=this.pointers.values();
    return b?{x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)}:{...a,distance:0};
  }
  private pan(dx:number,dy:number){
    const r=this.region!,perPixel=this.span/this.view.clientHeight;
    this.center.x=clamp(this.center.x+dx*perPixel,r.west-110,r.west-110+regionSide);
    this.center.z=clamp(this.center.z+dy*perPixel*northScale,9-r.north,9-r.north+regionSide);
    this.changed();
  }
  private scale(factor:number,anchor?:Point){
    const previous=this.span;
    this.zoom=clamp(this.zoom*factor,.85,5);
    const ratio=previous/this.span-1;
    this.pan(anchor?(anchor.x-this.view.clientWidth/2)*ratio:0,anchor?(anchor.y-this.view.clientHeight/2)*ratio:0);
  }

  projectLabels(project:(p:THREE.Vector3)=>Point,elevation:(p:THREE.Vector3)=>number){
    for(const {element,point} of this.labels){
      point.y=elevation(point)+.03;
      const {x,y}=project(point);
      element.style.left=x+'px';element.style.top=y+'px';
      element.hidden=x<36||x>this.view.clientWidth-36||y<45||y>this.view.clientHeight-60;
    }
  }

  drawFlat(ctx:CanvasRenderingContext2D,project:(p:THREE.Vector3)=>Point){
    const r=this.region!;
    let image=this.images.get(r);
    if(!image){
      image=new Image();
      image.addEventListener('load',this.changed,{signal:this.signal});
      image.src=r.relief;this.images.set(r,image);
    }
    if(!image.naturalWidth)return;
    const corner=new THREE.Vector3(r.west-110,0,9-r.north),a=project(corner);
    corner.x+=regionSide;corner.z+=regionSide;
    const b=project(corner);
    ctx.drawImage(image,a.x,a.y,b.x-a.x,b.y-a.y);
  }
}
