# ASEAN Survivor: Game Design

Exported from the project design doc on 2026-11-13. The section "Current decisions" overrides older sections where they differ.

## Pitch and core loop

**ASEAN Survivor** is a top-down 2D survive-the-horde game: you pick a hero from a Southeast or East Asian country and travel north from Malaysia to China, fighting the folklore ghosts of each land. It is inspired by the survivor-like genre but uses its own name, art, heroes and rules.

**Story hook.** Ghost Month has come early. The gates of the underworld opened, and the ghosts of every country spilled out and started gathering together. Each stage pushes one step closer to the source of the leak in China, where the gate must be shut.

**What makes it different:** each hero has a MOBA-style kit of four skills on top of an auto basic attack.

Core loop:

1. Move. The basic attack auto-fires at the nearest ghost.
2. Ghosts come in waves that get denser and mix new types over time.
3. Killed ghosts drop spirit embers (XP). Each level-up offers three cards: rank up a skill, or take a passive item.
4. Skills run on cooldowns; the ultimate charges from kills.
5. A boss appears at the end of each stage. Beat it to move on.

## Current decisions

- **Johor rescue and weapon slice (2026-11-14).** Trapped Traveller is an optional, deliberate market encounter with six captors and one Armoured Palm Stalker. Final rescue grants one fixed three-choice weapon offer. Three run-local slots, safe paused inspection and replacement now exist; charm/relic content remains subsequent work. Exact contracts and evidence are in `docs/johor-rescue.md` and canonical issue #1. Existing caches, survival clock and progression remain; active events block raid entry until resolved.

- **Hero signatures (2026-11-14).** Each existing kit gains a distinct loop: Hakim charges a healing Sanctuary through basic attacks; Jet converts movement into a Redline dash; Nok chains alternating techniques into an area finisher; Lan builds High Tide through hits on slowed enemies for an empowered troupe; Sari converts successful counters into a timed Riposte and dash reset. The lobby explains each loop; the HUD shows charge, timing windows, and ready skills. Exact current rules are in README's Hero signatures table. These are run-local powers and do not change saved ownership.

- **Browser-first Phaser remake (2026-11-14).** Phaser 4 + TypeScript + Vite is the foundation. The current renderer uses illustrated sprites, native Phaser effects, and a cinematic HTML lobby. Existing combat kits and progression rules remain; all stage rules currently share one kampung environment. The earlier dependency-free prototype and prospective Phaser 3 direction are superseded.
- **Long-term direction.** Build depth through interacting skills, items, and progression in a browser-first 2D game. First establish a compelling, replayable Malaysian chapter. Equipment affixes, persistent build trees, and a broader endgame are future design work, not implemented features.

- **Auto-cast combos.** The player links two skills (Q+E, Q+F, E+F), all four, or none. Linked skills fire together automatically so their combo triggers; the rest are cast by hand with Q, E, F, R.
- **Combos.** Skills used together get a bonus, e.g. Seruan then Cahaya Fajar (Smite: double damage to stunned ghosts), Wheelie through your own exhaust (Api Wheelie).
- **Evolutions.** A skill at rank 5 plus a matching item evolves it, e.g. Nur + Pelita becomes Nur Purnama.
- **Power-ups.** Ketupat (heal), Besi Berani (magnet: pulls in every ember and power-up), Mercun (hits every ghost on screen), Kopi Kaw (3x skill recharge), Payung (6 s invulnerable). At most 2 on the map, 25 s gap between drops.
- **Portal raid.** Once per stage a portal appears off-screen for 60 s. Inside is Hantu Raya, a raid-style boss with telegraphed attacks and a second phase. Reward: Fusion Orb (60%, a free evolution) or a big XP buff (+2 levels, double XP for 60 s), plus 30 coins.
- **Coins and shop.** Ghosts and bosses drop coins, kept even on death. Coins unlock heroes: Nok 150, Cô Lan 200, Sari 250. (Currently everything is unlocked for testing.)
- **XP curve.** Each level costs more than the last, with +8% per level after level 20.

### Malaysia route

| # | Stage | Setting | Boss |
| --- | --- | --- | --- |
| 1 | Johor | Oil palm estates and kampung | Raja Toyol (summons toyol packs) |
| 2 | Melaka | Old town shophouses | Orang Minyak Besar (floods the ground with oil) |
| 3 | Perak | Limestone hills and tin-mining ponds | Pocong Gergasi (shockwave on every hop) |
| Bonus | Kuala Lumpur | City back lanes; unlocks after Perak, 2 minutes, coins x3 | Ratu Penanggal |
| 4 | Pulau Pinang | Shophouses and the old jetty | Pontianak |
| 5 | Kedah | Paddy fields by the Thai border | Pontianak Ratu |

After Kedah the route continues to Thailand, Vietnam and China.

## Heroes

### Ustaz Hakim (Malaysia): the protector
Slow and sturdy. His power is framed as protection and blessing, never as mocking or weaponising scripture.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Nur | A small bolt of light at the nearest ghost. |
| Q | Cahaya Fajar (Dawn Light) | A wide cone of light; heavy damage, burns ghosts for 2 s. |
| E | Tasbih Ring | Prayer beads orbit him for 6 s, hitting every ghost they touch. |
| F | Seruan (The Call) | A wave that pushes nearby ghosts back and stuns them. |
| R | Benteng Doa (Prayer Barrier) | A ring of light for 8 s: ghosts inside take damage, Hakim heals inside it. |

### Mat Rempit "Jet" (Malaysia): the speedster
Rides a kapcai: the fastest hero, but fragile.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Spanar | Throws a spinning spanner that bounces between ghosts. |
| Q | Wheelie | A fast dash that damages ghosts along the line; briefly invulnerable. |
| E | Ekzos Panas (Hot Exhaust) | Leaves a burning trail for 5 s. |
| F | Hon Kuat (Loud Horn) | A blast that makes ghosts flee for 2 s. |
| R | Mode Superman | Lies flat on the bike for 6 s: double speed, invulnerable, rams ghosts. |

### Nok, Muay Thai fighter (Thailand)
Melee bruiser.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Jab-Cross | A short punch combo in front of her. |
| Q | Teep | A push kick that knocks a line of ghosts far back. |
| E | Sok Klap | Spinning elbow hitting everything around her. |
| F | Wai Khru | A ritual dance honouring her teachers: +30% damage and less damage taken for 8 s. |
| R | Hanuman Leap | Leaps to a point; the landing crushes and stuns a large area. |

### Cô Lan, water puppeteer (Vietnam)
A summoner from the water-puppet theatre tradition.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Puppet Strike | A puppet darts out and back. |
| Q | Dragon Lunge | A dragon puppet charges in a line, piercing and slowing. |
| E | Little Guards | Summons puppet guards that fight for 10 s. |
| F | Lake Splash | A water wave that slows ghosts by 50% for 3 s. |
| R | Grand Lake Show | Puppets strike ghosts all over the screen for 8 s. |

### Sari, pencak silat fighter (Indonesia)
Agile duelist with counters.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Kris Melayang | A boomerang kris. |
| Q | Tendangan Sabit | A crescent kick in a wide arc. |
| E | Langkah Harimau | Tiger-step dash; afterimages explode after 0.5 s. |
| F | Bunga Silat | 2.5 s counter stance: invulnerable, ghosts that touch her get hit back. |
| R | Sayap Garuda | Garuda feather strikes slam ghosts across the screen. |

### Master Wei, Taoist priest (China), planned
Yellow Talisman (pins a ghost), Sticky Rice (damaging, slowing ground), Bell of Stillness (freeze nearby ghosts), Bagua Seal (ultimate: locks an area).

## Ghost roster

### Malaysia
| Ghost | Role | Ability (from the lore) |
| --- | --- | --- |
| **Toyol** | Fast thief | Small, green, one-eyed (signature ghost). Steals embers and flees; kill it to get them back. Distracted by marbles (Guli item). |
| Pocong | Swarm | Hops in bursts in groups. Releases a soul orb (bonus XP) on death. |
| Penanggal | Flier | Flying head; its body is left somewhere on the map. Destroying the body halves its health. |
| Orang Minyak | Tank | Coated in oil: 30% of hits slide off; leaves slick puddles that make you skid. |
| Pontianak | Boss | Frangipani scent warns she is near. Her wail is soft when she is close. A critical hit "pins" her (the nail legend). |
| Hantu Raya | Raid boss | A great shadow spirit: slam circles, a lunge, shadow clones, and an eclipse phase. |

### Thailand (planned)
Phi Pop (possesses other ghosts), Phi Am (sleep paralysis root), Phi Pret (eats embers and grows), Krasue (floating head that drains HP). Boss: Great Krasue.

### Vietnam (planned)
Ma Da (drowned spirit that pulls you into water), Ma Trơi (exploding will-o'-wisps), Ma Lai (splitting flying head), Ma Cà Rồng (life-draining bruiser). Boss: Ma Da Elder.

### China (planned)
Jiangshi (hops toward you; loses track if you stand still), E Gui / Hungry Ghost (swarms offerings), Nü Gui (red curse circles), Huli Jing (illusion copies). Final boss: Ox-Head and Horse-Face.

## Respectful portrayal

- Holy and ritual powers (ustaz, Wai Khru, Taoist rites) are shown as protection, blessing and respect, never as jokes. No real scripture or prayer text is used as an attack name or sound effect.
- No places of worship are damaged or used as battlegrounds.
- Ghosts look spooky but cartoonish; gore stays stylised.
- Before release, friends from each country review their country's heroes and ghosts.

## Art direction

Illustrated 2D characters with readable silhouettes, warm edge lighting, jade night environments, and amber UI accents. Native Phaser camera effects, hit flashes, floating damage, and telegraphs provide combat feedback. Heroes now use four-frame walking/riding and attack cycles in all eight directions. Active skills have distinct directional windup/release poses and original synthesized sound cues. Each stage has a distinct open region with five landmarks, guarded supply caches and a minimap. Regional layouts include kampung fields, canal streets, mining ponds, neon roads, coastal jetties and irrigated paddies. Each has a signature enemy and local ghost mix; see the README region table. Respect reduced-motion preferences for camera feedback and UI transitions.

## Combat feedback direction (2026-11-14)

Original Ragnarok-inspired presentation uses ground spell seals, bright narrow highlights, impact starbursts, and outlined upward-popping damage numbers. Hakim gets light pillars; Jet gets exhaust/speed streaks; Nok gets force arcs; Lan gets water ripples; Sari gets sweeping slashes. Ultimate accents are larger. These are cosmetic and preserve combat rules. Criticals, normal hits, incoming damage, recovery and periodic damage have distinct visual treatments; exact behavior and the review fixture are documented in README.
