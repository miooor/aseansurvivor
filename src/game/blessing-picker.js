import {equipmentCastRank} from './equipment.js';
import {
  basicHitDamage, palmCounter, barrierHealing, bellReach, castCooldown, dawnBolts, dawnPierce, fanReach, floodRadius, exhaustDuration, flybyDuration, garudaFeathers,
  hornFear, lanternStun, orbitBeads, poiseDuration, rainInterval, rankDamage, riverPuppets,
  spannerBounces, stanceDuration, teepReach, troupeGuards
} from './skill-ranks.js';

export function availableEvolutions(game, recipes, choice) {
  return recipes.filter(({i,item}) => {
    const rank = game.ranks[i] + Number(choice?.type === 'skill' && choice.i === i);
    const level = (game.pass[item] || 0) + Number(choice?.type === 'pass' && choice.id === item);
    return !game.evo[i] && rank >= 5 && level >= 1;
  });
}

export function newlyAvailableEvolutions(game, recipes, choice) {
  const ready = availableEvolutions(game, recipes);
  return availableEvolutions(game, recipes, choice).filter(recipe => !ready.includes(recipe));
}

export function trackingCue(game, recipe, choice) {
  if (!recipe) return '';
  if (choice.type === 'evo' && choice.ev.i === recipe.i) return 'Claim pinned evolution';
  const needsRank = choice.type === 'skill' && choice.i === recipe.i && game.ranks[recipe.i] < 5;
  const needsItem = choice.type === 'pass' && choice.id === recipe.item && !game.pass[recipe.item];
  return needsRank || needsItem ? 'Advances pin' : '';
}

export function applyEvolution(game, recipe) {
  game.evo[recipe.i] = true;
  if (game.trackedEvolution === recipe.i) game.trackedEvolution = null;
}

const specialMetrics = {
  ustaz:{0:['Bolts',dawnBolts],1:['Reach',fanReach],2:['Beads',orbitBeads],3:['Stun',(r,g) => lanternStun(r,g.technique),' s'],4:['Healing',barrierHealing,' HP/s']},
  rempit:{0:['Bounces',(r,g) => spannerBounces(r,g.evo[0])],2:['Trail duration',exhaustDuration,' s'],3:['Fear',hornFear,' s'],4:['Duration',flybyDuration,' s']},
  nok:{0:['Reach',bellReach],1:['Reach',(r,g) => teepReach(r,g.technique)],3:['Duration',poiseDuration,' s']},
  lan:{0:['Puppets',riverPuppets],2:['Base guards',troupeGuards],3:['Radius',(r,g) => floodRadius(r,g.technique)],4:['Strike interval',rank => rainInterval(rank)*1000,' ms']},
  sari:{3:['Stance',(r,g) => stanceDuration(r,g.technique),' s'],4:['Feathers',garudaFeathers]}
};

export function skillChanges(game, slot) {
  const hero = game.hero, skill = hero.skills[slot];
  const rank = equipmentCastRank(game,slot,game.ranks[slot]);
  const changes = [];
  function add(label, value, unit='', digits=3) {
    const before = Number(value(rank).toFixed(digits)), after = Number(value(rank+1).toFixed(digits));
    if (before !== after) changes.push(label+' '+before+' → '+after+unit);
  }
  const special = specialMetrics[hero.id]?.[slot];
  if (special) {
    const [label, value, unit] = special;
    add(label, r => value(r,game), unit);
  }
  if (hero.id === 'ustaz' && slot === 0) add('Pierce', dawnPierce);
  const baseDamage = skill.techniqueDamage ? game.technique[skill.techniqueDamage] : skill.baseDamage;
  if (baseDamage) {
    add(skill.damageLabel || 'Base damage', r => baseDamage * rankDamage(r));
  } else if (slot === 0) {
    add('Base hit', r => basicHitDamage(hero,r,game.evo[slot]));
  } else if (hero.id === 'sari' && slot === 3) {
    add('Base counter', r => palmCounter(r,game.technique));
  }
  if (!skill.ult) add('Cooldown', r => castCooldown(skill,r,game.st.cd), ' s', 2);
  return changes;
}
