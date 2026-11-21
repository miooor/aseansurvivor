import {STAGES} from '../src/content/core.js';

const frame=document.getElementById('game');
const run=document.getElementById('run');
const status=document.getElementById('status');
const report=document.getElementById('report');
const download=document.getElementById('download');
download.onclick=()=>{
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([report.textContent],{type:'application/json'}));
  link.download='regional-quests.json';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
};
const ready=setInterval(()=>{
  if(!frame.contentWindow.__asean)return;
  clearInterval(ready);
  run.disabled=false;
  status.textContent='Ready';
},100);

// Expected player itinerary, independently of the runtime's step definitions.
const itineraries={
  johor:['rescue','weapon','Escort · Market bridge approach','Clear · Market bridge approach','Escort · Market bridge'],
  melaka:['quayManifest','relic','Recover · Old River Quay','File · Stadthuys Steps'],
  kl:['hawkerDelivery','charm','Deliver · Central Market Lane','Deliver · Monorail Depot'],
  selangor:['harbourLedger','relic','Collect · Ferry Landing','Secure · Old Quay Warehouse','Return · Old Quay Warehouse'],
  perak:['tinAssay','weapon','Pan · Blue Tailings Pond','Secure · Tanjung Tualang Dredge','Weigh · Tanjung Tualang Dredge'],
  penang:['jettyEscort','charm','Escort · Chew Jetty winch','Lower · Chew Jetty winch','Escort · Fishing Platform'],
  kedah:['paddyWater','charm','Read · Pintu Air','Set · Irrigation Fields'],
  pahang:['nipahPlanting','charm','Collect · Mangrove Nursery','Plant · Nipah Canopy Walk'],
  terengganu:['duyongLaunch','weapon','Collect · Cengal Working Shed','Clear · Duyong Outer Slipway','Launch · Duyong Outer Slipway'],
  kelantan:['wauFlight','relic','Rig · Wau Workshop','Raise · Padang Layang Lookout']
};
const regionalRewards={
  melaka:'quaySeal',kl:'supperCarrier',selangor:'harbourToken',perak:'tinMallet',penang:'jettyKnot',
  kedah:'padiSheaf',pahang:'nipahBraid',terengganu:'cengalMallet',kelantan:'wauSpool'
};

run.onclick=()=>{
  const rt=frame.contentWindow.__asean,doc=frame.contentDocument;
  const checks=[];
  const check=(name,condition)=>{
    checks.push({name,pass:!!condition});
    if(!condition)throw Error(name);
  };
  const step=(count=1)=>{for(let i=0;i<count;i++)rt.scene.update(0,50)};
  const click=id=>{
    const button=doc.getElementById(id);
    if(!button?.getClientRects().length||button.disabled||button.getAttribute('aria-disabled')==='true')throw Error('Unavailable control '+id);
    button.click();
  };
  let error;
  try{
    for(const [index,stage] of STAGES.entries()){
      rt.toMenu();
      const route=['pahang','terengganu','kelantan'].includes(stage.id)?'east':'west';
      click('route-'+route);
      doc.getElementById('atlas-stage-'+stage.id).click();
      const briefing=[...doc.querySelectorAll('.mission-sheet li')].map(row=>row.textContent);
      rt.newGame('ustaz',index);
      const destinations=Object.values(rt.G.encounters);
      check(stage.name+' briefs every destination with its reward slot',
        briefing.length===destinations.length&&destinations.length===(stage.id==='johor'?3:1)&&destinations.every(event=>
          briefing.some(row=>row.includes(event.name)&&row.includes(event.slot))));
      doc.getElementById('menu').hidden=true;
      const g=rt.G;
      g.auto=false;
      g.cds.fill(999);
      g.spawnT=g.durianT=g.pupT=999;
      g.p.invuln=999;
      const [id,slot,...itinerary]=itineraries[stage.id];
      const e=g.encounters[id];
      check(stage.name+' offers its own quest',!!e);
      const at=p=>Object.assign(g.p,{x:p.x,y:p.y});
      const targets=()=>g.enemies.filter(enemy=>enemy.encounter===id&&!enemy.dead);
      const useStation=(panel,button)=>{
        const quest=doc.getElementById('encounterPrompt').getBoundingClientRect();
        const station=doc.getElementById(panel).getBoundingClientRect();
        check(e.name+' keeps the station control clear of the quest panel',
          station.height>0&&(quest.bottom<=station.top||station.bottom<=quest.top));
        click(button);
      };
      const clear=()=>{for(const enemy of targets())rt.kill(enemy);g.gems=[]};
      const sprite=point=>rt.scene.sprites.get(point);
      at(g.world.landmarks.find(site=>destinations.every(event=>Math.hypot(site.x-event.x,site.y-event.y)>800)));
      step();
      for(const event of destinations){
        const marker='[data-event="'+event.id+'"]',option='option[value="event:'+event.id+'"]';
        check(event.name+' stays hidden before discovery',!doc.querySelector(marker)&&!doc.querySelector(option));
        at(g.world.landmarks.find(site=>site.id===event.landmark));step();
        check(event.name+' reveals its slot on the discovered marker and picker',
          doc.querySelector(marker+' title')?.textContent.includes(event.slot)&&doc.querySelector(option)?.textContent.includes(event.slot));
        doc.querySelector(marker).dispatchEvent(new MouseEvent('click',{bubbles:true}));
        step();
        check(event.name+' previews the slot when selected',doc.getElementById('mapObjective').textContent.includes(event.slot));
        at(event);step();
        check(event.name+' previews the reward before activation',event.status==='available'&&
          !doc.getElementById('encounterPrompt').hidden&&doc.getElementById('eventReward').textContent.includes(event.slot));
      }
      at(e);step();
      check(e.name+' presents a civilian and the correct quest prompt',sprite(e)?.key===(id==='rescue'?'traveller':'regional-workers')
        &&Math.floor(Number(sprite(e).frame.name)/3)===(stage.id==='selangor'?0:Math.max(0,index-1))
        &&!doc.getElementById('encounterPrompt').hidden&&doc.getElementById('eventName').textContent===e.name);
      click('eventStart');
      if(id==='rescue'){
        check('Six captors guard the stationary traveller',targets().length===6&&!e.companion);
        clear();step();click('eventInteract');
      }
      const companion=e.companion;
      const seen=[];
      let regrouped=false,walked=false,waves=0;
      for(let tick=0;tick<1500&&e.status==='active';tick++){
        const target=e.guidance;
        if(!target)throw Error('Missing objective for '+e.name);
        const {verb,label}=target,text=verb+' · '+label;
        if(verb!=='Defeat'&&verb!=='Regroup'&&seen.at(-1)!==text)seen.push(text);
        // Keep the run clock and movement live. Only player travel and owned kills are staged.
        if(companion){
          if(e.companion!==companion)throw Error('Replaced companion in '+e.name);
          if(!regrouped){
            at(g.world.safePoint(companion.x-650,companion.y,24));step();
            check(e.name+' redirects to the waiting companion',e.guidance.verb==='Regroup'&&!companion.moving
              &&doc.getElementById('gpsVerb').textContent==='Regroup'&&Number(sprite(companion)?.frame.name)===(id==='rescue'?2:11)&&!sprite(e));
            regrouped=true;
          }
          at(companion);
        }else if(verb!=='Defeat')at(target);
        if(verb==='Defeat'){
          if(!targets().length)throw Error('Combat target missing at '+label);
          waves++;clear();
        }else if(verb==='Lower'){
          if(!g.world.gangway.open&&!g.jettyWork.active)useStation('jettyPrompt','jettyStart');
        }else if(verb==='Raise'){
          if(g.wauWind.phase==='ready'){step();useStation('wauPrompt','wauStart')}
        }else if(!['Escort','Regroup','Clear','Secure','Recover'].includes(verb)){
          step();
          check(text+' is labelled in the scene and on the map',
            rt.scene.terrain.labels.group.children.some(o=>o.name===text)&&doc.getElementById('mapObjective').textContent.includes(label));
          check(text+' displays the destination prop at the handoff',
            sprite(e.guidance)?.key==='quest-props'&&sprite(e.guidance).x===e.guidance.x&&sprite(e.guidance).y===e.guidance.y);
          check(text+' waits for the player action',e.status==='active'&&e.guidance.verb===verb);
          click('eventInteract');
          // Inspect the new objective before an update can turn an arrival into a fight.
          if(e.status==='active')continue;
        }
        step();
        if(companion?.moving){
          walked=true;
          if(Number(sprite(companion)?.frame.name)!==(id==='rescue'?0:9)||sprite(e)||!g.world.walkable(companion.x,companion.y,24))throw Error('Escort sprite or footing at '+label);
        }
      }
      if(companion)check(e.name+' walks a single companion to safety',regrouped&&walked&&!sprite(companion));
      check(e.name+' visits its destinations in order: '+seen.join(' → '),JSON.stringify(itinerary)===JSON.stringify(seen));
      check(e.name+' resolves its local fights',waves===(['johor','melaka','selangor','perak','terengganu'].includes(stage.id)?1:0));
      if(stage.id==='penang')check('Escorting the fisher lowers the playable gangway',g.world.gangway.open);
      if(stage.id==='kelantan')check('Launching the rigged wau triggers the playable gust',g.wauWind.phase==='gust');
      step();
      check(e.name+' offers three choices in the expected slot',e.status==='completed'&&g.rewards.length===1
        &&g.rewards[0].slot===slot&&doc.querySelectorAll('#lootChoices button').length===3);
      const localReward=regionalRewards[stage.id];
      if(localReward){
        const item=doc.querySelector('#lootChoices [data-item="'+localReward+'"]');
        check(e.name+' offers its regional reward',!!item);
        item.click();
        check(e.name+' equips the chosen reward',g.equipment[slot]===localReward);
      }else click('lootSkip');
      step();
      check(e.name+' clears the civilian and quest marker after reward',!sprite(e)&&!sprite(companion)
        &&!doc.querySelector('[data-event="'+id+'"]')&&g.rewards.length===1&&g.rewards[0].consumed);
    }
  }catch(cause){error=cause.message}
  finally{
    rt.toMenu();
    const result=error?'FAIL':'PASS';
    status.textContent=result+' · '+checks.filter(c=>c.pass).length+'/'+checks.length+(error?' · '+error:'');
    download.disabled=false;
    report.textContent=JSON.stringify({date:new Date().toISOString(),browser:navigator.userAgent,result,error,checks},null,2);
  }
};
