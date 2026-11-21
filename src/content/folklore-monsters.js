// Each cast locks in these ground shapes when its tell starts.
/** @typedef {{kind:'circle',x:number,y:number,r:number,inner:number,delay:number,fired?:boolean}} CircleMark */
/** @typedef {{kind:'lane',x:number,y:number,dx:number,dy:number,length:number,width:number,delay:number,color?:number,fired?:boolean}} LaneMark */
/** @typedef {{kind:'polygon',x:number,y:number,points:{x:number,y:number}[],delay:number,color?:number,fired?:boolean}} PolygonMark */
/** @typedef {CircleMark|LaneMark|PolygonMark} FolkloreMark */

/** @returns {CircleMark} */
export const circle=(x,y,r,delay=0,inner=0)=>({kind:'circle',x,y,r,inner,delay});
/** @returns {LaneMark} */
export const lane=(x,y,angle,length,width,{delay=0,color=undefined}={})=>({kind:'lane',x,y,dx:Math.cos(angle),dy:Math.sin(angle),length,width,delay,color});

/** @returns {LaneMark} */
export const crossLane=(x,y,angle,length,width,delay=0)=>lane(
  x-Math.cos(angle)*length/2,y-Math.sin(angle)*length/2,angle,length,width,{delay}
);

// Vertices follow the outline of a convex shape in forward/sideways coordinates.
/** @returns {PolygonMark} */
export const polygon=({x,y},angle,vertices,delay=0,color=undefined)=>{
  const dx=Math.cos(angle),dy=Math.sin(angle);
  const points=vertices.map(([forward,side])=>({x:x+dx*forward-dy*side,y:y+dy*forward+dx*side}));
  return {kind:'polygon',x,y,points,delay,color};
};

export const FOLKLORE_ATLAS='malaysia-folklore';
export const FOLKLORE_COMPANION_ATLAS='malaysia-folklore-companion';
export const FOLKLORE_THIRD_ATLAS='malaysia-folklore-third';
export const FOLKLORE_FOURTH_ATLAS='malaysia-folklore-fourth';
export const FOLKLORE_IMPACT=.28;
export const BUNIAN_WAYFARER={
  x:-1095,y:1015,frame:9,name:'Orang bunian wayfarer',
  lines:[
    'Peace, traveller. Few of your kind can see me. The night must have opened your eyes.',
    'The ghosts grow bold when a road is empty. Keep moving and they cannot pin you down.',
    'Follow this road northeast to the village clearing.',
    'Do not come looking for our village afterwards. It is only there for those we invite.'
  ]
};

export const FOLKLORE_GHOSTS={
  ledangGlint:{name:'Ledang Glint',frame:0,size:94,hp:52,spd:74,r:17,dmg:8,xp:5,
    hint:'Stay between the gold and silver lanes.',folklore:{range:255,windup:.85,damage:12,color:0xffcb77,
      marks:(e,p,a)=>[-52,52].map(offset=>lane(e.x-Math.sin(a)*offset,e.y+Math.cos(a)*offset,a,290,32,{color:offset>0?0xe0eef8:0xffcb77}))}},
  quayPelanduk:{name:'Quay Pelanduk',frame:1,size:73,hp:48,spd:108,r:15,dmg:8,xp:5,
    hint:'Step sideways when it lines up a quick kick.',folklore:{range:135,windup:.55,damage:13,color:0xcde394,
      marks:(e,p,a)=>[lane(e.x,e.y,a,150,50)]}},
  monorailGalah:{name:'Monorail Galah',frame:2,size:123,hp:74,spd:67,r:20,dmg:10,xp:6,
    hint:'Move inside its reach or beyond the sweep.',folklore:{range:160,windup:.9,damage:14,color:0xe8a5ff,
      marks:e=>[circle(e.x,e.y,176,0,82)]}},
  tinGajah:{name:'Tin Basin Gajah',frame:3,size:124,hp:135,spd:47,r:25,dmg:14,xp:8,
    hint:'Clear the stomp circle before it lands.',folklore:{range:104,windup:1.05,damage:17,color:0xffc598,
      marks:e=>[circle(e.x,e.y,128)]}},
  jettyTideback:{name:'Jetty Tideback',frame:4,size:103,hp:78,spd:62,r:19,dmg:10,xp:6,
    hint:'Leave the splash, then watch for the outer surge.',folklore:{range:230,windup:.88,damage:12,color:0x9ae6ff,
      marks:(e,p)=>[circle(p.x,p.y,56),circle(p.x,p.y,126,.5,64)]}},
  sawahFang:{name:'Sawah Fang',frame:5,size:100,hp:88,spd:78,r:19,dmg:11,xp:7,
    hint:'The fangs fork outward. Keep between them or move wide.',folklore:{range:185,windup:.72,damage:15,color:0xeed492,
      marks:(e,p,a)=>[-.50,.50].map(offset=>lane(e.x+Math.cos(a+offset)*36,e.y+Math.sin(a+offset)*36,a+offset,178,37))}},
  chiniWake:{name:'Chini Wake',frame:6,size:109,hp:74,spd:58,r:20,dmg:10,xp:6,
    hint:'Dodge across the wake as the marks break in order.',folklore:{range:290,windup:.85,damage:13,color:0x8cf6ba,
      marks:(e,p,a)=>[110,225,340].map((reach,i)=>circle(e.x+Math.cos(a)*reach,e.y+Math.sin(a)*reach,48,i*.32))}},
  cengalProw:{name:'Cengal Prow',frame:7,size:104,hp:88,spd:66,r:20,dmg:11,xp:7,
    hint:'Step forward or back to clear the broadside.',folklore:{range:190,windup:.83,damage:15,color:0xf8c17f,
      marks:(e,p,a)=>[lane(p.x+Math.sin(a)*150,p.y-Math.cos(a)*150,a+Math.PI/2,300,72)]}},
  floodplainKijang:{name:'Floodplain Kijang',frame:8,size:96,hp:76,spd:111,r:17,dmg:10,xp:6,
    hint:'Let the two hoof strikes land to either side of you.',folklore:{range:180,windup:.72,damage:14,color:0xffd783,
      marks:(e,p,a)=>[-68,68].map((offset,i)=>circle(p.x-Math.sin(a)*offset,p.y+Math.cos(a)*offset,43,i*.22))}},
  kukupClaw:{name:'Kukup Claw',atlas:FOLKLORE_COMPANION_ATLAS,frame:0,size:104,hp:71,spd:68,r:21,dmg:9,xp:6,
    hint:'After the first snap, stay clear of the claw closer to the crab.',folklore:{range:182,windup:.85,damage:13,color:0xffaf72,
      marks:(e,p,a)=>[circle(p.x,p.y,48),circle(p.x-Math.cos(a)*74,p.y-Math.sin(a)*74,45,.42)]}},
  quaysideSamambu:{name:'Quayside Samambu',atlas:FOLKLORE_COMPANION_ATLAS,frame:1,size:96,hp:66,spd:86,r:17,dmg:9,xp:6,
    hint:'The lash zigzags in three beats. Move wide of the weave.',folklore:{range:206,windup:.8,damage:13,color:0xffbc90,
      marks:(e,p,a)=>{
        let x=e.x+Math.cos(a)*36,y=e.y+Math.sin(a)*36;
        return [.64,-.64,.64].map((turn,i)=>{
          const mark=lane(x,y,a+turn,83,32,{delay:i*.34});
          x+=mark.dx*mark.length;
          y+=mark.dy*mark.length;
          return mark;
        });
      }}},
  nightDrongo:{name:'Night Drongo',atlas:FOLKLORE_COMPANION_ATLAS,frame:2,size:109,hp:68,spd:91,r:17,dmg:9,xp:6,
    hint:'Two wing strikes cross in succession. Dodge diagonally.',folklore:{range:230,windup:.9,damage:14,color:0xf6a7f4,
      marks:(e,p,a)=>[crossLane(p.x,p.y,a,244,38),crossLane(p.x,p.y,a+Math.PI/2,222,38,.56)]}},
  gerikGnaw:{name:'Gerik Gnaw',atlas:FOLKLORE_COMPANION_ATLAS,frame:3,size:96,hp:80,spd:89,r:19,dmg:10,xp:6,
    hint:'Get well to the side of the tunnel before its far end bursts.',folklore:{range:205,windup:.77,damage:14,color:0xd3de85,
      marks:(e,p,a)=>[lane(e.x,e.y,a,205,36),circle(e.x+Math.cos(a)*205,e.y+Math.sin(a)*205,65,.46)]}},
  telagaGoldJar:{name:'Telaga Gold Jar',atlas:FOLKLORE_COMPANION_ATLAS,frame:4,size:104,hp:82,spd:56,r:20,dmg:9,xp:7,
    hint:'Wait in the pocket, then move into the spent ring.',folklore:{range:215,windup:.89,damage:14,color:0xffd88b,
      marks:(e,p)=>[circle(p.x,p.y,120,0,70),circle(p.x,p.y,53,.66)]}},
  sevenWellsShard:{name:'Seven Wells Shard',atlas:FOLKLORE_COMPANION_ATLAS,frame:5,size:107,hp:79,spd:65,r:19,dmg:10,xp:6,
    hint:'Leave the center pool through a gap between the six outer pools.',folklore:{range:218,windup:.9,damage:14,color:0xa6f3f2,
      marks:(e,p,a)=>[circle(p.x,p.y,46),...Array.from({length:6},(_,i)=>{
        const angle=a+i*Math.PI/3;
        return circle(p.x+Math.cos(angle)*109,p.y+Math.sin(angle)*109,32,.44);
      })]}},
  gelanggiRampart:{name:'Gelanggi Rampart',atlas:FOLKLORE_COMPANION_ATLAS,frame:6,size:116,hp:91,spd:62,r:22,dmg:10,xp:7,
    hint:'Retreat through the open end of the walls before the middle closes.',folklore:{range:204,windup:.96,damage:15,color:0xd8b9f3,
      marks:(e,p,a)=>{
        const dx=Math.cos(a),dy=Math.sin(a),x=p.x-dx*80,y=p.y-dy*80;
        return [
          crossLane(x,y,a+Math.PI/2,164,28),
          ...[-82,82].map(side=>lane(x-dy*side,y+dx*side,a,160,28,{delay:.24})),
          lane(x,y,a,110,48,{delay:.55})
        ];
      }}},
  mayangDrift:{name:'Mayang Drift',atlas:FOLKLORE_COMPANION_ATLAS,frame:7,size:102,hp:76,spd:76,r:18,dmg:10,xp:6,
    hint:'The bands sweep outward. Step back into the first band after it hits.',folklore:{range:184,windup:.87,damage:14,color:0xffc592,
      marks:(e,p,a)=>[-85,0,85].map((offset,i)=>crossLane(
        p.x+Math.cos(a)*offset,p.y+Math.sin(a)*offset,a+Math.PI/2,222,48,i*.4
      ))}},
  marakCrockery:{name:'Marak Crockery',atlas:FOLKLORE_COMPANION_ATLAS,frame:8,size:96,hp:75,spd:79,r:18,dmg:9,xp:6,
    hint:'Step sideways from the bowl. The plates follow ahead and behind.',folklore:{range:211,windup:.82,damage:14,color:0xb3edf4,
      marks:(e,p,a)=>[circle(p.x,p.y,53),...[-84,84].map((offset,i)=>crossLane(
        p.x+Math.cos(a)*offset,p.y+Math.sin(a)*offset,a+Math.PI/2,188,36,.32+i*.24
      ))]}},
  endauEagle:{name:'Endau Eagle',atlas:FOLKLORE_THIRD_ATLAS,frame:0,size:111,hp:74,spd:93,r:18,dmg:10,xp:6,
    hint:'Break sideways across the diving wedge.',folklore:{range:238,windup:.93,damage:14,color:0xffbe7a,
      marks:(e,p,a)=>[polygon(p,a,[[-116,-48],[94,0],[-116,48]])]}},
  rebanaEcho:{name:'Rebana Echo',atlas:FOLKLORE_THIRD_ATLAS,frame:1,size:92,hp:79,spd:68,r:18,dmg:9,xp:6,
    hint:'The drum strikes alternating tiles. Move into a spent tile after the first beat, or clear the grid.',folklore:{range:210,windup:1.05,damage:13,color:0xffc4b6,
      marks:(e,p,a)=>[-1,0,1].flatMap(row=>[-1,0,1].map(col=>{
        const x=row*78,y=col*78,delay=(row+col)%2?.65:0;
        return polygon(p,a,[[x-28,y-28],[x+28,y-28],[x+28,y+28],[x-28,y+28]],delay);
      }))}},
  nanasBramble:{name:'Nanas Bramble',atlas:FOLKLORE_THIRD_ATLAS,frame:2,size:102,hp:88,spd:67,r:20,dmg:10,xp:7,
    hint:'The hedge closes from both sides. Back out before the middle fills.',folklore:{range:206,windup:.88,damage:14,color:0xe2ef85,
      marks:(e,p,a)=>[
        polygon(p,a,[[40,-103],[-108,-101],[-76,-29],[32,-50]]),
        polygon(p,a,[[32,50],[-76,29],[-108,101],[40,103]]),
        polygon(p,a,[[47,-24],[-65,-36],[-112,0],[-65,36],[47,24]],.55)
      ]}},
  lenggongSnag:{name:'Lenggong Snag',atlas:FOLKLORE_THIRD_ATLAS,frame:3,size:117,hp:92,spd:59,r:22,dmg:11,xp:7,
    hint:'The snag falls along its trunk first, then tips to one side. Move to the other side.',folklore:{range:218,windup:.93,damage:15,color:0xe6cb9c,
      marks:(e,p,a)=>[lane(e.x,e.y,a,248,47),lane(e.x,e.y,a-.55,242,55,{delay:.53})]}},
  batuMaungPrint:{name:'Batu Maung Print',atlas:FOLKLORE_THIRD_ATLAS,frame:4,size:106,hp:84,spd:64,r:20,dmg:10,xp:7,
    hint:'Sidestep the heel. The wider toe strike lands farther ahead.',folklore:{range:209,windup:.93,damage:14,color:0xb8e8ff,
      marks:(e,p,a)=>[
        polygon(p,a,[[-58,-23],[8,-32],[29,-14],[29,20],[-58,24]]),
        polygon(p,a,[[37,-45],[94,-53],[117,-17],[109,45],[48,38]],.54)
      ]}},
  padiEmber:{name:'Padi Ember',atlas:FOLKLORE_THIRD_ATLAS,frame:5,size:104,hp:78,spd:81,r:18,dmg:10,xp:6,
    hint:'Embers scatter across three slanted rows. Cut short across their path.',folklore:{range:217,windup:.91,damage:13,color:0xffaa69,
      marks:(e,p,a)=>[-82,0,82].map((reach,i)=>polygon(
        p,a,[[reach-28,-55],[reach+19,-53],[reach+36,53],[reach-10,53]],i*.32
      ))}},
  whitewaterCroc:{name:'Whitewater Croc',atlas:FOLKLORE_THIRD_ATLAS,frame:6,size:116,hp:91,spd:74,r:22,dmg:11,xp:7,
    hint:'Run straight away from the closing jaws. Their tips stop short.',folklore:{range:223,windup:.97,damage:15,color:0xbaf8eb,
      marks:(e,p,a)=>[
        polygon(p,a,[[-98,-62],[-48,-57],[37,-8],[-51,-17]]),
        polygon(p,a,[[-98,62],[-51,17],[37,8],[-48,57]]),
        polygon(p,a,[[-42,-20],[18,-34],[61,0],[18,34],[-42,20]],.48)
      ]}},
  songketMoth:{name:'Songket Moth',atlas:FOLKLORE_THIRD_ATLAS,frame:7,size:111,hp:78,spd:78,r:18,dmg:10,xp:6,
    hint:'The two pointed wings strike across your path. Move clear past a wingtip.',folklore:{range:226,windup:1.03,damage:14,color:0xffabd2,
      marks:(e,p,a)=>[
        polygon(p,a,[[-58,-89],[55,-89],[18,66]]),
        polygon(p,a,[[-86,-46],[7,78],[-67,78]],.57,0xffd58b)
      ]}},
  beringinShadow:{name:'Beringin Shadow',atlas:FOLKLORE_THIRD_ATLAS,frame:8,size:116,hp:88,spd:71,r:20,dmg:10,xp:7,
    hint:'Clear the trunk shadow, then keep off the two branching roots.',folklore:{range:219,windup:.92,damage:14,color:0xddb8ff,
      marks:(e,p,a)=>[
        lane(e.x,e.y,a,195,44),
        ...[-1,1].map(side=>polygon(p,a,[[4,side*19],[100,side*88],[72,side*34],[12,side*3]],.52))
      ]}},
  wovenSteed:{name:'Woven Steed',atlas:FOLKLORE_FOURTH_ATLAS,frame:0,size:110,hp:82,spd:89,r:19,dmg:10,xp:7,
    hint:'Hooves land across your path. Run straight past their row.',folklore:{range:202,windup:.87,damage:14,color:0xf5d280,
      marks:(e,p,a)=>[-86,0,86].map((side,i)=>{
        const forward=side*.35;
        return circle(p.x+Math.cos(a)*forward-Math.sin(a)*side,p.y+Math.sin(a)*forward+Math.cos(a)*side,34,i*.38);
      })}},
  lacquerClogs:{name:'Lacquer Clogs',atlas:FOLKLORE_FOURTH_ATLAS,frame:1,size:103,hp:77,spd:85,r:18,dmg:10,xp:6,
    hint:'The long sole stamps first. Run ahead and leave the heel behind you.',folklore:{range:215,windup:.93,damage:14,color:0xffb594,
      marks:(e,p,a)=>[
        polygon(p,a,[[-25,-105],[38,-105],[49,-71],[20,29],[-22,26],[-37,-69]]),
        polygon(p,a,[[-98,34],[-35,32],[-27,78],[-48,91],[-95,85]],.56)
      ]}},
  crossStreetPewter:{name:'Cross Street Pewter',atlas:FOLKLORE_FOURTH_ATLAS,frame:2,size:114,hp:85,spd:69,r:19,dmg:10,xp:7,
    hint:'Two streams meet and spill ahead. Step across either stream to get clear.',folklore:{range:220,windup:1.03,damage:15,color:0xe9c7ff,
      marks:(e,p,a)=>[
        polygon(p,a,[[-118,-92],[-108,-59],[18,13],[-5,-22]]),
        polygon(p,a,[[-118,92],[-5,22],[18,-13],[-108,59]]),
        circle(p.x+Math.cos(a)*70,p.y+Math.sin(a)*70,39,.52)
      ]}},
  sayongSpill:{name:'Sayong Spill',atlas:FOLKLORE_FOURTH_ATLAS,frame:3,size:105,hp:91,spd:60,r:20,dmg:11,xp:7,
    hint:'Leave the spill on its shallow side. The runoff spreads to one side only.',folklore:{range:211,windup:.92,damage:14,color:0x9be8ff,
      marks:(e,p,a)=>[
        polygon(p,a,[[-83,-23],[21,-29],[49,13],[30,56],[-43,42]]),
        polygon(p,a,[[20,26],[88,17],[122,52],[90,81],[47,74]],.54)
      ]}},
  jettyBanner:{name:'Jetty Banner',atlas:FOLKLORE_FOURTH_ATLAS,frame:4,size:123,hp:78,spd:73,r:18,dmg:10,xp:6,
    hint:'Slip toward the narrow edge of the cloth. The pole falls along the middle.',folklore:{range:225,windup:1,damage:14,color:0xffcc7c,
      marks:(e,p,a)=>[
        polygon(p,a,[[-94,-30],[43,-81],[78,-18],[50,38],[-94,25]]),
        polygon(p,a,[[-104,-13],[154,-13],[154,13],[-104,13]],.54,0xaff5ef)
      ]}},
  twinPeaks:{name:'Twin Peaks',atlas:FOLKLORE_FOURTH_ATLAS,frame:5,size:121,hp:98,spd:55,r:22,dmg:11,xp:8,
    hint:'The peaks lean across the pass. Run up or down the gap before the rocks fall.',folklore:{range:218,windup:.98,damage:15,color:0xebbeff,
      marks:(e,p,a)=>[
        polygon(p,a,[[-138,-66],[-40,-48],[-44,60],[-104,85]]),
        polygon(p,a,[[38,-50],[144,-72],[112,84],[47,51]]),
        polygon(p,a,[[-17,-39],[17,-38],[38,4],[14,48],[-20,44],[-34,3]],.55)
      ]}},
  candlenutRicochet:{name:'Candlenut Ricochet',atlas:FOLKLORE_FOURTH_ATLAS,frame:6,size:96,hp:82,spd:95,r:18,dmg:10,xp:6,
    hint:'The nut skips away in a zigzag. Step to the side of the first bounce and let it pass.',folklore:{range:212,windup:.9,damage:14,color:0xffd998,
      marks:(e,p,a)=>[[0,0,0],[57,-69,.39],[105,28,.78]].map(([forward,side,delay])=>circle(
        p.x+Math.cos(a)*forward-Math.sin(a)*side,p.y+Math.sin(a)*forward+Math.cos(a)*side,32,delay
      ))}},
  brassFoilfish:{name:'Brass Foilfish',atlas:FOLKLORE_FOURTH_ATLAS,frame:7,size:119,hp:90,spd:76,r:19,dmg:10,xp:7,
    hint:'The tail curls around you. Slip out through the open side toward the fish.',folklore:{range:217,windup:1,damage:15,color:0xffbd83,
      marks:(e,p,a)=>[
        polygon(p,a,[[-71,-53],[-38,-84],[49,-54],[21,-29]]),
        polygon(p,a,[[-26,-28],[49,-54],[72,0],[50,57],[-25,28]]),
        polygon(p,a,[[-71,57],[21,29],[50,57],[-38,86]])
      ]}},
  merbauSpinner:{name:'Merbau Spinner',atlas:FOLKLORE_FOURTH_ATLAS,frame:8,size:103,hp:86,spd:81,r:19,dmg:10,xp:7,
    hint:'Three slices spin around a fixed pivot. Leave through the unmarked quarter.',folklore:{range:216,windup:.98,damage:14,color:0xaaefbc,
      marks:(e,p,a)=>{
        const pivot={x:p.x-Math.cos(a)*54,y:p.y-Math.sin(a)*54};
        return [0,1,2].map(i=>polygon(
          pivot,a+i*Math.PI/2,[[21,-14],[112,-76],[129,0],[112,76],[21,14]],i*.46
        ));
      }}}
};
