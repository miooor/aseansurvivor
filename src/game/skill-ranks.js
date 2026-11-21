// Shared by casts and their rank previews.
export const rankDamage = rank => 1 + .25 * (rank - 1);
export const castCooldown = (skill, rank, modifier) => skill.cd * (1 - .07 * (rank - 1)) * modifier;
export const remainingSkillCooldown = (run, slot) => slot > 0 && run.practice?.noCooldown ? 0 : run.cds[slot];
export function basicProjectileCount(hero,rank,evolved=false){
  const extra=Math.floor((rank-1)/2);
  if(hero==='nok'||hero==='mira')return Number(rank>=2)+extra;
  return 1+extra+Number(hero==='lan'&&rank>=4||hero==='sari'&&evolved);
}
export const spannerBounces = (rank, evolved) => 1 + Math.floor((rank - 1) / 2) + (evolved ? 2 : 0);
export const orbitBeads = rank => 5 + rank;
export const lanternStun = (rank, technique) => (1 + .15 * (rank - 1)) * technique.stun;
export const goldDustDuration = (rank, evolved) => 5 + .5 * (rank - 1) + (evolved ? 2 : 0);
export const barrierHealing = rank => 8 * rankDamage(rank);
export const exhaustDuration = rank => 5 + .5 * (rank - 1);
export const hornFear = rank => 2 + .25 * (rank - 1);
export const flybyDuration = rank => 6 + .5 * (rank - 1);
export const poiseDuration = rank => 8 + .75 * (rank - 1);
export const troupeGuards = rank => 3 + (rank >= 3 ? 1 : 0) + (rank >= 5 ? 1 : 0);
export const rainInterval = rank => Math.max(.1, .17 - .012 * (rank - 1));
export const stanceDuration = (rank, technique) => (2.5 + .25 * (rank - 1)) * technique.duration;
export const garudaFeathers = rank => 12 + (rank - 1);

export const dawnPierce = rank => rank >= 4 ? 2 : 1;
export const fanReach = rank => 230 + 12 * rank;
export const bellReach = rank => 84 + 5 * rank;
export const kneeReach = (rank, technique) => (215 + 12 * rank) * technique.reach;
export const floodRadius = (rank, technique) => (205 + 13 * rank) * technique.radius;

export function basicHitDamage(hero, rank, evolved) {
  const base = hero.basicDamage * rankDamage(rank);
  if (evolved && hero.id === 'rempit') return base * 1.3;
  if (evolved && hero.id === 'sari') return base * 1.15;
  return base;
}

export const palmCounter = (rank, technique) => 40 * rankDamage(rank) * technique.counter;

export function basicUpgrade(hero,rank){
  if(hero==='nadi')return rank===3||rank===5?'Strike one more nearby foe':undefined;
  const boomerang=hero==='lan'||hero==='sari';
  switch(rank){
    case 2:return boomerang?'Pierce · +25% damage after the first target':'Pierce · pass through one extra target';
    case 3:return 'Chain · jump to a nearby foe for 65% damage';
    case 4:return 'Fork · split into two shards for 50% damage each';
    case 5:return boomerang?'Return · +50% damage on the way back':'Return · fly back and hit foes again';
  }
}
