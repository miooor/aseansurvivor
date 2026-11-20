import {FOLKLORE_GHOSTS} from './folklore-monsters.js';

// Original spirits tied to the environment of each mission.
export const REGIONAL_GHOSTS = {
  stalker: {frame:0, size:93, name:'Palm Stalker', hp:65, spd:90, r:18, dmg:12, xp:5, warning:55, hint:'Sidestep its charge.'},
  lantern: {frame:1, size:78, name:'Lantern Wraith', hp:45, spd:65, r:16, dmg:8, xp:5, warning:55, hint:'Dodge between its three ember bolts.'},
  neon: {frame:2, size:83, name:'Neon Shade', hp:60, spd:110, r:16, dmg:12, xp:6, warning:55, hint:'Watch for a dash and two flanking bolts.'},
  sentinel: {frame:3, size:112, name:'Tin Sentinel', hp:160, spd:45, r:24, dmg:18, xp:8, warning:155, hint:'Step out of its wide ground-slam circle.'},
  drifter: {frame:4, size:88, name:'Jetty Drifter', hp:90, spd:60, r:20, dmg:14, xp:6, warning:55, hint:'Avoid the slippery brine and sea bolts.'},
  watcher: {frame:5, size:94, name:'Paddy Watcher', hp:85, spd:50, r:20, dmg:10, xp:7, warning:55, hint:'Weave through its five-shot straw fan.'},
  nipah: {frame:6, size:96, name:'Nipah Rootling', hp:80, spd:72, r:20, dmg:12, xp:6, warning:84, hint:'Step away when roots mark your position.'},
  foam: {frame:7, size:86, name:'Slipway Crab', hp:125, spd:61, r:23, dmg:15, xp:7, warning:55, hint:'Dodge along the gap between its twin foam trails.'},
  kite: {frame:8, size:98, name:'Wau Wisp', hp:96, spd:85, r:19, dmg:12, xp:7, warning:55, hint:'Find the gap in its spinning ring of darts.'},
  ...FOLKLORE_GHOSTS
};

/** @param {string} id */
export function regionalGhost(id){
  return Object.hasOwn(REGIONAL_GHOSTS,id)?REGIONAL_GHOSTS[id]:undefined;
}

/** @param {string} id */
export const regionalWindup=id=>regionalGhost(id)?.folklore?.windup??(id==='nipah'?.9:.65);
