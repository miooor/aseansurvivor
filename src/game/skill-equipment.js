export function installSkillEquipment(api){
  let pending=[],fields=[],lastRaid=null;
  function remove(item){
    if(!item)return;
    pending=pending.filter(strike=>strike.item!==item);fields=fields.filter(field=>field.item!==item);
    for(const key of ['fx','projs'])api.G[key]=api.G[key].filter(effect=>effect.item!==item);
  }
  function clearTransient(){
    pending=[];fields=[];
    const g=api.G;if(g){g.fx=g.fx.filter(effect=>!effect.item);g.projs=g.projs.filter(projectile=>projectile.origin!=='item');}
  }
  function sync(){const g=api.G;if(g&&lastRaid!==g.raid){clearTransient();lastRaid=g.raid;}}
  api.HOOKS.newGame.push(()=>{pending=[];fields=[];lastRaid=null;});
  api.HOOKS.cleanup.push(clearTransient);
  function schedule(item,point,damage,delay,r,slow=false){
    const warning={kind:'wave',...point,r,c:'#8fe8ed',life:delay,max:delay,item};
    pending.push({...point,item,damage,at:api.G.t+delay,r,slow,warning});api.G.fx.push(warning);
    if(pending.length>12)pending.shift().warning.life=0;
  }
  for(const id of Object.keys(api.HEROES))api.CAST[id]=api.CAST[id].map((cast,slot)=>rank=>{
    sync();
    // Capture before movement casts and their successful-cast hooks run.
    const g=api.G,{x,y}=g.p,[ax,ay]=api.aimDir(),candidate=slot===1?api.nearest(x,y,Infinity):null;
    const target=candidate&&Math.hypot(candidate.x-x,candidate.y-y)<=450?candidate:null;
    const point={x:target?.x??x+ax*220,y:target?.y??y+ay*220},damage=22*api.rm(rank);
    const result=cast(rank);
    if(result===false||g.over||g.won)return result;
    if(slot===1&&g.equipment.weapon==='echoLattice'){
      schedule('echoLattice',point,damage,.45,90);
      api.text(x,y-55,'Echo Lattice','#8fe8ed',14);
    }
    if(slot===2&&g.equipment.weapon==='forkedConduit'){
      const angle=Math.atan2(ay,ax);
      for(const offset of [-Math.PI/10,Math.PI/10]){const a=angle+offset;g.projs.push({x,y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,r:6,dmg:18*api.rm(rank),life:1.2,pierce:2,hit:new Set(),kind:'nur',origin:'item',item:'forkedConduit'});}
      api.text(x,y-55,'Forked Conduit','#8fe8ed',14);
    }
    if(slot===3&&g.equipment.charm==='undertowThread'){
      const warning={kind:'wave',x,y,r:140,c:'#8fe8ed',life:3,max:3,item:'undertowThread'};
      fields.push({x,y,item:'undertowThread',at:g.t+3,warning});g.fx.push(warning);
      if(fields.length>3)fields.shift().warning.life=0;
      api.text(x,y-55,'Undertow Thread','#8fe8ed',14);
    }
    if(slot>=1&&slot<=3&&g.equipment.charm==='relayKnot'){
      for(let other=1;other<=3;other++)if(other!==slot)g.cds[other]=Math.max(0,g.cds[other]-1);
      api.text(x,y-55,'Relay Knot','#8fe8ed',14);
    }
    if(slot>=1&&slot<=3&&g.equipment.relic==='crosswindDrum'){
      const previous=g.itemState.crosswindDrum,trigger=previous&&previous.last!==slot&&g.t-previous.at<=3+1e-8;
      g.itemState.crosswindDrum={last:slot,at:g.t,until:trigger?g.t+3:previous?.until||0};
      if(trigger){api.text(x,y-55,'Crosswind Drum +20%','#8fe8ed',14);api.ring(x,y,100,'#8fe8ed',.4);}
    }
    if(slot===4&&g.equipment.relic==='monsoonLens'){
      for(const delay of [.6,1.2,1.8])schedule('monsoonLens',{x,y},18*api.rm(rank),delay,180,true);
      api.text(x,y-55,'Monsoon Lens','#8fe8ed',14);
    }
    return result;
  });
  api.HOOKS.update.push(()=>{
    sync();
    const g=api.G;
    for(const strike of pending)if(strike.at<=g.t+1e-8){strike.warning.life=0;api.each(strike.x,strike.y,strike.r,e=>{api.hit(e,strike.damage,{origin:'item'});if(strike.slow)e.slowT=Math.max(e.slowT||0,.6);});api.ring(strike.x,strike.y,strike.r,'#8fe8ed',.35);}
    pending=pending.filter(strike=>strike.at>g.t+1e-8);
    fields=fields.filter(field=>field.at>g.t+1e-8);
    for(const field of fields)api.each(field.x,field.y,140,e=>{e.slowT=Math.max(e.slowT||0,.6);});
  });
  return {remove,sync};
}
