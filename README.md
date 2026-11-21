# ASEAN Survivor

A three-quarter-view survive-the-horde game. Pick a hero from Southeast Asia and fight your way north from Johor, fighting ghosts from each country's folklore: toyol, pocong, penanggal, orang minyak, pontianak and more.

It is an original game in the survivor-like genre, with its own heroes, ghosts and rules. Each hero has a MOBA-style kit: an auto basic attack, three skills and an ultimate.

## Play

The browser remake uses **Three.js, TypeScript, and Vite** with WebGL 2. Start the development server with Docker:

```sh
docker compose up -d
# then open http://localhost:5173
```

The container installs the locked dependencies into a named volume. No host Node installation is required. With Node 24 already installed, `npm ci && npm run dev` also works.

```sh
docker compose exec game npm run lint
docker compose exec game npm run typecheck
docker compose exec game npm run build
docker compose exec game npm run preview
# production preview: http://localhost:4173
docker compose down
```

Deploy the generated `dist/` directory to a static host. GitHub Pages now requires a build workflow; publishing the source branch directly is insufficient. Vite uses relative asset paths so the build supports a repository subpath.

## Controls

| Action | Keys |
| --- | --- |
| Choose a survivor in the lobby | A or D |
| Start the selected mission | Space |
| Move | WASD or arrow keys (on a phone, drag on the left side of the screen) |
| Cast a skill early | Q, E, F |
| Ultimate | R or Space |
| Switch the auto-cast combo (Q+E, Q+F, E+F, all, off) | T or the AUTO button |
| Pause | Esc or P |
| Pick a level-up card | 1, 2, 3 |

## What's in the prototype

- **5 heroes:** Ustaz Fadli and Mat Rempit "Kama" (Malaysia), Nok (Muay Thai, Thailand), Cô Lan (water puppeteer, Vietnam), Sari (pencak silat, Indonesia).
- **Malaysia routes:** Both branches start in Johor. West Coast runs through Melaka, Kuala Lumpur, Selangor, Perak, Pulau Pinang and Kedah. East Coast runs through Pahang, Terengganu and Kelantan. Kuala Lumpur keeps its two-minute boss arrival and triple coin-drop chance.
- **Auto-cast combos:** link two skills and they fire together so their combo triggers.
- **Ability specializations.** From level 3, pick one of two paths for one of your existing skills or take the third blessing to decide later. The path lasts for this campaign run. [Choices and encounter measurements](docs/specializations.md)
- **Combos and evolutions:** skills used together get bonuses. Blessing cards show the values that change at the next rank. Completing a rank-5 recipe with its matching passive makes the evolution available as a separate blessing. One eligible evolution is offered at a time. Pin a recipe in the blessing picker to see its progress and highlight matching cards throughout the run. Change the recipe or select “No pin” any time the picker opens. All twelve survivors have evolutions (22 recipes in total). Select a skill in the survivor wheel to see its recipe and combat effect. Fusion Orbs can grant any unclaimed recipe for the current hero at any skill rank.
- **Level-up healing.** Collect enough spirit embers to gain a level and immediately recover full HP. You still get to choose a blessing.
- **Power-ups:** Ketupat (restores 35% of max HP), Besi Berani (magnet), Mercun (hits every ghost on screen), Kopi Kaw (fast recharge), Payung (shield). Walk across a shrine to gain its blessing for 12 seconds. Its emblem appears above the survivor. The same shrine refreshes the timer, and a different shrine replaces the current blessing. One in seven ordinary random power-ups is a shrine, with equal odds for all 21 variations. [Shrine effects](docs/shrines.md). At half health or below, the next random power-up is Ketupat if none is on the ground.
- **Elite equipment drops.** At 45 seconds, a larger regional spirit joins the fight and uses its signature attack. Another can arrive every 55 seconds before the boss if the previous regional elite has fallen. Defeated elites leave a marked equipment chest. Walk over it to choose gear for the current run. Quest completion still grants its own reward.
- **Hard mode:** from 3:00 on the stage clock, keep fighting or choose **End run** in the pause menu to bank your coins. The boss keeps pace with your survivor and enrages every minute. Defeating the stage boss clears the stage.
- **Portal raid:** a red-eyed banyan arch appears once per stage. Follow the purple objective arrow and walk into the arch to fight Hantu Raya for a Fusion Orb (free evolution) or a big XP buff. While a quest is active, the rift stays open and the HUD tells you which quest to finish or abandon.
- **Johor hunt and relics:** follow two sequential tracks in the palm groves, then defeat Briarback, a Thornbound Palm Stalker whose charges leave warned thorn patches. Choose a third-cast pulse, once-per-run lethal rescue, elite sustain or temporary ultimate damage relic. See [hunt rules and verification](docs/johor-hunt.md).
- **Regional quests.** Help local civilians on both campaign routes. Deliver supper, escort a fisher, replant a mangrove bank or launch a wau for a regional equipment choice. See the [quest itineraries and screenshots](docs/regional-quests.md).
- **Johor rescue and weapons:** defeat six captors at the abandoned market, free the traveller and escort them through a bridge ambush to choose one of three weapon rewards. Equipment inspection pauses combat; events can be abandoned and block raid entry until resolved. See [rescue rules and verification](docs/johor-rescue.md).
- **Lantern Ward and charms:** protect the rice-fields lantern through 4/6/8 waves with 300 ward HP, then choose a run-local charm for speed, healing, oil protection or positional damage. See [ward rules and verification](docs/johor-ward.md).
- **Survivor upgrades:** open **Upgrades** from the lobby or from the defeat screen after your payout is saved to spend coins on permanent bonuses. All twelve heroes share one wallet and keep their own ranks.

Gear lasts for one run. Equip a weapon, charm, relic, headpiece, chest piece, gloves, belt and boots. Physical attack bonuses apply to auto basics and their follow-up hits, including Split Ember bolts. Skill attack bonuses apply to active abilities, their lingering effects and Thorn Echo. Physical defense reduces enemy contact and falling durian damage. Skill defense reduces enemy projectiles, area attacks and raid abilities. Bonuses of the same type add together.

The Technique Sash casts the current hero’s Q one rank higher. For example, Lan’s Dragonwake gains damage and travels farther, while Ustaz’s Cahaya Fajar gains damage and reach. The bonus also shortens Q’s cooldown and applies at rank five. Earned skill ranks still determine evolution eligibility.

**Upgrading gear at elite chests.** Each chest offers three regular items from one slot. If you are wearing a base item from the table below, the chest also offers both upgrades for one of those equipped items. When several qualify, the chest picks one base item at random. If none qualify, the chest draws a base item for an empty slot and adds it if it is missing from the regular choices. Pick one reward for the whole chest or select **Skip reward** to keep your loadout. Quest rewards still offer their usual three choices.

| Equipped item | First upgrade | Second upgrade |
| --- | --- | --- |
| Technique Sash | **Relay Sash** raises Q and E by one cast rank each. | **Flourish Sash** raises Q and F by one cast rank each. |
| Grip Wraps | **Pursuit Wraps** keep +15% physical damage and add 25 percentage points to direct basic hits against slowed enemies. | **Breaker Wraps** keep the same physical bonus and add 25 percentage points to direct basic hits against elites and bosses. |
| Field Jacket | **Watch Jacket** keeps +35 max HP and reduces physical and skill damage taken by 10%. | **Runner Jacket** keeps +35 max HP and adds 12% movement speed. |
| Rain Hood | **Mist Hood** reduces incoming skill damage by 25%. | **Squall Hood** keeps 10% skill defense and adds 25% skill damage at or below half HP. |
| Trail Boots | **Reed Boots** keep +10% movement speed and attract coins and XP from 50% farther away. | **Switchback Boots** keep +10% speed and multiply walking speed by another 1.2 while a living enemy is within 120 units. Body segments do not count. |
| Survey Rod | **Fault Rod** also stuns non-boss enemies caught in the pulse for 0.65 seconds. | **Tuning Rod** also removes one second from each other Q/E/F cooldown when the pulse fires. |
| Pulse Locket | **Refuge Locket** grants one second of invulnerability when the locket heals you. | **Rally Locket** grants 4% ultimate charge when the locket heals you. |
| Cadence Drum | **Thunder Drum** deals 30 damage to enemies within 140 units of you when you complete a pair. | **Rain Drum** heals 4% of maximum HP when you complete a pair. |

The rod, locket and drum keep their base effects after either upgrade.

- **Survey Rod** charges after two basic casts. With an enemy within 520 units, cast Q, E or F to spend the charge. The pulse deals 24 damage within 100 units of the nearest enemy.
- **Pulse Locket** activates when a hit costs you HP. Cast Q, E or F within three seconds to heal 5% of maximum HP. After healing, the locket rests for eight seconds.
- **Cadence Drum** grants 4% ultimate charge when you cast two different Q/E/F skills one to four seconds apart. Repeating the same skill or missing the timing window starts a new pair on that cast.

**New regular drops**

| Slot | Item | Effect |
| --- | --- | --- |
| Weapon | Surveyor’s Marker Blade | Deal 35% more direct damage against enemies at full HP. Environmental damage is excluded. |
| Relic | Tideglass Lens | Casting Q, E or F removes 0.75 seconds from each of the other two cooldowns. |
| Charm | Wayfarer’s Map Pin | Deal 18% more damage to enemies at least 200 units away at impact. |
| Boots | Ferry Runner’s Sandals | Walk 18% faster while Q is on cooldown. |
| Head | Lookout Visor | Take 22% less damage when at or below 40% HP before a hit. |
| Relic | Harbour Rally Gong | Casting your ultimate restores 25% of your missing HP. |

The shop has five ranks each for Vitality, Strength, Stride, Haste, Guard, Recovery, Magnet, Wisdom, and Fortune. First ranks cost 40–75 coins. Each additional rank costs 25 more than the last. Bonuses apply at the start of a run and stack with equipment and level-up passives. Fortune pays out on the results screen based on coins collected during the run.

All heroes and stages are unlocked for testing. Do not change `UNLOCK_ALL` until the [legacy-access migration](docs/adr/0001-legacy-access.md) ships. Existing saves still use the `aseanSurvivor.v1` localStorage key. Saves are specific to the browser origin: changing hostname or port uses a different save slot.

## Visual remake

On phones, the lobby shows the selected stage and survivor together. **Change stage** opens the atlas and **Change survivor** opens the lineup. Tap **Done** to return, then **Enter** to launch. Patch notes are under **Menu**. During combat, tap **Map** to expand navigation or **Pause** to see run totals and inspect **Gear**.

The 3D campaign atlas opens in Johor. Peninsular Malaysia uses elevation-based terrain with exaggerated mountain relief, mapped coastlines and shaded offshore shallows. Gold marks the West Coast route and teal marks the East Coast route. Select an available stage pin to update the mission briefing, or choose **Continue expedition** to select the next stage on your route. Select **Enter** to start. **Tour route** follows the selected branch and previews the ten planned stops, the arrows step through those stops, and **Overview** frames the whole itinerary. Stage pins work with a keyboard and on the flat map fallback.

**Next stage** after a saved victory takes you to the first uncleared stage on your chosen coast. Once that coast is complete, it takes you to the first uncleared stage on the other coast. Recording all ten clears earns the Malaysia ending with **Play again** and **Choose hero**. With stage locking enabled, clearing Johor unlocks the first mission on each branch. Each branch then follows its mission order. Clearing Kuala Lumpur opens Selangor and keeps Perak available for returning players. Existing clear records and retained unlocks still apply.

Choose one of twelve survivors from the sprite wheel by scrolling, dragging sideways, using the arrows, or tapping a character. The selected survivor moves to the foreground and previews their basic attack, three active skills, and ultimate in order. Use the pause button in the lineup to stop the preview. With reduced motion enabled, the selected survivor holds their idle pose. Keyboard users can focus the selected portrait and use the arrow keys. Select a skill below the lineup to read its effect. Type uses three roles everywhere: Cinzel for display titles (`--display`), the bundled Spectral Semibold for names and card titles (`--serif`), and Chakra Petch for interface text and in-world battle labels (`--ui`).

The HUD, hero portraits, controls, upgrades, pause, and results screens share a jade-and-gold visual style. Three.js renders the battlefield, directional hero sprites, local monster and scenery sprites, telegraphs, and floating damage numbers.

All ten stages have distinct connected 8,640 × 8,640 regions, each with seven landmarks, local terrain and a signature enemy. All twelve heroes use eight-direction movement, idle and attack sprites. The seven additional heroes load their motion and skill sheets when you enter a run. Q/E/F/R each have distinct eight-direction windup and release poses, followed by a shared recovery pose. Johor now has run-local rescue/weapon, ward/charm and hunt/relic encounters; music remains future work.

## Hero signatures

Every hero now has a combat loop shown in the lobby and a color-coded meter during play. Ready skills glow; linked auto-cast skills can also spend their signature power.

| Hero | Signature | How to use it |
| --- | --- | --- |
| Fadli — Keeper of the Dawn | Sanctuary | Four basic attacks ready F to create a five-second healing ward. Inside the orange ring, eight luminous tiles send up staggered columns of light around the green inscription يشفي (“heals”). |
| Kama — Midnight Rider | Redline | Travel to fill the meter, then Q for a longer burning dash with 75% more impact damage. Partial charge decays while idle; full charge waits for you. |
| Nok — The Unbroken | Rhythm | Chain three Q/E/F casts, switching skill each time within six seconds, to release an area strike that stuns normal enemies. |
| Lan — Mistweaver | High Tide | Non-periodic hits against slowed enemies fill Tide. Empower E for two extra guards, 50% more guard damage, and 14-second lifetimes. Ten guards remain the cap. |
| Sari — The Twilight Blade | Riposte | Counter contact or a projectile with F, then Q within four seconds for 50% extra kick damage and an immediate E reset. |
| Auntie Karen (Singapore) | Chope & Cash Out | Chope an area with tissue packets on Q, charge chopes with basics, then cash out each one with a direct E payout. F shouts a forward complaint cone. |
| Captain "Pag Pag" Garcia (Philippines) | Second Serving | Line up ghosts for Tin Lid Skipper or catch a blow with Stockpot Guard. E spends up to three portions on healing and steam. At three, the pot boils over again where you served it. |
| The Gold Sultan (Brunei) | Make It Rain | Q spins the gold melter three times over 1.8s and boosts movement speed by 35% during the sweep. E boosts damage by 25% and basic attack rate by 50% for 5s. F automatically drops five waves of coins on the biggest nearby group. R fires piercing gold bars that you steer by moving. |
| Vanna (Cambodia) | Foldstep | E sends a shuttle through up to three foes, stitching them for bonus Q damage. F summons an orbiting silk familiar that strikes nearby foes and intercepts shots that hit the cloth. R weaves a 500-unit square for four seconds, stunning foes as they enter and shredding them every 0.4 seconds. |
| Keo (Laos) | Open Measure | Cast Q, E or F 1.5–2 seconds after the previous skill for bonus damage. |
| Nadi (Myanmar) | Perfect Recall | Thousand Palms (Q) lands up to 99 close-range strikes per foe. Nine criticals prime Hand of Buddha (E) for +50% wave damage. F guards and counters one hit. R raises a protective statue and three spectral monks. |
| Lia Soares (Timor-Leste) | Shadow Assassin | E vanishes and blinks in one press. Aim at a foe to backstab and heal for 25% of the health taken. The smoky illusion gives attackers inside it a 60% miss chance. F sweeps nearby enemies and slows them. |

Signature power resets between runs. Nadi’s redesign preserves the `nadi` ID and existing ownership and upgrade progress. Directional movement/attack sprite cycles, Nok's visible leap, and distinct spanner, kris, puppet, light-bolt, and dragon effects provide combat feedback.

Kama banks into turns. His exhaust follows the muffler through each riding pose, burns orange at Redline, and turns blue during Superman boost. Wheelie and boost leave a fading tyre mark along the bike’s path. Nok launches knee-first through a 120° forward arc. Landing Turning Elbow within 1.2 seconds readies the knee again, allowing Q → E → Q to release Rhythm. A raised ember crescent tracks the airborne knee and a raised ridge traces each elbow. Ember Flying Knee rings once when its outer edge connects and marks each contact with a spark. Sari’s returning kris gains a hooked rose trail. Fadli’s Seruan calls a spectral Hang Tuah-inspired Silat Saka into a low guard and sweeping keris strike. Its expanding ring marks the knockback radius. Seruan draws an ember from each burning target it collects, and Lan’s Ripple Troupe outlines the splash radius when a guard strikes a soaked target. The [combat feedback checks](tests/original-combat.html) replay these interactions and capture [gameplay frames](docs/evidence/original-combat/gameplay.png).

## Browser verification

Open `http://localhost:5173/tests/ui-smoke.html`, select **Run checks**, and keep the tab active until it reports `PASS`. The check covers the renderer, twelve heroes, both campaign routes, movement, pause/resume, upgrades, raid rewards and return, retry, and responsive layout. **Download report** produces a repeatable JSON evidence artifact. It restores the origin's previous save after the run; use a separate browser profile when testing purchases or progression manually.

The development-only `window.__asean` handle exposes the active runtime and Three.js scene to this check. It is absent from production builds. See [docs/architecture.md](docs/architecture.md) for boundaries and the next development milestones.

## Code layout

| File | What it holds |
| --- | --- |
| `index.html`, `ui.css` | Accessible HTML interface and responsive styling |
| `src/main.ts` | Three.js bootstrap and asset loading |
| `src/scenes/SurvivalScene.ts` | Native sprite rendering, camera, scenery, and combat telegraphs |
| `src/content/core.js` | Stage, base hero, passive, and evolution definitions |
| `src/game/runtime.js` | Combat simulation, input, saves, UI binding, and module registry |
| `src/game/heroes-sea.js` | Nok, Cô Lan and Sari mechanics |
| `src/game/hero-identities.js` | Hero signature rules, meter metadata, and casting feedback state |
| `src/game/raid.js` | Portal and Hantu Raya mechanics |
| `assets/` | Generated environment art and character atlas |
| `tests/` | Browser acceptance harness |

The new engine and rendering layer use strict TypeScript. Retained combat modules remain JavaScript behind an explicit runtime declaration; they are linted but are not yet fully type-checked.

## Design

See [DESIGN.md](DESIGN.md) for heroes, the ghost roster, stages and the respectful-portrayal guidelines.

## Animation review

Open `http://localhost:5173/tests/animation-gallery.html` to compare all twelve heroes, choose any of eight directions, switch movement/basic attack cycles or Q/E/F/R poses, and pause or step individual frames. The gallery and game share the atlas registry in `src/content/hero-art.js`. Each sheet has eight equally spaced directions, starting east and turning clockwise.

Movement cycles run at ten frames per second. Attacks use their own aim direction: basics play over 0.32 seconds; individual skill choreography lasts 0.4–1 second as defined in `src/content/skill-visuals.js`. Basic attacks cannot interrupt an active skill pose. Animation reads simulation time, so pause, upgrades, hit-stop and game-over freeze playback; damage and hitboxes remain simulation-owned. Browser checks verify all directional cycles and idle/pause transitions.

## Combat effects and numbers

Basic attack upgrades stack for every hero. Rank 2 unlocks Pierce, rank 3 chains to one nearby foe for 65% damage, rank 4 forks two half-damage shards on impact, and rank 5 returns the original shots to the hero for another pass. Lan and Sari already pierce and return, so Pierce adds 25% damage after the first target and Return adds 50% damage on the way back. Nok and Captain "Pag Pag" Garcia begin launching piercing waves at rank 2. Every hero gains one extra projectile when their basic attack reaches rank 3 and another at rank 5. Nok and Captain "Pag Pag" Garcia launch travelling waves alongside their melee hits. Lan also gains a puppet at rank 4. The level-up card shows the projectile count before and after each increase. [See the four basic upgrades in combat](docs/screenshots/basic-attack-upgrades.webp).

The battlefield uses a hero’s packaged effect sheet for basic, Q, E, F and R. Painted sprites follow the live projectiles, return paths, delayed strikes and ground fields. Basic projectiles travel at hand height with a dark painted edge, and narrow ground attacks fill more of their marked lanes. Moving shots leave two-tone trails that turn with them. Sweeps carry a bright leading edge, hits throw directional sparks, and segmented waves travel across area casts. Raised folds, lit edges and ground reflections give each kit a distinct silhouette, from Auntie Karen’s folded vouchers and Vanna’s woven silk to Keo’s open reeds and the Gold Sultan’s handheld gold-bar melter. Ultimates add animated geometry to the painted art, including light climbing Fadli’s shelter, Sari’s opening wings and the glowing firebox on Captain "Pag Pag" Garcia’s stove cart. Reduced motion holds the decorative poses while live projectiles still track their targets. Floor outlines and signature markers show reach and readiness. Heroes awaiting a sheet use the muted ribbon rendering. [Watch six skills in motion](docs/screenshots/hero-skill-volumes-motion.webp) or [view all 60 casts](docs/screenshots/hero-skill-effects.webp).

Combat numbers use bold outlined text: white for normal damage, gold with a burst for criticals, red for incoming damage, green for sanctuary healing, and violet for damage over time. Values are rounded from the amounts applied by combat rules. Numbers fan into five lanes, pop upward, then fade; reduced-motion settings remove their bounce and lateral travel. Simulation time freezes popups with pause/upgrades. The 140-label and 600-effect limits bound crowding; active spell effects are retained before incidental particles when pruning.

On phones, look for warm outlines with inward-pointing teeth on damaging circles, rings, lanes, and polygons. Blue dashed circles with wavy lines mark oil and brine or appear under the survivor when snared, chilled, or disrupted. Mint chevrons frame recovering pack attackers, vulnerable Armoured elites, and Tenggiling Rollers that uncurl or are stunned mid-roll. Nearby targets also get an **Exposed** label. Two quick strikes and a rising sweep announce a new nearby danger, a descending tone marks entering slow ground or gaining one of those statuses, and a rising two-note chime signals a new nearby opening. These sounds are rate-limited. Reduced motion keeps the shapes, labels, and sounds and removes the brightening during monster windups.

For repeatable visual inspection, open `/tests/combat-effects.html` on the development server. Select a hero and a basic attack or active skill. Choose Release (0.1s) to inspect the hero’s directional cast silhouette, or freeze a later frame to inspect its impact or sustain against durable targets. This fixture forces critical chance for review; it does not alter the normal game's balance or save format.

## Unique skill choreography

All 48 active skills have two character poses per direction in the hero skill atlases. The table below describes the original five heroes’ ribbon effects. Ultimates keep their existing damage, cooldowns, and targeting. Persistent effects follow their owner or remain anchored to the cast location as appropriate; pauses freeze their simulation clock.

| Hero | Q | E | F | Ultimate |
| --- | --- | --- | --- | --- |
| Fadli | Dawn ray fan | Sparkling bead orbit | Expanding voice waves | Tall protective dome, light ribs and perimeter pillars |
| Kama | Wheelie and a skid mark | Hot exhaust and scorched road | Sonic horn rings | Superman pose with a blue boost plume |
| Nok | Flying knee sprite and ember crescent | Spinning elbow crescents | Wai Khru Poise blessing | Leap marker, landing shockwave, ground cracks and debris |
| Lan | Dragon launch trail | Puppet tethers | Splash ripples and droplets | Festival of Rain fountains, concentric water rings and falling strikes |
| Sari | Double crescent kick | Tiger-step streaks | Petal-shaped counter guard | Spreading Garuda feather wings and falling feather strikes |

`assets/SKILL_PROMPTS.md` records artwork generation. Use the animation gallery to inspect the two skill poses and the combat-effects fixture to inspect the full combined presentation.

## Skill sound effects

All twelve heroes have synthesized basic/Q/E/F/R cues (60 total), authored in `src/game/skill-audio.js`. Fadli uses layered chimes, Kama engine/horn tones, Nok percussion and impacts, Lan water-like noise and ascending notes, and Sari metallic sweeps. Ultimates add low impacts, buildup layers and longer tails; Nok's impact is delayed into the leap sequence. These are procedural fantasy sounds, not recordings or Ragnarok assets.

Sound unlocks on the first pointer/key interaction. **Sound on/off** and **Effects volume** controls are available under **Settings** in the lobby and in the pause menu at every screen size. Preferences use the separate `aseanSurvivor.audio` localStorage key. Unsupported/blocked audio leaves the game playable silently.

Successful casts—including automatic basic attacks—play their matching cue. Blocked casts stay silent. Eight simultaneous cues, per-cue retrigger limits, quieter basics, ultimate priority/ducking and a master compressor control crowding. Pause, upgrades, defeat, hidden tabs and returning to the menu stop tails; resume does not replay old sounds. Buffs have onset cues, not continuous audio loops.

Open `/tests/audio-smoke.html` to audition each cue, run browser audio checks, or download a WAV sampler of the five ultimates in roster order. The checks validate distinct finite waveforms, peak limits, actual Web Audio unlock/playback scheduling, cast rejection, voice priority, persistence and lifecycle silence. Speaker/headphone tuning and real-phone audio latency require listening tests.

## Open stage regions

Each stage has seven connected landmarks. Two destinations sit beyond the old map, with hand-laid approach roads, plazas and crossings. The amber-ringed point on the minimap marks the featured local landmark. The survival clock and boss arrival remain active while exploring.

Broad routes connect every region. Johor has three river crossings. Buildings, tree trunks and deep river water block ground movement. Shallow paddies remain traversable. Enemies route around blockers toward the player using a shared navigation field, and normal waves spawn outside the visible area on valid ground. Rifts and power-ups also use valid ground positions. Nok can leap over obstacles but must land on valid ground.

The minimap marks the player, river crossings and landmarks. Visited landmarks turn jade; claimed supply caches turn gold. Guarded sites summon three guardians on discovery. Defeat those guards and approach the cache to receive the location’s coin reward (18–34 coins), up to 30 HP, and 25% ultimate charge. Rewards and discoveries reset each run. Cache rewards deliberately change run progression; they need longer balancing playtests.

The original districts live in `src/content/regions.js`. `src/content/outer-districts.js` places the new landmarks and approach routes. `src/content/world.js` supplies Johor and shared collision/navigation. `RegionWorld.ts` draws the terrain and `RegionMap.ts` renders the minimap. `/tests/stage-worlds.html` checks all ten regions, landmark routes, cache rewards, local enemy attacks and stage switching.

Buildings and trees sit beside the roads, with open space at crossings, caches and interaction points. Kuala Lumpur has marked asphalt avenues, concrete sidewalks and distinct shophouse, kopitiam, hawker, arcade, office and monorail sprites. The other districts use local frontage such as Penang’s timber waterfront stores, Kedah’s granaries, Terengganu’s boat sheds and Kelantan’s batik workshops.

| Stage / region | Local setting | Signature enemy |
| --- | --- | --- |
| Johor — Straits Kampung | Stilt houses, riverside market, Bukit Timbalan Terrace and Straits Landing | Palm Stalker charges after a warning |
| Melaka — Sungai Melaka Quays | Red-brick quays, Stadthuys Steps and Jonker Street Arcade | Lantern Wraith fires an ember fan |
| Kuala Lumpur — Jalan Alor After Dark | Food-stall lanes, the monorail depot, Twin Towers Esplanade and Central Market Lane | Neon Shade dashes and fires flanking bolts |
| Selangor — Klang River Quays | Market streets, twin river crossings, Old Quay Warehouse and Port Klang Lookout | Mooring Wraith fires three staggered bolts down a marked line |
| Perak — Kinta Tin Basin | Limestone outcrops, Tanjung Tualang Dredge and Kinta Karst Gate | Tin Sentinel slams the ground |
| Pulau Pinang — George Town Timber Jetties | Waterfront shophouses, Chew Jetty Landing and Armenian Street Corner | Jetty Drifter leaves slippery brine |
| Kedah — Sawah Pintu Air | Rice plots, Muzium Padi Forecourt and Gunung Keriang Footpath | Paddy Watcher fires a straw fan |
| Pahang — Kuantan Mangrove Reach | Nipah palms, Kuantan 188 Promenade and Nipah Canopy Walk | Nipah Rootling marks the player's position before striking |
| Terengganu — Duyong Boatbuilding Inlet | Boat sheds, Pasar Payang Courtyard and Duyong Outer Slipway | Slipway Crab sends foam down two parallel lanes |
| Kelantan — Kota Bharu Kite Fields | Wau workshops, Kampung Kraftangan Court and Padang Layang Lookout | Wau Wisp fires a ring of darts with one gap |

Each stage introduces four folklore-inspired variants at 24, 36, 53 and 66 seconds. Each has a dedicated sprite and ground telegraph. On the road to Johor's Palm groves, an orang bunian wayfarer offers directions back to the village clearing. See the [folklore roster, counterplay and sources](docs/folklore-monsters.md).

At **Chew Jetty Landing**, approach the winch and select **Lower gangway**. Stay within reach for 1.8 seconds while the survival clock continues. Moving away or losing HP interrupts the attempt, and you can restart. The lowered gangway links Chew Jetty to the Fishing Platform for the rest of the run. Enemies can cross it, and the minimap marks the open route. A new Penang run starts with the gangway raised.

At **Padang Layang Lookout** in Kelantan, lure ghosts into the marked lane and select **Raise the wau** at the reel. The kite takes 1.2 seconds to launch, and you can move away immediately. The gust sweeps east, pushing and briefly stunning ordinary ghosts in the lane. Players and bosses are unaffected. The reel is ready again 12 seconds after the sweep. The lookout replaces its guarded cache.

The maps are fictional districts that bring local landmarks and trades into the campaign at playable scale. Selangor draws on Klang’s heritage streets and riverfront. [Tourism Selangor](https://selangor.travel/exploring-royal-klang-a-journey-through-heritage-culture-and-flavours/)

The terrain combines a shared 2,048 × 2,048 detail map with three painted surfaces per stage. The regional materials include leaf litter and packed earth in Johor, quay brick in Melaka and Selangor, patched asphalt and concrete in Kuala Lumpur, limestone chips in Perak, shell grit and weathered boards in Penang, rice stubble in Kedah, tidal mud in Pahang and Terengganu, and sedges and silt in Kelantan. Roads climb onto two authored landforms per stage, including Bukit Timbalan’s hillside terrace, the Stadthuys steps and the ridge at Padang Layang. The minimap shows elevation contours. Coconut palms, mango trees, banana clumps and casuarinas gather along field margins and river banks. Ferns, grasses, pandan and loose stones mark the grove edges. Each stage has three arranged street or work scenes, such as Jalan Alor’s hawker corner, Chew Jetty’s net-mending deck and Duyong’s boatbuilding yard. Steam drifts from carts, pennants catch the breeze, and moored sampans rock with the current. Pause freezes the scene, and reduced motion holds it still.

Pocong, Toyol, Orang Minyak and Pontianak use painted idle, travel, windup and release frames. Regional signatures use their own idle, travel and release art, while folklore variants animate their individual silhouettes. Windup and recovery follow the combat clock, and reduced motion retains the ground warnings. The Johor traveller beckons for help and relaxes once the captors are defeated.

### Elemental monster skills

Regional signature monsters alternate their opening attack with a second named skill. From 0:24, regular Pocong, Toyol, Orang Minyak and Penanggal can use an additional attack alongside their existing behaviors. These 14 moves show their element and lock their ground markers during windup. Dim markers land on a later beat. Fire, water, lightning, and spirit attacks use the survivor’s primary element to resolve damage affinity. Physical attacks deal neutral damage.

| Monster | Additional skill | Dodge |
| --- | --- | --- |
| Palm Stalker | Briar Rake · Physical | Leave the two angled claw lanes. |
| Lantern Wraith | Ember Spill · Fire | Clear the center burst and watch the two side embers. |
| Neon Shade | Livewire Cross · Lightning | Step diagonally between the crossing lanes. |
| Tin Sentinel | Fault Coil · Lightning | Leave the center, then avoid the outer ring. |
| Jetty Drifter | Undertow · Water | Leave the swell and watch for the cross-current. |
| Paddy Watcher | Scorched Furrows · Fire | Sidestep the three staggered rows. |
| Nipah Rootling | Root Snare · Physical | Follow the opening between the roots. |
| Slipway Crab | Breakwater · Water | Step through the gaps between advancing waves. |
| Wau Wisp | Cutting Strings · Lightning | Move away from the three intersecting strings. |
| Mooring Wraith | Tide Knot · Water | Use the pocket inside the ring and avoid the two follow-up pools. |
| Pocong | Shroud Wake · Spirit | Step sideways from the two hopping impacts. |
| Toyol | Ember Pounce · Fire | Dodge across the edge of the pounce. |
| Orang Minyak | Slick Flare · Fire | Clear the burning rim, then sidestep the flare lane. |
| Penanggal | Spirit Fangs · Spirit | Stay between the two fang paths or move outside them. |

Twenty-one regional rare enemies add one signature mechanic each, including death effects, shell wards, curses and elemental bolts. Dulang Harta drops the exclusive Dulang Timah relic. See the [full roster and counterplay](docs/night-foes.md).

### Regional wave specialists

Each stage adds two local specialists to regular waves. The first can appear at 0:18 and the second at 0:42. Level-ups restore **25% of maximum HP**, capped at full. Ketupat restores 35%, so a recovery pickup can matter even when a blessing is close.

| Enemy | Attack | Counterplay |
| --- | --- | --- |
| Tenggiling Roller | Iron Roll reduces damage taken by 45% during the charge. Uncurling leaves it taking 30% more damage for 1.15 seconds. | Sidestep or stun the roll, then spend a skill on the exposed pangolin. |
| Gua Kelawar | Cave Screech slows skill recharge by 35% for 2.5 seconds if it deals damage. | Step outside the cone. Ready skills and basic attacks remain available. |
| Biawak Arus | Ebb Current comes back along a slightly wider lane after the first pass. | Stay clear until the return has broken. |
| Dusun Beruk | Orchard Volley leads movement and bursts twice farther along the approach. | Change direction when the fruit marks lock. |

### Hunting packs

Stages schedule up to three hunting packs at 0:58, 1:52, and 2:33. Kuala Lumpur’s shorter run gets them at 0:59, 1:34, and 1:50. The first pack has two monsters, then later packs send three. Packs approach from separate directions near your route and wait for the previous pack and any active quest to clear. Terrain can delay an arrival until the entire pack has a walkable approach.

In combat, Belang Prowler tries to cut ahead of the survivor’s heading. Bakau Belangkas backs out to casting range, Enggang Stormwing takes the other flank, and Limestone Seladang keeps close to a packmate. On narrow terrain they use the same navigation as the horde until they have room to spread. Only one member winds up or resolves a named attack at a time. A ready monster takes the turn when it has a usable angle and its warning leaves a walkable dodge. Aim locks as soon as the warning appears.

After a cast or charge, the attacker is **Exposed** for 0.75 seconds and takes 20% extra damage. A Seladang’s guard drops during that window.

| Monster | What it does | Counterplay |
| --- | --- | --- |
| Belang Prowler | A Malayan tiger spirit leads your movement, then lunges through its fire lane. | Change direction as soon as the lane locks. |
| Bakau Belangkas | A mangrove horseshoe crab spirit leaves brine that cuts walking speed by 28% while you stand in it. The pool dries up after three seconds. | Dodge wide or dash across the pool before the next attack. |
| Limestone Seladang | A gaur spirit protects nearby packmates from 35% of incoming damage and breaks the ground in two beats. | Stun, frighten, or defeat the gaur to drop the protection. |
| Enggang Stormwing | A hornbill spirit sweeps two electric lanes in succession. | Cross the first lane and move into the space it leaves. |

### Johor encounter sequence

Johor’s first hunting pack can start the pursuit from 0:58. Arang Bara can appear from 1:09 until just before 1:20, at least four seconds after the pack arrives and once the active warnings clear. During this sequence, its death ember stays over the XP drop and blocks pickup until the blast clears. The ordinary horde keeps coming through the lull from 1:20. The Pocong surround can begin from 1:27 once the battlefield warnings clear. Other stages keep the 1:15 surround and their usual rare-enemy schedule.

### Route encounters and veteran medals

Every stage has one fight shaped by its local terrain. Select the encounter in the map’s route menu during a standard run or tick the **Veteran** option under the stage briefing to start there. The veteran opening adds the stage’s hunting pair and gives the encounter enemies 25% more HP. Defeat all of those enemies and the stage boss to save a cosmetic medal displayed in that stage’s briefing.

| Stage | Movement problem |
| --- | --- |
| Johor | Use the edges of the market bridge when the stalker rakes its middle. |
| Melaka | Cross the north bridge between a sequence of ember bursts. |
| Kuala Lumpur | Change lanes at Jalan Alor after the first sweep clears. |
| Perak | Step away from the dredge’s inner shockwave, then move in before the outer ring strikes. |
| Penang | Wait out the main Long Jetty sweep or use the connected lower boardwalk. |
| Kedah | Cross through slow water or dodge the Paddy Watcher’s ranged attack on the eastern flank. |
| Pahang | Keep moving through staggered root patches on the south boardwalk. |
| Terengganu | Thread the gap between two foam lanes on the Duyong slipway. |
| Kelantan | Switch sides as crosswinds sweep the raised road. |
| Selangor | Step off the rope line and read the delayed cross-sweep at the landing. |

The **Run recap** shows actual HP lost by damage category, the biggest source, effective healing from level-ups and supply caches, and how many **Exposed** openings you hit. Several hits during one opening count once. **Replay setup** restores the same survivor, stage route, veteran setting, starting upgrade ranks, auto-cast mode, and seed. Movement, timing and upgrade choices still shape the run. **Play again** starts with a fresh seed and current permanent upgrades.

### Stage boss escorts

Each campaign boss arrives with two local spirits. The first carries a ward that reduces incoming damage to the boss by 45%. The boss bar shows **Ward Active**, and a green tether connects the keeper to the boss. Stun, frighten, or pull the keeper out of range to open a damage window. Defeating the keeper breaks the ward for the rest of the fight.

At half health, the boss calls a second pair without a ward. Clear the first pair before pushing the threshold if you want fewer enemies in the final stretch. The escorts take turns using their named attacks. Defeating the boss dispels any surviving escorts.

At half health, Raja Toyol also sends two Toyol after loose spirit embers once both have a clear place to spawn. An arrival banner and orange rings mark the pair, and nearby labels change from **Ember runner** to **Carrying ember** after a theft. A loaded runner flees for up to eight seconds. Defeating it or letting it escape drops the exact stolen XP for pickup. If Raja Toyol falls first, the surviving runners disappear and their stolen XP returns to the survivor.

| Monster | Attack | Counterplay |
| --- | --- | --- |
| Kompang Husk | Rolling Thunder lands on the outer ring, then strikes the center. | Stay inside for the first beat and move into the spent ring. |
| Bubu Snapjaw | Closing Weave brings the bamboo jaws together in three lanes. | Leave through either open end before the center closes. |
| Getah Binder | Tapping Trail stamps three spirit pools in sequence. | Cross the row of marks before it reaches you. |
| Beca Revenant | Hot Lap rushes down a wheel lane and throws two delayed ember bursts beyond it. | Sidestep the wheel lane and give the far end room. |

### Three.js campaign and skills

Three.js renders both campaign branches and the Hantu Raya raid. Directional heroes, NPCs, monsters, trees and buildings are 2.5D sprites with shadows projected onto the 3D terrain.

| Hero | New skill interaction |
| --- | --- |
| Fadli | Seruan (F) restores 4 HP per burning target hit, up to 12 HP per cast. Use Cahaya Fajar (Q) to set up the heal. |
| Kama | Hon Kuat (F) consumes nearby exhaust patches. Each ghost in the resulting bursts takes the bonus damage once per cast. |
| Nok | The outer 28% of Ember Flying Knee (Q) deals 50% more damage and briefly stuns ordinary ghosts. |
| Lan | A guard hitting a soaked ghost splashes nearby enemies for 60% of the guard’s damage. Each soaked target can trigger a ripple every 0.65 s. |
| Sari | Crescent Reap (Q) triggers Tiger Step echoes inside its sweep early. Echoes outside the arc keep their own timers. |

Open `/tests/combat-effects.html` on the development server to choose a region, hero, skill and cast moment. The preview uses real casts and can freeze the effect for inspection.

The default battlefield uses Three.js for heroes, enemies, props and their frame-shaped ground shadows. A character’s silhouette changes with facing and attack pose. Nok’s leap offsets and softens her shadow as she rises. The yellow XP bar runs across the top of the screen. Current HP appears above the player sprite, and the hero panel shows exact HP and signature charge. Announcements appear in large type near the center of the battlefield. Select the region name to expand or collapse the map, and use **Gear** to inspect equipment. Each hero has four illustrated skill buttons with cooldown and ultimate-charge indicators.

The skill audit rates every basic and active slot and explains the nine redesigned interactions in [DESIGN.md](DESIGN.md#skill-audit-and-redesign). [See all five Gold Sultan skill effects](docs/screenshots/gold-sultan-skill-effects.webp). Keyboard and touch use the same four active skill slots.

The Gold Sultan leaves a short trail as he moves with Q and plays one thump per turn. F outlines the chosen landing area as soon as it casts and flashes when the first coins hit. E shows the buff’s remaining seconds beside its cooldown. [See the combat cues](docs/screenshots/gold-sultan-readability.webp).

Choose a survivor and select **Practice signature** to try their signature in the Johor clearing. Follow the prompt using movement and the usual skill keys or touch buttons. Enable **No cooldown** to repeat active skills immediately and cast the ultimate without charge. The option stays enabled when you retry the lesson. Return to picker keeps your survivor and mission selected. Practice uses base stats and awards no coins or campaign progress.
