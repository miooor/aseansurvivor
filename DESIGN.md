# ASEAN Survivor: Game Design

Exported from the project design doc on 2026-11-13. The section "Current decisions" overrides older sections where they differ.

## Pitch and core loop

**ASEAN Survivor** is a top-down 2D survive-the-horde game: you pick a hero from a Southeast or East Asian country and travel north from Malaysia to China, fighting the folklore ghosts of each land. It is inspired by the survivor-like genre but uses its own name, art, heroes and rules.

**Story hook.** Ghost Month has come early. The gates of the underworld opened, and the ghosts of every country spilled out and started gathering together. Each stage pushes one step closer to the source of the leak in China, where the gate must be shut.

**What makes it different:** each hero has a MOBA-style kit of four skills on top of an auto basic attack.

Core loop:

1. Move. The basic attack auto-fires at the nearest ghost.
2. Ghosts come in waves that get denser and mix new types over time.
3. Killed ghosts drop spirit embers (XP). Each level-up immediately restores 25% of maximum HP, up to full, and offers three cards: rank up a skill, or take a passive item.
4. Skills run on cooldowns; the ultimate charges from kills.
5. A boss appears at the end of each stage. Beat it to move on.

## Current decisions

- **Stage elevation.** Each Malaysian stage has two authored landforms, one along a central route and another around an outer landmark. Walkable grades connect raised courts, foothills and flood banks to low ground. Selected forecourts have paved stair approaches. Groves follow field margins, river banks and ridges, with open ground kept clear between them. Elevation changes the battlefield view and preserves existing movement speeds and combat distances.
- **Stage street life.** Three authored scenes per stage show local work and gathering places. Hawker carts and tables line Jalan Alor, tools and ore collect at the Kinta dredge, and Cengal ribs sit on trestles at the Duyong boat yard. The run clock drives steam, lantern glows, pennants, foliage and moored sampans. Pausing the run freezes the motion, and reduced motion holds the scenes still.

- Campaign defeats show the time until the stage boss arrives or the surviving boss’s remaining health. Raid losses name the raid boss. After a defeat or a voluntary end, the survivor can spend their saved payout in the existing Upgrades shop and replay the same stage. Focus starts on the result heading with a short activation delay.

- **Ability specializations.** From the level 3 blessing onward, each hero can trade one property of an existing ability for another. Players may defer the choice, and a chosen path lasts until the run ends. See the [encounter measurements](docs/specializations.md).

- **Run equipment.** Weapon, charm and relic share a loadout with head, chest, gloves, belt and boots. Physical offense follows basic attack origin through delayed hits and skill offense follows active abilities. Contact and falling durians use physical defense. Hostile spells, projectiles and telegraphed areas use skill defense. Matching armor reductions add before Guard and reactive defenses. The Technique Sash upgrades the equipped survivor’s named Q at cast time, including its cooldown and rank-scaled effects. Gear resets at the start of a run.

- **Regional quests.** Each of the nine stages beyond Johor has a local civilian, an authored itinerary and a regional equipment reward. The fisher uses Chew Jetty’s existing gangway and the kite maker uses the Padang Layang reel. The traveller and fisher wait for the player to regroup. See the [regional quest table](docs/regional-quests.md).

- **ASEAN expedition.** The Three.js relief atlas doubles as the level selector. Both playable Malaysian routes start in Johor. Selangor follows Kuala Lumpur and precedes Perak on the West Coast route. Clearing Kuala Lumpur still grants Perak access. The West Coast branch ends in Kedah and the East Coast branch runs through Pahang, Terengganu and Kelantan. The route choice determines where **Next** takes the player after a victory. Later stops preview the intended expansion across all eleven ASEAN member states. The survivor wheel shows twelve playable heroes using their in-game idle sprites. Scrolling brings a hero to the front, with their name between the arrows and their basic attack, three skills and ultimate below.

- **2.5D campaign and hero interactions.** All ten playable Malaysian stages use painted local surfaces with a shared 2,048 × 2,048 detail texture. Each stage blends three ground materials and gives roads and forecourts surfaces that fit the district. Each expanded region adds two authored destinations, including one featured landmark inspired by local architecture or industry. Each stage has a distinct original regional monster with its own illustrated 2.5D sprite and attack. The raid uses the same fixed three-quarter view and directional hero sprites. Each hero gains a tactical interaction tied to an existing skill. See the Three.js campaign and skills table in README.

- **Elemental monster skills.** Each signature monster alternates its signature attack with a second marked attack. Classic mob variants enter after 24 seconds. These skills take aim during windup, apply the survivor’s elemental affinity, and can strike over multiple beats. See the [attack and dodge table](README.md#elemental-monster-skills).

- **Regional rare enemies.** Each stage draws from four of 21 original rares, each with one signature mechanic and painted sprite. At most two original rares are active at once. Dulang Harta drops an exclusive relic. See the [roster and counterplay](docs/night-foes.md).

- **Wave specialists and recovery.** Each stage adds two local enemies to recurring waves at 18 and 42 seconds. The new attacks include a recovery window after an armored roll, a screech that slows skill recharge, a returning current, and predictive fruit throws. Level-ups restore a quarter of maximum HP. See the [wave specialist counterplay](README.md#regional-wave-specialists).

- **Hunting packs.** Three staggered ambushes per stage bring original spirits inspired by Malaysian wildlife. Packs keep distinct movement roles throughout a fight. They choose a caster by angle and range, lock aim at windup, and look for a viable dodge before committing. Recovery exposes the attacker for 0.75 seconds. See the [encounters and counterplay](README.md#hunting-packs).

- **Johor encounter sequence.** The 0:58 hunting pack starts a pursuit, followed by an authored Arang Bara encounter around 1:09. Its death ember denies the space around its XP drop, so the survivor can leave and return for the XP after the blast. Ordinary waves continue through a brief lull before the Pocong surround at 1:27. Elsewhere, the rare-enemy schedule and 1:15 surround continue as usual. See the [Johor encounter sequence](README.md#johor-encounter-sequence).
- **Terrain encounters and veteran medals.** Each stage authors a fight around a local crossing or route. Veteran starts at that approach with the local hunting pair and tougher encounter enemies. Defeating the encounter and the stage boss records one cosmetic medal per stage. The run recap measures effective HP loss and recovery and distinct Exposed conversions. Replay restores the starting setup and seed so playtesters can vary choices across runs. See the [route encounter table](README.md#route-encounters-and-veteran-medals).

- **Stage boss escorts.** Each campaign boss opens with a ward keeper and a local escort. Break the ward with crowd control, separation, or a kill to restore full damage. At half health, a second pair brings new attack patterns. Raja Toyol also sends two marked ember carriers at that threshold. A carrier flees with stolen XP and returns the exact amount when it escapes, when the survivor defeats it, or when Raja Toyol falls. The boss defeat dispels all surviving escorts. See the [boss escort counterplay](README.md#stage-boss-escorts).

- **Malaysian folklore encounters.** Four hostile folklore-inspired variants appear per playable stage, including Kuala Lumpur. Their arrivals are staggered, and they share the original allocation in recurring waves. Localize shared motifs through the stage's setting and attribute regional tellings where documented. The orang bunian wayfarer in Johor is a friendly, untargetable guide. See [the regional roster and sources](docs/folklore-monsters.md).

- **Chew Jetty landmark pilot.** A winch deliberately opens a new connection to the Fishing Platform. Operating it takes 1.8 seconds while combat and the survival clock continue. Leaving the winch radius or taking HP damage resets the attempt. The open route lasts for that run and works for players and enemies. It replaces the Chew Jetty supply cache.

- **Padang Layang Lookout.** The lookout in Kelantan replaces its guarded cache with a reusable wind lane. Press once at the reel to launch the wau after a 1.2-second windup. The gust pushes and briefly stuns ordinary ghosts caught in the marked lane. Its 12-second recharge uses the survival clock, and the player can leave the reel during the windup.

- **Lantern Ward and charms (2026-11-14).** Johor’s rice fields contain a fictional protective lantern installation, not a place of worship. Defend its 300 HP through 4/6/8 owned-enemy waves for one charm choice. Traveller’s Knot, Lantern Heart, Reed Guard and Stillwater Beads provide speed, recovery, enemy-oil protection and positional damage; all are run-local. Exact rules and evidence: `docs/johor-ward.md`.

- **Johor rescue and weapon slice (2026-11-14).** Trapped Traveller is an optional, deliberate market encounter with six captors and one Armoured Palm Stalker. The freed traveller walks to the market bridge. Clearing the ambush and arriving together grants one fixed three-choice weapon offer. The original weapon, charm and relic slots support paused inspection and replacement; ward/charms and hunt/relics are implemented alongside this slice. Exact contracts and evidence are in `docs/johor-rescue.md` and canonical issue #1. Existing caches, survival clock and progression remain; active events block raid entry until resolved.

- **Hero signatures (2026-11-14).** Each existing kit gains a distinct loop: Fadli charges a healing Sanctuary through basic attacks; Kama converts movement into a Redline dash; Nok chains alternating techniques into an area finisher; Lan builds High Tide through hits on slowed enemies for an empowered troupe; Sari converts successful counters into a timed Riposte and dash reset. The lobby explains each loop; the HUD shows charge, timing windows, and ready skills. Exact current rules are in README's Hero signatures table. These are run-local powers and do not change saved ownership.
- **Hard mode.** At 3:00 on the stage clock, the player can keep fighting or choose **End run** from pause to bank collected coins. A stage clear requires defeating the stage boss. The boss's base speed is at least 80% of the survivor's base speed, and every 60 s it lives it gains +10% speed and +15% contact damage. Enemy waves grow with elapsed stage time. Raid time is excluded from the stage clock. Tuning lives in `src/game/boss-pacing.js`.

- **Mobile layout.** The lobby keeps the stage, survivor and launch action together and fills the screen; phones at least 360px wide and 800px tall also show the mission facts and the survivor's skill strip. The atlas and lineup expand when selected. Combat keeps skills within thumb reach and puts equipment and run totals in Pause.
- **Three.js runtime.** One frame loop drives the combat simulation, atlas, and battlefield. Three.js renders the camera, 3D terrain, 2.5D actors and props, effects and damage text. Menus and HUD use semantic HTML. Gameplay requires WebGL 2.
- **Long-term direction.** Build depth through interacting skills, items, and progression in a browser-first 2D game. First establish a compelling, replayable Malaysian chapter. Equipment affixes, persistent build trees, and a broader endgame are future design work, not implemented features.

- **Auto-cast combos.** The player links two skills (Q+E, Q+F, E+F), all four, or none. Linked skills fire together automatically so their combo triggers; the rest are cast by hand with Q, E, F, R.
- **Combos.** Skills used together get a bonus, e.g. Seruan then Cahaya Fajar (Smite: double damage to stunned ghosts), Wheelie through your own exhaust (Api Wheelie).
- **Evolutions.** Each survivor has at least one recipe. An earned rank-5 skill and its matching passive unlock a separate evolution blessing. For example, Nur + Pelita unlocks Nur Purnama. The survivor wheel lists recipes on their skills.
- **Power-ups.** Ketupat (restores 35% of max HP), Besi Berani (magnet: pulls in every ember and power-up), Mercun (hits every ghost on screen), Kopi Kaw (3x skill recharge), Payung (6 s invulnerable). Walk across a shrine to gain its blessing for 12 seconds. Its emblem appears above the survivor. The same shrine refreshes the timer, and a different shrine replaces the current blessing. One in seven ordinary random power-ups is a shrine, with equal odds for all 21 variations. At half health or below, the next random power-up is Ketupat if none is on the ground. At most 2 on the map, 25 s gap between drops.
- **Portal raid.** Once per stage a portal appears off-screen for 60 s. The purple objective arrow follows a walkable route to it. An active quest keeps its own arrow and freezes the rift timer, with the blocker named on the rift HUD. Inside is Hantu Raya, a raid-style boss with telegraphed attacks and a second phase. Reward: Fusion Orb (60%, a free evolution) or a big XP buff (+2 levels, double XP for 60 s), plus 30 coins.
- **Coins and survivor upgrades.** Coins earned during a run are banked on victory or defeat. The lobby shop spends the shared wallet on nine five-rank upgrades. Each survivor keeps their own ranks and starts each run with those bonuses. Fortune adds a percentage of collected coins to the run payout. Heroes also have unlock prices, with hero and stage locks bypassed in the current test configuration.
- **XP curve.** Each level costs more than the last, with +8% per level after level 20.

### Malaysia West Coast route

| # | Stage | Setting | Boss |
| --- | --- | --- | --- |
| 1 | Johor | Oil palm estates and kampung | Raja Toyol (summons toyol packs) |
| 2 | Melaka | Old town shophouses | Orang Minyak Besar (floods the ground with oil) |
| 3 | Kuala Lumpur | City back lanes, two-minute boss arrival, triple coin-drop chance | Ratu Penanggal |
| 4 | Selangor | Klang River markets, tidal banks and a harbour warehouse | Orang Minyak of the Quay |
| 5 | Perak | Limestone hills and tin-mining ponds | Pocong Gergasi (shockwave on every hop) |
| 6 | Pulau Pinang | Shophouses and the old jetty | Pontianak |
| 7 | Kedah | Paddy fields by the Thai border | Pontianak Ratu |

### Malaysia East Coast route

| # | Stage | Setting | Boss |
| --- | --- | --- | --- |
| 1 | Johor | Shared campaign opening | Raja Toyol |
| 2 | Pahang | Mangrove channels and river landings | Riverbank Pocong |
| 3 | Terengganu | Boatbuilding yards and tidal crossings | Estuary Penanggal |
| 4 | Kelantan | Wau workshops and floodplain fields | Floodplain Pontianak |

Both atlas tours continue to Thailand and the other planned stops after their Malaysian finale.

### Skill audit and redesign

These are design ratings of the **previous kits**, based on how often aiming, timing or positioning changes the outcome. A 1 offers little decision beyond pressing the button on cooldown. A 3 has a clear situational use. A 5 supports a repeatable play that can succeed or miss through player input. Basic attacks also earn credit for setting up the rest of the kit. Scores reflect design judgment before player testing.

| Survivor | Basic | Q | E | F | R | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Fadli | 3 | 4 | 3 | 5 | 4 | Keep burn into healing recall. Show the returning light and orbit direction so the player can see when to hold ground. |
| Kama | 4 | 5 | 4 | 3 | 4 | Igniting two exhaust patches with **Hon Kuat** refunds two seconds of Wheelie. A rider can lay a trail, ignite it and turn for another pass. |
| Nok | 4 | 5 | 3 | 3 | 5 | **Turning Elbow** clears space normally. During Wai Khru it draws ghosts inward and stuns them, setting up a clustered landing. |
| Lan | 4 | 4 | 5 | 4 | 4 | Keep the returning puppet and soak-to-splash troupe. Water threads join each guard to Lan and the ultimate turns the stage into a fountain. |
| Sari | 4 | 5 | 5 | 5 | 3 | Keep the dash, echo detonation and counter. Give each echo a separate highlight and the ultimate a spreading feather silhouette. |
| Auntie Karen | 4 | 4 | 3 | 3 | 3 | **Cash Out** gives target selection a second payoff. Each cashed chope bills one receipt to a different unchoped ghost within 140 of its carrier. |
| Captain "Pag Pag" Garcia | 2 | 4 | 5 | 3 | 2 | Filipino street cook with a portable stove. Q banks a portion per ghost in the lane. E serves them for healing and steam damage. Three portions leave a delayed boil. F catches one portion on contact. R rolls a stove cart into the horde and vents at the end. |
| The Gold Sultan | 4 | 4 | 4 | 4 | 3 | **Gold Melting Flamethrower** sweeps three full turns over 1.8 seconds and grants 35% bonus movement speed during the spin. **Bullion Barrage** follows his movement heading. **Gold Dust** boosts damage and basic attack rate. **Make It Rain** automatically targets the largest nearby group and lands five coin waves on a normal cooldown. |
| Vanna | 2 | 4 | 4 | 5 | 2 | **Running Stitch** links up to three enemies and sets up a stronger Ribbon Cut. **Foldstep** summons a silk familiar that orbits Vanna for four seconds, striking nearby foes and intercepting shots that hit the cloth. Silk Loom holds a 500-unit square for four seconds. It snares incoming enemies until the loom unravels, dealing 36 base damage on entry and every 0.4 seconds. |
| Keo | 2 | 4 | 4 | 3 | 2 | **Fourfold Echo** lets a timed Q/E/F redirect a pending beat 180 along aim for 40% more pulse damage. The player can conduct a cast already in progress. |
| Nadi | 2 | 4 | 5 | 4 | 4 | **Thousand Palms** lands 99 close-range strikes. Nine criticals prime **Hand of Buddha**. **Still Palm** counters one hit, and **Buddha’s Refuge** wards an area defended by three spectral monks. |
| Lia | 5 | 3 | 5 | 2 | 4 | **Shadowstep** blinks behind an aimed foe or into open space. The same cast conceals Lia, leaves an afterimage and steals life on a backstab. Enabled auto-cast attacks can reveal her when enemies are in range. Crescent Cut sweeps an 88-unit lane and reaches 290 units at base. Blade Wheel turns Lia through a full spin with a large white blade inspired by Timor-Leste’s flag and slows nearby foes. Midnight Hunt chains three blink strikes. |

The prototype move list supplied chain, boomerang, delayed strike and orbit patterns. The League references suggested two decisions worth adapting here: laying something down for a later payoff, and changing a spell’s value by moving after the cast. The resulting skills use the survivors’ tools and existing inputs. [Xayah](https://www.leagueoflegends.com/en-us/champions/xayah/) · [Ekko](https://www.leagueoflegends.com/en-us/champions/ekko/)


## Heroes

### Ustaz Fadli (Malaysia): the protector
Slow and sturdy. His power is framed as protection and blessing, never as mocking or weaponising scripture.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Nur | A small bolt of light at the nearest ghost. |
| Q | Cahaya Fajar (Dawn Light) | A wide cone of light; heavy damage, burns ghosts for 2 s. |
| E | Tasbih Ring | Prayer beads orbit him for 6 s, hitting every ghost they touch. |
| F | Seruan (The Call) | A wave that pushes nearby ghosts back and stuns them. |
| R | Benteng Doa (Prayer Barrier) | A ring of light for 8 s: ghosts inside take damage, Fadli heals inside it. |

### Mat Rempit "Kama" (Malaysia): the speedster
Rides a kapcai: the fastest hero, but fragile.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Spanar | Throws a spinning spanner that bounces between ghosts. |
| Q | Wheelie | A fast dash that damages ghosts and protects Kama from body contact during the dash. Manual casts follow current movement input or the last movement direction when idle. |
| E | Ekzos Panas (Hot Exhaust) | Leaves a burning trail for 5 s. |
| F | Hon Kuat (Loud Horn) | A blast that makes ghosts flee for 2 s. |
| R | Mode Superman | Lies flat on the bike for 6 s, doubles speed, rams ghosts, and ignores body contact. |

Enemy skills and hazards can still damage Kama during Wheelie and Mode Superman.

### Nok, Muay Thai fighter (Thailand)
Melee bruiser.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Bell-Ringer | A short punch combo in front of her. |
| Q | Ember Flying Knee | Lunge knee-first through a 120° arc, striking each ghost once. Land Turning Elbow within 1.2 seconds to ready the return knee. |
| E | Turning Elbow | Spinning elbow hitting everything around her. |
| F | Wai Khru Poise | A ritual dance honouring her teachers: +30% damage and less damage taken for 8 s. |
| R | Hanuman Skyfall | Leaps to a point; the landing crushes and stuns a large area. |

### Cô Lan, water puppeteer (Vietnam)
A summoner from the water-puppet theatre tradition.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | River Puppet | A puppet darts out and back. |
| Q | Dragonwake | A dragon puppet charges in a line, piercing and slowing. |
| E | Ripple Troupe | Summons puppet guards that fight for 10 s. |
| F | Flood the Stage | A water wave that slows ghosts by 50% for 3 s. |
| R | Festival of Rain | Puppets strike ghosts all over the screen for 8 s. |

### Sari, pencak silat fighter (Indonesia)
Agile duelist with counters.

| Slot | Skill | What it does |
| --- | --- | --- |
| Basic | Returning Kris | A boomerang kris. |
| Q | Crescent Reap | A crescent kick in a wide arc. |
| E | Tiger Afterstep | Tiger-step dash; afterimages explode after 0.5 s. |
| F | Silat Palm Guard | 2.5 s counter stance: invulnerable, ghosts that touch her get hit back. |
| R | Garuda at Dusk | Garuda feather strikes slam ghosts across the screen. |

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

- Holy and ritual powers (ustaz, Wai Khru Poise, Taoist rites) are shown as protection, blessing and respect, never as jokes. No real scripture or prayer text is used as an attack name or sound effect.
- Nadi is a fictional Myanmar monk inspired by Mingun Sayadaw (1911–1993) and his extraordinary recall of the Tipiṭaka. The Buddha statue is a stationary protective ward. Spectral adult monks defend the ward with open palms. [Biographical introduction to The Great Chronicle of Buddhas](https://bps.lk/olib/mi/mi014.pdf)
- No places of worship are damaged or used as battlegrounds.
- Ghosts look spooky but cartoonish; gore stays stylised.
- Before release, friends from each country review their country's heroes and ghosts.

## Art direction

Illustrated 2D characters with readable silhouettes, warm edge lighting, jade night environments, and amber UI accents. Three.js camera effects, hit flashes, floating damage and telegraphs provide combat feedback. Heroes now use four-frame walking/riding and attack cycles in all eight directions. Active skills have distinct directional windup/release poses and original synthesized sound cues. Each stage has a distinct open region with seven landmarks, guarded supply caches and a minimap. Regional layouts include kampung fields, canal streets, mining ponds, neon roads, coastal jetties and irrigated paddies. Each has a signature enemy and local ghost mix; see the README region table. Respect reduced-motion preferences for camera feedback and UI transitions.

## Combat feedback direction (2026-11-14)

Original Ragnarok-inspired presentation uses ground spell seals, bright narrow highlights, impact starbursts, and outlined upward-popping damage numbers. Fadli gets light pillars; Kama gets exhaust/speed streaks; Nok gets force arcs; Lan gets water ripples; Sari gets sweeping slashes. Ultimate accents are larger. These are cosmetic and preserve combat rules. Criticals, normal hits, incoming damage, recovery and periodic damage have distinct visual treatments; exact behavior and the review fixture are documented in README.
