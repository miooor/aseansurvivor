import Phaser from 'phaser';
import type {RunState} from '../game/runtime.js';

const OFFSETS:Record<string,number>={johor:90,melaka:20,perak:50,kl:110,penang:150,kedah:0};

export class Weather {
  kind:'clear'|'mist'|'rain'='clear';
  intensity=0;clock=0;visible=false;particleCount=0;
  private graphics:Phaser.GameObjects.Graphics;
  constructor(private scene:Phaser.Scene){
    this.graphics=scene.add.graphics().setScrollFactor(0).setDepth(28000).setName('outdoor-weather');
  }
  update(run:RunState|null){
    const g=this.graphics;g.clear();this.visible=!!run&&!run.raid&&!run.over;g.setVisible(this.visible);this.particleCount=0;
    if(!run||!this.visible)return;
    this.clock=run.t;
    const phase=(run.t+(OFFSETS[run.world.id]??0))%180;
    this.kind=phase<40?'clear':phase<70||phase>=140?'mist':'rain';
    this.intensity=this.kind==='clear'?0:this.kind==='rain'?.2+.8*Math.sin((phase-70)/70*Math.PI):phase<70?Math.sin((phase-40)/30*Math.PI)*.6:(180-phase)/40*.65;
    if(!this.intensity)return;
    const camera=this.scene.cameras.main,w=camera.width,h=camera.height,z=camera.zoom;
    // Counter camera zoom so weather stays in screen pixels while the world moves.
    g.setScale(1/z).setPosition(w/2*(1-1/z),h/2*(1-1/z));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?0:run.t;
    g.fillStyle(this.kind==='rain'?0x102c3c:0xb5d2c8,this.intensity*(this.kind==='rain'?.06:.025)).fillRect(0,0,w,h);
    for(let i=0;i<4;i++){
      const x=((i*317+t*(8+i*2))%(w+600))-300,y=h*(.18+i*.22);
      g.fillStyle(0xd1e4dc,this.intensity*.025).fillEllipse(x,y,680,170);
    }
    if(this.kind!=='rain'||reduced)return;
    this.particleCount=Math.min(84,Math.ceil(w*h/11000));
    g.lineStyle(1.6,0xc9e5e2,this.intensity*.45);
    for(let i=0;i<this.particleCount;i++){
      const x=((i*197.3+t*38)%(w+80))-40,y=((i*293.7+t*480)%(h+100))-50;
      g.lineBetween(x,y,x-9,y+22);
    }
  }
}
