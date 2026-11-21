// Elite chest waves are scheduled from the survival clock, but a wave is only
// consumed once its elite can actually spawn. Leaving an earlier elite alive
// must not silently cancel every later drop.
export const ELITE_FIRST = 45;
export const ELITE_INTERVAL = 55;

export const eliteWaveIndex = clock => Math.floor((clock - ELITE_FIRST) / ELITE_INTERVAL);
export const eliteWaveDue = index => ELITE_FIRST + index * ELITE_INTERVAL;
export const eliteWaveKey = index => index === 0 ? 'regionalElite' : 'regionalElite-' + index;
export const hasLiveElite = enemies => enemies.some(e => e.elite && !e.encounter && !e.dead);

export function runEliteWave({clock, bossAt, boss, won, events, enemies, spawn}) {
  const index = eliteWaveIndex(clock);
  if (index < 0 || clock >= bossAt || boss || won) return false;
  if (clock < eliteWaveDue(index) || events.has(eliteWaveKey(index)) || hasLiveElite(enemies)) return false;
  events.add(eliteWaveKey(index));
  spawn(index);
  return true;
}
