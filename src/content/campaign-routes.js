export const CAMPAIGN_ROUTES = {
  west: ['johor', 'melaka', 'kl', 'perak', 'penang', 'kedah'],
  east: ['johor', 'pahang', 'terengganu', 'kelantan']
};

export function stageAvailable(route, stageId, {cleared, retainedStages}) {
  const index = CAMPAIGN_ROUTES[route].indexOf(stageId);
  if (index < 0) return false;
  return index === 0 || cleared.includes(CAMPAIGN_ROUTES[route][index - 1]) ||
    cleared.includes(stageId) || retainedStages.includes(stageId);
}

export function nextCampaignStage(route, save) {
  return CAMPAIGN_ROUTES[route].find(id => !save.cleared.includes(id) && stageAvailable(route, id, save));
}
