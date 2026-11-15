# Terrain, contact shadow and weather

The 2026-11-15 environment upgrade replaces flat painted rectangles with reusable illustrated terrain. Rural worlds use a new opaque meadow tile; roads follow smooth curves covered by transparent grass-fringed dirt patches. Paddy groups use staggered rice terraces. Water uses a scrolling texture clipped by an irregular rounded shoreline, with layered muddy banks and timber bridge decking. Urban ground uses a cobblestone texture and tinted road patches. The minimap shows roads and matching shoreline outlines.

The authored world coordinates, rectangular navigation/collision blockers, bridge clearances and reward locations remain unchanged. The new bank outline dresses those blockers; it does not introduce polygon collision. This keeps the existing reachable routes and enemy navigation while improving their appearance. Terrain images, filter cameras and their mask textures, and mask source objects are released when changing worlds.

WebGL uses Phaser 4's `enableFilters()` and `filters.internal.addMask(graphics, false, surface.filterCamera)`. Each bank is a visible Graphics object kept outside the scene display list, so the filter can capture its alpha without drawing a white polygon over the world. The explicit internal filter camera follows the static water object's bounds; its captured bank can therefore be reused while the main camera moves or zooms and the water texture scrolls. Canvas retains its supported GeometryMask path. The former unconditional `setMask(createGeometryMask())` call was ignored by Phaser 4.2.1 in WebGL and emitted an unsupported-method warning, leaving rectangular water. The original environment object-count assertion did not establish clipping; the focused water harness checks rendered pixels.

`src/scenes/OpenWorld.ts` owns terrain placement and cleanup. `src/scenes/SurvivalScene.ts` registers six frames from `assets/world-terrain.png`, loads `assets/world-ground.png`, and generates a small radial-gradient contact shadow in memory. The shadow is a translucent 38×12 ellipse aligned to the feet, shrinking and fading during Nok's leap. It replaces the previous large black circle without changing hero hitboxes, animation origins or skill markers.

## Weather

`src/scenes/Weather.ts` draws a cosmetic outdoor cycle from the existing simulation clock. There is no additional animation loop, saved weather state, combat modifier or weather sound. Each new run resets its phase.

| Cycle phase | Atmosphere |
| --- | --- |
| 0–40 seconds | Clear |
| 40–70 seconds | Mist building and clearing |
| 70–140 seconds | Rain rising and falling in intensity |
| 140–180 seconds | Clearing mist |

Region offsets are Johor +90, Melaka +20, Perak +50, Kuala Lumpur +110, Pulau Pinang +150 and Kedah +0 seconds. Johor therefore starts in rain. Pause, upgrade choices and equipment overlays freeze the simulation and weather together. The lobby, raids and finished runs hide outdoor weather. Rain is capped at 84 screen-space streaks; reduced-motion preferences retain a static atmospheric tint and mist while removing moving rain and water scrolling. There is no lightning flash.

## Artwork and export

[Exact generation and alpha-correction prompts](../assets/ENVIRONMENT_PROMPTS.md) accompany the source [terrain atlas](../assets/world-terrain.png) and [meadow tile](../assets/world-ground.png). Road and paddy cells have transparent corners; the meadow is fully opaque. The old source artwork remains available.

The new terrain WebPs total 706,638 bytes and replace the 212,074-byte active grass WebP. The complete Astrocade artwork set is now 18 files totaling 11,420,462 bytes, an increase of 494,564 bytes over the previous optimized draft. It is still 74.6% smaller than the corresponding 44,931,797-byte active PNG set. Dimensions and alpha are retained exactly; the new terrain and meadow visible RGB RMS errors are 3.418 and 4.887/255. [Per-asset validation](../astrocade/asset-sizes.json), [Astrocade packaging and mobile limits](astrocade.md).

## Repeatable verification

Start Docker Compose and run lint, typecheck, the production build, then `npm run build:astrocade` inside the game container. Open each harness at `http://localhost:5173`, run its checks with the tab active, and download the JSON report:

- `/tests/environment.html`: terrain and bridge layering across six worlds, all five contact shadows, phase changes, pause/overlay freeze, lobby/raid suppression, reduced motion and terrain cleanup. It also supplies paused village, river, paddy, city and shadow previews.
- `/tests/water-mask.html`: actual WebGL warning observation and rendered water/ground pixel comparisons at known outside-bank, rounded-corner and river-body world coordinates, including camera movement and two zoom settings. Its river-corner preview reproduces the clipping view.
- `/tests/ui-smoke.html`: existing gameplay, skills, overlays, raids and responsive acceptance.
- `/tests/stage-worlds.html`: existing regional navigation, caches and enemies.
- `/tests/astrocade.html`: exported opaque-origin sandbox, controls, saves and host lifecycle.
- `/tests/astrocade-mobile.html`: portrait layout, synthetic simultaneous touch movement/casting, pause/equipment, WebP decoding and an ordinary-play frame sample.

The current environment checks pass **62/62**, gameplay **574/574**, regional checks **117/117**, export sandbox **62/62**, and mobile **18/18**. [Environment report](evidence/environment/terrain-weather.json), [gameplay report](evidence/environment/gameplay.json), [regions report](evidence/environment/regions.json), [export report](evidence/environment/sandbox.json), [mobile report](evidence/environment/mobile-390.json). The saved [village rain](evidence/environment/village-rain.jpg), [river crossing](evidence/environment/river-bridge.jpg) and [rice terrace](evidence/environment/rice-terraces.jpg) screenshots are reproducible through the environment preview selector. The existing private Astrocade draft was updated to revision `01M7FSHCVJRJ8ABEZ9GM066YXM`, read-back verified, and exercised at an observed 390×844 hosted viewport; see [hosted measurements](evidence/environment/hosted.json) and [screenshot](evidence/environment/hosted-mobile-rain.jpg).

The subsequent WebGL clipping correction passes **180/180** focused browser checks with no captured warnings or errors: all 14 water rectangles, two zooms, actual opaque corner/outside/body pixels, raid/menu/retry transitions, and three complete six-world cycles with stable TextureManager counts of **21, 21, 21**. [Report and method](evidence/water-mask/README.md), [pixel results](evidence/water-mask/green.json), [before](evidence/water-mask/before.jpg) and [after](evidence/water-mask/after.jpg). These pixel checks establish clipping that the older environment object-count checks could not prove; combined performance and private-draft validation are tracked separately under ticket #12.

Physical phone GPU, Safari/Android behavior, crowded long sessions and thermal/memory limits require device testing. The active image dimensions represent approximately 108 MiB of decoded RGBA pixels before browser/GPU overhead; WebP reduces transfer size rather than decoded texture memory.
