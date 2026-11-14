import Phaser from 'phaser';
import { SurvivalScene } from './scenes/SurvivalScene';
import type { GameRuntime } from './game/runtime.js';

declare global {
  interface Window { __asean?: GameRuntime & {scene: SurvivalScene; engine: string} }
}

const start=document.getElementById('start') as HTMLButtonElement;
start.disabled=true;start.textContent='Preparing expedition…';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'gameHost',
  width: innerWidth,
  height: innerHeight,
  backgroundColor: '#071517',
  scale: {mode: Phaser.Scale.RESIZE},
  render: {antialias: true},
  audio: {noAudio: true}, // SkillAudio owns the single Web Audio context.
  input: {keyboard: false,mouse: false,touch: false},
  scene: [SurvivalScene]
});
