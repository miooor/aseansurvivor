import {arrangeRoadsideScenery} from './road-layout.js';
import {ENCOUNTERS} from './encounters.js';

// The original five mission sites remain the centre of each region. These
// authored roads lead into two outer districts, joined by a second route.
export const WORLD_SIZE=8640;
export const HALF=WORLD_SIZE/2;
const site=(id,name,x,y,reward,featured=false)=>({id,name,x,y,reward,featured});
const rect=(id,x,y,w,h)=>({id,x,y,w,h});
const bridge=(id,x,y,w,h,axis)=>({...rect(id,x,y,w,h),axis});
const court=(x,y,rx,ry,surface='stone')=>({x,y,rx,ry,surface});
const stand=(x,y,w,h)=>rect('featured-landmark',x,y,w,h);

const commonGround={
  melaka:court(0,0,405,305),perak:court(0,0,325,245,'earth'),penang:court(-96,0,322,235,'earth'),
  kedah:court(0,0,340,285,'earth'),pahang:court(0,0,286,242,'earth'),
  terengganu:court(0,0,382,253,'earth'),kelantan:court(0,0,364,247,'earth')
};

const districts={
  johor:{
    sites:[site('timbalan','Bukit Timbalan Terrace',-3170,-3400,26,true),site('causeway-outlook','Straits Landing',3290,3190,24)],
    buildings:[stand(-3465,-3840,590,290),rect('terrace-store',-3690,-3270,206,145),rect('landing-stall',3560,2820,185,125)],
    bridges:[rect('southern-timber-bridge',1070,2710,610,455)],
    roads:[[[-1500,-1100],[-2240,-1700],[-2420,-2640],[-3170,-2890],[-3170,-3400]],
      [[2100,1300],[2570,1980],[2610,2770],[3290,3190]],
      [[-1500,1400],[-1060,2370],[520,2900],[1720,2920],[2610,2770]]],
    courts:[court(-3170,-3400,540,265),court(3290,3190,390,235,'earth')],
    groves:[[-3810,-2660,6],[-2670,-3200,5],[-3450,2000,8],[3020,3690,5]]
  },
  melaka:{
    sites:[site('stadthuys','Stadthuys Steps',-3180,-3380,28,true),site('jonker','Jonker Street Arcade',2930,3250,25)],
    buildings:[stand(-3490,-3830,610,300),rect('archive',-2750,-3580,200,155),rect('arcade-house-1',2630,2950,168,145),rect('arcade-house-2',2990,2950,176,145)],
    bridges:[rect('south-quay-bridge',-580,2830,685,400)],
    roads:[[[-1640,-1350],[-2160,-1850],[-2750,-2300],[-3180,-2810],[-3180,-3380]],
      [[1700,1140],[1980,2110],[2930,2550],[2930,3250]],
      [[-1540,1470],[-1370,2460],[-770,3010],[500,3010],[1700,2840],[2930,2550]]],
    courts:[court(-3180,-3380,555,255),court(2930,3250,460,235)],
    groves:[[-3740,-3060,4],[-2800,-3230,3],[3300,3530,4]]
  },
  kl:{
    sites:[site('twin-towers','Twin Towers Esplanade',3130,-3300,32,true),site('central-market','Central Market Lane',-3210,3010,30)],
    buildings:[stand(2870,-3920,520,365),rect('station-west',2420,-3690,260,200),rect('station-east',3550,-3730,280,190),
      rect('market-facade',-3650,2700,320,195),rect('market-kopitiam',-2950,2770,196,155),rect('market-store',-3590,3260,234,185)],
    roads:[[[1600,-1810],[2240,-1880],[2240,-3020],[3130,-3020],[3130,-3300]],
      [[-1500,1730],[-1810,2140],[-2520,2130],[-2520,3010],[-3210,3010]],
      [[0,-2700],[1510,-2700],[2240,-3020]],[[0,2700],[-1240,2700],[-1720,3010],[-2520,3010]]],
    courts:[court(3130,-3300,550,305),court(-3210,3010,490,270)],
    groves:[]
  },
  perak:{
    sites:[site('tt5','Tanjung Tualang Dredge',3120,-3490,30,true),site('karst-gate','Kinta Karst Gate',-3260,3130,28)],
    buildings:[stand(2820,-3870,600,250),rect('mine-store',3630,-3280,195,170),rect('ridge-shelter',-2990,3330,190,125)],
    waters:[rect('dredge-cut',2590,-4230,1170,330),rect('silt-basin',2825,1870,720,660)],
    rocks:[rect('karst-west-face',-3910,2350,390,1030),rect('karst-east-face',-2810,2600,440,520),rect('northern-limestone',2020,-3550,330,600)],
    roads:[[[1750,-1430],[2390,-1920],[2450,-2840],[3120,-3150],[3120,-3490]],
      [[-1580,1520],[-2340,1660],[-3270,2100],[-3260,3130]],
      [[1850,1480],[2350,2340],[2570,2650],[3550,2740],[3700,2500],[3700,1980],[3890,-2410],[3120,-3150]]],
    courts:[court(3120,-3490,470,240,'earth'),court(-3260,3130,290,250,'earth')],
    groves:[[-3690,3630,5],[2000,-2800,6],[3260,2920,5]]
  },
  penang:{
    sites:[site('chew-jetty','Chew Jetty Landing',2850,3020,0,true),site('armenian','Armenian Street Corner',-3190,-3150,26)],
    buildings:[stand(2650,2695,450,170),rect('jetty-store',1830,2745,200,132),rect('laneway-house-1',-3500,-3490,210,155),rect('laneway-house-2',-3220,-3490,212,158)],
    waters:[rect('long-jetty-tip-sea',2460,-1390,HALF-2460,480),rect('fish-jetty-tip-sea',2670,1250,HALF-2670,460)],
    bridges:[rect('chew-boardwalk',115,2680,3140,600),bridge('jetty-pontoon',2310,1665,360,835,'y')],
    gangway:{...bridge('chew-gangway',2310,2480,360,220,'y'),winch:{x:2520,y:2910},duration:1.8,radius:120},
    roads:[[[109,1480],[-80,2240],[115,3000],[2850,3020]],
      [[-1710,-1460],[-2580,-1840],[-2720,-2240],[-3190,-2500],[-3190,-3150]],
      [[-1520,1680],[-2160,2230],[-1830,2860],[-80,2920],[115,3000]]],
    courts:[court(-3190,-3150,465,220),court(88,3000,265,235,'earth')],
    groves:[[-2100,3130,5],[-3240,-2660,4],[-2850,-3500,4]]
  },
  kedah:{
    sites:[site('muzium-padi','Muzium Padi Forecourt',-3140,-3310,31,true),site('keriang','Gunung Keriang Footpath',3280,3090,28)],
    buildings:[stand(-3490,-3820,660,325),rect('harvest-store',-3580,-3100,185,138),rect('hill-store',2940,2740,170,126)],
    bridges:[bridge('paddy-crossing',-3520,294,455,410,'y')],
    rocks:[rect('keriang-foot',3400,2500,580,930),rect('keriang-ridge',2740,3530,680,420)],
    paddies:[[-730,-930],[670,-820],[-3660,-2190],[-3760,970],[1840,2800],[2540,-3090]],
    roads:[[[-1610,-1550],[-2120,-2200],[-2830,-2450],[-3140,-2860],[-3140,-3310]],
      [[1700,1490],[2160,2050],[2760,2330],[3280,2800],[3280,3090]],
      [[-1650,1610],[-2330,1190],[-3290,710],[-3290,82],[-2830,-620],[-2830,-2450]]],
    courts:[court(-3140,-3310,550,285),court(3280,3090,280,245,'earth')],
    groves:[[-2820,-3200,3],[3340,3650,4],[2210,2960,4]]
  },
  pahang:{
    sites:[site('kuantan-tower','Kuantan 188 Promenade',3160,-3350,28,true),site('nipah-boardwalk','Nipah Canopy Walk',-3260,3160,27)],
    buildings:[stand(3020,-3800,280,278),rect('waterfront-shop',3520,-3540,200,148),rect('nursery-store',-3490,2790,185,126)],
    waters:[rect('canopy-creek',-3910,2420,540,495),rect('headwater-pool',2200,-4100,530,530)],
    bridges:[rect('lower-estuary-bridge',620,2590,1020,500)],
    roads:[[[1840,-1560],[2350,-1930],[2570,-2530],[3160,-2880],[3160,-3350]],
      [[-1680,1610],[-2520,1960],[-2870,2630],[-3260,3160]],
      [[1930,1340],[2060,2330],[1660,2780],[520,2810],[-620,2480],[-2520,1960]]],
    courts:[court(3160,-3350,460,290),court(-3260,3160,410,250,'earth')],
    groves:[[-3630,3370,8],[-2600,3180,10],[2360,-3290,5],[-3760,1980,8]]
  },
  terengganu:{
    sites:[site('pasar-payang','Pasar Payang Courtyard',-3140,-3320,30,true),site('duyong-point','Duyong Outer Slipway',2890,3100,29)],
    buildings:[stand(-3460,-3800,625,295),rect('cloth-store',-2700,-3450,210,130),rect('slipway-hut',2450,2830,170,118)],
    bridges:[rect('outer-slip',1030,2810,2110,570)],
    roads:[[[-1620,-1520],[-2200,-1990],[-2770,-2280],[-3140,-2780],[-3140,-3320]],
      [[1840,1630],[1060,1620],[1040,2390],[1030,3100],[2890,3100]],
      [[-1550,1370],[-2300,1990],[-1410,2740],[110,2900],[1030,3100]]],
    courts:[court(-3140,-3320,535,260),court(910,3060,300,245,'earth')],
    groves:[[-3400,-2770,5],[-1870,2760,6],[640,3350,5]]
  },
  kelantan:{
    sites:[site('kraftangan','Kampung Kraftangan Court',-3200,-3350,30,true),site('layang-ridge','Padang Layang Lookout',3110,3160,0)],
    buildings:[stand(-3510,-3810,610,290),rect('weaving-house',-2790,-3570,190,142),rect('kite-shelter',3310,2850,170,122)],
    bridges:[rect('craft-house-crossing',-3430,-1030,450,790)],
    paddies:[[-3850,1460],[1920,2130],[2520,-2900]],
    wauLookout:{x:2730,y:3020,w:870,h:200,station:{x:2810,y:3120},radius:145,windup:1.2,sweep:1.1,band:140,cooldown:12},
    roads:[[[-1680,-1450],[-2340,-1720],[-2790,-2300],[-3200,-2790],[-3200,-3350]],
      [[1710,1570],[2430,1720],[2420,2580],[3110,3160]],
      [[-1640,1660],[-2670,1060],[-3200,200],[-3200,-1330],[-2790,-2300]]],
    courts:[court(-3200,-3350,520,290),court(3110,3160,520,320,'earth')],
    groves:[[-3690,-3130,5],[-2770,-2860,7],[2750,3540,8],[3650,3550,5]]
  }
};

const meets=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;

function extendBank(w){
  const old=3000;
  const x=w.x===-old?-HALF:w.x,y=w.y===-old?-HALF:w.y;
  const endX=w.x+w.w===old?HALF:w.x+w.w,endY=w.y+w.h===old?HALF:w.y+w.h;
  return {...w,x,y,w:endX-x,h:endY-y};
}

export function cutCrossing(w,b){
  if(!meets(w,b))return [w];
  const x=Math.max(w.x,b.x),y=Math.max(w.y,b.y),right=Math.min(w.x+w.w,b.x+b.w),bottom=Math.min(w.y+w.h,b.y+b.h);
  return [
    rect(w.id+'-a',w.x,w.y,w.w,y-w.y),
    rect(w.id+'-b',w.x,bottom,w.w,w.y+w.h-bottom),
    rect(w.id+'-c',w.x,y,x-w.x,bottom-y),
    rect(w.id+'-d',right,y,w.x+w.w-right,bottom-y)
  ].filter(part=>part.w>0&&part.h>0);
}

export function expandRegion(region){
  const district=districts[region.id];
  const bridges=[...region.bridges,...(district.bridges??[])];
  let waters=[...region.waters.map(extendBank),...(district.waters??[])];
  for(const bridge of district.bridges??[])waters=waters.flatMap(w=>cutCrossing(w,bridge));
  const rocks=[...region.rocks,...(district.rocks??[])];
  const buildings=[...district.buildings,...region.buildings];
  const landmarks=[...region.landmarks,...district.sites];
  const roads=[...region.roads,...district.roads];
  const groves=district.groves.flatMap(([x,y,count])=>Array.from({length:count},(_,i)=>{
    const angle=i*2.4,r=55+65*Math.sqrt(i);
    return {x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r,frame:i%4===0?11:10};
  })).filter(t=>!bridges.some(b=>meets(b,rect('',t.x-52,t.y-52,104,104))));
  const scenery=arrangeRoadsideScenery(region,{roads,buildings,trees:[...region.trees,...groves],landmarks,waters,rocks,
    encounters:region.id==='johor'?Object.values(ENCOUNTERS):[],gangway:district.gangway,wauLookout:district.wauLookout,half:HALF});
  const common=commonGround[region.id];
  const courts=common?[common,...district.courts]:district.courts;
  return {...region,...scenery,bridges,waters,rocks,landmarks,roads,courts,gangway:district.gangway,wauLookout:district.wauLookout,
    paddies:[...region.paddies,...(district.paddies??[])]};
}
