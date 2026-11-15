# Combined combat and skill-build verification

Scope: [spec #8](https://github.com/miooor/aseansurvivor/issues/8), dependent [ticket #12](https://github.com/miooor/aseansurvivor/issues/12). The integration includes [elite combat](event-combat.md), [six new support items](skill-equipment.md) and [seven researched hero drafts](asean-hero-concepts.md). The five-hero playable roster, six regions, run-local equipment and existing progression format remain. This evidence does not reopen old spec #1/PR #7.

## Repeatable combined fixture

Use the repository container workflow and open `/tests/gameplay-upgrade.html`. Select **Run combined checks**, keep the tab active, require PASS, then **Download report**. Reload the whole harness after source changes: a development iframe can retain an old runtime reference after HMR. The fixture uses the agreed development runtime to stage deterministic conditions, while event activation, track investigation, reward selection, skills and overlays use actual HTML controls. It introduces no production test API, dependency or artwork.

The focused Safari run on 2026-11-15 passes **49/49 checks**, with no captured runtime errors: [downloaded JSON](evidence/gameplay-upgrade/combined-green.json). It combines support-item kills of an owned hunt elite by Echo, Fork and Lens, once-only completion/reward state, absence of recursive Bounty heal/bonus charge, Relay plus Crosswind damage, the original additive three-slot bonus, charge-first rescue behavior with equipped skills, inspection/pause/upgrade freezes, active-event raid arbitration, support inside raids, transition/menu/new-run cleanup, progression-save preservation, 320/390-pixel target bounds, keyboard movement and simultaneous synthetic touch movement/F casting. Individual exact item/all-hero and elite action contracts remain covered by their linked focused suites; this fixture adds the integrated seam.

Failure cases were recorded before writing the fixture. Two early runs exposed fixture timing assumptions: a fixed number of updates does not imply an exact elapsed simulation duration because casts apply cosmetic hit-stop. Clock-based advancement now observes Echo and raid completion, retaining damage/lifecycle expectations. [Preserved timing diagnostic](evidence/gameplay-upgrade/fixture-cleanup-timing.json).

The broad UI harness’s initial idle-facing loop previously allowed normal basic/automatic combat while waiting between directions. A controlled browser reproduction shows Jet’s legitimate basic at `castT: 0.27`, slot 0, rendering `hero-motion-rempit` frame 32, so an idle-only `hero-directions` assertion is false. Moving the existing combat isolation before the first wait makes all eight unchanged idle expectations pass; all 574 broad assertions remain. [Repeatable diagnosis](evidence/gameplay-upgrade/idle-baseline-diagnostic.json), **Diagnose idle baseline** in the fixture. No production animation changed.

Mobile review found real presentation failures. Safari measured the 44-pixel pause control at 43.98896789550781 CSS pixels under its fractional browser zoom; its base and compact widths/heights are now 45, retaining the ≥44 assertion. [Red report](evidence/gameplay-upgrade/pause-target-red.json). Elite labels were 14 world pixels, only 6.552 CSS pixels at the 390-pixel camera zoom. Their scale now compensates for zoom, keeping 14 CSS pixels before any external host scaling. The new ≥12 rendered-CSS-pixel assertion failed before that change and passes after it. [Label red](evidence/gameplay-upgrade/mobile-label-red.json), [before screenshot](evidence/gameplay-upgrade/mobile-label-before.png), [readable mobile warning](evidence/gameplay-upgrade/mobile-warning.png). The preview positions the elite below the event prompt so actual world text can be inspected; the prompt/HUD is not hidden.

Inspection during an active event exposed the encounter prompt painting over the equipment dialog. The browser’s `elementFromPoint` at the actual overlap returned `encounterPrompt`, confirming the screenshot. The shared normal `.ov` overlay now has z-index 20, matching the existing Astrocade layer; equipment, pause and upgrade checks require their real dialogs to paint above the active prompt. [Red report](evidence/gameplay-upgrade/modal-order-red.json), [before screenshot](evidence/gameplay-upgrade/modal-order-before.png). No event or reward rules changed.

Astrocade adds an external host transform after the game camera. **Check scaled Astrocade label** loads the actual port stylesheet into the real development game, sizes the game to 720×1280 and applies a measured 0.44 outer scale, without a simulated platform API or export substitution. The initial rendered text was 6.16 screen CSS pixels. A fixed internal `--elite-label-scale: 2` in the port stylesheet now produces 28 game CSS pixels after zoom compensation, or 12.32 screen CSS pixels at that host scale. The normal browser fallback remains 14. The scene reads the value once at creation/resize. Reload the entire harness after this check to restore normal CSS/layout. [Scaled red](evidence/gameplay-upgrade/scaled-label-red.json), [scaled green](evidence/gameplay-upgrade/scaled-label-green.json), [scaled warning screenshot](evidence/gameplay-upgrade/scaled-label-after.png). This local style/renderer check complements the parent’s final actual-export and hosted verification.

Final visual presets keep the live event prompt visible, wait for the ordinary discovery banner to expire and pause inside the harmless warning window. [Armoured fan](evidence/gameplay-upgrade/fan-warning.png), [enraged burst](evidence/gameplay-upgrade/burst-warning.png), [390-pixel burst](evidence/gameplay-upgrade/mobile-warning.png), [actual sampled weapon offer](evidence/gameplay-upgrade/weapon-reward.png), [corrected Lens first pulse with the zoning build](evidence/gameplay-upgrade/lens-corrected.png). Lens emits its name once at cast time and retains each pulse ring.

## Reproducing the three build observations

Select **Play Hakim chain**, **Play Hakim zoning** or **Play Hakim sustain**. Each starts the same hero at rank one, deliberately activates all three real loot encounters, stages the enemies’ defeat, samples deterministic real three-choice offers and selects actual reward buttons. No equipment slot is assigned directly. The fight then reopens a staged hunt with Briarback at half normal maximum HP and twelve mixed Pocong/Palm Stalker adds, using normal enemy damage and normal player maximum HP; the sustain charm raises that maximum from 150 to 190 by its real effect. Initial ultimate charge is staged full. Ordinary waves, durians and power-up spawns are disabled to keep these short comparisons bounded. Event locations and actors are moved to the village clearing for visible keyboard combat. This is not a natural full-loot run or equal-power balance trial.

Click the battlefield, use WASD/arrows plus Q/E/F/R, choose real upgrade cards if earned, then **Record play observation** to pause and record state. **Inspect build** opens the actual equipment panel. The width selector provides 320/390-pixel layouts. Automated touch inputs are synthetic pointer events in the real browser; keyboard observations use native input. Neither is physical-phone testing.

| Build | Actual equipment | Decision exercised |
| --- | --- | --- |
| Chain | Echo Lattice + Relay Knot + Crosswind Drum | Alternate Q/E/F within the three-second window and use Relay’s reduced other-skill cooldowns; the echo remains fixed at the marked point. |
| Zoning | Forked Conduit + Undertow Thread + Monsoon Lens | Leave a slow patch with F, aim E’s extra bolts and keep enemies near the stationary R pulses. |
| Elite sustain | Hunter’s Edge + Lantern Heart + Bounty Seal | Focus elite damage while preserving the five-second no-damage recovery window; hero-origin elite kills add sustain. |

## Observed play, 2026-11-15

Native Safari keyboard inputs exercised movement and Q/E/F/R in all three staged builds. [Recorded states](evidence/gameplay-upgrade/manual-play.json) include equipment, simulation time, HP, outcome and captured errors. All three completed the reopened hunt without defeat or captured runtime errors. The kill counter includes 25 setup kills used to obtain the gear; it is not a fight-only score. Completion removes surviving event-owned actors, so 29 kills in the sustain run means the elite died before all twelve adds, while 38 means those adds were also defeated.

- **Chain:** E → Q → F followed by the staged R, then movement and later skills. Relay made the next skill cycle available sooner; named Echo/Drum feedback and the ordinary Sanctuary loop remained visible. At the recorded 25.02 simulation seconds, HP was 150/150, the hunt was complete and the combo counter was one. The early original barrier dominated sustain in this short run. The fixed Echo point still asks the player to catch an enemy before it moves, and the three-second Drum window asks for a second distinct available skill. [Equipment screenshot](evidence/gameplay-upgrade/build-chain.png).
- **Zoning:** F/E, retreat and Q, then a real Guli upgrade choice when earned, followed by R and more movement. The extra bolts and slow patch produced useful approach pressure, but leaving the cast position also left the fixed R/Lens area behind. HP fell to 46 during the crowded approach and reached 23/150 at the recorded 22.65 simulation seconds; the hunt and all staged enemies were cleared. This run demonstrates a positional cost and real incoming damage, not a proof that zoning is weaker. [Combat](evidence/gameplay-upgrade/build-zoning-combat.png), [equipped descriptions](evidence/gameplay-upgrade/build-zoning-equipped.png).
- **Elite sustain:** Q/E into the approaching elite, movement, F/R attempts and a real Pelita choice at the earned upgrade; subsequent F/R and retreat completed the cycle. The hunt completed with only four additional kills beyond setup, clearing remaining owned adds. HP was observed at 71/190 before later recovery, then about 140.21/190 at 33.44 simulation seconds. The barrier/Sanctuary and Lantern recovery overlap, so this observation does not attribute every recovered HP to one item. Hunter’s Edge targets the elite objective; Lantern needs a damage-free interval, and Bounty cannot prevent damage before the kill. [Combat/recovery](evidence/gameplay-upgrade/build-sustain-combat.png), [equipped descriptions](evidence/gameplay-upgrade/build-sustain-equipped.png).

Inputs and upgrade choices differed between runs. Initial full R, staged gear, half-health elite and cleared ambient spawns make these reproducible build observations, not equal-power comparisons, natural acquisition tests or full-run balance evidence.

## Profile method and limits

After closing other active acceptance runs and waiting for a quiet build window, select **Profile active event (15 seconds)** at 1280×720 and keep Safari visible. The preset earns the zoning gear through real rewards, starts an active half-health enraged hunt elite plus 96 owned mixed enemies, gives enemies 100,000 maximum HP, makes the hero invulnerable and enables the existing automatic skill mode. It starts E/F/R effects and measures browser animation-frame intervals for fifteen wall-clock seconds. It records user agent, hardware concurrency, viewport, enemy/effect/projectile ranges, median/p95, intervals above 50 ms and raw samples. Invulnerability and elevated enemy HP deliberately keep the crowded encounter active; manual play above uses normal damage and health.

The single final quiet-window sample was captured at **2026-11-15T16:59:33Z** on an Apple M1 MacBook Air, eight CPU cores, 8 GB RAM, macOS 26.3.1 and native Safari 26.3.1, with a measured 1280×720 game viewport and no explicit CPU/network throttle configured. Parent verification test tabs were closed and agent build/test jobs stopped before the sample. The game had the merged water-filter correction and final label/modal source; ordinary Johor rain remained visible. Actual hardware comes from the local system inventory; Safari’s compatibility user agent reports “Intel Mac OS X 10_15_7” and does not identify the actual chip/OS.

| Observation | Single 15-second active-event sample |
| --- | --- |
| Duration / frames | 15,024 ms / 184 |
| Mean frame rate | **12.25 FPS** |
| Median / p95 interval | 60 ms / **234 ms** |
| Intervals above 50 ms | 125 |
| Living enemies | 97 throughout |
| Effects | 7–149 |
| Hero/item projectiles | 0–3 |
| Hostile projectiles | 0–8 |
| Zones | 2–7 |
| Event / captured runtime errors | Active throughout / none |

[Raw frame samples and conditions](evidence/gameplay-upgrade/desktop-profile.json), [paused crowded scene](evidence/gameplay-upgrade/desktop-profile.png). The result is a **material dense-combat performance limitation**, not a performance PASS. The screenshot shows a heavily overlapping crowd and combat numbers; this observation does not isolate which simulation/rendering component causes the slowdown. The sample measures fifteen wall-clock seconds, not fifteen seconds of full simulation progression; the paused game clock is about four seconds. No repeat was run to replace the slow result. Comparison with the older Chromium sample is not causal evidence because browser, combat effects, active event and source differ.

This is a bounded desktop stress observation. It does not measure loading, phone GPU/memory/thermal behavior, long-session pacing or natural loot balance. The earlier [Johor crowd sample](johor-performance.md) had no active event or skill casts and remains historical evidence of that different scenario. Parent verification records full regressions, normal/Astrocade builds, private-draft revision, hosted play and remote file read-back after integration.

The subsequent [bounded rendering investigation](render-performance.md) removes fully offscreen water-filter work and preserves visible banks through 112 pixel pairs. It does not resolve the frame-rate limitation: the full crowded comparison is 12.13 FPS before and 11.60 FPS after; the ordinary short scene is 21.90 FPS. Both raw comparisons and their conditions remain available.

## Final integration and private draft

Source integration `5f7656212d03049e4d1ced372ceb1465a4f1192c` includes the fresh review correction: fear no longer redirects a locked elite charge, including the final tick. Warning rays and projectile emission share the existing encounter content map. Separate final Standards and Spec rechecks have no unresolved findings. [Initial findings, fixes and rechecks](evidence/gameplay-upgrade/review.md), [test-first red 118/124 and green 124/124](evidence/review-fixes/README.md).

The integration was verified incrementally through the real browser/runtime boundary. Broad gameplay/event/equipment checks preceded the final rendering-only cull and bounded fear correction; those subsequent changes received focused water/environment and 124-check combat reruns. The exact final production export then passed sandbox/mobile checks. These are not claims that every historical suite was rerun at one final SHA.

| Browser suite | Passing checks | Artifact |
| --- | ---: | --- |
| Gameplay/UI | 574 | [JSON](evidence/gameplay-upgrade/regression-gameplay.json) |
| Six-region navigation | 117 | [JSON](evidence/gameplay-upgrade/regression-regions.json) |
| Rescue / Ward / Hunt | 141 / 208 / 212 | [Rescue](evidence/gameplay-upgrade/regression-rescue.json), [Ward](evidence/gameplay-upgrade/regression-ward.json), [Hunt](evidence/gameplay-upgrade/regression-hunt.json) |
| Existing combined event seam | 8 | [JSON](evidence/gameplay-upgrade/regression-existing-combined.json) |
| All six support items / all five heroes | 275 | [JSON](evidence/gameplay-upgrade/regression-equipment.json) |
| New combined builds/events/touch | 49 | [JSON](evidence/gameplay-upgrade/combined-green.json) |
| Final combat, including fear | 124 | [JSON](evidence/review-fixes/fear-green.json) |
| Final environment / water visibility | 76 / 57 | [Environment](evidence/render-performance/environment-green.json), [Visibility](evidence/render-performance/visibility-green.json) |
| Actual water pixels / lifecycle | 292 | [112 pixel pairs](evidence/render-performance/water-green.json) |
| Exact Astrocade sandbox / mobile export | 62 / 18 | [Sandbox](evidence/gameplay-upgrade/astrocade-sandbox.json), [Mobile](evidence/gameplay-upgrade/astrocade-mobile.json) |

Container lint, strict typecheck, normal build and final Astrocade build pass; existing large-Phaser-chunk and Vite callback-timing diagnostics remain. The final dry-run export contains five files, eighteen assets, 1,507,669 JavaScript bytes and 34,675 HTML bytes. Source artwork/asset download totals are unchanged by this gameplay iteration.

The existing private Astrocade game was saved as revision `01M7G5D79K4SHTDRBB6P3A856K` after a fresh unchanged pull with no pending wishes. [Play the owner-only draft](https://www.astrocade.com/games/asean-survivor/01M7FMJGJ3PMC9H145JJCCNEKR/v/01M7G5D79K4SHTDRBB6P3A856K). [Read-back](evidence/gameplay-upgrade/readback.json) matches all five files and records private/unpublished state. Hosted Johor reaches level four/50 kills at 0:37, with earned upgrade selection, pause/freeze/resume, controls inside the 720×1280 frame and no captured warnings/errors. The measured 390×844 view displays the 112-frame-pixel controls at about 60.67 CSS pixels. [Measurements](evidence/gameplay-upgrade/hosted.json), [combat](evidence/gameplay-upgrade/hosted-mobile-combat.jpg), [paused deliverable](evidence/gameplay-upgrade/hosted-mobile-paused.jpg). Temporary overrides are restored.

The exact exported mobile sample under 10 Mbps/80 ms/4× CPU passes all functional checks but averages **24.34 FPS**, p95 **67.3 ms** over 15 seconds, with **15,944 ms** artwork readiness. Dense Safari remains **11.60 FPS** in the synthetic 97-enemy sample, and its ordinary scene was **21.90 FPS**. These are material performance limitations, not phone guarantees or a performance acceptance. Physical phones, sustained thermals, natural full-run loot/balance and local cultural review of the seven hero drafts remain future work. Six temporary implementation checkouts were archived; the app refused to archive the last review checkout because it is the chat's protected primary checkout. Its committed work is merged, its container stopped/removed, and it remains recoverable rather than being forcibly removed. The older Johor/PR #7 checkout was untouched.
