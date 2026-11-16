export const STAGES=[
  {id:'johor',name:'Johor',set:'Oil palm estates and kampung near the Causeway',ground:'#13241f',decor:[['palm',.2],['house',.05],['bush',.06],['banana',.06]],ghosts:{pocong:.8,toyol:.4,stalker:1.2},boss:{type:'toyol',name:'Raja Toyol',hp:1400,scale:3.2}},
  {id:'melaka',name:'Melaka',set:'Old town shophouses by the river',ground:'#1d2320',decor:[['shop',.14],['coconut',.06],['bush',.04]],ghosts:{pocong:.6,toyol:.3,minyak:.5,lantern:1.4},boss:{type:'minyak',name:'Orang Minyak Besar',hp:2000,scale:2.6}},
  {id:'perak',name:'Perak',set:'Limestone hills and old tin-mining ponds',ground:'#16231f',decor:[['rock',.12],['pond',.08],['banana',.08]],ghosts:{pocong:.5,penanggal:.4,minyak:.4,sentinel:1.3},boss:{type:'pocong',name:'Pocong Gergasi',hp:2800,scale:3.2}},
  {id:'kl',name:'Kuala Lumpur',bonus:true,after:'perak',tier:2.5,bossAt:120,coinMul:3,set:'Back lanes under the city lights',ground:'#1a1f26',decor:[['shop',.18],['lamp',.08],['bush',.03]],ghosts:{toyol:.7,pocong:.3,penanggal:.6,neon:1.5},boss:{type:'penanggal',name:'Ratu Penanggal',hp:2400,scale:2.6}},
  {id:'penang',name:'Pulau Pinang',set:'Shophouses and the old jetty',ground:'#18222a',decor:[['shop',.12],['coconut',.08],['pond',.05]],ghosts:{pocong:.4,penanggal:.7,minyak:.25,drifter:1.4},boss:{type:'pontianak',name:'Pontianak',hp:3000,scale:1}},
  {id:'kedah',name:'Kedah',set:'Endless paddy fields by the Thai border',ground:'#172718',decor:[['paddy',.3],['house',.04],['coconut',.05]],ghosts:{pocong:.4,toyol:.7,penanggal:.5,watcher:1.4},boss:{type:'pontianak',name:'Pontianak Ratu',hp:4500,scale:1.3}},
];

export const INTRO={stalker:'Palm Stalker! Step aside when its charge circle appears.',lantern:'Lantern Wraith! Dodge between its three ember bolts.',sentinel:'Tin Sentinel! Leave its wide circle before the ground slam.',neon:'Neon Shade! Watch for a dash and two flanking bolts.',drifter:'Brine Drifter! Avoid its slippery pools and sea bolts.',watcher:'Harvest Watcher! Weave through its five-shot straw fan.',toyol:'Toyol! Green and one-eyed. They steal your embers. Catch them to get them back.',penanggal:'Penanggal! The flying head left her body nearby. Break the body to weaken her.',minyak:'Orang Minyak! Hits slide off the oil, and the puddles make you skid.'};

export const HEROES={
  ustaz:{id:'ustaz',basicDamage:12,name:'Ustaz Hakim',country:'Malaysia',role:'Protector · slow, sturdy, heals',hp:150,speed:150,ultNeed:60,
    skills:[
      {key:'',name:'Nur',desc:'Auto bolt of light at the nearest ghost.',up:'More bolts, more damage.',cd:.85},
      {key:'Q',name:'Cahaya Fajar',desc:'Cone of dawn light; heavy damage and burn.',up:'+25% damage, wider reach.',cd:6},
      {key:'E',name:'Tasbih Ring',desc:'Prayer beads orbit you for 6 s.',up:'+1 bead, +25% damage.',cd:12},
      {key:'F',name:'Seruan',desc:'Wave that pushes ghosts back and stuns them.',up:'Longer stun, bigger wave.',cd:10},
      {key:'R',name:'Benteng Doa',desc:'Ultimate: ring of light that burns ghosts and heals you.',up:'+25% damage and healing.',cd:0,ult:true}]},
  rempit:{id:'rempit',basicDamage:11,name:'Mat Rempit "Jet"',country:'Malaysia',role:'Speedster · fastest, fragile',hp:95,speed:235,ultNeed:50,
    skills:[
      {key:'',name:'Spanar',desc:'Auto-thrown spanner that bounces between ghosts.',up:'+1 bounce every 2 ranks, more damage.',cd:.7},
      {key:'Q',name:'Wheelie',desc:'Dash forward, hitting everything in the way. Invulnerable while dashing.',up:'+25% damage, shorter cooldown.',cd:4},
      {key:'E',name:'Ekzos Panas',desc:'Leave a burning exhaust trail for 5 s.',up:'+25% burn, longer trail.',cd:10},
      {key:'F',name:'Hon Kuat',desc:'Horn blast: nearby ghosts flee for 2 s.',up:'Longer fear, bigger blast.',cd:9},
      {key:'R',name:'Mode Superman',desc:'Ultimate: lie flat on the bike. Double speed, invulnerable, ram ghosts.',up:'+25% ram damage, longer.',cd:0,ult:true}]},
};

export const PASSIVES=[
  {id:'teh',name:'Teh Tarik',desc:'+10% move speed.',apply:s=>s.spd+=.1},
  {id:'sambal',name:'Sambal',desc:'+12% damage.',apply:s=>s.dmg+=.12},
  {id:'kopi',name:'Kopi O',desc:'8% shorter cooldowns.',apply:s=>s.cd*=.92},
  {id:'nasi',name:'Nasi Lemak',desc:'+25 max HP and heal 25.',apply:(s,G)=>{G.p.maxHp+=25;G.p.hp=Math.min(G.p.maxHp,G.p.hp+25)}},
  {id:'kemboja',name:'Bunga Kemboja',desc:'+35% pickup range.',apply:s=>s.pickup*=1.35},
  {id:'pelita',name:'Pelita',desc:'+6% critical chance. A crit pins the Pontianak.',apply:s=>s.crit+=.06},
  {id:'guli',name:'Guli',desc:'Drop marbles that distract toyols from your embers.',apply:s=>s.guli+=1},
];

export const EVOS={
  ustaz:[{i:0,item:'pelita',name:'Nur Purnama',d:'Every third cast also bursts bolts in 8 directions.'},{i:1,item:'kopi',name:'Fajar Penuh',d:'Cahaya Fajar lights a full circle around you.'}],
  rempit:[{i:0,item:'sambal',name:'Spanar Berapi',d:'Spanners burn ghosts and bounce 2 more times.'},{i:1,item:'teh',name:'Wheelie Kilat',d:'Longer dash that always leaves a fire trail.'}],
};
