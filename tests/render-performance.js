// Agreed seam: actual browser/runtime, real rewards/skills, WebGL frames and pixels.
// Failure cases: offscreen filters still submit; arrival/zoom/teleport exposes holes;
// in-view water is hidden; raid/menu leaks; comparison changes combat or count.
import {STAGES} from '../src/content/core.js';
const $=id=>document.getElementById(id),fixture=$('fixture');
let host,frame,rt,evidence={runs:[],checks:[],errors:[],warnings:[]};
const ready=setInterval(()=>{host=fixture.contentDocument;frame=host.getElementById('game');rt=frame?.contentWindow.__asean;if(rt&&!host.getElementById('run').disabled){clearInterval(ready);frame.contentWindow.addEventListener('error',e=>evidence.errors.push(e.message));const warn=frame.contentWindow.console.warn;frame.contentWindow.console.warn=(...args)=>{evidence.warnings.push(args.map(String).join(' '));warn.apply(frame.contentWindow.console,args)};for(const id of ['diagnose','profile','ordinary','run'])$(id).disabled=false;$('status').textContent='Ready · quiet foreground Safari required for timings'}},100);
const waters=()=>rt.scene.children.list.filter(o=>o.name==='terrain-water');
function inView(o,padding=0){const c=rt.scene.cameras.main,p=rt.G.p;return Math.abs(o.x-p.x)<o.width/2+c.width/c.zoom/2+padding&&Math.abs(o.y-p.y)<o.height/2+c.height/c.zoom/2+padding}
function output(){ $('report').textContent=JSON.stringify(evidence,null,2) }
function start(){
  host.getElementById('zoning').click();const g=rt.G,elite=g.enemies.find(e=>e.elite);g.enemies=[elite];
  for(let i=0;i<96;i++){const a=i*Math.PI*2/96,e=rt.makeGhost(i%3?'pocong':'stalker',Math.cos(a)*260,Math.sin(a)*260);e.encounter='hunt'}
  g.p.invuln=999;for(const e of g.enemies)e.hp=e.maxHp=100000;elite.hp=50000;g.auto=true;g.autoMode=3;
  for(const slot of [2,3,4])frame.contentDocument.getElementById('sk'+slot).click();
  return g;
}
async function measure(mode,duration){
  const win=frame.contentWindow,random=win.Math.random;let seed=20261115;if(mode!=='production'&&mode!=='ordinary')win.Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const g=mode==='ordinary'?ordinary():start(),tiles=waters(),originals=new Map(),submissions={all:0,offscreen:0};
  for(const tile of tiles){originals.set(tile,tile.renderWebGLStep);tile.renderWebGLStep=function(...args){if(!args[4]){submissions.all++;if(!inView(this))submissions.offscreen++}return originals.get(this).apply(this,args)}}
  const hide=()=>{for(const tile of tiles){if(mode==='all-water-control')tile.setVisible(!g.raid);else if(mode==='hide-offscreen-probe'&&!inView(tile,150))tile.setVisible(false)}};
  rt.scene.events.on('prerender',hide);
  const samples=[],counts=[],begin=frame.contentWindow.performance.now();let previous=begin;
  await new Promise(resolve=>{const tick=now=>{samples.push(now-previous);previous=now;counts.push({enemies:g.enemies.filter(e=>!e.dead).length,fx:g.fx.length,projectiles:g.projs.length,hostile:g.eprojs.length,zones:g.zones.length});if(now-begin<duration)frame.contentWindow.requestAnimationFrame(tick);else resolve()};frame.contentWindow.requestAnimationFrame(tick)});
  g.paused=true;rt.scene.events.off('prerender',hide);for(const [tile,original]of originals)tile.renderWebGLStep=original;win.Math.random=random;
  const sorted=[...samples].sort((a,b)=>a-b),elapsed=previous-begin;
  evidence.runs.push({date:new Date().toISOString(),mode,randomSeed:mode==='production'||mode==='ordinary'?null:20261115,durationMs:elapsed,frames:samples.length,fps:samples.length*1000/elapsed,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],over50Ms:samples.filter(x=>x>50).length,submissions,water:tiles.map(t=>({x:t.x,y:t.y,width:t.width,height:t.height,inView:inView(t),visible:t.visible})),viewport:[frame.contentWindow.innerWidth,frame.contentWindow.innerHeight],userAgent:frame.contentWindow.navigator.userAgent,hardwareConcurrency:frame.contentWindow.navigator.hardwareConcurrency,equipment:{...g.equipment},event:g.encounters.hunt.status,countRanges:Object.fromEntries(Object.keys(counts[0]).map(k=>[k,{min:Math.min(...counts.map(c=>c[k])),max:Math.max(...counts.map(c=>c[k]))}])),samples});output();
}
$('diagnose').onclick=async()=>{try{$('status').textContent='Measuring all-water control 5 seconds';await measure('all-water-control',5000);$('status').textContent='Measuring only offscreen water hidden 5 seconds';await measure('hide-offscreen-probe',5000);$('status').textContent='Comparison complete · paused'}catch(error){evidence.error=String(error);output();$('status').textContent='FAIL'}};
function ordinary(){rt.toMenu();frame.contentDocument.getElementById('hero-ustaz').click();frame.contentDocument.getElementById('start').click();return rt.G}
$('ordinary').onclick=async()=>{$('status').textContent='Measuring ordinary new game 15 seconds';await measure('ordinary',15000);$('status').textContent='Ordinary scene complete · paused'};
$('profile').onclick=async()=>{$('status').textContent='Measuring original crowd 15 seconds';await measure('production',15000);$('status').textContent='Original crowd complete · paused'};
$('run').onclick=async()=>{
  evidence.checks=[];delete evidence.error;evidence.result='FAIL';const check=(name,pass,details)=>{evidence.checks.push({name,pass:!!pass,details});if(!pass)throw Error(name)};
  try{const g=start();g.paused=true;rt.scene.update(0,0);await new Promise(resolve=>rt.scene.game.events.once('postrender',resolve));
    check('Home view skips at least one fully offscreen water filter',waters().some(t=>!inView(t,150)&&!t.visible),waters().map(t=>({x:t.x,y:t.y,visible:t.visible,inView:inView(t,150)})));
    const camera=rt.scene.cameras.main,zoom=camera.zoom;
    for(let index=0;index<STAGES.length;index++){
      rt.toMenu();rt.newGame('ustaz',index);const run=rt.G;run.paused=true;frame.contentDocument.getElementById('menu').hidden=true;rt.scene.update(0,0);
      for(const tile of waters())for(const scale of [zoom,zoom*.7]){camera.setZoom(scale);Object.assign(run.p,{x:tile.x,y:tile.y});rt.scene.update(0,0);check(run.world.id+' first-update arrival restores water at zoom '+scale,tile.visible,{x:tile.x,y:tile.y});await new Promise(resolve=>rt.scene.game.events.once('postrender',resolve));check(run.world.id+' rendered arrival keeps water visible',tile.visible);}
    }
    camera.setZoom(zoom);evidence.result='PASS';
  }catch(error){evidence.error=String(error)}finally{rt.G.paused=true;output();$('status').textContent=evidence.result+' · '+evidence.checks.filter(c=>c.pass).length+'/'+evidence.checks.length}
};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='render-performance-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
