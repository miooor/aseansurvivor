import {REVISION} from 'three';
import {SurvivalScene} from './scenes/SurvivalScene';
import {SpriteAssets} from './scenes/SpriteAssets';
import type {GameRuntime} from './game/runtime.js';

declare global {
  interface Window { __asean?: GameRuntime & {scene:SurvivalScene;engine:string} }
}

const patchNotes = document.querySelector<HTMLDialogElement>('#patchNotes')!;
const latestPatch = patchNotes.querySelector('time')!;
document.getElementById('lastUpdated')!.textContent = 'Updated ' + latestPatch.textContent;
document.getElementById('openPatchNotes')!.addEventListener('click', () => patchNotes.showModal());

const start=document.getElementById('start') as HTMLButtonElement;
start.disabled=true;start.textContent='Preparing expedition…';

async function boot(){
  const assets=new SpriteAssets();
  try{await assets.boot()}
  catch{start.textContent='Artwork failed to load. Reload to retry.';return}
  let scene:SurvivalScene;
  try{scene=new SurvivalScene(document.getElementById('gameHost')!,assets)}
  catch(error){console.error(error);start.textContent='This expedition requires WebGL 2.';return}
  scene.start();
  if(import.meta.env.DEV)window.__asean=Object.assign(scene.runtime,{scene,engine:'Three.js r'+REVISION});
}

void boot();
