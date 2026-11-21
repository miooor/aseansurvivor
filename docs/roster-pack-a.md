# Asha, Mira and Dani

Ticket #19 implements the three full playable kits from [the roster specification](asean-roster-spec.md) and [authored numeric tables](asean-hero-concepts.md). The five existing heroes, progression/save format, item contracts and shared successful-cast wrapper remain in place. No dependency or save migration was added.

## Contracts and ownership

The installers in `src/game/heroes/{asha,mira,dani}.js` register complete Basic/Q/E/F/R data, practical captions, rank-one basic damage, identity metadata, AUTO predicates and empty EVOS. Simulation state is owned by `g.roster.<id>`; the corresponding `src/scenes/heroes/*.ts` modules draw it using the public floor/effects primitives. Shared audio, poses and cast hooks run once through the foundation wrapper. Origin-tagged item effects never call a hero CAST or advance these signatures.

- **Asha — Service Window:** Q refreshes existing in-area tickets before filling the global three-ticket cap. Basic prioritizes unserved tickets within 360 and serves only through an accepted hero-basic hit, after the oil-slip guard. E snapshots and removes eligible served tickets before any burst. Death and expiry give no collection damage. R has exactly five one-second ticks and serves existing tickets hit inside its fixed field.
- **Mira — Take the Strain:** Q owns one collision-valid five-second endpoint. Ordinary movement within 60–300 earns absolute angular displacement from the saved angle, rather than accumulating wiggles. Dash, teleport and leaving the range rebase progress. Ready E uses the actual endpoint/start/current triangle plus a 35-unit edge margin and consumes the endpoint. Q damage follows the actual clipped endpoint segment. F reduces incoming damage by 25% for three seconds; R captures three fixed lines at .3/.7/1.1 seconds.
- **Dani — Safe Landing:** E owns one six-second anchor. A continuous normal route reaching 160 away arms it; returning within 70 and using F consumes it for the anchor pulse and a nonstacking 30-HP/four-second shield. A jump/dash invalidates readiness and requires returning to the anchor before starting another eligible departure. Shield HP is separate from `p.shield` immunity. All mitigation precedes absorption, then lethal hooks. R has exactly six one-second ticks and gives 30% reduction only while Dani is inside.

Timers use simulation time, so pause and overlays freeze them. Each pack synchronizes both raid transitions before casts and update, preserving a first new-area cast. Cleanup removes only owned projectiles/effects/state. Fields/strikes cap at twelve; tickets, endpoint and anchor retain their smaller authored caps. Renderers show ticket outlines/checks, tow angle pips/triangle/margin, anchor readiness, shield pips, fixed fields and captured line geometry without requiring sound or flashing.

The parent explicitly extended ownership to the **Last Lantern hook only** in `src/game/hunt.js` after a real Dani E2E exposed fractional HP survival. The hook now floors pre-settlement HP to one before returning nonnegative remaining damage. Once-per-run use, two seconds of invulnerability, and applied-HP-damage accounting remain intact. No global damage-order change was made.

## Repeatable verification

Use the repository's Docker development workflow, then open each page, keep it active, select **Run checks**, and download its JSON report:

| Page | Final native Safari result | Evidence |
| --- | --- | --- |
| `/tests/hero-asha.html` | 106/106 PASS | `docs/evidence/roster-pack-a/asha-green.json` and `asha-green.png` |
| `/tests/hero-mira.html` | 99/99 PASS | `docs/evidence/roster-pack-a/mira-green.json` and `mira-green.png` |
| `/tests/hero-dani.html` | 112/112 PASS | `docs/evidence/roster-pack-a/dani-green.json` and `dani-green.png` |

The seam is the real Phaser scene, `prepareHero`, existing dev runtime, and actual lobby/skill/keyboard/touch event handlers. Controlled enemies and simulation steps make damage/timing assertions repeatable. Every test catches exceptions as FAIL; browser errors also force FAIL. No isolated unit suite or production test API was introduced. Each page ends on a frozen visual setup and can be rerun from its button.

Coverage includes real prepared starts, authored damage/rank/cooldown behavior, signatures and exact ultimate ticks, rejected casts, first level-up, all eighteen actual equipment choices, selected support-origin behavior, pause/overlay freezing, both raid transitions, cleanup/retry, real selected skill/basic artwork, frame progression and freeze, and simultaneous touch movement with keyboard casting. Asha additionally verifies exact save preservation after establishing a normal default save through the real end-game flow when the origin has none. Input events run in Safari; this is not a physical touch-device test.

Preimplementation registration reds for all three heroes and their screenshots are retained. Three production defects also retain specific real-browser reds:

- `asha-cleanup-red.json`, 2026-11-16T01:30:03Z, 89/90: untagged cosmetic rings survived raid entry. Hero-owned rings now carry their owner tag.
- `mira-clipped-line-red.json`, 2026-11-16T01:57:27Z, 87/88: an enemy on the actual clipped tow segment took no Q damage. Direction now comes from the collision-valid endpoint.
- `dani-last-lantern-red.json`, 2026-11-16T01:40:43Z, 41/42: Last Lantern activated at 0.8 HP but left 0.8 HP. The final fixture preserves the exact one-HP assertion and adds ordinary-integer and already-used cases.

Earlier attempts remain as evidence of fixture corrections: one normal frame after resume before clicking equipment; Euclidean 220-unit endpoint distance instead of demanding pixel-perfect horizontal aim; preserving an earlier Q endpoint through item replacement; and establishing an initially absent default save before an exact preservation assertion. These corrections retain the intended behavior checks and failure visibility.

Container lint (including all three new fixtures), strict typecheck and normal production build all PASS and are recorded in `*-final.txt`. The earlier successful build remains separately in `build.txt`. Existing chunk-size/timing diagnostics are retained; no missing-asset warning is accepted.

## Handoff and limits

Branch `codex/asean-roster-pack-a` began at `b0a788c`; foundation integration `c658cb9a6fe79cabec261edb3fcafd17faf7271e` was merged before production. Latest integration through `97f74a7` was merged before the pack commit. Work ran in the existing Node 24 dependency volume on container `asean-roster-pack-a`, port 5192, with parent-coordinated native Safari access. No remote state was changed.

Final all-twelve roster/export acceptance, original-five broad regressions, 320/390 layouts, all sixty audio cues, physical-device input, natural full-run balance/performance and cultural/name review belong to integration #21 or remain explicitly unverified. Pack results do not claim those checks or resolve the existing dense Safari/mobile performance limitation.

Integration follow-through is recorded in [twelve-hero acceptance](asean-roster.md), including the final directional/manual inspections, original regressions and retained rendering/layout reds. Physical-device, cultural and natural-run balance boundaries remain unverified.
