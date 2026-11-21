import {HALF} from './outer-districts.js';

function hill(name,x,y,rx,ry,rise,plateau,angle=0,shape=2){
  return {name,x,y,rx,ry,rise,plateau,shape,sin:Math.sin(angle),cos:Math.cos(angle)};
}

// One landform on a main route, then a second around an outer district.
export const REGIONAL_LANDFORMS={
  johor:[
    hill('Kampung spur',-670,-705,625,610,133,.29,.16),
    hill('Bukit Timbalan',-3180,-3520,860,760,188,.47,0,4)
  ],
  melaka:[
    hill('Red Square terrace',415,-405,625,695,102,.39,0,4),
    hill('Stadthuys hill',-3170,-3520,835,750,191,.43,-.08,4)
  ],
  kl:[
    hill('Monorail embankment',155,-730,865,685,132,.40,0,4),
    hill('Twin Towers podium',3115,-3480,945,745,178,.49,0,6)
  ],
  selangor:[
    hill('Klang market bluff',-615,-465,890,635,107,.29,-.2),
    hill('Old Quay warehouse terrace',-3225,-3410,815,805,155,.42,.07,4)
  ],
  perak:[
    hill('Dredge Landing escarpment',-955,-100,615,605,155,.34,-.34),
    hill('Kinta Karst Gate ridge',-3400,2990,730,1110,221,.40,.12,4)
  ],
  penang:[
    hill('Waterfront rise',-530,-355,665,720,93,.33,.08,4),
    hill('Armenian Street terrace',-3130,-3250,880,675,143,.39,-.12,4)
  ],
  kedah:[
    hill('Jelapang paddy terraces',-870,-575,1000,830,113,.40,.11,4),
    hill('Gunung Keriang foothill',3240,3110,920,905,206,.38,-.16)
  ],
  pahang:[
    hill('Pangkalan Nipah levee',-465,-500,805,900,102,.30,.12),
    hill('Kuantan 188 promenade',3350,-3340,575,725,141,.39,.03,4)
  ],
  terengganu:[
    hill('Cengal yard rise',-490,-460,890,800,112,.31,.16),
    hill('Pasar Payang terrace',-3120,-3480,820,730,156,.44,0,4)
  ],
  kelantan:[
    hill('Pasar Wau flood bank',605,530,985,482,86,.28,.07),
    hill('Padang Layang ridge',3115,3210,985,910,175,.57,.05,4)
  ]
};

// Stair treads follow the approach grade through the formal forecourts.
export const TERRACE_STEPS={
  johor:{x:-3170,start:-3090,end:-2800,width:145,stone:0xe4d4ba,edge:0xf4e4ca},
  melaka:{x:-3180,start:-3150,end:-2805,width:176,stone:0xe5c6b7,edge:0xffe3cc},
  kl:{x:3130,start:-3255,end:-3030,width:225,stone:0xcbd0da,edge:0xe1e8f4},
  selangor:{x:-3170,start:-3010,end:-2720,width:166,stone:0xdac7b9,edge:0xf3ddc8},
  terengganu:{x:-3140,start:-3080,end:-2775,width:133,stone:0xe4d6c6,edge:0xf4e9d6}
};

export function contourPoint(hill,angle,radius=1){
  const scale=value=>Math.sign(value)*Math.abs(value)**(2/hill.shape);
  const u=hill.rx*radius*scale(Math.cos(angle)),v=hill.ry*radius*scale(Math.sin(angle));
  return [hill.x+hill.cos*u-hill.sin*v,hill.y+hill.sin*u+hill.cos*v];
}

export const ELEVATION_SPACING=40;
export const ELEVATION_STRIDE=2*HALF/ELEVATION_SPACING+1;
const SCREEN_RISE=Math.SQRT1_2;
const EDGE_RUN=320;

export function buildElevation(landforms){
  const stride=ELEVATION_STRIDE,spacing=ELEVATION_SPACING;
  const samples=new Float32Array(stride*stride);
  for(let row=1;row<stride-1;row++)for(let col=1;col<stride-1;col++){
    const x=col*spacing-HALF,y=row*spacing-HALF;
    const edge=Math.min(1,(HALF-Math.max(Math.abs(x),Math.abs(y)))/EDGE_RUN);
    for(const {x:cx,y:cy,rx,ry,rise,plateau,shape,cos,sin} of landforms){
      const dx=x-cx,dy=y-cy;
      if(Math.abs(dx)>rx+ry||Math.abs(dy)>rx+ry)continue;
      const u=Math.abs((cos*dx+sin*dy)/rx),v=Math.abs((cos*dy-sin*dx)/ry);
      if(u>=1||v>=1)continue;
      const distance=(u**shape+v**shape)**(1/shape);
      const grade=Math.max(0,Math.min(1,(1-distance)/(1-plateau)));
      const height=rise*grade*grade*(3-2*grade)*edge*edge*(3-2*edge);
      const index=row*stride+col;
      samples[index]=Math.max(samples[index],height);
    }
  }
  const maxHeight=Math.max(...landforms.map(hill=>hill.rise));
  function elevationAt(x,y){
    if(Math.abs(x)>=HALF||Math.abs(y)>=HALF)return 0;
    const gx=(x+HALF)/spacing,gy=(y+HALF)/spacing;
    const col=Math.floor(gx),row=Math.floor(gy);
    const u=gx-col,v=gy-row,i=row*stride+col;
    // Match the diagonal of the triangles in Three.js's PlaneGeometry.
    const right=samples[i+1],bottom=samples[i+stride];
    return u+v<=1?samples[i]*(1-u-v)+right*u+bottom*v:
      samples[i+stride+1]*(u+v-1)+right*(1-v)+bottom*(1-u);
  }
  const projectedDepth=(x,y)=>y-elevationAt(x,y)*SCREEN_RISE;
  function groundY(x,depth){
    if(elevationAt(x,depth)===0)return depth;
    let low=depth,high=depth+maxHeight*SCREEN_RISE;
    for(let i=0;i<11;i++){
      const mid=(low+high)/2;
      if(projectedDepth(x,mid)<depth)low=mid;else high=mid;
    }
    return (low+high)/2;
  }
  return {landforms,samples,elevationAt,projectedDepth,groundY};
}
