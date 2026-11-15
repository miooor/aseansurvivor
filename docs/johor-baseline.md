# Johor integration baseline

Ticket #2, part of https://github.com/miooor/aseansurvivor/issues/1.

Preserved baseline: `a646d354c30fb412b212f3296b83ea9811782778` contains the complete Phaser remake, six worlds, 21 asset files, container configuration and browser harnesses. The isolated `codex/johor-baseline` worktree started at that commit. Integration continuity update `f06792f` was merged before handoff.

Run `docker compose up -d`, then the documented lint, typecheck and build commands. Open `/tests/ui-smoke.html`, select **Run checks**, keep the tab active and download the report. Open `/tests/stage-worlds.html`, select **Run stage checks**, expand **Verification report** and download it. JSON evidence is retained under `test-results/johor-baseline/` and committed copies accompany this document.

2026-11-14 baseline verification used Safari 26.3.1 on macOS. The first gameplay run exposed a pre-existing 320px lobby overflow (549 passing checks before that failure). The original assertion is retained. No combat, progression or save rules changed.

The failure diagnostics showed the campaign heading extending to x=324.5 at a 320px viewport. A 48px heading size only at widths up to 360px keeps the word inside its content column. Browser failure reports now include overflowing element bounds without changing assertions. The regional harness gained the same JSON download capability as the gameplay harness.

Final results: **574/574 gameplay PASS** at 2026-11-14T13:30:58.915Z; **117/117 regional PASS** at 2026-11-14T13:31:45.578Z. Container lint, strict typecheck and production build passed after the CSS change. Existing Vite large-chunk warning remains. Committed reports and command output: [evidence/johor-baseline/](evidence/johor-baseline/). The final browser runs used the isolated worktree container at localhost:5174, sharing only the existing dependency volume.

No real-phone performance or long-session balance verification was performed. agent_docs/ and .qoder/repowiki/ are absent; no template documents were invented.
