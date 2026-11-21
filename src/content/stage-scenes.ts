export const STAGE_PROPS = {
  pots:0, cart:1, batik:2, cargo:3, pottery:4, ore:5, tea:6, rice:7,
  sampan:8, nets:9, boatRibs:10, rope:11, kites:12, seedlings:13, flowers:14, sign:15
} as const;

type Prop = keyof typeof STAGE_PROPS;
type Placement = readonly [prop:Prop, east:number, south:number, width:number];
type Scene = {
  name:string;
  x:number;
  y:number;
  props:readonly Placement[];
  apron?:readonly [east:number,south:number,width:number,depth:number,surface:'earth'|'timber'];
  flags?:readonly [fromX:number,fromY:number,toX:number,toY:number];
  palette?:readonly number[];
};

// Offsets are relative to each scene's anchor. Leave approaches to caches,
// encounter stations and crossings open and put work areas against the frontage.
export const STAGE_SCENES:Record<string,readonly Scene[]> = {
  johor:[
    {name:'Village tea stall',x:0,y:0,apron:[-408,121,241,153,'earth'],props:[
      ['cart',-342,92,130],['tea',-416,154,101],['pots',-475,97,72],['flowers',-328,176,60],
      ['sign',367,-54,100],['pots',445,-85,65]
    ],flags:[-340,-112,362,-104],palette:[0xcd6658,0xe8b76b,0x80ac92,0xcf8a80]},
    {name:'Rice field store',x:-1500,y:-1100,props:[
      ['rice',-249,-36,106],['rice',-345,-106,78],['cargo',-404,-82,85],['sign',3,210,83]
    ]},
    {name:'Straits Landing',x:3290,y:3190,props:[
      ['nets',165,-57,143],['rope',232,5,75],['cargo',316,-68,100],['sign',-68,139,89]
    ]}
  ],
  melaka:[
    {name:'Red Square pottery stall',x:0,y:0,props:[
      ['cart',-213,-141,143],['pottery',-215,-67,84],['pots',-147,-123,67],['flowers',160,223,82],
      ['flowers',-153,241,88],['sign',210,126,96]
    ],flags:[-222,-177,-129,-196],palette:[0xa85b4f,0xe1a678,0x6d9b87]},
    {name:'Pottery Courtyard kiln frontage',x:-1540,y:1470,apron:[-228,133,227,168,'earth'],props:[
      ['pottery',-167,157,104],['pots',-223,99,86],['pots',-280,53,70],['cargo',-268,150,73],['sign',152,-141,91]
    ]},
    {name:'Stadthuys stair landing',x:-3180,y:-3380,props:[
      ['flowers',-196,205,96],['flowers',191,205,96],['tea',-299,95,98],['pottery',-338,12,78],['sign',246,126,93]
    ]}
  ],
  kl:[
    {name:'Jalan Alor hawker corner',x:0,y:0,props:[
      ['cart',-316,188,128],['tea',-471,194,95],['tea',-602,203,90],['pots',-242,216,68],
      ['cart',337,-219,121],['tea',505,-219,87],['sign',202,-192,85]
    ],flags:[-688,200,-255,204],palette:[0xd38368,0xe6c077,0x92b6b2,0xa690ae]},
    {name:'Central Market frontage',x:-3210,y:3010,props:[
      ['batik',-248,185,138],['pottery',-343,233,94],['cargo',-163,231,89],['cart',175,204,126],['tea',271,208,99]
    ],flags:[-354,156,-124,172],palette:[0x97b49e,0xd58265,0xf3c87f]},
    {name:'Twin Towers approach planters',x:3130,y:-3300,props:[
      ['flowers',-213,471,118],['flowers',213,471,118],['flowers',-271,51,88],['flowers',271,51,88]
    ]}
  ],
  perak:[
    {name:'Dredge Landing ore sorting',x:0,y:0,apron:[-365,-148,254,144,'earth'],props:[
      ['ore',-299,-118,132],['cargo',-396,-102,97],['cargo',-445,-185,80],
      ['ore',326,203,116],['sign',190,183,97]
    ]},
    {name:'Ore Cart Siding tool bench',x:-1580,y:1520,props:[
      ['ore',-144,152,144],['ore',-352,198,101],['cargo',-226,184,87],['sign',155,136,91]
    ]},
    {name:'Kinta Karst Gate shelter',x:-3260,y:3130,props:[
      ['tea',165,174,93],['ore',-187,164,124],['cargo',-242,223,86],['sign',-88,205,96]
    ]}
  ],
  penang:[
    {name:'Waterfront tea and morning catch',x:0,y:0,props:[
      ['cart',-305,-198,143],['tea',-437,6,104],['tea',-350,21,95],['rope',-414,-234,74],
      ['sampan',522,-125,212],['sampan',791,236,181],['sign',-64,222,93]
    ]},
    {name:'Chew Jetty net mending',x:2850,y:3020,props:[
      ['nets',-120,170,138],['rope',-208,172,74],['rope',48,178,77],['pots',218,166,66],['sampan',305,366,210]
    ]},
    {name:'Armenian Street storefront',x:-3190,y:-3150,props:[
      ['batik',-174,173,123],['pottery',-267,222,78],['tea',199,172,107],['cart',291,107,122]
    ],flags:[-262,139,251,148],palette:[0xc66f57,0xe4c587,0x85a5a4]}
  ],
  kedah:[
    {name:'Jelapang rice sorting',x:0,y:0,apron:[-475,-107,269,163,'earth'],props:[
      ['rice',-398,-61,122],['rice',-492,-77,102],['rice',-576,-151,78],
      ['cargo',-488,-134,83],['tea',259,-78,93],['sign',128,209,93]
    ]},
    {name:'Pintu Air maintenance stop',x:1690,y:-1570,props:[
      ['rope',156,117,84],['cargo',242,81,113],['sign',98,-165,99],['rice',-161,-74,90]
    ]},
    {name:'Muzium Padi forecourt',x:-3140,y:-3310,props:[
      ['rice',-244,115,120],['rice',-334,169,103],['pots',-414,105,80],['flowers',191,175,93],['sign',258,67,104]
    ]}
  ],
  pahang:[
    {name:'Pangkalan Nipah landing garden',x:0,y:0,apron:[280,-119,268,129,'earth'],props:[
      ['seedlings',270,-95,137],['seedlings',373,-143,109],['pots',173,-132,69],
      ['sampan',738,-135,207],['rope',363,144,86],['sign',-255,136,95]
    ]},
    {name:'Mangrove Nursery rows',x:-1600,y:-1760,apron:[-233,-132,242,143,'earth'],props:[
      ['seedlings',-168,-102,146],['seedlings',-297,-157,119],['seedlings',-178,167,125],['pots',-253,218,87],['sign',210,48,98]
    ]},
    {name:'Kuantan riverside promenade',x:3160,y:-3350,props:[
      ['flowers',-181,150,110],['flowers',181,150,110],['cart',299,185,130],['tea',385,224,96]
    ]}
  ],
  terengganu:[
    {name:'Duyong boatbuilding yard',x:0,y:0,apron:[-418,-123,305,133,'timber'],props:[
      ['boatRibs',-375,-137,216],['cargo',-487,-92,95],['rope',-326,-57,75],
      ['nets',-143,164,127],['rope',-269,203,75],['sign',231,-121,99]
    ]},
    {name:'Net Drying Field',x:-1550,y:1370,apron:[-357,172,169,168,'earth'],props:[
      ['nets',-118,269,173],['nets',-368,93,144],['rope',-164,339,77],['rope',-382,152,75],['cargo',167,102,92]
    ]},
    {name:'Pasar Payang textile frontage',x:-3140,y:-3320,props:[
      ['batik',-176,132,132],['batik',-310,161,111],['pottery',-261,231,83],['sign',154,164,101],['cart',255,76,133]
    ],flags:[-308,103,-153,100],palette:[0xc57a66,0xe9bf72,0x5d9d97,0x9b7395]}
  ],
  kelantan:[
    {name:'Pasar Wau kite and batik market',x:0,y:0,props:[
      ['batik',116,-144,123],['batik',227,-140,109],['kites',350,-158,134],
      ['cart',-327,-112,118],['tea',-368,94,101],['pots',-428,-124,68],['sign',176,249,93]
    ],flags:[-276,-149,377,-178],palette:[0xc36f6a,0xf2c86b,0x79a39a,0x9b79a4]},
    {name:'Kampung Kraftangan work tables',x:-3200,y:-3350,props:[
      ['batik',-227,127,133],['pottery',-311,181,88],['tea',-343,74,112],['kites',205,125,134],['sign',151,212,94]
    ]},
    {name:'Padang Layang reel staging',x:3110,y:3160,props:[
      ['kites',243,153,142],['kites',377,135,119],['rope',161,183,74],['pots',324,226,70]
    ]}
  ],
  selangor:[
    {name:'Klang Market loading corner',x:0,y:0,apron:[-368,164,207,173,'timber'],props:[
      ['batik',-372,-43,139],['pottery',-274,17,79],['cart',-341,109,132],['tea',-399,213,96],
      ['cargo',244,161,108],['rope',312,208,71],['sampan',628,139,214]
    ],flags:[-334,151,-150,221],palette:[0xb8755c,0xe9bd7a,0x83a890]},
    {name:'Ferry Landing mooring',x:-1680,y:1570,props:[
      ['rope',154,158,91],['nets',246,108,132],['cargo',310,155,90],['sign',-183,169,103]
    ]},
    {name:'Old Quay warehouse loading apron',x:-3170,y:-3230,props:[
      ['cargo',-185,113,132],['cargo',-292,84,109],['cargo',-389,69,90],
      ['rope',198,127,90],['cargo',293,116,104],['sign',226,207,102]
    ]}
  ]
};
