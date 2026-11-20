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
| Move | WASD or arrow keys (on a phone, drag on the left side of the screen) |
| Cast a skill early | Q, E, F |
| Ultimate | R or Space |
| Switch the auto-cast combo (Q+E, Q+F, E+F, all, off) | T or the AUTO button |
| Pause | Esc or P |
| Pick a level-up card | 1, 2, 3 |

## What's in the prototype

- **5 heroes:** Ustaz Fadli and Mat Rempit "Kama" (Malaysia), Nok (Muay Thai, Thailand), Cô Lan (water puppeteer, Vietnam), Sari (pencak silat, Indonesia).
- **Malaysia routes:** Both branches start in Johor. West Coast runs through Melaka, Kuala Lumpur, Perak, Pulau Pinang and Kedah. East Coast runs through Pahang, Terengganu and Kelantan. Kuala Lumpur keeps its two-minute boss arrival and triple coin-drop chance.
- **Auto-cast combos:** link two skills and they fire together so their combo triggers.
- **Ability specializations.** From level 3, pick one of two paths for one of your existing skills or take the third blessing to decide later. The path lasts for this campaign run. [Choices and encounter measurements](docs/specializations.md)
- **Combos and evolutions:** skills used together get bonuses. Blessing cards show the values that change at the next rank. Completing a rank-5 recipe with its matching passive makes the evolution available as a separate blessing. One eligible evolution is offered at a time. Pin a recipe in the blessing picker to see its progress and highlight matching cards throughout the run. Change the recipe or select “No pin” any time the picker opens. All twelve survivors have evolutions (22 recipes in total). Select a skill in the survivor wheel to see its recipe and combat effect. Fusion Orbs can grant any unclaimed recipe for the current hero at any skill rank.
- **Power-ups:** Ketupat (heal), Besi Berani (magnet), Mercun (hits every ghost on screen), Kopi Kaw (fast recharge), Payung (shield).
- **Elite equipment drops.** At 45 seconds, a larger regional spirit joins the fight and uses its signature attack. Another can arrive every 55 seconds before the boss if the previous regional elite has fallen. Defeated elites leave a marked equipment chest. Walk over it to choose gear for the current run. Quest completion still grants its own reward.
- **Boss deadline:** when the boss arrives, the goal line counts down from 5:00. The boss keeps pace with your survivor and enrages every minute; if it outlasts the countdown, the night swallows the stage and the run is lost.
- **Portal raid:** a red-eyed banyan arch appears once per stage. It opens into a moonlit blackwater clearing surrounded by tangled roots. Inside is Hantu Raya, a raid boss that drops a Fusion Orb (free evolution) or a big XP buff.
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

The 3D campaign atlas opens in Johor. Peninsular Malaysia uses elevation-based terrain with exaggerated mountain relief, mapped coastlines and shaded offshore shallows. Gold marks the West Coast route and teal marks the East Coast route. Choose a route or select any available stage pin to update the mission briefing, then select **Enter** to start. **Tour route** follows the selected branch and previews the ten planned stops, the arrows step through those stops, and **Overview** frames the whole itinerary. The mission list also works with a keyboard and on the flat map fallback.

**Next stage** after a saved victory takes you to the first uncleared stage on your chosen coast. Once that coast is complete, it takes you to the first uncleared stage on the other coast. Recording all nine clears earns the Malaysia ending with **Play again** and **Choose hero**. With stage locking enabled, clearing Johor unlocks the first mission on each branch. Each branch then unlocks one stage at a time, and existing clear records and retained unlocks still apply.

Choose one of twelve survivors from the sprite wheel by scrolling, dragging sideways, using the arrows, or tapping a character. The active hero moves to the foreground. Keyboard users can focus the selected portrait and use the arrow keys. The basic attack and four skills below the lineup update with each selection. Select a skill to read its effect. The selector heading and hero names use the bundled Spectral Semibold typeface.

The HUD, hero portraits, controls, upgrades, pause, and results screens share a jade-and-gold visual style. Three.js renders the battlefield, directional hero sprites, local monster and scenery sprites, telegraphs, and floating damage numbers.

All nine stages have distinct connected 8,640 × 8,640 regions, each with seven landmarks, local terrain and a signature enemy. All twelve heroes use eight-direction movement, idle and attack sprites. The seven additional heroes load their motion and skill sheets when you enter a run. Q/E/F/R each have distinct eight-direction windup and release poses, followed by a shared recovery pose. Johor now has run-local rescue/weapon, ward/charm and hunt/relic encounters; music remains future work.

## Hero signatures

Every hero now has a combat loop shown in the lobby and a color-coded meter during play. Ready skills glow; linked auto-cast skills can also spend their signature power.

| Hero | Signature | How to use it |
| --- | --- | --- |
| Fadli — Keeper of the Dawn | Sanctuary | Four basic attacks ready F to create a five-second healing ward. |
| Kama — Midnight Rider | Redline | Travel to fill the meter, then Q for a longer burning dash with 75% more impact damage. Partial charge decays while idle; full charge waits for you. |
| Nok — The Unbroken | Rhythm | Chain three Q/E/F casts, switching skill each time within six seconds, to release an area strike that stuns normal enemies. |
| Lan — Mistweaver | High Tide | Non-periodic hits against slowed enemies fill Tide. Empower E for two extra guards, 50% more guard damage, and 14-second lifetimes. Ten guards remain the cap. |
| Sari — The Twilight Blade | Riposte | Counter contact or a projectile with F, then Q within four seconds for 50% extra kick damage and an immediate E reset. |
| Asha Lim (Singapore) | Service Window | Ticket enemies with Q, serve them with basics, then collect with E. |
| Mira Reyes (Philippines) | Haul In | Land Rescue Hook to pull an ordinary enemy into reach. Press E within four seconds for an empowered Harbour Sweep. |
| Dani Rahman (Brunei) | Safe Landing | Set an anchor, move away, then return and use F for a shield. |
| Vanna (Cambodia) | Crossing Point | Cross the Q and E strips, then release the crossing with F. |
| Keo (Laos) | Open Measure | Cast Q, E or F 1.5–2 seconds after the previous skill for bonus damage. |
| Nadi (Myanmar) | Let It Set | Place lacquer layers with E and release mature layers with Q. |
| Lia Soares (Timor-Leste) | Catch the Return | Move into returning shuttles to collect spools, then spend them on E. |

Signature power resets between runs. These additions preserve hero IDs, saved ownership, existing skills, and evolutions. Directional movement/attack sprite cycles, Nok's visible leap, and distinct spanner, kris, puppet, light-bolt, and dragon effects provide combat feedback.

Kama banks into turns while the glint on his spanner follows its flight. Nok’s Ember Teep rings once when its outer edge connects and marks each contact with a spark. Sari’s returning kris gains a hooked rose trail. Fadli’s Seruan draws an ember from each burning target it collects, and Lan’s Ripple Troupe outlines the splash radius when a guard strikes a soaked target. The [combat feedback checks](tests/original-combat.html) replay these interactions and capture [gameplay frames](docs/evidence/original-combat/gameplay.png).

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

Skills use original Ragnarok-inspired layered effects: ground seals, light pillars, speed streaks, water ripples, impact arcs, and ultimate highlights. Three.js draws these effects with batched ribbons and ground markings. Cast visuals are emitted only after a successful cast; they do not change hitboxes, timing, or damage.

Combat numbers use bold outlined text: white for normal damage, gold with a burst for criticals, red for incoming damage, green for sanctuary healing, and violet for damage over time. Values are rounded from the amounts applied by combat rules. Numbers fan into five lanes, pop upward, then fade; reduced-motion settings remove their bounce and lateral travel. Simulation time freezes popups with pause/upgrades. The 140-label and 600-effect limits bound crowding; active spell effects are retained before incidental particles when pruning.

For repeatable visual inspection, open `/tests/combat-effects.html` on the development server. Select a hero and a basic attack or active skill. Choose Release (0.1s) to inspect the hero’s directional cast silhouette, or freeze a later frame to inspect its impact or sustain against durable targets. This fixture forces critical chance for review; it does not alter the normal game's balance or save format.

## Unique skill choreography

All 48 active skills have two character poses per direction in the hero skill atlases. The table below describes the original five heroes’ effects. Ultimates keep their existing damage, cooldowns, and targeting. Persistent effects follow their owner or remain anchored to the cast location as appropriate; pauses freeze their simulation clock.

| Hero | Q | E | F | Ultimate |
| --- | --- | --- | --- | --- |
| Fadli | Dawn ray fan | Sparkling bead orbit | Expanding voice waves | Tall protective dome, light ribs and perimeter pillars |
| Kama | Wheelie and twin trails | Exhaust flames | Sonic horn rings | Superman pose with long blue/gold speed wakes |
| Nok | Ember Teep impact spear | Spinning elbow crescents | Wai Khru Poise blessing | Leap marker, landing shockwave, ground cracks and debris |
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

The original districts live in `src/content/regions.js`. `src/content/outer-districts.js` places the new landmarks and approach routes. `src/content/world.js` supplies Johor and shared collision/navigation. `RegionWorld.ts` draws the terrain and `RegionMap.ts` renders the minimap. `/tests/stage-worlds.html` checks all nine regions, landmark routes, cache rewards, local enemy attacks and stage switching.

Buildings and trees sit beside the roads, with open space at crossings, caches and interaction points. Kuala Lumpur has marked asphalt avenues, concrete sidewalks and distinct shophouse, kopitiam, hawker, arcade, office and monorail sprites. The other districts use local frontage such as Penang’s timber waterfront stores, Kedah’s granaries, Terengganu’s boat sheds and Kelantan’s batik workshops.

| Stage / region | Local setting | Signature enemy |
| --- | --- | --- |
| Johor — Straits Kampung | Stilt houses, riverside market, Bukit Timbalan Terrace and Straits Landing | Palm Stalker charges after a warning |
| Melaka — Sungai Melaka Quays | Red-brick quays, Stadthuys Steps and Jonker Street Arcade | Lantern Wraith fires an ember fan |
| Kuala Lumpur — Jalan Alor After Dark | Food-stall lanes, the monorail depot, Twin Towers Esplanade and Central Market Lane | Neon Shade dashes and fires flanking bolts |
| Perak — Kinta Tin Basin | Limestone outcrops, Tanjung Tualang Dredge and Kinta Karst Gate | Tin Sentinel slams the ground |
| Pulau Pinang — George Town Timber Jetties | Waterfront shophouses, Chew Jetty Landing and Armenian Street Corner | Jetty Drifter leaves slippery brine |
| Kedah — Sawah Pintu Air | Rice plots, Muzium Padi Forecourt and Gunung Keriang Footpath | Paddy Watcher fires a straw fan |
| Pahang — Kuantan Mangrove Reach | Nipah palms, Kuantan 188 Promenade and Nipah Canopy Walk | Nipah Rootling marks the player's position before striking |
| Terengganu — Duyong Boatbuilding Inlet | Boat sheds, Pasar Payang Courtyard and Duyong Outer Slipway | Slipway Crab sends foam down two parallel lanes |
| Kelantan — Kota Bharu Kite Fields | Wau workshops, Kampung Kraftangan Court and Padang Layang Lookout | Wau Wisp fires a ring of darts with one gap |

Each stage introduces three folklore-inspired variants at 24, 36 and 53 seconds. Each has a dedicated sprite and ground telegraph. On the road to Johor's Palm groves, an orang bunian wayfarer offers directions back to the village clearing. See the [folklore roster, counterplay and sources](docs/folklore-monsters.md).

At **Chew Jetty Landing**, approach the winch and select **Lower gangway**. Stay within reach for 1.8 seconds while the survival clock continues. Moving away or losing HP interrupts the attempt, and you can restart. The lowered gangway links Chew Jetty to the Fishing Platform for the rest of the run. Enemies can cross it, and the minimap marks the open route. A new Penang run starts with the gangway raised.

At **Padang Layang Lookout** in Kelantan, lure ghosts into the marked lane and select **Raise the wau** at the reel. The kite takes 1.2 seconds to launch, and you can move away immediately. The gust sweeps east, pushing and briefly stunning ordinary ghosts in the lane. Players and bosses are unaffected. The reel is ready again 12 seconds after the sweep. The lookout replaces its guarded cache.

The maps are fictional districts that bring local landmarks and trades into the campaign at playable scale. Hand-painted ground, stone, earth, wood and water use the same palette as the landmark sprites. Signature monsters have illustrated idle, travel and attack poses. Folklore variants use their own silhouettes with procedural movement and combat poses. Windup and recovery motion follow the combat clock, and reduced motion retains the telegraphs. The Johor traveller beckons for help and relaxes once the captors are defeated.

### Three.js campaign and skills

Three.js renders both campaign branches and the Hantu Raya raid. Directional heroes, NPCs, monsters, trees and buildings are 2.5D sprites with shadows projected onto the 3D terrain.

| Hero | New skill interaction |
| --- | --- |
| Fadli | Seruan (F) restores 4 HP per burning target hit, up to 12 HP per cast. Use Cahaya Fajar (Q) to set up the heal. |
| Kama | Hon Kuat (F) consumes nearby exhaust patches. Each ghost in the resulting bursts takes the bonus damage once per cast. |
| Nok | The outer 28% of Ember Teep (Q) deals 50% more damage and briefly stuns ordinary ghosts. |
| Lan | A guard hitting a soaked ghost splashes nearby enemies for 60% of the guard’s damage. Each soaked target can trigger a ripple every 0.65 s. |
| Sari | Crescent Reap (Q) triggers Tiger Step echoes inside its sweep early. Echoes outside the arc keep their own timers. |

Open `/tests/combat-effects.html` on the development server to choose a region, hero, skill and cast moment. The preview uses real casts and can freeze the effect for inspection.

The default battlefield uses Three.js for heroes, enemies, props and their frame-shaped ground shadows. A character’s silhouette changes with facing and attack pose. Nok’s leap offsets and softens her shadow as she rises. The yellow XP bar runs across the top of the screen. Current HP appears above the player sprite, and the hero panel shows exact HP and signature charge. Announcements appear in large type near the center of the battlefield. Select the region name to expand or collapse the map, and use **Gear** to inspect equipment. Each hero has four illustrated skill buttons with cooldown and ultimate-charge indicators.

The skill audit rates every basic and active slot and explains the nine redesigned interactions in [DESIGN.md](DESIGN.md#skill-audit-and-redesign). Try Lia’s Recall Bell during an outbound ultimate, or place Dani’s beacon behind a pack and aim Breakwater Thrust through it. The design uses the existing keyboard and touch controls and the existing save format.

Choose a survivor and select **Practice signature** to try their signature in the Johor clearing. Follow the prompt using movement and the usual skill keys or touch buttons. Retry resets the lesson, and Return to picker keeps your survivor and mission selected. Practice uses base stats and awards no coins or campaign progress.
