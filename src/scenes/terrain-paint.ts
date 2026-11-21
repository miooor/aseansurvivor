import * as THREE from 'three';

type TerrainLook = {
  ground:readonly [string,string,string];
  path:string;
  paving:string;
  shoulder:string;
};

export const TERRAIN_LOOKS:Record<string,TerrainLook> = {
  johor:{ground:['grove-grass','kampung-earth','leaf-litter'],path:'kampung-earth',paving:'street-flagstone',shoulder:'river-pebbles'},
  melaka:{ground:['klang-laterite','coastal-sand','karst-gravel'],path:'klang-laterite',paving:'melaka-brick',shoulder:'klang-gravel'},
  kl:{ground:['street-concrete','street-flagstone','street-asphalt'],path:'street-asphalt',paving:'street-concrete',shoulder:'street-flagstone'},
  perak:{ground:['grove-grass','field-silt','karst-gravel'],path:'field-silt',paving:'street-flagstone',shoulder:'karst-gravel'},
  penang:{ground:['shell-grit','coastal-sand','tidal-mud'],path:'coastal-sand',paving:'street-flagstone',shoulder:'shell-grit'},
  kedah:{ground:['rice-stubble','field-silt','floodplain-sedge'],path:'field-silt',paving:'stone-paving',shoulder:'rice-stubble'},
  pahang:{ground:['floodplain-sedge','tidal-mud','river-pebbles'],path:'kampung-earth',paving:'stone-paving',shoulder:'river-pebbles'},
  terengganu:{ground:['coastal-sand','tidal-mud','shell-grit'],path:'coastal-sand',paving:'street-flagstone',shoulder:'river-pebbles'},
  kelantan:{ground:['floodplain-sedge','field-silt','rice-stubble'],path:'field-silt',paving:'melaka-brick',shoulder:'floodplain-sedge'},
  selangor:{ground:['klang-grass','klang-laterite','klang-gravel'],path:'klang-laterite',paving:'klang-brick',shoulder:'klang-gravel'}
};

export const TERRAIN_TEXTURES=new Set(['ground-detail','harbour-timber',
  ...Object.values(TERRAIN_LOOKS).flatMap(({ground,path,paving,shoulder})=>[...ground,path,paving,shoulder])
]);

// Preserve hard joints in the patterned swatches. Natural swatches have blended repeat seams.
export const MIRRORED_TERRAIN=new Set([
  'ground-detail','harbour-timber','street-concrete','street-flagstone','melaka-brick','stone-paving','klang-brick'
]);

export function groundMaterial(map:THREE.Texture, [base,soil,accent]:readonly THREE.Texture[]){
  const material=new THREE.MeshBasicMaterial({map});
  material.onBeforeCompile=shader=>{
    shader.uniforms.basePaint={value:base};
    shader.uniforms.soilPaint={value:soil};
    shader.uniforms.accentPaint={value:accent};
    shader.vertexShader='varying vec3 terrainPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      terrainPoint=(modelMatrix*vec4(position,1.)).xyz;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_pars_fragment>',`
      #include <map_pars_fragment>
      uniform sampler2D basePaint, soilPaint, accentPaint;
      varying vec3 terrainPoint;

      float groundHash(vec2 p) {
        vec3 h = fract(vec3(p.xyx) * .1031);
        h += dot(h, h.yzx + 33.33);
        return fract((h.x + h.y) * h.z);
      }
      float groundNoise(vec2 p) {
        vec2 cell = floor(p);
        vec2 f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(mix(groundHash(cell), groundHash(cell + vec2(1., 0.)), f.x),
                   mix(groundHash(cell + vec2(0., 1.)), groundHash(cell + 1.), f.x), f.y);
      }
    `).replace('#include <map_fragment>',`
      vec2 uv = vMapUv;
      // Independent scales and orientations break up repeated clumps and stones.
      vec3 detail = texture2D(map, uv).rgb;
      vec3 offsetDetail = texture2D(map, vec2(-uv.y, uv.x) * 1.73 + .3).rgb;
      float soilMask = groundNoise(uv * .63 + 8.1) * .44 + groundNoise(uv * 1.94 + 6.) * .56;
      float accentMask = groundNoise(uv * 1.17 + 43.) * .69 + groundNoise(uv * 3.9) * .31;
      vec3 baseColor = texture2D(basePaint, uv * 1.3).rgb * (.86 + .30 * offsetDetail.r);
      vec3 soilColor = texture2D(soilPaint, uv + .23).rgb * (.86 + .30 * offsetDetail.g);
      vec3 accent = texture2D(accentPaint, vec2(uv.y, -uv.x) * 1.39 + .61).rgb;
      // Let the high-resolution detail break up transitions at the material edges.
      float exposedSoil = smoothstep(.46, .60, soilMask + (detail.r - .5) * .32);
      float exposedAccent = smoothstep(.63, .81, accentMask + (detail.b - .5) * .25);
      vec3 ground = mix(baseColor, soilColor, exposedSoil);
      vec3 normal = normalize(cross(dFdx(terrainPoint), dFdy(terrainPoint)));
      float slope = 1. - normal.y;
      float light = dot(normal, normalize(vec3(-.5, .7, -.9)));
      vec3 paint = mix(ground, accent, max(exposedAccent, smoothstep(.035,.20,slope)*.68));
      diffuseColor.rgb *= paint * clamp(1. + (light - .562)*.92, .57, 1.27);
    `);
  };
  return material;
}

function fade(geometry:THREE.BufferGeometry,sample:(x:number,y:number)=>number){
  const pos=geometry.getAttribute('position');
  const ink=new Float32Array(pos.count*4);
  for(let i=0;i<pos.count;i++){
    ink[i*4]=ink[i*4+1]=ink[i*4+2]=1;
    ink[i*4+3]=sample(pos.getX(i),pos.getY(i));
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(ink,4));
  return geometry;
}

export function paintedTrail(length:number,width:number,edge=.78){
  const strip=new THREE.PlaneGeometry(length,width,Math.ceil(length/28),8);
  const pos=strip.getAttribute('position');
  for(let i=0;i<pos.count;i++){
    const y=pos.getY(i);
    if(Math.abs(y)<width/2)pos.setY(i,y*edge*4/3);
  }
  return fade(strip,(_x,y)=>Math.abs(y)>=width/2-.001?0:1);
}

export function paintedClearing(width:number,depth:number){
  const surface=new THREE.RingGeometry(0,1,40,6);
  return fade(surface,(x,y)=>1-THREE.MathUtils.smoothstep(Math.hypot(x,y),.82,1)).scale(width,depth,1);
}

export function paintedApron(width:number,depth:number){
  const apron=new THREE.PlaneGeometry(width,depth,Math.max(8,Math.ceil(width/32)),Math.max(8,Math.ceil(depth/32)));
  return fade(apron,(x,y)=>{
    const corner=Math.hypot(Math.max(Math.abs(x)*2/width-.72,0),Math.max(Math.abs(y)*2/depth-.72,0));
    return 1-THREE.MathUtils.smoothstep(corner,.09,.28);
  });
}
