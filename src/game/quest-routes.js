import {REGIONAL_QUESTS,RESCUE_ROUTE} from '../content/regional-quests.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const REACH=120;
const definitions=Object.fromEntries(Object.values(REGIONAL_QUESTS).map(d=>[d.id,d]));
definitions.rescue=RESCUE_ROUTE;

function location(world,site){
  switch(site){
    case 'winch': return {...world.gangway.winch,name:'Chew Jetty winch'};
    case 'kiteStation': return {...world.wauLookout.station,name:'Padang Layang Lookout'};
    case 'marketRoad': return {x:1940,y:1240,name:'Market bridge approach'};
    case 'marketBridge': return {x:1350,y:900,name:'Market bridge'};
    default: return world.landmarks.find(place=>place.id===site);
  }
}

export function questRoutes(api,spawn,complete){
  const step=e=>definitions[e.id].steps[e.stepIndex];
  function guide(e,point,verb,label){
    Object.assign(e.guidance,{x:point.x,y:point.y,verb,label});
  }
  function advance(e){
    const definition=definitions[e.id];
    e.stepIndex++;
    if(e.stepIndex===definition.steps.length){complete(e);return;}
    const current=step(e),world=api.G.world;
    if(current.kind==='gangway'&&world.gangway.open){advance(e);return;}
    const place=location(world,current.site);
    e.destination={...world.safePoint(place.x,place.y,40),name:place.name};
    e.fighting=false;
    if(current.kind==='wau')e.previousFlight=api.G.wauWind.startedAt;
    guide(e,e.destination,current.verb,place.name);
  }
  function start(e){
    e.guidance={};
    if(definitions[e.id].companionName)e.companion={x:e.x,y:e.y,moving:false};
    e.stepIndex=-1;
    advance(e);
  }
  function updateFight(e,current){
    const g=api.G;
    if(!e.fighting){
      if(distance(g.p,e.destination)>REACH)return;
      e.fighting=true;
      for(let i=0;i<current.count;i++){
        const angle=i*2*Math.PI/current.count;
        spawn(e,i===0?g.world.signature:'pocong',e.destination.x+155*Math.cos(angle),e.destination.y+155*Math.sin(angle));
      }
    }
    let nearest;
    for(const enemy of g.enemies){
      if(!enemy.dead&&enemy.encounter===e.id&&(!nearest||distance(g.p,enemy)<distance(g.p,nearest)))nearest=enemy;
    }
    if(nearest)guide(e,nearest,'Defeat',e.id==='rescue'?'Bridge ambusher':e.destination.name+' ghost');
    else advance(e);
  }
  function update(e,dt){
    const g=api.G,current=step(e),target=e.destination,npc=e.companion;
    if(npc)npc.moving=false;
    if(current.kind==='fight'&&e.fighting){updateFight(e,current);return;}
    if(npc&&distance(g.p,npc)>290){
      guide(e,npc,'Regroup',definitions[e.id].companionName);
      return;
    }
    guide(e,target,current.verb,target.name);
    switch(current.kind){
      case 'fight': updateFight(e,current);break;
      case 'escort': {
        const remaining=distance(npc,target);
        if(remaining<28){
          if(distance(g.p,target)<=REACH)advance(e);
          break;
        }
        const [dx,dy]=g.world.routeDirection(npc,target);
        const travel=Math.min(remaining,175*dt);
        const next=g.world.moveOnMap(npc.x,npc.y,npc.x+dx*travel,npc.y+dy*travel,24);
        npc.moving=distance(next,npc)>.01;
        Object.assign(npc,next);
        break;
      }
      case 'gangway': if(g.world.gangway.open)advance(e);break;
      case 'wau': if(g.wauWind.startedAt!==e.previousFlight&&g.wauWind.phase==='gust')advance(e);break;
    }
  }
  function progress(e){
    const current=step(e),target=e.destination.name;
    if(e.guidance.verb==='Regroup')return 'Return to the '+definitions[e.id].companionName.toLowerCase()+' to continue.';
    if(e.fighting)return 'Defeat the ghosts at '+target;
    if(current.kind==='escort')return 'Stay with the '+definitions[e.id].companionName.toLowerCase()+' to '+target;
    if(current.kind==='gangway')return 'Use the Chew Jetty winch to lower the gangway.';
    if(current.kind==='wau')return 'Raise the wau at '+target;
    return current.verb+' '+current.item+' · '+target;
  }
  return {start,update,progress,meter:e=>[e.stepIndex,definitions[e.id].steps.length],
    canInteract:e=>step(e).kind==='action',interactLabel:e=>step(e).verb+' '+step(e).item,
    interact:advance};
}
