# Browser remake architecture

The target is a browser-first 2D action RPG with deep builds. The current deliverable is a playable Phaser survival foundation, not a completed loot ARPG.

## Ownership and boundaries

- `src/main.ts` creates one Phaser game. Phaser owns the frame loop, renderer, canvas, resize lifecycle, and scene lifetime.
- `SurvivalScene.ts` calls `runtime.step(delta)`, reads game state, and renders native Phaser images, graphics, and text. Actor images are reused as entities enter and leave the simulation. The scene handles the camera, illustrated environment, raid telegraphs, sprite atlas frames, a reusable soft hero contact shadow, and reduced-motion camera effects. `Weather.ts` draws bounded screen-space atmosphere from the same simulation clock; it owns no frame loop or combat state.
- `runtime.js` retains combat rules, cooldowns, enemy AI, XP, upgrades, save access, keyboard/touch input, and HTML controls. It has no animation-frame loop or Canvas drawing code. DOM listeners have an AbortSignal tied to scene shutdown.
- `heroes-sea.js` and `raid.js` install mechanics through explicit dependencies. Live state is accessed through getters so a new run cannot leave modules pointing at a previous player's state.
- `hero-identities.js` installs after the hero kits, wraps successful casts, and subscribes to hit, parry, and update hooks. It owns run-local signature charge and casting presentation state. `tryCast` rejects paused, finished, upgrade-blocked, and cooldown-blocked attempts before invoking a kit. The renderer reads this state without applying combat rules.
- `core.js` contains stage and base character definitions. HTML/CSS controls remain separate from the renderer so menus are keyboard accessible and responsive.
- `runtime.d.ts` declares the presentation boundary. New scene/bootstrap code is strict TypeScript; the retained JavaScript simulation is a deliberate incremental migration, not fully typed code.

## Current limits

Each stage creates its own 6,000 × 6,000 world using `createWorld(stage.id)`. Portal positions are projected onto nearby walkable ground; the raid has a separate circular arena and explicit telegraphs for slam, lunge, summons, and eclipse. Heroes have eight-direction idle poses plus four-frame movement/basic attack cycles plus two distinct keyposes per active skill and shared recovery; enemies retain single illustrated frames with procedural movement. The generated atlas uses rounded cell boundaries because its dimensions are not divisible by four.

Hero movement and attack frame selection reads simulation time and successful-cast state. Basic casts do not interrupt a skill pose. Nok's leap elevation remains procedural. Projectile silhouettes, ground charge arcs, release effects, and HUD accents distinguish the five kits. Reduced-motion preferences disable the leap's visual elevation and camera feedback; essential sprite cycles remain active.

Art is loaded locally; Google Fonts remains an optional external request with system fallbacks. The active PNG set is approximately 44.9 MB before transport compression. The Astrocade export uses an 11.4 MB WebP set with unchanged dimensions and alpha; [port details](astrocade.md) describe its separate cloud-save adapter and portrait layout. Vite reports a bundle-size warning for the Phaser-containing JavaScript chunk; the warning is retained. Future optimization should measure loading and frame time on actual mobile hardware before changing the renderer or adding dependencies.

The `aseanSurvivor.v1` save format is retained. No account, server, analytics, inventory, trading, multiplayer, or payment service is present. Test helpers are exposed only in development.

## Development sequence

1. Finish the first biome: additional animation in-betweens and atlas alignment polish, audio mix listening tests/music, enemy anticipation, and tuned encounter pacing. Profile dense fights on desktop and real phones.
2. Use the combined Johor browser fixture and three staged build presets to evaluate the implemented eighteen-item pool and elite patterns. Continue longer natural-loot and real-device playtests before balance decisions.
3. Introduce versioned saves and migration fixtures before persistent equipment or passive trees ship. Keep simulation rules testable independently of rendering.
4. Expand stage art, encounters, and progression after the first chapter is replayable. Consider a backend only when a concrete feature requires it.

“Path of Exile depth” is a product direction: interacting choices, readable feedback, and replayability. Engine selection alone does not deliver those systems.

## Combat feedback

`runtime.js` records typed combat number messages (`damage`, `critical`, `incoming`, `heal`, `dot`) using final damage or actual healing amounts. Message lifetimes follow simulation time, and the queue retains at most 140 entries. `hero-identities.js` emits one themed `spell` effect after each successful non-basic cast. Simulation pruning caps effects at 600, retaining active spell effects before incidental particles.

`SurvivalScene.ts` delegates all 20 active-skill choreographies to `skill-effects.ts`, with cast duration data in `content/skill-visuals.js`. Skill sheets use eight columns and paired windup/release rows for Q/E/F/R. Long-lived effects read orbit, ally, and strike state from the simulation. It draws ground seals below actors and narrow highlights above them. Numbers use bold outlined native Text objects, deterministic lanes, short scale pulses and ballistic-style rise/fade; criticals add a small burst. Text objects are destroyed when their messages expire. Reduced motion removes popup bounce/travel and spell expansion/rotation while retaining readable feedback. The unique-skill pass adds five sprite sheets, with no dependencies or game balance changes. `/tests/combat-effects.html` is a development-only real-runtime fixture for reproducible visual checks.

## Audio ownership

`SkillAudio` owns one lazily unlocked Web Audio context per runtime; Phaser's sound manager remains disabled to avoid a second context. `hero-identities.js` invokes audio only after a successful cast. Each of 25 definitions layers deterministic synthesis into a cached mono 22.05 kHz AudioBuffer, with short reflections and a soft sample ceiling. Runtime transitions stop sources; scene shutdown closes the context and removes listeners. Audio uses wall-clock playback and cancels on pause rather than resuming tails; this avoids queued bursts after a pause. Cosmetic hit-stop does not suspend audio.

The master gain and compressor feed the destination. Eight active cues are allowed; basic attacks cannot steal voices, and ordinary cues cannot evict ultimates. New ultimates lower existing ordinary voices. Preferences are validated and stored independently of progression. No audio files or dependencies are downloaded. `tests/audio-smoke.html` provides repeatable browser verification and a generated WAV artifact; it does not replace device listening/latency checks.

## Region geometry and exploration

`content/regions.js` defines the five additional regional layouts; `content/world.js` retains Johor and creates per-run collision/navigation closures. Each world has five landmarks, terrain, local props and a signature enemy. `OpenWorld.ts` renders meadow or town-paving tiles, curved roads made from overlapping shared-atlas patches, irregular geometry-masked water with textured ripples, rice-terrace sprites and bridge decking. Water and cliff outlines also feed the minimap; its road polylines use the same route control points. The Johor building atlas and regional prop atlas remain unchanged. Terrain sprites and hidden geometry-mask sources are released on world changes. Campaign camera bounds include an outer margin so aiming stays player-centered near the playable boundary. Raid coordinates and arena geometry remain separate.

Ground movement uses swept 24-unit steps with axis sliding. Invalid spawns, pickups and final leap/knockback positions use nearby valid ground. Enemy steering only substitutes navigation when obstacles block the direct path, preserving ordinary combat AI in clear terrain. A 120-unit, four-neighbour distance field is cached per player target cell; it is shared across pursuing enemies within one world, never across stages. Projectiles retain their existing pass-through-terrain behavior. Terrain geometry is static; changing blockers requires rebuilding navigation.

Exploration is run-local. Entering a 380-unit discovery radius marks a landmark and spawns its guards once; a cleared cache grants rewards inside 95 units. Guardian references remain until the run ends so recycling/removing the enemy list cannot respawn rewards. No persistent exploration save migration was introduced. Painted banks dress the existing rectangular collision footprints; roads and rice fields remain traversable. Remaining work: real-device dense-fight profiling, travel/reward balance and authored non-rectangular collision if future layouts require it.

Regional enemies use a 3×2 atlas and runtime windup/attack timers: charge, ember fan, slam, dash with bolts, slippery pool, and straw fan. Existing hit, projectile, zone and collision paths apply. `/tests/stage-worlds.html` verifies every landmark route, local guardians, rewards, attack execution, art and world switching.

## Johor encounter and equipment boundary

`encounters.js` owns run-local encounter lifecycle, activation, ownership, cleanup, and reward completion. `equipment.js` owns fixed offers, atomic equip/skip, paused inspection and shared modifier calculation. Their static registries live under `src/content/`; Phaser renders markers, elite accents and labels, while semantic HTML buttons own interaction. Successful casts and damage-origin metadata integrate through existing combat hooks. [Johor rescue documentation](johor-rescue.md) records extension contracts. `ward.js` registers the sequential defence encounter; owned enemies navigate toward its objective and use a bounded contact cadence. `charms.js` adds simulation-clock healing and positional effects; actual post-mitigation damage resets healing. [Ward documentation](johor-ward.md) records its oil-hindrance interpretation and evidence. No frame loop, dependency, persistent inventory or save migration was added.

`hunt.js` registers sequential hunt objectives and owns Thornbound patch creation, a shared simulation-time thorn cooldown, and four relic hooks. `hurtPlayer` exposes lethal interception after mitigation and positive applied damage notification after HP subtraction. Last Lantern consumption is stored separately from replaceable item counters. Relic percentage damage remains part of the shared additive equipment calculation; item-origin kills keep ordinary enemy rewards but cannot activate Bounty Seal. See [hunt verification](johor-hunt.md).


## Elite patterns and skill equipment

`event-combat.js` advances the shared elite attack state, captures warning aim and emits encounter-owned fan/burst projectiles. `SurvivalScene.ts` reads those states for static warning rays and two-line action labels. Existing collision, stun, slow and hostile-projectile paths apply. [Combat contract](event-combat.md).

`skill-equipment.js`, installed by `equipment.js`, wraps successful casts after hero identity hooks and captures cast position, aim and rank before movement. It schedules at most twelve pending strikes and three slow fields on the simulation clock. Item-origin damage uses the ordinary hit/kill path, completing owned objectives while excluding signature charge and recursive Bounty effects. Replacement is item-selective; actual raid object transitions clear strikes, fields and item projectiles. Crosswind state continues on run time across raids, matching Aftershock. [Exact equipment and lifecycle rules](skill-equipment.md).

`tests/gameplay-upgrade.html` combines real runtime staging with actual event, reward, skill and modal controls, repeatable three-build play presets and a bounded active-event desktop profile. Evidence and staging limitations are in [combined verification](gameplay-upgrade.md). [Seven hero concepts](asean-hero-concepts.md) remain design documentation and add no runtime registrations or assets.
