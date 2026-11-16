// Failure cases: missing terrain frames, white rectangular cutouts, discontinuous
// roads, water covering bridges, stale map art on stage switching, shadow detached
// from feet, weather advancing during pause/overlays, rain in raids or lobby,
// reduced-motion particles and unbounded objects after repeated run/scene changes.
import {STAGES} from '../src/content/core.js';
const $=id=>document.getElementById(id),frame=$('game');
let rt,evidence;
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);$('run').disabled=$('preview').disabled=false;$('report').textContent='Ready.'}},100);
async function stage(index=0){rt.toMenu();await rt.scene.prepareHero('ustaz');rt.newGame('ustaz',index);const g=rt.G;g.auto=false;g.spawnT=g.durianT=999;g.cds[0]=999;g.p.invuln=999;frame.contentDocument.getElementById('menu').hidden=true;rt.scene.update(0,0);return g}
function children(name){return rt.scene.children.list.filter(o=>o.name===name&&o.visible)}
$('run').onclick=async ()=>{
  evidence={date:new Date().toISOString(),checks:[],errors:[],result:'FAIL'};
  const check=(name,pass)=>{evidence.checks.push({name,pass:!!pass});if(!pass)throw Error(name)};
  try{
    check('Terrain atlas loads',rt.scene.textures.exists('terrain'));
    for(const name of ['grass','road','water','paddy','wood','stone'])check(name+' frame exists',rt.scene.textures.get('terrain').has(name));
    for(const [i,s]of STAGES.entries()){
      const g=await stage(i);
      check(s.name+' uses textured ground',children('terrain-ground').length===1);
      check(s.name+' has textured road surfaces',children('terrain-road').length>0);
      check(s.name+' keeps road instances bounded',children('terrain-road').length<700);
      const water=rt.scene.children.list.filter(o=>o.name==='terrain-water');
      if(g.world.waters.length){
        check(s.name+' retains every organic textured water surface',water.length===g.world.waters.length);
        for(const tile of water){Object.assign(g.p,{x:tile.x,y:tile.y});rt.scene.update(0,0);check(s.name+' water becomes visible on arrival',tile.visible)}
      }
      if(g.world.paddies.length)check(s.name+' has illustrated rice terraces',children('terrain-paddy').length>=g.world.paddies.length*6);
      if(g.world.bridges.length)check(s.name+' keeps bridge decking above water',children('terrain-bridge').every(b=>water.every(w=>b.depth>w.depth)));
      check(s.name+' minimap matches world',frame.contentDocument.querySelector('#worldMap strong').textContent===g.world.name);
    }
    for(const hero of ['ustaz','rempit','nok','lan','sari']){
      await stage();await rt.scene.prepareHero(hero);rt.newGame(hero,0);rt.scene.update(0,0);
      const shadow=children('hero-contact-shadow')[0];
      check(hero+' has a soft flat contact shadow',shadow&&shadow.displayHeight<shadow.displayWidth*.45&&shadow.alpha<=.25);
      check(hero+' shadow follows the feet',shadow.x===rt.G.p.x&&Math.abs(shadow.y-rt.G.p.y)<=5);
    }
    let g=await stage(),weather=rt.scene.weather;
    g.t=0;rt.scene.update(0,0);check('Johor begins with visible rain',weather.kind==='rain'&&weather.intensity>0);
    g.t=100;rt.scene.update(0,0);const a=weather.kind;
    g.t=150;rt.scene.update(0,0);check('Weather changes through the run',weather.kind!==a);
    g.t=5;rt.scene.update(0,0);g.paused=true;const frozen=weather.clock;
    for(let i=0;i<8;i++)rt.scene.update(0,50);
    check('Pause freezes weather',weather.clock===frozen);
    g.paused=false;g.choosing=true;rt.scene.update(0,50);check('Upgrade overlay freezes weather',weather.clock===frozen);g.choosing=false;
    g.lootModal='inspect';rt.scene.update(0,50);check('Equipment overlay freezes weather',weather.clock===frozen);g.lootModal=null;
    check('Rain particles remain bounded',weather.particleCount<=84);
    rt.raid.spawnPortal();rt.raid.enter();rt.scene.update(0,0);check('Raid suppresses outdoor weather',!weather.visible);rt.raid.force('return');
    rt.toMenu();rt.scene.update(0,0);check('Lobby hides outdoor weather',!weather.visible&&!children('hero-contact-shadow').length);
    g=await stage();const count=rt.scene.children.list.length;
    for(let i=0;i<8;i++){await stage(i%STAGES.length)}await stage();
    check('Repeated world switches release old terrain',rt.scene.children.list.length<=count+8);
    const w=frame.contentWindow,media=w.matchMedia;
    try{w.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:media.call(w,query);rt.scene.update(0,0);check('Reduced motion removes moving rain',rt.scene.weather.particleCount===0)}finally{w.matchMedia=media}
    evidence.result='PASS';
  }catch(error){evidence.errors.push(String(error))}
  finally{rt.toMenu();$('report').textContent=JSON.stringify(evidence,null,2);$('download').disabled=false}
};
$('preview').onclick=async ()=>{
  const kind=$('view').value,g=await stage(kind==='kl'?3:0);
  const point=kind==='river'?{x:1000,y:-1100}:kind==='fields'?{x:-1600,y:-1450}:kind==='hero'?{x:0,y:0}:{x:-350,y:-250};
  Object.assign(g.p,point);g.t=kind==='fields'?100:kind==='river'?150:0;
  rt.scene.update(0,0);g.paused=true;frame.contentDocument.getElementById('banner').classList.remove('show');
};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='terrain-weather-report.json';a.click();URL.revokeObjectURL(url)};
