export function installMira(api){
  const {HEROES,EVOS,CAST,AUTO,HOOKS,hit,each,nearest,aimDir,rm,ring:drawRing,safePoint}=api,color='#67d8df';
  const ring=(...args)=>{drawRing(...args);api.G.fx.at(-1).hero='mira'};
  HEROES.mira={id:'mira',name:'Mira Reyes',country:'Philippines',role:'Towline runner · move sideways, sweep a triangle',hp:120,speed:185,ultNeed:55,basicDamage:15,price:0,
    identity:{title:'Towline Runner',name:'Take the Strain',color,max:90,key:'E',loop:'Q fixes a tow endpoint for 5 s. Move normally through a 90° angle while 60–300 units from it, then E sweeps the triangle.',hint:'Q · Anchor → move sideways → E · Triangle',ready:'E · Release the triangle'},
    skills:[
      {key:'',name:'Pole Tap',desc:'Every 0.7 s, hit a 100-unit, 70° forward arc at the nearest enemy for 15 damage.',up:'+25% damage per rank.',cd:.7},
      {key:'Q',name:'Set the Tow',desc:'Place one ground endpoint up to 220 away for 5 s. A 24-wide line hits for 24 damage and pushes 150. Replaces the old endpoint and resets tension.',up:'+25% damage and shorter cooldown per rank.',cd:6},
      {key:'E',name:'Swing Clear',desc:'Radius-110 sweep deals 28. With 90° tension, replace it with a triangle from the endpoint, saved start and current position, plus 35 edge margin, for 55; consume endpoint.',up:'+25% damage and shorter cooldown per rank.',cd:7},
      {key:'F',name:'Brace the Reel',desc:'Take 25% less damage for 3 s. Initial radius-120 push deals 12 damage and pushes eligible enemies 180. Bracing earns no tension.',up:'+25% damage and shorter cooldown per rank.',cd:11},
      {key:'R',name:'Open Water Turn',desc:'Spend 55 charge. Three fixed 340-long, 40-wide lines strike captured aim at 0.3, 0.7 and 1.1 s for 38 each. No movement or endpoint generation.',up:'+25% damage per rank.',cd:0,ult:true}]};EVOS.mira=[];
  const fresh=()=>({endpoint:null,release:null,braceUntil:0,strikes:[],raid:api.G?.raid,lastX:api.G?.p.x,lastY:api.G?.p.y});
  function clear(){const g=api.G;if(!g)return;g.projs=g.projs.filter(q=>q.hero!=='mira');g.fx=g.fx.filter(f=>f.hero!=='mira');g.roster.mira=fresh()}
  function rebase(s){const p=api.G.p,q=s.endpoint;if(q){q.startX=p.x;q.startY=p.y;q.angle=Math.atan2(p.y-q.y,p.x-q.x);q.progress=0;q.ready=false}}
  function sync(){const g=api.G;if(!g||g.hero.id!=='mira')return null;let s=g.roster.mira;if(!s||s.raid!==g.raid){clear();s=g.roster.mira}if(s.endpoint&&s.endpoint.until<=g.t+1e-8)s.endpoint=null;if(s.release&&s.release.until<=g.t+1e-8)s.release=null;return s}
  function status(s){const g=api.G,q=s.endpoint;if(!g.identity)return;g.identity.charge=q?.progress||0;g.identity.ready=!!q?.ready;g.identity.detail=q?(q.ready?'90° READY':Math.floor(q.progress)+'° / 90°')+' · '+Math.max(0,q.until-g.t).toFixed(1)+'s':'Q · Set a tow endpoint'}
  function line(x,y,ax,ay,len,width,damage,kb,slot){for(const e of api.G.enemies){if(e.dead)continue;const dx=e.x-x,dy=e.y-y,t=dx*ax+dy*ay;if(t>=-e.r&&t<=len+e.r&&Math.abs(dx*ay-dy*ax)<=width/2+e.r)hit(e,damage,{hero:'mira',slot,kb:[ax*kb,ay*kb]})}ring(x+ax*len/2,y+ay*len/2,24,color,.3)}
  function segment(e,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((e.x-a.x)*dx+(e.y-a.y)*dy)/l)):0;return Math.hypot(e.x-a.x-t*dx,e.y-a.y-t*dy)}
  function triangle(e,a,b,c){const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x),area=cross(a,b,c),u=cross(a,b,e),v=cross(b,c,e),w=cross(c,a,e);return Math.abs(area)>1e-8&&((u>=0&&v>=0&&w>=0)||(u<=0&&v<=0&&w<=0))||Math.min(segment(e,a,b),segment(e,b,c),segment(e,c,a))<=35+e.r}
  HOOKS.newGame.push(g=>{if(g.hero.id==='mira')g.roster.mira=fresh()});HOOKS.cleanup.push(()=>{if(api.G?.hero.id==='mira')clear()});
  CAST.mira=[
    r=>{sync();const p=api.G.p,target=nearest(p.x,p.y,100);if(!target)return false;const angle=Math.atan2(target.y-p.y,target.x-p.x);each(p.x,p.y,100,(e,dx,dy)=>{const d=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));if(Math.abs(d)<=35*Math.PI/180)hit(e,15*rm(r),{hero:'mira',slot:0})});},
    r=>{const s=sync(),g=api.G,p=g.p,[ax,ay]=aimDir(),point=safePoint(p.x+ax*220,p.y+ay*220,0),len=Math.hypot(point.x-p.x,point.y-p.y);if(len<1)return false;s.endpoint={...point,startX:p.x,startY:p.y,angle:Math.atan2(p.y-point.y,p.x-point.x),progress:0,ready:false,until:g.t+5};s.lastX=p.x;s.lastY=p.y;line(p.x,p.y,(point.x-p.x)/len,(point.y-p.y)/len,len,24,24*rm(r),150,1);status(s);},
    r=>{const s=sync(),p=api.G.p,q=s.endpoint;if(q&&(p.dash||Math.hypot(p.x-s.lastX,p.y-s.lastY)>1e-5||Math.hypot(p.x-q.x,p.y-q.y)<60||Math.hypot(p.x-q.x,p.y-q.y)>300))rebase(s);
      if(q?.ready){const start={x:q.startX,y:q.startY};s.release={a:{x:q.x,y:q.y},b:start,c:{x:p.x,y:p.y},margin:35,until:api.G.t+.35};s.endpoint=null;for(const e of api.G.enemies)if(!e.dead&&triangle(e,q,start,p))hit(e,55*rm(r),{hero:'mira',slot:2})}else{each(p.x,p.y,110,e=>hit(e,28*rm(r),{hero:'mira',slot:2}));ring(p.x,p.y,110,color,.3)}status(s);},
    r=>{const s=sync(),g=api.G,p=g.p;s.braceUntil=g.t+3;each(p.x,p.y,120,(e,dx,dy)=>{const d=Math.hypot(dx,dy)||1;hit(e,12*rm(r),{hero:'mira',slot:3,kb:[dx/d*180,dy/d*180]})});ring(p.x,p.y,120,color,.4);},
    r=>{const s=sync(),g=api.G,[ax,ay]=aimDir();for(const delay of [.3,.7,1.1])s.strikes.push({x:g.p.x,y:g.p.y,ax,ay,at:g.t+delay,damage:38*rm(r)});if(s.strikes.length>12)s.strikes.splice(0,s.strikes.length-12);}
  ];
  HOOKS.hurt.push(d=>{const s=sync();if(s&&s.braceUntil>api.G.t)return d*.75});
  HOOKS.update.push(()=>{const s=sync();if(!s)return;const g=api.G,p=g.p,q=s.endpoint,m=p.normalMove;if(q){const distance=Math.hypot(p.x-q.x,p.y-q.y),continuous=m&&!p.dash&&Math.hypot(m.x-m.dx-s.lastX,m.y-m.dy-s.lastY)<1e-5;
      if(distance<60||distance>300||p.dash||!continuous&&Math.hypot(p.x-s.lastX,p.y-s.lastY)>1e-5)rebase(s);
      else if(continuous){const delta=Math.atan2(p.y-q.y,p.x-q.x)-q.angle;q.progress=Math.min(90,Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))*180/Math.PI);if(q.progress>=90-1e-8)q.ready=true}}
    s.lastX=p.x;s.lastY=p.y;for(const strike of s.strikes)if(strike.at<=g.t+1e-8)line(strike.x,strike.y,strike.ax,strike.ay,340,40,strike.damage,0,4);s.strikes=s.strikes.filter(q=>q.at>g.t+1e-8);status(s);});
  AUTO.mira={order:[1,3,2,4],when:[null,n=>n(300)>=1,n=>!!sync()?.endpoint?.ready||n(110)>=2,n=>n(120)>=2,n=>n(340)>=6||!!api.G.boss&&n(340)>=1]};
}
