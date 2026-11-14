# ASEAN Survivor

A top-down 2D survive-the-horde game. Pick a hero from Southeast Asia and fight your way north from Johor, fighting ghosts from each country's folklore: toyol, pocong, penanggal, orang minyak, pontianak and more.

It is an original game in the survivor-like genre, with its own heroes, ghosts and rules. Each hero has a MOBA-style kit: an auto basic attack, three skills and an ultimate.

## Play

The browser remake uses **Phaser 4.2.1, TypeScript, and Vite**. Start the development server with Docker:

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

- **5 heroes:** Ustaz Hakim and Mat Rempit "Jet" (Malaysia), Nok (Muay Thai, Thailand), Cô Lan (water puppeteer, Vietnam), Sari (pencak silat, Indonesia).
- **Malaysia route:** Johor → Melaka → Perak → Pulau Pinang → Kedah, each with its own boss. Kuala Lumpur is a bonus stage that unlocks after Perak (2 minutes, 3x coins).
- **Auto-cast combos:** link two skills and they fire together so their combo triggers.
- **Combos and evolutions:** skills used together get bonuses, and a rank-5 skill plus a matching item evolves.
- **Power-ups:** Ketupat (heal), Besi Berani (magnet), Mercun (hits every ghost on screen), Kopi Kaw (fast recharge), Payung (shield).
- **Portal raid:** a portal appears once per stage. Inside is Hantu Raya, a raid boss that drops a Fusion Orb (free evolution) or a big XP buff.
- **Johor hunt and relics:** follow two sequential tracks in the palm groves, then defeat Briarback, a Thornbound Palm Stalker whose charges leave warned thorn patches. Choose a third-cast pulse, once-per-run lethal rescue, elite sustain or temporary ultimate damage relic. See [hunt rules and verification](docs/johor-hunt.md).
- **Johor rescue and weapons:** discover Trapped Traveller at the abandoned market, deliberately defeat six captors and rescue the traveller to choose one of three weapon rewards. Equipment inspection pauses combat; events can be abandoned and block raid entry until resolved. See [rescue rules and verification](docs/johor-rescue.md).
- **Lantern Ward and charms:** protect the rice-fields lantern through 4/6/8 waves with 300 ward HP, then choose a run-local charm for speed, healing, oil protection or positional damage. See [ward rules and verification](docs/johor-ward.md).
- **Coins and hero shop:** saved in the browser's localStorage.

All heroes and stages are unlocked for testing. To bring back the shop and stage locks, set `UNLOCK_ALL` to `false` in `src/game/runtime.js`. Existing saves still use the `aseanSurvivor.v1` localStorage key. Saves are specific to the browser origin: changing hostname or port uses a different save slot.

## Visual remake

The campaign lobby, HUD, hero portraits, controls, upgrades, pause, and results screens share a jade-and-gold visual style. The battlefield uses native Phaser images, graphics, text, camera effects, and reusable sprite objects. There is no full-screen Canvas-texture rendering bridge.

All six stages have distinct connected 6,000 × 6,000 regions, each with five landmarks, local terrain and a signature enemy. All five heroes use four-frame movement and attack cycles in eight directions, with a separate directional idle atlas. Q/E/F/R each have distinct eight-direction windup and release poses, followed by a shared recovery pose. Johor now has run-local rescue/weapon, ward/charm and hunt/relic encounters; music remains future work.

## Hero signatures

Every hero now has a combat loop shown in the lobby and a color-coded meter during play. Ready skills glow; linked auto-cast skills can also spend their signature power.

| Hero | Signature | How to use it |
| --- | --- | --- |
| Hakim — Keeper of the Dawn | Sanctuary | Four basic attacks ready F to create a five-second healing ward. |
| Jet — Midnight Rider | Redline | Travel to fill the meter, then Q for a longer burning dash with 75% more impact damage. Partial charge decays while idle; full charge waits for you. |
| Nok — The Unbroken | Rhythm | Chain three Q/E/F casts, switching skill each time within six seconds, to release an area strike that stuns normal enemies. |
| Lan — Mistweaver | High Tide | Non-periodic hits against slowed enemies fill Tide. Empower E for two extra guards, 50% more guard damage, and 14-second lifetimes. Ten guards remain the cap. |
| Sari — The Twilight Blade | Riposte | Counter contact or a projectile with F, then Q within four seconds for 50% extra kick damage and an immediate E reset. |

Signature power resets between runs. These additions preserve hero IDs, saved ownership, existing skills, and evolutions. Directional movement/attack sprite cycles, Nok's visible leap, and distinct spanner, kris, puppet, light-bolt, and dragon effects provide combat feedback.

## Browser verification

Open `http://localhost:5173/tests/ui-smoke.html`, select **Run checks**, and keep the tab active until it reports `PASS`. The check covers the renderer, five heroes, six stages, movement, pause/resume, upgrades, raid rewards and return, retry, and responsive layout. **Download report** produces a repeatable JSON evidence artifact. It restores the origin's previous save after the run; use a separate browser profile when testing purchases or progression manually.

The development-only `window.__asean` handle exposes the active runtime and Phaser scene to this check. It is absent from production builds. See [docs/architecture.md](docs/architecture.md) for boundaries and the next development milestones.

## Code layout

| File | What it holds |
| --- | --- |
| `index.html`, `ui.css` | Accessible HTML interface and responsive styling |
| `src/main.ts` | Phaser bootstrap and resize configuration |
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

Open `http://localhost:5173/tests/animation-gallery.html` to compare all five heroes, choose any of eight directions, switch movement/basic attack cycles or Q/E/F/R poses, and pause or step individual frames. Artwork lives in `assets/{ustaz,rempit,nok,lan,sari}-motion.png`; generation prompts are in `assets/ANIMATION_PROMPTS.md`. `src/content/animation-layouts.js` records hand-checked row gutters where the generated sheet is not uniform.

Movement cycles run at ten frames per second. Attacks use their own aim direction: basics play over 0.32 seconds; individual skill choreography lasts 0.4–1 second as defined in `src/content/skill-visuals.js`. Basic attacks cannot interrupt an active skill pose. Animation reads simulation time, so pause, upgrades, hit-stop and game-over freeze playback; damage and hitboxes remain simulation-owned. Browser checks verify all directional cycles and idle/pause transitions. The five motion sheets add about 12.1 MB; five skill sheets add about 12.0 MB (320 additional poses). Real-device loading and animation smoothness still need profiling.

## Combat effects and numbers

Skills use original Ragnarok-inspired layered effects: ground seals, light pillars, speed streaks, water ripples, impact arcs, and ultimate highlights. Effects are drawn with native Phaser graphics and add no image downloads or dependencies. Cast visuals are emitted only after a successful cast; they do not change hitboxes, timing, or damage.

Combat numbers use bold outlined text: white for normal damage, gold with a burst for criticals, red for incoming damage, green for sanctuary healing, and violet for damage over time. Values are rounded from the amounts applied by combat rules. Numbers fan into five lanes, pop upward, then fade; reduced-motion settings remove their bounce and lateral travel. Simulation time freezes popups with pause/upgrades. The 140-label and 600-effect limits bound crowding; active spell effects are retained before incidental particles when pruning.

For repeatable visual inspection, open `/tests/combat-effects.html` on the development server. Select a hero and skill, preview against staged durable targets at cast, impact, or sustain time, and freeze a frame. This fixture forces critical chance for review; it does not alter the normal game's balance or save format.

## Unique skill choreography

Each of the 20 active skills has separate native effects in `src/scenes/skill-effects.ts` and two new character poses per direction in `assets/*-skills.png`. Ultimates keep their existing damage, cooldowns, and targeting. Persistent effects follow their owner or remain anchored to the cast location as appropriate; pauses freeze their simulation clock.

| Hero | Q | E | F | Ultimate |
| --- | --- | --- | --- | --- |
| Hakim | Dawn ray fan | Sparkling bead orbit | Expanding voice waves | Tall protective dome, light ribs and perimeter pillars |
| Jet | Wheelie and twin trails | Exhaust flames | Sonic horn rings | Superman pose with long blue/gold speed wakes |
| Nok | Teep impact spear | Spinning elbow crescents | Wai Khru blessing | Leap marker, landing shockwave, ground cracks and debris |
| Lan | Dragon launch trail | Puppet tethers | Splash ripples and droplets | Grand Lake Show fountains, concentric water rings and falling strikes |
| Sari | Double crescent kick | Tiger-step streaks | Petal-shaped counter guard | Spreading Garuda feather wings and falling feather strikes |

`assets/SKILL_PROMPTS.md` records artwork generation. Use the animation gallery to inspect the two skill poses and the combat-effects fixture to inspect the full combined presentation.

## Skill sound effects

All five heroes have original synthesized basic/Q/E/F/R cues (25 total), authored in `src/game/skill-audio.js`. Hakim uses layered chimes, Jet engine/horn tones, Nok percussion and impacts, Lan water-like noise and ascending notes, and Sari metallic sweeps. Ultimates add low impacts, buildup layers and longer tails; Nok's impact is delayed into the leap sequence. These are procedural fantasy sounds, not recordings or Ragnarok assets.

Sound unlocks on the first pointer/key interaction. **Sound on/off** and **Effects volume** controls are available in the lobby and pause menu; small screens keep the volume slider in the pause menu. Preferences use the separate `aseanSurvivor.audio` localStorage key. Unsupported/blocked audio leaves the game playable silently.

Successful casts—including automatic basic attacks—play their matching cue. Blocked casts stay silent. Eight simultaneous cues, per-cue retrigger limits, quieter basics, ultimate priority/ducking and a master compressor control crowding. Pause, upgrades, defeat, hidden tabs and returning to the menu stop tails; resume does not replay old sounds. Buffs have onset cues, not continuous audio loops.

Open `/tests/audio-smoke.html` to audition each cue, run browser audio checks, or download a WAV sampler of the five ultimates in roster order. The checks validate distinct finite waveforms, peak limits, actual Web Audio unlock/playback scheduling, cast rejection, voice priority, persistence and lifecycle silence. Speaker/headphone tuning and real-phone audio latency require listening tests.

## Open stage regions

Each stage contains five connected landmarks and four guarded caches. Johor retains Village clearing, Rice fields, Palm groves, Riverbank, and Abandoned market. The camera shows about 28% more world in each dimension than the previous view (zoom multiplier 0.78). The survival clock and boss arrival remain active while exploring.

Broad routes connect every region; Johor has two 480-unit-wide river bridges. Buildings, tree trunks and deep river water block ground movement; shallow paddies remain traversable. Enemies route around blockers toward the player using a shared navigation field, and normal waves spawn outside the visible area on valid ground. Rifts and power-ups also use valid ground positions. Nok can leap over obstacles but must land on valid ground.

The minimap marks the player, river crossings and landmarks. Visited landmarks turn jade; claimed supply caches turn gold. Four optional sites summon three guardians on discovery. Defeat those guards and approach the cache to receive the location’s coin reward (18–34 coins), up to 30 HP, and 25% ultimate charge. Rewards and discoveries reset each run. Cache rewards deliberately change run progression; they need longer balancing playtests.

Map definitions live in `src/content/regions.js`, with Johor and collision/navigation in `src/content/world.js`; `src/scenes/OpenWorld.ts` renders tiled ground, illustrated building props, paths, paddies, bridges and navigation UI. `/tests/world-smoke.html` checks Johor; `/tests/stage-worlds.html` checks all six layouts, landmark routes, cache rewards, regional enemy attacks and stage switching, with a stage/landmark preview selector. The old arena painting remains in the source assets but is no longer loaded by the game.

| Stage / region | Environment and landmarks | Signature enemy |
| --- | --- | --- |
| Johor — Kampung Outskirts | Palm groves, paddies, river bridges and abandoned market | Palm Stalker: telegraphed charge |
| Melaka — Lantern Quays | Cobbled streets, shophouses, canal crossings, pottery courtyard | Lantern Wraith: three ember bolts |
| Perak — Tinfall Highlands | Limestone ridges, turquoise mining ponds, quarry and cartway | Tin Sentinel: heavy close-range slam |
| Kuala Lumpur — Neon Backstreets | Street grid, lit shops, arcade, depot and tower courtyard | Neon Shade: dash with flanking bolts |
| Pulau Pinang — Saltwind Jetties | Coastal water, wooden jetties, fishing platform and boatwright row | Brine Drifter: slippery pools and sea bolts |
| Kedah — Golden Harvest Plain | Golden paddies, granaries and irrigation crossings | Harvest Watcher: five-projectile fan |

These are invented encounter locations inspired by the stage themes, not reproductions of real landmarks. Existing ghost types mix with the regional enemies; bosses, stage unlocking and raid progression remain intact.
