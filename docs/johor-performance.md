# Johor crowded-scene profile

Historical slice evidence. The follow-up [combat contract](event-combat.md) supersedes elite patterns and rescue/ward compositions; [skill equipment](skill-equipment.md) expands the catalogue from twelve to eighteen items. [Combined verification and play/profile evidence](gameplay-upgrade.md) records the integrated follow-up. Earlier spec #1/PR #7 remains a separate workflow.


The repeatable `tests/johor-profile.html` fixture starts a Johor run at a 1280×720 game viewport, disables player damage and ordinary wave spawning, and places 100 mixed Pocong and Palm Stalker enemies around the stationary hero. Enemies move and use their normal AI; no skills are cast. It measures browser `requestAnimationFrame` intervals for 15 seconds. This is a synthetic desktop stress observation, not a substitute for real-device testing or a full combat benchmark.

On 2026-11-15, an Apple M1 Mac with 8 GB RAM and macOS 26.3.1 using the in-app Chromium browser reported 899–900 frames over 15 seconds. The active-enemy run measured 59.93 mean FPS, 16.7 ms median, 16.8 ms p95 and zero intervals above 50 ms. The machine-readable result is `docs/evidence/johor-combined/desktop-profile.json`. Background load, GPU/browser scheduling, skill effects and mobile hardware can materially change results.
