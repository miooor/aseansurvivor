import {ROUTE_CHALLENGES} from '../content/route-challenges.js';
import {HUNTING_MONSTERS,HUNTING_PACKS} from '../content/hunting-monsters.js';
import {huntingPackSites} from './hunting-packs.js';

export function veteranFormation(world,id){
  const route=ROUTE_CHALLENGES[id],start=route.entry,post=route.posts[0];
  const heading=Math.atan2(post.y-start.y,post.x-start.x);
  const pair=HUNTING_PACKS[id][0];
  const canSpawn=({type,x,y})=>{
    const r=HUNTING_MONSTERS[type].r;
    return world.walkable(x,y,r)&&world.clearLine(start,{x,y},Math.max(16,r))&&
      route.posts.every(post=>Math.hypot(x-post.x,y-post.y)>90);
  };
  return huntingPackSites(pair,start,heading,192,canSpawn)??
    huntingPackSites(pair,start,heading+Math.PI,192,canSpawn)??[];
}

export function createRouteChallenge(id,veteran){
  return {definition:ROUTE_CHALLENGES[id],veteran,enemies:[],started:false,cleared:false};
}

export function updateRouteChallenge(g,{makeGhost,banner,ring},busy){
  const route=g.routeChallenge;
  if(!route||route.cleared||g.raid||g.won||g.over)return;
  if(route.started){
    if(route.enemies.every(e=>e.dead)){
      route.cleared=true;
      banner(route.veteran?'Veteran pack defeated · Win the stage to earn your medal':'Route secured',3);
    }
    return;
  }
  const {entry,posts,name,advice}=route.definition;
  if(!route.veteran&&(busy||g.clock<10||Math.hypot(g.p.x-entry.x,g.p.y-entry.y)>360))return;
  route.started=true;
  const multiplier=route.veteran?1.25:1;
  for(const [index,post] of posts.entries()){
    const e=makeGhost(post.type,post.x,post.y);
    e.maxHp*=multiplier;
    e.hp=e.maxHp;
    Object.assign(e,{routeGuard:true,routeSkill:post.skill,skillT:.55+index*1.65,spd:0});
    route.enemies.push(e);
  }
  if(route.veteran){
    for(const [index,{type,x,y}] of veteranFormation(g.world,g.stage.id).entries()){
      const e=makeGhost(type,x,y);
      e.maxHp*=multiplier;
      e.hp=e.maxHp;
      Object.assign(e,{packId:-1,skillT:1.9+index*.65});
      route.enemies.push(e);
      ring(x,y,e.r+18,'#f0cb86',.6);
    }
  }
  banner((route.veteran?'Veteran · ':'')+name+' · '+advice,5);
}

export function earnedVeteranMedal(g,won){
  return won&&!!g.routeChallenge?.veteran&&g.routeChallenge.started&&
    g.routeChallenge.enemies.every(e=>e.dead);
}
