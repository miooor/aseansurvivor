// One shrine slot in the power-up pool. Each variation is equally likely.
export const SHRINE_DURATION=12;
const shrine=(name,glyph,color,description,bonus)=>({name,glyph,color,description,...bonus});
export const SHRINES={
  monsoon:shrine('Monsoon','≈','#81e6ca','Move 35% faster.',{speed:1.35}),
  tiger:shrine('Tiger','Ⅲ','#ff965e','Deal 30% more damage.',{damage:()=>1.3}),
  kingfisher:shrine('Kingfisher','➶','#6edcf3','Deal 60% more damage to full-health foes.',{damage:e=>e.hp>=e.maxHp?1.6:1}),
  crocodile:shrine('Crocodile','▼','#a8dc74','Deal 75% more damage to foes at or below 25% HP.',{damage:e=>e.hp<=e.maxHp*.25?1.75:1}),
  banyan:shrine('Banyan','♜','#dbc089','Deal 50% more damage to bosses and elites.',{damage:e=>e.boss||e.elite?1.5:1}),
  cinder:shrine('Cinder','♨','#ff986f','Double damage over time.',{damage:(_e,o)=>o.dot?2:1}),
  star:shrine('Morning Star','✦','#fff393','Gain 35 percentage points of critical chance.',{crit:.35}),
  prism:shrine('Prism','◇','#dbb5ff','Critical hits deal triple damage.',{critMultiplier:3}),
  drum:shrine('Bronze Drum','◎','#ffc481','Basic attacks recharge 60% faster.',{basicRate:1.6}),
  cicada:shrine('Cicada','♫','#cbdf7a','Active skills recharge 50% faster.',{skillRate:1.5}),
  gong:shrine('Gong','◉','#eaca88','Gain double ultimate charge from ordinary kills.',{killCharge:2}),
  spring:shrine('Hot Spring','♧','#80efd4','Recover 3% of max HP per second.',{regen:.03}),
  orchid:shrine('Orchid','✿','#f7a6df','Recover 2 HP per ordinary kill.',{killHeal:2}),
  shell:shrine('Turtle Shell','⬡','#9dddac','Take 35% less damage.',{incoming:.65}),
  mist:shrine('Mountain Mist','☁','#c7d9ff','Gain 0.8 seconds of protection after taking a hit.',{hitGrace:.8}),
  tide:shrine('High Tide','↝','#80c9ff','Double ember and coin pickup radius.',{pickup:2}),
  scholar:shrine('Firefly','✧','#e4ef8f','Gain 50% more XP from embers.',{emberXp:1.5}),
  harvest:shrine('Harvest','☀','#f6cb6d','Collected coins are worth twice as much.',{coins:2}),
  rime:shrine('Mountain Frost','❄','#a7eaff','Direct hits slow ordinary foes for 2 seconds.',{slow:2}),
  hornbill:shrine('Hornbill','➤','#ffae88','Direct hits push ordinary foes away.',{push:200}),
  pepper:shrine('Pepper Vine','✣','#e8bf98','Deal 50% more damage within 100 units.',{damage:(e,_o,p)=>Math.hypot(e.x-p.x,e.y-p.y)<=100?1.5:1})
};
export const shrineIds=Object.keys(SHRINES);
export function rollShrine(roll){return shrineIds[Math.floor(roll*shrineIds.length)]}
