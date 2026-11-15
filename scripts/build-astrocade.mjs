import {build} from 'vite';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const assets=JSON.parse(await readFile('astrocade/asset_map.json','utf8'));
const assetUrl=name=>{
  const asset=assets[name];
  assert(asset?.type==='image'&&/^https:\/\/d16qq0o35va7kz\.cloudfront\.net\//.test(asset.url),'Missing Astrocade asset: '+name);
  return asset.url;
};
const out='dist/astrocade';
await build({
  configFile:false,mode:'astrocade',
  plugins:[{
    name:'astrocade-platform',enforce:'pre',
    transform(code,id){
      if(id.endsWith('/src/scenes/SurvivalScene.ts'))return code.replace(
        /new URL\('\.\.\/\.\.\/assets\/([^']+)\.png',import.meta.url\)\.href/g,
        (_,name)=>JSON.stringify(assetUrl(name)));
      if(id.endsWith('/src/game/runtime.js')||id.endsWith('/src/game/skill-audio.js')){
        return "import {platformStorage} from '/src/astrocade/storage.ts';\n"+code.replaceAll('localStorage','platformStorage');
      }
    }
  }],
  build:{outDir:out,emptyOutDir:true,minify:true,lib:{entry:'src/astrocade/main.ts',formats:['iife'],name:'ASEANSurvivor',fileName:()=> 'game.js'}}
});
const styles=(await readFile('ui.css','utf8')).replace(/assets\/([^')]+)\.png/g,(_,name)=>assetUrl(name))+'\n'+await readFile('astrocade/ui.css','utf8');
const html=(await readFile('index.html','utf8'))
  .replace(/<link[^>]+>/g,'')
  .replace('</head>','<style>'+styles+'</style></head>')
  .replace('<script type="module" src="/src/main.ts"></script>','')
  .replace('</body>','<p id="cloudStatus" role="status" hidden></p><script src="./game.js"></script></body>');
await mkdir(out,{recursive:true});
await writeFile(out+'/index.html',html);
await writeFile(out+'/game_config.json','{}\n');
await writeFile(out+'/asset_map.json',JSON.stringify(assets,null,2)+'\n');
await writeFile(out+'/README.md',await readFile('astrocade/README.md','utf8'));
const code=await readFile(out+'/game.js','utf8');
assert(!code.includes('assets/'),'Game must not request local assets');
assert(!code.includes('fonts.googleapis.com'),'Game must not load external fonts');
assert(Buffer.byteLength(code)+Buffer.byteLength(html)<6000000,'Astrocade bundle exceeds 6 MB');
console.log(JSON.stringify({status:'dry-run-ready',directory:out,files:5,assets:Object.keys(assets).length,codeBytes:Buffer.byteLength(code),htmlBytes:Buffer.byteLength(html)}));
