// Failure scope: equipment contributions compound, effects reset across slots,
// queued rewards vanish, encounter state leaks, or a new run keeps equipment.
const $=id=>document.getElementById(id),frame=$('game');let rt,doc;
const ready=setInterval(()=>{rt=frame.contentWindow.__asean;if(rt){clearInterval(ready);doc=frame.contentDocument;$('run').disabled=false;$('report').textContent='Ready'}},100);
$('run').onclick=()=>{const checks=[];let result='PASS',error;const check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name)},step=(n=1)=>{for(let i=0;i<n;i++)rt.scene.update(0,50)};
try{rt.toMenu();rt.newGame('ustaz',0);doc.getElementById('menu').hidden=true;const g=rt.G;g.auto=false;g.cds.fill(999);g.spawnT=g.durianT=g.pupT=999;g.p.invuln=999;
const equip=(id,slot)=>{g.rewards.push({event:'combined-'+slot,slot,offer:[id],consumed:false});step();const b=doc.querySelector('[data-item="'+id+'"]');check('Reward offers '+id,!!b);b.click();step()};
equip('quarryHammer','weapon');equip('stillwaterBeads','charm');equip('aftershockBell','relic');step(43);g.ult=g.hero.ultNeed;rt.tryCast(4);g.zones=[];const e=rt.makeGhost('pocong',g.p.x+90,g.p.y);e.hp=e.maxHp=10000;e.stun=999;g.st.crit=0;g.projs.push({x:e.x,y:e.y,vx:0,vy:0,r:6,dmg:100,life:1,pierce:1,hit:new Set()});step(5);check('Three equipment slots add their damage bonuses',Math.abs(e.hp-9835)<.001);check('All three choices remain equipped',g.equipment.weapon==='quarryHammer'&&g.equipment.charm==='stillwaterBeads'&&g.equipment.relic==='aftershockBell');
const clock=g.clock;doc.getElementById('equipmentButton').click();step(10);check('Equipment inspection freezes survival clock',g.clock===clock);doc.getElementById('lootClose').click();rt.newGame('ustaz',1);check('Switching stage clears all equipment',Object.values(rt.G.equipment).every(x=>x===null));check('Other stage has no Johor events',['rescue','ward','hunt'].every(id=>!rt.G.encounters[id]));

const armorRun=rt.G;
armorRun.auto=false;
armorRun.cds.fill(999);
armorRun.spawnT=armorRun.durianT=armorRun.pupT=999;
for(const [slot,id] of [['gloves','gripWraps'],['head','rainHood'],['chest','quiltedVest']]){
  armorRun.rewards.push({event:'armor-'+slot,slot,offer:[id],consumed:false});
  rt.step(0);
  doc.querySelector('[data-item="'+id+'"]').click();
}
const target=rt.makeGhost('pocong',armorRun.p.x+70,armorRun.p.y);
target.hp=target.maxHp=1000;
target.spd=0;
armorRun.st.crit=0;
armorRun.cds[0]=0;
step(4);
check('Physical gloves boost Ustaz’s basic bolt',Math.abs(target.hp-(1000-12*1.15))<.001);
const afterBasic=target.hp;
armorRun.cds[1]=0;
armorRun.autoMode=3;
rt.tryCast(1,true);
check('Cahaya Fajar uses skill damage',Math.abs(afterBasic-target.hp-38)<.001);
Object.assign(target,{x:armorRun.p.x,y:armorRun.p.y,dmg:20,kvx:0,kvy:0});
armorRun.p.invuln=armorRun.stop=0;
const beforeContact=armorRun.p.hp;
rt.step(0);
check('Quilted Vest reduces a contact hit from 20 to 17',Math.abs(beforeContact-armorRun.p.hp-17)<.001);
target.dead=true;
armorRun.p.invuln=armorRun.stop=0;
armorRun.eprojs.push({x:armorRun.p.x,y:armorRun.p.y,vx:0,vy:0,life:1,r:8,dmg:20});
const beforeBolt=armorRun.p.hp;
rt.step(0);
check('Rain Hood reduces a hostile bolt from 20 to 18',Math.abs(beforeBolt-armorRun.p.hp-18)<.001);
}catch(e){result='FAIL';error=e.message}finally{$('report').textContent=JSON.stringify({date:new Date().toISOString(),result,error,checks},null,2);if(rt.G)rt.G.paused=true}};
