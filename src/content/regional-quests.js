// Site keys resolve against the current world's landmarks. The two stations
// resolve against their existing interactive world features.
const action=(site,verb,item)=>({kind:'action',site,verb,item});
const fight=(site,verb,item,count)=>({kind:'fight',site,verb,item,count});
const escort=site=>({kind:'escort',site,verb:'Escort'});

export const REGIONAL_QUESTS={
  melaka:{id:'quayManifest',name:'The Quay Manifest',landmark:'square',slot:'relic',
    description:'Recover a shipping manifest at the old quay and file it at Stadthuys Steps.',
    steps:[fight('quay','Recover','the shipping manifest',3),action('stadthuys','File','the quay manifest')]},
  kl:{id:'hawkerDelivery',name:'Hawker Delivery',landmark:'night',slot:'charm',
    description:'Take the hawker’s supper order to Central Market Lane, then deliver the last packets to the monorail night crew.',
    steps:[action('central-market','Deliver','nasi lemak packets'),action('depot','Deliver','supper to the night crew')]},
  selangor:{id:'harbourLedger',name:'The Harbour Ledger',landmark:'shop-houses',slot:'relic',
    description:'Collect the ferry ledger and return it to the crew at the old quay warehouse.',
    steps:[action('ferry','Collect','the ferry ledger'),fight('old-warehouse','Secure','the loading court',4),
      action('old-warehouse','Return','the ferry ledger')]},
  perak:{id:'tinAssay',name:'Kinta Tin Assay',landmark:'camp',slot:'weapon',
    description:'Sample the tailings pond and carry the tin concentrate to the Tanjung Tualang dredge.',
    steps:[action('pond','Pan','a tin sample'),fight('tt5','Secure','the dredge assay bench',4),action('tt5','Weigh','the tin concentrate')]},
  penang:{id:'jettyEscort',name:'Chew Jetty Crossing',landmark:'chew-jetty',slot:'charm',companionName:'Fisher',
    description:'Walk with the fisher to the winch, lower the gangway and escort them across to the Fishing Platform.',
    steps:[escort('winch'),{kind:'gangway',site:'winch',verb:'Lower'},escort('fishing')]},
  kedah:{id:'paddyWater',name:'Water for the Paddies',landmark:'granary',slot:'charm',
    description:'Read the water gauge at Pintu Air and set the field inlet for the next irrigation turn.',
    steps:[action('sluice','Read','the sluice gauge'),action('wind','Set','the field inlet')]},
  pahang:{id:'nipahPlanting',name:'Mangrove Replanting',landmark:'landing',slot:'charm',
    description:'Collect young nipah palms at the nursery and replant the bank beside the canopy walk.',
    steps:[action('nursery','Collect','nipah seedlings'),action('nipah-boardwalk','Plant','the nursery seedlings')]},
  terengganu:{id:'duyongLaunch',name:'Duyong Launch Crew',landmark:'yard',slot:'weapon',
    description:'Fetch a cengal launch roller, clear the outer slipway and launch the boat.',
    steps:[action('shed','Collect','the launch roller'),fight('duyong-point','Clear','the outer slipway',4),action('duyong-point','Launch','the boat')]},
  kelantan:{id:'wauFlight',name:'Wau Bulan Flight',landmark:'market',slot:'relic',
    description:'Rig a wau bulan at the workshop and raise it from Padang Layang Lookout.',
    steps:[action('studio','Rig','the wau bulan'),{kind:'wau',site:'kiteStation',verb:'Raise'}]}
};

export const RESCUE_ROUTE={
  companionName:'Traveller',
  steps:[escort('marketRoad'),fight('marketRoad','Clear','the bridge ambush',3),escort('marketBridge')]
};
