export function installLia(api){
  const {HEROES,EVOS,CAST,AUTO,HOOKS,nearest,each,hit,rm,aimDir,ring}=api;
  HEROES.lia={id:'lia',name:'Lia Soares',country:'Timor-Leste',role:'Shuttle courier · moving return catches',hp:105,speed:195,ultNeed:50,basicDamage:9,
    identity:{title:'Shuttle Courier',name:'Catch the Return',color:'#e8c979',max:3,key:'E',loop:'Move through returning basic shuttles after0.2s of return to earn up to3 Spools. E spends them for12 extra damage each; standing, dash, teleport and R shuttles give none.',hint:'Move into returning basic shuttles',ready:'E · Spend Spools on dash damage'},
    skills:[
      {key:'',name:'Supply Shuttle',desc:'Every0.85s: shuttle9 damage per outbound/return pass, speed420, turns at0.45s, expires at2s. At most2; moving catches earn Spools.',up:'+25% damage per pass.',cd:.85},
      {key:'Q',name:'Open a Path',desc:'Length240, width35 line for28 damage and160 knockback. Creates no catchable projectile.',up:'+25% damage.',cd:6},
      {key:'E',name:'Carry Through',desc:'Ground dash150 over0.2s, stopping at blockers. Deals20 plus12 per spent Spool once per enemy. No invulnerability or knockback.',up:'+25% dash damage.',cd:7},
      {key:'F',name:'Gather Supplies',desc:'For2s, catch radius grows from24 to60. Opening radius120 pulse:16 damage and1s of50% slow. No XP attraction.',up:'+25% pulse damage.',cd:10},
      {key:'R',name:'Delivery Circuit',desc:'Three larger shuttles at−25°/0°/+25°,22 damage per outbound/return pass. Same420 speed,0.45s turn,2s life; uncapturable, no Spools.',up:'+25% damage per pass.',cd:0,ult:true}
    ]};EVOS.lia=[];
  let S,lastRaid=null;
  function clear(){const g=api.G;S={shuttles:[],spools:0,wideUntil:0,previous:g?{x:g.p.x,y:g.p.y}:null};if(g)g.roster.lia=S}
  function sync(){if(lastRaid!==api.G.raid){clear();lastRaid=api.G.raid}}
  function status(){if(api.G.identity)Object.assign(api.G.identity,{charge:S.spools,ready:S.spools>0,detail:S.spools+' / 3 Spools'+(api.G.t<S.wideUntil?' · Catch60':' · Catch24')})}
  function distance(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-t*dx,y-ay-t*dy)}
  function launch(a,r,ultimate=false){const p=api.G.p;S.shuttles.push({x:p.x,y:p.y,ax:Math.cos(a),ay:Math.sin(a),age:0,damage:(ultimate?22:9)*rm(r),ultimate,r:ultimate?10:6,outHit:new Set(),backHit:new Set()})}
  HOOKS.newGame.push(()=>{lastRaid=null;clear()});HOOKS.cleanup.push(clear);
  HOOKS.update.push(dt=>{
    const g=api.G;if(g.hero.id!=='lia')return;sync();const p=g.p,m=p.normalMove,previous=S.previous;
    const moving=!!m&&!p.dash&&!!previous&&Math.hypot(previous.x-(m.x-m.dx),previous.y-(m.y-m.dy))<.01&&Math.hypot(m.dx,m.dy)>.001;
    for(const q of S.shuttles){let remaining=Math.min(dt,2-q.age),elapsed=0;
      while(remaining>1e-8&&!q.dead){const returning=q.age>=.45-1e-8,span=Math.min(remaining,returning?2-q.age:.45-q.age),sx=q.x,sy=q.y,startAge=q.age;
        let ax=q.ax,ay=q.ay;if(returning){const dx=p.x-q.x,dy=p.y-q.y,l=Math.hypot(dx,dy)||1;ax=dx/l;ay=dy/l}
        q.x+=ax*420*span;q.y+=ay*420*span;q.age+=span;
        const seen=returning?q.backHit:q.outHit;
        for(const e of g.enemies){if(e.dead||seen.has(e))continue;if(distance(e.x,e.y,sx,sy,q.x,q.y)<=e.r+q.r){seen.add(e);hit(e,q.damage,{hero:'lia',slot:q.ultimate?4:0})}}
        if(returning){
          // Compare swept relative paths; only the post-0.2s return segment may earn a catch.
          const from=Math.max(0,Math.min(1,(.65-startAge)/span)),radius=g.t<S.wideUntil?60:24;
          const origin=moving?{x:m.x-m.dx,y:m.y-m.dy}:p,px=t=>origin.x+(moving?m.dx:0)*t,py=t=>origin.y+(moving?m.dy:0)*t;
          const t0=(elapsed+span*from)/dt,t1=(elapsed+span)/dt,rx=sx+(q.x-sx)*from-px(t0),ry=sy+(q.y-sy)*from-py(t0);
          const eligible=q.age>=.65-1e-8&&!q.ultimate&&moving&&distance(0,0,rx,ry,q.x-px(t1),q.y-py(t1))<=radius;
          if(eligible){S.spools=Math.min(3,S.spools+1);q.dead=true;ring(p.x,p.y,28,'#e8c979',.2)}
          else if(distance(p.x,p.y,sx,sy,q.x,q.y)<=24)q.dead=true;
        }
        elapsed+=span;remaining-=span;
      }
    }
    S.shuttles=S.shuttles.filter(q=>!q.dead&&q.age<2-1e-8);S.previous={x:p.x,y:p.y};status();
  });
  CAST.lia=[
    r=>{sync();const p=api.G.p;if(S.shuttles.filter(q=>!q.ultimate).length>=2)return false;const e=nearest(p.x,p.y,350);if(!e)return false;launch(Math.atan2(e.y-p.y,e.x-p.x),r)},
    r=>{sync();const g=api.G,p=g.p,[ax,ay]=aimDir();for(const e of g.enemies){if(e.dead)continue;const dx=e.x-p.x,dy=e.y-p.y,t=dx*ax+dy*ay;if(t>=-e.r&&t<=240+e.r&&Math.abs(dx*ay-dy*ax)<=17.5+e.r)hit(e,28*rm(r),{hero:'lia',slot:1,kb:[ax*160,ay*160]})}},
    r=>{sync();const p=api.G.p,[ax,ay]=aimDir(),damage=(20+12*S.spools)*rm(r);S.spools=0;p.dash={vx:ax*750,vy:ay*750,t:.2,dmg:damage,hit:new Set(),hitOptions:{hero:'lia',slot:2,kb:[0,0]}};status()},
    r=>{sync();const g=api.G;S.wideUntil=g.t+2;each(g.p.x,g.p.y,120,e=>{hit(e,16*rm(r),{hero:'lia',slot:3});e.slowT=Math.max(e.slowT||0,1)});status()},
    r=>{sync();S.shuttles=S.shuttles.filter(q=>!q.ultimate);const [ax,ay]=aimDir(),a=Math.atan2(ay,ax);for(const offset of [-25,0,25])launch(a+offset*Math.PI/180,r,true)}
  ];AUTO.lia={order:[3,1,2,4],when:[null,n=>n(240)>=1,n=>S.spools>0&&n(180)>=1||n(100)>=3,n=>S.shuttles.some(q=>!q.ultimate&&q.age>=.45)||n(120)>=2,n=>n(250)>=5]};
}
