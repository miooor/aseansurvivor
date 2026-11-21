export const CAMPAIGN_ROUTES = {
  west: ['johor', 'melaka', 'kl', 'selangor', 'perak', 'penang', 'kedah'],
  east: ['johor', 'pahang', 'terengganu', 'kelantan']
};

export function stageAvailable(route, stageId, {cleared, retainedStages}) {
  const index = CAMPAIGN_ROUTES[route].indexOf(stageId);
  if (index < 0) return false;
  // Keep the Perak unlock granted by clearing Kuala Lumpur before Selangor joined the route.
  if (stageId === 'perak' && cleared.includes('kl')) return true;
  return index === 0 || cleared.includes(CAMPAIGN_ROUTES[route][index - 1]) ||
    cleared.includes(stageId) || retainedStages.includes(stageId);
}

export function nextCampaignStage(route, save) {
  return CAMPAIGN_ROUTES[route].find(id => !save.cleared.includes(id) && stageAvailable(route, id, save));
}

const COAST_ENDINGS = {
  west: {title:'West Coast complete',text:'From Johor to the paddy fields of Kedah, the West Coast is safe.',other:'east'},
  east: {title:'East Coast complete',text:'From Johor to the wau fields of Kelantan, the East Coast is safe.',other:'west'}
};

export function campaignVictory(route, save) {
  const next = nextCampaignStage(route, save);
  if (next) return {next, route};
  const ending = COAST_ENDINGS[route];
  const otherNext = nextCampaignStage(ending.other, save);
  if (otherNext) return {title:ending.title, text:ending.text, next:otherNext, route:ending.other};
  return {title:'Malaysia complete', text:'All ten stages are safe. From the jetties of Pulau Pinang to the boatyards of Terengganu, both coasts can greet the dawn.'};
}
