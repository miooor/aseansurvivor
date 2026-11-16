import my from '../../assets/flags/my.svg?raw';
import th from '../../assets/flags/th.svg?raw';
import vn from '../../assets/flags/vn.svg?raw';
import id from '../../assets/flags/id.svg?raw';
import sg from '../../assets/flags/sg.svg?raw';
import ph from '../../assets/flags/ph.svg?raw';
import bn from '../../assets/flags/bn.svg?raw';
import kh from '../../assets/flags/kh.svg?raw';
import la from '../../assets/flags/la.svg?raw';
import mm from '../../assets/flags/mm.svg?raw';
import tl from '../../assets/flags/tl.svg?raw';
const FLAGS={
  Malaysia:my,Thailand:th,Vietnam:vn,Indonesia:id,Singapore:sg,Philippines:ph,
  'The Philippines':ph,Brunei:bn,Cambodia:kh,Laos:la,Myanmar:mm,'Timor-Leste':tl
};
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function heroNameHtml(hero){
  const flag=FLAGS[hero.country];
  if(!flag)throw Error('Missing country flag: '+hero.country);
  return `<img class="hero-flag" src="data:image/svg+xml,${encodeURIComponent(flag)}" alt="${escape(hero.country)} flag"><span class="hero-name">${escape(hero.name)}</span>`;
}
