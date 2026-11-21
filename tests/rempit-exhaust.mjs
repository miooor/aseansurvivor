import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bikeExhaust,drawWheelieFire,drawExhaustPatches} from '../src/scenes/bike-exhaust.ts';

const bike=(key,frame,rotation=0)=>({key,x:400,y:300,width:240,height:144,originY:135/144,
  rotation,frame:{name:String(frame),width:240,height:144}});

test('the front-facing idle muffler sits beside the bike and vents away from the front tyre',()=>{
  const socket=bikeExhaust(bike('hero-directions',10));
  assert.ok(socket.x<390&&socket.y<285);
  assert.ok(socket.dx<0&&socket.dy<0);
});

test('the east-facing wheelie moves the exhaust with the lifted chassis',()=>{
  const windup=bikeExhaust(bike('hero-skills-rempit',0));
  const wheelie=bikeExhaust(bike('hero-skills-rempit',8));
  assert.ok(wheelie.x-windup.x>50);
  assert.ok(wheelie.dx<0);
});

test('turn banking rotates the outlet and plume about the same pivot as the rider',()=>{
  const base=bikeExhaust(bike('hero-motion-rempit',0));
  const banked=bikeExhaust(bike('hero-motion-rempit',0,.1));
  const x=base.x-400,y=base.y-300;
  assert.ok(Math.abs(banked.x-(400+x*Math.cos(.1)-y*Math.sin(.1)))<.001);
  assert.ok(Math.abs(banked.dy-(base.dx*Math.sin(.1)+base.dy*Math.cos(.1)))<.001);
});

test('Wheelie flames rise at road-fixed intervals regardless of segment subdivision',()=>{
  const capture=(segments,time=0)=>{
    const faces=[];
    for(const [x,tx] of segments)drawWheelieFire({facet:points=>faces.push(points),strip(){},glow(){}},
      {x,y:0,tx,ty:0,life:1,max:1.4},time,true);
    return faces;
  };
  const full=capture([[0,80]]);
  assert.ok(full.flat().some(point=>point[2]>25));
  assert.deepEqual(capture([[0,35],[35,80]],2),full);
  assert.deepEqual(capture([[5,5]]),[]);
});

test('idling stacks a single exhaust flame cluster and Wheelie keeps its own trail',()=>{
  function capture(zones,time){
    const faces=[];
    drawExhaustPatches({facet:points=>faces.push(points),strip(){},glow(){}},zones,time,true);
    return faces;
  }
  const patch={kind:'fire',x:12,y:10,r:30,life:2};
  const one=capture([patch],0);
  assert.ok(one.flat().some(point=>point[2]>30));
  assert.deepEqual(capture([{...patch,x:13},patch,{...patch,slot:1,x:200}],2),one);
  assert.equal(capture([patch,{...patch,x:120}],0).length,one.length*2);
  assert.deepEqual(capture([{...patch,life:0}],0),[]);
});
