import {HERO_UPGRADES, MAX_UPGRADE_RANK, upgradePrice, upgradeRank, type HeroUpgrade} from '../content/hero-upgrades';
import {menuPortraitPosition} from '../content/hero-art.js';

type ShopHero = {id:string; name:string; country:string; color:string; frame:number; flag:string};
type ShopState = {coins:number; levels:unknown; owned:boolean};
type ShopOptions = {
  heroes:ShopHero[];
  selectedHero:()=>string;
  read:(id:string)=>ShopState;
  buy:(id:string, upgrade:HeroUpgrade, price:number)=>Promise<string>;
  signal:AbortSignal;
};

export function installUpgradeShop({heroes, selectedHero, read, buy, signal}:ShopOptions) {
  const shop = document.querySelector<HTMLDialogElement>('#upgradeShop')!;
  const select = document.querySelector<HTMLSelectElement>('#shopHero')!;
  const back = shop.querySelector<HTMLButtonElement>('#shopBack')!;
  const grid = document.querySelector('#shopGrid')!;
  const sprite = document.querySelector<HTMLElement>('#shopSprite')!;
  const coins = document.querySelector('#shopCoins')!;
  const status = document.querySelector('#shopStatus')!;
  const options = {signal};
  let buying = false;
  select.replaceChildren(...heroes.map(hero=>new Option(hero.name+' · '+hero.country, hero.id)));

  grid.replaceChildren();
  const cards = HERO_UPGRADES.map((upgrade,index)=>{
    const card = document.createElement('article');
    card.className = 'shop-card';
    card.innerHTML = `
      <span class="shop-stat-icon" aria-hidden="true"><i></i></span>
      <div class="shop-stat">
        <h3>${upgrade.name}</h3>
        <p>+${upgrade.amount}${upgrade.unit} per rank</p>
        <div class="shop-progress">
          <span class="shop-pips" aria-hidden="true">${'<i></i>'.repeat(MAX_UPGRADE_RANK)}</span>
          <span class="shop-rank"></span>
        </div>
      </div>
      <button class="shop-buy" type="button" data-upgrade="${upgrade.id}">
        <i class="shop-coin" aria-hidden="true"></i><span></span>
      </button>`;
    card.style.setProperty('--icon-position', (index%3)*50+'% '+Math.floor(index/3)*50+'%');
    const button = card.querySelector<HTMLButtonElement>('button')!;
    const priceText = button.querySelector('span')!;
    const rankText = card.querySelector('.shop-rank')!;
    const pips = card.querySelectorAll('.shop-pips i');
    button.addEventListener('click',async()=>{
      if (!shop.open || button.disabled || buying) return;
      const hero = select.value;
      buying = true;
      let result;
      try {
        result = await buy(hero, upgrade, Number(button.dataset.price));
      } catch {
        result = 'The purchase could not be saved. Try again.';
      } finally {
        buying = false;
      }
      refresh();
      if (!shop.open || select.value !== hero) return;
      status.textContent = result;
      if (button.disabled) (select.disabled ? back : select).focus({preventScroll:true});
    },options);
    grid.append(card);
    return {upgrade,card,button,priceText,rankText,pips};
  });

  function refresh() {
    if (!shop.open) return;
    const {coins:balance, levels, owned} = read(select.value);
    coins.textContent = balance.toLocaleString('en');
    for (const {upgrade,card,button,priceText,rankText,pips} of cards) {
      const rank = upgradeRank(levels, upgrade.id);
      const price = upgradePrice(upgrade,rank);
      const max = rank === MAX_UPGRADE_RANK;
      card.classList.toggle('shop-max',max);
      button.disabled = !owned || max || balance < price;
      button.dataset.price = String(price);
      priceText.textContent = max ? 'Max' : String(price);
      rankText.textContent = rank+' / '+MAX_UPGRADE_RANK;
      button.setAttribute('aria-label',max ? upgrade.name+' max rank' :
        'Buy '+upgrade.name+' rank '+(rank+1)+' for '+price+' coins');
      button.title = !owned ? 'Unlock this survivor first' :
        max ? 'Maximum rank reached' : balance < price ? 'Need '+(price-balance)+' more coins' : '';
      pips.forEach((pip,i)=>pip.classList.toggle('filled',i<rank));
    }
  }

  function showHero() {
    const hero = heroes.find(hero=>hero.id===select.value)!;
    sprite.style.setProperty('--portrait',menuPortraitPosition(hero.frame));
    shop.style.setProperty('--portrait-flag',hero.flag);
    shop.style.setProperty('--shop-hero-color',hero.color);
    status.textContent = read(hero.id).owned ? '' : 'Unlock '+hero.name+' before buying upgrades.';
    refresh();
  }

  function open(hero:string, fixed:boolean) {
    if (shop.open) return;
    select.value = hero;
    select.disabled = fixed;
    shop.showModal();
    shop.scrollTop = 0;
    showHero();
    if (fixed) back.focus({preventScroll:true});
  }
  document.querySelector('#openUpgradeShop')!.addEventListener('click',()=>open(selectedHero(),false),options);
  select.addEventListener('change',showHero,options);
  return {refresh,openFor:(hero:string)=>open(hero,true)};
}
