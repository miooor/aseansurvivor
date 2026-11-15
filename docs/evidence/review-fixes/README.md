# Final combat review corrections

Scope: the three final review findings against baseline `3de2f5f`, implemented from integration `10b3cf16df48c72ee7826d347f1175ff7d4846ea`. Canonical contract: [spec #8](https://github.com/miooor/aseansurvivor/issues/8), especially locked elite charge aim and unchanged stun/slow behavior.

The runtime's existing `lockedCharge` flag already covers the final movement tick. Fear previously replaced its stored direction later in the same update. The correction keeps fear's countdown and guards only that steering replacement. Ordinary enemy fear, warning duration, charge duration, stun, slow, collision and damage values remain unchanged. The existing encounter content file now exports the degree offsets consumed by both projectile emission and scene warning rays; no simulation module was extracted. The architecture document now correctly names `runtime.js` as the elite AI implementation.

Failure scope was recorded in `tests/event-combat.js` before production edits. The unchanged browser seam stages the actual runtime through `__asean`, starts events with their HTML controls and observes actual enemy movement. The added cases stage fear during warning, active rush and final tick for Armoured and Thornbound enemies, then verify timer decay/expiry and ordinary fear steering/recovery. The original 92 assertions remain unchanged; the extension adds 20 behavior assertions and 12 event-control preconditions.

- [`fear-red.json`](fear-red.json): Safari 2026-11-15T17:41:39.372Z, 118/124 PASS. All six elite-kind/phase direction checks failed before production edits; all other assertions passed.
- [`fear-green.json`](fear-green.json): Safari 124/124 PASS after a full harness reload. Existing literal five-ray fan and eight-direction burst expectations pass.
- [`shared-fan-warning.png`](shared-fan-warning.png), [`shared-burst-warning.png`](shared-burst-warning.png): native Safari previews show the five fan rays and eight burst rays after sharing the map. The burst image is captured at initial enrage, including its transient ENRAGED effect; it is geometry evidence, not a new label readability claim.
- [`lint.txt`](lint.txt), [`typecheck.txt`](typecheck.txt), [`build.txt`](build.txt): Node 24 Alpine container checks pass. Existing Phaser chunk-size and Vite callback-timing diagnostics remain.
- [`source-verification.json`](source-verification.json): SHA-256 hashes of the verified implementation and fixture, plus integration provenance.

Repeat using the repository Docker workflow: open `/tests/event-combat.html`, select **Run combat checks**, keep the tab active, require **PASS · 124/124**, then select **Download report**. Reload the entire harness after source changes so its captured runtime is current. This lane used its isolated container `asean-gameplay-review-fixes`, localhost port 5187 and the existing dependency volume; no host package was installed. Its temporary Safari tab was closed after downloading the reports and saving screenshots.

Broader regressions, export and hosted verification remain with the parent integration task. This correction does not rebalance combat, rerun dense performance samples or make a real-device claim. No remote API write or push was performed.
