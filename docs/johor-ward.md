# Lantern Ward and charms

Ticket #4 implements the ward/charm contracts in [spec #1](https://github.com/miooor/aseansurvivor/issues/1).

Acceptance uses `/tests/johor-ward.html` in a real browser against the development-only runtime seam already agreed in the parent spec. The fixture stages positions/resources but activates encounters and equips choices through actual HTML controls. Incremental failures precede each implementation slice.

Failure scope: implicit activation; ambient deaths advancing waves; overlapping waves; wrong ward target/contact cadence; blocked spawns; destruction granting rewards; duplicate choices; pause or raid advancing timers; regeneration starting after blocked hits; maximum-health changes healing or compounding; equipment penalties qualifying as enemy hindrance; displacement retaining positional buffs; stale run/save state; narrow-width overflow or inaccessible controls.

Reed Guard interpretation: the game has an enemy oil effect (`p.slip`) that reduces acceleration and braking responsiveness, not a generic player slow timer. Reed Guard applies its 20% incoming reduction while inside that existing enemy hindrance. Its description names enemy oil explicitly. Quarry Hammer's movement penalty does not qualify. No movement physics or unreachable synthetic slow flag is introduced.

Verification and screenshots will be recorded here after the browser acceptance completes. Real-phone performance and balance equivalence require separate evidence.
