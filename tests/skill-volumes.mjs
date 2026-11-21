import assert from 'node:assert/strict';
import {test} from 'node:test';
import {drawSkillVolumes} from '../src/scenes/skill-volumes.ts';

function sample(sprite,time=1,reduced=false){
  const triangles=[],lights=[];
  drawSkillVolumes({facet:(points,...style)=>triangles.push([points,...style])},{
    strip:(...args)=>lights.push(args),glow:(...args)=>lights.push(args)
  },[sprite],time,reduced);
  return {triangles,lights};
}
const sheet={frame:16,x:300,y:50,width:140,height:140,angle:0,lift:0,alpha:1,ground:true,relief:'field'};

test('each kit has raised surfaces and illumination on a painted field',()=>{
  for(const hero of ['rempit','nok','lan','sari','asha','mira','vanna','keo','lia']){
    const sprite={...sheet,hero};
    const {triangles,lights}=sample(sprite);
    assert.ok(lights.length>0&&triangles.length>0,hero);
    assert.ok(triangles.flatMap(([points])=>points).some(([,,h])=>h>16),hero);
    assert.deepEqual(sample(sprite,.1,true),sample(sprite,1.7,true),hero);
  }
});
test('a returning shot carries its folded wake behind it in either direction',()=>{
  const sprite={...sheet,hero:'vanna',relief:'shot',ground:false,width:72,lift:36};
  for(const angle of [0,Math.PI]){
    const {triangles}=sample({...sprite,angle});
    const points=triangles.flatMap(([v])=>v);
    assert.ok(points.length&&points.every(([x])=>(x-sprite.x)*Math.cos(angle)<0));
  }
});
test('Sanctuary and untagged damage stamps keep their own light',()=>{
  assert.deepEqual(sample({...sheet,hero:'ustaz'}),{triangles:[],lights:[]});
  assert.deepEqual(sample({...sheet,hero:'nok',relief:undefined}),{triangles:[],lights:[]});
});

test('the cook gets five distinct volumes that freeze under reduced motion',()=>{
  const counts=new Set();
  for(const slot of [0,1,2,3,4]){
    const sprite={...sheet,hero:'mira',frame:4*slot+2};
    const pose=sample(sprite,0,true);
    assert.deepEqual(pose,sample(sprite,3,true));
    counts.add(pose.triangles.length);
    assert.ok(pose.lights.length>0);
    assert.ok(pose.triangles.flatMap(([vertices])=>vertices).every(v=>v.every(Number.isFinite)));
  }
  assert.equal(counts.size,5);
});
