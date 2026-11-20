// Fictional districts laid out around local waterways, trades and landmarks.
const site=(id,name,x,y,reward=20)=>({id,name,x,y,reward});
const rect=(id,x,y,w,h)=>({id,x,y,w,h});
const row=(id,x,y,count,dx,dy,w=168,h=134)=>Array.from(
  {length:count},(_,i)=>rect(id+'-'+i,x+i*dx,y+i*dy,w,h)
);
const base={waters:[],bridges:[],paddies:[],rocks:[],roads:[],buildings:[],trees:[],
  tint:0xb6c5b0,path:0x8a8057,water:0x1a4c54,urban:false};
const overlaps=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;

export const REGION_DATA={
  melaka:{
    name:'Sungai Melaka Quays',signature:'lantern',tint:0xc8b29a,path:0xb59072,water:0x397a83,urban:true,
    landmarks:[site('square','Dataran Bata Merah',0,0,0),site('quay','Old River Quay',-1640,-1350),
      site('kiln','Pottery Courtyard',-1540,1470,24),site('gate','Red Gate Market',1430,-1540,26),site('clock','Clockmaker Lane',1700,1140,28)],
    waters:[rect('river-n',-740,-3000,345,1500),rect('river-centre',-590,-1050,340,2110),rect('river-s',-415,1530,350,1470)],
    bridges:[rect('north-bridge',-875,-1500,725,450),rect('south-bridge',-710,1060,740,470)],
    buildings:[...row('quay-houses',-232,-1220,5,0,242,145,176),...row('kiln-houses',-1020,710,4,0,-240,164,160),
      ...row('market-houses',520,-350,4,235,0),...row('shop-houses',560,390,5,260,0)],
    roads:[[[0,-2500],[0,-1270],[0,0],[122,1290],[260,2700]],[[0,0],[650,-40],[940,-1270],[1430,-1540]],
      [[122,1290],[1700,1140]],[[0,-1270],[-1640,-1350],[-1450,10],[-1540,1470],[122,1290]]]
  },
  kl:{
    name:'Jalan Alor After Dark',signature:'neon',tint:0x697b9c,path:0x575d70,water:0x34445f,urban:true,
    landmarks:[site('junction','Night Market Junction',0,0,0),site('arcade','Shuttered Arcade',-1710,-1450,26),
      site('depot','Monorail Depot',1600,-1810,26),site('rooftop','Tower Courtyard',-1500,1730,30),site('night','Medan Selera',1670,1430,34)],
    buildings:[...row('shophouse-west',-1000,-430,4,212,0,175,154),rect('kopitiam-east',260,-430,205,158),
      rect('shophouse-east',515,-445,195,170),rect('arcade-east',770,-475,218,199),
      ...row('hawker-west',-998,285,4,212,0,159,102),...row('hawker-east',245,246,4,225,0,170,108),
      ...row('arcade-n',-1050,-924,3,285,0,228,180),...row('shophouse-arcade',-2300,-900,3,245,0,195,174),
      ...row('offices-s',-1030,945,3,304,0,239,205),...row('offices-e',260,1010,3,304,0,245,225),
      ...row('tower-n',-2470,-2150,4,552,0,345,275),
      rect('monorail-depot',1355,-2265,390,183),rect('kopitiam-corner',1380,-510,260,186),
      rect('arcade-corner',-2110,320,305,205),rect('monorail-junction',-1780,462,290,162),
      rect('tower-courtyard',-2060,1210,380,280),rect('shophouse-food-court',2010,930,220,184)],
    roads:[[[-2650,0],[2650,0]],[[0,-2700],[0,2700]],[[0,-1170],[-1700,-1170],[-1710,-1450]],
      [[0,-1960],[1510,-1960],[1600,-1810]],[[0,1600],[-1500,1600],[-1500,1730]],[[0,640],[1670,640],[1670,1430]],
      [[-1240,-1170],[-1240,0],[-1240,1600]],[[1190,-1960],[1190,0],[1190,640]]]
  },
  perak:{
    name:'Kinta Tin Basin',signature:'sentinel',tint:0xa6b4bb,path:0xa49a83,water:0x479e9f,
    landmarks:[site('camp','Dredge Landing',0,0,0),site('quarry','Limestone Cutting',-1850,-1630,24),
      site('pond','Blue Tailings Pond',1750,-1430,24),site('cart','Ore Cart Siding',-1580,1520,26),site('ridge','Kinta Ridge',1850,1480,30)],
    waters:[rect('dredge-pool',-215,-870,560,520),rect('tailings',900,-1440,665,660),rect('settling',-1680,570,860,495)],
    rocks:[rect('karst-near',-840,-365,380,490),rect('karst-north',-1450,-2060,470,950),rect('karst-east',870,600,410,960),
      rect('karst-west',-2450,265,465,550)],
    roads:[[[0,0],[-270,275],[-1050,330],[-1250,-680],[-1620,-965],[-1850,-1630]],[[0,0],[480,-225],[665,-460],[1810,-430],[1750,-1430]],
      [[0,0],[-685,1370],[-1580,1520]],[[0,0],[1640,455],[1850,1480]]]
  },
  penang:{
    name:'George Town Timber Jetties',signature:'drifter',tint:0x9fbcc3,path:0xb9a77e,water:0x377d8c,
    landmarks:[site('promenade','Waterfront Lane',0,0,0),site('boats','Timber Shophouses',-1710,-1460,24),
      site('jetty','Long Jetty',2090,-1150,28),site('fishing','Fishing Platform',1820,1480,28),site('warehouse','Salt Warehouse',-1520,1680,30)],
    waters:[rect('sea-n',390,-3000,2610,1610),rect('sea-m',275,-910,2725,2160),rect('sea-s',410,1710,2590,1290)],
    bridges:[rect('long-jetty',210,-1390,2250,480),rect('fish-jetty',210,1250,2460,460)],
    buildings:[...row('shore-shops',-500,-682,5,0,319,198,157),...row('jetty-shacks',650,-1365,5,340,0,155,108),
      ...row('platform-shacks',650,1270,4,315,0,150,100)],
    roads:[[[100,-1150],[109,0],[109,1470]],[[109,-1150],[2340,-1150]],[[109,1480],[2100,1480]],
      [[0,0],[-1150,-330],[-1710,-1460]],[[0,0],[-880,670],[-1520,1680]]]
  },
  kedah:{
    name:'Sawah Pintu Air',signature:'watcher',tint:0xd7c687,path:0xc5aa70,water:0x638773,
    landmarks:[site('granary','Jelapang Granary',0,0,0),site('terrace','Sunset Paddies',-1610,-1550,26),
      site('sluice','Pintu Air',1690,-1570,28),site('wind','Irrigation Fields',-1650,1610,30),site('watch','Paddy Watch Post',1700,1490,32)],
    waters:[rect('canal-w',-3000,370,1040,235),rect('canal-mid',-1450,360,2700,255),rect('canal-e',1750,370,1250,235),
      rect('feeder',690,-2530,245,1210)],
    bridges:[rect('west-crossing',-1960,301,510,385),rect('east-crossing',1250,301,500,385)],
    paddies:[[-2700,-2440],[-1340,-2380],[1040,-2360],[-2700,920],[940,820],[-650,840],[-1320,-750]],
    roads:[[[0,0],[-1700,175],[-1700,1610]],[[0,0],[1500,135],[1500,1490],[1700,1490]],
      [[0,0],[-880,-550],[-1610,-1550]],[[0,0],[550,-960],[1330,-1060],[1690,-1570]]]
  },
  pahang:{
    name:'Kuantan Mangrove Reach',signature:'nipah',tint:0x8eaa7b,path:0xa48c68,water:0x366f68,
    landmarks:[site('landing','Pangkalan Nipah',0,0,0),site('nursery','Mangrove Nursery',-1600,-1760,24),
      site('lookout','Estuary Lookout',1840,-1560,26),site('causeway','Forest Causeway',-1680,1610,26),site('wharf','Reed Wharf',1930,1340,28)],
    waters:[rect('channel-n',690,-3000,605,1230),rect('channel-mid',520,-1300,720,2390),
      rect('channel-s',860,1570,630,1430),rect('backwater',-2420,460,1220,530),rect('inlet',1240,620,830,240)],
    bridges:[rect('north-boardwalk',385,-1770,1010,470),rect('south-boardwalk',405,1090,1160,480)],
    rocks:[rect('bluff',-1500,-640,480,220),rect('river-stones',1600,-560,410,240)],
    roads:[[[0,0],[-1600,-1760]],[[0,0],[245,-1530],[1840,-1560]],[[0,0],[-700,1200],[-1680,1610]],
      [[0,0],[220,1330],[1930,1340]]]
  },
  terengganu:{
    name:'Duyong Boatbuilding Inlet',signature:'foam',tint:0x91afb3,path:0xc9a779,water:0x408795,
    landmarks:[site('yard','Duyong Boat Yard',0,0,0),site('shed','Cengal Working Shed',-1620,-1520,26),
      site('slip','Low Tide Slipway',1660,-1190,28),site('nets','Net Drying Field',-1550,1370,28),site('dock','Estuary Dock',1840,1630,32)],
    waters:[rect('shallows-n',970,-3000,2030,1570),rect('shallows-mid',1120,-930,1880,2310),
      rect('shallows-s',1300,1870,1700,1130),rect('inlet-w',-3000,510,1270,300),rect('inlet-mid',-1260,510,1890,300),rect('inlet-e',1050,510,110,300)],
    bridges:[rect('slipway',740,-1430,1340,500),rect('dock',965,1380,1400,490),
      {...rect('cut-w',-1730,440,470,460),axis:'y'},rect('cut-e',630,440,420,460)],
    buildings:[...row('boat-sheds',-610,-430,5,252,0,180,142),...row('drying-huts',-790,260,4,280,0,150,115)],
    roads:[[[0,0],[-1620,-1520]],[[0,0],[690,-1190],[2050,-1190]],[[0,0],[-1500,335],[-1500,1110],[-1550,1370]],
      [[0,0],[840,205],[835,1630],[2200,1630]]]
  },
  kelantan:{
    name:'Kota Bharu Kite Fields',signature:'kite',tint:0xc2bd86,path:0xc0a173,water:0x557965,
    landmarks:[site('market','Pasar Wau',0,0,0),site('studio','Wau Workshop',-1680,-1450,28),
      site('grove','Bamboo Grove',1690,-1740,30),site('field','Padang Layang',-1640,1660,32),site('bank','Floodplain Bank',1710,1570,34)],
    waters:[rect('floodway-w',-3000,-760,1060,360),rect('floodway-mid',-1460,-900,2800,370),
      rect('floodway-e',1830,-1120,1170,380),rect('pond',-370,1420,940,730)],
    bridges:[rect('raised-road-w',-1940,-1010,480,740),rect('raised-road-e',1340,-1280,490,900)],
    buildings:[...row('batik-stalls',-610,-320,6,198,0,126,105),...row('kite-sellers',-680,300,6,211,0,138,118)],
    paddies:[[-2550,390],[980,650],[2075,690],[-2530,-2460],[590,-2640]],
    roads:[[[0,0],[-1700,-125],[-1680,-1450]],[[0,0],[1580,-218],[1690,-1740]],
      [[0,0],[-925,715],[-1640,1660]],[[0,0],[1120,680],[1710,1570]]]
  }
};

for(const [id,data] of Object.entries(REGION_DATA)){
  const region={...base,...data,id};
  const groundObstacles=[...region.waters,...region.rocks];
  region.buildings=region.buildings.filter(b=>!groundObstacles.some(o=>overlaps(b,o)));
  for(const [i,s] of region.landmarks.entries()){
    for(const [suffix,dx,dy,w,h] of [['a',-410,-315,190,137],['b',285,250,179,129]]){
      const b=rect(id+'-site-'+i+suffix,s.x+dx,s.y+dy,w,h);
      if(![...groundObstacles,...region.buildings,...region.bridges].some(o=>overlaps(b,o)))region.buildings.push(b);
    }
    const candidates=[[-210,-178],[65,-190],[-215,121],[95,112]];
    const district=candidates.map(([dx,dy])=>rect('district-'+i,s.x+dx,s.y+dy,142,68))
      .find(b=>![...groundObstacles,...region.bridges,...region.buildings].some(o=>overlaps(b,o)));
    if(district)region.buildings.push(district);
  }
  const treeCount=({kl:0,melaka:10,pahang:58,kelantan:39,terengganu:18,penang:15,kedah:17,perak:25})[id];
  region.trees=Array.from({length:treeCount},(_,i)=>({x:-2630+(i*997+id.length*101)%5260,y:-2620+(i*677)%5240,frame:id==='perak'?13:10}))
    .filter(t=>!region.landmarks.some(s=>Math.hypot(s.x-t.x,s.y-t.y)<420)&&
      ![...groundObstacles,...region.buildings,...region.bridges].some(b=>overlaps(b,rect('',t.x-70,t.y-70,140,140))));
  REGION_DATA[id]=region;
}
