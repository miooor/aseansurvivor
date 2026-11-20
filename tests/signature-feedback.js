import {SignatureFeedback} from '../src/scenes/SignatureFeedback.ts';

// Exercise the real movement, targeted basics, timing windows and spend casts.
// Capture the actual RegionWorld frame immediately after its WebGL draw.
const frame=document.querySelector('iframe'),output=document.querySelector('#result');
export async function runSignatures(capture=()=>{}){
  const w=frame.contentWindow,deadline=Date.now()+20000;
  while(!w.__asean&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
  if(!w.__asean)throw Error('Gameplay failed to initialize');
  const rt=w.__asean,scene=rt.scene,d=w.document;
  const key=(type,code)=>w.dispatchEvent(new w.KeyboardEvent(type,{code}));
  const step=n=>{for(let i=0;i<n;i++)rt.step(50)};
  const walk=(code,n)=>{key('keydown',code);try{step(n)}finally{key('keyup',code)}};
  for(const id of ['rempit','mira','dani','lia','ustaz','nok','lan','sari','asha','vanna','keo','nadi']){
    await scene.prepareHero(id);rt.newGame(id,0);d.querySelector('#menu').hidden=true;
    const g=rt.G;g.auto=false;g.cds[0]=999;g.spawnT=g.durianT=999;
    const check=(ok,label)=>{if(!ok)throw Error(id+' '+label)};
    const probe=new SignatureFeedback(),frames={};
    function record(){
      const marks=[],x=g.p.x,y=g.p.y;
      const local=([px,py,h])=>[Math.round(px-x),Math.round(py-y),Math.round(h)];
      const ink={
        strip:(points,...style)=>marks.push(['strip',points.map(local),...style]),
        glow:(point,...style)=>marks.push(['glow',local(point),...style])
      };
      probe.draw(ink,g,true);
      return JSON.stringify(marks);
    }
    const shot=label=>{
      scene.update(0,0);scene.drawTerrain();frames[label]=record();
      check(frames[label]!=='[]','visible '+label);
      const canvas=d.querySelector('#game');
      if(label==='Ready'){
        const rendered=canvas.toDataURL();
        const feedback=scene.terrain.signatures,draw=feedback.draw;
        try{feedback.draw=()=>{};scene.drawTerrain();check(canvas.toDataURL()!==rendered,'visible in gameplay framebuffer')}
        finally{feedback.draw=draw;scene.drawTerrain()}
      }
      capture(id,label,canvas,rt.scale);
    };
    const cast=i=>rt.tryCast(i);
    const foe=(dx)=>{const e=rt.makeGhost('pocong',g.p.x+dx,g.p.y);e.hp=e.maxHp=9999;e.spd=0;e.stun=999;return e};
    const aim=d.querySelector('#game');
    aim.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+100,clientY:w.innerHeight/2}));
    shot('Idle');
    switch(id){
      case 'rempit':
        walk('KeyD',18);check(g.identity.charge>0&&g.identity.charge<100,'building');shot('Build');
        walk('KeyD',60);check(g.identity.charge===100,'redline');shot('Ready');cast(1);check(g.p.dash.fire,'burning dash');break;
      case 'mira':
        foe(160);cast(1);check(g.identity.ready,'hook landed');shot('Ready');
        cast(2);check(g.identity.releaseT>0&&!g.identity.ready,'empowered sweep');break;
      case 'dani':
        cast(2);shot('Planted');walk('KeyD',24);check(g.roster.dani.anchor?.ready&&!g.identity.ready,'armed away');shot('Armed');
        walk('KeyA',22);check(g.identity.ready,'returned');shot('Ready');cast(3);check(g.roster.dani.shield.hp===30,'shield');break;
      case 'lia':
        cast(2);check(!g.roster.lia.spools&&record()===frames.Idle,'empty dash leaves belt unchanged');step(6);g.cds[2]=0;
        foe(140);g.cds[0]=0;
        for(let lap=0;lap<4&&g.roster.lia.spools<3;lap++){
          walk('KeyS',18);walk('KeyW',18);
        }
        check(g.roster.lia.spools===3,'three moving catches');shot('Ready');
        cast(2);check(!g.roster.lia.spools,'spent belt');break;
      case 'ustaz':
        foe(150);g.cds[0]=0;step(65);check(g.identity.charge===4,'four lights');shot('Ready');cast(3);break;
      case 'nok':
        cast(1);cast(2);step(18);check(g.identity.charge===2,'finisher available');shot('Ready');cast(3);break;
      case 'lan':
        foe(80).slowT=30;cast(2);step(105);check(g.identity.charge===100,'high tide');shot('Ready');g.cds[2]=0;cast(2);break;
      case 'sari':
        {const e=foe(8);e.stun=0;cast(3);step(3);e.stun=999;step(22)}check(g.identity.charge===1,'parry');shot('Ready');cast(1);break;
      case 'asha':
        foe(220);cast(1);g.cds[0]=0;step(18);check(g.identity.ready,'served ticket');shot('Ready');cast(2);check(!g.roster.asha.tickets.length,'collection');break;
      case 'vanna':
        cast(1);cast(2);check(g.identity.ready,'crossing');shot('Ready');cast(3);check(!g.roster.vanna.cross,'detonation');break;
      case 'keo':
        cast(1);step(31);check(g.identity.ready,'open measure');shot('Ready');cast(2);check(!g.identity.ready,'next measure');break;
      case 'nadi':
        cast(2);step(41);check(g.identity.ready,'cured coat');shot('Ready');cast(1);check(!g.roster.nadi.layers.length,'peel');break;
    }
    if(['ustaz','rempit','nok','lan','sari'].includes(id))check(g.identity.releaseT>0,'signature release');
    shot('Spend');
    check(frames.Ready!==frames.Idle&&frames.Spend!==frames.Ready,'distinct readiness and spend geometry');
    if(id==='dani')check(frames.Armed!==frames.Ready,'return signal');
    if(id==='lia'||id==='keo'){
      g.cds[0]=999;step(55);check(record()===frames.Idle,'spend and timing window expire');
    }
    rt.newGame(id,0);const fresh=[];
    probe.draw({strip:()=>fresh.push('strip'),glow:()=>fresh.push('glow')},rt.G,true);
    check(fresh.length===JSON.parse(frames.Idle).length,'reset cue count');
    rt.toMenu();output.textContent+='PASS '+id+'\n';
  }
}
const button=document.querySelector('#run');
button.onclick=async()=>{
  output.textContent='';button.disabled=true;
  try{await runSignatures()}catch(e){output.textContent+='FAIL '+e.message;throw e}
  finally{button.disabled=false}
};
