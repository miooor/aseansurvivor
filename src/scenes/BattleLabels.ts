import * as THREE from 'three';
import {GROUND_DEPTH} from './SpellRibbons';

type Label = {sprite:THREE.Sprite; text:string; width:number; height:number};
type Style = {size:number; color:string; combat?:boolean; glow?:string};

export class BattleLabels {
  readonly group=new THREE.Group();
  elevationAt=(x:number,y:number)=>0;
  private labels=new Map<object,Label>();
  private seen=new Set<object>();

  begin(){this.seen.clear()}
  show(key:object,text:string,x:number,y:number,lift:number,style:Style,scale=1,opacity=1){
    this.seen.add(key);
    let label=this.labels.get(key);
    if(!label||label.text!==text){
      if(label)this.remove(key,label);
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;
      const dpr=2,font=(style.combat?'italic 800 ':'600 ')+style.size*dpr+'px "Chakra Petch", system-ui, sans-serif';
      ctx.font=font;
      const padding=style.glow?36:12;
      canvas.width=Math.ceil(ctx.measureText(text).width+(style.glow?padding:20)*dpr);
      canvas.height=Math.ceil((style.size+padding)*dpr);
      ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';
      if(style.glow){
        ctx.direction='rtl';
        ctx.shadowColor=style.glow;ctx.shadowBlur=9*dpr;
      }
      ctx.strokeStyle=style.glow?'#095125':'#18101c';ctx.lineWidth=(style.combat?5:3)*dpr;ctx.lineJoin='round';
      ctx.strokeText(text,canvas.width/2,canvas.height/2);
      ctx.fillStyle=style.color;ctx.fillText(text,canvas.width/2,canvas.height/2);
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:false,depthWrite:false}));
      sprite.name=text;sprite.renderOrder=style.glow?18:60;
      label={sprite,text,width:canvas.width/dpr,height:canvas.height/dpr};
      this.labels.set(key,label);this.group.add(sprite);
    }
    label.sprite.position.set(x,this.elevationAt(x,y)+lift*GROUND_DEPTH,y*GROUND_DEPTH);
    label.sprite.scale.set(label.width*scale,label.height*scale,1);
    label.sprite.material.opacity=opacity;
  }

  private remove(key:object,label:Label){
    this.group.remove(label.sprite);label.sprite.material.map?.dispose();
    label.sprite.material.dispose();this.labels.delete(key);
  }

  finish(){for(const [key,label] of this.labels)if(!this.seen.has(key))this.remove(key,label)}
  destroy(){for(const [key,label] of this.labels)this.remove(key,label)}
}
