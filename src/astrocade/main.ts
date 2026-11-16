// Astrocade hosts the existing game; combat and rendering stay in their modules.
import Phaser from 'phaser';
import {SurvivalScene} from '../scenes/SurvivalScene';
import {loadStorage} from './storage';

declare global {
  interface Window {
    run: (mode: string)=>Promise<void>;
    lib: {
      getUserGameState: ()=>Promise<{success?: boolean;state: {version?: number;values?: Record<string,string>} | null}>;
      saveUserGameState: (state: object)=>Promise<{success?: boolean}>;
      haptics: {play: (preset: string)=>void};
    };
  }
}

const markup=document.body.innerHTML;
let game: Phaser.Game | undefined;
let generation=0;

async function run(mode: string){
  const current=++generation;
  if(game){
    const old=game;game=undefined;
    await new Promise<void>(resolve=>{old.events.once(Phaser.Core.Events.DESTROY,resolve);old.destroy(true)});
  }
  if(current!==generation)return;
  document.body.innerHTML=markup;
  const start=document.getElementById('start') as HTMLButtonElement;
  start.disabled=true;start.textContent='Preparing expedition…';
  if(mode==='play')await loadStorage();
  if(current!==generation)return;
  class DraftScene extends SurvivalScene {
    create(){
      this.gameplayEnabled=mode!=='edit';
      super.create();
    }
  }
  game=new Phaser.Game({
    type: Phaser.AUTO,parent:'gameHost',width:innerWidth,height:innerHeight,
    backgroundColor:'#071517',scale:{mode:Phaser.Scale.RESIZE},
    render:{antialias:true},audio:{noAudio:true},
    input:{keyboard:false,mouse:false,touch:false},scene:[DraftScene]
  });
  document.addEventListener('click',event=>{
    if(event.target instanceof Element&&event.target.closest('#skills button'))window.lib.haptics.play('tap');
  },{signal:sceneSignal(game)});
}

function sceneSignal(engine: Phaser.Game){
  const controller=new AbortController();
  engine.events.once(Phaser.Core.Events.DESTROY,()=>controller.abort());
  return controller.signal;
}

window.run=run;
