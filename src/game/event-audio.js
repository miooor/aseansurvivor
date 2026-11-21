import {bell,sweep,hit,renderLayers} from './synth.js';

// Minimum seconds between repeats. Frequent pickups are gated much harder so
// a dense wave does not turn into a machine gun of sound.
export const EVENT_GAP={
  coin:.12,ember:.32,levelup:.8,blessing:.4,elite:.6,boss:1,enrage:.8,
  portal:.8,raid:1,victory:1,defeat:1,start:.8,ui:.1,
  danger:.65,exposed:.6,slowdown:.85
};

// Original one-shot cues for gameplay beats beyond the cast sounds.
export const EVENT_SOUNDS={
  coin:[bell(1046,.1,0,.16),bell(1568,.14,.04,.12)],
  ember:[sweep(680,980,.09,0,.12)],
  levelup:[bell(523,.3,0,.16),bell(659,.3,.09,.16),bell(784,.32,.18,.16),bell(1046,.5,.28,.2)],
  blessing:[bell(392,.5,0,.15),bell(523,.5,.06,.14),bell(659,.55,.12,.14)],
  elite:[hit(110,.32,0,.3),bell(330,.4,.08,.16),sweep(180,120,.5,.03,.12)],
  boss:[sweep(70,220,.8,0,.3),hit(90,.7,.12,.35),bell(196,.9,.2,.18)],
  enrage:[hit(150,.18,0,.28),hit(120,.2,.12,.26),sweep(240,900,.45,.05,.22)],
  portal:[sweep(180,1400,.7,0,.24),bell(523,.5,.3,.14),bell(784,.6,.45,.12)],
  raid:[sweep(900,120,.8,0,.26),hit(80,.7,.3,.3),bell(147,.9,.4,.16)],
  victory:[bell(523,.5,0,.18),bell(659,.5,.1,.18),bell(784,.55,.2,.18),bell(1046,1.1,.32,.24)],
  defeat:[sweep(400,90,.9,0,.26),hit(100,.6,.35,.26),bell(196,.9,.3,.16)],
  start:[bell(659,.2,0,.18),bell(880,.35,.12,.2)],
  ui:[bell(1200,.06,0,.12),sweep(900,1400,.06,.02,.08)],
  danger:[hit(210,.09,0,.29),hit(295,.13,.085,.28),sweep(520,1900,.12,.065,.12)],
  slowdown:[sweep(1480,290,.22,0,.24),bell(346,.15,.105,.11)],
  exposed:[bell(680,.15,0,.21),bell(1110,.2,.085,.18)]
};

export const renderEvent=(name,rate=22050)=>renderLayers(EVENT_SOUNDS[name],rate);
