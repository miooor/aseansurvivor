import {HALF,WORLD_SIZE} from '../content/world.js';
import type {Encounter,Point,RunState} from '../game/runtime.js';

type Destination = Point & {key:string; verb:string; label:string};

function nearest<T extends Point>(player:Point,points:T[]){
  return points.reduce<T|undefined>((best,point)=>
    !best || Math.hypot(point.x-player.x,point.y-player.y)<Math.hypot(best.x-player.x,best.y-player.y)?point:best,undefined);
}

function eventDestination(g:RunState,event:Encounter,rewardLabel:string):Destination {
  const key='event:'+event.id;
  if(event.status!=='active')return {...event,key,verb:'Visit',label:rewardLabel};
  if(event.guidance)return {...event.guidance,key};
  if(event.id==='rescue'||(event.id==='hunt'&&event.track===2)){
    const enemy=nearest(g.p,g.enemies.filter(e=>!e.dead&&e.encounter===event.id));
    if(enemy)return {...enemy,key,verb:'Defeat',label:event.id==='hunt'?'Briarback':'Captor'};
    if(event.id==='rescue')return {...event,key,verb:'Rescue',label:'Traveller'};
    return {...event,key,verb:'Defeat',label:'Briarback'};
  }
  if(event.id==='hunt')return {...event,key,verb:'Inspect',label:`Track ${(event.track??0)+1} of 2`};
  if(event.id==='ward')return {...event,key,verb:'Defend',label:'Ward lantern'};
  return {...event,key,verb:'Visit',label:event.name};
}

export class RegionMap {
  private map=document.getElementById('worldMap')!;
  private fullMap=matchMedia('(min-width: 761px) and (min-height: 521px)');
  private fitMap=()=>{const details=this.map.querySelector('details');if(details)details.open=this.fullMap.matches};
  private world?:RunState['world'];
  private picker!:HTMLSelectElement;
  private choices='';
  private points:Point[]=[];
  private routeKey='';
  private nextTurn=0;
  private gps=document.getElementById('objectiveGps')!;
  private verb=document.getElementById('gpsVerb')!;

  constructor(){this.fullMap.addEventListener('change',this.fitMap)}

  private direct(g:RunState,target:Destination){
    const {world,p}=g;
    const routeKey=target.key+'|'+target.verb+'|'+target.label+'|'+!!world.gangway?.open;
    if(routeKey!==this.routeKey || g.t>=this.nextTurn){
      const turns=this.points.slice(1,-1);
      const last=turns.at(-1);
      if(world.walkable(target.x,target.y,p.r)&&world.clearLine(p,target,p.r)){
        this.points=[p,target];
      }else if(routeKey===this.routeKey&&last&&world.clearLine(last,target,p.r)){
        let first=turns.length-1;
        while(first>=0&&!world.clearLine(p,turns[first],p.r))first--;
        this.points=first<0?world.routePath(p,target):[p,...turns.slice(first),target];
      }else this.points=world.routePath(p,target);
      this.routeKey=routeKey;
      this.nextTurn=g.t+.12;
      this.map.querySelector('#mapRoute')!.setAttribute('points',this.points.map(q=>[q.x+HALF,q.y+HALF].join(',')).join(' '));
    }
    const distance=Math.hypot(target.x-p.x,target.y-p.y);
    const objective=this.map.querySelector('#mapObjective')!;
    const caption=target.verb+' · '+target.label+' · '+(this.points.length?Math.round(distance)+' m':'No walkable route');
    if(objective.textContent!==caption)objective.textContent=caption;
    if(!this.points.length||g.practice||g.paused||g.choosing||g.lootModal)return;
    const turn=this.points[1],arrived=distance<12;
    const angle=arrived?Math.PI/2:Math.atan2(turn.y-p.y,turn.x-p.x);
    this.gps.toggleAttribute('data-arrived',arrived);
    this.gps.hidden=false;
    this.gps.style.setProperty('--turn',angle+'rad');
    this.gps.style.setProperty('--bearing-x',String(Math.cos(angle)));
    this.gps.style.setProperty('--bearing-y',String(Math.sin(angle)));
    if(this.verb.textContent!==target.verb)this.verb.textContent=target.verb;
  }
  private build(w:RunState['world']){
    this.world=w;this.choices='';this.routeKey='';this.points=[];
    const LANDMARKS=w.landmarks;
    const featured=LANDMARKS.find(site=>site.featured);
    const gate=w.gangway;
    const crossing=gate?`<path data-gangway d="M ${gate.x+gate.w/2+HALF} ${gate.y+HALF} v ${gate.h}" />`:'';
    const wind=w.wauLookout;
    const windLane=wind?`<rect data-wau-lane x="${wind.x+HALF}" y="${wind.y+HALF}" width="${wind.w}" height="${wind.h}"><title>Padang Layang wind lane</title></rect>`:'';

    this.map.innerHTML=`<details ${this.fullMap.matches?'open':''}><summary><strong>${w.name}</strong><span id="regionName"></span></summary><svg viewBox="0 0 ${WORLD_SIZE} ${WORLD_SIZE}" role="img" aria-label="${w.name} overview. Player position, terrain, crossings and landmarks, including ${featured?.name??w.name}.${wind?' Padang Layang wind lane is marked.':''}"><rect width="${WORLD_SIZE}" height="${WORLD_SIZE}" fill="#233c32"/>`+w.waters.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#5796a3"/>`).join('')+w.roads.map(path=>`<polyline points="${path.map(([x,y])=>[x+HALF,y+HALF].join(',')).join(' ')}" fill="none" stroke="#cbb786" stroke-width="63" opacity=".7"/>`).join('')+w.bridges.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#d1b67d"/>`).join('')+w.rocks.map(r=>`<rect x="${r.x+HALF}" y="${r.y+HALF}" width="${r.w}" height="${r.h}" fill="#899599"/>`).join('')+crossing+'<polyline id="mapRoute" fill="none" stroke="#fff0ac" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'+LANDMARKS.map((s,i)=>`<circle data-site="${s.id}" cx="${s.x+HALF}" cy="${s.y+HALF}" r="${s.featured?230:150}" fill="#78887a" ${s.featured?'stroke="#f1c882" stroke-width="64"':''}><title>${i+1}. ${s.name}</title></circle>`).join('')+windLane+'<g id="mapHeading"><path d="M300 0L50 -100L50 100Z" fill="#fff0ac"/></g><circle id="mapPlayer" r="112" fill="#fff2b4" stroke="#162b26" stroke-width="45"/></svg><span id="mapObjective"></span><select aria-label="Route destination" aria-describedby="mapObjective"></select></details>';
    this.picker=this.map.querySelector('select')!;
    this.picker.onkeydown=e=>{if(e.key!=='Tab')e.stopPropagation()};
    this.picker.onchange=()=>{this.routeKey=''};
    this.map.querySelector('svg')!.onclick=e=>{
      const marker=(e.target as Element).closest<SVGElement>('[data-event],[data-site]');
      if(!marker)return;
      const key=marker.dataset.event?'event:'+marker.dataset.event:'cache:'+marker.dataset.site;
      if(Array.from(this.picker.options).some(o=>o.value===key)){
        this.picker.value=key;
        this.routeKey='';
      }
    };
  }
  update(g:RunState|null){
    const visible=!!g&&!g.raid&&!g.over;
    this.gps.hidden=true;
    this.map.hidden=!visible;
    if(!visible||!g)return;
    if(g.world!==this.world)this.build(g.world);
    const LANDMARKS=g.world.landmarks;
    document.getElementById('mapPlayer')!.setAttribute('cx',String(g.p.x+HALF));document.getElementById('mapPlayer')!.setAttribute('cy',String(g.p.y+HALF));
    document.getElementById('mapHeading')!.setAttribute('transform',`translate(${g.p.x+HALF} ${g.p.y+HALF}) rotate(${Math.atan2(g.p.face[1],g.p.face[0])*180/Math.PI})`);
    const nearby=LANDMARKS.reduce((a,b)=>Math.hypot(g.p.x-a.x,g.p.y-a.y)<Math.hypot(g.p.x-b.x,g.p.y-b.y)?a:b);
    document.getElementById('regionName')!.textContent=nearby.name;
    for(const s of LANDMARKS)this.map.querySelector(`[data-site="${s.id}"]`)!.setAttribute('fill',g.exploration.claimed.includes(s.id)?'#d9b96f':g.exploration.visited.includes(s.id)?'#89dfc5':'#78887a');
    const svg=this.map.querySelector('svg')!;
    const gate=g.world.gangway;
    if(gate)svg.querySelector<SVGElement>('[data-gangway]')!.dataset.state=gate.open?'open':'closed';
    const wind=g.wauWind;
    const lookout=g.world.wauLookout;
    if(wind)svg.querySelector<SVGElement>('[data-wau-lane]')!.dataset.state=wind.phase;
    const choices=new Map<string,string>([['','Automatic']]);
    const destinations=new Map<string,Destination>();
    let active:Destination|undefined;
    for(const event of Object.values(g.encounters)){
      let marker=svg.querySelector<SVGGElement>(`[data-event="${event.id}"]`);
      if(event.status!=='active'&&!(event.status==='available'&&event.discovered)){marker?.remove();continue}
      const rewardLabel=event.name+' · '+event.slot;
      const point=eventDestination(g,event,rewardLabel);
      choices.set(point.key,rewardLabel);
      destinations.set(point.key,point);
      if(event.status==='active')active??=point;
      if(!marker){
        marker=document.createElementNS('http://www.w3.org/2000/svg','g');
        marker.dataset.event=event.id;
        marker.innerHTML='<path d="M0 -220 L180 0 0 220 -180 0Z" stroke="#211c17" stroke-width="42"/><title></title>';
        svg.insertBefore(marker,svg.querySelector('#mapHeading'));
      }
      marker.setAttribute('transform',`translate(${point.x+HALF} ${point.y+HALF})`);
      marker.setAttribute('fill',event.status==='active'?'#ffdb77':'#cca582');
      const title=marker.querySelector('title')!,description=event.status==='active'?rewardLabel+' · '+point.label:rewardLabel;
      if(title.textContent!==description)title.textContent=description;
    }
    const caches=LANDMARKS.filter(s=>s.reward&&!g.exploration.claimed.includes(s.id));
    const next=nearest(g.p,caches);
    for(const site of caches){
      const key='cache:'+site.id,visited=g.exploration.visited.includes(site.id);
      if(visited)choices.set(key,site.name+' cache');
      const guard=nearest(g.p,(g.exploration.guards[site.id]??[]).filter(e=>!e.dead));
      destinations.set(key,{...(guard??site),key,verb:guard?'Defeat':visited?'Collect':'Explore',
        label:site.name+(guard?' guardian':'')});
    }
    const signature=JSON.stringify([...choices]);
    if(signature!==this.choices){
      const selected=this.picker.value;
      this.picker.replaceChildren(...Array.from(choices,([value,name])=>new Option(name,value)));
      this.picker.value=choices.has(selected)?selected:'';
      this.choices=signature;
    }
    let target=active??destinations.get(this.picker.value);
    if(!target){
      if(wind&&lookout&&['ready','raising'].includes(wind.phase)&&Math.hypot(g.p.x-lookout.station.x,g.p.y-lookout.station.y)<600){
        target={...lookout.station,key:'wau',verb:'Launch',label:'Padang Layang'};
      }else if(gate&&!gate.open&&Math.hypot(g.p.x-gate.winch.x,g.p.y-gate.winch.y)<460){
        target={...gate.winch,key:'winch',verb:'Lower',label:'Chew Jetty gangway'};
      }else if(next)target=destinations.get('cache:'+next.id);
    }
    if(target)this.direct(g,target);
    else{
      this.routeKey='';
      svg.querySelector('#mapRoute')!.removeAttribute('points');
      this.map.querySelector('#mapObjective')!.textContent='All supply caches claimed';
    }
  }
  destroy(){this.fullMap.removeEventListener('change',this.fitMap);this.map.hidden=true;this.gps.hidden=true}
}
