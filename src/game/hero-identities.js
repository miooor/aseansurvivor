import {skillPoses} from '../content/skill-visuals.js';
const IDENTITIES={
  ustaz:{title:'Keeper of the Dawn',name:'Sanctuary',color:'#f4d58a',max:4,key:'F',
    loop:'Build light with four basic attacks. Release Seruan to create a healing sanctuary and hold your ground.',
    hint:'Basic attacks gather light',ready:'F · Raise a healing sanctuary'},
  rempit:{title:'Midnight Rider',name:'Redline',color:'#ffab70',max:100,key:'Q',
    loop:'Keep moving to build Redline. Spend it on Wheelie for a longer, harder-hitting dash that burns a path through the horde.',
    hint:'Keep moving to build Redline',ready:'Q · Unleash a burning dash'},
  nok:{title:'The Unbroken',name:'Rhythm',color:'#ff8a83',max:3,key:'Q / E / F',
    loop:'Chain three techniques, switching skill each time within six seconds. The third releases a stunning shockwave.',
    hint:'Alternate Q, E and F · 6s window',ready:'Alternate to finish the chain'},
  lan:{title:'Mistweaver',name:'High Tide',color:'#7edeea',max:100,key:'E',
    loop:'Slow the horde with Lake Splash. Hits against slowed enemies build Tide; spend it on Little Guards for a larger, stronger troupe.',
    hint:'Hit slowed enemies to raise Tide',ready:'E · Summon an empowered troupe'},
  sari:{title:'The Twilight Blade',name:'Riposte',color:'#e7a2db',max:1,key:'Q',
    loop:'Catch an attack with Bunga Silat, then use your crescent kick within four seconds for extra damage and a refreshed Tiger Step.',
    hint:'F · Counter an incoming attack',ready:'Q · Riposte, then dash again'}
};

export function installIdentities(api){
  const {HEROES,HOOKS,CAST,ring,text,each,hit,rm,aimDir,nearest}=api;
  const gain=value=>{const g=api.G;g.identity.charge=Math.min(g.hero.identity.max,g.identity.charge+value)};
  const release=()=>{
    const g=api.G,s=g.identity,c=g.hero.identity.color;
    s.charge=0;s.releaseT=1.2;
    ring(g.p.x,g.p.y,110,c,.65);text(g.p.x,g.p.y-65,g.hero.identity.name.toUpperCase(),c,19);
  };
  HOOKS.newGame.push(g=>{
    g.identity={charge:0,lastSkill:0,window:0,releaseT:0,castT:0,castMax:.24,castSlot:0,castAngle:0,empowered:false,x:g.p.x,y:g.p.y};
  });
  HOOKS.hit.push((e,o)=>{
    if(o.origin!=='item'&&api.G.hero.id==='lan'&&e.slowT>0&&!o.dot)gain(8);
  });
  HOOKS.parry.push(()=>{
    if(api.G.hero.id!=='sari')return;
    gain(1);api.G.identity.window=4;
  });
  HOOKS.dmgMul.push(()=>api.G.identity.empowered&&api.G.hero.id==='sari'?1.5:1);
  HOOKS.update.push(dt=>{
    const g=api.G,s=g.identity,id=g.hero.id;
    s.castT=Math.max(0,s.castT-dt);s.releaseT=Math.max(0,s.releaseT-dt);
    if(id==='rempit'){
      // Ignore teleport distance; only actual movement input earns Redline.
      if(g.p.moving)gain(Math.min(Math.hypot(g.p.x-s.x,g.p.y-s.y),g.hero.speed*g.st.spd*dt)/6);
      else if(s.charge<100)s.charge=Math.max(0,s.charge-dt*8);
    }
    s.x=g.p.x;s.y=g.p.y;
    if(s.window>0){s.window=Math.max(0,s.window-dt);if(!s.window&&(id==='nok'||id==='sari')){s.charge=0;s.lastSkill=0}}
  });
  for(const [id,hero]of Object.entries(HEROES)){
    const identity=hero.identity||IDENTITIES[id];
    hero.identity=identity;
    CAST[id]=CAST[id].map((cast,i)=>r=>{
      const g=api.G,s=g.identity,ready=s.charge>=identity.max;
      const empowered=ready&&((id==='ustaz'&&i===3)||(id==='rempit'&&i===1)||(id==='lan'&&i===2)||(id==='sari'&&i===1));
      const target=i===0?nearest(g.p.x,g.p.y,520):null;
      const [ax,ay]=target?[target.x-g.p.x,target.y-g.p.y]:aimDir();
      const attackAngle=Math.atan2(ay,ax);
      s.empowered=empowered;
      let result;
      try{result=cast(r)}finally{s.empowered=false}
      if(result===false)return false;
      api.audio.play(id,i);
      if(i>0){
        const durations={ustaz:[0,.65,g.orbit?.t||6,.75,8],rempit:[0,.5,g.p.exhaust,.7,g.p.super],nok:[0,.6,.6,g.sea?.wai,1.5],lan:[0,.8,empowered?14:10,.75,g.sea?.show],sari:[0,.6,.7,g.sea?.stance,2.8]};
        const life=durations[id]?.[i]??skillPoses[id][i],skill=id+'-'+i;
        if(life>2)g.fx=g.fx.filter(f=>f.skill!==skill);
        const landing=id==='nok'&&i===4?g.sea.leap:null;
        g.fx.push({kind:'spell',skill,hero:id,slot:i,x:landing?landing.tx:g.p.x,y:landing?landing.ty:g.p.y,a:attackAngle,r:landing?(172+9*landing.r)*(landing.bl?1.3:1):i===4?150:85,c:identity.color,life,max:life});
      }
      // Basic auto-fire must not restart an active skill animation.
      if(i!==0||s.castT<=0||s.castSlot===0){
        s.castAngle=attackAngle;s.castSlot=i;s.castMax=skillPoses[id][i];s.castT=s.castMax;
      }
      if(id==='ustaz'&&i===0)gain(1);
      if(id==='nok'&&i>0&&i<4){
        s.charge=s.lastSkill===i?1:s.charge+1;s.lastSkill=i;s.window=6;
        if(s.charge>=3){
          release();s.lastSkill=0;s.window=0;
          each(g.p.x,g.p.y,165,e=>{hit(e,35*rm(r));if(!e.boss)e.stun=Math.max(e.stun,.8)});
          ring(g.p.x,g.p.y,165,identity.color,.5);
        }
      }
      if(empowered){
        release();
        if(id==='ustaz')g.zones.push({kind:'barrier',x:g.p.x,y:g.p.y,r:150,life:5,max:5,dps:12*rm(r),heal:10,acc:0});
        if(id==='rempit'){g.p.dash.t=.36;g.p.dash.dmg*=1.75;g.p.dash.fire=true}
        if(id==='lan'){
          const count=3+(r>=3?1:0)+(r>=5?1:0),troupe=g.sea.allies.slice(-count);
          for(const ally of troupe){ally.t=14;ally.dmg*=1.5}
          g.sea.allies.push(...troupe.slice(0,2).map((ally,k)=>({...ally,x:g.p.x+(k?32:-32),y:g.p.y,slot:ally.slot+Math.PI,tg:null})));
          if(g.sea.allies.length>10)g.sea.allies.splice(0,g.sea.allies.length-10);
        }
        if(id==='sari'){g.cds[2]=0;s.window=0}
      }
      for(const f of HOOKS.cast)f(i,r);
      return result;
    });
  }
}
