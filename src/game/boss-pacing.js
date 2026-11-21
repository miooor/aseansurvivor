// A surviving boss continues to enrage for as long as the player stays.
export const BOSS_SPEED_FLOOR=.8;   // boss base speed is at least this share of the survivor's base speed
export const ENRAGE_INTERVAL=60;    // seconds per enrage step
export const ENRAGE_SPEED=.1;       // +speed per step
export const ENRAGE_DAMAGE=.15;     // +damage per step

export function bossPace({speed,damage,heroSpeed,age}){
  const enrage=Math.floor(Math.max(0,age)/ENRAGE_INTERVAL);
  return {
    enrage,
    speed:Math.max(speed,heroSpeed*BOSS_SPEED_FLOOR)*(1+ENRAGE_SPEED*enrage),
    damage:damage*(1+ENRAGE_DAMAGE*enrage),
  };
}
