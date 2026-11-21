import assert from 'node:assert/strict';
import {STAGES} from '../src/content/core.js';
import {createWorld} from '../src/content/world.js';

for(const {id,name} of STAGES){
  const world=createWorld(id);
  assert.equal(world.landforms.length,2,`${name} has two authored landforms`);
  for(const hill of world.landforms){
    assert.equal(world.elevationAt(hill.x,hill.y),hill.rise,`${hill.name} reaches its designed height`);
    for(const offset of [-400,-220,0,220,400]){
      const {x}=hill,y=hill.y+offset;
      assert(Math.abs(world.groundY(x,world.projectedDepth(x,y))-y)<.2,
        `${hill.name} inverts pointer projection`);
    }
  }
  assert.equal(world.elevationAt(60000,60000),0,`${name} keeps the raid arena level`);

  let climb=0;
  for(const road of world.roads)for(let i=1;i<road.length;i++){
    const [ax,ay]=road[i-1],[bx,by]=road[i];
    const steps=Math.ceil(Math.hypot(bx-ax,by-ay)/20);
    for(let n=0;n<=steps;n++){
      const x=ax+(bx-ax)*n/steps,y=ay+(by-ay)*n/steps;
      assert(world.walkable(x,y,64),`${name} preserves clearance along the roads`);
      climb=Math.max(climb,world.elevationAt(x,y));
    }
  }
  assert(climb>=75,`${name} has a road that climbs onto high ground`);
  for(const {x,y,w,h} of [...world.waters,...world.bridges,...(world.gangway?[world.gangway]:[])]){
    const cols=Math.ceil(w/20),rows=Math.ceil(h/20);
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
      assert.equal(world.elevationAt(x+w*col/cols,y+h*row/rows),0,
        `${name} keeps water and crossing geometry level`);
    }
  }
  for(const hill of world.landforms){
    for(let y=hill.y-1200;y<hill.y+1200;y+=20)for(let x=hill.x-1200;x<hill.x+1200;x+=20){
      const projectedStep=world.projectedDepth(x,y+20)-world.projectedDepth(x,y);
      assert(projectedStep>=2,`${name} keeps downhill and uphill points distinct on screen`);
    }
  }
}
console.log('Stage elevation checks passed');
