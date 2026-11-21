# Playable ASEAN roster, animation and flags

User follow-up to #8: create the seven drafted characters as complete playable heroes with varied skills, fitting names/captions, sprites, movement/attack animation, and national flags beside names. Broad League of Legends mechanical inspiration is allowed. This is implementation authorization for these seven drafts, superseding their earlier documentation-only status; cultural approval is not implied.

Baseline and review fixed point: `c47b009178dcaa9a83044c3fea8ff1ad0d86adc5`. Integration: `codex/asean-roster`, stacked on PR #13. Keep existing five heroes, eighteen equipment items, six worlds, raids, weather and progression. No main merge, public Astrocade publication, backend, persistent inventory, shop pricing, new maps or gameplay dependency.

## Seven complete kits

The **numeric basic/Q/E/F/R tables, stats, signatures, strengths/weaknesses and equipment examples** in [the authored concepts at the fixed baseline](https://github.com/miooor/aseansurvivor/blob/c47b009178dcaa9a83044c3fea8ff1ad0d86adc5/docs/asean-hero-concepts.md) are the implementation contract. Source facts remain paraphrases with their original institutional citations; the names, combat and occupations are fictional. Preserve those local-review caveats. The later prototype-only/no-gameplay limitation is superseded here. Ordinary rank cooldown scaling uses the existing `rc`; listed damage scales with `rm`. Other durations/radii/resources do not scale unless the table says so.

| ID | Hero / country | Required distinctive loop | Named active skills Q / E / F / R |
| --- | --- | --- | --- |
| asha | Asha Lim / Singapore | Ticket at most three targets; serve with actual landed hero basics; collect served tickets. | Open Docket / Clear the Rail / Make Room / Night Shift Relay |
| mira | Mira Reyes / Philippines | One tow endpoint; earn 90-degree angular travel through normal movement, then release a triangle sweep. | Set the Tow / Swing Clear / Brace the Reel / Open Water Turn |
| dani | Dani Rahman / Brunei | Leave anchor, move 160 away, return within 70 and use F for a bounded HP shield. | Clear the Landing / Mooring Light / Step Ashore / Sheltered Reach |
| vanna | Vanna / Cambodia | Lay two oriented strips; a real overlap centroid enables F detonation. | Lay the Warp / Pass the Weft / Lift the Frame / Broadcloth Screen |
| keo | Keo / Laos | Next successful Q/E/F inside the 1.5–2.0-second measure gains 40% hero-skill damage. | Low Register / High Register / Rest Beat / Long Exhale |
| nadi | Nadi / Myanmar | At most three layers, mature at 2 seconds, expire at 7; Q releases only mature layers in range. | Lift the Finish / Lay a Coat / Keep Clear / Workshop Bloom |
| lia | Lia Soares / Timor-Leste | Catch returning basic shuttles while moving to earn up to three Spools, spent on E dash. | Open a Path / Carry Through / Gather Supplies / Delivery Circuit |

Use original English names that fit their jobs/tools, without unsupported local-language claims. Each skill needs a concise practical caption explaining effect, setup/payoff and useful limits. Lobby details and skill title/accessible description must reflect actual behavior. Keep HUD names readable at 320/390 CSS pixels and the scaled Astrocade frame. Show timed/readiness state using static shapes, numbers and text as well as colour; audio or flashing must never be required.

Mechanical references checked 2026-11-15 UTC: Riot's [Orianna](https://www.leagueoflegends.com/en-us/champions/orianna/), [Sivir](https://www.leagueoflegends.com/en-us/champions/sivir/) and [Xayah](https://www.leagueoflegends.com/en-us/champions/xayah/) illustrate positional objects, returning projectiles and prepare/release archetypes. These are inspiration references, not a request to reproduce exact kits, champion names, captions, art, silhouettes, audio or branding. Our seven authored loops and numbers remain authoritative.

## Shared runtime contracts

- Use existing HEROES/CAST/AUTO/EVOS/HOOKS and a small per-hero installer. Register all seven before identity/equipment wrapping; every hero has EVOS, even an empty array. Every successful cast must still emit one audio cue, pose and HOOKS.cast call. Rejected casts spend nothing. Existing five hero behavior stays intact.
- Keep simulation in game modules and drawing in scenes. New per-hero modules own their transient `g.roster` state; shared identity fields retain choreography. An optional signature detail/ready override is sufficient for custom progress; no generic ability framework or extra animation loop.
- Set per-hero rank-one basicDamage metadata and replace Split Ember's five-ID damage map once. All eighteen items work for all twelve heroes. Item-origin effects do not create signature resource, recast abilities or add skill audio. Keo's timing multiplier belongs only to the triggering hero skill, captured for its projectiles; never apply it globally to existing effects/items/basic/R.
- Serve Asha tickets only after an accepted hero basic hit, not after an oil-slip rejection. Use an explicit projectile hit tag/accepted-hit seam. Clear collected tickets before applying overlapping burst hits.
- Dani's absorb shield is HP plus expiry, never the existing timed-invulnerability `p.shield`. Mitigation precedes absorption, which precedes lethal/Last Lantern hooks. Preserve parry, normal damage grace and applied-HP-damage reporting. Shield refresh does not stack or heal.
- Reuse collision-valid placement/movement. Lia's dash has no immunity; damage resolves at actual collision-corrected movement, not an unclipped endpoint. Normal-input movement must be distinguished from dash/teleport for Mira/Dani/Lia signatures. No signature farming from teleports or synthetic coordinate jumps.
- Use simulation time. Pause/upgrade/equipment freeze everything. New run/menu/defeat and both raid transitions clear owned markers, fields, delayed strikes and hero-owned projectiles; do not remove unrelated item state. Sync transitions before casts, so a first new-raid cast is retained. Bounded hero schedules cap twelve, replace oldest; preserve authored smaller caps (tickets3, line1, anchor1, strips2, layers3, basic shuttles2, ultimate shuttles3). No unbounded effects/entities.
- Each hero needs useful AUTO predicates, keyboard/touch targeting with the existing buttons, original procedural basic/Q/E/F/R cues and distinct readable VFX matching the actual line/cone/strip/field/projectile geometry. Preserve audio mute/volume/voice cap and reduced-motion behavior.

## Original art and animation

Generate original sprites using the built-in image tool; no League/third-party character artwork. Practical invented workwear and tools follow the sourced draft boundaries, without sacred/royal/military insignia or copied textile motifs. Keep contemporary adults and distinguish the seven silhouettes/palettes. Retain original generated PNGs, exact prompts and provenance.

For each ID, create `assets/<id>-motion.png` and `assets/<id>-skills.png`, true alpha, exactly **8 columns × 8 rows**, with full padded bodies and stable foot pivots. Columns E/SE/S/SW/W/NW/N/NE. Motion rows0–3 are four distinct looping movement poses; rows4–7 are four distinct basic attack poses. Skill rows0/1,2/3,4/5,6/7 are windup/release poses for Q/E/F/R, matching that hero's tool/action. Idle holds an appropriate direction-specific recovery pose. Inspect actual direction, rows, clipping and pose changes; dimensions alone do not prove animation quality. Generated row irregularities need explicit measured frame metadata or regeneration, never invisible missing frames.

Also create one small shared `assets/roster-portraits.png` with seven matching roster illustrations in a four-column/two-row atlas, final cell empty. Lobby portraits must use this shared atlas, not fetch all large character sheets. Encode source PNGs as same-dimension WebP with exact alpha and measured bounded colour error, retaining sources; renderer uses WebP for the new hero assets. Asset owner records sizes and validation. Generated-art previews and moving/attacking browser evidence are required.

Use an explicit art manifest. Preload shared world/lobby art, then prepare only the selected hero's large motion/skill pair before Start succeeds. Keep synchronous runtime newGame for an already-prepared hero. Selection changes, retries, rapid selection races, scene destruction and failed asset retries must have clear behavior. Never silently draw Hakim for an unknown/missing hero. Keep at most the current pair plus one incoming pair during a switch; release old large textures once safe. No inactive new hero sheets requested on a fresh default start. Existing five atlases/gutters/poses remain correct.

## National flags

Show a consistent national flag immediately beside the hero name on every existing name surface: roster cards, selected hero and in-game HUD. All twelve heroes, eleven countries; Malaysia has two heroes. Keep country text/accessible names and base hero-name text independently readable. Small flag images must not depend on emoji rendering or trigger large sprite downloads.

Use the eleven local SVG flags from [flag-icons](https://github.com/lipis/flag-icons), pinned to commit `ac7e0eb3259eb62aa6100c435607e2fe03896a97`, with its MIT license/copyright retained. Embed trusted static SVG flag images as self-contained data URLs for the export; no runtime third-party fetch or new library. Validate that all decode and the country-to-flag mapping is correct, including Brunei/Cambodia/Laos/Myanmar/Timor-Leste.

## Acceptance and delivery

Before nontrivial source changes, record failure cases and failing real-browser checks through the existing dev-only runtime and actual controls. No isolated unit suite or production test API. Cover exact signature thresholds/caps/ticks, rejected casts, ranks, kill/damage attribution, all six new skill supports plus Split Ember and defensive/lethal interactions, AUTO, first level-up, raid entry/exit, restart/menu/save preservation. Keep all existing assertions unless twelve-hero/selected-loading behavior deliberately supersedes a five-hero/eager-load expectation; document each expectation change.

Verify all twelve real lobby starts, static flags/portraits, eight-direction movement/basic/skill frame contracts, actual animation progression/freeze, ability feedback, loading success/failure/races/texture bounds, 320/390 layouts, keyboard and simultaneous touch movement/casting, muted/reduced-motion timing indicators and bounded audio. Inspect every new hero visually. Preserve all original five hero-specific checks. Update galleries and hardcoded roster lists deliberately.

Run lint/typecheck/normal/Astrocade builds and relevant gameplay, equipment, events, region/environment, audio, roster and exact-export sandbox/mobile checks; save downloadable timestamped JSON and screenshots. Exercise each new loop manually in bounded combat, and retain honest loading/frame/memory observations. Existing dense Safari/mobile performance limitations are not claimed fixed by this roster work.

Update docs/status from documentation-only to implemented while preserving sources and unverified cultural/balance/physical-phone caveats. Upload only validated final WebPs, update the CDN asset map, build a dry-run export, fresh-pull/reconcile the existing private Astrocade game, save all five files, read back and verify hosted play. Keep it private/unpublished. Final separate Standards/Spec review against c47b009; one fresh fixer for findings; mark the new PR ready. Archive created implementation worktrees where the app permits it, preserving protected checkouts.

Task graph: Art and shared foundation begin independently; two disjoint hero packs depend on foundation; final integration/export verification depends on both packs, foundation and art. Fresh implementer/worktree per ticket and fresh merger per completion, as requested by implement-spec. Parent coordinates shared-file ownership and exclusive browser use.
