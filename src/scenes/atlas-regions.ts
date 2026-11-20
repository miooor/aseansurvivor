import peninsulaHeights from '../../assets/malaya-heights.bin?url';
import peninsulaRelief from '../../assets/malaya-relief.webp';
import borneoHeights from '../../assets/borneo-heights.bin?url';
import borneoRelief from '../../assets/borneo-relief.webp';
import sabahFlag from '../../assets/flags/sabah.svg?no-inline';
import sarawakFlag from '../../assets/flags/sarawak.svg?no-inline';

export interface AtlasRegion {
  name:string;
  west:number;
  north:number;
  focus:[number,number];
  frameWidth:number;
  frameHeight:number;
  heights:string;
  relief:string;
  states:{name:string;lon:number;lat:number;flag:string}[];
}

// Each regional DEM spans 12 degrees in both directions. Positions are WGS84.
export const regionSide=12;
export const atlasRegions:Record<'peninsula'|'borneo',AtlasRegion>={
  peninsula:{
    name:'Peninsular Malaysia',west:96,north:10,focus:[101.9,4.14],
    frameWidth:5.7,frameHeight:7.35,heights:peninsulaHeights,relief:peninsulaRelief,states:[]
  },
  // Mapzen Terrarium z8, masked to Natural Earth's 1:10m land polygons.
  // The 1792px shaded relief and adaptive 1/32° DEM share this geographic extent.
  // https://github.com/tilezen/joerd/blob/master/docs/attribution.md
  borneo:{
    name:'East Malaysia',west:108,north:9,focus:[114.5,3.9],
    frameWidth:10.8,frameHeight:7.6,heights:borneoHeights,relief:borneoRelief,
    // Source artwork: commons.wikimedia.org/wiki/File:Flag_of_Sabah.svg and File:Flag_of_Sarawak.svg.
    states:[
      {name:'Sarawak',lon:113.15,lat:2.65,flag:sarawakFlag},
      {name:'Sabah',lon:116.95,lat:5.35,flag:sabahFlag}
    ]
  }
};

// Cut the coarse world mesh at inset edges so the two surfaces never overlap.
export function worldTerrainPatches(hasPeninsula:boolean){
  const regions=hasPeninsula?Object.values(atlasRegions):[atlasRegions.borneo];
  const rows=new Set([0,260]);
  for(const r of regions){
    rows.add((42-r.north)*4);rows.add((42-r.north+regionSide)*4);
  }
  const edges=[...rows].sort((a,b)=>a-b);
  const patches:{left:number;right:number;top:number;bottom:number;region?:AtlasRegion}[]=[];
  for(let i=1;i<edges.length;i++){
    const top=edges[i-1],bottom=edges[i];
    let left=0;
    for(const region of regions){
      const start=(42-region.north)*4,west=(region.west-75)*4,east=west+regionSide*4;
      if(top<start||bottom>start+regionSide*4)continue;
      if(west>left)patches.push({left,right:west,top,bottom});
      if(region===atlasRegions.borneo)patches.push({left:west,right:east,top,bottom,region});
      left=east;
    }
    patches.push({left,right:300,top,bottom});
  }
  return patches;
}
