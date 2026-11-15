// Invented encounter landmarks, inspired by each stage's existing geographic theme.
const site=(id,name,x,y,reward=20)=>({id,name,x,y,reward});
const rect=(id,x,y,w,h)=>({id,x,y,w,h});
const house=(id,x,y,frame=0)=>({...rect(id,x,y,210,150),frame});
const base={waters:[],bridges:[],paddies:[],rocks:[],roads:[],buildings:[],trees:[],tint:0xb6c5b0,path:0x8a8057,water:0x1a4c54,urban:false};
export const REGION_DATA={
melaka:{name:'Lantern Quays',signature:'lantern',tint:0xc8b29a,path:0xb28b6f,water:0x344d62,urban:true,
 landmarks:[site('square','Lantern Square',0,0,0),site('quay','Old River Quay',-1700,-1200),site('kiln','Pottery Courtyard',-1800,1300,24),site('gate','Red Gate Market',1700,-1500,26),site('clock','Clockmaker Lane',1700,1400,28)],
 waters:[rect('canal-n',-720,-3000,300,1550),rect('canal-m',-720,-950,300,1900),rect('canal-s',-720,1450,300,1550)],
 bridges:[rect('bridge-n',-800,-1450,460,500),rect('bridge-s',-800,950,460,500)],
 roads:[[[0,0],[0,-1200],[-1700,-1200]],[[0,0],[0,1200],[-1800,1300]],[[0,0],[1700,-1500]],[[0,0],[1700,1400]]]},
perak:{name:'Tinfall Highlands',signature:'sentinel',tint:0xa6b4bb,path:0x97978a,water:0x3b8e92,
 landmarks:[site('camp','Prospector Camp',0,0,0),site('quarry','Limestone Quarry',-1900,-1500,24),site('pond','Turquoise Diggings',1600,-1700,24),site('cart','Forgotten Cartway',-1700,1700,26),site('ridge','Echo Ridge',1900,1400,30)],
 waters:[rect('pit-a',500,-1200,850,550),rect('pit-b',-1600,500,650,550)],
 rocks:[rect('ridge-a',-900,-1900,350,700),rect('ridge-b',900,650,330,750),rect('ridge-c',-2300,0,480,300)],
 roads:[[[0,0],[-1200,-500],[-1900,-1500]],[[0,0],[1700,-300],[1600,-1700]],[[0,0],[-600,1400],[-1700,1700]],[[0,0],[1600,300],[1900,1400]]]},
kl:{name:'Neon Backstreets',signature:'neon',tint:0x697b9c,path:0x5d687e,water:0x34445f,urban:true,
 landmarks:[site('junction','Midnight Junction',0,0,0),site('arcade','Shuttered Arcade',-1800,-1800,26),site('depot','Transit Depot',1800,-1600,26),site('rooftop','Tower Courtyard',-1800,1600,30),site('night','Neon Night Market',1700,1700,34)],
 rocks:[],roads:[[[0,-2700],[0,2700]],[[-2700,0],[2700,0]],[[-1800,-2200],[-1800,2200]],[[1800,-2200],[1800,2200]],[[-2600,-1700],[2600,-1700]],[[-2600,1700],[2600,1700]]]},
penang:{name:'Saltwind Jetties',signature:'drifter',tint:0x9fbcc3,path:0xb9a77e,water:0x286c80,
 landmarks:[site('promenade','Seafront Promenade',0,0,0),site('boats','Boatwright Row',-1600,-1700,24),site('jetty','Lantern Jetty',2100,-1400,28),site('fishing','Fishing Platform',2100,1400,28),site('warehouse','Salt Warehouse',-1500,1600,30)],
 waters:[rect('sea-n',900,-3000,2100,1350),rect('sea-m',900,-1150,2100,2300),rect('sea-s',900,1650,2100,1350)],
 bridges:[rect('jetty-n',820,-1650,2180,500),rect('jetty-s',820,1150,2180,500)],
 roads:[[[0,0],[350,-1400],[2400,-1400]],[[0,0],[350,1400],[2400,1400]],[[0,0],[-1600,-1700]],[[0,0],[-1500,1600]]]},
kedah:{name:'Golden Harvest Plain',signature:'watcher',tint:0xd7c687,path:0xb2a16c,water:0x496d54,
 landmarks:[site('granary','Harvest Granary',0,0,0),site('terrace','Golden Terraces',-1800,-1600,26),site('sluice','Old Sluice Gate',1700,-1700,28),site('wind','Windmill Fields',-1800,1800,30),site('watch','Scarecrow Crossing',1700,1700,32)],
 waters:[rect('canal-w',-3000,620,1000,220),rect('canal-mid',-1500,620,2700,220),rect('canal-e',1700,620,1300,220)],
 bridges:[rect('cross-w',-2000,550,500,360),rect('cross-e',1200,550,500,360)],
 paddies:[[-2500,-2400],[-500,-2400],[1200,-2500],[-2500,1200],[900,1200]],
 roads:[[[0,0],[-1800,-1600]],[[0,0],[1700,-1700]],[[0,0],[-1750,400],[-1750,1800]],[[0,0],[1450,400],[1450,1700],[1700,1700]]]}
};
for(const [id,data]of Object.entries(REGION_DATA)){
  const region={...base,...data,id};
  const frame={melaka:0,perak:5,kl:2,penang:3,kedah:4}[id];
  region.buildings=region.landmarks.flatMap((s,i)=>[house(id+'-'+i+'a',s.x-410,s.y-320,frame),...(id==='perak'?[]:[house(id+'-'+i+'b',s.x+270,s.y+230,frame)])]).filter(b=>!region.waters.some(w=>b.x+b.w>w.x&&b.x<w.x+w.w&&b.y+b.h>w.y&&b.y<w.y+w.h));
  region.trees=Array.from({length:id==='kl'?0:24},(_,i)=>({x:-2600+(i*997+id.length*101)%5200,y:-2600+(i*677)%5200,frame:id==='perak'?13:10})).filter(t=>!region.landmarks.some(s=>Math.hypot(s.x-t.x,s.y-t.y)<450)&&!region.waters.some(w=>t.x>w.x-100&&t.x<w.x+w.w+100&&t.y>w.y-100&&t.y<w.y+w.h+100));
  REGION_DATA[id]=region;
}
