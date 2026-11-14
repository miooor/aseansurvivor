import Phaser from 'phaser';
import {WORLD_SIZE,HALF} from '../content/world.js';
import type {RunState} from '../game/runtime.js';

export class OpenWorld {
  private objects: (Phaser.GameObjects.Graphics|Phaser.GameObjects.Image|Phaser.GameObjects.TileSprite)[]=[];
  private map=document.getElementById('worldMap')!;
  private layout:RunState['world']|null=null;
  constructor(private scene:Phaser.Scene){}
  private build(w:RunState['world']){
    this.destroy();this.objects=[];this.layout=w;const scene=this.scene;
    const LANDMARKS=w.landmarks,BUILDINGS=w.buildings,TREES=w.trees;
    this.objects.push(scene.add.tileSprite(0,0,WORLD_SIZE+1600,WORLD_SIZE+1600,'region-grass').setTileScale(.55).setTint(w.tint).setDepth(-10000));
    const atlas=scene.textures.get('buildings'),source=atlas.getSourceImage() as HTMLImageElement;
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){const x=Math.round(col*source.width/2),y=Math.round(row*source.height/2);if(!atlas.has(String(row*2+col)))atlas.add(String(row*2+col),0,x,y,Math.round((col+1)*source.width/2)-x,Math.round((row+1)*source.height/2)-y)}
    const ground=scene.add.graphics().setDepth(-9000);this.objects.push(ground);
    if(w.urban){
      ground.fillStyle(w.id==='kl'?0x253040:0x61544c).fillRect(-HALF,-HALF,WORLD_SIZE,WORLD_SIZE);
      for(let y=-HALF;y<HALF;y+=100)for(let x=-HALF;x<HALF;x+=160){ground.lineStyle(2,w.id==='kl'?0x48546d:0x927e6b,.25).strokeRect(x+(y%200?80:0),y,155,95)}
    }
    for(const path of w.roads)for(let i=1;i<path.length;i++){
      const [a,b]=[path[i-1],path[i]];ground.lineStyle(w.urban?320:210,w.path,w.urban?.8:.25).lineBetween(a[0],a[1],b[0],b[1]);
      ground.fillStyle(w.path,w.urban?.8:.25).fillCircle(b[0],b[1],w.urban?160:105);
      if(w.id==='kl')ground.lineStyle(3,0x84c8d4,.45).lineBetween(a[0],a[1],b[0],b[1]);
    }
    for(const s of LANDMARKS){ground.fillStyle(w.path,.12).fillEllipse(s.x,s.y,800,620)}
    for(const [px,py]of w.paddies)for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const x=px+col*320,y=py+row*280;ground.fillStyle(w.id==='kedah'?0x6f713a:0x203d39,.55).fillRect(x,y,280,235);ground.lineStyle(7,0xa6a05d,.55).strokeRect(x,y,280,235);
      for(let k=0;k<7;k++)ground.lineStyle(3,w.id==='kedah'?0xe0c76b:0x9cae61,.65).lineBetween(x+20+k*38,y+15,x+20+k*38,y+220);
    }
    for(const water of w.waters){
      ground.fillStyle(0x788570,.6).fillRect(water.x-30,water.y-30,water.w+60,water.h+60);
      ground.fillStyle(w.water).fillRect(water.x,water.y,water.w,water.h);
      for(let y=water.y+35;y<water.y+water.h;y+=90)for(let x=water.x+25;x<water.x+water.w-80;x+=180)ground.lineStyle(2,0xb2e5df,.17).lineBetween(x,y,x+70,y-8);
    }
    for(const bridge of w.bridges){
      ground.fillStyle(0x514936).fillRect(bridge.x,bridge.y,bridge.w,bridge.h);
      for(let y=bridge.y+5;y<bridge.y+bridge.h-8;y+=24)ground.fillStyle(0xab9872).fillRect(bridge.x+4,y,bridge.w-8,18);
      ground.lineStyle(5,0xd2bb8c).strokeRect(bridge.x,bridge.y,bridge.w,bridge.h);
    }
    for(const rock of w.rocks){
      ground.fillStyle(0x2a373b,.5).fillRect(rock.x,rock.y,rock.w,rock.h);
      for(let y=rock.y+80;y<rock.y+rock.h;y+=180)this.objects.push(scene.add.image(rock.x+rock.w/2,y,'region-props','1').setDisplaySize(rock.w+70,250).setDepth(y+10000));
    }
    ground.lineStyle(14,0x1b3028,.9).strokeRect(-HALF,-HALF,WORLD_SIZE,WORLD_SIZE);
    for(const [i,b] of BUILDINGS.entries()){
      ground.fillStyle(0x091b18,.22).fillEllipse(b.x+b.w/2,b.y+b.h,b.w+80,95);
      this.objects.push(scene.add.image(b.x+b.w/2,b.y+b.h,w.id==='johor'?'buildings':'region-props',String(w.id==='johor'?(b.id?.startsWith('stall')?2:0)+i%2:('frame' in b?b.frame:0))).setDisplaySize(b.w+90,b.w+90).setOrigin(.5,.92).setDepth(b.y+b.h+10000));
    }
    for(const t of TREES)this.objects.push(scene.add.image(t.x,t.y,'actors',String(t.frame)).setDisplaySize(190,210).setOrigin(.5,.85).setDepth(t.y+10000));
    for(const s of LANDMARKS){this.objects.push(scene.add.image(s.x-150,s.y+100,'actors','12').setDisplaySize(75,110).setOrigin(.5,.85).setDepth(s.y+10100))}
    this.map.innerHTML=`<strong>${w.name}</strong><span id="regionName"></span><svg viewBox="0 0 6000 6000" role="img" aria-label="${w.name}: player, landmarks and terrain"><rect width="6000" height="6000" fill="#233c32"/>`+w.waters.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#5796a3"/>`).join('')+w.bridges.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#d1b67d"/>`).join('')+w.rocks.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#899599"/>`).join('')+LANDMARKS.map((s,i)=>`<circle data-site="${s.id}" cx="${s.x+HALF}" cy="${s.y+HALF}" r="150" fill="#78887a"><title>${i+1}. ${s.name}</title></circle>`).join('')+'<circle id="mapPlayer" r="100" fill="#fff4b5" stroke="#17281d" stroke-width="35"/></svg><span id="mapObjective"></span>';

  }
  update(g:RunState|null){
    if(g&&g.world.id!==this.layout?.id)this.build(g.world);
    const LANDMARKS=g?.world.landmarks||[];
    const visible=!!g&&!g.raid;for(const object of this.objects)object.setVisible(visible);this.map.hidden=!visible||!!g?.over;if(!visible||!g)return;
    document.getElementById('mapPlayer')!.setAttribute('cx',String(g.p.x+HALF));document.getElementById('mapPlayer')!.setAttribute('cy',String(g.p.y+HALF));
    const nearby=LANDMARKS.reduce((a,b)=>Math.hypot(g.p.x-a.x,g.p.y-a.y)<Math.hypot(g.p.x-b.x,g.p.y-b.y)?a:b);
    document.getElementById('regionName')!.textContent=nearby.name;
    for(const s of LANDMARKS)this.map.querySelector(`[data-site="${s.id}"]`)!.setAttribute('fill',g.exploration.claimed.includes(s.id)?'#d9b96f':g.exploration.visited.includes(s.id)?'#89dfc5':'#78887a');
    const next=LANDMARKS.filter(s=>s.reward&&!g.exploration.claimed.includes(s.id)).sort((a,b)=>Math.hypot(g.p.x-a.x,g.p.y-a.y)-Math.hypot(g.p.x-b.x,g.p.y-b.y))[0];
    const distance=next?Math.hypot(g.p.x-next.x,g.p.y-next.y):0;
    const guards=next?(g.exploration.guards[next.id]||[]).filter(e=>!e.dead).length:0;
    document.getElementById('mapObjective')!.textContent=next?(distance<380?(guards?`Cache · defeat ${guards} guardians`:'Approach the supply cache'):`${next.name} · ${Math.round(distance)} m`):'All supply caches claimed';
  }
  destroy(){for(const object of this.objects)object.destroy();this.map.hidden=true}
}
