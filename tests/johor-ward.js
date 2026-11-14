// Accepted real-browser runtime seam. Failures: implicit start, wrong waves/targets,
// contact bursts, ambient completion, stale rewards, damage timers and position reset.
const $=id=>document.getElementById(id),frame=$('game');let rt,doc,checks=[];
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);doc=frame.contentDocument;$('run').disabled=false;$('status').textContent='Ready'}},100);
function check(name,pass){checks.push({name,pass:!!pass});if(!pass)throw Error(name)}
function start(hero='ustaz',stage=0){rt.toMenu();rt.newGame(hero,stage);doc.getElementById('menu').hidden=true;const g=rt.G;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;g.p.invuln=999;return g}
function step(n=1){for(let i=0;i<n;i++)rt.scene.update(0,50)}
function click(id){const b=doc.getElementById(id);check(id+' is available',!!b&&!b.hidden&&!b.disabled);b.click()}
function ward(){const g=start();Object.assign(g.p,{x:-1700,y:-1350});step();check('Nearby ward explains three waves',doc.getElementById('eventDescription').textContent.includes('three waves'));click('eventStart');check('Ward begins at 300 HP',g.encounters.ward.hp===300);check('First wave has four enemies',g.enemies.filter(e=>e.encounter==='ward'&&!e.dead).length===4);}
$('run').onclick=async()=>{checks=[];let result='PASS',error;try{ward()}catch(e){result='FAIL';error=e.message}finally{$('status').textContent=result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+' checks'+(error?' · '+error:'');$('report').textContent=JSON.stringify({date:new Date().toISOString(),result,error,checks},null,2);if(rt.G)rt.G.paused=true}};
$('download').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([$('report').textContent],{type:'application/json'}));a.href=url;a.download='johor-ward-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
