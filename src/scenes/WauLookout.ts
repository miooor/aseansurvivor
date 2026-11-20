import * as THREE from 'three';
import type {WauLookout} from '../content/world.js';
import type {RunState} from '../game/runtime.js';
import type {BattleMarks} from './BattleMarks';
import {GROUND_DEPTH} from './SpellRibbons';

function paintWau(){
  const canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=192;
  const ctx=canvas.getContext('2d')!;
  ctx.lineJoin='round';ctx.lineCap='round';
  const silk=ctx.createLinearGradient(40,10,195,155);
  silk.addColorStop(0,'#d9795f');silk.addColorStop(.56,'#9e454c');silk.addColorStop(1,'#5e3046');
  ctx.fillStyle=silk;ctx.strokeStyle='#49323b';ctx.lineWidth=7;
  ctx.beginPath();ctx.moveTo(128,9);
  ctx.bezierCurveTo(105,40,58,31,18,67);ctx.quadraticCurveTo(75,56,113,106);
  ctx.lineTo(122,117);ctx.quadraticCurveTo(83,141,48,122);
  ctx.quadraticCurveTo(61,162,128,166);ctx.quadraticCurveTo(195,162,208,122);
  ctx.quadraticCurveTo(173,141,134,117);ctx.lineTo(143,106);
  ctx.quadraticCurveTo(181,56,238,67);ctx.bezierCurveTo(198,31,151,40,128,9);
  ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#e9bb77';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(128,17);ctx.lineTo(128,156);
  ctx.moveTo(34,63);ctx.quadraticCurveTo(128,25,222,63);
  ctx.moveTo(58,133);ctx.quadraticCurveTo(128,180,198,133);ctx.stroke();
  for(const side of [-1,1]){
    ctx.save();ctx.translate(128,0);ctx.scale(side,1);
    for(const [x,y,size] of [[22,60,10],[47,61,8],[69,62,6],[23,145,7],[43,143,5]]){
      ctx.fillStyle='#f2d89b';ctx.beginPath();ctx.ellipse(x,y,size,3,-.55,0,Math.PI*2);ctx.fill();
    }
    ctx.strokeStyle='#d69b63';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(13,164);ctx.quadraticCurveTo(13,174,21,184);ctx.stroke();
    ctx.restore();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export class WauKite {
  readonly group=new THREE.Group();
  private texture=paintWau();
  private fabric=new THREE.SpriteMaterial({map:this.texture,alphaTest:.1});
  private sprite=new THREE.Sprite(this.fabric);
  private thread=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),
    new THREE.LineBasicMaterial({color:0xd6bc87}));

  constructor({station}:WauLookout){
    this.group.position.set(station.x-37,0,(station.y-38)*GROUND_DEPTH);
    this.sprite.scale.set(106,79.5,1);
    this.thread.frustumCulled=false;
    this.group.add(this.sprite,this.thread);
  }

  draw(g:RunState,reduced:boolean){
    const wind=g.wauWind;
    const lookout=g.world.wauLookout;
    this.group.visible=!!wind&&!g.raid;
    if(!wind||!lookout||g.raid)return;
    const height=wind.phase==='gust'?1:wind.phase==='raising'?wind.progress:
      wind.phase==='cooldown'?Math.max(0,1-wind.progress*lookout.cooldown*2.3):0;
    const lift=reduced?(wind.phase==='gust'?1:0):height;
    const sway=reduced?0:Math.sin(g.clock*7)*lift;
    this.sprite.position.set(18+92*lift+6*sway,71+143*lift,-22*lift);
    this.fabric.rotation=.16-.26*lift+.07*sway;
    const points=this.thread.geometry.getAttribute('position');
    points.setXYZ(0,0,30,0);
    points.setXYZ(1,this.sprite.position.x,this.sprite.position.y-14,this.sprite.position.z);
    points.needsUpdate=true;
  }

  dispose(){
    this.group.removeFromParent();
    this.thread.geometry.dispose();this.thread.material.dispose();this.fabric.dispose();this.texture.dispose();
  }
}

export function drawWauLane(floor:BattleMarks,g:RunState,reduced:boolean){
  const lane=g.world.wauLookout,wind=g.wauWind;
  if(!lane||!wind||Math.abs(g.p.x-lane.station.x)>1600||Math.abs(g.p.y-lane.station.y)>1300)return;
  const {x,y,w,h,band,station}=lane;
  const {phase,progress}=wind;
  const jade=0xb0f5df,gold=0xe8bf76,active=phase==='gust',raising=phase==='raising';
  const color=active?jade:gold;
  floor.fillStyle(color,active||raising?.10:.032).fillRect(x,y,w,h);
  for(const edge of [y,y+h])for(let dx=0;dx<w;dx+=95){
    floor.lineStyle(3,color,active||raising?.76:.45).lineBetween(x+dx,edge,x+Math.min(w,dx+58),edge);
  }
  for(let dx=200;dx<w-30;dx+=170){
    const a=x+dx,mid=y+h/2;
    floor.lineStyle(4,color,active||raising?.8:.34).beginPath().moveTo(a-16,mid-15).lineTo(a+4,mid).lineTo(a-16,mid+15).strokePath();
  }
  floor.lineStyle(3,gold,.65).strokeCircle(station.x,station.y,49);
  if(raising)floor.lineStyle(6,gold,.98).beginPath().arc(station.x,station.y,49,-Math.PI/2,-Math.PI/2+progress*Math.PI*2).strokePath();
  if(!active)return;
  const right=Math.min(w,progress*(w+band)),left=Math.max(0,progress*(w+band)-band);
  if(reduced){floor.lineStyle(5,jade,.9).strokeRect(x,y,w,h);return}
  floor.fillStyle(jade,.27).fillRect(x+left,y,right-left,h);
  floor.lineStyle(5,0xe1fff4,.86).lineBetween(x+right,y,x+right,y+h);
  for(let i=0;i<7;i++){
    const py=y+(i+1)*h/8,px=x+Math.max(left,right-75-(i%3)*20);
    floor.lineStyle(i%2?3:5,jade,.92).lineBetween(px,py,x+Math.max(left,right-10),py-7);
  }
}
