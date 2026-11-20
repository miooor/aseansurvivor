# Browser remake architecture

The target is a browser-first 2D action RPG with deep builds. The playable foundation includes the Malaysian survival campaign and Hantu Raya raid.

## Ownership and boundaries

- `src/main.ts` loads core sprite sheets and boots `SurvivalScene`. The scene owns one Three.js animation loop, the input canvas, and a resize observer for the game host.
- `SurvivalScene.ts` steps the runtime and reads the current run. It selects actor frames, submits terrain and combat effects, or updates the lobby atlas when the menu is open.
- `runtime.js` retains combat rules, cooldowns, enemy AI, XP, upgrades, save access, keyboard/touch input, and HTML controls. It has no animation-frame loop or Canvas drawing code. DOM listeners have an AbortSignal tied to scene shutdown.
- `heroes-sea.js` and `raid.js` install mechanics through explicit dependencies. Live state is accessed through getters so a new run cannot leave modules pointing at a previous player's state.
- `hero-identities.js` installs after the hero kits, wraps successful casts, and subscribes to hit, parry, and update hooks. It owns run-local signature charge and casting presentation state. `tryCast` rejects paused, finished, upgrade-blocked, and cooldown-blocked attempts before invoking a kit. The renderer reads this state without applying combat rules.
- `core.js` contains stage and base character definitions. HTML/CSS controls remain separate from the renderer so menus are keyboard accessible and responsive.
- `hero-upgrades.ts` defines shop prices and rank bonuses. The runtime saves ranks by hero in `aseanSurvivor.v1` and snapshots bonuses when a run starts. Equipment recalculation combines that snapshot with in-run passives and gear.
- `runtime.d.ts` declares the presentation boundary. New scene/bootstrap code is strict TypeScript; the retained JavaScript simulation is a deliberate incremental migration, not fully typed code.

## Current limits

Each stage creates its own 8,640 × 8,640 world using `createWorld(stage.id)`. Portal positions are projected onto nearby walkable ground; the raid has a separate circular arena and explicit telegraphs for slam, lunge, summons, and eclipse. Heroes have eight-direction idle poses, four basic attack frames and two keyposes per active skill. On-foot movement advances one pose per 29 units traveled, capped at 6.5 poses per second. Moving recovery returns to the same stride phase. Kama selects his riding pose from actual displacement and banks gently with signed turn rate. A small margin at the eight facing boundaries keeps the chassis steady while he fires. Reduced motion holds the travel pose steady. Shared folklore enemies use illustrated frames and each regional enemy has an illustrated frame in the Malaysian enemy atlas. The generated atlas uses rounded cell boundaries because its dimensions are not divisible by four.

Hero movement and attack frame selection reads simulation time and successful-cast state. Basic casts do not interrupt a skill pose. Nok's leap elevation remains procedural. Projectile silhouettes, ground charge arcs, release effects, and HUD accents distinguish the five kits. Reduced-motion preferences disable the leap's visual elevation and camera feedback; essential sprite cycles remain active.

The game loads art locally. The seven additional heroes load their motion and skill sheets on selection. Gameplay requires WebGL 2.

The `aseanSurvivor.v1` save format is retained. No account, server, analytics, inventory, trading, multiplayer, or payment service is present. Test helpers are exposed only in development.

## Development sequence

1. Finish the first biome: additional animation in-betweens and atlas alignment polish, audio mix listening tests/music, enemy anticipation, and tuned encounter pacing. Profile dense fights on desktop and real phones.
2. Verify the implemented Johor rescue/weapon, ward/charm and hunt/relic slices together and prove several different builds before expanding the item pool.
3. Introduce versioned saves and migration fixtures before persistent equipment or passive trees ship. Keep simulation rules testable independently of rendering.
4. Expand stage art, encounters, and progression after the first chapter is replayable. Consider a backend only when a concrete feature requires it.

“Path of Exile depth” is a product direction: interacting choices, readable feedback, and replayability. Engine selection alone does not deliver those systems.

## Combat feedback

`runtime.js` records typed combat number messages (`damage`, `critical`, `incoming`, `heal`, `dot`) using final damage or actual healing amounts. Message lifetimes follow simulation time, and the queue retains at most 140 entries. `hero-identities.js` emits one themed `spell` effect after each successful non-basic cast. Simulation pruning caps effects at 600, retaining active spell effects before incidental particles.

`three-skill-effects.ts` reads cast state, with timing from `content/skill-visuals.js`. Skill sheets use eight columns and paired windup and release rows for Q/E/F/R. `BattleMarks` batches ground telegraphs and `BattleLabels` renders world-facing text with textures generated from the supplied messages. Labels release their textures when the messages expire. Reduced motion suppresses flash, shake and popup travel. `/tests/combat-effects.html` previews effects in the live renderer.

## Audio ownership

`SkillAudio` owns one lazily unlocked Web Audio context per runtime. `hero-identities.js` invokes audio only after a successful cast. Each of 25 definitions layers deterministic synthesis into a cached mono 22.05 kHz AudioBuffer, with short reflections and a soft sample ceiling. Runtime transitions stop sources; scene shutdown closes the context and removes listeners. Audio uses wall-clock playback and cancels on pause rather than resuming tails; this avoids queued bursts after a pause. Cosmetic hit-stop does not suspend audio.

The master gain and compressor feed the destination. Eight active cues are allowed; basic attacks cannot steal voices, and ordinary cues cannot evict ultimates. New ultimates lower existing ordinary voices. Preferences are validated and stored independently of progression. No audio files or dependencies are downloaded. `tests/audio-smoke.html` provides repeatable browser verification and a generated WAV artifact; it does not replace device listening/latency checks.

## Region geometry and exploration

`content/regions.js` defines eight core districts and `content/world.js` defines Johor and creates per-run collision/navigation closures. `outer-districts.js` defines the new site placements, approach roads, crossings, courts and groves. The world definition cuts the new crossings out of water blockers. `RegionWorld.ts` renders the shared data and `terrain-paint.ts` feathers authored roads and court edges into each region’s base material. `ScenerySprites` anchors the illustrated buildings, trees and props to the same world. `RegionMap.ts` projects that data into the HTML/SVG minimap. Raid coordinates and arena geometry remain separate.

Ground movement uses swept 24-unit steps with axis sliding. Invalid spawns, pickups and final leap/knockback positions use nearby valid ground. Enemy steering only substitutes navigation when obstacles block the direct path, preserving ordinary combat AI in clear terrain. A 120-unit, four-neighbour distance field is cached per player target cell; it is shared across pursuing enemies within one world, never across stages. Projectiles retain their existing pass-through-terrain behavior. Terrain geometry is static; changing blockers requires rebuilding navigation.

`road-layout.js` gives the paint and scenery the same road widths. Region assembly keeps clear building plots in place and moves conflicting footprints to the nearest suitable roadside offsets. The renderer consumes the same footprints as collision and uses the road corridor to place field plots and lanterns. The stage harness verifies a continuous walkable lane along every road and checks that the nine stages retain varied local scenery.

Exploration is run-local. Entering a 380-unit discovery radius marks a landmark and spawns its guards once; a cleared cache grants rewards inside 95 units. Guardian references remain until the run ends so recycling/removing the enemy list cannot respawn rewards. No persistent exploration save migration was introduced. Remaining work: real-device dense-fight profiling, travel/reward balance, more organic paths/shoreline art.

`regional-ghosts.js` registers signature monsters and imports the folklore variants from `folklore-monsters.js`. The runtime advances windups and resolves locked ground marks and projectiles. The scene draws the same ground marks the runtime checks on impact. `AtlasActors` batches the monsters, survivors, NPCs and props by sprite sheet. `/tests/stage-worlds.html` verifies landmark routes, cache rewards, attack execution, the Johor wayfarer and world switching.

### Run-local crossings

`jetty-gangway.js` owns the optional winch interaction and uses the simulation clock. Its damage hook interrupts the operation on applied HP damage. The prompt updates after combat so a hit on the completion tick can still interrupt the action. A Penang world owns its own gangway state. Opening the crossing cuts a corridor out of the water blockers, rebuilds the walkability grid and invalidates the cached enemy distance field. The scene and minimap both read the crossing state from that world.

`wau-lookout.js` owns Kelantan’s run-local activation, gust and recharge. An update hook advances the effect on the stage clock and applies knockback and a brief stun once per enemy per sweep. The minimap and `WauLookout.ts` read the current phase and progress for the lane, kite and reel indicators. The stage clock freezes during pause and raid entry.

## Encounters and equipment

The itineraries in `src/content/regional-quests.js` resolve against landmarks and interactive stations in the current world. `src/game/quest-routes.js` advances each objective and supplies `event.guidance` with its coordinates, action verb and label. Escort movement updates one stable `event.companion` object with coordinates and a movement flag. SurvivalScene uses it as the sprite key once the civilian leaves their station. The scene draws waiting, walking and resting poses using the existing traveller sheet and simulation time. See the [regional itineraries and acceptance harness](regional-quests.md).

`encounters.js` owns run-local encounter lifecycle, activation, ownership, cleanup, and reward completion. `equipment.js` owns fixed offers, atomic equip/skip, paused inspection and shared modifier calculation. Their static registries live under `src/content/`; Three.js renders markers, elite accents and labels, while semantic HTML buttons own interaction. Successful casts and damage-origin metadata integrate through existing combat hooks. [Johor rescue documentation](johor-rescue.md) records extension contracts. `ward.js` registers the sequential defence encounter; owned enemies navigate toward its objective and use a bounded contact cadence. `charms.js` adds simulation-clock healing and positional effects; actual post-mitigation damage resets healing. [Ward documentation](johor-ward.md) records its oil-hindrance interpretation and evidence. No frame loop, dependency, persistent inventory or save migration was added.

`hunt.js` registers sequential hunt objectives and owns Thornbound patch creation, a shared simulation-time thorn cooldown, and four relic hooks. `hurtPlayer` exposes lethal interception after mitigation and positive applied damage notification after HP subtraction. Last Lantern consumption is stored separately from replaceable item counters. Relic percentage damage remains part of the shared additive equipment calculation; item-origin kills keep ordinary enemy rewards but cannot activate Bounty Seal. See [hunt verification](johor-hunt.md).

## Three.js regions and combat effects

The orthographic camera maps the flattened simulation plane to the Three.js terrain. The 45-degree view and depth scaling keep move directions, hitboxes and aiming aligned. Level switches dispose terrain geometry, materials and textures while the actor layers remain available. Static geometry batches by material and world neighbourhood.

`AtlasActors` batches directional sprites by source atlas. Body and shadow share the same frame rectangle and pivot. The shadow projects onto the ground from the same actor position, including when Nok is airborne. `painted-effects.ts` derives the visible skill frames from the current run. `SpriteAssets` discovers `assets/hero-effect-sprites/<id>.webp` at build time. Each atlas has five rows (basic, Q, E, F, R) and four equal square cells per row, from anticipation through dissipation. Directional art faces right. The battle submits a single translucent batch per effect sheet after the actors write depth. Ground marks use the terrain plane and raised sprites use their carrier’s foot depth. Leaving battle releases the effect batch and its texture. `SpellRibbons` supplies signature feedback, incidental effects and a muted fallback for missing sheets. Playback follows simulation time and freezes while paused.

### Main-menu atlas

`CampaignAtlas` uses the same frame loop while the lobby is open. The Southeast Asia mesh samples the bundled quarter-degree height grid. Within it, `PeninsulaTerrain` decodes nine indexed tiles from a precomputed binary triangle tree. Each root stores three corner heights. Internal entries store the midpoint height plus one and a zero marks an unsplit leaf. Unit triangles are implicit. The same tree supplies exact triangle heights for labels, routes and tour motion. A baked relief texture supplies detail below mesh resolution. The renderer culls the surrounding map strips by their bounds and redraws the atlas when its view changes. Each stage supplies its atlas coordinates, combat tier and clear reward. `campaign-routes.js` orders those stages for the mission list, tours and campaign progression. The atlas draws both branches as raised paths and projects HTML stage buttons onto their pins. The selected branch leads into the dashed itinerary of planned stops. A canvas fallback uses the same image and camera projection when the atlas cannot acquire its own WebGL context. The runtime stores the selected branch on each run so victory follows the correct successor from shared Johor. Saves continue to record clears by stage ID.

### Signature practice

The hero picker launches a fresh runtime in the Johor clearing. The runtime owns initialization, pause, retry, completion and return. It uses the same input, physics, cooldowns, targeting, hit processing and kit hooks as a campaign run. Practice suppresses campaign spawns, exploration, encounters, portals and payout. Only basic attacks fire automatically. The guide derives the next instruction from the current kit state, so expired resources naturally take the player back to their setup step.

To add a lesson, register the hero in `src/game/signature-practice.js`, provide appropriate target placement, and call `api.signatureReleased()` from the kit branch that actually consumes the signature or applies its empowered effect. The runtime latches completion for the active lesson. The kit never owns retry, navigation, or storage. Add a picker-to-release action sequence in `tests/signature-practice.js` and run `/tests/signature-practice.html` against the development server. The harness checks roster coverage, release, retry, return, and byte-for-byte save preservation.
