// Boss enrage and the night deadline: once the boss arrives it becomes the stage clock.
export const BOSS_SPEED_FLOOR=.8;   // boss base speed is at least this share of the survivor's base speed
export const ENRAGE_INTERVAL=60;    // seconds per enrage step
export const ENRAGE_SPEED=.1;       // +speed per step
export const ENRAGE_DAMAGE=.15;     // +damage per step
export const NIGHT_DEADLINE=300;    // seconds after arrival before the night swallows the stage
export const NIGHT_WARNING=30;      // final warning this many seconds before the deadline

export function bossPace({speed,damage,heroSpeed,age}){
  const enrage=Math.floor(Math.max(0,age)/ENRAGE_INTERVAL);
  return {
    enrage,
    speed:Math.max(speed,heroSpeed*BOSS_SPEED_FLOOR)*(1+ENRAGE_SPEED*enrage),
    damage:damage*(1+ENRAGE_DAMAGE*enrage),
    left:Math.max(0,NIGHT_DEADLINE-age),
    expired:age>=NIGHT_DEADLINE,
  };
}
