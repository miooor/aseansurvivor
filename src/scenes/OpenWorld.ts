import Phaser from 'phaser';
import {WORLD_SIZE,HALF} from '../content/world.js';
import type {MapRect} from '../content/world.js';
import type {RunState} from '../game/runtime.js';

export class OpenWorld {
  private objects: (Phaser.GameObjects.Graphics|Phaser.GameObjects.Image|Phaser.GameObjects.TileSprite)[]=[];
  private masks: Phaser.GameObjects.Graphics[]=[];
  private map=document.getElementById('worldMap')!;
  private layout:RunState['world']|null=null;
  constructor(private scene:Phaser.Scene){}
  private bank(rect:MapRect,margin=0){
    const x=rect.x-margin,y=rect.y-margin,w=rect.w+margin*2,h=rect.h+margin*2,r=Math.min(55,w/4,h/4),points:Phaser.Math.Vector2[]=[];
    const edge=(ax:number,ay:number,bx:number,by:number)=>{
      const length=Math.hypot(bx-ax,by-ay),n=Math.max(2,Math.ceil(length/100));
      for(let i=0;i<n;i++){
        const t=i/n,wave=Math.sin(t*Math.PI)*Math.sin(i*1.8+ax*.01+ay*.01)*35;
        points.push(new Phaser.Math.Vector2(ax+(bx-ax)*t+(by-ay)/length*wave,ay+(by-ay)*t-(bx-ax)/length*wave));
      }
    };
    const corner=(cx:number,cy:number,start:number)=>{for(let i=0;i<6;i++){const a=start+i/6*Math.PI/2;points.push(new Phaser.Math.Vector2(cx+Math.cos(a)*r,cy+Math.sin(a)*r))}};
    edge(x+r,y,x+w-r,y);corner(x+w-r,y+r,-Math.PI/2);
    edge(x+w,y+r,x+w,y+h-r);corner(x+w-r,y+h-r,0);
    edge(x+w-r,y+h,x+r,y+h);corner(x+r,y+h-r,Math.PI/2);
    edge(x,y+h-r,x,y+r);corner(x+r,y+r,Math.PI);
    return points;
  }
  private build(w:RunState['world']){
    this.destroy();this.objects=[];this.layout=w;const scene=this.scene;
    const LANDMARKS=w.landmarks,BUILDINGS=w.buildings,TREES=w.trees;
    this.objects.push(scene.add.tileSprite(0,0,WORLD_SIZE+1600,WORLD_SIZE+1600,w.urban?'terrain':'region-grass',w.urban?'stone':undefined).setTileScale(w.urban?.7:.65).setTint(w.tint).setDepth(-10000).setName('terrain-ground'));
    const atlas=scene.textures.get('buildings'),source=atlas.getSourceImage() as HTMLImageElement;
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){const x=Math.round(col*source.width/2),y=Math.round(row*source.height/2);if(!atlas.has(String(row*2+col)))atlas.add(String(row*2+col),0,x,y,Math.round((col+1)*source.width/2)-x,Math.round((row+1)*source.height/2)-y)}
    const ground=scene.add.graphics().setDepth(-9000);this.objects.push(ground);
    for(const path of w.roads){
      const length=path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0);
      const curve=new Phaser.Curves.Spline(path.flat()),points=curve.getSpacedPoints(Math.ceil(length/135));
      for(const [i,p]of points.entries()){
        const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
        const road=scene.add.image(p.x,p.y,'terrain','road').setDisplaySize(w.urban?440:400,400)
          .setRotation(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2).setDepth(-9200).setName('terrain-road');
        if(w.urban)road.setTint(w.id==='kl'?0x7f92a4:0xc6b8a6);
        this.objects.push(road);
      }
    }
    for(const [px,py]of w.paddies)for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const x=px+140+col*300+Math.sin(row*7+col)*25,y=py+120+row*260+Math.cos(col*5+row)*20;
      this.objects.push(scene.add.image(x,y,'terrain','paddy').setDisplaySize(365,325).setRotation(Math.sin(row*3+col)*.075).setTint(w.id==='kedah'?0xf1dfa3:0xc4d6b1).setDepth(-9400).setName('terrain-paddy'));
    }
    for(const water of w.waters){
      ground.fillStyle(0x59734d,.55).fillPoints(this.bank(water,38),true);
      ground.fillStyle(0x444c31,.6).fillPoints(this.bank(water,18),true);
      const mask=scene.add.graphics().fillStyle(0xffffff).fillPoints(this.bank(water),true).setVisible(false);
      this.masks.push(mask);
      this.objects.push(scene.add.tileSprite(water.x+water.w/2,water.y+water.h/2,water.w+90,water.h+90,'terrain','water')
        .setTileScale(.65).setTint(w.id==='perak'?0xa9e1db:0xa2c4c1).setMask(mask.createGeometryMask()).setDepth(-8800).setName('terrain-water'));
    }
    for(const bridge of w.bridges){
      ground.fillStyle(0x584d35).fillRoundedRect(bridge.x-3,bridge.y-3,bridge.w+6,bridge.h+6,6);
      this.objects.push(scene.add.tileSprite(bridge.x+bridge.w/2,bridge.y+bridge.h/2,bridge.w,bridge.h,'terrain','wood').setTileScale(.55).setTint(0xcfbc9b).setDepth(-8400).setName('terrain-bridge'));
    }
    for(const rock of w.rocks){
      ground.fillStyle(0x2a373b,.35).fillPoints(this.bank(rock),true);
      for(let y=rock.y+80;y<rock.y+rock.h;y+=180)this.objects.push(scene.add.image(rock.x+rock.w/2,y,'region-props','1').setDisplaySize(rock.w+70,250).setDepth(y+10000));
    }
    for(const [i,b] of BUILDINGS.entries()){
      ground.fillStyle(0x091b18,.22).fillEllipse(b.x+b.w/2,b.y+b.h,b.w+80,95);
      this.objects.push(scene.add.image(b.x+b.w/2,b.y+b.h,w.id==='johor'?'buildings':'region-props',String(w.id==='johor'?(b.id?.startsWith('stall')?2:0)+i%2:('frame' in b?b.frame:0))).setDisplaySize(b.w+90,b.w+90).setOrigin(.5,.92).setDepth(b.y+b.h+10000));
    }
    for(const t of TREES)this.objects.push(scene.add.image(t.x,t.y,'actors',String(t.frame)).setDisplaySize(190,210).setOrigin(.5,.85).setDepth(t.y+10000));
    for(const s of LANDMARKS){this.objects.push(scene.add.image(s.x-150,s.y+100,'actors','12').setDisplaySize(75,110).setOrigin(.5,.85).setDepth(s.y+10100))}
    this.map.innerHTML=`<strong>${w.name}</strong><span id="regionName"></span><svg viewBox="0 0 6000 6000" role="img" aria-label="${w.name}: player, landmarks and terrain"><rect width="6000" height="6000" fill="#233c32"/>`+w.roads.map(path=>`<polyline points="${path.map(p=>`${p[0]+HALF},${p[1]+HALF}`).join(' ')}" fill="none" stroke="#bda87a" stroke-width="75" stroke-linecap="round" stroke-linejoin="round"/>`).join('')+w.waters.map(r=>`<polygon points="${this.bank(r).map(p=>`${p.x+HALF},${p.y+HALF}`).join(' ')}" fill="#5796a3"/>`).join('')+w.bridges.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#d1b67d"/>`).join('')+w.rocks.map(r=>`<polygon points="${this.bank(r).map(p=>`${p.x+HALF},${p.y+HALF}`).join(' ')}" fill="#899599"/>`).join('')+LANDMARKS.map((s,i)=>`<circle data-site="${s.id}" cx="${s.x+HALF}" cy="${s.y+HALF}" r="150" fill="#78887a"><title>${i+1}. ${s.name}</title></circle>`).join('')+'<circle id="mapPlayer" r="100" fill="#fff4b5" stroke="#17281d" stroke-width="35"/></svg><span id="mapObjective"></span>';

  }
  update(g:RunState|null){
    if(g&&g.world.id!==this.layout?.id)this.build(g.world);
    const LANDMARKS=g?.world.landmarks||[];
    const visible=!!g&&!g.raid;for(const object of this.objects)object.setVisible(visible);this.map.hidden=!visible||!!g?.over;if(!visible||!g)return;
    for(const object of this.objects)if(object instanceof Phaser.GameObjects.TileSprite&&object.name==='terrain-water')object.tilePositionY=matchMedia('(prefers-reduced-motion: reduce)').matches?0:-g.t*3;
    document.getElementById('mapPlayer')!.setAttribute('cx',String(g.p.x+HALF));document.getElementById('mapPlayer')!.setAttribute('cy',String(g.p.y+HALF));
    const nearby=LANDMARKS.reduce((a,b)=>Math.hypot(g.p.x-a.x,g.p.y-a.y)<Math.hypot(g.p.x-b.x,g.p.y-b.y)?a:b);
    document.getElementById('regionName')!.textContent=nearby.name;
    for(const s of LANDMARKS)this.map.querySelector(`[data-site="${s.id}"]`)!.setAttribute('fill',g.exploration.claimed.includes(s.id)?'#d9b96f':g.exploration.visited.includes(s.id)?'#89dfc5':'#78887a');
    const svg=this.map.querySelector('svg')!;
    for(const marker of this.map.querySelectorAll('[data-event]'))marker.remove();
    for(const event of Object.values(g.encounters||{}))if(event.status==='active'||event.status==='available'&&event.discovered){
      const marker=document.createElementNS('http://www.w3.org/2000/svg','g');marker.setAttribute('data-event',event.id);marker.innerHTML=`<circle cx="${event.x+HALF}" cy="${event.y+HALF}" r="130" fill="#ffbd77" stroke="#211c17" stroke-width="30"/><text x="${event.x+HALF}" y="${event.y+HALF-180}" fill="#fff4cf" font-size="175" text-anchor="middle">${event.name}</text><title>${event.name} · ${event.status}</title>`;svg.append(marker);
    }
    const next=LANDMARKS.filter(s=>s.reward&&!g.exploration.claimed.includes(s.id)).sort((a,b)=>Math.hypot(g.p.x-a.x,g.p.y-a.y)-Math.hypot(g.p.x-b.x,g.p.y-b.y))[0];
    const distance=next?Math.hypot(g.p.x-next.x,g.p.y-next.y):0;
    const guards=next?(g.exploration.guards[next.id]||[]).filter(e=>!e.dead).length:0;
    document.getElementById('mapObjective')!.textContent=next?(distance<380?(guards?`Cache · defeat ${guards} guardians`:'Approach the supply cache'):`${next.name} · ${Math.round(distance)} m`):'All supply caches claimed';
  }
  destroy(){for(const object of this.objects){object.clearMask(true);object.destroy()}for(const mask of this.masks)mask.destroy();this.masks=[];this.objects=[];this.map.hidden=true}
}
