import {drawRosterCues} from '../src/scenes/RosterCues.ts';

export async function runRosterCues(capture=()=>{}){
  const frame=document.querySelector('iframe'),w=frame.contentWindow,result=document.querySelector('#result');
  for(let n=0;!w.__asean&&n<200;n++)await new Promise(resolve=>setTimeout(resolve,100));
  const rt=w.__asean,scene=rt.scene;
  result.textContent='';
  for(const id of ['mira','lia','asha','keo','nadi']){
    await scene.prepareHero(id);rt.newGame(id,0);
    rt.step(16);const d=w.document,g=rt.G,s=g.roster[id],canvas=d.querySelector('#game');
    d.querySelector('#menu').hidden=true;
    g.auto=false;g.autoAim=false;g.st.crit=0;g.cds[0]=999;g.spawnT=g.durianT=999;
    const marks=()=>{
      const shapes=[];
      drawRosterCues({strip:(...args)=>shapes.push(args),facet:(...args)=>shapes.push(args)},g,true);
      return shapes;
    };
    const check=(ok,label)=>{if(!ok)throw Error(id+' '+label)};
    const shot=label=>{check(marks().length,label);scene.update(0,0);scene.drawTerrain();capture(id,label,canvas)};
    const cast=i=>{if(i===0){g.cds[0]=0;rt.step(16);g.cds[0]=999;return}g.cds[i]=0;if(i===4)g.ult=g.hero.ultNeed;rt.tryCast(i)};
    const step=n=>{for(let i=0;i<n;i++)rt.step(50)};
    const aim=(dx,dy)=>canvas.dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+dx,clientY:w.innerHeight/2+dy}));
    const foe=dx=>{const e=rt.makeGhost('pocong',g.p.x+dx,g.p.y);e.hp=e.maxHp=9999;e.spd=0;e.stun=999;return e};
    aim(200,0);check(!marks().length,'idle');
    switch(id){
      case 'mira':{
        cast(4);step(4);check(s.wave.distance>0,'advancing wavefront');
        shot('Last Stove Express');step(18);break;
      }
      case 'lia':
        foe(180);cast(0);cast(4);step(4);check(g.fx.some(f=>f.kind==='shadowstep'),'blink trail');shot('Midnight Hunt');step(50);break;
      case 'asha':
        foe(215);cast(1);foe(330);cast(0);step(12);cast(2);
        check(g.fx.some(f=>f.kind==='relay'&&f.hero===id),'receipt hit');shot('Receipt relay');step(12);break;
      case 'keo':
        cast(1);step(31);cast(4);cast(2);check(s.pulses.some(p=>p.redirected),'redirect');shot('Redirected downbeat');step(50);break;
      case 'nadi':{
        const contact=foe(5);contact.stun=0;contact.dmg=10;cast(3);step(1);
        check(!s.guard,'guard countered');shot('Still Palm counter');step(16);break;
      }
    }
    check(!marks().length,'expiry');rt.toMenu();result.textContent+='PASS '+id+'\n';
  }
}
document.querySelector('#run').onclick=()=>runRosterCues().catch(e=>{document.querySelector('#result').textContent+='FAIL '+e.message});
