# Final two-axis review

2026-11-15 UTC. Two fresh read-only reviewers independently inspected `git diff 3de2f5f...10b3cf1` and its 32-commit log, following the invoked implement-spec/code-review workflow. The fixed point is the preserved environment/Astrocade baseline. The originating specification is [issue #8](https://github.com/miooor/aseansurvivor/issues/8), with verification corrections #14/#15. Final export, hosted verification and cleanup were explicitly parent-owned work after this review.

## Standards

One documented-standard breach and one heuristic finding:

- **P3 factual documentation:** architecture attributed elite attack simulation to nonexistent `event-combat.js`; the implementation belongs to `src/game/runtime.js`. This violated the requirement for verified facts in durable documentation.
- **P3 maintenance judgement:** runtime projectile emission and Phaser warning rendering duplicated fan/burst degree arrays, allowing future warning geometry to drift. The proposed correction was a small shared content map, preserving simulation/rendering ownership.

Fresh implementation `b5b31fd` corrects the filename and exports `ELITE_ATTACK_ANGLES` from the existing encounter content file for both consumers. The Standards reviewer inspected that delta and confirmed both findings resolved, with no new standards issue. This was a source recheck, not independent execution of the implementer's browser/build evidence.

## Spec

One P2 behavioral finding:

- Fear steering ran after elite rush direction selection and could overwrite the captured direction. Exact requirement: “Lock elite charge aim at warning start; show a line matching its eventual direction.”

Fresh implementation `b5b31fd` still decrements the fear timer, while applying fear steering only outside a locked elite rush. Browser checks were written before that source edit. Both elite kinds fail direction checks under fear during warning, active rush and final tick: [red 118/124](../review-fixes/fear-red.json). After the correction, [green 124/124](../review-fixes/fear-green.json) includes the original 92 assertions unchanged, fear expiry and ordinary enemy behavior. The Spec reviewer inspected source and retained reports, confirmed resolution and found no new issue in the bounded correction. No other equipment/signature/audio/lifecycle or hero-draft implementation omissions were identified.

Initial findings: Standards 2 (worst P3); Spec 1 (worst P2). Unresolved after separate rechecks: Standards 0; Spec 0. This does not turn the retained low frame-rate measurements into a performance PASS. [Correction evidence and commands](../review-fixes/README.md).
