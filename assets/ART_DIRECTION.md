# Generated art provenance

These original assets were generated with the built-in imagegen tool on 2026-11-14 for this repository. They are local project assets, not hotlinked stock images. The character sheet is illustrative concept art with one frame per actor; it is not a finished animation atlas.

## Files and atlas mapping

- `kampung-night.png`: campaign lobby background.
- `kampung-arena.png`: legacy first-arena background, no longer loaded.
- `survivors-atlas.png`: a four-by-four grid. Frames 0–4 are Ustaz, Rempit, Nok, Cô Lan, and Sari. Frames 5–9 are Toyol, Pocong, Orang Minyak, Pontianak, and Hantu Raya. Frames 10–15 are palm, banana plant, lantern, rock, coin, and spirit crystal. The native scene derives cell boundaries from the actual image dimensions. Penanggal/body/shade currently reuse related enemy artwork.

## Generation prompts

### Lobby

Use case: stylized-concept. Create original premium AAA dark-fantasy game environment key art for the main menu of ASEAN Survivor, a Southeast Asian folklore survival game. Landscape 1536x1024. A cinematic Malaysian kampung at blue hour/night, rich painterly realism, ancient huge banyan trees and arching roots, oil palms, wooden Malay houses on stilts with warm amber windows, wet path leading from foreground toward a distant spectral turquoise portal deep in the jungle on the center-right, dramatic layers of mist, drifting fireflies, warm lanterns. Very detailed tactile foliage and architectural silhouettes, subtle film grain, sophisticated chiaroscuro with deep ink navy shadows, jade mist and restrained golden orange highlights. Landscape composition with visual interest strongest in central 45-80% region; left 35% mostly dark quiet negative space to put game title and menu on top. No people, no temples or places of worship, no text, no lettering, no logos, no watermark, no UI. Beautiful atmospheric AAA game loading screen background, not a screenshot, not cartoon clipart.

### Character atlas

Use case: stylized-concept. Asset type: production game sprite atlas. Create one SQUARE 1024 by 1024 pixels transparent-background game sprite sheet in an EXACT 4 columns by 4 rows regular grid (16 equal 256x256 cells), no borders no labels no text. Each cell contains ONE centered full-body or full-object sprite with substantial transparent margins, nothing crosses a cell boundary. All actors face toward the viewer at a top-down three-quarter game angle, consistent scale and grounded camera, fully visible feet. Gorgeous hand-painted 2D dark fantasy action RPG sprites, Southeast Asian folklore, chunky readable silhouettes with dark outlines, richly shaded colorful fabrics, golden edge lighting. NOT photorealistic. Row 1 left to right: 1 Malaysian male protector Ustaz Hakim wearing ivory baju melayu green sash white kopiah cap, open hands with subtle gold light no weapon or scripture; 2 Malaysian young male biker with yellow helmet blue jacket on small red kapcai motorcycle; 3 Thai female Muay Thai fighter Nok in red shorts and hand wraps athletic stance; 4 Vietnamese female water puppeteer Co Lan in teal ao dai with a tiny carved dragon puppet. Row 2 left to right: 5 Indonesian female pencak silat warrior Sari in plum and gold costume wielding a short kris; 6 small green one-eyed mischievous toyol ghost; 7 pale pocong wrapped shroud ghost with glowing red eyes and tied top; 8 bulky glossy black orang minyak oil ghost. Row 3 left to right: 9 floating pontianak woman with long black hair and pale flowing dress, spooky stylized no gore; 10 massive shadow Hantu Raya monster with long arms and red glowing eyes; 11 gnarled tropical palm tree with lush crown and visible trunk; 12 large tropical banana plant. Row 4 left to right: 13 warm glowing amber kampung lantern on short wooden post; 14 weathered moss-covered rock; 15 single golden coin with diamond motif; 16 glowing turquoise spirit crystal. Consistent isometric-ish three-quarter overhead sprite style suitable for top-down survivor game. NO text or numbers. Background must be entirely transparent between and around sprites. Keep every sprite smaller than 190x210 pixels inside its own 256x256 cell.

### Arena

Use case: stylized-concept. Asset type: top-down 2D action RPG playable arena background, SQUARE 1536x1536. An overhead near-orthographic bird's-eye view looking straight down on a Malaysian kampung clearing at night, richly hand-painted premium PC game environment. No horizon, no sky, no perspective vanishing point. At least 75 percent of the image, especially center, is OPEN walkable mossy dark teal grass and weathered dirt intersecting paths, small scattered leaves, puddles reflecting moonlight and patches of warm lantern illumination. At the very outer top and side edges only: cropped roofs of traditional wooden Malay stilt houses, dense tropical foliage and oil palm fronds. A small circular weathered stone clearing precisely in the center, surrounded by branching paths. Bottom edge a weathered small wooden plank bridge over a very thin stream. Dark emerald, midnight jade and warm amber palette, detailed beautiful terrain textures but low contrast so bright character sprites will be readable on top. Very sparse ground clutter in the central 80%. Dramatic softly illuminated atmosphere, subtle drifting ground mist. No people, no monsters, no coins, no UI, no text, no letters, no worship buildings. Must feel like a ready-to-play TOP DOWN 2D game arena background, not a landscape painting. Environment art inspired by Southeast Asian folklore and lush kampung forest.

## Eight-direction heroes (2026-11-14)

`heroes-directions.png` was generated with the built-in image tool using `survivors-atlas.png` as identity reference. Transparent 8-column × 5-row sheet: Hakim, Jet, Nok, Lan, Sari. Columns: E, SE, S, SW, W, NW, N, NE. Runtime rounds shared cell boundaries and retains the last movement-facing direction at rest. The original atlas remains for enemies and lobby portraits.

Generation prompt: Create a production game sprite sheet using the five reference heroes. Exactly eight columns by five rows with equal square cells, transparent background, no text or grid. Each row preserves the hero costume and proportions: white/green Hakim, yellow-helmet motorcycle Jet, red/gold Nok, teal Lan, purple/gold Sari. Columns face east, southeast, south, southwest, west, northwest, north, northeast. Fixed elevated three-quarter camera, visibly back-facing north views, full bodies centered with padding and consistent foot baseline. Crisp illustrated fantasy style matching the reference; no enemies or props outside character equipment.

These are directional poses, not walk-cycle animation. Generated poses have minor silhouette and alignment variation; review at gameplay scale before adding animation frames.

## Movement and attack cycles (2026-11-14)

Five `*-motion.png` sheets add 320 frames: four movement and four attack poses for eight directions for each hero. Rows 0–3 are movement; rows 4–7 are attack; columns remain E, SE, S, SW, W, NW, N, NE. Hakim uses measured row gutters in `src/content/animation-layouts.js`. Original rasters are unmodified. Built-in image generation used the directional atlas as identity reference; see `ANIMATION_PROMPTS.md` for prompts. The review page at `/tests/animation-gallery.html` supports frame stepping. Minor generated alignment and silhouette variation remain; these cycles now handle movement, basic attacks, and skill recovery.

## Unique skill poses (2026-11-14)

Five `*-skills.png` sheets add 320 directional keyposes. Eight columns remain E, SE, S, SW, W, NW, N, NE; row pairs 0–1, 2–3, 4–5, 6–7 are Q, E, F, R windup/release. Runtime rounds shared cell edges. Each skill uses two generated poses plus the existing final basic-attack frame for recovery; these are not full hand-drawn multi-frame cycles. Generated poses retain minor alignment and proportion differences.

See `SKILL_PROMPTS.md` for exact generation prompts. Nok and Lan received second imagegen edits to remove generated backgrounds while preserving the 64-pose layout. Native skill VFX remain separate from the character raster artwork.

## Open-region artwork (2026-11-14)

`region-grass.png` is a repeating painted ground texture. `kampung-buildings.png` is a transparent 2×2 atlas: terracotta cottage, teal-roof cottage, terracotta market stall, jade market stall. Both were generated with imagegen. Shared rounded cell boundaries select building frames; runtime scales props to the map footprint. Paths, bridges, river and paddies use native graphics. Existing trees and lanterns reuse the original actor atlas. The former `kampung-arena.png` remains as legacy artwork and is no longer loaded.

Prompt summaries (paraphrased): seamless overhead muted jade/olive grass with soil, moss and short tufts, quiet low-contrast dusk lighting, no large objects or paths; four isolated painterly Malay kampung structures in an exact 2×2 transparent atlas, elevated three-quarter view, warm windows, timber/roof/canopy detail, generous margins, no scenery or people. Generated tiles may retain visible repetition; buildings use simple rectangular collision footprints.

## Regional props and enemies (2026-11-14)

`region-props.png` and `region-enemies.png` are original imagegen transparent 3×2 atlases, with a second background-removal pass preserving cell positions. Prop frames: Melaka shophouse, limestone formation, neon shop, fishing shed, rice granary, mining cart. Enemy frames: Palm Stalker, Lantern Wraith, Tin Sentinel, Neon Shade, Brine Drifter, Harvest Watcher.

Prompt summary (paraphrased): painterly Southeast Asian dark-fantasy game sprites, readable isolated silhouettes, six centered objects on an equal grid, consistent raised three-quarter view and transparent background. Regional terrain uses existing grass plus native paving, paths, water, bridges and paddies. These are invented fantasy designs. Enemies use a single illustration with procedural motion and attack telegraphs.
