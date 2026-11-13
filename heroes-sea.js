// New heroes from Thailand, Vietnam and Indonesia (module)
// Nok (Muay Thai), Cô Lan (water puppetry), Sari (pencak silat).
// Loaded after the core script; plugs in through HEROES / CAST / AUTO / EVOS / HERO_DRAW / HOOKS only.
(function(){
'use strict';

/* ---------- Hero data ---------- */
HEROES.nok={id:'nok',name:'Nok',country:'Thailand',role:'Muay Thai bruiser · close range, tough',hp:130,speed:175,ultNeed:55,price:150,
  skills:[
    {key:'',name:'Jab-Cross',desc:'Auto punches in a short arc at the nearest ghost.',up:'More damage, longer reach.',cd:.55},
    {key:'Q',name:'Teep',desc:'Push kick down a line. Big knockback.',up:'+25% damage, longer kick.',cd:5},
    {key:'E',name:'Sok Klap',desc:'Spinning elbow that hits everything around her.',up:'+25% damage, wider spin.',cd:7},
    {key:'F',name:'Wai Khru',desc:'Ritual dance honouring her teachers: +30% damage, 30% less damage taken for 8 s.',up:'Blessing lasts longer.',cd:16},
    {key:'R',name:'Hanuman Leap',desc:'Ultimate: leap high, untouchable, then crush and stun a big area.',up:'+25% damage, bigger landing.',cd:0,ult:true}]};
HEROES.lan={id:'lan',name:'Cô Lan',country:'Vietnam',role:'Water puppeteer · summoner, slows',hp:100,speed:165,ultNeed:60,price:200,
  skills:[
    {key:'',name:'Puppet Strike',desc:'Auto-thrown puppet that flies out and returns, hitting both ways.',up:'More damage, flies farther. Second puppet at rank 4.',cd:.9},
    {key:'Q',name:'Dragon Lunge',desc:'A dragon puppet charges in a line, piercing and soaking ghosts.',up:'+25% damage, longer charge.',cd:7},
    {key:'E',name:'Little Guards',desc:'3 puppet guards chase and hit ghosts for 10 s.',up:'+25% damage. +1 guard at ranks 3 and 5.',cd:14},
    {key:'F',name:'Lake Splash',desc:'Wave of lake water: ghosts are 50% slower for 3 s.',up:'Bigger wave, more damage.',cd:9},
    {key:'R',name:'Grand Lake Show',desc:'Ultimate: for 8 s the whole troupe rains hits on ghosts across the screen.',up:'+25% damage, faster hits.',cd:0,ult:true}]};
HEROES.sari={id:'sari',name:'Sari',country:'Indonesia',role:'Pencak silat duelist · agile, counters',hp:115,speed:190,ultNeed:50,price:250,
  skills:[
    {key:'',name:'Kris Melayang',desc:'Auto-thrown kris that flies out and returns to her hand.',up:'More damage, flies farther.',cd:.75},
    {key:'Q',name:'Tendangan Sabit',desc:'Crescent kick in a wide arc.',up:'+25% damage, wider reach.',cd:4.5},
    {key:'E',name:'Langkah Harimau',desc:'Tiger-step dash. Afterimages explode 0.5 s later.',up:'+25% damage, bigger blasts.',cd:6},
    {key:'F',name:'Bunga Silat',desc:'Counter stance for 2.5 s: untouchable, ghosts that touch her are struck back.',up:'Longer stance, harder counter.',cd:12},
    {key:'R',name:'Sayap Garuda',desc:'Ultimate: garuda feathers slam ghosts all over the screen.',up:'+25% damage, +1 feather.',cd:0,ult:true}]};

EVOS.nok=[{i:0,item:'sambal',name:'Mae Mai Khao',d:'Every third strike is a knee: triple damage and a short stun.'},
          {i:1,item:'teh',name:'Teep Phayu',d:'Teep also sends a storm wave far down the line.'}];
EVOS.lan=[{i:0,item:'kemboja',name:'Phoenix Puppet',d:'The puppet bursts in a spin where it turns around.'},
          {i:1,item:'kopi',name:'Golden Dragon',d:'The dragon turns around and charges back for a second pass.'}];
EVOS.sari=[{i:0,item:'pelita',name:'Kris Pusaka',d:'Throw two heirloom kris in a fan.'},
           {i:2,item:'teh',name:'Raungan Harimau',d:'Afterimage blasts are 40% bigger and make ghosts flee.'}];

// These heroes are now real entries, so drop their placeholder "locked" cards from the menu.
if(typeof LOCKED!=='undefined')for(let i=LOCKED.length-1;i>=0;i--)if(['Nok','Cô Lan','Sari'].includes(LOCKED[i].name))LOCKED.splice(i,1);

/* ---------- Module state ---------- */
const fresh=()=>({wai:0,waiMax:8,leap:null,punchN:0,punchT:0,punchA:0,spinT:0,
  allies:[],show:0,showAcc:0,showDmg:0,showGap:.16,
  stance:0,stanceMax:2.5,ctrFn:null,images:[],dashImg:0,dashAcc:0,dashDmg:0,dashR:70,dashFear:false,garuda:null,kickT:0,
  strikes:[],fx:[]});
let S=fresh();
HOOKS.newGame.push(g=>{S=fresh();g.sea=S});

const sfx=o=>{o.max=o.life;S.fx.push(o)};
const norm=(dx,dy)=>{const l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]};
function onScreen(){const p=G.p,hw=W/(2*SC)-24,hh=H/(2*SC)-24,out=[];
  for(const e of G.enemies){if(e.dead||e.type==='body'&&!e.near)continue;if(Math.abs(e.x-p.x)<hw&&Math.abs(e.y-p.y)<hh)out.push(e)}return out}
function cluster(range){ // ghost with the most neighbours near the player (leap target)
  const p=G.p,c=[];for(const e of G.enemies){if(e.dead||e.type==='body')continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<range)c.push(e)}
  let best=null,bn=-1;for(let i=0;i<c.length&&i<40;i++){const a=c[i];let n=a.boss?6:0;for(const b of c)if(Math.abs(a.x-b.x)<130&&Math.abs(a.y-b.y)<130)n++;if(n>bn){bn=n;best=a}}
  return best}

/* Boomerang projectile shared by Lan's puppet and Sari's kris */
function boomerang(a,o){
  const p=G.p,spd=o.spd,pr={x:p.x,y:p.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,ax:Math.cos(a),ay:Math.sin(a),r:o.r,dmg:o.dmg,life:4,pierce:9999,hit:new Set(),
    out:o.out,outMax:o.out,back:false,spin:0,trail:o.trail,
    update(q,dt){
      if(!q.back){q.out-=dt;const k=Math.max(.12,q.out/q.outMax);q.vx=q.ax*spd*k*1.6;q.vy=q.ay*spd*k*1.6;
        if(q.out<=0){q.back=true;q.hit.clear();if(o.onTurn)o.onTurn(q)}}
      else{const dx=G.p.x-q.x,dy=G.p.y-q.y,d=Math.hypot(dx,dy)||1;q.bs=Math.min(spd*1.5,(q.bs||spd*.3)+spd*4*dt);q.vx=dx/d*q.bs;q.vy=dy/d*q.bs;if(d<G.p.r+12)q.life=0}
      if(q.trail&&Math.random()<.5)G.fx.push({x:q.x,y:q.y,vx:0,vy:0,life:.22,max:.22,c:q.trail,size:4})},
    draw:o.draw};
  G.projs.push(pr);return pr}

/* Falling strikes shared by Grand Lake Show and Sayap Garuda */
function strike(e,x,y,o){S.strikes.push({e,x,y,t:o.t||.26,t0:o.t||.26,r:o.r,dmg:o.dmg,kind:o.kind,slow:o.slow||0,seed:Math.random()})}

/* ---------- Casts ---------- */
CAST.nok=[
  r=>{if(S.leap)return false;const p=G.p,reach=84+5*r,t=nearest(p.x,p.y,reach+14);if(!t)return false;
    const a=Math.atan2(t.y-p.y,t.x-p.x),ax=Math.cos(a),ay=Math.sin(a);S.punchN++;
    const knee=G.evo[0]&&S.punchN%3===0,cross=!knee&&S.punchN%2===0,mul=knee?3:cross?1.35:1,kb=knee?260:cross?170:60;
    each(p.x,p.y,reach,(e,dx,dy)=>{let d=Math.atan2(dy,dx)-a;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<.85){hit(e,15*rm(r)*mul,{kb:[ax*kb,ay*kb]});if(knee&&!e.boss)e.stun=Math.max(e.stun,.5)}});
    S.punchT=.14;S.punchA=a;sfx({kind:'arc',x:p.x,y:p.y,a,half:.85,r:reach,life:knee?.2:.13,c:knee?'#ffd34d':cross?'#ff6b5a':'#ffe9d6',w:knee?9:cross?7:5});
    if(knee){text(p.x+ax*40,p.y+ay*40-10,'KHAO!','#ffd34d',15);juice(5,.03)}else if(cross)juice(2)},
  r=>{const p=G.p,[ax,ay]=aimDir(),len=215+12*r,w=30;let n=0;
    for(const e of G.enemies){if(e.dead)continue;const dx=e.x-p.x,dy=e.y-p.y,t=dx*ax+dy*ay;if(t<-e.r||t>len+e.r||Math.abs(dx*ay-dy*ax)>w+e.r)continue;n++;hit(e,32*rm(r),{kb:[ax*640,ay*640]})}
    sfx({kind:'line',x:p.x,y:p.y,a:Math.atan2(ay,ax),len,w,life:.22,c:'#ffb38a'});S.punchT=.2;S.punchA=Math.atan2(ay,ax);p.sq=.8;
    if(G.evo[1])G.projs.push({x:p.x+ax*40,y:p.y+ay*40,vx:ax*620,vy:ay*620,r:26,dmg:20*rm(r),life:.75,pierce:9999,hit:new Set(),a:Math.atan2(ay,ax),
      onHit:(q,e)=>{if(!e.boss&&e.type!=='body'){e.kvx+=ax*260;e.kvy+=ay*260}},
      draw:q=>{ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.a);ctx.globalAlpha=Math.min(1,q.life*3);ctx.strokeStyle='#ffd9a8';ctx.lineWidth=5;ctx.beginPath();ctx.arc(-18,0,30,-.9,.9);ctx.stroke();ctx.strokeStyle='rgba(255,217,168,.4)';ctx.beginPath();ctx.arc(-34,0,30,-.7,.7);ctx.stroke();ctx.restore()}});
    juice(n?7:3,n?.05:0);text(p.x+ax*46,p.y+ay*46-12,'TEEP!','#ffb38a',15)},
  r=>{const p=G.p,bl=S.wai>0,R=(96+7*r)*(bl?1.4:1),dmg=30*rm(r)*(bl?1.5:1);if(bl)combo("Khru's Blessing");
    each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,dmg,{kb:[nx*230,ny*230]});if(bl&&!e.boss)e.stun=Math.max(e.stun,.7)});
    S.spinT=.28;sfx({kind:'spin',x:p.x,y:p.y,r:R,life:.28,c:bl?'#ffd34d':'#ff8a6b'});ring(p.x,p.y,R,bl?'#ffd34d':'#ff8a6b',.3);juice(bl?10:7,.05)},
  r=>{const p=G.p;S.waiMax=S.wai=8+.75*(r-1);ring(p.x,p.y,70,'#ffd34d',.6);ring(p.x,p.y,110,'#fff3b0',.8);
    for(let k=0;k<10;k++){const a=k/10*TAU;G.fx.push({x:p.x+Math.cos(a)*26,y:p.y+Math.sin(a)*26,vx:Math.cos(a)*20,vy:-50,life:.8,max:.8,c:'rgba(255,221,120,.8)',size:4})}
    text(p.x,p.y-40,'Wai Khru','#ffe9a8',17);p.sq=.6},
  r=>{const p=G.p,bl=S.wai>0;let tx,ty;
    const c=G.autoAim?cluster(330):null;
    if(c){tx=c.x;ty=c.y}else{const[ax,ay]=aimDir();tx=p.x+ax*230;ty=p.y+ay*230}
    if(bl)combo("Hanuman's Blessing");
    S.leap={t:0,dur:.45,sx:p.x,sy:p.y,tx,ty,r,bl};p.dash=null;p.vx=p.vy=0;
    puff(p.x,p.y,'#d8c9a8',12,140,4);ring(p.x,p.y,50,'#ffd34d',.3);juice(6);banner('Hanuman Leap!',1.5)},
];

CAST.lan=[
  r=>{const p=G.p,t=nearest(p.x,p.y,430);if(!t)return false;const base=Math.atan2(t.y-p.y,t.x-p.x),n=r>=4?2:1;
    for(let k=0;k<n;k++)boomerang(base+(k-(n-1)/2)*.45,{spd:400,out:.42+.02*r,r:11,dmg:9*rm(r),trail:'rgba(120,200,255,.5)',draw:drawPuppetProj,
      onTurn:G.evo[0]?q=>{each(q.x,q.y,74,e=>hit(e,13*rm(r)));ring(q.x,q.y,74,'#ffb347',.3);puff(q.x,q.y,'#ffcf70',8,150,3);juice(3)}:null})},
  r=>{const p=G.p,[ax,ay]=aimDir(),life=.62+.03*r,evo=!!G.evo[1];
    G.projs.push({x:p.x+ax*10,y:p.y+ay*10,vx:ax*540,vy:ay*540,r:26,dmg:36*rm(r),life,life0:life,pierce:9999,hit:new Set(),tidal:false,evo,ret:false,ph:0,
      dmgFor:e=>e.slowT>0?2:1,
      onHit:(q,e)=>{if(e.slowT>0&&!q.tidal){q.tidal=true;combo('Tidal Dragon')}e.slowT=Math.max(e.slowT||0,1.5);puff(e.x,e.y,'#8fd6ff',5,130,3);juice(3)},
      update:(q,dt)=>{q.ph+=dt*16;if(Math.random()<.7)G.fx.push({x:q.x+rand(-14,14),y:q.y+rand(-14,14),vx:rand(-40,40),vy:rand(-40,40),life:.35,max:.35,c:'rgba(143,214,255,.6)',size:5});
        if(q.evo&&!q.ret&&q.life<.05){q.ret=true;q.vx=-q.vx;q.vy=-q.vy;q.life=q.life0;q.hit.clear();q.tidal=false;ring(q.x,q.y,50,'#ffd34d',.3)}},
      draw:drawDragon});
    ring(p.x,p.y,40,'#8fd6ff',.3);juice(6,.04);p.sq=.7},
  r=>{const p=G.p,n=3+(r>=3?1:0)+(r>=5?1:0),full=S.show>0;if(full)combo('Full Troupe');
    for(let k=0;k<n;k++){const a=k/n*TAU+G.t,ax=p.x+Math.cos(a)*34,ay=p.y+Math.sin(a)*34;
      S.allies.push({x:ax,y:ay,t:10,dmg:11*rm(r)*(full?1.5:1),cd:rand(0,.3),slot:a,tg:null,bop:0,hue:k%3,full});
      puff(ax,ay,'#8fd6ff',6,90,3)}
    if(S.allies.length>10)S.allies.splice(0,S.allies.length-10);
    ring(p.x,p.y,60,'#8fd6ff',.4);juice(4)},
  r=>{const p=G.p,R=205+13*r;each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,14*rm(r),{kb:[nx*170,ny*170]});e.slowT=Math.max(e.slowT||0,3)});
    sfx({kind:'wave',x:p.x,y:p.y,r:R,life:.5});ring(p.x,p.y,R,'#8fd6ff',.5);ring(p.x,p.y,R*.6,'#d6f1ff',.4);
    for(let k=0;k<16;k++){const a=k/16*TAU;G.fx.push({x:p.x+Math.cos(a)*30,y:p.y+Math.sin(a)*30,vx:Math.cos(a)*R*1.6,vy:Math.sin(a)*R*1.6,life:.45,max:.45,c:'rgba(143,214,255,.7)',size:5})}
    juice(8,.05)},
  r=>{S.show=8;S.showAcc=0;S.showDmg=24*rm(r);S.showGap=Math.max(.1,.17-.012*(r-1));
    if(S.allies.length){combo('Full Troupe');for(const a of S.allies){a.t=Math.max(a.t,8);if(!a.full){a.full=true;a.dmg*=1.5}}}
    ring(G.p.x,G.p.y,240,'#8fd6ff',.7);juice(12,.1);banner('Grand Lake Show!',1.5)},
];

CAST.sari=[
  r=>{const p=G.p,t=nearest(p.x,p.y,400);if(!t)return false;const base=Math.atan2(t.y-p.y,t.x-p.x),n=G.evo[0]?2:1;
    for(let k=0;k<n;k++)boomerang(base+(k-(n-1)/2)*.5,{spd:470,out:.34+.02*r,r:9,dmg:10*rm(r)*(G.evo[0]?1.15:1),trail:G.evo[0]?'rgba(255,211,77,.5)':'rgba(220,230,240,.4)',draw:drawKrisProj})},
  r=>{const p=G.p,[ax,ay]=aimDir(),a=Math.atan2(ay,ax),st=S.stance>0,R=(122+8*r)*(st?1.15:1),half=st?Math.PI:1.15,dmg=30*rm(r)*(st?2:1);
    if(st)combo('Bunga Sabit');
    each(p.x,p.y,R,(e,dx,dy)=>{let d=Math.atan2(dy,dx)-a;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<=half){const[nx,ny]=norm(dx,dy);hit(e,dmg,{kb:[nx*280,ny*280]})}});
    S.kickT=.22;sfx({kind:st?'spin':'arc',x:p.x,y:p.y,a,half,r:R,life:.22,c:st?'#ffd34d':'#ff9b3d',w:12});if(st)ring(p.x,p.y,R,'#ffd34d',.3);
    p.sq=.7;juice(st?10:6,.05)},
  r=>{const p=G.p,[ax,ay]=aimDir(),evo=!!G.evo[2];
    p.dash={t:.2,vx:ax*1050,vy:ay*1050,hit:new Set(),dmg:20*rm(r),fire:false};p.invuln=Math.max(p.invuln,.4);
    S.dashImg=4;S.dashAcc=0;S.dashDmg=26*rm(r);S.dashR=(66+5*r)*(evo?1.4:1);S.dashFear=evo;
    puff(p.x,p.y,'#ffb347',10,130,4);text(p.x,p.y-34,'Harimau!','#ffb347',14);juice(5)},
  r=>{const p=G.p;S.stanceMax=S.stance=2.5+.25*(r-1);const dmg=40*rm(r);
    S.ctrFn=e=>{if(G.t<(e.hits.ctr||0))return;e.hits.ctr=G.t+.45;const[nx,ny]=norm(e.x-p.x,e.y-p.y);hit(e,dmg,{kb:[nx*400,ny*400]});if(!e.boss)e.stun=Math.max(e.stun,.5);
      sfx({kind:'arc',x:p.x,y:p.y,a:Math.atan2(ny,nx),half:.6,r:44,life:.14,c:'#ffe9a8',w:6});puff(e.x,e.y,'#ffd34d',5,120,3);juice(4,.03)};
    p.onContact=S.ctrFn;G.cds[1]=Math.min(G.cds[1],.25); // the stance readies her kick
    ring(p.x,p.y,56,'#ff8fb0',.5);text(p.x,p.y-40,'Bunga Silat','#ffc2d4',16);p.sq=.5},
  r=>{const n=12+(r-1);S.garuda={n,gap:2.4/n,acc:0,dmg:70*rm(r)};ring(G.p.x,G.p.y,220,'#ffd34d',.6);juice(12,.1);banner('Sayap Garuda!',1.5)},
];

/* ---------- Auto-cast ---------- */
const bossUp=()=>G.boss&&!G.boss.dead||G.raidBoss&&!G.raidBoss.dead;
AUTO.nok={order:[3,2,1,4],when:[null,n=>n(215)>=1&&!S.leap,n=>!S.leap&&(n(118)>=3||S.wai>0&&n(130)>=2),n=>n(260)>=5||bossUp()&&n(260)>=1,n=>!S.leap&&(n(320)>=12||bossUp()&&n(320)>=1)]};
AUTO.lan={order:[3,1,2,4],when:[null,n=>n(300)>=2,n=>n(330)>=3,n=>n(190+13*G.ranks[3])>=3,n=>n(360)>=12||bossUp()&&n(400)>=1]};
AUTO.sari={order:[3,1,2,4],when:[null,n=>n(135)>=2||S.stance>0&&n(150)>=1,n=>n(260)>=4&&!G.p.dash,n=>n(85)>=2||bossUp()&&n(80)>=1,n=>n(320)>=12||bossUp()&&n(400)>=1]};

/* ---------- Hooks ---------- */
HOOKS.dmgMul.push(()=>S.wai>0?1.3:1);
HOOKS.hurt.push(a=>{
  if(S.leap)return false;
  if(S.stance>0){if(Math.random()<.5)text(G.p.x,G.p.y-30,'parry!','#ffc2d4',12);return false}
  if(S.wai>0)return a*.7;
});

HOOKS.update.push(dt=>{
  if(!G||G.sea!==S)return;const p=G.p;
  if(S.punchT>0)S.punchT-=dt;if(S.spinT>0)S.spinT-=dt;if(S.kickT>0)S.kickT-=dt;
  for(const f of S.fx)f.life-=dt;if(S.fx.length)S.fx=S.fx.filter(f=>f.life>0);

  // Nok
  if(S.wai>0){S.wai-=dt;if(Math.random()<dt*10)G.fx.push({x:p.x+rand(-16,16),y:p.y+10,vx:0,vy:-45,life:.6,max:.6,c:'rgba(255,221,120,.6)',size:3})}
  if(S.leap){const L=S.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur),s=k*k*(3-2*k);
    p.x=L.sx+(L.tx-L.sx)*s;p.y=L.sy+(L.ty-L.sy)*s;p.vx=p.vy=0;p.dash=null;
    if(k>=1){S.leap=null;const R=(172+9*L.r)*(L.bl?1.3:1),dmg=90*rm(L.r)*(L.bl?1.5:1);
      each(p.x,p.y,R,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,dmg,{kb:[nx*320,ny*320]});if(!e.boss)e.stun=Math.max(e.stun,1.5+.2*(L.r-1)+(L.bl?.5:0))});
      ring(p.x,p.y,R,'#ffd34d',.5);ring(p.x,p.y,R*.6,'#fff3b0',.35);sfx({kind:'crack',x:p.x,y:p.y,r:R,life:.9,seed:Math.random()*9});
      puff(p.x,p.y,'#d8c9a8',22,260,5);p.sq=1;p.invuln=Math.max(p.invuln,.3);juice(18,.14)}}

  // Lan: guards
  if(S.allies.length){
    for(const a of S.allies){a.t-=dt;a.cd-=dt;if(a.bop>0)a.bop-=dt*5;
      if(a.tg&&(a.tg.dead||Math.hypot(a.tg.x-p.x,a.tg.y-p.y)>440))a.tg=null;
      if(!a.tg){const skip=new Set();for(const b of S.allies)if(b!==a&&b.tg)skip.add(b.tg);
        let t=nearest(a.x,a.y,340,skip)||nearest(a.x,a.y,340);if(t&&Math.hypot(t.x-p.x,t.y-p.y)>440)t=null;a.tg=t}
      let gx,gy,stop=6;
      if(a.tg){gx=a.tg.x;gy=a.tg.y;stop=a.tg.r+12}else{const q=a.slot+G.t*.8;gx=p.x+Math.cos(q)*48;gy=p.y+Math.sin(q)*48}
      const dx=gx-a.x,dy=gy-a.y,d=Math.hypot(dx,dy)||1;
      if(d>stop){const v=Math.min(270,d*8);a.x+=dx/d*v*dt;a.y+=dy/d*v*dt;a.fx=dx<0?-1:1}
      if(a.tg&&d<=stop+6&&a.cd<=0){a.cd=.45;a.bop=1;hit(a.tg,a.dmg,{kb:[dx/d*90,dy/d*90]});puff(a.tg.x,a.tg.y,'#8fd6ff',3,80,2)}
      if(a.t<=0)puff(a.x,a.y,'#8fd6ff',6,90,3)}
    S.allies=S.allies.filter(a=>a.t>0)}
  // Lan: Grand Lake Show
  if(S.show>0){S.show-=dt;S.showAcc+=dt;
    while(S.showAcc>=S.showGap){S.showAcc-=S.showGap;const c=onScreen();if(!c.length)break;
      const e=G.boss&&!G.boss.dead&&c.includes(G.boss)&&Math.random()<.2?G.boss:c[Math.random()*c.length|0];
      strike(e,e.x,e.y,{r:40,dmg:S.showDmg,kind:'puppet',slow:1.2})}}

  // Sari
  if(S.dashImg>0){
    if(p.dash){S.dashAcc-=dt;if(S.dashAcc<=0){S.dashAcc=.05;S.dashImg--;S.images.push({x:p.x,y:p.y,t:.5,dmg:S.dashDmg,r:S.dashR,fear:S.dashFear})}}
    else{S.images.push({x:p.x,y:p.y,t:.5,dmg:S.dashDmg,r:S.dashR,fear:S.dashFear});S.dashImg=0}}
  if(S.images.length){for(const m of S.images){m.t-=dt;if(m.t<=0){each(m.x,m.y,m.r,(e,dx,dy)=>{const[nx,ny]=norm(dx,dy);hit(e,m.dmg,{kb:[nx*160,ny*160]});if(m.fear&&!e.boss)e.fear=Math.max(e.fear,1.2)});
      ring(m.x,m.y,m.r,'#ffb347',.3);puff(m.x,m.y,'#ffb347',8,170,4);juice(5,.02)}}
    S.images=S.images.filter(m=>m.t>0)}
  if(S.stance>0){S.stance-=dt;if(!p.onContact)p.onContact=S.ctrFn;
    if(S.stance<=0){if(p.onContact===S.ctrFn)p.onContact=null;ring(p.x,p.y,40,'#ff8fb0',.3)}}
  else if(S.ctrFn&&p.onContact===S.ctrFn)p.onContact=null;
  if(S.garuda){const g=S.garuda;g.acc+=dt;
    while(g.n>0&&g.acc>=g.gap){g.acc-=g.gap;g.n--;const c=onScreen();
      if(c.length){const e=G.boss&&!G.boss.dead&&c.includes(G.boss)&&Math.random()<.3?G.boss:c[Math.random()*c.length|0];strike(e,e.x,e.y,{r:66,dmg:g.dmg,kind:'feather',t:.3})}
      else strike(null,p.x+rand(-220,220),p.y+rand(-160,160),{r:66,dmg:g.dmg,kind:'feather',t:.3})}
    if(g.n<=0)S.garuda=null}

  // falling strikes
  if(S.strikes.length){for(const s of S.strikes){if(s.e&&!s.e.dead){s.x=s.e.x;s.y=s.e.y}s.t-=dt;
      if(s.t<=0){each(s.x,s.y,s.r,e=>{hit(e,s.dmg);if(s.slow)e.slowT=Math.max(e.slowT||0,s.slow)});
        if(s.kind==='feather'){ring(s.x,s.y,s.r,'#ffd34d',.3);puff(s.x,s.y,'#ffd34d',8,190,4);sfx({kind:'burst',x:s.x,y:s.y,r:s.r,life:.25});juice(8,.03)}
        else{ring(s.x,s.y,s.r,'#8fd6ff',.28);puff(s.x,s.y,'#8fd6ff',5,140,3);juice(3)}}}
    S.strikes=S.strikes.filter(s=>s.t>0)}
});

/* ---------- Drawing ---------- */
function drawPuppetProj(q){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.spin*.6);puppetShape(1.05,0);ctx.restore()}
function puppetShape(k,hue){ // small lacquered wooden puppet, centred on 0,0
  const robe=['#d63a3a','#2f9e6b','#e0a030'][hue||0];
  ctx.fillStyle=robe;rr(-6*k,-3*k,12*k,12*k,3*k);ctx.fill();
  ctx.fillStyle='#ffd34d';ctx.fillRect(-6*k,1*k,12*k,2.2*k);
  ctx.strokeStyle=robe;ctx.lineWidth=3*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6*k,0);ctx.lineTo(-11*k,-4*k);ctx.moveTo(6*k,0);ctx.lineTo(11*k,-4*k);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle='#f0cfa0';ctx.beginPath();ctx.arc(0,-8*k,5.5*k,0,TAU);ctx.fill();
  ctx.fillStyle='#1a1210';ctx.beginPath();ctx.arc(0,-9.5*k,5.5*k,Math.PI,TAU);ctx.fill();ctx.beginPath();ctx.arc(-4*k,-14*k,2.2*k,0,TAU);ctx.arc(4*k,-14*k,2.2*k,0,TAU);ctx.fill();
  ctx.fillStyle='#1a1210';ctx.fillRect(-2.6*k,-8*k,1.5*k,1.5*k);ctx.fillRect(1.2*k,-8*k,1.5*k,1.5*k);
  ctx.fillStyle='#d63a3a';ctx.fillRect(-1.5*k,-5.4*k,3*k,1.2*k)}
function drawDragon(q){
  const a=Math.atan2(q.vy,q.vx);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(a);ctx.globalAlpha=Math.min(1,q.life*6);
  ctx.fillStyle='rgba(143,214,255,.22)';ctx.beginPath();ctx.ellipse(-40,0,74,30,0,0,TAU);ctx.fill();
  for(let k=6;k>=1;k--){const bx=-k*17,by=Math.sin(q.ph-k*.9)*9,rad=15-k*1.5;
    ctx.fillStyle=k%2?'#e0a030':'#c8102e';ctx.beginPath();ctx.arc(bx,by,rad,0,TAU);ctx.fill();
    ctx.fillStyle='#2f9e6b';ctx.beginPath();ctx.moveTo(bx-5,by-rad+2);ctx.lineTo(bx,by-rad-7);ctx.lineTo(bx+5,by-rad+2);ctx.fill()}
  ctx.fillStyle='#e0a030';ctx.beginPath();ctx.ellipse(4,0,20,15,0,0,TAU);ctx.fill();
  ctx.fillStyle='#c8102e';ctx.beginPath();ctx.ellipse(18,0,11,9,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#2f9e6b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-2,-12);ctx.lineTo(-14,-24);ctx.moveTo(-2,12);ctx.lineTo(-14,24);ctx.stroke();
  ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(24,-5);ctx.quadraticCurveTo(38,-16,30,-24);ctx.moveTo(24,5);ctx.quadraticCurveTo(38,16,30,24);ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(8,-7,4,0,TAU);ctx.arc(8,7,4,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(9.5,-7,1.8,0,TAU);ctx.arc(9.5,7,1.8,0,TAU);ctx.fill();
  ctx.restore()}
function krisShape(len){ // wavy blade pointing along +x from 0,0
  ctx.fillStyle='#6b4423';rr(-7,-2.5,8,5,2);ctx.fill();ctx.fillStyle='#e0b04a';ctx.fillRect(0,-4,2.5,8);
  ctx.beginPath();ctx.moveTo(2.5,-3);const n=5;for(let i=1;i<=n;i++){const t=i/n;ctx.lineTo(2.5+len*t,-3*(1-t)+(i%2?-2.2:1.2)*(1-t))}
  for(let i=n-1;i>=0;i--){const t=i/n;ctx.lineTo(2.5+len*t,3*(1-t)+(i%2?-1.2:2.2)*(1-t))}ctx.closePath();
  ctx.fillStyle='#dfe5ea';ctx.fill();ctx.strokeStyle='#8a97a3';ctx.lineWidth=.8;ctx.stroke()}
function drawKrisProj(q){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.spin);ctx.translate(-9,0);krisShape(22);ctx.restore()}

HERO_DRAW.nok=(x,y,p)=>{
  const f=p.face[0]<0?-1:1,hurt=p.hurt>0,skin=hurt?'#ffb3a3':'#c98f5f';let air=0;
  if(S.wai>0){const a=Math.min(1,S.wai);ctx.fillStyle=`rgba(255,211,77,${.14*a})`;ctx.beginPath();ctx.arc(x,y,32,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(255,221,120,${.7*a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+14,24,9,0,0,TAU);ctx.stroke()}
  if(S.leap){const k=Math.min(1,S.leap.t/S.leap.dur);air=Math.sin(Math.PI*k);
    ctx.fillStyle='rgba(255,211,77,.18)';ctx.beginPath();ctx.ellipse(S.leap.tx,S.leap.ty+15,60*k+10,22*k+4,0,0,TAU);ctx.fill()}
  ctx.save();ctx.translate(x,y-air*96);if(air){const s=1+air*.3;ctx.scale(s,s);ctx.rotate(f*air*.55)}
  if(S.spinT>0)ctx.scale(Math.cos((1-S.spinT/.28)*TAU),1);
  // legs (flying knee when airborne)
  ctx.fillStyle=skin;if(air>.15){rr(f*2-3,6,6,9,3);ctx.fill();rr(-f*8-3,8,6,10,3);ctx.fill()}else{rr(-8,9,6,8,3);ctx.fill();rr(2,9,6,8,3);ctx.fill()}
  // shorts with gold waistband
  ctx.fillStyle=hurt?'#ff8a8a':'#c8102e';rr(-11,2,22,11,4);ctx.fill();ctx.fillStyle='#ffd34d';ctx.fillRect(-11,2,22,3);ctx.fillStyle='#1d3f8f';ctx.fillRect(-11,10,22,2);
  // top
  ctx.fillStyle='#1d3f8f';rr(-10,-8,20,11,5);ctx.fill();
  // ponytail + head
  ctx.strokeStyle='#1a1210';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-f*6,-17);ctx.quadraticCurveTo(-f*15,-15,-f*13,-6);ctx.stroke();
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-13,8,0,TAU);ctx.fill();
  ctx.fillStyle='#1a1210';ctx.beginPath();ctx.arc(0,-14.5,8,Math.PI*1.05,Math.PI*1.95);ctx.fill();
  // mongkol (red headband with tail)
  ctx.strokeStyle='#e02d3c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-17,8.5,3,0,0,TAU);ctx.stroke();
  ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-f*8,-17);ctx.lineTo(-f*14,-21);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle='#1a1210';ctx.fillRect(f*2-3.5,-13,2,2.4);ctx.fillRect(f*2+1.5,-13,2,2.4);
  // gloves: guard up, lead hand extends on a punch
  const ext=S.punchT>0?Math.sin(Math.min(1,S.punchT/.14)*Math.PI*.9)*20:0,pa=S.punchA;
  ctx.fillStyle='#e02d3c';ctx.strokeStyle='#8f1420';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(-f*9,-2,5.5,0,TAU);ctx.fill();ctx.stroke();
  const gx=f*10+(air?0:Math.cos(pa)*ext),gy=-3+(air?0:Math.sin(pa)*ext);
  if(ext>4&&!air){ctx.strokeStyle=skin;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(f*8,-3);ctx.lineTo(gx,gy);ctx.stroke();ctx.strokeStyle='#8f1420';ctx.lineWidth=1.5}
  ctx.beginPath();ctx.arc(gx,gy,6,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(gx-1.5,gy-2,1.6,0,TAU);ctx.fill();
  ctx.restore();
};

HERO_DRAW.lan=(x,y,p)=>{
  const f=p.face[0]<0?-1:1,hurt=p.hurt>0,sway=Math.sin(G.t*(p.moving?10:2.5))*1.5;
  if(S.show>0){ctx.fillStyle='rgba(143,214,255,.14)';ctx.beginPath();ctx.ellipse(x,y+14,34+Math.sin(G.t*6)*3,13,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(143,214,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+14,26+(G.t*30%14),10,0,0,TAU);ctx.stroke()}
  ctx.save();ctx.translate(x,y);
  // white trousers
  ctx.fillStyle='#f2f2ee';rr(-7,10,6,8,2);ctx.fill();rr(1,10,6,8,2);ctx.fill();
  // long hair behind
  ctx.fillStyle='#17110f';rr(-8,-16,16,20,6);ctx.fill();
  // áo dài: fitted top, long split panels that sway
  ctx.fillStyle=hurt?'#ffb3b3':'#2f7fd1';ctx.beginPath();ctx.moveTo(-8,-7);ctx.lineTo(8,-7);ctx.lineTo(10,3);ctx.lineTo(12+sway,15);ctx.lineTo(1,15);ctx.lineTo(0,6);ctx.lineTo(-1,15);ctx.lineTo(-12+sway,15);ctx.lineTo(-10,3);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8fc4f5';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-3,-7);ctx.lineTo(f*5,-1);ctx.stroke();
  // sleeves and the bamboo control rod
  ctx.strokeStyle=hurt?'#ffb3b3':'#2f7fd1';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-f*8,-4);ctx.lineTo(-f*11,4);ctx.moveTo(f*8,-4);ctx.lineTo(f*13,1);ctx.stroke();
  ctx.strokeStyle='#c9a35a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f*11,3);ctx.lineTo(f*24,-7+sway*.5);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle='#f0cfa0';ctx.beginPath();ctx.arc(f*13,1.5,2.6,0,TAU);ctx.fill();
  // face
  ctx.fillStyle='#f0cfa0';ctx.beginPath();ctx.arc(0,-12,7.5,0,TAU);ctx.fill();
  ctx.fillStyle='#17110f';ctx.fillRect(f*2-3.5,-11.5,2,2.2);ctx.fillRect(f*2+1.5,-11.5,2,2.2);
  // nón lá
  ctx.strokeStyle='#d6456a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-8,-15);ctx.quadraticCurveTo(0,-2,8,-15);ctx.stroke();
  ctx.fillStyle='#e9d8a6';ctx.beginPath();ctx.moveTo(-17,-14);ctx.lineTo(0,-29);ctx.lineTo(17,-14);ctx.quadraticCurveTo(0,-9,-17,-14);ctx.fill();
  ctx.strokeStyle='#c2a96c';ctx.lineWidth=1;ctx.beginPath();for(const t of[-11,-5,0,5,11]){ctx.moveTo(0,-29);ctx.lineTo(t,-12.5+Math.abs(t)*.07)}ctx.stroke();
  ctx.beginPath();ctx.moveTo(-9,-21);ctx.quadraticCurveTo(0,-18.5,9,-21);ctx.stroke();
  ctx.restore();
};

HERO_DRAW.sari=(x,y,p)=>{
  const f=p.face[0]<0?-1:1,hurt=p.hurt>0,st=S.stance>0;
  if(st){const a=Math.min(1,S.stance*2);ctx.save();ctx.translate(x,y+2);ctx.rotate(G.t*2.4);ctx.globalAlpha=.8*a;
    for(let k=0;k<6;k++){ctx.rotate(TAU/6);ctx.fillStyle=k%2?'#ff8fb0':'#ffd9e3';ctx.beginPath();ctx.ellipse(0,-27,6,11,0,0,TAU);ctx.fill()}
    ctx.restore();ctx.fillStyle=`rgba(255,143,176,${.12*a})`;ctx.beginPath();ctx.arc(x,y,30,0,TAU);ctx.fill()}
  ctx.save();ctx.translate(x,y);if(S.kickT>0)ctx.rotate(f*Math.sin((1-S.kickT/.22)*Math.PI)*.5);
  // legs: low silat stance, kicking leg sweeps out
  ctx.fillStyle='#1b1b22';
  if(S.kickT>0){rr(-f*8-3,9,6,9,3);ctx.fill();ctx.save();ctx.translate(f*4,9);ctx.rotate(-f*1.1);rr(-3,0,6,17,3);ctx.fill();ctx.restore()}
  else{rr(-10,9,6,9,3);ctx.fill();rr(4,9,6,9,3);ctx.fill()}
  // black tunic
  ctx.fillStyle=hurt?'#ff9a9a':'#22222b';rr(-10,-8,20,18,6);ctx.fill();
  // batik sarong sash at the waist
  ctx.fillStyle='#7a4a21';rr(-11,3,22,8,2);ctx.fill();ctx.fillStyle='#e0b04a';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(-8+k*4,5.5+(k%2)*3,1.1,0,TAU);ctx.fill()}
  ctx.fillStyle='#c8102e';ctx.fillRect(-11,2,22,2);ctx.fillRect(-f*10-1.5,3,3,10);
  // hair bun + head
  ctx.fillStyle='#17110f';ctx.beginPath();ctx.arc(-f*6,-17,5,0,TAU);ctx.fill();
  ctx.fillStyle=hurt?'#ffc0a8':'#c99468';ctx.beginPath();ctx.arc(0,-13,8,0,TAU);ctx.fill();
  ctx.fillStyle='#17110f';ctx.beginPath();ctx.arc(0,-14,8,Math.PI*1.02,Math.PI*1.98);ctx.fill();
  // batik headcloth with side knot
  ctx.fillStyle='#8a5527';rr(-8.8,-20,17.6,6,2.5);ctx.fill();
  ctx.beginPath();ctx.moveTo(-f*8,-19);ctx.lineTo(-f*15,-23);ctx.lineTo(-f*13,-15);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e0b04a';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(-6+k*4,-17,1.1,0,TAU);ctx.fill()}
  ctx.fillStyle='#17110f';ctx.fillRect(f*2-3.5,-12.5,2,2.4);ctx.fillRect(f*2+1.5,-12.5,2,2.4);
  // arms: open guard hand, kris held forward
  ctx.strokeStyle='#22222b';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-f*8,-4);ctx.lineTo(-f*13,st?-10:1);ctx.moveTo(f*8,-4);ctx.lineTo(f*13,-1);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle='#c99468';ctx.beginPath();ctx.arc(-f*13,st?-11:2,2.8,0,TAU);ctx.arc(f*13,-1,2.8,0,TAU);ctx.fill();
  ctx.save();ctx.translate(f*14,-1);ctx.rotate(f>0?-.6:Math.PI+.6);krisShape(17);ctx.restore();
  ctx.restore();
};

function drawTimer(t,max,c){const p=G.p;ctx.strokeStyle=c;ctx.lineWidth=3;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(p.x,p.y,36,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,t/max));ctx.stroke();ctx.globalAlpha=1}

HOOKS.drawWorld.push(()=>{
  if(!G||G.sea!==S)return;
  // swipes, kicks, waves
  for(const f of S.fx){const a=Math.max(0,f.life/f.max);ctx.save();
    if(f.kind==='arc'){ctx.globalAlpha=a;ctx.strokeStyle=f.c;ctx.lineCap='round';ctx.lineWidth=f.w*(.4+a*.6);const sw=(1-a)*.5;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.72+.2*(1-a)),f.a-f.half+sw,f.a+f.half);ctx.stroke();
      ctx.globalAlpha=a*.18;ctx.fillStyle=f.c;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,f.r,f.a-f.half,f.a+f.half);ctx.closePath();ctx.fill()}
    else if(f.kind==='spin'){ctx.globalAlpha=a*.25;ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.fill();
      ctx.globalAlpha=a;ctx.strokeStyle=f.c;ctx.lineWidth=9*a+2;ctx.lineCap='round';const s=(1-a)*TAU;ctx.beginPath();ctx.arc(f.x,f.y,f.r*.8,s,s+4.2);ctx.stroke()}
    else if(f.kind==='line'){ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalAlpha=a*.7;const g=ctx.createLinearGradient(0,0,f.len,0);g.addColorStop(0,'rgba(255,179,138,0)');g.addColorStop(.25,f.c);g.addColorStop(1,'rgba(255,255,255,.9)');ctx.fillStyle=g;
      const w=f.w*(.4+.6*a);ctx.beginPath();ctx.moveTo(10,-w*.5);ctx.lineTo(f.len-w,-w);ctx.lineTo(f.len,0);ctx.lineTo(f.len-w,w);ctx.lineTo(10,w*.5);ctx.closePath();ctx.fill()}
    else if(f.kind==='wave'){const R=f.r*(1-a*a);ctx.globalAlpha=a*.35;ctx.fillStyle='#5fb4ea';ctx.beginPath();ctx.arc(f.x,f.y,R,0,TAU);ctx.arc(f.x,f.y,R*.7,0,TAU,true);ctx.fill();
      ctx.globalAlpha=a*.8;ctx.strokeStyle='#d6f1ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,R,0,TAU);ctx.stroke()}
    else if(f.kind==='crack'){ctx.globalAlpha=a*.7;ctx.strokeStyle='#3a2f22';ctx.lineWidth=3;for(let k=0;k<9;k++){const q=k/9*TAU+f.seed;ctx.beginPath();ctx.moveTo(f.x+Math.cos(q)*14,f.y+Math.sin(q)*8);ctx.lineTo(f.x+Math.cos(q+.18)*f.r*.45,f.y+Math.sin(q+.18)*f.r*.3);ctx.lineTo(f.x+Math.cos(q-.08)*f.r*.8,f.y+Math.sin(q-.08)*f.r*.55);ctx.stroke()}}
    else if(f.kind==='burst'){ctx.globalAlpha=a*.5;ctx.fillStyle='#ffe38a';ctx.beginPath();ctx.arc(f.x,f.y,f.r*(1-a*.5),0,TAU);ctx.fill()}
    ctx.restore()}
  // Sari afterimages
  for(const m of S.images){const k=Math.max(0,m.t/.5);ctx.save();ctx.globalAlpha=.25+.3*(1-k);ctx.fillStyle='#ffb347';ctx.beginPath();ctx.arc(m.x,m.y+2,15,0,TAU);ctx.arc(m.x,m.y-13,8,0,TAU);ctx.fill();
    ctx.globalAlpha=.6;ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.x,m.y,m.r*(1-k),0,TAU);ctx.stroke();
    ctx.fillStyle='#3a1f08';ctx.globalAlpha=.5;for(const s of[-6,0,6]){ctx.fillRect(m.x+s-1,m.y-4,2,9)}ctx.restore()}
  // Lan's guards
  for(const a of S.allies){const bob=Math.sin(G.t*9+a.slot)*1.5,blink=a.t<1.5&&Math.floor(G.t*10)%2;if(blink)continue;
    const rp=(G.t*14+a.slot*5)%8;
    ctx.fillStyle='rgba(143,214,255,.28)';ctx.beginPath();ctx.ellipse(a.x,a.y+12,13,5,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(214,241,255,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(a.x,a.y+12,8+rp,3+rp*.35,0,0,TAU);ctx.stroke();
    ctx.save();ctx.translate(a.x,a.y+bob-Math.max(0,a.bop)*5);ctx.scale((a.fx||1)*(1+Math.max(0,a.bop)*.15),1);if(a.full){ctx.fillStyle='rgba(255,211,77,.25)';ctx.beginPath();ctx.arc(0,-2,15,0,TAU);ctx.fill()}
    puppetShape(1.15,a.hue);ctx.restore()}
  // falling strikes
  for(const s of S.strikes){const k=Math.max(0,s.t/s.t0),h=k*230;
    ctx.fillStyle=s.kind==='feather'?`rgba(255,211,77,${.12+.2*(1-k)})`:`rgba(143,214,255,${.12+.2*(1-k)})`;ctx.beginPath();ctx.ellipse(s.x,s.y,s.r*(1-k*.5),s.r*.55*(1-k*.5),0,0,TAU);ctx.fill();
    ctx.save();ctx.translate(s.x+(s.seed-.5)*60*k,s.y-h);
    if(s.kind==='feather'){ctx.rotate((s.seed-.5)*.5);ctx.fillStyle='rgba(255,211,77,.35)';ctx.beginPath();ctx.ellipse(0,-34,5,30,0,0,TAU);ctx.fill();
      ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(11,-8,0,-34);ctx.quadraticCurveTo(-11,-8,0,14);ctx.fill();
      ctx.fillStyle='#c8102e';ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(5,2,0,-8);ctx.quadraticCurveTo(-5,2,0,14);ctx.fill();
      ctx.strokeStyle='#fff3b0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(0,-32);ctx.stroke()}
    else{ctx.strokeStyle='rgba(143,214,255,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(0,-40);ctx.stroke();puppetShape(1.1,s.seed*3|0)}
    ctx.restore()}
  // buff timers around the hero
  if(S.wai>0)drawTimer(S.wai,S.waiMax,'#ffd34d');
  if(S.stance>0)drawTimer(S.stance,S.stanceMax,'#ff8fb0');
  if(S.show>0)drawTimer(S.show,8,'#8fd6ff');
});

HOOKS.drawScreen.push(()=>{
  if(!G||G.sea!==S||S.show<=0)return;
  // the lake stage: soft water light at the top and bottom of the screen
  const a=Math.max(0,Math.min(1,S.show,(8-S.show)*3))*.22,g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,`rgba(95,180,234,${a})`);g.addColorStop(.22,'rgba(95,180,234,0)');g.addColorStop(.78,'rgba(95,180,234,0)');g.addColorStop(1,`rgba(95,180,234,${a*1.3})`);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=`rgba(214,241,255,${a*1.6})`;ctx.lineWidth=2;
  for(let k=0;k<3;k++){ctx.beginPath();for(let x=0;x<=W;x+=24){const y=H-14-k*12+Math.sin(x*.03+G.t*3+k*2)*4;if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y)}ctx.stroke()}
});
})();
