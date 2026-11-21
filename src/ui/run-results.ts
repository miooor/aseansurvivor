import {HERO_UPGRADES, MAX_UPGRADE_RANK, upgradePrice, upgradeRank} from '../content/hero-upgrades';

type BossSummary = {name:string; health:number; raid:boolean} | {name:string; arrivesIn:number};
type RunSummary = {
  hero:string; stage:string; boss:BossSummary; retired:boolean;
  won:boolean; victoryText:string; hasNext:boolean; stats:Stat[];
  recap:{metrics:Stat[];sources:Stat[];seed:string;veteran:boolean;medal:boolean};
};
type ResultsOptions = {
  openShop:(hero:string)=>void;
  wallet:(hero:string)=>{coins:number; levels:unknown};
  signal:AbortSignal;
};

type Stat = [number|string,string];

function statCell([value,label]:Stat) {
  const cell=document.createElement('div');
  const number=document.createElement('b');
  const caption=document.createElement('span');
  number.textContent=String(value);
  caption.textContent=label;
  cell.append(number,caption);
  return cell;
}

export function renderRunStats(container:Element, stats:Stat[]) {
  container.replaceChildren(...stats.map(statCell));
}

function renderMetrics(container:Element,metrics:Stat[]){
  container.replaceChildren(...metrics.map(([value,label])=>{
    const row=document.createElement('div');
    const name=document.createElement('dt');
    const amount=document.createElement('dd');
    name.textContent=label;
    amount.textContent=String(value);
    row.append(name,amount);
    return row;
  }));
}

export function installRunResults({openShop,wallet,signal}:ResultsOptions) {
  const end=document.querySelector<HTMLElement>('#end')!;
  const title=end.querySelector<HTMLElement>('#endt')!;
  const detail=end.querySelector<HTMLElement>('#ends')!;
  const stats=end.querySelector<HTMLElement>('#estats')!;
  const next=end.querySelector<HTMLButtonElement>('#next')!;
  const again=end.querySelector<HTMLButtonElement>('#again')!;
  const shop=end.querySelector<HTMLButtonElement>('#endShop')!;
  const hint=end.querySelector<HTMLElement>('#endShopHint')!;
  const metrics=end.querySelector<HTMLElement>('#recapMetrics')!;
  const source=end.querySelector<HTMLElement>('#recapSource')!;
  const sources=end.querySelector<HTMLDetailsElement>('#recapSources')!;
  const sourceMetrics=end.querySelector<HTMLElement>('#recapSourceMetrics')!;
  const setup=end.querySelector<HTMLElement>('#recapSetup')!;
  const medal=end.querySelector<HTMLElement>('#recapMedal')!;
  let summary:RunSummary;
  let acceptAt=0;
  let walletCell:HTMLElement|null=null;

  end.addEventListener('click',event=>{
    if(performance.now()<acceptAt){event.preventDefault();event.stopImmediatePropagation()}
  },{capture:true,signal});
  for(const type of ['keydown','keyup'] as const){
    end.addEventListener(type,event=>{
      if((event.key===' '||event.key==='Enter')&&(event.repeat||performance.now()<acceptAt))event.preventDefault();
    },{signal});
  }
  shop.addEventListener('click',()=>openShop(summary.hero),{signal});

  function refresh(){
    if(end.hidden||shop.hidden||shop.disabled)return;
    const {coins,levels}=wallet(summary.hero);
    let cheapest;
    for(const upgrade of HERO_UPGRADES){
      const rank=upgradeRank(levels,upgrade.id),price=upgradePrice(upgrade,rank);
      if(rank<MAX_UPGRADE_RANK&&(!cheapest||price<cheapest.price))cheapest={name:upgrade.name,price};
    }
    hint.textContent=cheapest&&coins<cheapest.price?'You need '+(cheapest.price-coins)+' more coins for '+cheapest.name+'.':'';
    if(walletCell)walletCell.textContent=String(coins);
  }

  function show(result:RunSummary){
    summary=result;
    end.hidden=false;
    title.textContent=result.won?result.stage+' is safe':result.retired?'Run ended':'You were overwhelmed';
    const boss=result.boss;
    if(result.won)detail.textContent=result.victoryText;
    else if(result.retired)detail.textContent='Defeat the stage boss to clear '+result.stage+'.';
    else if('arrivesIn' in boss){
      const seconds=Math.max(0,Math.ceil(boss.arrivesIn));
      detail.textContent=boss.name+' would have arrived in '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+'.';
    }else{
      detail.textContent=(boss.raid?'Raid boss ':'')+boss.name+' had '+boss.health+'% health left.';
    }
    walletCell=null;
    renderRunStats(stats,result.stats);
    renderMetrics(metrics,result.recap.metrics);
    const [biggest]=result.recap.sources;
    sources.hidden=!biggest;
    sources.open=false;
    source.textContent=biggest?'Most damage from '+biggest[1]+' · '+biggest[0]:'';
    renderMetrics(sourceMetrics,result.recap.sources);
    setup.textContent=(result.recap.veteran?'Veteran':'Standard')+' · Seed '+result.recap.seed+' · Replay with the same starting upgrades and survivor.';
    medal.hidden=!result.recap.veteran;
    medal.textContent=result.recap.medal?'◆ Veteran medal earned':'Veteran medal requires defeating the pack and stage boss.';
    next.hidden=!result.hasNext;
    shop.hidden=result.won;
    shop.disabled=true;
    hint.textContent='';
    acceptAt=result.won?0:performance.now()+350;
    (result.won?(next.hidden?again:next):title).focus();
  }

  function paid(saved:boolean){
    if(!saved){hint.textContent='Your payout could not be saved.';return}
    const cell=statCell([wallet(summary.hero).coins,'Total coins']);
    walletCell=cell.querySelector('b');
    stats.append(cell);
    shop.disabled=false;
    refresh();
  }
  return {show,paid,refresh};
}
