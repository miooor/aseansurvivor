import assert from 'node:assert/strict';
import {test} from 'node:test';
import {heroArt} from '../src/content/hero-art.js';
import {drawPaintedEffects} from '../src/scenes/painted-effects.ts';

const battle=id=>({hero:{id},p:{x:10,y:20,face:[1,0]},t:1,fx:[],projs:[],zones:[],roster:{}});
function draw(g,reduced=false){
  const sprites=[];
  drawPaintedEffects(g,reduced,sprite=>sprites.push(sprite));
  return sprites;
}

test('release paint opens on the caster’s selected row or hands off to the live split carriers',()=>{
  for(const id of Object.keys(heroArt))for(let slot=0;slot<5;slot++){
    const g=battle(id);
    g.fx.push({kind:'spell',hero:id,slot,x:10,y:20,tx:60,ty:20,a:0,max:.4,life:.4});
    const [sprite]=draw(g);
    if(['dani-1','dani-2','dani-3','dani-4','nok-1','lan-2','lia-4','nadi-1','nadi-2','nadi-3','nadi-4','keo-2','rempit-2','rempit-4','asha-2'].includes(id+'-'+slot)){
      assert.equal(sprite,undefined);
      continue;
    }
    assert.equal(sprite.hero,id);
    assert.equal(sprite.frame,slot*4,id+' '+slot);
  }
});

test('Vanna paints shuttle and familiar strikes on their own rows and pins the loom corners',()=>{
  const g=battle('vanna');
  g.fx=[{kind:'relay',hero:'vanna',slot:2,x:10,y:20,tx:90,ty:20,max:.6,life:.3}];
  assert.deepEqual(draw(g).map(s=>[s.x,s.y,Math.floor(s.frame/4)]),[[50,20,2]]);
  g.fx=[{kind:'relay',hero:'vanna',slot:3,x:62,y:20,tx:90,ty:20,max:.24,life:.12}];
  assert.deepEqual(draw(g,true).map(s=>[s.x,s.y,Math.floor(s.frame/4)]),[[76,20,3]]);
  g.fx=[{kind:'spell',hero:'vanna',slot:4,x:10,y:20,max:4,life:3.7}];
  assert.deepEqual(draw(g).map(s=>[s.x,s.y]),[[-240,-230],[-240,270],[260,-230],[260,270]]);
});

test('the painted familiar follows its live orbit after release and fades at expiry',()=>{
  const g=battle('vanna');
  g.roster.vanna={familiar:{start:0,until:4}};
  g.t=1.1;
  const [front]=draw(g,true);
  assert.deepEqual([front.frame,front.x,Math.round(front.y)],[14,62,20]);
  g.p.x+=40;
  g.t=1.65;
  const [back]=draw(g,true);
  assert.deepEqual([back.frame,Math.round(back.x),Math.round(back.y)],[14,-2,20]);
  g.t=4;
  assert.deepEqual(draw(g),[]);
});

test('blink marks follow the landing and reed bolts follow their live positions',()=>{
  const g=battle('lia');
  g.fx=[{kind:'shadowstep',hero:'lia',slot:4,x:10,y:20,tx:44,ty:20,max:.36,life:.22}];
  const [mark]=draw(g,true);
  assert.deepEqual([mark.x,mark.y,mark.frame,mark.angle],[44,20,18,0]);
  g.fx=[];
  assert.deepEqual(draw(g),[]);
  const k=battle('keo');
  k.projs=[{x:75,y:40,vx:0,vy:-7,r:6,hitOptions:{hero:'keo',slot:2}},{origin:'item',kind:'nur'}];
  const bolts=draw(k,true);
  assert.deepEqual(bolts.map(b=>[b.frame,b.x,b.y,b.angle]),[[10,75,40,-Math.PI/2]]);
});

test('Captain "Pag Pag" Garcia skips a lid down the lane, serves the evolved radius and drives a stove cart',()=>{
  const g=battle('mira');
  const cast={hero:'mira',kind:'spell',slot:1,x:5,y:12,max:.4,life:.2,a:Math.PI/2,range:80};
  g.fx=[cast];
  const [hook]=draw(g);
  assert.ok(Math.abs(hook.x-5)<1e-8);
  assert.ok(hook.y>12&&hook.y<=92);
  cast.life=.06;
  assert.ok(draw(g)[0].y<hook.y);
  Object.assign(cast,{slot:2,range:190});
  assert.equal(draw(g)[0].width,380);
  g.fx=[];
  g.roster.mira={wave:{x:5,y:12,ax:0,ay:1,distance:150,length:340,width:120}};
  const [crest]=draw(g,true);
  assert.deepEqual([crest.frame,Math.round(crest.x),crest.y,crest.height],[18,5,162,120]);
  assert.equal(crest.originX,1,'the painted lip ends at the damaging front');
  g.roster.mira.wave=null;
  assert.deepEqual(draw(g),[]);
});

test('the ward paints its statue and three guardians at their own feet',()=>{
  const g=battle('nadi');
  const monks=[[20,70],[100,-40],[50,-70]].map(([x,y])=>({x,y,angle:0,swingUntil:0}));
  g.roster.nadi={ward:{x:0,y:0,until:2,radius:170,monks}};
  const stamps=draw(g,true);
  assert.deepEqual(stamps.map(s=>[s.x,s.y,s.frame]),[[0,0,16],[20,70,17],[100,-40,17],[50,-70,17]]);
  g.t=2;
  assert.deepEqual(draw(g),[]);
});

test('duration cues follow orbiters, fields, and the actual dash endpoint',()=>{
  const g=battle('ustaz');
  g.orbit={n:2,rad:80,holy:true,ang:0};
  assert.deepEqual(draw(g,true).map(s=>[s.frame,Math.round(s.x),Math.round(s.y)]),[[10,122,20],[10,-102,20]]);
  const l=battle('lia');
  l.fx=[{kind:'spell',hero:'lia',slot:2,x:0,y:0,a:0,life:.15,max:.3}];
  const [rush]=draw(l,true);
  assert.deepEqual([rush.x,rush.y],[10,20]);
});

test('flying knee uses its dedicated sprite and remote casts paint their landing radius',()=>{
  const g=battle('nok');
  const cast={kind:'spell',hero:'nok',slot:1,x:10,y:20,a:Math.PI,max:.6,life:.3,range:270,w:53};
  g.fx=[cast];
  assert.equal(draw(g).length,0);
  g.hero.id='asha';Object.assign(cast,{hero:'asha',tx:-16,ty:0,range:135});
  const [stamp]=draw(g,true);
  assert.deepEqual([stamp.width,stamp.x,stamp.y,stamp.ground],[270,-16,0,true]);
});

test('paint advances through the authored cells, holds during pause, and expires on simulation time',()=>{
  const g=battle('sari');
  const cast={hero:'sari',kind:'spell',slot:1,x:0,y:0,a:0,life:.4,max:.4};
  g.fx=[cast];
  for(const [life,expected] of [[.4,4],[.28,5],[.16,6],[.04,7]]){
    cast.life=life;
    assert.equal(draw(g)[0].frame,expected);
    assert.deepEqual(draw(g),draw(g));
    assert.equal(draw(g,true)[0].frame,6);
  }
  cast.life=0;
  assert.deepEqual(draw(g),[]);
});

test('a contact shares the struck actor’s foot depth while the image sits at hit height',()=>{
  const g=battle('lia');
  g.fx=[{hero:'lia',slot:0,kind:'impact',x:14,y:77,footY:100,max:.24,life:.12,r:22}];
  const [hit]=draw(g);
  assert.deepEqual([hit.y,hit.lift],[100,23]);
});

test('split casts show their live carriers without an extra group at the caster',()=>{
  for(const [hero,slot] of [['lia',4],['keo',2]]){
    const g=battle(hero);
    g.fx=[{kind:'spell',hero,slot,x:10,y:20,max:.5,life:.48}];
    const points=[{x:40,y:50},{x:62,y:40},{x:84,y:30}];
    if(hero==='lia')g.fx.push(...points.map(p=>({kind:'shadowstep',hero,slot,x:10,y:20,tx:p.x,ty:p.y,max:.36,life:.22})));
    if(hero==='keo')g.projs=points.map(p=>({...p,vx:100,vy:0,r:6,hitOptions:{hero,slot}}));
    for(const reduced of [false,true]){
      const sprites=draw(g,reduced);
      assert.deepEqual(sprites.map(s=>({x:s.x,y:s.y})),points,hero);
      assert.ok(sprites.every(s=>Math.floor(s.frame/4)===slot));
    }
  }
});

test('a directed punch or fan leaves the caster as one continuous gesture',()=>{
  for(const [hero,slot] of [['ustaz',1],['nok',0],['sari',1],['mira',0],['keo',1]]){
    const g=battle(hero);
    g.fx=[{kind:'spell',hero,slot,x:g.p.x,y:g.p.y,a:0,max:.4,life:.22}];
    const marks=draw(g);
    assert.equal(marks.length,1,hero);
    assert.ok(marks[0].x>g.p.x&&marks[0].x-marks[0].width/2<=g.p.x+20,hero+' connects to the pose');
  }
});

test('Hand of Buddha paints the travelling front at its live position and width',()=>{
  const g=battle('nadi');
  g.roster.nadi={waves:[{x:40,y:50,ax:1,ay:0,width:140,distance:72,empowered:true}]};
  for(const reduced of [false,true]){
    const [wave,palm]=draw(g,reduced);
    assert.deepEqual([wave.x,wave.y,wave.originX,wave.height,wave.ground],[112,50,1,140,true]);
    assert.equal(palm.x,wave.x);
  }
});

test('Skyfall paint travels with Nok above the floor warning until landing',()=>{
  const g=battle('nok');
  const destination={x:240,y:120};
  const leap={t:.225,dur:.45,tx:destination.x,ty:destination.y};
  g.sea={leap};g.p.x=120;g.p.y=60;
  g.fx=[{kind:'spell',hero:'nok',slot:4,...destination,r:181,max:1.5,life:1.275}];
  const [air]=draw(g);
  assert.deepEqual([air.x,air.y,air.lift,air.ground],[120,60,110,false]);
  const [still]=draw(g,true);
  assert.deepEqual([still.x,still.y],[120,60]);
  g.sea.leap=null;g.fx[0].life=1;
  const [impact]=draw(g);
  assert.deepEqual([impact.x,impact.y,impact.width,impact.ground],[240,120,362,true]);
});

for(const hero of ['asha','ustaz']){
  test(hero+' decorative return stays stationary in reduced motion',()=>{
    const g=battle(hero);
    const f={kind:hero==='asha'?'relay':'ring',hero,x:90,y:60,tx:10,ty:20,max:.5,life:.4};
    if(hero==='ustaz')f.flourish='return';
    g.fx=[f];
    const position=reduced=>{const [s]=draw(g,reduced);return [s.x,s.y,s.frame]};
    const before=position(true),moving=position(false);
    g.t+=.25;f.life-=.25;
    assert.deepEqual(position(true),before);
    assert.notDeepEqual(position(false).slice(0,2),moving.slice(0,2));
  });
}

test('a circular cast blooms out to the measured footprint and holds its radius in reduced motion',()=>{
  const g=battle('mira');
  const cast={kind:'spell',hero:'mira',slot:2,x:4,y:3,range:190,max:.5,life:.5};
  g.fx=[cast];
  const opening=draw(g)[0];
  cast.life=.4;
  const expanding=draw(g)[0];
  cast.life=.2;
  assert.ok(opening.width<expanding.width&&expanding.width<380);
  assert.equal(draw(g)[0].width,380);
  cast.life=.5;
  assert.equal(draw(g,true)[0].width,380);
});

test('small shots have a readable silhouette above the floor in either motion mode',()=>{
  for(const hero of ['ustaz','rempit','lan','sari','asha','dani','vanna','keo','lia']){
    const g=battle(hero);
    g.projs=[{x:80,y:12,r:4,vx:0,vy:-1}];
    for(const reduced of [false,true]){
      const [shot]=draw(g,reduced);
      assert.ok(shot.width>=68,hero);
      assert.ok(shot.lift>=shot.height/2,hero);
      assert.deepEqual([shot.x,shot.y,shot.angle],[80,12,-Math.PI/2]);
    }
  }
});

test('hot exhaust and boost share the displayed muffler when aim and steering disagree',()=>{
  const g=battle('rempit');
  Object.assign(g.p,{exhaust:4,super:0,vx:0,vy:200,face:[0,1]});
  const outlet={x:-11,y:-5,dx:-.53,dy:-.64};
  for(const slot of [2,4]){
    if(slot===4)g.p.super=3;
    g.fx=[{kind:'spell',hero:'rempit',slot,x:100,y:90,a:Math.PI,max:5,life:4.9}];
    const paint=[];
    drawPaintedEffects(g,true,s=>paint.push(s),outlet);
    assert.equal(paint.length,1);
    const [jet]=paint;
    assert.deepEqual([jet.frame,jet.x,jet.y-jet.lift],[slot*4+2,outlet.x,outlet.y]);
    assert.ok(jet.y<g.p.y);
    assert.equal(jet.angle,Math.atan2(-outlet.dy,-outlet.dx));
  }
});

test('Fajar Penuh sends dawn light to the edge of its circle in every octant',()=>{
  const g=battle('ustaz');
  g.fx=[{kind:'spell',hero:'ustaz',slot:1,...g.p,a:.3,range:290,half:Math.PI,max:.65,life:.32}];
  for(const reduced of [false,true]){
    const rays=draw(g,reduced);
    assert.equal(rays.length,8);
    for(const [i,ray] of rays.entries()){
      assert.equal(ray.angle,.3+i*Math.PI*2/8);
      assert.equal(ray.width,290);
      assert.ok(Math.abs(Math.hypot(ray.x-g.p.x,ray.y-g.p.y)-145)<.001);
    }
  }
});

test('gold bars have their own live rendering and do not reuse the rivet sprite',()=>{
  const g=battle('dani');
  g.projs=[{kind:'gold-bar',x:99,y:40,vx:10,vy:0,r:13,hitOptions:{slot:4}}];
  assert.deepEqual(draw(g),[]);
});
