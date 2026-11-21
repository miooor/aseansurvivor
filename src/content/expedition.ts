import {STAGES} from './core.js';
import {CAMPAIGN_ROUTES} from './campaign-routes.js';

type Stop = {country:string; place:string; lon:number; lat:number; stageId?:string};
export type CampaignRoute = keyof typeof CAMPAIGN_ROUTES;

export const playableStops:Stop[]=STAGES.map(stage=>({
  country:'Malaysia',place:stage.name,lon:stage.lon,lat:stage.lat,stageId:stage.id
}));

const plannedStops:Stop[]=[
  {country:'Thailand',place:'Chiang Mai',lon:98.98,lat:18.79},
  {country:'Myanmar',place:'Bagan',lon:94.86,lat:21.17},
  {country:'Laos',place:'Luang Prabang',lon:102.14,lat:19.88},
  {country:'Vietnam',place:'Hanoi',lon:105.85,lat:21.03},
  {country:'Cambodia',place:'Siem Reap',lon:103.86,lat:13.36},
  {country:'Singapore',place:'Singapore',lon:103.85,lat:1.29},
  {country:'Indonesia',place:'Yogyakarta',lon:110.37,lat:-7.80},
  {country:'Timor-Leste',place:'Dili',lon:125.58,lat:-8.56},
  {country:'Brunei',place:'Bandar Seri Begawan',lon:114.94,lat:4.89},
  {country:'Philippines',place:'Cebu',lon:123.90,lat:10.32}
];

export const expeditions:Record<CampaignRoute,Stop[]> = {
  west: [...CAMPAIGN_ROUTES.west.map(id=>playableStops.find(stop=>stop.stageId===id)!), ...plannedStops],
  east: [...CAMPAIGN_ROUTES.east.map(id=>playableStops.find(stop=>stop.stageId===id)!), ...plannedStops]
};
