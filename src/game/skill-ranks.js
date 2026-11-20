// Shared by casts and their rank previews.
export const rankDamage = rank => 1 + .25 * (rank - 1);
export const castCooldown = (skill, rank, modifier) => skill.cd * (1 - .07 * (rank - 1)) * modifier;
export const dawnBolts = rank => 1 + Math.floor((rank - 1) / 2);
export const spannerBounces = (rank, evolved) => 1 + Math.floor((rank - 1) / 2) + (evolved ? 2 : 0);
export const orbitBeads = rank => 5 + rank;
export const lanternStun = (rank, technique) => (1 + .15 * (rank - 1)) * technique.stun;
export const barrierHealing = rank => 8 * rankDamage(rank);
export const exhaustDuration = rank => 5 + .5 * (rank - 1);
export const hornFear = rank => 2 + .25 * (rank - 1);
export const flybyDuration = rank => 6 + .5 * (rank - 1);
export const poiseDuration = rank => 8 + .75 * (rank - 1);
export const riverPuppets = rank => rank >= 4 ? 2 : 1;
export const troupeGuards = rank => 3 + (rank >= 3 ? 1 : 0) + (rank >= 5 ? 1 : 0);
export const rainInterval = rank => Math.max(.1, .17 - .012 * (rank - 1));
export const stanceDuration = (rank, technique) => (2.5 + .25 * (rank - 1)) * technique.duration;
export const garudaFeathers = rank => 12 + (rank - 1);

export const dawnPierce = rank => rank >= 4 ? 2 : 1;
export const fanReach = rank => 230 + 12 * rank;
export const bellReach = rank => 84 + 5 * rank;
export const teepReach = (rank, technique) => (215 + 12 * rank) * technique.reach;
export const floodRadius = (rank, technique) => (205 + 13 * rank) * technique.radius;

export function basicHitDamage(hero, rank, evolved) {
  const base = hero.basicDamage * rankDamage(rank);
  if (evolved && hero.id === 'rempit') return base * 1.3;
  if (evolved && hero.id === 'sari') return base * 1.15;
  return base;
}

export const palmCounter = (rank, technique) => 40 * rankDamage(rank) * technique.counter;
