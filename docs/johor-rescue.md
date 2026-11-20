# Trapped Traveller and weapon equipment

During the fight, gold diamonds identify captors and the minimap follows the closest living captor. After the sixth falls, the marker returns to the traveller so you can free them. Stay with the traveller to the market bridge, defeat the three ambushers on its approach and arrive together for the weapon offer. Expand **Quest details** to reread the briefing or abandon the event.

[Trapped Traveller in combat](screenshots/johor-quest-tracker.png) · [Current escort rules and evidence](regional-quests.md)


Ticket #3, part of [Johor encounter and loot spec #1](https://github.com/miooor/aseansurvivor/issues/1). Built from integration baseline `26ba1d0`.

Johor's abandoned market now contains a deliberate rescue event at (2400, 1300), separate from its cache. Defeat six owned captors, including an Armoured Palm Stalker, then interact within 120 units. The marker is discovered with its landmark. Leaving does not fail it; abandoning ends it permanently for that run without a reward. Event actors are collision-projected, remain owned when offscreen, and are removed on resolution or run transitions. Active events block raid entry and preserve the rift's remaining lifetime.

Armoured elites have triple scaled health and 1.25× contact damage. They take 30% less damage outside the 1.5-second vulnerability following their charge. Static ground accents, a charge line and modifier/window labels remain readable without animation.

Rescue offers three distinct weapons from four definitions: Split Ember, Quarry Hammer, River Needle and Hunter's Edge. An offer is sampled once and consumed by choosing or skipping. Comparisons include the existing item's name and effect. The Equipment button opens a read-only weapon/charm/relic panel; Escape closes inspection. Both panels pause simulation. Pending upgrades take priority, rewards wait, and closing never changes an existing pause. Equipment and event state are not written to progression storage.

## Repeatable verification

Start the repository's Docker Compose server, open `/tests/johor-rescue.html`, select **Run rescue checks**, keep the browser active, then download the JSON report. Preview buttons reproduce active event, elite warning, reward and equipped states. The fixture stages actual runtime casts/projectiles and uses actual HTML controls; it does not expose a second test API. It uses a separate localhost port during development; do not use a live progression origin for destructive end-of-run fixture checks.

Historical pre-escort results from Safari 26.3.1 on macOS, 2026-11-14:

- Rescue acceptance: **141/141 PASS**, `evidence/johor-rescue/rescue.json` (13:47:27Z).
- Existing gameplay: **574/574 PASS**, `evidence/johor-rescue/gameplay.json` (13:49:40Z), no captured errors.
- Existing regions: **117/117 PASS**, `evidence/johor-rescue/regions.json` (13:50:50Z).
- Container lint, typecheck and build passed. Existing Vite large-chunk warning remains; command output is `evidence/johor-rescue/checks.txt`.
- Four native Safari screenshots are in the same evidence directory. Visual review moved the objective away from a stall's illustrated canopy even though its first position passed collision checks.

The incremental browser failures were: missing nearby rescue prompt; Hammer speed; slowed-hit bonus; elite damage bonus; armour reduction; fourth-basic spread; missing minimap marker; immediate post-frame marker assertion; inspection control refresh; duplicate enemy death; passive/equipment speed composition; menu control cleanup. Each gameplay failure was corrected before proceeding. The marker assertion was synchronized to the renderer's next frame rather than changing its expected outcome.

Real-phone performance, dense-fight profiling, full-run balance and the three combined charm/relic build examples remain for the combined verification ticket. No final balance equivalence is claimed.

## Interfaces for ward and hunt

`src/content/encounters.js` is the authored marker registry (`name`, `landmark`, `x`, `y`, `slot`, `description`). `installEncounters(api, equipment)` returns `register(id, behavior)`, `active()`, `spawn(event, type, x, y, elite)`, `complete(event)` and `abandon(event)`. Register behavior before a run starts. Behavior supplies `start(event)`, `progress(event)`, optional `update(event, dt)`, `canInteract(event)`, `interact(event)`, and `interactLabel`. `complete` grants once only for an active event; `abandon` never grants. `spawn` tags ownership and applies elite scaling once. Tag encounter hazards/props/effects with `encounter: event.id`; shared cleanup filters owned enemies/projectiles/zones/effects. Rendering reads `G.encounters`; ward HP and sequential track presentation should extend that state deliberately.

`src/content/equipment.js` is the item registry. Item data includes slot/name/description and optional `damage` (number or `(g, enemy, hitOptions) => fraction`), `speed`, and `health`. Equipment damage contributions sum before existing outgoing multipliers; stat recalculation derives passive/base values rather than mutating the previous result. `installEquipment` returns `grant(eventId, slot)`, `recalculate()`, `sync()`, and `close()`. New modules can be installed with these module instances inside `createRuntime`; they are intentionally not a public testing API.

Item counters use `G.itemState[itemId]`; replacing one slot deletes only the removed item's state. Put once-per-run consumption separately on the run so re-equipping cannot restore it. `HOOKS.cast(slot, rank)` runs only after a successful hero cast, including basic casts. It does not run for item projectiles. Projectile `origin` and `dot` metadata reach `hit`; direct item hits must pass `{origin:'item'}`. Lan's signature explicitly excludes that origin. Kill hooks receive `(enemy, options)` with `options.damage === true` for confirmed damage deaths, and carry origin metadata. Direct despawn and encounter cleanup do not invoke kill hooks; duplicate deaths are ignored.

Existing `HOOKS.hurt` runs after invulnerability rejection and before HP subtraction; hero mitigation is already installed first. Charm/relic work must add and test a post-mitigation damage/lethal seam where needed rather than infer damage from an attempted hit. No unused lethal mechanic was introduced here. Existing `p.slip` is an enemy oil movement-response flag; the charm ticket must define/test its slowed-player contract rather than treating the Hammer penalty as an enemy debuff.
