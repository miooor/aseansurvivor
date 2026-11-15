# Lantern Ward and charms

Historical slice evidence. The follow-up [combat contract](event-combat.md) supersedes elite patterns and rescue/ward compositions; [skill equipment](skill-equipment.md) expands the catalogue from twelve to eighteen items. [Combined verification and play/profile evidence](gameplay-upgrade.md) records the integrated follow-up. Earlier spec #1/PR #7 remains a separate workflow.


Ticket #4 implements the ward/charm contracts in [spec #1](https://github.com/miooor/aseansurvivor/issues/1).

Acceptance uses `/tests/johor-ward.html` in a real browser against the development-only runtime seam already agreed in the parent spec. The fixture stages positions/resources but activates encounters and equips choices through actual HTML controls. Incremental failures precede each implementation slice.

Failure scope: implicit activation; ambient deaths advancing waves; overlapping waves; wrong ward target/contact cadence; blocked spawns; destruction granting rewards; duplicate choices; pause or raid advancing timers; regeneration starting after blocked hits; maximum-health changes healing or compounding; equipment penalties qualifying as enemy hindrance; displacement retaining positional buffs; stale run/save state; narrow-width overflow or inaccessible controls.

Reed Guard interpretation: the game has an enemy oil effect (`p.slip`) that reduces acceleration and braking responsiveness, not a generic player slow timer. Reed Guard applies its 20% incoming reduction while inside that existing enemy hindrance. Its description names enemy oil explicitly. Quarry Hammer's movement penalty does not qualify. No movement physics or unreachable synthetic slow flag is introduced.

Lantern Ward is authored at (-1700, -1350), separate from the rice-fields cache. It starts at 300 HP, spawning four, six and eight enemies sequentially. Owned enemies navigate toward the installation; each contact deals 10 damage at most once per second. Ambient enemies still target the hero. The final wave includes one Armoured Palm Stalker. Destruction and explicit abandonment remove owned actors without reward. Completion offers three distinct charms through the shared atomic equipment UI.

Traveller’s Knot contributes +12% movement speed. Lantern Heart adds 40 maximum HP without free healing and restores 2 HP per simulation second after five seconds without applied damage. Reed Guard multiplies incoming damage by 0.8 under enemy oil hindrance. Stillwater Beads adds 20% outgoing damage after two seconds within 30 units, resetting on departure, leap landing and raid transitions. Its damage calculation validates position immediately, including before the next timer update. Replacing one item removes its counters without clearing other equipped items.

The installation uses a static lantern shape, health bar and HP label. Elite charge lines point toward the actual ward target. The shared encounter panel is bounded and scrollable, below the signature and beside the minimap/skill controls at narrow widths, so event text and controls do not cover those HUD elements.

Start the Docker server and open `/tests/johor-ward.html`, select **Run ward checks**, keep the browser active, then download its JSON report. Preview buttons reproduce active, final-elite, reward, equipped and 390px states. Use an isolated origin because defeat/retry checks intentionally exercise normal run-end progression. Development verification uses port 5176. Real-phone performance and balance equivalence require separate evidence.


## Verification evidence

Safari 26.3.1 on macOS, 2026-11-14: **208/208 ward acceptance checks PASS** at 14:20:46Z (`evidence/johor-ward/ward.json`). Checks cover exact contacts/waves, reachable owned actors, destruction, boss/raid/lifecycle arbitration, all five heroes and four charms, actual-damage healing resets, caps/replacement, positional/leap/raid resets, weapon combinations, and 320/390px keyboard/touch-sized controls. Rendered bounds checks catch overlaps with signature/minimap/skills and between ward/elite labels.

Five native screenshots (`active.png`, `elite.png`, `reward.png`, `equipped.png`, `mobile.png`) show the static installation, correctly aimed elite warning, reward and inspection panels. Container lint, fixture lint, strict typecheck and production build pass; `checks.txt` preserves command output. The existing Vite chunk-size warning remains.

The red/green sequence caught missing event registration, ward contact damage, each missing charm, missing Reed Guard feedback, missing ward HP label, desktop signature overlap and narrow-width map/skills overlap. Visual review additionally caught an elite/ward label collision. Fixture corrections retained exact outcomes while allowing floating-point tolerance for 2 HP and advancing real hit-stop before checking projectiles; UI enabled-state assertions wait for the normal next frame.

Unchanged regressions on this branch also pass: gameplay **574/574** (14:27:01Z, no captured errors), regions **117/117** (14:27:44Z), and rescue/weapons **141/141**. Their downloaded reports are `gameplay.json`, `regions.json` and `rescue.json` in the evidence directory. Combined hunt/ward verification, build playtesting and hardware profiling remain ticket #6; no real-phone performance or final balance claim is made.
