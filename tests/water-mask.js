// Agreed seam: actual browser game/runtime, Phaser renderer output and HTML controls.
// Failure cases: unsupported WebGL masks, rectangular corners, misplaced clipping
// after camera movement/zoom, hidden river body, bridge occlusion and leaked textures.
import {STAGES} from '../src/content/core.js';
const $=id=>document.getElementById(id),frame=$('game');
let rt,evidence;
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);$('run').disabled=$('preview').disabled=false;$('status').textContent='Ready'}},100);
function stage(index=0){rt.toMenu();rt.newGame('ustaz',index);const g=rt.G;g.auto=false;g.spawnT=g.durianT=g.pupT=999;g.cds.fill(999);g.p.invuln=999;frame.contentDocument.getElementById('menu').hidden=true;rt.scene.update(0,0);g.paused=true;return g}
function preview(){const g=stage(),water=g.world.waters[0];Object.assign(g.p,{x:water.x+90,y:water.y+100});rt.scene.update(0,0);rt.scene.cameras.main.fadeEffect.reset();frame.contentDocument.getElementById('banner').classList.remove('show');return g}
function rendered(){return new Promise(resolve=>rt.scene.game.events.once('postrender',resolve))}
function pixel(point){
  const renderer=rt.scene.game.renderer,p=rt.scene.cameras.main.matrix.transformPoint(point.x,point.y);
  if(renderer.gl.isContextLost())throw Error('WebGL context lost');
  if(p.x<0||p.y<0||p.x>=renderer.width||p.y>=renderer.height)throw Error('Sample outside viewport: '+JSON.stringify(p));
  return new Promise(resolve=>renderer.snapshotPixel(Math.round(p.x),Math.round(p.y),color=>resolve([color.red,color.green,color.blue,color.alpha])));
}
async function clipping(g,check){
  const camera=rt.scene.cameras.main,zoom=camera.zoom;
  for(const [index,water]of g.world.waters.entries()){
    const tile=rt.scene.children.list.filter(o=>o.name==='terrain-water')[index];
    Object.assign(g.p,{x:water.x+260,y:water.y+220});rt.scene.update(0,0);camera.fadeEffect.reset();
    for(const scale of [zoom,zoom*.7]){
      camera.setZoom(scale);await rendered();
      for(const [name,point,inside]of [
        ['rounded corner',{x:water.x+3,y:water.y+3},false],
        ['outside bank',{x:water.x-40,y:water.y+100},false],
        ['water body',{x:water.x+100,y:water.y+100},true]
      ]){
        tile.setAlpha(1);const waterPixel=await pixel(point);
        tile.setAlpha(0);const groundPixel=await pixel(point);tile.setAlpha(1);
        const difference=waterPixel.reduce((sum,c,i)=>sum+Math.abs(c-groundPixel[i]),0);
        evidence.pixels.push({world:g.world.id,water:water.id,name,zoom:scale,point,waterPixel,groundPixel,difference});
        check('Both '+name+' samples read actual opaque rendered pixels',waterPixel[3]===255&&groundPixel[3]===255&&groundPixel.slice(0,3).some(c=>c>0));
        check(g.world.id+' '+water.id+' '+name+' clips at zoom '+scale.toFixed(3),inside?difference>15:difference<=3);
      }
      const halfWidth=camera.width/scale/2,halfHeight=camera.height/scale/2,bounds=camera.getBounds();
      let point,arrival;
      for(const x of [water.x+100,water.x+water.w-100,water.x+water.w/2]){
        const sample={x,y:water.y+100};
        const candidate=[{x:x+halfWidth-45,y:sample.y},{x:x-halfWidth+45,y:sample.y},{x,y:sample.y+halfHeight-45},{x,y:sample.y-halfHeight+45}].find(p=>g.world.walkable(p.x,p.y,g.p.r)&&p.x-halfWidth>=bounds.left&&p.x+halfWidth<=bounds.right&&p.y-halfHeight>=bounds.top&&p.y+halfHeight<=bounds.bottom);
        if(candidate){point=sample;arrival=candidate;break}
      }
      if(!arrival)throw Error('No collision-valid edge approach for '+g.world.id+' '+water.id);
      Object.assign(g.p,arrival);rt.scene.update(0,0);
      check(g.world.id+' '+water.id+' first-update edge arrival keeps water visible',tile.visible);
      await rendered();const screen=camera.matrix.transformPoint(point.x,point.y);check('Water body sample lies within 60 pixels of a viewport edge',Math.min(screen.x,screen.y,camera.width-screen.x,camera.height-screen.y)<=60,{screen,arrival,player:{x:g.p.x,y:g.p.y},camera:{width:camera.width,height:camera.height,zoom:camera.zoom,scrollX:camera.scrollX,scrollY:camera.scrollY}});tile.setAlpha(1);const waterPixel=await pixel(point);tile.setAlpha(0);const groundPixel=await pixel(point);tile.setAlpha(1);
      const difference=waterPixel.reduce((sum,c,i)=>sum+Math.abs(c-groundPixel[i]),0);
      evidence.pixels.push({world:g.world.id,water:water.id,name:'viewport edge body',zoom:scale,point,waterPixel,groundPixel,difference});
      check('Viewport edge reads actual opaque water and ground pixels',waterPixel[3]===255&&groundPixel[3]===255&&groundPixel.slice(0,3).some(c=>c>0));
      check(g.world.id+' '+water.id+' water body remains painted at viewport edge',difference>15);
      Object.assign(g.p,{x:water.x+260,y:water.y+220});rt.scene.update(0,0);await rendered();
    }
    camera.setZoom(zoom);
  }
}
async function lifecycle(check){
  let g=preview();await rendered();
  const water=()=>rt.scene.children.list.filter(o=>o.name==='terrain-water');
  const textureCount=()=>rt.scene.textures.getTextureKeys().length;
  g.paused=false;rt.raid.spawnPortal();rt.raid.enter();rt.scene.update(0,0);g.paused=true;await rendered();
  check('Raid suppresses all outdoor water and minimap',!!g.raid&&water().every(o=>!o.visible)&&frame.contentDocument.getElementById('worldMap').hidden);
  rt.endGame(false);frame.contentDocument.getElementById('again').click();g=rt.G;g.paused=true;rt.scene.update(0,0);rt.scene.cameras.main.fadeEffect.reset();await rendered();
  const first=water()[0];Object.assign(g.p,{x:first.x,y:first.y});rt.scene.update(0,0);await rendered();
  check('Real Play again retains every clipped surface and restores visible water on arrival',!g.raid&&water().length===g.world.waters.length&&first.visible);
  rt.endGame(false);frame.contentDocument.getElementById('tomenu').click();rt.scene.update(0,0);await rendered();
  check('Real Choose hero hides water and minimap',!rt.G&&water().every(o=>!o.visible)&&frame.contentDocument.getElementById('worldMap').hidden);
  const counts=[];
  for(let cycle=0;cycle<3;cycle++){
    for(let index=0;index<STAGES.length;index++){
      g=stage(index);const bank=g.world.waters[0];if(bank)Object.assign(g.p,{x:bank.x+260,y:bank.y+220});
      rt.scene.update(0,0);rt.scene.cameras.main.fadeEffect.reset();await rendered();
    }
    preview();await rendered();counts.push(textureCount());
  }
  evidence.textureCounts=counts;
  check('Repeated six-world cycles do not accumulate TextureManager resources',counts[1]===counts[0]&&counts[2]===counts[0]);
}
$('run').onclick=async()=>{
  evidence={date:new Date().toISOString(),result:'FAIL',checks:[],warnings:[],errors:[],pixels:[]};
  const check=(name,pass,details)=>{evidence.checks.push({name,pass:!!pass,...details?{details}:{}});if(!pass)throw Error(name)};
  const console=frame.contentWindow.console,warn=console.warn;
  console.warn=(...args)=>{evidence.warnings.push(args.map(String).join(' '));warn.apply(console,args)};
  try{
    check('Actual game uses WebGL',!!rt.scene.game.renderer.gl);
    for(const [index,s]of STAGES.entries()){
      const g=stage(index);
      check(s.name+' creates terrain without unsupported mask warnings',!evidence.warnings.some(w=>w.includes('not supported in WebGL')));
      await clipping(g,check);
    }
    await lifecycle(check);
    check('World, raid, retry and menu transitions emit no WebGL warnings',evidence.warnings.length===0);
    evidence.result='PASS';
  }catch(error){evidence.errors.push(String(error))}
  finally{console.warn=warn;preview();$('status').textContent=evidence.result+' · '+evidence.checks.filter(c=>c.pass).length+'/'+evidence.checks.length;$('report').textContent=JSON.stringify(evidence,null,2);$('download').disabled=false}
};
$('preview').onclick=preview;
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='water-mask-report.json';a.click();URL.revokeObjectURL(url)};
