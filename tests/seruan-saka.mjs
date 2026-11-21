import assert from 'node:assert/strict';
import {test} from 'node:test';
import {drawSilatSaka} from '../src/scenes/silat-saka.ts';

function frame(age,reduced=false){
  const faces=[],rings=[];
  drawSilatSaka({facet:points=>faces.push(points),strip:points=>{if(points.length===65)rings.push(points)},glow(){}},
    {x:40,y:-20,max:1,life:1-age,range:260},reduced);
  return {faces,rings};
}
test('Seruan poses the spirit in 3D and its wave reaches the cast radius',()=>{
  const guard=frame(.25),sweep=frame(.8);
  assert.notDeepEqual(guard.faces,sweep.faces);
  assert.ok(sweep.faces.flat().some(([,,z])=>z>130));
  assert.ok(sweep.rings[0].every(([x,y])=>Math.abs(Math.hypot(x-40,y+20)-260)<.001));
  assert.deepEqual(frame(.25,true),frame(.8,true));
});
