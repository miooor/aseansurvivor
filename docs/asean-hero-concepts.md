# Seven ASEAN hero concepts

Design draft for [ticket #11](https://github.com/miooor/aseansurvivor/issues/11), under [canonical spec #8](https://github.com/miooor/aseansurvivor/issues/8). Research checked **2026-11-15T15:03:36Z**. These are seven original, fictional working characters, not real people, historical reconstructions, approved cultural representations, implemented roster entries, or release commitments. All names, personalities, silhouettes, combat tools, skill names, numbers, and equipment combinations below are creative proposals. The paragraphs labelled **Grounding (paraphrase)** contain the sourced facts; a source does not endorse the fictional adaptation.

## Scope and regional context

As checked on 2026-11-15, ASEAN has eleven members: Brunei Darussalam, Cambodia, Indonesia, Lao PDR, Malaysia, Myanmar, the Philippines, Singapore, Thailand, Timor-Leste, and Viet Nam. ASEAN's [member-state directory](https://asean.org/member-states/) lists all eleven; its [admission announcement, published 2025-10-26](https://asean.org/forging-a-new-era-timor-leste-admitted-into-asean/), records Timor-Leste becoming the eleventh member that day. Singapore's [Ministry of Energy, Trade and Industry ASEAN page](https://www.meti.gov.sg/trade-international-economic-relations/international-platforms-/association-of-southeast-asian-nations--asean-/) independently lists the same eleven (page publication date not stated). The seven drafts complement the existing Malaysia, Thailand, Vietnam, and Indonesia heroes. The planned China hero belongs to the wider story, not this ASEAN membership set.

The current signatures in `src/game/hero-identities.js` cover Hakim's basic-fed Sanctuary, Jet's movement-fed Redline, Nok's alternating techniques, Lan's hits against slowed targets, and Sari's counter into Riposte. These drafts introduce target preparation, line geometry, return positioning, crossing fields, timed releases, delayed maturation, and physical recovery. No country determines a character's temperament. Occupational interests belong to these individuals; they do not represent everyone in their country.

| Country | Fictional working hero | Role and readable silhouette | New decision | Main reusable systems | Additional design cost |
| --- | --- | --- | --- | --- | --- |
| Singapore | Asha Lim, Night Dispatcher | Midrange controller; broad tray, clipped order cards | Prepare several targets, then collect served marks | Enemy tags, projectiles, radial hits | Ticket priority and expiry UI |
| Philippines | Mira Reyes, Towline Runner | Line skirmisher; diagonal pole and large rope reel | Move sideways to turn a tow line into a sweep | Line hit tests, movement, knockback | Bounded line endpoint and angle state |
| Brunei | Dani Rahman, Landing Keeper | Anchor defender; squared rescue frame and two floats | Leave an anchor, then return before its window closes | Safe-position movement, zones, timers | Anchor return and proximity validation |
| Cambodia | Vanna, Crossweft Maker | Field planner; twin shuttle cases and a short checked scarf | Place crossing strips, then exploit their overlap | Zones, slow, area hits | Strip intersection geometry |
| Laos | Keo, Reed Resonator | Timing caster; tall unequal pipe silhouette | Release a skill during a visible pulse window | Simulation timers, cones, rings | Accessible timed-window indicator |
| Myanmar | Nadi, Lacquer Workshop Keeper | Preparation mage; stacked shallow discs and brush roll | Let layers mature, then choose when to release them | Delayed strikes, zones, update hooks | Layer ownership and maturation state |
| Timor-Leste | Lia Soares, Shuttle Courier | Recovery skirmisher; compact shuttle frame and plain woven sash | Intercept a returning shuttle instead of waiting for it | Returning projectiles, pickup radius, dash | Catch validation and one resource counter |

## Shared draft rules

Numbers are **initial rank-1 design values**, not measured balance. Units are world units and simulation seconds, matching existing runtime terminology. Proposed damage scales with the existing `rm(rank) = 1 + 0.25 × (rank − 1)`; HP, shields, cooldowns, radii, durations, charges and movement do not scale unless stated. Basic attacks auto-fire; their interval is listed as a cooldown. Q/E/F use cooldowns; R spends a full kill-fed ultimate meter with the listed `ultNeed`, once, without a normal cooldown. One-second zone ticks occur at 1/2/3… seconds after placement, including the stated final tick. Skill rank, passives, criticals, outgoing modifiers, mitigation, boss crowd-control rules and kill credit should follow the existing runtime.

Only successful player hero casts and the explicitly described hero-origin hits affect signatures. Item-origin damage, echoes, bolts and pulses never create tickets, tension, return readiness, crossings, beats, layers or catches; they never call `CAST`, count as another skill, spend ultimate charge or play another skill cue. Hero-created periodic damage also grants no signature resource unless a section explicitly says otherwise. Rejected casts spend no resource and trigger no equipment. All draft state is run-local, uses the existing simulation clock, freezes with pause/overlays, and clears at new run, defeat, menu and raid transitions. No persistent ownership, unlock pricing, save migration, new backend or art is proposed here.

Movement must use valid ground and existing collision rules. Anchors, fields and delayed impacts do not add blockers, cross impassable terrain with the player, target a ward as an enemy, or damage civilians, heritage objects or places of worship. Point placement uses current aim; auto-aim may choose an enemy cluster within the stated range, otherwise uses the aim endpoint. New mechanics must work with keyboard and touch without requiring a second pointer or another action button. Shapes and text carry information independently of colour, motion and audio.

Each hero has one **weapon + charm + relic** example from the six new items in #8. These are proposed combinations for a future implementation, not claims that today's five-hero item hooks already support these drafts. Item contracts remain unchanged: Echo Lattice adds a fixed-position Q echo after 0.45 s (radius 90, damage `22 × rm(Q rank)`); Forked Conduit adds two E bolts at ±18° (speed 420, radius 6, damage `18 × rm(E rank)`, lifetime 1.2 s, pierce 2); Undertow Thread adds a stationary F field (radius 140, 3 s, refreshes existing 50% slow to at least 0.6 s, cap three); Relay Knot removes 1 s from the other two Q/E/F cooldowns; Crosswind Drum grants a non-stacking +20% outgoing damage for 3 s after different successful Q/E/F casts within 3 s; Monsoon Lens adds R pulses at the original cast position after 0.6/1.2/1.8 s (radius 180, damage `18 × rm(R rank)`, at least 0.6 s slow).

The echo selects the nearest enemy within 450 units at cast time, or a point 220 units along captured aim if none; it does not follow a ticket, rope, anchor or later target movement. Lens pulses stay at cast position even if the hero moves. Equipment percentage damage bonuses add before the existing multipliers. Drum does not retroactively improve an instantaneous hit that occurred before its successful-cast hook; examples below rely on subsequent hits. Scheduled item strikes share #8's cap of twelve, discarding the oldest pending item strike when necessary, and clean up on replacement and transitions. Replacement clears only that item's state, not the hero's signature.

## Singapore — Asha Lim, Night Dispatcher

**Grounding (paraphrase).** Singapore's National Environment Agency describes hawker centres as shared dining and social spaces, culinary skills transmitted between generations, and dishes shaped by multiple immigrant food cultures. Its [Hawker Culture page, updated 2024-06-03](https://www.nea.gov.sg/our-services/hawker-management/programmes-and-grants/hawker-culture), records UNESCO inscription on 2020-12-16. Inspiration is the coordination and care surrounding an everyday communal space; no dish is claimed as an exclusive national invention.

**Fictional adaptation.** Asha coordinates a fictional night-market repair and supply crew. Her broad empty serving tray, short work jacket and oversized paper clips make a low, wide silhouette. A tray-mounted imaginary light projector emits order-card shapes; neither food nor customers are ammunition. Role: midrange target controller. Draft stats: 110 HP, speed 180, `ultNeed 55`.

**Signature — Service Window.** Q can ticket at most three enemies for 6 s. The basic prioritizes the nearest unserved ticket within 360 units and marks it served on its first hero basic hit; subsequent basics prefer another unserved ticket. E collects served tickets for burst damage and removes them. Ticket count is capped at three globally; Q refreshes existing tickets before adding nearest unticketed enemies in its area. Death removes the ticket, expiry loses it, and neither gives free collection damage. This is a prepare/visit/collect loop: three hits on one target never substitute for serving three targets. With no tickets, basic targeting is ordinary nearest-enemy targeting.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Dispatch Card | Every 0.75 s, one projectile: damage 12, range 360, speed 440, pierce 1; serves its ticket once. |
| Q | Open Docket | CD 5 s. Radius-100 impact at a point up to 220 away: damage 24, non-boss stun 0.6 s; tickets up to three hit enemies. |
| E | Clear the Rail | CD 8 s. Collect each served ticket within 420: radius-65 burst at that enemy for 34 damage, once per collected ticket. Also a radius-90 pulse around Asha for 16 damage, so the cast remains useful with no served ticket. |
| F | Make Room | CD 10 s. Radius-150 wave: damage 18 and 200-unit knockback on eligible enemies; no healing or invulnerability. |
| R | Night Shift Relay | Cost 55. A radius-220 field at cast position for 5 s, dealing 12 damage each second (five ticks). Each currently ticketed enemy inside becomes served on the first field tick that hits it; E still performs collection. |

**Equipment combo.** Weapon **Echo Lattice**: Q briefly stuns an enemy while the fixed echo arrives 0.45 s later; its nearest-target selection may differ from the Q impact, so the player should place Q near the immediate threat. Charm **Relay Knot**: Q reduces an already-running E cooldown by 1 s; E reduces Q/F by 1 s, allowing another docket sooner without serving anything for free. Relic **Crosswind Drum**: Q → E within 3 s enables +20% for subsequent basics and field ticks; collecting too early sacrifices unserved tickets. The echo never serves a ticket.

**Strengths / weaknesses.** Strong at thinning a mixed group and redirecting basic fire away from one durable enemy. A lone boss offers one ticket, not three bursts; scattering enemies or leaving the 420 range wastes preparation. No dash, sustain or damage immunity.

**Local review before implementation.** Singaporean hawker workers and reviewers should check the job framing, practical clothing, name and multicultural context. Do not collapse hawker culture into one ethnicity, accent, dish, cleanliness joke or money-minded personality. Do not use actual stall branding or imply every hawker works as a fighter. Order-card projectors are invented machinery.

## Philippines — Mira Reyes, Towline Runner

**Grounding (paraphrase).** The [National Museum of the Philippines' Butuan museum page](https://www.nationalmuseum.gov.ph/our-museums/regional-area-and-site-museums/butuan/) describes its preservation of ancient Butuan boats and management of the Butuan Boat 1 excavation-site museum (publication/update date not stated; accessed 2026-11-15). This supports a specific maritime-heritage starting point. It does not establish a single boat type, rig, ethnicity or construction method for all Philippine communities.

**Fictional adaptation.** Mira works in an invented contemporary coastal repair cooperative, inspired by interest in maritime heritage rather than portrayed as an ancient boatbuilder. A diagonal padded push pole, round reel and short weatherproof overshirt distinguish her from Jet's vehicle and Sari's blades. Her tool projects a temporary light towline; no excavated boat or museum object becomes a weapon. Role: geometry skirmisher. Draft stats: 120 HP, speed 185, `ultNeed 55`.

**Signature — Take the Strain.** Q fixes one line endpoint on valid ground up to 220 units away for 5 s; the other end follows Mira. Save Mira's Q-cast position and the line's starting angle. Normal movement that reaches an angular displacement of 90° in either direction from that angle makes E ready; small back-and-forth movements do not accumulate progress. Count movement only while distance to endpoint is 60–300 units; leaving that range or teleporting clears progress and rebases the starting angle/position. At readiness, E hits the triangle formed by the endpoint, saved starting position and current position, with a 35-unit edge margin, for 55 damage once per enemy. Readiness lasts only while the endpoint survives and Mira stays in range. A new Q replaces the endpoint and resets tension. The line is a visible aiming guide, not a wall or enemy tether.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Pole Tap | Every 0.7 s, damage 15 in a 100-unit, 70° forward arc at the nearest enemy. |
| Q | Set the Tow | CD 6 s. Place endpoint up to 220 away; a width-24 line from Mira to it hits once for 24 damage and 150-unit knockback. |
| E | Swing Clear | CD 7 s. Radius-110 sweep for 28 damage. If tension is ready, replace this with the signature triangle sweep for 55 damage; consume tension and endpoint. |
| F | Brace the Reel | CD 11 s. For 3 s, reduce incoming damage by 25%; radius-120 initial push for 12 damage and 180-unit knockback. Bracing does not generate tension. |
| R | Open Water Turn | Cost 55. Three width-40 line strikes along captured aim, length 340, at 0.3/0.7/1.1 s, each for 38 damage. No automatic movement or endpoint generation. |

**Equipment combo.** Weapon **Forked Conduit**: the two extra E bolts cover beyond the close sweep using captured aim, adding reach without increasing tension. Charm **Undertow Thread**: F plants its 3 s slowing field; circle the endpoint while enemies approach through that fixed patch, then E the gathered group. Relic **Monsoon Lens**: R from the prepared patch stacks the three stationary lens pulses under approaching enemies while Mira can keep moving. Neither bolts nor pulses create a tow endpoint or earn angular travel.

**Strengths / weaknesses.** Rewards a deliberate sideways route and can clear a broad wedge without immunity. Poor in narrow passages or when enemies force her past the 300-unit line limit; close basic range and setup time expose her to fans. Bosses take damage without being forcibly towed.

**Local review before implementation.** Ask Philippine maritime practitioners and a Butuan/Caraga-informed reviewer to check tool language, clothing and whether the heritage connection reads clearly. Any later choice of a named contemporary boatbuilding community requires its own source and consultation. Do not mix unsupported rigs, copy restricted boat decoration, frame the entire archipelago as one fishing village, or claim the magic line is a traditional practice.

## Brunei — Dani Rahman, Landing Keeper

**Grounding (paraphrase).** Brunei Tourism's official [Kampong Ayer page](https://www.bruneitourism.com/places/kampong-ayer/) describes a living settlement on stilts along the Brunei River, boat access, and wooden paths and bridges (publication/update date not stated; accessed 2026-11-15). The useful starting point is everyday river access and connected walkways, not palace imagery or a national wealth trope.

**Fictional adaptation.** Dani maintains a fictional river landing's safety equipment. A square collapsible rescue frame and two bright side floats create a box silhouette; a broad soft-ended boat hook projects protective light. Role: return-position defender. Draft stats: 140 HP, speed 165, `ultNeed 60`.

**Signature — Safe Landing.** E leaves one anchor at cast position for 6 s. After Dani moves at least 160 units from it through normal ground movement, it becomes return-ready. F while within 70 units of that anchor consumes it and grants a 30-HP shield for 4 s plus a radius-150, 35-damage pulse at the anchor. The shield absorbs damage before HP, does not stack or heal, and expires unused. F outside the return radius keeps its base effect and does not consume the anchor. A new E replaces the old anchor; dashes/teleports do not arm it. The route is away-and-back, rather than charge for distance travelled.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Hooklight | Every 0.9 s, straight projectile: damage 16, range 320, speed 360, pierce 1. |
| Q | Clear the Landing | CD 6 s. Length-230, width-45 shove for 30 damage and 220-unit knockback on eligible enemies. |
| E | Mooring Light | CD 10 s. Plant/replace the signature anchor; its radius-100 arrival pulse deals 18 damage. It neither attracts enemies nor blocks shots. |
| F | Step Ashore | CD 9 s. Radius-130 wave for 16 damage and 1 s of 50% slow; apply Safe Landing only if return-ready and within 70. |
| R | Sheltered Reach | Cost 60. Radius-200 field at cast position for 6 s. Dani takes 30% less damage while inside; enemies take 14 damage per second, six ticks. No healing or invulnerability. |

**Equipment combo.** Weapon **Forked Conduit**: E adds two forward bolts as Dani plants the anchor, covering departure while the anchor itself remains defensive. Charm **Relay Knot**: E reduces a cooling F by 1 s; a later successful Q reduces E/F, supporting a second return cycle without refreshing an anchor for free. Relic **Monsoon Lens**: cast R at the landing on return; its pulses remain there as enemies approach the shelter. A stationary lens pulse is not an anchor and cannot arm Safe Landing.

**Strengths / weaknesses.** Offers a preplanned fallback point and strong bounded defence. Slow repositioning, no sustain, and returning into a warned fan can make the shield a poor trade. Abandoning the anchor loses its payoff; an anchor does not make hazardous ground safe.

**Local review before implementation.** Bruneian Kampong Ayer residents should review practical workwear, rescue-tool use, name and landing details. Do not treat homes as exotic scenery to destroy, copy royal insignia, use mosque architecture as a spell seal, or assume all Bruneians live on water. The rescue frame and magic anchor are fictional, with no claimed customary ritual.

## Cambodia — Vanna, Crossweft Maker

**Grounding (paraphrase).** UNESCO describes krama's checked textile pattern, varied everyday uses and intergenerational weaving knowledge in [its inscription article, published 2024-12-02 and updated 2024-12-04](https://www.unesco.org/en/articles/unesco-congratulates-cambodia-kramas-inscription). Cultural practices linked to krama were inscribed on the Representative List in 2024. The inspiration is textile making and ordinary use; the article also discusses ceremonial meanings, which this combat adaptation does not reproduce.

**Fictional adaptation.** Vanna repairs everyday cloth and carries two broad shuttle cases, a small portable rectangular frame and a short plain checked scarf. All projected grid designs are newly invented. Role: field planner. Draft stats: 110 HP, speed 175, `ultNeed 60`.

**Signature — Crossing Point.** Q lays one 280 × 40 strip along captured aim, centred 140 ahead, for 5 s. E lays a second strip of the same dimensions, also centred 140 ahead, perpendicular to its own captured aim. Keep at most one strip of each kind; replacement removes the old strip. If they intersect, mark the centroid of their overlap with a radius-60 crossing circle until either strip expires. F detonates that circle for 60 damage and consumes both strips; without an intersection it produces only its base pulse. Parallel/disjoint strips yield no bonus; there is at most one crossing. The strips never obstruct movement.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Shuttle Spark | Every 0.8 s, damage 13, range 350, speed 430, pierce 1. |
| Q | Lay the Warp | CD 6 s. Place Q strip; damage 14 each second to occupants, five ticks maximum. |
| E | Pass the Weft | CD 7 s. Place E strip; 22 arrival damage to occupants, then refresh 50% slow to 0.6 s while inside. |
| F | Lift the Frame | CD 10 s. Radius-110 pulse at Vanna for 20 damage; additionally trigger Crossing Point if available within 400 units. |
| R | Broadcloth Screen | Cost 60. Radius-200 patch at cast position for 5 s; damage 20 each second, five ticks, and refresh 50% slow to 0.6 s. It does not create Q/E strips. |

**Equipment combo.** Weapon **Echo Lattice**: Q's extra fixed echo can punish the nearest approach while the player positions a crossing elsewhere; do not promise it hits the crossing. Charm **Undertow Thread**: F leaves a slowing patch at Vanna, useful when detonating a crossing on top of her position; a remote detonation does not move that patch. Relic **Crosswind Drum**: Q → E within 3 s improves subsequent Q ticks, then F can detonate during the 3 s buff. Field ticks do not count as more casts or generate more crossings.

**Strengths / weaknesses.** Strong at defended lanes and predictable approaches; placement gives more control than Lan's mobile troupe. Two casts and a stable position are needed for the large detonation. Fast enemies, corners and fleeing bosses can leave the crossing empty; no dash or emergency immunity.

**Local review before implementation.** Cambodian weavers and Khmer-speaking reviewers should validate everyday scarf styling, working name and tool proportions. Distinguish these new grids from community-specific or sacred motifs. Do not convert actual protective beliefs, ceremonial garments, temple reliefs or historical trauma into attack imagery; do not imply one scarf or occupation represents every Cambodian community.

## Laos — Keo, Reed Resonator

**Grounding (paraphrase).** UNESCO's [2017 decision 12.COM 11.B.20](https://ich.unesco.org/en/decisions/12.COM/11.B.20) describes khaen as a mouth organ with bamboo tubes of varying lengths and metal reeds, taught in families and other settings, and performed in community as well as religious contexts. It explicitly recognizes regional and community variation. The draft draws only from instrument making and a fictional secular rehearsal context, not from a ritual or a claim that all Lao people play khaen.

**Fictional adaptation.** Keo is an instrument repairer who tests a deliberately invented reed resonator. Uneven tall pipes rise above one shoulder, contrasting with a light short jacket and compact bellows pack. It is a new fantasy instrument with a locally reviewed relationship to khaen; no real melody or ceremony is sampled. Role: timing caster. Draft stats: 105 HP, speed 180, `ultNeed 55`.

**Signature — Open Measure.** After a successful Q/E/F, show a 2 s measure ending in a 0.5 s release window (from 1.5 through 2.0 s after that cast). The next successful Q/E/F during that window gets +40% to that skill's hero damage, then starts a fresh measure. Casting earlier or after expiry gives base damage and starts a new measure; pressing on cooldown does neither. Repeating the same skill is allowed if it is ready: this rewards timing, not Nok's skill alternation. No bonus applies to R, basics, item damage or an already-running zone. A static bar, numeric countdown and READY text work with audio muted and reduced motion.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Reed Puff | Every 0.85 s, damage 14, range 330, speed 400, pierce 1. |
| Q | Low Register | CD 5 s. Length-240, 70° cone for 28 damage and 160-unit knockback. |
| E | High Register | CD 6 s. Three parallel bolts, 20 units apart, each damage 14, speed 460, radius 6, lifetime 0.8 s, pierce 1; a target may take all three. |
| F | Rest Beat | CD 9 s. Radius-150 pulse for 18 damage; non-boss stun 0.8 s. |
| R | Long Exhale | Cost 55. Four radius-180 pulses at Keo's captured position after 0.3/0.9/1.5/2.1 s, each for 30 damage. Keo can move normally; R neither starts nor refreshes a measure. |

**Equipment combo.** Weapon **Forked Conduit**: E's extra two angled bolts widen its otherwise parallel lane; they retain normal item damage and get no Open Measure multiplier. Charm **Relay Knot**: cycling Q/E/F reduces other cooldowns so a skill is more likely available during the next visible window; it does not shift the window. Relic **Crosswind Drum**: a different Q/E/F cast at 1.5–2.0 s satisfies both windows; the triggering hero skill receives only its timing bonus, while subsequent basics or R pulses may receive Drum's +20%. No beat-perfect input is required to survive: every cast retains its base effect.

**Strengths / weaknesses.** Rewards a moderate, visible casting cadence and offers ranged burst without summons. Raw base output is lower when the player panic-casts; timing windows compete with dodging. No healing, dash or sustained defence. Automatic linked casts at the same instant will not receive the timing bonus; an eventual prototype must explain this tradeoff clearly.

**Local review before implementation.** Lao musicians/instrument makers should review the proposed silhouette, breath depiction, name and secular framing, and decide whether to keep a recognizable khaen relationship at all. Do not label invented tones traditional music, flatten regional variants, use religious performance as combat audio, or turn breath control into a cultural personality trait. Timing must remain accessible to players who cannot hear or track flashing cues.

## Myanmar — Nadi, Lacquer Workshop Keeper

**Grounding (paraphrase).** Myanmar's Ministry of Information [craft report, published 2024-03-04](https://www.moi.gov.mm/moi:eng/news/13257), reports lacquerware work in Bagan/NyaungU and describes bamboo, wood and horse-tail-hair techniques, attributing observations to named craftspeople. Only that material/occupation connection is used here; the report is not evidence for a magical practice, a universal Myanmar identity, or present-day craft participation counts. No political claim is taken from this source.

**Fictional adaptation.** Nadi runs a fictional workshop for everyday lacquered containers. Her stacked shallow discs, asymmetrical brush roll and protective work apron form a stepped silhouette. An imaginary light applicator projects temporary discs; no actual lacquer, toxic pigment or valuable craft object is thrown at enemies. Role: delayed preparation mage. Draft stats: 115 HP, speed 170, `ultNeed 60`.

**Signature — Let It Set.** E places one radius-90 layer at an aim point up to 240 away; keep at most three, replacing the oldest. A layer becomes mature after 2 s and expires after 7 s total. Q releases all mature layers within 400 of Nadi, each for 42 damage once, consuming them; immature layers remain. This maturation is an invented game timer, not a realistic lacquer curing time. The player chooses between immediate Q damage and waiting for more prepared detonations. Layers are nonblocking, cause no periodic damage while waiting, and have a clear hollow/filled maturity symbol.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Brushlight | Every 0.8 s, damage 14, range 340, speed 410, pierce 1. |
| Q | Lift the Finish | CD 5 s. Length-260, width-32 line for 26 damage; separately release eligible mature layers. Each enemy can take one hit from each released layer. |
| E | Lay a Coat | CD 4 s. Place one layer; arrival flash deals 10 damage, without starting periodic damage. |
| F | Keep Clear | CD 10 s. Radius-150 pulse for 15 damage and 1.5 s of 50% slow; layers do not mature faster. |
| R | Workshop Bloom | Cost 60. Place three temporary radius-80 discs 120 units from cast position, 120° apart with the first along aim; after 1 s each deals 50 damage once. These discs use separate ultimate state and never join E's three-layer pool. |

**Equipment combo.** Weapon **Echo Lattice**: Q gives an immediate line hit and mature-layer bursts plus one 0.45 s item echo, but the echo is fixed at its own captured target point and cannot release more layers. Charm **Relay Knot**: E reduces an active Q cooldown by 1 s; Q reduces E/F by 1 s, supporting preparation then release without bypassing the 2 s maturity rule. Relic **Crosswind Drum**: E → F within 3 s grants the buff while enemies slow; Q during its following 3 s can benefit on both the line and mature-layer damage. Waiting is a tactical choice rather than a demand to alternate three different techniques.

**Strengths / weaknesses.** Strong against predictable swarms and stationary objective approaches; each layer is bounded and explicitly visible. Low pressure when constantly displaced. Early Q cannot detonate immature layers, and an enemy may simply leave their circles. No counter, invulnerability or self-heal.

**Local review before implementation.** Bagan lacquer artisans and Myanmar reviewers from more than one community should review occupation, material depiction, clothing and name; cultural review is not government endorsement. Do not treat Bagan as only temples, copy religious lacquer imagery, conflate all ethnic groups, borrow military uniforms, or turn current conflict into a character gimmick. Confirm invented disc effects do not suggest that real craft materials are safe to spray or burn.

## Timor-Leste — Lia Soares, Shuttle Courier

**Grounding (paraphrase).** The [UNESCO multimedia record for Tais](https://www.unesco.org/archives/multimedia/document-5636), documenting a 2020 film by Timor-Leste's Secretariat of State for Art and Culture and the 2021 Urgent Safeguarding List inscription, describes handwoven cotton, plant-derived dyes, women transmitting weaving knowledge, and motifs varying by group. Tais also has identity, ceremonial and social meanings; the draft does not treat it as generic interchangeable decoration or a magic weapon.

**Fictional adaptation.** Lia is a fictional woman who delivers weaving supplies and learns workshop maintenance. A compact wooden shuttle frame, side spool and short undecorated woven sash give a split rectangular silhouette. She throws a projected shuttle of light, not finished tais. Role: recovery skirmisher. Draft stats: 105 HP, speed 195, `ultNeed 50`.

**Signature — Catch the Return.** Each basic launches one shuttle out and back; keep at most two basic shuttles alive, otherwise defer basic fire. After its turnaround, a shuttle becomes catch-ready only after it has spent 0.2 s returning. Coming within 24 units while Lia is moving through normal ground input then consumes it and grants one Spool, cap three; standing still, teleporting and dashing cannot earn a catch. A shuttle reaching Lia before that interval ends, reaching her while she is ineligible to catch, timing out, or disappearing on transition grants nothing. A catch grants no damage immunity. E spends all Spools to add damage to its dash; each spent Spool adds 12 damage once per dash-hit enemy. Catching changes the route and timing, rather than Sari's counter or Jet's distance charge. An outlined return marker and spool pips explain the loop without tiny pickup targets.

| Slot | Fictional skill | Initial behavior |
| --- | --- | --- |
| Basic | Supply Shuttle | Every 0.85 s, damage 9 per outbound/return pass, speed 420, turnaround at 0.45 s, lifetime cap 2 s; separate per-pass hit sets, pierce all, one hit per enemy per pass. |
| Q | Open a Path | CD 6 s. Length-240, width-35 line for 28 damage and 160-unit knockback. Creates no catchable projectile. |
| E | Carry Through | CD 7 s. Ground dash up to 150 units over 0.2 s, stops at blockers; damage 20 plus 12 per spent Spool, once per enemy. No invulnerability; dash movement cannot itself catch shuttles. |
| F | Gather Supplies | CD 10 s. For 2 s, catch radius increases from 24 to 60; one radius-120 opening pulse deals 16 damage and 1 s of 50% slow. Does not pull XP or real drops. |
| R | Delivery Circuit | Cost 50. Three projected shuttles fan at −25°/0°/+25° along aim, damage 22 per outbound/return pass, same speed/turnaround/lifetime as basic. These are visually larger, cannot be caught, and grant no Spools. |

**Equipment combo.** Weapon **Forked Conduit**: E adds two bolts from its captured cast position/aim, giving ranged coverage while Lia spends Spools on the dash; the bolts are not catchable. Charm **Undertow Thread**: F leaves a slowing patch at departure while its larger catch radius lets Lia intercept an already-returning basic shuttle; the patch stays where F was cast. Relic **Monsoon Lens**: R at that patch adds three stationary pulses as Lia repositions to receive returning projectiles. Ultimate shuttles and item pulses never generate extra Spools.

**Strengths / weaknesses.** Rewards planned return paths with mobile bursts; F makes the catch less precise for touch play. Catching near enemies is risky, the dash offers no immunity, and R cannot refill Spools. Narrow routes and losing shuttles to the lifetime cap reduce payoff; this is not an unlimited projectile swarm.

**Local review before implementation.** Timorese women weavers and Tetum/Portuguese-speaking reviewers should check working name, delivery-role framing, loom-tool proportions and sash use. Choose any recognizable textile motif only with its community's guidance and permission; do not copy ceremony/status patterns or cut, burn or throw actual tais. Acknowledge variation across communities and avoid reducing Timor-Leste to recent statehood or a single national costume.

## Recommended first prototype and acceptance boundary

**Prototype Nadi first**, subject to cultural review. Her mature-layer timing creates a clear new wait/place/release decision, unlike the existing movement, alternating-cast, counter and summon loops. Three bounded entries, existing delayed-strike/zone primitives, line damage and the existing simulation-clock update hook cover most behavior. She needs no new terrain, pathfinding, ally AI, shield system, moving-line intersection or precision catch input. A plain-circle development prototype can test whether preparation remains enjoyable under elite fan/burst pressure before any character art is commissioned. This is a system-reuse recommendation, not a claim that Nadi is already balanced or culturally approved.

Scope for that later prototype would include hero registration and lobby/HUD explanations, simulation and signature state, Q/E/F/R casts and auto-cast predicates, skill poses/VFX/audio, equipment attribution and accessible descriptions, reset/raid behavior and the existing browser acceptance harness. Use existing `HEROES`, `CAST`, `HOOKS` and rendering boundaries; do not add another animation loop. Preserve the current five heroes, saves, equipment contracts and regional content. The present ticket changes none of those files.

Before implementation, write browser failure cases for premature release, exact 2 s maturity and 7 s expiry, oldest replacement at the fourth layer, overlapping layer hit counts, out-of-range release, rejected casts, item-origin recursion, pause/overlay freeze, raid/new-run cleanup and keyboard/touch targeting. Keep downloadable timestamped JSON and screenshots from the existing real-game seam. Later measure whether waiting 2 s creates useful choices, whether moving enemies leave every layer empty, and whether the three-layer cap stays readable at mobile width. Adjust draft numbers from those observations; do not represent the tables as test results.

## Documentation verification and unresolved review

Checked against the full `DESIGN.md`, `src/content/core.js`, `src/game/heroes-sea.js`, `src/game/hero-identities.js`, existing equipment registry, and canonical #8/#11 on 2026-11-15. Coverage: seven countries; seven explicitly fictional identities; seven institutional grounding paragraphs; seven silhouettes/tools/roles/signatures; 35 basic/Q/E/F/R rows; 21 concrete slot combinations covering all six new items; seven strengths/weaknesses and local-review sections; comparison and first-prototype rationale. Sourced statements are paraphrases; no source artwork, music or decorative motif was copied.

Source dates are publication/update dates only when displayed; museum/tourism pages without dates are explicitly undated. Some ASEAN/UNESCO endpoints returned access challenges on direct opens; their official indexed text was available through search, and separate official ASEAN-membership and accessible UNESCO cultural pages were checked where available. No claim relies on an unofficial list, a search engine's relative publication-age label, or an unverified inferred tradition. Institutional sources establish the narrow inspiration, not cultural permission or comprehensive coverage of a country.

No gameplay code or assets changed, so build/lint/E2E are not applicable to this documentation-only ticket. Local cultural/name review, exact implementation feasibility of the six non-prototype signatures, accessibility playtests, balance, real-device performance and any future art permissions remain unverified. These are draft limitations, not authorization to add the heroes to the current roster.
