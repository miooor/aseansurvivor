export const MAX_UPGRADE_RANK = 5;

export const HERO_UPGRADES = [
  {id:'vitality', name:'Vitality', amount:3, unit:' max HP', price:45},
  {id:'strength', name:'Strength', amount:2, unit:'% damage', price:60},
  {id:'stride', name:'Stride', amount:2, unit:'% move speed', price:50},
  {id:'haste', name:'Haste', amount:2, unit:'% shorter cooldowns', price:65},
  {id:'armor', name:'Guard', amount:2, unit:'% damage reduction', price:55},
  {id:'recovery', name:'Recovery', amount:0.2, unit:' HP per second', price:70},
  {id:'magnet', name:'Magnet', amount:8, unit:'% pickup range', price:40},
  {id:'wisdom', name:'Wisdom', amount:4, unit:'% XP from embers', price:60},
  {id:'fortune', name:'Fortune', amount:8, unit:'% coins at run end', price:75},
] as const;

export type HeroUpgrade = typeof HERO_UPGRADES[number];

export function upgradeRank(levels:unknown, id:HeroUpgrade['id']):number {
  if (!levels || typeof levels !== 'object' || !Object.hasOwn(levels,id)) return 0;
  const rank = levels[id as keyof typeof levels];
  return typeof rank === 'number' && Number.isInteger(rank)
    ? Math.min(MAX_UPGRADE_RANK, Math.max(0, rank))
    : 0;
}

export function upgradePrice(upgrade:HeroUpgrade, rank:number) {
  return upgrade.price + rank * 25;
}

export function runUpgradeStats(levels:unknown) {
  const bonus = Object.fromEntries(HERO_UPGRADES.map(upgrade=>[
    upgrade.id, upgradeRank(levels, upgrade.id) * upgrade.amount,
  ])) as Record<HeroUpgrade['id'],number>;
  return {
    health: bonus.vitality,
    damage: 1 + bonus.strength / 100,
    speed: 1 + bonus.stride / 100,
    cooldown: 1 - bonus.haste / 100,
    incoming: 1 - bonus.armor / 100,
    regen: bonus.recovery,
    pickup: 1 + bonus.magnet / 100,
    xp: 1 + bonus.wisdom / 100,
    coinPercent: bonus.fortune,
  };
}
