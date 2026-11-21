export const JOHOR_PURSUE_AT=58;
export const JOHOR_ARANG_AT=69;
export const JOHOR_RECOVER_AT=80;
export const JOHOR_SURROUND_AT=87;

export function inJohorRhythm(g){
  return g.stage.id==='johor'&&!g.practice&&!g.raid&&!g.won&&!g.over&&g.clock>=45&&g.clock<105;
}
