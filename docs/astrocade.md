# Astrocade draft

ASEAN Survivor is saved on Astrocade as a **private unpublished draft**, game `01M7FMJGJ3PMC9H145JJCCNEKR`. [Play the terrain-and-weather draft revision](https://www.astrocade.com/games/asean-survivor/01M7FMJGJ3PMC9H145JJCCNEKR/v/01M7FSHCVJRJ8ABEZ9GM066YXM) or [open its editor](https://www.astrocade.com/edit/01M7FMJGJ3PMC9H145JJCCNEKR) while signed into the owner account. The link is owner-only. No publication, thumbnail generation, leaderboard or Git push was performed.

The port packages the existing simulation and Phaser renderer from checkout `22c8d7faa2c546dffc7c8b4fc77923b597dbeaff`: five heroes, six regional worlds, signatures, upgrades, boss fights, portal raids and the current Johor encounter/equipment integration. Combat modules are unchanged. Earlier paused feature/review work is separate from this port.

## Packaging

```sh
docker compose up -d
docker compose exec -T game npm run lint
docker compose exec -T game npm run typecheck
docker compose exec -T game npm run build
docker compose exec -T game npm run build:astrocade
```

Run the Astrocade export after the normal build, which clears `dist/`. The export contains `index.html`, `game.js`, `README.md`, `game_config.json` and `asset_map.json` in `dist/astrocade/`. Save all five files to the existing game using the Astrocade MCP pull/edit/save flow. `game.js` is over 100 KB: use `begin_upload` with its exact byte count, PUT its bytes, then pass its upload ID under `file_upload_ids`. Pull immediately before saving and use its sync token; reconcile remote edits first. Never create another game just to update this draft.

`scripts/build-astrocade.mjs` uses the locked Vite dependency to bundle the current game. Its build-only transforms replace scene image URLs with Astrocade CDN URLs and route runtime/audio storage through `src/astrocade/storage.ts`. Assertions reject missing assets and exports above the 6 MB code limit. `src/main.ts`, simulation modules and the normal browser build keep their existing behavior. `src/astrocade/main.ts` supplies `window.run(mode)`, cleans up the previous Phaser game on host reload, and shows a roster preview with gameplay disabled in edit mode. No configurable parameters are exposed in this draft.

`astrocade/ui.css` adapts the menus and HUD to Astrocade's fixed 720×1280 portrait frame, including 112-pixel button targets and lower-right skill controls. These exceed the platform's 96-pixel minimum to keep targets useful when Astrocade scales the game onto a short phone screen. External Google Fonts links are removed; system fonts are used. The mobile update gives the HUD explicit stacking above the battlefield, keeps modal overlays above controls, and enlarges hero, health, signature, minimap and skill labels for the scaled phone display. The saved JavaScript is 1,501,107 bytes and the HTML is 34,635 bytes.

## Smaller artwork

The CDN asset map now references 18 WebP files totaling **11,420,462 bytes**, down from the corresponding **44,931,797 bytes** of active PNG artwork: **74.6% less artwork data** (42.9 MiB → 10.9 MiB). Original source PNGs remain unchanged. Every sprite sheet keeps its dimensions and frame layout; every alpha channel is pixel-identical. RGB colour compression uses quality 85, with a measured maximum visible RGB RMS error of 4.887/255 across the set. The terrain update replaces the active grass texture and adds 494,564 bytes over the preceding optimized draft. [Per-asset sizes and validation](../astrocade/asset-sizes.json).

```sh
docker build -f astrocade/assets.Dockerfile -t asean-astrocade-assets .
docker run --rm -v "$PWD:/app" asean-astrocade-assets
```

The pinned Pillow tool runs entirely in Docker. `scripts/encode-astrocade-assets.py` writes ignored generated WebPs to `astrocade/assets/` and validates decoding, dimensions, exact alpha, bounded visible colour error and reduction for every file. Upload regenerated files through Astrocade's asset upload flow, replace the corresponding URLs in `astrocade/asset_map.json`, then run the export. A map update alone does not alter a hosted draft until its five files are saved. No lazy-loading or texture resizing was added. The normal browser build still uses the original PNGs.

## Saves

Astrocade's opaque-origin sandbox denies browser storage. The adapter loads a compact per-player state before play and saves the existing progression and audio JSON values through `lib.getUserGameState` / `lib.saveUserGameState`. Writes settle for 350 ms and run in order so an older write cannot finish after a newer one. Pending values survive a host reload when a write fails. A failed or incompatible initial load displays a warning and disables writes for that session, preserving the remote save. A later settings/progression change retries a failed write; a host reload retries a failed load. Active runs and equipment remain temporary.

Browser-origin `aseanSurvivor.v1` and `aseanSurvivor.audio` saves are separate and are not uploaded or migrated. The Astrocade save uses `{version:1, values:{...}}` with just those two keys. Prototype access still unlocks every hero and stage. The underlying rules, including granting coins at run completion, remain the same.

## Verification

On 2026-11-15 the final export passed **62/62 browser E2E checks** inside a real `sandbox="allow-scripts allow-pointer-lock"` iframe at 720×1280. The check covers all hero and stage starts, skills, keyboard/touch movement, pause, portrait target sizes, host reload cleanup, edit-mode restrictions, audio/progression persistence, ordering while a write is pending, recovery and prevention of writes after a failed load. The platform bridge is simulated in this local check; it does not modify Astrocade player data. [Machine-readable report](evidence/astrocade/sandbox-report.json).

Repeat by opening `http://localhost:5173/tests/astrocade.html`, choosing **Run checks**, keeping the tab active until `PASS`, and downloading the JSON report. The harness imports the exact export as raw text with a unique URL so Vite's ignored-`dist` transform cache cannot return an earlier bundle.

Signed-in hosted verification also loaded the draft, entered Johor, observed animated combat and advancing time, and paused successfully. A later hosted page loaded the saved coin total and auto-cast preference. [Combat screenshot](evidence/astrocade/hosted-combat.jpg). Astrocade's surrounding site logged React tooltip warnings; the sandbox report captured no game runtime errors. [Read-back hashes](evidence/astrocade/readback.json) confirm four remote source files match the final export byte for byte; `asset_map.json` has identical JSON values with platform-normalized formatting. Astrocade's game listing confirms private visibility and unpublished edits.

Container lint, strict typecheck, normal production build and Astrocade build passed. The normal production build retains its existing large-Phaser-chunk warning and reported a Vite plugin callback timing diagnostic during the earlier mobile update. The original packaging task did not rerun the full gameplay suite; the subsequent environment update below passes it.

## Terrain and weather verification, 2026-11-15

The latest private revision adds illustrated roads, meadow ground, rice terraces, irregular textured riverbanks, timber crossings, a soft hero contact shadow, and cosmetic clear/mist/rain phases. [Environment behavior, source assets and repeat instructions](environment.md). It passes environment **62/62**, existing gameplay **574/574**, regions **117/117**, export sandbox **62/62**, and mobile **18/18**. Reports are under [environment evidence](evidence/environment/terrain-weather.json).

The updated WebP export's configured 390×844 emulation uses the fixed 720×1280 isolated sandbox, cache disabled, 10 Mbps / 1 Mbps, 80 ms latency and 4× CPU slowdown. The 15-second ordinary-play sample with Johor rain averages **59.59 FPS**, median **16.7 ms**, p95 **17.6 ms**, with one interval above 50 ms. Artwork readiness takes **11,036 ms**, excluding host-page and game-script transfer, as in the earlier comparison. [Mobile report](evidence/environment/mobile-390.json). This is a short desktop-emulation observation, not a stable device-performance guarantee.

The signed-in hosted revision starts Johor, shows rain and the new terrain, advances the clock, and pauses/resumes. The actual outer viewport was measured at **390×844 CSS pixels**, with an existing 1.4 browser zoom compensated in the temporary metrics and screenshot clip. The game frame remains 720×1280, with every measured skill/pause/equipment control inside it. No captured console errors were returned. [Hosted measurements](evidence/environment/hosted.json), [complete mobile screenshot](evidence/environment/hosted-mobile-rain.jpg). The game is left paused and temporary metrics are cleared. [Remote read-back](evidence/environment/readback.json) matches all five export files (JSON values for config/maps, exact bytes otherwise); the listing still confirms private visibility and unpublished edits.

## Earlier mobile comparison, 2026-11-15

The following comparison and linked artifacts describe preceding revision `01M7FQ4RZ4EKM66QK86MCY71SY` with 17 assets, before the terrain-and-weather update.

The optimized export passed **62/62 sandbox regressions** and **18/18 mobile checks**. The mobile harness covers simultaneous synthetic touch-pointer movement and casting, pause/resume, equipment inspection, control bounds, HUD stacking, larger compact-phone targets, lack of unwanted scrolling and decoding all 17 WebP assets. The initial layering check required explicit HUD stacking; the updated CSS supplies it. Apparent hosted HUD clipping was subsequently traced to automation scrolling the transformed iframe's parent container; it was not evidence of the game losing its HUD. Hosted screenshots reset that container to its normal scroll position. An immediate equipment click after resume was corrected in the harness to wait for the existing next-frame button synchronization. Assertions remain intact. [Updated regression report](evidence/astrocade-mobile/sandbox-report.json), [mobile report](evidence/astrocade-mobile/webp-mobile-390.json).

The matched 390×844 browser-emulation comparison used the platform's 720×1280 sandbox, cache disabled, 10 Mbps download / 1 Mbps upload, 80 ms latency and a 4× CPU slowdown. The outer viewport was explicitly verified through `innerWidth`/`innerHeight` after applying per-tab CDP device metrics. Network and CPU throttles were applied to the **sandbox iframe's CDP target**; applying them only to the parent tab did not throttle its isolated iframe. Startup measures `run('play')` to artwork-ready and excludes Astrocade host-page loading and game script transfer. The PNG baseline took **32,401 ms**; final WebP samples took **11,316 ms** and **10,148 ms** (65.1–68.7% less time). The baseline intentionally fails the newly added HUD-layering, larger-target and WebP assertions; its timing/profile remain useful pre-change evidence.

Frame timing varied materially. The first final-target sample averaged **16.64 FPS**, with **133.3 ms p95** and 97 intervals above 50 ms. A repeat after closing the additional regression tab averaged **59.99 FPS**, with **17.4 ms p95** and zero intervals above 50 ms, over 15 seconds of ordinary play with attacks and spell effects. The PNG baseline averaged 59.8 FPS. The slow sample's cause is **unconfirmed**; closing the other tab is a procedural difference, not proof of causation. These observations support faster loading and functioning controls, but not a stable phone frame-rate guarantee. [Slow sample](evidence/astrocade-mobile/webp-mobile-slow-sample.json), [repeat profile](evidence/astrocade-mobile/webp-mobile-390.json), [PNG baseline](evidence/astrocade-mobile/png-baseline.json). Throttled Mac emulation does not reproduce a phone GPU, memory pressure, Safari/Android engine differences or thermal limits, and this is not a heavy-crowd benchmark.

Hosted layout measurements on the final revision kept pause, skill and equipment controls within the frame at **360×800**, **375×667** and **430×932**. Their smallest displayed target dimensions were **56**, **49.26** and **66.89 screen CSS pixels**, respectively. Browser-hosted start, pause/resume and upgrade selection were exercised; synthetic touch-pointer movement/casting is covered by the sandbox harness. The in-app browser did not support trusted CDP touch injection, so these checks are not hands-on phone testing. [Hosted bounds](evidence/astrocade-mobile/hosted-layouts.json), [390×844 screenshot](evidence/astrocade-mobile/hosted-390.jpg), [375×667 screenshot](evidence/astrocade-mobile/hosted-375.jpg). Temporary browser viewport, touch and media overrides were cleared after verification, and the final draft was left paused.

Repeat by opening `/tests/astrocade-mobile.html`, selecting **Load export**, then **Run mobile checks**. For a controlled cold-load comparison, configure cache/network/CPU on the newly created sandbox iframe target between those two actions. Keep the tab active, wait for results, then download JSON. Without throttling this still checks the layout and controls and records a desktop frame profile.

That revision's source image dimensions imply about **102 MiB of decoded RGBA texture pixels**, before browser/GPU overhead; the current terrain set is about **108 MiB**. WebP reduces download size, not that memory footprint. Physical iPhone/Android testing, sustained crowded combat and thermal/memory behavior remain unverified. [Earlier optimized remote file read-back](evidence/astrocade-mobile/readback.json) confirms those hosted files match that export, allowing asset-map JSON formatting normalization.
