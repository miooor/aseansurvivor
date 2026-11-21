import {circle,crossLane} from './folklore-monsters.js';

const point=(x,y)=>({x,y});
const vertical=Math.PI/2;
const sweep=(x,y,angle,length,width,delay=0)=>crossLane(x,y,angle,length,width,delay);
const post=(type,x,y,name,element,damage,marks,extra={})=>({type,x,y,skill:{
  name,element,damage,range:430,windup:1.1,cooldown:5.5,marks,...extra
}});

export const ROUTE_CHALLENGES={
  johor:{name:'Market Bridge Ambush',entry:point(1050,880),
    advice:'Stay near the edges when the Palm Stalker rakes the middle of the market bridge.',
    posts:[post('stalker',1440,945,'Bridge Rake','physical',12,()=>[sweep(1320,905,0,420,115)])]},
  melaka:{name:'Lanterns on the North Bridge',entry:point(-170,-1290),
    advice:'Cross the north bridge in the gap between successive ember bursts.',
    posts:[post('lantern',-658,-1280,'Quay Embers','fire',11,()=>[
      circle(-370,-1280,71),circle(-508,-1280,81,.55),circle(-645,-1280,71,1.1)
    ],{range:540})]},
  kl:{name:'Jalan Alor Crossfire',entry:point(85,142),
    advice:'Use the first cleared lane to move after the Neon Shade sweeps the market junction.',
    posts:[post('neon',0,-133,'Junction Sweep','lightning',12,()=>[
      sweep(0,4,vertical,480,83),sweep(0,4,0,460,105,.64)
    ])]},
  perak:{name:'Fault at the Dredge',entry:point(-46,60),
    advice:'Move out of the first shockwave, then step in before the outer ring lands.',
    posts:[post('sentinel',-375,93,'Limestone Fault','physical',15,()=>[
      circle(-365,72,84),circle(-365,72,177,.68,89)
    ])]},
  penang:{name:'Long Jetty Undertow',entry:point(443,-1055),
    advice:'Wait out the Jetty Drifter’s sweep or take the lower boardwalk around it.',
    posts:[post('drifter',916,-1025,'Deck Undertow','water',14,()=>[
      sweep(750,-1151,vertical,478,150)
    ],{range:520})]},
  kedah:{name:'East Sluice Crossfire',entry:point(1475,215),
    advice:'Slow water floods the middle of the east crossing. Watch for the Paddy Watcher’s shot on the eastern flank.',
    posts:[
      post('bakauBelangkas',1380,442,'Sluice Flood','water',0,()=>[
        circle(1480,425,109),circle(1480,550,109)
      ],{brine:4,cooldown:6.5}),
      post('watcher',1630,648,'Bund Volley','fire',13,()=>[sweep(1660,475,vertical,345,67)],{range:510})
    ]},
  pahang:{name:'Roots on the South Boardwalk',entry:point(474,1281),
    advice:'Keep moving along the south boardwalk as roots rise one patch at a time.',
    posts:[post('nipah',792,1330,'Boardwalk Roots','physical',13,()=>[
      circle(660,1325,86),circle(807,1245,83,.55),circle(954,1325,86,1.1)
    ],{status:'snare'})]},
  terengganu:{name:'Duyong Slipway Surge',entry:point(680,-1197),
    advice:'Thread the gap between the Slipway Crab’s foam lanes or cross after the first recedes.',
    posts:[post('foam',1000,-1190,'Twin Tides','water',13,()=>[
      sweep(914,-1285,0,455,108),sweep(914,-1090,0,455,108,.54)
    ])]},
  kelantan:{name:'Gusts on the Raised Road',entry:point(-1590,-215),
    advice:'Switch sides on the west raised road as the Wau Wisp sweeps each half in turn.',
    posts:[post('kite',-1710,-638,'Crosswind','spirit',14,()=>[
      sweep(-1815,-492,vertical,440,169),sweep(-1579,-492,vertical,440,169,.73)
    ],{range:540})]},
  selangor:{name:'Klang Market Crossing',entry:point(345,-1482),
    advice:'Step off the Mooring Wraith’s rope line, then watch the delayed sweep across the landing.',
    posts:[post('mooring',720,-1480,'Mooring Sweep','water',13,()=>[
      sweep(585,-1480,0,495,65),sweep(640,-1480,vertical,370,66,.72)
    ])]}
};
