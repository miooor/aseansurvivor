export function installKeo(api){
  const {HEROES,EVOS,CAST,AUTO,HOOKS,nearest,each,hit,rm,aimDir,ring}=api;
  HEROES.keo={id:'keo',name:'Keo',country:'Laos',role:'Reed resonator · timed releases',hp:105,speed:180,ultNeed:55,basicDamage:14,
    identity:{title:'Reed Resonator',name:'Open Measure',color:'#9edba6',max:2,key:'Q / E / F',loop:'After Q/E/F, cast another from1.5 through2.0 seconds for40% more hero-skill damage. Instant linked AUTO casts favor immediate effects and forgo that timing bonus.',hint:'Cast Q/E/F, wait1.5s, release by2s',ready:'READY · Q/E/F gains40%'},
    skills:[
      {key:'',name:'Reed Puff',desc:'Auto projectile every0.85s:14 damage, range330.',up:'+25% damage.',cd:.85},
      {key:'Q',name:'Low Register',desc:'Length240,70° cone:28 damage and160 knockback. A timed release gains40% damage.',up:'+25% damage.',cd:5},
      {key:'E',name:'High Register',desc:'Three parallel bolts20 apart,14 damage each, speed460, lifetime0.8s; one target may take all3. Timing bonus follows only these bolts.',up:'+25% damage.',cd:6},
      {key:'F',name:'Rest Beat',desc:'Radius150 pulse:18 damage and0.8s non-boss stun. Timed release gains40% damage.',up:'+25% damage.',cd:9},
      {key:'R',name:'Long Exhale',desc:'Four radius180 pulses at cast position after0.3/0.9/1.5/2.1s,30 damage each. Does not start or refresh Open Measure.',up:'+25% damage.',cd:0,ult:true}
    ]};EVOS.keo=[];
  let S,lastRaid=null;
  function clear(){const g=api.G;S={last:null,pulses:[]};if(g){g.roster.keo=S;g.projs=g.projs.filter(q=>q.hitOptions?.hero!=='keo')}}
  function sync(){if(lastRaid!==api.G.raid){clear();lastRaid=api.G.raid}}
  function status(){const g=api.G;if(!g.identity)return;const age=S.last===null?null:g.t-S.last,ready=age!==null&&age>=1.5-1e-8&&age<=2+1e-8;Object.assign(g.identity,{charge:age===null?0:Math.min(2,age),ready,detail:age===null?'Q/E/F · Start measure':age>2+1e-8?'Measure expired · Q/E/F':ready?'READY · '+Math.max(0,2-age).toFixed(2)+'s':'Release in '+Math.max(0,1.5-age).toFixed(2)+'s'})}
  function measure(){sync();const g=api.G,age=S.last===null?-1:g.t-S.last,mul=age>=1.5-1e-8&&age<=2+1e-8?1.4:1;S.last=g.t;status();return mul}
  function bolt(a,r,slot,damage,x=api.G.p.x,y=api.G.p.y,speed=460,life=.8){api.G.projs.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,dmg:damage*rm(r),life,pierce:1,hit:new Set(),hitOptions:{hero:'keo',slot},kind:'nur'})}
  HOOKS.newGame.push(()=>{lastRaid=null;clear()});HOOKS.cleanup.push(clear);
  HOOKS.update.push(()=>{const g=api.G;if(g.hero.id!=='keo')return;sync();const due=S.pulses.filter(q=>g.t>=q.at-1e-8);S.pulses=S.pulses.filter(q=>!due.includes(q));for(const q of due){each(q.x,q.y,180,e=>hit(e,q.damage,{hero:'keo',slot:4}));ring(q.x,q.y,180,'#9edba6',.25)}status()});
  CAST.keo=[
    r=>{sync();const p=api.G.p,e=nearest(p.x,p.y,330);if(!e)return false;bolt(Math.atan2(e.y-p.y,e.x-p.x),r,0,14,p.x,p.y,400,330/400)},
    r=>{const mul=measure(),g=api.G,[ax,ay]=aimDir(),a=Math.atan2(ay,ax);each(g.p.x,g.p.y,240,(e,dx,dy)=>{const angle=Math.atan2(Math.sin(Math.atan2(dy,dx)-a),Math.cos(Math.atan2(dy,dx)-a));if(Math.abs(angle)<=Math.PI*35/180)hit(e,28*rm(r)*mul,{hero:'keo',slot:1,kb:[ax*160,ay*160]})})},
    r=>{const mul=measure(),p=api.G.p,[ax,ay]=aimDir(),a=Math.atan2(ay,ax);for(const offset of [-20,0,20])bolt(a,r,2,14*mul,p.x-ay*offset,p.y+ax*offset)},
    r=>{const mul=measure(),p=api.G.p;each(p.x,p.y,150,e=>{hit(e,18*rm(r)*mul,{hero:'keo',slot:3});if(!e.boss&&e.type!=='body')e.stun=Math.max(e.stun||0,.8)})},
    r=>{sync();const g=api.G;for(const delay of [.3,.9,1.5,2.1]){S.pulses.push({x:g.p.x,y:g.p.y,at:g.t+delay,damage:30*rm(r)});if(S.pulses.length>12)S.pulses.shift()}}
  ];AUTO.keo={order:[1,2,3,4],when:[null,n=>n(240)>=1,n=>n(370)>=1,n=>n(150)>=2,n=>n(180)>=4]};
}
