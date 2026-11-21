import {MONSTER_SKILLS} from '../src/content/monster-skills.js';

export function checkMonsterSkills(w,check){
  const rt=w.__asean;
  const start=(type,x=125)=>{
    rt.newGame('ustaz',0);
    const g=rt.G;
    g.auto=false;
    g.spawnT=g.durianT=g.pupT=999;
    g.cds.fill(999);
    g.clock=25;
    for(const id of Object.keys(g.stage.folklore))g.events.add('arrival:'+id);
    const e=rt.makeGhost(type,x,0);
    Object.assign(e,{spd:0,skillT:0,actions:1,slamT:999,spitT:999});
    Object.assign(g.p,{x:0,y:0,invuln:0});
    return {g,e};
  };
  const step=(n=1)=>{for(let i=0;i<n;i++)rt.step(50)};
  for(const [type,skill] of Object.entries(MONSTER_SKILLS)){
    const {g,e}=start(type);
    step();
    check(type+' prepares '+skill.name,e.windup>0&&e.monsterSkill?.name===skill.name&&e.folkloreMarks.length>0&&g.p.hp===g.p.maxHp);
    const marks=e.folkloreMarks;
    const snapshot=JSON.stringify(marks);
    const windup=e.windup;
    g.paused=true;
    step(4);
    check(type+' pauses its cast',e.windup===windup&&e.actions===1);
    g.paused=false;
    Object.assign(g.p,{x:-35,y:40});
    step();
    check(type+' locks its tell when the player moves',JSON.stringify(marks)===snapshot);
    for(let i=0;i<30&&e.actions===1;i++)step();
    check(type+' releases once',e.actions===2&&e.attackAt<=g.t&&marks.some(mark=>mark.fired));
    step(25);
    check(type+' clears spent marks',!e.folkloreMarks);
  }

  const lightningHit=disableAffinity=>{
    const {g,e}=start('sentinel');
    g.noElements=disableAffinity;
    step();
    const mark=e.folkloreMarks[0];
    Object.assign(g.p,{x:mark.x,y:mark.y});
    for(let i=0;i<30&&e.actions===1;i++)step();
    return g.p.maxHp-g.p.hp;
  };
  const typed=lightningHit(false), neutral=lightningHit(true);
  check('Fadli’s spirit affinity reduces the new lightning hit',neutral>0&&Math.abs(typed/neutral-.85)<1e-6);

  const {g,e}=start('toyol');
  e.skillT=999;
  rt.scene.update(0,0);
  const sprite=()=>rt.scene.sprites.get(e);
  check('Toyol idle uses the painted enemy sheet',sprite()?.key==='classic-ghost-motion'&&sprite().frame.name==='4');
  Object.assign(e,{moving:true,stride:16});
  g.paused=true;
  rt.scene.update(0,0);
  check('Toyol has a dedicated travel frame',sprite().frame.name===(w.matchMedia('(prefers-reduced-motion: reduce)').matches?'4':'5'));
  g.paused=false;
  e.skillT=0;
  rt.scene.update(0,50);
  check('Ember Pounce uses a dedicated anticipation frame',sprite().frame.name==='6');
  for(let i=0;i<24&&e.windup>0;i++)rt.scene.update(0,50);
  check('Ember Pounce uses a dedicated release frame',sprite().frame.name==='7');
  const cancelled=start('toyol');
  step();
  rt.kill(cancelled.e);
  step(35);
  check('Killing a casting monster cancels its skill',cancelled.g.p.hp===cancelled.g.p.maxHp);
  rt.toMenu();
}
