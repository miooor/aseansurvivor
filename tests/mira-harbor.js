import {drawCast} from '../src/scenes/three-skill-effects.ts';
import {drawRosterCues} from '../src/scenes/RosterCues.ts';

const frame=document.querySelector('iframe'),report=document.querySelector('#report');
document.querySelector('#run').onclick=async()=>{
  const w=frame.contentWindow,d=w.document,rt=w.__asean;
  const key=code=>{for(const type of ['keydown','keyup'])w.dispatchEvent(new w.KeyboardEvent(type,{code:'Key'+code,bubbles:true}))};
  const check=(ok,label)=>{if(!ok)throw Error(label);report.textContent+='PASS '+label+'\n'};
  const step=n=>{for(let i=0;i<n;i++)rt.step(50)};
  const frames=document.querySelector('#frames');frames.replaceChildren();report.textContent='';
  try{
    await rt.scene.prepareHero('mira');
    const start=(practice=false)=>{
      rt.newGame('mira',0,practice);const g=rt.G;
      d.querySelector('#menu').hidden=true;g.auto=false;g.noElements=true;g.spawnT=g.durianT=g.cds[0]=999;g.st.crit=0;
      d.querySelector('#game').dispatchEvent(new w.MouseEvent('mousemove',{clientX:w.innerWidth/2+180,clientY:w.innerHeight/2}));return g;
    };
    const save=localStorage.getItem('aseanSurvivor.v1');
    let g=start();
    const foe=(x,y=0)=>{const e=rt.makeGhost('pocong',g.p.x+x,g.p.y+y);Object.assign(e,{x:g.p.x+x,y:g.p.y+y,hp:1000,maxHp:1000,r:4,spd:0,stun:999});return e};
    const shot=label=>{
      step(label==='Wok Knuckle'?0:label==='Last Stove Express'?1:2);
      const cast=g.fx.findLast(f=>f.kind==='spell'&&f.hero==='mira');
      const paths=[];
      const ink={strip:points=>paths.push(...points),facet:points=>paths.push(...points),glow:point=>paths.push(point)};
      drawCast(ink,cast,g,true);
      drawRosterCues(ink,g,true);
      check(paths.length>0&&paths.flat().every(Number.isFinite),label+' draws in reduced motion');
      rt.scene.update(0,0);rt.scene.drawTerrain();
      const canvas=d.querySelector('#game'),fig=document.createElement('figure'),img=new Image();
      img.src=canvas.toDataURL();fig.append(img,document.createTextNode(label));frames.append(fig);
    };
    const near=foe(75),off=foe(0,75);
    g.cds[0]=0;step(1);g.cds[0]=999;
    check(near.hp===985&&off.hp===1000,'basic strikes its forward arc');shot('Wok Knuckle');
    key('E');check(off.hp===972&&!g.identity.ready,'empty pot works immediately');
    g=start();const outside=foe(170,45);key('Q');check(outside.hp===1000&&!g.identity.ready,'a missed lid earns nothing');
    g.cds[1]=0;const targets=[foe(55),foe(80),foe(100)];key('Q');
    check(targets.every(e=>e.hp===976)&&g.identity.charge===3,'a piercing throw fills three portions');shot('Tin Lid Skipper');
    g.cds[2]=2;key('E');check(g.identity.charge===3,'rejected serving keeps the pot full');
    g.p.hp-=30;const hp=g.p.hp;
    g.cds[2]=0;key('E');check(targets.every(e=>e.hp===921)&&g.p.hp===hp+18&&!g.identity.ready,'serving spends once, heals and scalds');shot('Pagpag Salo-Salo');
    step(11);check(targets.every(e=>e.hp===893),'the full pot boils over a second time');
    key('F');check(g.roster.mira.braceUntil>g.t&&targets[0].kvx>0,'stockpot guard shoves on opening');shot('Stockpot Guard');
    g=start();g.evo[2]=true;const rim=foe(0,165);foe(200);key('Q');key('E');
    check(rim.hp===963&&g.fx.findLast(f=>f.skill==='mira-2')?.range===190,'evolved serving uses the wider radius');
    g=start();const boss=foe(180);boss.boss=true;key('Q');
    check(boss.hp===976&&g.identity.charge===1,'hitting a boss banks heat');
    step(165);check(!g.identity.ready,'unused portions cool');
    g.cds[1]=0;key('Q');key('F');g.ult=g.hero.ultNeed;key('R');
    const old=g;g=start();
    check(!old.identity.ready&&!old.roster.mira.wave&&!old.roster.mira.braceUntil&&!g.identity.charge,'restart clears cart, portions and guard');
    const early=foe(65),late=foe(315),edge=foe(180,80);
    key('R');step(4);check(early.hp===1000,'uncharged cart rejected');
    g.ult=g.hero.ultNeed;key('R');step(4);check(early.hp===924&&late.hp===1000,'cart reaches near target first');shot('Last Stove Express');
    step(15);check(early.hp===924&&late.hp===886&&edge.hp===1000,'the cart vents only at its destination');
    g=start();const auto=foe(75);g.auto=true;g.autoMode=0;step(4);
    check(auto.hp<=939&&!g.identity.ready,'auto banks a portion before serving');
    for(const [choice,expectedShove,expectedLoss] of [[null,180,20],[0,100,15],[1,300,20]]){
      g=start();
      if(choice!==null){
        g.level=2;rt.addXP(g.need);rt.step(0);d.querySelector('#up'+choice).click();
        check(!!g.specialization,'level-three brace specialization '+choice);
      }
      const guard=foe(80);key('F');check(guard.kvx===expectedShove,'brace opening force '+expectedShove);
      step(71);const hp=g.p.hp;g.p.invuln=0;
      g.eprojs.push({x:g.p.x,y:g.p.y,vx:0,vy:0,r:8,dmg:20,life:1});step(1);
      check(hp-g.p.hp===expectedLoss,'brace damage at 3.55 s for '+(g.specialization?.name||'base'));
    }
    g=start(true);key('E');check(!g.practice.complete,'empty pot cannot complete practice');
    g.cds[2]=0;key('Q');key('E');check(g.practice.complete,'keyboard completes stationary practice');
    d.querySelector('#practiceRetry').click();g=rt.G;
    check(!g.identity.ready&&!g.practice.complete&&!g.roster.mira.wave,'retry clears the kitchen');
    frame.style.width='390px';await new Promise(resolve=>setTimeout(resolve,100));
    const tap=id=>{
      const b=d.querySelector(id),rect=b.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
      const target=d.elementFromPoint(x,y);
      check(b.contains(target),'phone hit target '+id);
      for(const type of ['pointerdown','pointerup','click'])target.dispatchEvent(new w.PointerEvent(type,{pointerType:'touch',pointerId:2,clientX:x,clientY:y,bubbles:true}));
    };
    tap('#sk1');tap('#sk2');check(g.practice.complete,'mobile skill buttons complete practice');
    check(localStorage.getItem('aseanSurvivor.v1')===save,'run and practice preserve save');
    frame.style.width='';rt.toMenu();
  }catch(error){report.textContent+='FAIL '+error.message;console.error(error)}
};
