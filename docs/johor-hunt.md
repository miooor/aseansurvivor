# Thorn Hunt and relic equipment

Historical slice evidence. The follow-up [combat contract](event-combat.md) supersedes elite patterns and rescue/ward compositions; [skill equipment](skill-equipment.md) expands the catalogue from twelve to eighteen items. [Combined verification and play/profile evidence](gameplay-upgrade.md) records the integrated follow-up. Earlier spec #1/PR #7 remains a separate workflow.


Ticket #5 of [Johor encounter and loot spec #1](https://github.com/miooor/aseansurvivor/issues/1), built on integration `a04dd11`.

Johor's palm grove contains a deliberate hunt marker at (-1800, 1400), separate from the existing cache. Starting reveals only the first track, at (-1650, 1650); investigating reveals the second at (-1300, 1750). The second investigation reveals Briarback, a Thornbound Palm Stalker, in the clearing at (-1100, 1450). Every point is projected to collision-valid ground. Only confirmed damage death of the owned elite completes the hunt. Leaving the grove does not fail it; abandonment is final for the run and removes all owned actors and hazards. Survival, raid arbitration, modal pausing and cleanup use the shared encounter contract.

Thornbound uses the existing elite health/contact multipliers (3× health, 1.25× contact damage). Charges leave up to five radius-35 patches. Every patch lasts four simulation seconds, with its first 0.6 seconds serving as a harmless warning. Yellow outlined spokes become purple harmful ground, independently of motion. All patches share one player damage cooldown: eight damage at most once per second through the usual mitigation and invulnerability path. At the five-patch cap, new patches are skipped rather than shortening existing lifetimes. The named elite has a purple accent; the track marker disappears during combat to avoid overlapping labels.

Completing the hunt offers three distinct relics from the four definitions. The reward and inspection controls use the existing keyboard focus, touch target and atomic equip/skip behavior:

- **Thorn Echo:** every third successful Q/E/F cast produces a radius-120, 30-damage item-origin pulse. Basics, ultimates and rejected casts do not advance it. Normal outgoing modifiers apply.
- **Last Lantern:** post-mitigation lethal damage leaves one HP and grants two seconds of invulnerability once per run. Consumption lives outside replaceable item state, so replacement cannot restore it.
- **Bounty Seal:** confirmed elite deaths from ordinary or periodic hero damage heal 15 HP and add ten percentage points of ultimate charge, respecting both caps. Item-origin deaths retain ordinary enemy rewards but cannot trigger this further item effect; direct despawn and repeated death cannot trigger it.
- **Aftershock Bell:** a successful ultimate adds 25% outgoing damage for five simulation seconds. It combines additively with weapon contributions, refreshes rather than stacking, freezes with simulation, and clears on removal.

Special effects have named text/ring feedback. Item pulses do not produce extra skill audio or signature charge. Equipment and encounter state remain run-local; no save format or progression migration is involved.

## Repeatable verification

Run the repository container workflow, open `/tests/johor-hunt.html`, select **Run hunt checks**, keep the tab active, then download the timestamped JSON report. Preview buttons reproduce track, thorn warning, reward and equipped states. Tests stage actual projectiles, enemy charges and hero casts through the existing development runtime and use actual HTML controls. Use a disposable localhost port for end-of-run fixture checks.

Failure cases were defined before implementation: accidental activation, revealing both tracks, blocked objectives, false death attribution, duplicate rewards, warning damage, overlapping cooldowns, early patch eviction, stale hazards, rejected/basic/ultimate casts advancing the pulse, recursive item effects, incorrect audio/signature charge, Bell stacking, lethal rescue resetting on replacement, resource overflow, compounded modifiers, save leakage, overlapping modals and inaccessible controls.

Native Safari on macOS, 2026-11-14:

- Hunt acceptance: **212/212 PASS**, [`evidence/johor-hunt/hunt.json`](evidence/johor-hunt/hunt.json), 14:22:27Z. Covers all five heroes with all four relics, mitigation/parry, once-per-run use, real later defeat, kill attribution, caps, weapon/relic combinations, reachability, patch warning/cap/lifetime/overlap, lifecycle, raids, save preservation, queued level-up, 320/390px layouts, focus restoration, and simulated reduced-motion preference with visible modifier labels and stationary enemy art.
- Four screenshots in the same directory: `track.png`, `thorns.png`, `reward.png`, `equipped.png`.
- Container lint, typecheck and production build pass; the existing Vite large-chunk warning remains. Output: [`evidence/johor-hunt/checks.txt`](evidence/johor-hunt/checks.txt).
- Existing gameplay: **574/574 PASS**, [`evidence/johor-hunt/gameplay.json`](evidence/johor-hunt/gameplay.json), with no captured runtime errors.
- Existing regions: **117/117 PASS**, [`evidence/johor-hunt/regions.json`](evidence/johor-hunt/regions.json).
- Existing rescue/weapons: **141/141 PASS**, [`evidence/johor-hunt/rescue.json`](evidence/johor-hunt/rescue.json).

Incremental browser failures preceded the relic definition, hunt prompt, thorn patch, pulse damage, Bell damage and Bounty healing implementations. Subsequent evidence exposed early patch eviction, which was fixed without weakening the four-second assertion. Audio checks account for the existing 90ms repeated-cue throttle; projectile checks advance through actual ultimate hit-stop. Visual review removed overlapping hunt/elite labels.

The shared prompt overlaps the signature help line in the inherited layout, while all hunt controls remain readable. Ticket #4 carries the shared positioning correction; combined verification must retain it. Real-phone performance, crowded-event profiling and three-build balance observations belong to combined ticket #6; this report makes no balance or real-device performance claim.
