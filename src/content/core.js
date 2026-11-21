import {REGIONAL_GHOSTS} from './regional-ghosts.js';
import {waveSpecialists} from './wave-monsters.js';

export const LEVEL_UP_HEAL=.25;

const FOLKLORE_WAVE_WEIGHT=.5;
const FOLKLORE_ARRIVALS=[24,36,53,66];
const FOLKLORE_WAVE_GRACE=6;

export const STAGES=[
  {id:'johor',name:'Johor',lon:103.74,lat:1.49,tier:0,clearCoins:20,set:'Stilt houses and palm groves near the Johor Strait',ground:'#13241f',decor:[['palm',.2],['house',.05],['bush',.06],['banana',.06]],ghosts:{pocong:.8,toyol:.4,stalker:1.2},folklore:['ledangGlint','kukupClaw','endauEagle','wovenSteed'],boss:{type:'toyol',name:'Raja Toyol',hp:1400,scale:3.2}},
  {id:'melaka',name:'Melaka',lon:102.25,lat:2.2,tier:1,clearCoins:30,set:'Brick quays, shophouses and crossings along Sungai Melaka',ground:'#1d2320',decor:[['shop',.14],['coconut',.06],['bush',.04]],ghosts:{pocong:.6,toyol:.3,minyak:.5,lantern:1.4},folklore:['quayPelanduk','quaysideSamambu','rebanaEcho','lacquerClogs'],boss:{type:'minyak',name:'Orang Minyak Besar',hp:2000,scale:2.6}},
  {id:'kl',name:'Kuala Lumpur',bossAt:120,coinMul:3,lon:101.69,lat:3.14,tier:2.5,clearCoins:60,set:'Late-night food stalls beneath a monorail corridor',ground:'#1a1f26',decor:[['shop',.18],['lamp',.08],['bush',.03]],ghosts:{toyol:.7,pocong:.3,penanggal:.6,neon:1.5},folklore:['monorailGalah','nightDrongo','nanasBramble','crossStreetPewter'],boss:{type:'penanggal',name:'Ratu Penanggal',hp:2400,scale:2.6}},
  {id:'perak',name:'Perak',lon:101.08,lat:4.6,tier:2,clearCoins:40,set:'Kinta Valley limestone and the remains of a tin dredge',ground:'#16231f',decor:[['rock',.12],['pond',.08],['banana',.08]],ghosts:{pocong:.5,penanggal:.4,minyak:.4,sentinel:1.3},folklore:['tinGajah','gerikGnaw','lenggongSnag','sayongSpill'],boss:{type:'pocong',name:'Pocong Gergasi',hp:2800,scale:3.2}},
  {id:'penang',name:'Pulau Pinang',lon:100.33,lat:5.41,tier:3,clearCoins:50,set:'George Town timber jetties and narrow waterfront lanes',ground:'#18222a',decor:[['shop',.12],['coconut',.08],['pond',.05]],ghosts:{pocong:.4,penanggal:.7,minyak:.25,drifter:1.4},folklore:['jettyTideback','telagaGoldJar','batuMaungPrint','jettyBanner'],boss:{type:'pontianak',name:'Pontianak',hp:3000,scale:1}},
  {id:'kedah',name:'Kedah',lon:100.37,lat:6.12,tier:4,clearCoins:60,set:'Golden sawah and irrigation gates on the Kedah plain',ground:'#172718',decor:[['paddy',.3],['house',.04],['coconut',.05]],ghosts:{pocong:.4,toyol:.7,penanggal:.5,watcher:1.4},folklore:['sawahFang','sevenWellsShard','padiEmber','twinPeaks'],boss:{type:'pontianak',name:'Pontianak Ratu',hp:4500,scale:1.3}},
  {id:'pahang',name:'Pahang',lon:103.33,lat:3.81,tier:1,clearCoins:30,set:'Nipah mangroves and boardwalks on the Kuantan estuary',ground:'#182d24',ghosts:{pocong:.7,toyol:.4,minyak:.35,nipah:1.4},folklore:['chiniWake','gelanggiRampart','whitewaterCroc','candlenutRicochet'],boss:{type:'pocong',name:'Riverbank Pocong',hp:2000,scale:2.8}},
  {id:'terengganu',name:'Terengganu',lon:103.14,lat:5.33,tier:2.5,clearCoins:45,set:'Pulau Duyong boatyards and tidal crossings',ground:'#192f34',ghosts:{pocong:.35,toyol:.5,penanggal:.55,foam:1.5},folklore:['cengalProw','mayangDrift','songketMoth','brassFoilfish'],boss:{type:'penanggal',name:'Estuary Penanggal',hp:2900,scale:2.6}},
  {id:'kelantan',name:'Kelantan',lon:102.24,lat:6.13,tier:4,clearCoins:60,set:'Wau workshops, batik stalls and the Kota Bharu floodplain',ground:'#262d1e',ghosts:{pocong:.45,toyol:.5,penanggal:.6,kite:1.6},folklore:['floodplainKijang','marakCrockery','beringinShadow','merbauSpinner'],boss:{type:'pontianak',name:'Floodplain Pontianak',hp:4500,scale:1.3}},
  {id:'selangor',name:'Selangor',lon:101.44,lat:3.035,tier:2,clearCoins:40,set:'Klang River markets, tidal banks and harbour warehouses',ground:'#273426',ghosts:{pocong:.55,toyol:.35,minyak:.4,mooring:1.4},folklore:['quayPelanduk','quaysideSamambu','whitewaterCroc','jettyBanner'],boss:{type:'minyak',name:'Orang Minyak of the Quay',hp:2600,scale:2.8}},
].map(({folklore,ghosts,...stage})=>{
  const arrivals=Object.fromEntries(folklore.map((id,index)=>{
    const at=FOLKLORE_ARRIVALS[index];
    return [id,{at,waveAt:at+FOLKLORE_WAVE_GRACE}];
  }));
  const folkloreWeights=Object.fromEntries(folklore.map(id=>[id,FOLKLORE_WAVE_WEIGHT/folklore.length]));
  const specialists=waveSpecialists(stage.id);
  const specialistWeights=Object.fromEntries(Object.entries(specialists).map(([id,{weight}])=>[id,weight]));
  return {...stage,ghosts:{...ghosts,...folkloreWeights,...specialistWeights},folklore:arrivals,waveSpecialists:specialists};
});

const regionalIntroductions=Object.fromEntries(Object.entries(REGIONAL_GHOSTS)
  .map(([id,ghost])=>[id,ghost.name+'! '+ghost.hint]));
export const INTRO={...regionalIntroductions,toyol:'Toyol! Green and one-eyed. They steal your embers. Catch them to get them back.',penanggal:'Penanggal! The flying head left her body nearby. Break the body to weaken her.',minyak:'Orang Minyak! Hits slide off the oil, and the puddles make you skid.'};

export const HEROES={
  ustaz:{id:'ustaz',basicDamage:12,name:'Ustaz Fadli',country:'Malaysia',role:'Protector · slow, sturdy, heals',hp:150,speed:150,ultNeed:60,
    skills:[
      {key:'',name:'Nur',desc:'Auto bolt of light at the nearest ghost.',up:'More bolts, more damage.',cd:.85},
      {key:'Q',name:'Cahaya Fajar',baseDamage:38,damageLabel:'Base hit',desc:'Cone of dawn light; heavy damage and burn.',up:'+25% damage, wider reach.',cd:6},
      {key:'E',name:'Tasbih Ring',baseDamage:9,damageLabel:'Base bead hit',desc:'Prayer beads orbit you for 6 s.',up:'+1 bead, +25% damage.',cd:12},
      {key:'F',name:'Seruan',baseDamage:15,damageLabel:'Base wave',desc:'Summon a Silat Saka whose keris sweep pushes and stuns nearby ghosts. Each burning target restores 4 HP, up to 12.',up:'Longer stun, bigger wave.',cd:10},
      {key:'R',name:'Benteng Doa',baseDamage:26,damageLabel:'Base burn / s',desc:'Ultimate: ring of light that burns ghosts and heals you.',up:'+25% damage and healing.',cd:0,ult:true}]},
  rempit:{id:'rempit',basicDamage:11,name:'Mat Rempit "Kama"',country:'Malaysia',role:'Speedster · fastest, fragile',hp:95,speed:235,ultNeed:50,
    skills:[
      {key:'',name:'Spanar',desc:'Auto-thrown spanner that bounces between ghosts.',up:'+1 bounce every 2 ranks, more damage.',cd:.7},
      {key:'Q',name:'Wheelie',baseDamage:34,damageLabel:'Base dash hit',desc:'Steer with movement when casting manually. Dash through ghosts, dealing damage and ignoring body contact.',up:'+25% damage, shorter cooldown.',cd:4},
      {key:'E',name:'Ekzos Panas',baseDamage:22,damageLabel:'Base burn / s',desc:'Leave a burning exhaust trail for 5 s.',up:'+25% burn, longer trail.',cd:10},
      {key:'F',name:'Hon Kuat',baseDamage:10,damageLabel:'Base horn hit',desc:'Frighten nearby ghosts and ignite your exhaust patches for a burst of damage. Ignite two or more to cut 2 s from Wheelie’s cooldown.',up:'Longer fear, bigger blast.',cd:9},
      {key:'R',name:'Mode Superman',baseDamage:60,damageLabel:'Base ram hit',desc:'Ultimate: lie flat on the bike. Double speed, ram ghosts, and ignore body contact.',up:'+25% ram damage, longer.',cd:0,ult:true}]},
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
  ustaz:[
    {i:0,item:'pelita',name:'Nur Purnama',d:'Every third cast also bursts bolts in 8 directions.'},
    {i:1,item:'kopi',name:'Fajar Penuh',d:'Cahaya Fajar lights a full circle around you.'},
    {i:2,item:'nasi',name:'Sheltering Orbit',d:'Bead hits slow ghosts for 1 second.'}
  ],
  rempit:[
    {i:0,item:'sambal',name:'Spanar Berapi',d:'Spanners burn ghosts and bounce 2 more times.'},
    {i:1,item:'teh',name:'Wheelie Kilat',d:'Longer dash that always leaves a fire trail.'},
    {i:2,item:'sambal',name:'Banked Cinders',d:'Exhaust patches grow 50% wider and burn for 1 extra second.'}
  ],
  nok:[
    {i:0,item:'sambal',name:'Mae Mai Khao',d:'Every third strike is a knee: triple damage and a short stun.'},
    {i:1,item:'teh',name:'Ember Flying Knee Phayu',d:'Ember Flying Knee also sends a storm wave far down the line.'},
    {i:2,item:'kopi',name:'Return to Guard',d:'Landing Turning Elbow cuts 2 seconds from Ember Flying Knee’s cooldown, once per sweep.'}
  ],
  lan:[
    {i:0,item:'kemboja',name:'Phoenix Puppet',d:'The puppet bursts in a spin where it turns around.'},
    {i:1,item:'kopi',name:'Golden Dragon',d:'The dragon turns around and charges back for a second pass.'},
    {i:2,item:'pelita',name:'River Chorus',d:'Guard strikes soak their target for 1.5 seconds, setting up the next ripple.'}
  ],
  sari:[
    {i:0,item:'pelita',name:'Kris Pusaka',d:'Throw one extra heirloom kris in each volley.'},
    {i:2,item:'teh',name:'Raungan Harimau',d:'Afterimage blasts are 40% bigger and make ghosts flee.'},
    {i:1,item:'sambal',name:'Echo Crescent',d:'Tiger Afterstep echoes detonated by the kick deal 50% more blast damage.'}
  ],
  asha:[
    {i:1,item:'kopi',name:'Queue Jumper',d:'Q immediately charges the closest uncharged chope it lands.'}
  ],
  mira:[
    {i:2,item:'kemboja',name:'One More Bowl',d:'Serving at least one portion widens Pagpag Salo-Salo from 110 to 190 units.'}
  ],
  dani:[
    {i:2,item:'pelita',name:'Lasting Gold',d:'Gold Dust lasts 2 seconds longer.'}
  ],
  vanna:[
    {i:3,item:'guli',name:'Long Thread',d:'Foldstep’s familiar strikes 50% farther.'}
  ],
  keo:[
    {i:2,item:'sambal',name:'Five-Reed Chord',d:'A timed Triple Overtone adds two outer bolts with the same timing bonus.'}
  ],
  nadi:[
    {i:3,item:'kopi',name:'Unbroken Stillness',d:'Still Palm lasts 3 seconds or until it counters the first hit.'}
  ],
  lia:[
    {i:2,item:'teh',name:'Long Shadow',d:'Shadowstep reaches 280 units instead of 210.'}
  ],
};
