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

## Original eight-direction heroes (2026-11-14)

The following three sections record the first generation of hero artwork. For the current assets, see [the roster redesign](#the-remaining-nine-survivors) and [Lia, Nadi and Vanna](#lia-nadi-and-vanna).

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

## Johor village trial

`johor-garden.webp` is an original image-generated ground tile depicting painted kampung grass, frangipani petals, pebbles and dappled shade. The village combines this tile with programmatic sandstone paving, a geometric inlay, timber cottages, market awnings and the existing directional hero sprites. Three.js models and materials are in `src/scenes/RegionWorld.ts` and `src/scenes/village-house.ts`.

## Regional ground materials

`regional-surfaces.webp` is an original image-generated 2×2 terrain atlas. The quadrants contain Melaka quay tiles, Perak limestone scree, Penang shell sand and Kedah rice stubble. That sheet records the original four-stage terrain pass. Regional civic structures, workshops, and hero spell geometry are authored locally.

## Ability icons

`ability-icons.webp` is an original image-generated four-column, five-row painted atlas for the combat HUD. Columns follow Q, E, F and R. Rows follow Hakim, Jet, Nok, Lan and Sari. Cooldowns, rank and charge are drawn as live HTML overlays.

## Campaign atlas geography

The bundled relief color texture and height grid cover 75°E–150°E and 23°S–42°N. The terrain uses recolored and vertically exaggerated Mapzen Terrarium samples. Global ETOPO1 bathymetry is from NOAA National Centers for Environmental Information. Global SRTM and GMTED2010 terrain data are courtesy of the U.S. Geological Survey. Australian source terrain © Commonwealth of Australia (Geoscience Australia) 2017. [Terrain data credits](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)

The peninsula inset covers 96°E–108°E and 2°S–10°N. Its 1,792 px relief texture combines zoom-8 Terrarium elevation and bathymetry, 200 m land contours and Natural Earth’s 1:10m land polygons. The mesh uses vertically exaggerated elevation sampled at 1/32° intervals before simplification. Colors indicate relief and depth. [Natural Earth land polygons](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/)

Country outlines use Natural Earth’s public-domain 1:50m Admin 0 data. The gold travel line connects the playable stages. A muted dashed line continues through the planned ASEAN stops. [Natural Earth cultural vectors](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/)

The atlas stage labels use the flags of the eight playable states and the Federal Territory of Kuala Lumpur. The local sheet `flags/malaysia-stages.webp` packs the flag artwork in stage order, from Johor through Kelantan. [Wikimedia Commons flag sources](https://commons.wikimedia.org/wiki/Category:Flags_of_states_and_federal_territories_of_Malaysia)

### Survivor lineup

The wheel uses south-facing gameplay idle frames. For the original five, take column 2 of each row in `heroes-directions.png`. For the seven additional heroes, take motion frame 58 from the regular eight-column atlas. Trim transparent padding, preserve aspect ratio and align the feet in 176 px square cells. `survivor-idles.webp` packs the twelve figures in four columns.

## Roster ability icons and portrait flags

`roster-skill-icons.webp` packs 35 original ability icons assembled from seven sheets made with the built-in imagegen tool. Captain "Pag Pag" Garcia, the Gold Sultan, and Nadi use dedicated icon strips in the picker and HUD. Atlas rows follow Auntie Karen, Captain "Pag Pag" Garcia, Dani, Vanna, Keo, Nadi, and Lia. Columns follow basic attack, Q, E, F, and R. Each tile is 128 × 128. The lobby shows all five columns and the combat HUD uses Q through R.

The eleven local country flag images under `flags/` come from [Flagpedia](https://flagpedia.net/about). The lobby wheel and upgrade shop show the active survivor’s flag behind their sprite at 30% opacity.

### Ability icon prompts

The shared prompt used the palette and ordered tile subjects for each survivor below.

```text
Original hand-painted fantasy action RPG ability icons. One PERFECT REGULAR EDGE-TO-EDGE 3-column by 2-row sprite atlas, landscape 3:2 ratio. Exactly six equal SQUARE tiles. Straight divisions precisely at 1/3 and 2/3 width and 1/2 height. No gutters, no border around the whole sheet, no gaps, no text, lettering, keys, numerals, portraits, mockup, or watermark. Each tile has its own opaque, nearly black color-tinted background. Use luminous contrasting paint, light scattering and clean bold central silhouettes readable shrunk to 36×36, akin to hand-painted fantasy RPG inventory art, no imitation of specific game assets. Main objects stay generously within their own squares, at least 10% away from every edge; flat square-on icon artwork. Shared palette [palette]. The six tiles are read left-to-right across top row and then left-to-right across bottom row. In STRICT EXACT order, tile 1 through 5 are these five different coherent subjects separated by semicolons: [tile subjects]. Bottom-right tile 6 is a nearly black flat empty square.
```

- **asha** uses hot pink, cash gold and touches of jade. Expired Voucher shows a folded, dog-eared coupon with a torn edge. Tissue Packet Chope fans out white packets with blue bands. Cash Out unspools a blank receipt among gold coins. I Want the Manager sends red-pink sound rings out in a cone. Great Singapore Sale opens a striped awning over blank tags and shopping bags.
- **mira** uses charcoal iron, copper and amber. Read the five actions as a wok swing, spinning lid, steaming bowl, lid block and rolling stove.
- **The Gold Sultan** uses molten orange, bullion gold, and ivory. Gold Melting Flamethrower sweeps a wide cone of twisting flame and white-hot gold flecks over three rapid turns around the moving player. The braced sprite and its muzzle follow that heading. Gold Dust wraps the player in rising gold streamers and sparkles. Make It Rain drops flashing coins into a marked circle. Bullion Barrage launches solid beveled ingots with lit trails. The built-in ImageGen prompts requested five square painted icons in a horizontal strip on dark brown, then a transparent four-cell strip for the skill preview. The icon motifs are a rivet, a fire jet from a brass nozzle, a swirling gold aura, descending shiny coins, and flying beveled gold ingots. The preview strip shows the four active skills and uses transparent gutters and isolated effects. A follow-up ImageGen prompt requested a luminous ring with a rising column of powdered gold, upward streamers and four-point glints, with transparent alpha and no character or lettering. Its crop replaces the E tile in both `gold-sultan-icons.webp` and `gold-sultan-preview.webp`.
- **vanna** uses rose, mulberry, amber and a little violet. Tiles show a brass weaving shuttle firing a magenta spark → one luminous strip of tightly woven warp threads extending straight into depth → a golden shuttle passing sideways across a broad pink ribbon of weft → two crossing ribbons erupting upward into an angular bright pink star → a broad woven textile screen unfurling into a glowing rose barrier.
- **keo** uses reed green, pale chartreuse, turquoise, antique gold. Tiles show a bundle of bamboo reed pipes puffing a single pearl of green air → one broad fan-shaped bass sound wave from a reed pipe → three bright parallel thin air bolts through a dark background → an isolated wide circular resonant wave surrounding a small pause-like pair of vertical reeds → four nested standing waves with a central flare.
- **nadi** uses oxblood, ochre and warm gold. The five icons depict an open palm, overlapping palm strikes, a crescent flanked by palms, a shielded palm and a seated gilded Buddha statue with spectral monk attendants.
- **lia** uses warm yellow, coral and rich ultramarine accents. Tiles show one wooden weaving shuttle with a gold return arc → a strong outward amber horizontal streak carving a path through fragments → one diagonal grounded dash trail with three trailing thread spools → three small separate spools swept inward by curved gold lines → three wooden shuttles fanning outward on three golden curved trails.

Captain "Pag Pag" Garcia’s motion, cast, and effect sheets use the built-in image generator. The character brief calls for a stocky Filipino cook with a red knotted bandanna, blue rolled sleeves, a stitched ochre apron, and a copper stove backpack. Warm edge light picks out the wok and lid against the jade terrain. The walk sheet follows four planted steps. The cast sheet shows the lid leaving his hand, the wok tipping into steam, his knees braced behind the lid, and one boot extended to launch the cart. The effect brief follows iron, copper, ivory steam and charcoal across four beats for each of the five attacks.

### Lia, Nadi and Vanna

Lia’s forward lean, split red cape and diagonally strapped dispatch case identify her at running speed. Timorese marathoner Aguida Amaral inspired the emphasis on endurance and economy of movement. Lia’s parcel throw, dash and recall bell belong to her fictional courier role. [International Olympic Committee](https://www.olympics.com/cio/timor-leste)

Nadi is an elderly fictional Myanmar monk in a dark maroon robe with an ochre fold. Mingun Sayadaw’s scholarship and memory inspire Perfect Recall. Gold light defines the combat effects, while the statue sits serenely inside a clearly marked ward. [Biographical introduction to The Great Chronicle of Buddhas](https://bps.lk/olib/mi/mi014.pdf)

The built-in ImageGen prompts asked for a transparent four-column, three-row sheet with eight views of the same barefoot, shaved-headed monk in a maroon robe, plus a seated gilded Burmese Buddha statue, a small spectral adult monk guardian, an open palm of gold light, and a crescent shockwave flanked by palms. A second reference-based sheet requested the same monk walking, holding a bent-knee palm guard, and releasing a two-handed palm strike, with south, southeast, east, and north facings. Both sheets use a raised three-quarter view, hand-painted rendering, warm edge light, and isolated figures without lettering or scenery. The packed assets are `nadi-motion.webp`, `nadi-skills.webp`, `mingun-icons.webp`, the Nadi cell in `survivor-idles.webp`, and `hero-effect-sprites/nadi.webp`.

Vanna carries her two shuttles apart so the magenta thread forms a visible arc against her peacock-blue and ivory wrap. The Khmer classical dance tradition preserved by Princess Norodom Buppha Devi informed the controlled wrists and upright posture. The weaving gestures were designed for Vanna’s four textile skills. [Interview and dedication to Buppha Devi](https://www.nkfc.org/wp-content/uploads/2021/02/Paul-Cravath-Cambodian-Dancers-NKFC-Preview-Dedication-HRH-Buppha-Devi-Cravath-Interview.pdf) · [UNESCO](https://ich.unesco.org/en/RL/royal-ballet-of-cambodia-00060?RL=00060)

Vanna’s refreshed `hero-effect-sprites/vanna.webp` uses twenty painted flipbook cels packed into four columns and five rows. Three.js adds twisting gold-edged scarf surfaces at release, along the shuttle and familiar’s attack paths, and around Silk Loom. The familiar’s painted body and raised tails follow its live orbit. Reduced motion holds the decorative folds and atlas cels while the familiar follows its gameplay path.

<details>
<summary>Vanna’s built-in ImageGen prompt</summary>

Use case: stylized-concept. Create a game-ready transparent combat VFX sprite atlas for Vanna, a Cambodian fantasy silk weaver, for a hand-painted 2.5D action game. Use the supplied existing VFX atlas as the EDIT TARGET for the exact semantic frame layout only: four equally spaced columns and five equally spaced rows across the entire canvas, centered in each square cell. Replace the art with much more dynamic high-fashion silk in saturated orchid, hot rose, deep mulberry shadows, ivory glints and fine antique-gold embroidery. The silk has billowing thick and thin folds, visible front and back surfaces, fine textile weave, clean painted highlights, elegant couture-like motion and strong readable silhouettes. No characters, no logos, no text, no cell borders, no background/shadows outside the objects. Real alpha. Strict distinct 20 isolated cutouts, with generous empty gutters on ALL sides, no clipping or overlap. 4:5 canvas aspect. Four frames in every row show tightly gathered / opening / fullest flare / broken frayed offcuts; visibly different contours with more opaque area at peak and less at first and last. Row 1 left-to-right: thin pointed rosewood weaving shuttle, shuttle pulling a strip, shuttle towing a broad curled silk streamer aimed right, split fraying tails. Row 2: straight thin silk slash aimed right, expanding diagonal flick of silk, broad long horizontal S-wave of stage-lit rose silk edged in gold, three light tapered offcuts. Row 3: single tiny spool with a thread, braided zigzag, two distinct wide ribbon scallops with gold stitch accents shooting right, broken seams curling off. Row 4: folded knot, unfurling silk moth-shaped familiar with paired tails, magnificent wide floating folded silk familiar with sweeping twin silk scarf tails and no animal face, fading silk remnants and tails. Row 5: corner-sized crossing of two curled silk strips, fanning weave rising, peak broad crossed billowing rose and ivory folds fully opened, scattered silk streamers. The four columns are equally spaced, with one pose per cell, no extras. Vary dark shadow folds and bright illuminated silk. Preserve painterly art suited to a real game and render the authentic clean negative space.

</details>

Each of the three has two transparent 8×8 WebP sheets with 320 × 192 px cells and feet aligned at y=180. Movement and basics occupy four rows each. Skill rows are Q/E/F/R windup and release pairs. Motion frame 58 supplies each lineup portrait. Review the eight directions on the animation gallery.

### The remaining nine survivors

| Survivor | Readable shape and gesture | Reference |
| --- | --- | --- |
| Fadli | Cream tunic over a green-and-gold waist cloth. His lantern and beads move in arcs around an upright body. | [Malaysian songket](https://ich.unesco.org/en/RL/songket-01505) |
| Kama | Yellow helmet above a red underbone motorcycle. The wheelie lifts his silhouette while his ultimate flattens it across the bike. | [Malaysian Cub Prix](https://www.petronas.com/motorsports/malaysian-cub-prix) |
| Nok | Compact red-wrapped boxer. Her high guard opens into a long teep and folds back into a tight elbow. | Muay Thai |
| Cô Lan | A broad green hat sits above a small lacquered puppet. The rod lets the dragon strike beyond her reach. | [Vietnamese water puppetry](https://vietnam.travel/things-to-do/vietnam-water-puppets/) |
| Sari | A purple-and-gold trailing sash follows a low centre of gravity. Her open guard and wide kick make distinct shapes. | [Indonesian pencak silat](https://ich.unesco.org/en/RL/traditions-of-pencak-silat-01391) |
| Auntie Karen | Compact Singaporean bargain hunter in her mid-50s. Blonde streaks trace an asymmetric dark bob beneath pushed-up sunglasses. A hot-pink and cash-gold tropical floral blouse, cropped slacks and sandals frame a stiff handbag, coin bum bag, pocket tissues and plastic shopping bags. Her raised eyebrow and pursed lips give way to an open-mouthed point for F and bags held high for R. | Affectionate Singaporean kiasu competitiveness and bargain-hunting |
| Captain "Pag Pag" Garcia | A red headband, patched apron and portable charcoal stove frame his iron wok and lid. | Filipino neighbourhood kitchen |
| The Gold Sultan | A fictional Seria goldsmith wears a leaf-point crown, engraved gold armor, and a dark green underlayer. He carries a portable gold-bar melter with both hands. The visible ingot hopper, bronze housing and glowing bore distinguish it at gameplay scale. | Brunei |
| Keo | The bamboo pipes rise above the musician’s head. He tilts into the low notes and straightens for the sustained performance. | [Lao khaen music](https://ich.unesco.org/en/RL/music-of-the-khaen-01296) |

Captain "Pag Pag" Garcia uses 320 × 192 px cells with feet at y=180. The other eight painted characters use 240 × 144 px cells with feet at y=135. Motion rows 0–3 cycle locomotion and rows 4–7 play the basic attack, ending in the idle stance. Skill rows pair preparation and release for Q, E, F and R.

### Gold Sultan character sprites

The built-in ImageGen direction prompt called for the Gold Sultan’s crown, dark beard, engraved gold armor and green fabric, carrying a broad gold-bar melter with a bronze housing, a ribbed glowing muzzle and a feed tray full of gold bars. It specified eight isolated full-body views in a transparent 4×2 grid, ordered south, southeast, east, northeast, north, northwest, west and southwest.

The reference-based pose prompt called for the same design in a transparent 5×3 grid with south, southeast, east, northeast and north views. The rows show a walking stride with the melter at hip level, a bent-knee firing brace with the bore forward and an upright charge pose with the bore raised. The other release and stride views use the matching reflected art. The paired 8×8 sheets keep the 240 × 144 px cell grid and y=135 foot anchor. Motion frame 58 supplies the updated roster portrait.

## Malaysian campaign sprite atlases

The terrain is 3D and the actors and scenery are illustrated billboards with ground anchors and projected shadows. The original regional sheets use a 3×3 grid of transparent cells. Their frame order is Johor, Melaka, Kuala Lumpur, Perak, Pulau Pinang, Kedah, Pahang, Terengganu and Kelantan.

### Klang River Quays and terrain materials

- [Old Quay Warehouse](klang-warehouse.webp) uses built-in ImageGen. The brief calls for three connected cream plaster bays, layered terracotta roofs, burgundy timber shutters, loading arches and a stone plinth with ropes and crates. Use a three-quarter view, warm sunset accents, teal-grey shadows, and a transparent background.
- [Mooring Wraith](mooring-wraith.webp) uses built-in ImageGen. The brief calls for a coil of frayed harbour rope around a brass mooring ring with cyan ghost lights. Three isolated right-facing poses show a compact idle, trailing rope in travel, and a snapping rope end in attack. The runtime frames share a ground pivot.
- `terrain/ground-detail.webp` is a 2,048 × 2,048 shared detail map. The red, green and blue channels capture grass strokes, clay and gravel. The shader samples the detail map at two scales to break up the transitions between each district’s painted surfaces.
- Selangor uses painted color swatches with the shared ground detail. Built-in ImageGen created a 2×2 material sheet with olive grass and leaf litter, compacted laterite and cracked clay, gravel and broken slate, and chipped terracotta brick with moss in the joints. The brief called for straight overhead views with neutral lighting and crisp wear at play scale. The four `terrain/klang-*.webp` files are individually cropped and color-graded, with blended repeat seams for the natural surfaces. Gravel shoulders frame brick streets, and building forecourts use local rectangular footprints.
- [Selangor’s atlas flag](flags/selangor.webp) uses the red and yellow quarters and the white crescent and star shown in the official state reference. [Dewan Negeri Selangor](https://dewan.selangor.gov.my/wp-content/uploads/2021/12/Dasar-Belia-Selangor.pdf)

### Regional terrain swatches

Built-in ImageGen created four overhead 2×2 texture sheets. Each brief called for neutral light, visible medium-scale wear, restrained contrast and an even distribution across each cell. The cropped WebPs in [terrain](terrain) have color grading and blended seams for organic surfaces. Patterned hardscape tiles mirror at the edges to preserve the joints.

| Sheet | Swatches in reading order |
| --- | --- |
| Groves | Tropical grass with broadleaf weeds, kampung earth with roots and dry leaves, dark forest leaf litter, rounded river pebbles |
| Coasts | Crushed shell grit, damp tidal mud with faint water marks and reeds, wind-brushed coastal sand, weathered timber boards |
| Fields | Cut rice stubble, floodplain sedges, compacted chalky silt with straw, limestone chips and dusty gravel |
| Streets | Patched slate asphalt, worn concrete slabs, blue-grey irregular flagstone, chipped terracotta quay brick |

Each stage uses its own combination of three ground swatches and selects matching road, shoulder and paving materials. Grounds, roads and forecourts use continuous world-space UVs so their surfaces meet without a texture phase shift.

### Roadside building atlases

The built-in ImageGen tool produced both building sheets. The packed WebP files use 384 × 448 px transparent cells, centered horizontally and anchored near the bottom. Building footprints and the same terrain palette connect the sprites to the streets.

- `kl-buildings.webp` uses this generation brief. Make a transparent 3×2 sheet of narrow teal heritage shophouse, cream corner coffee shop with a red awning, indigo-and-rose night-market stall, pale sandstone art-deco arcade, dark-glass commercial block, and a blue-green monorail entrance with stairs, ordered left to right and top to bottom. Use a matching orthographic three-quarter view, with front and right walls visible from about 40 degrees above. Paint humid, faded materials, warm windows, and muted blue and plum twilight. Keep each silhouette isolated with clear gutters.
- `malaysia-buildings.webp` uses this generation brief. Make a transparent 4×2 sheet of a timber market stall with rattan baskets, Melaka brick and plaster shophouse, raised Kedah rice granary, nipah-thatch riverside cottage, Perak ore shed, Terengganu timber boatbuilding shed, Kelantan batik workshop, and Penang stilted waterfront store, ordered left to right and top to bottom. Use the same three-quarter view, warm top-left light, textured paint, and subdued local fabrics. Keep the cutouts free of ground tiles, text and people. A second ImageGen pass removed the original white matte and preserved the roof edges, fringes, and stilts.

- `malaysia-monsters.webp` was generated with the built-in image generation tool from this brief. Nine original isolated fantasy MMO enemy sprites on a transparent 3×3 sheet, in three-quarter view with chunky silhouettes, matte cel shading and warm overhead light. Palm Stalker with oil-palm fronds, Lantern Wraith with a riverside timber lantern, Neon Shade with pink and turquoise ribbons, Tin Sentinel with limestone armour, Jetty Drifter in a fisher hat, Paddy Watcher with a woven hat and straw, Nipah Rootling with mangrove roots, Slipway Crab with pale cyan claws and Wau Wisp with a rose-and-gold crescent kite. Keep the character fully inside each cell and exclude shadows, lettering and backdrop.
- `malaysia-scenery.webp` was generated with the built-in tool from this brief. Nine isolated three-quarter-view Malaysian district props on a transparent 3×3 sheet with matte pigments, detailed material grain and lamplight. Design a Johor red-roof stilt house, Melaka brick clock and market pavilion, KL neon hawker stall, Perak tin dredging rig, Penang jetty shed, Kedah thatched granary, Pahang mangrove lookout, Terengganu boat on cradles and Kelantan batik stall with a wau. Use fictional locations and leave out labels, backgrounds, shadows and people.
- `johor-traveller.webp` was generated with the built-in tool from this brief. A single wary Johor market vendor in a muted indigo baju and practical trousers, with a satchel and wicker basket. Draw the full figure in a three-quarter view, with warm light, matte outlines and a transparent background.

### Sprite motion

`malaysia-monsters-motion.webp` packs the original nine rest poses, nine alternate travel poses and nine attack-release poses in three 3×3 blocks. Each cell is 224 px square, with feet or the lowest part of a hovering silhouette aligned to the same baseline. `johor-traveller-motion.webp` packs waiting, beckoning and relieved poses in three 256 px cells.

`malaysia-folklore.webp` is a companion atlas of ten 224 px cells on a 5×2 grid. It uses built-in image generation with this brief: transparent, hand-painted three-quarter silhouettes for gold and silver ribbons, a white mouse-deer, a long-armed neon shadow, a stone elephant, a net-floated wave beast, a straw-backed tusked haunt, a coiled naga, a carved timber prow, a chestnut barking deer and a calm humanlike orang bunian carrying a small lantern. All cells share the original regional actors' ground pivot. The scene animates the nine hostile variants through stride, windup and release transforms.

`malaysia-folklore-companion.webp` uses nine 224 px cells in stage order on a 3×3 grid. The built-in ImageGen brief referenced the first folklore atlas for transparent, hand-painted dark-jade silhouettes, warm rim light and a right-facing three-quarter view. In row order it requested a mangrove-backed mud crab, woven rattan eel, neon-rimmed racket-tailed drongo, bamboo-backed rat, cracked gold earthenware jar, waterfall shard, limestone rampart bat, windblown areca blossom cluster and floating teal porcelain bowls and plates. The prompt specified isolated cells without ground, detached effects or religious emblems. The sheet was trimmed, aligned to the existing ground pivot and packed as WebP.

Built-in image generation used the original atlases as pose references. For travel, the prompt specified the same designs, costumes, palette and right-facing three-quarter view, with opposite footsteps, trailing ribbons or offset claws. For attack frames, it specified extended claws, a swinging lantern, a forward thrust, a two-fist slam, a net sweep, a straw swipe, planted roots, snapped claws and fanned kite ribbons. For the traveller, it specified a beckoning hand and a hand to the chest with the same basket, indigo outfit, head wrap and planted feet. All additions use transparent backgrounds and no baked-in ground shadows or detached effects.


`malaysia-folklore-third.webp` contains nine individual built-in ImageGen cutouts, packed in stage order into a 3×3 sheet. Each 224 px cell shares the preceding atlases’ bottom alignment. The nine prompts used the following template and subjects.

```text
Use case: stylized-concept. Asset type: one monster sprite for ASEAN Survivor, a Malaysian folklore top-down browser action game. Subject: [subject]. New original sprite, isolated on genuinely transparent background, full object centered with wide padding. Readable dark-to-light silhouette at 64px, angled top-down three-quarter game camera, hand-painted stylized fantasy game illustration with crisp opaque textured brushwork and selective warm rim light. No pedestal, ground, shadow beneath the object, frame, lettering, watermark, separate effects, extra objects, gore, human characters or religious symbols.
```

- **Endau Eagle** · a giant dark copper and auburn forest eagle diving head-first, its wings tipped upward in a tight V, golden beak, ivory face stripe, sharp silhouette
- **Rebana Echo** · a single weathered red-brown Malay frame drum, oblique view of taut pale hide, brass lugs and two wisps of pale coral trailing sound ribbons, floating, entirely inanimate
- **Nanas Bramble** · a squat animated wild pineapple-leaf hedge clump, arching serrated blade leaves, small amber scale-like core, blue-green and yellow, lilac neon edge reflections, no face
- **Lenggong Snag** · a heavy horizontal fallen tropical tree trunk held precariously across a shorter forked trunk like a tilted seesaw, visible broken raw wood, dull green moss, bracken, only a few protrusions, large readable X silhouette
- **Batu Maung Print** · a single floating dark tide-worn granite slab, strong foot-shaped depression impressed in its upper surface, shallow pale blue water gathered inside indentation, blue-gray marine palette, stone slab only, no foot or humanoid
- **Padi Ember** · a vivid loose plume of burnt rice grains, blackened rice stalks and orange embers shaped into a low, lopsided jackal-like tuft of ash, two thin smoke tails near its shoulders, no visible face
- **Whitewater Croc** · a wide low ivory crocodile-shaped hollow cast of river silt, seen from upper three-quarters with clearly visible long thin jaw, rugged ridged back and sharply hooked tail, washed turquoise edges, no humanoid elements
- **Songket Moth** · a moth of deep maroon woven silk, tapering wings with fine gold-thread triangular bamboo shoot motifs, squared-off scalloped fabric wing edges and tiny plum body, graphic lozenge silhouette, no person
- **Beringin Shadow** · a single fictional freestanding banyan shadow shaped as a tall pointed teardrop, dark aubergine cut-leather silhouette around fine branching roots and golden amber pierced tracery, subtly backlit; an invented forest prop, no deity, no person or animal, no pole

### Expanded Malaysian districts

The built-in image generation tool referenced `malaysia-scenery.webp` for its matte brushwork, shaded timber, warm lamps and terracotta-and-teal palette.

- **`malaysia-ground.webp`**. A 3×3 sheet of overhead ground treatments. Prompt for moss and leaf litter, terracotta brick, charcoal granite, limestone scree, shell sand, dry rice soil, mangrove silt, tidal sand and ochre floodplain. Keep the scale low contrast and omit directional shadows and objects.
- **`malaysia-terrain-materials.webp`**. A 2×2 sheet of overhead flagstone, worn laterite, weathered boardwalk timber and green-teal water. Prompt for muted brushwork and continuous tile edges.
- **`malaysia-landmarks.webp`**. One isolated secular landmark sprite per region. Prompt for the same front-right three-quarter view and weathered finishes as the scenery set. The nine cells show a Bukit Timbalan civic hall, Stadthuys facade, Kuala Lumpur's twin towers, a Tanjung Tualang tin dredge, a Penang jetty entrance, a paddy-bundle-shaped museum, a Kuantan observation tower, a Pasar Payang market hall and a Kelantan timber craft hall. The layouts and sprites are game interpretations.

Visual references for the northern and west-coast districts. [Tourism Johor’s guide](https://tourismjohor.my/wp-content/uploads/2022/03/JOHOR-TRAVEL-GUIDE-English.pdf), [Melaka’s Dutch Square](https://www.malaysia.travel/explore/dutch-square), [the Petronas Twin Towers](https://www.malaysia.travel/explore/petronas-twin-tower), [Perak’s tin dredge](https://ebrochures.malaysia.travel/en/malaysia-travel-guide/perak/), [George Town’s clan jetties](https://www.malaysia.travel/index.php/explore/pedalling-in-penang-george-town), [Muzium Padi](https://www.malaysia.travel/explore/exploring-alor-setar-a-journey-through-cultural-treasures-and-historical-legacies)

Visual references for the east coast districts. [Kuantan 188](https://www.malaysia.travel/index.php/events/pesta-kuantan-188), [Pasar Payang and Kuala Terengganu](https://www.malaysia.travel/explore/7-unforgettable-stops-to-make-in-kuala-terengganu), [Kota Bharu’s Handicraft Village](https://www.malaysia.travel/explore/how-to-experience-kota-bharu-like-a-local)

### Quest objectives

The 4-column Malaysian quest prop atlas contains a supply chest, Thorn Hunt claw marks, lantern ward and quay manifest in the first row. The second row contains nasi lemak packets, a tin pan, a mooring bollard and a sluice gauge. The third contains nipah seedlings, a boat on launch rollers, a wau bulan and a trail sign. Keep each prop's feet near the bottom of its transparent cell. The separate two-frame Briarback strip shows emerging roots during the warning and exposed barbs during the damaging phase.

## Hantu Raya raid

The portal and lair use original artwork from the built-in image generator. The gate's eyes and grasping roots echo the boss sprite. The lair's root wall follows the circular movement limit, with a feathered edge into dark water. The attack warnings remain live overlays.

- **Portal prompt.** Isolated transparent-background RPG prop, viewed from slightly above. Twin blackened banyan roots twist into a pointed arch around an opaque ink-black doorway. Two ember-red eyes watch from within. Violet and cold turquoise rim light reveal hanging tendrils and a pale pool at the threshold.
- **Lair prompt.** Square, overhead hand-painted Malaysian blackwater clearing in cold moonlight. Keep the circular muddy clearing open and softly textured. Suggest a shadow double in the water. Surround the clearing with buttress roots, hanging fibres, dark hollows and sparse pairs of ember eyes. Fade the forest at the edges and reserve red ground markings and gold circles for combat.

## Rice paddies

The built-in image generator produced `malaysia-rice-paddies.webp` as a transparent 2×2 sheet. The prompt called for overhead Malaysian flooded plots with mossy earthen bunds, irregular rows of individual rice plants, shallow water reflections, and muddy footprints. Two green plots occupy the upper row and two ripe, golden plots the lower row. Kedah uses the ripe rice.

## Survey equipment atlas

The built-in ImageGen produced `equipment-survey.webp` from the following prompt.

> Create one square inventory sprite atlas for a tropical expedition fantasy RPG, exact uniform 4 by 4 invisible grid, one isolated richly painted realistic inventory object centered in each square on pure solid black. Aged brass highlights, deep saturated textile colors, carved wood, woven fibers, painterly studio lighting from upper left, large silhouettes, three-quarter view. Strict row-major layout. Row 1: a diagonal brass and bamboo Survey Rod with a surveyor's plumb bob; a rugged diagonal forked Fault Rod of cracked basalt bound in copper; a diagonal polished silver Tuning Rod shaped like a tuning fork on teak handle; a round brass Pulse Locket with coral heartbeat inset and loop of cord. Row 2: a jade Refuge Locket with protective shell design; red enamel Rally Locket with sunrise emblem; small tan laced barrel Cadence Drum; deep indigo Thunder Drum with angular brass lightning ornament. Row 3: green Rain Drum with raindrop patina and pale hide; a sage gray Mist Hood with soft layered veil, empty hood opening no face; deep navy Squall Hood with storm blue piping, open empty hood; pair of Reed Boots with woven straw cuffs and olive leather. Row 4: leftmost tile contains a pair of russet Switchback Boots with angular high-traction soles, copper buckles and ochre diagonal straps. Remaining three cells completely black. Each object fills 78% of its tile with clean black breathing room. No text, no grid lines, no labels, no people, no scenes.

## Campaign pickup sprites

The built-in ImageGen generated original transparent illustrations for `campaign-pickups.webp`. The prompt requested dark indigo edges, broad painted highlights and distinct silhouettes at ground-loot size. The art was cropped, centered and downsampled into 128 px cells with transparent gutters, then encoded as lossless WebP. The first row contains ketupat, Besi Berani, mercun and Kopi Kaw. The second contains the payung, falling durian and a cyan experience crystal with a violet facet, followed by an empty cell. Equipment drops reuse the painted cache chest in frame 0 of `malaysia-quest-props.webp`.

**Regional workstations.** Built-in OpenAI ImageGen generated the two transparent cutouts in `regional-workstations.webp`. The left frame depicts the timber-and-brass hand winch at Chew Jetty in Penang. The right depicts the bamboo reel stand at Kelantan’s wau lookout. The cutouts were cropped, downsampled and aligned by their feet in two 256 px cells. The gangway, kite and flying line animate separately in Three.js.

**Regional quest workers.** OpenAI’s built-in ImageGen illustrated the eight occupations in `regional-workers.webp`. Rows follow the regional quest order from Melaka to Kelantan. Each worker waits with a tool, beckons, then acknowledges the player. The 256 px cells share a foot baseline at y=233 and center the stance at x=128.

**Penanggal.** OpenAI’s built-in ImageGen illustrated the two forms together for `penanggal-pair.webp`. The airborne head trails teal and plum spirit ribbons. The slumped, fully clothed body wears the same crescent clasp as the head. The grounded robe hem and floating ribbon tip each meet the y=233 baseline in their respective cells.

## Malaysian folklore fourth atlas

`malaysia-folklore-fourth.webp` uses one transparent atlas generated with built-in ImageGen. The cutouts were packed into nine 224 px cells in stage order and bottom-aligned. The generation prompt follows.

> Create one production sprite atlas, a precise 3-by-3 square grid of nine DISTINCT enemy sprites on a genuinely transparent background, for a top-down Malaysian folklore fantasy survival game. Digitally hand-painted, warmly rim lit, deep jade-night shadows, saturated edges, bold readable silhouettes at 80 pixels, three-quarter view toward viewer, no gore. Each entire independent subject including any wisps stays within the central 72% of its own equal square cell, centered at exact grid centers 1/6, 1/2, 5/6 of canvas width and height. Every cell has transparent gutters on all four edges and matching design scale. No text, grid lines, backdrops, drop shadows, platform, ground, or scenery. Row 1 left to right: (1) gold and dark olive woven rattan hobbyhorse apparition reared with curled mane and two sweeping straw ribbons, clearly a hollow wicker horse shape with no rider or person, (2) a matched pair of lacquer-red wooden clogs with teal straps floating beside one another as a single whimsical haunt, (3) a silver liquid pewter humanoid phantom, broad shoulders tapering into double mercury streams, small magenta neon highlights. Row 2: (4) squat matte black ceramic double-bulb bottle gourd with peppered amber cracks, a small stopper and two short clay feet, (5) ghost formed from a single tall bamboo balancing pole and a windblown saffron and blue rectangular banner with a split tail, no symbols or words, (6) a pair of dark slate mountain peaks joined as one walking rock elemental, visibly two unequal pointed peaks, lilac storm seam and warm orange tips. Row 3: (7) a rich chestnut split candlenut shell sprite with rounded shell half guarding one side, exposed cream kernel and two dark little feet, (8) an elongated warm ingot-brass fish apparition with repoussé scales, sculpted fins and a long copper fishtail, (9) a low wide dark merbau wood spinning top with a broad silvery rim and a pointed spindle, jade-green spiral wisps tucked in close. Keep outlines, colors and subject materials distinctive for all nine.

## River water and timber crossings

`river-current.webp` and `kampung-timber-bridge.webp` were generated with the built-in ImageGen tool using the Johor gameplay screenshot as a style reference. The water tile was blended at its edges for wrapping. The bridge sprite was trimmed with its alpha intact.

The river samples the tile at two scales and speeds in world coordinates. The current follows the main channel through each region, with shallows and silt along exposed banks. Pausing and reduced-motion settings hold the surface still.

Timber spans up to three times as long as they are wide use the sprite. Its open ends face the crossing approaches, including the two east–west bridges in central Johor. The sprite sits over the authored deck footprint, with its post ends extending over the edges. Long jetties and masonry crossings use their existing materials.

**River tile generation prompt**

> Stylized-concept game asset. Generate a single edge-to-edge seamless square repeating surface tile of moving tropical river water for a painterly overhead Southeast Asian fantasy action RPG. The attached game screenshot is a style and palette reference. Show pure water, orthographic straight down. The current runs from the TOP toward the BOTTOM of the image, expressed with winding elongated north-south filaments, staggered small ripples, wisps of seafoam-green glints and nested eddies. Rich deep blue-green, subdued jade, teal and pale celadon accents. Mid-low contrast for gameplay and a matte brush-painted finish. Uniform illumination. Keep the flow readable at small scale. Tile should wrap seamlessly on both axes, especially top to bottom. Fill the entire canvas. No river banks, sand, rocks, vegetation, horizon, sky, letters, border, or object.

**Timber bridge generation prompt**

> Stylized-concept game asset. Generate one isolated weathered timber footbridge from a Malaysian kampung for a hand-painted Southeast Asian fantasy action RPG. The attached gameplay screenshot is a style and palette reference only. Orthographic straight-down overhead view and zero vanishing point, intended to be placed as a flat ground sprite. Travel is LEFT to RIGHT. Its footprint is a near rectangular compact span about 1.4 times wider (length) than it is tall (deck width). Keep both the left and right approaches completely open edge to edge. Dark ironwood decking with individual uneven hand-split planks whose long dimension runs vertically across the deck, clearly painted grain, scuffs, nail heads and occasional moss in the corners. Parallel straight narrow top and bottom rails running horizontally with stout timber posts tied with rattan lashings. Strong dark structure under warm amber highlights, matte pigment texture, restrained ochre and green accents. The deck is a single clear walkable surface covering almost all of the footprint and reaching both open ends. Keep the bridge centered and fully visible with tight margins. Genuinely transparent background, including all space outside the bridge. No ground card, water, broad shadows, characters, foliage outside the bridge, text, or labels.

## Regional foliage and stones

Built-in ImageGen prompt for `regional-foliage.webp`: a transparent four-column, three-row atlas of hand-painted Malaysian kampung scenery for a three-quarter overhead RPG. Use warm upper-left sunlight, jade and olive foliage and clear silhouettes. The rows depict coconut palm, mango, banana and casuarina trees; fern, spear grass, golden seedhead grass and pandan; river pebbles, laterite, mossy boulders and limestone chips. Give each object clear gutters and omit ground tiles, cast shadows, text and borders.

The runtime atlas uses 256-pixel cells with aligned ground contacts. Tree trunks occupy the existing collision anchors. Low vegetation and stones are walkable scenery.


## Classic ghost animation

`classic-ghost-motion.webp` contains sixteen original frames generated with the built-in ImageGen tool. Rows are Pocong, Toyol, Orang Minyak and Pontianak. Columns are idle, travel, anticipation and release. Alpha bounds were repacked into 208 px cells with a common pivot at 91% of cell height. The renderer combines the painted poses with travel distance, anticipation and recovery animation.

The generation prompt used `malaysia-monsters-motion.webp` as a style reference.

```text
Create ONE square transparent PNG game sprite atlas of four classic fictional Malaysian ghosts in four action poses, 4 columns x 4 rows of evenly spaced EXACT equal square cells. The supplied image is STYLE reference only: match the finely painted illustrated 2.5D dark fantasy game cutouts with warm edge lighting, clean bold silhouettes, light from upper left, slightly elevated three-quarter camera, facing screen right. Do not copy any reference monsters. Row 1: Pocong, one ghost completely bound in an ivory burial shroud tied at crown and feet, shadowed face with turquoise pinprick eyes. Row 2: Toyol, small long-eared green goblin spirit with loose russet waistcloth and amber eyes, playful threatening grin. Row 3: Orang Minyak, muscular obsidian oil-coated humanoid monster with violet and cyan reflected highlights, narrow bright eyes and tattered charcoal shorts. Row 4: Pontianak, pale spectral adult woman with flowing black hair, ivory torn dress, lilac shadows, rose-pink eyes. Four columns LEFT TO RIGHT for EVERY row: neutral ready pose; distinct moving/hopping pose; visibly pulled back or compressed anticipation pose; visibly lunging or casting to screen right release pose. Preserve exact identity, costume and scale per row. All figures completely inside their own cells with transparent gutters, same ground baseline in each cell at 88% of cell height, center at x=50%, no clipping. No impact effects outside the body, no extra objects, no ground shadows, no text, no numbers, no borders, no grids, no gore. Actual alpha background. The four sprites in each row must read as consecutive poses of the same character.

```


## Hunting pack animation

`malaysia-hunting-monsters.webp` contains sixteen original poses generated with the built-in ImageGen tool. Rows show Belang Prowler, Bakau Belangkas, Limestone Seladang, and Enggang Stormwing. Columns show idle, travel, anticipation, and release. The alpha bounds were repacked in 224 px cells with a shared ground pivot.

The prompt used `malaysia-monsters-motion.webp` as a style reference.

```text
Production 2D game sprite atlas. Use the supplied atlas only as a style reference for crisply painted dark fantasy Malaysian enemies, warm rim lighting, readable silhouettes, elevated three-quarter view, and translucent-free bodies. Draw exactly FOUR characters in rows, four poses per character, in an exact 4-column by 4-row square grid with transparent gutters and actual alpha background. Each figure entirely inside its cell. Row 1 Belang Prowler: charcoal Malayan tiger with distinct russet tiger stripes and fiery amber eyes, long curling tail, solid feline body and paws, smouldering shoulder patches. Row 2 Bakau Belangkas: Malaysian mangrove horseshoe crab, blue-green hard domed ridged carapace with barnacles, small armored claws underneath and long rigid pointed tail. Row 3 Limestone Seladang: bulky Malaysian gaur with white socks, upward-curving broad horns, slate limestone skin plates and jade mineral seams, clearly bovine. Row 4 Enggang Stormwing: bold rhinoceros hornbill with glossy black wings, white tail band, enormous yellow-orange beak and casque, lightning-blue edge highlights. Left to right columns for every row: idle ready; moving stride or wingbeat; distinct compressed crouch or drawn-back wings in anticipation; lunging or spreading out on attack release. Preserve identity, pose scale and palette across each row. All face screen right. Same ground pivot (bottom center) within each cell. No accessory effects, no extra objects, no ground shadows, no text, no numbering, no grid lines, no borders, no gore. Clean 12% gutters so individual sprites can be cut. Silhouettes readable at 64px in game.
```


## Stage boss escort animation

`malaysia-boss-escorts.webp` contains sixteen original frames generated with the built-in ImageGen tool. Rows show Kompang Husk, Bubu Snapjaw, Getah Binder, and Beca Revenant. Columns show idle, travel, anticipation, and release. Alpha bounds were repacked into 224 px cells with a shared ground pivot.

The prompt used `malaysia-hunting-monsters.webp` as a style reference.

```text
One transparent 4×4 square atlas of four original Malaysian environment monsters, 16 fully isolated game sprites. The supplied image is for painted style only. Match the crisp illustrated dark fantasy 2.5D sprite style, warm edge light and slightly elevated three-quarter camera, facing screen right. Each row keeps exactly the same body and scale. Row 1: KOM PANG HUSK, a living wooden kompang frame drum, broad round laced ivory drumhead ringed with dark reddish timber, squat bark legs and thick knots for arms, bright yellow eyes on the rim, no person and no symbols or text. Row 2: BUBU SNAPJAW, a snub-nosed funnel-shaped woven cylindrical bamboo Malaysian fish trap monster, bent slats as jaws, four blue-green tidal claws, blue light in woven gaps, no fish. Row 3: GETAH BINDER, gnarled rubber-tree stump creature with split root hands, tapering branches with a few broad oval leaves, spiral tapping groove filled with luminous milky white latex and a hooked dented tin tapping cup, purple spirit light from its split bark. Row 4: BECA REVENANT, a haunted old Malaysian pedal trishaw with distinctive large wheel and woven front passenger seat under a crimson-and-gold scalloped fabric canopy, wooden frame and brass spokes, spectral legs of smoke in place of a rider, no person. Left to right columns for each row: idle ready, moving stride or rolling, visibly coiled or rearing anticipation, powerful forward strike or fling release. Every monster fits completely within its own square cell with generous transparent gutters. Same bottom-center pivot for all frames. No separate effects, floating sparks, ground shadow, background, text, borders, symbols, or gore. Real alpha transparency.
```


## Wave specialist animation

`malaysia-wave-monsters.webp` contains sixteen original poses generated with the built-in ImageGen tool. Rows show Tenggiling Roller, Gua Kelawar, Biawak Arus, and Dusun Beruk. Columns show idle, travel, anticipation, and release. Alpha bounds were repacked into 224 px cells with a shared ground pivot. The pangolin release frame rotates around its center during Iron Roll.

The prompt used `malaysia-hunting-monsters.webp` as a style reference.

```text
Production atlas of four original Malaysian wildlife-inspired fantasy enemies. Exactly 4 columns x 4 rows, 16 separate sprites on real transparent background. Reference image is style only. Match a detailed hand-painted dark fantasy game, slightly elevated three-quarter view and warm edge light. Screen-right facing. Each row is the same character and scale across four poses: idle, travel, anticipation, attack release. Row 1: Tenggiling Roller, a stout Sunda pangolin spirit with large warm brass-brown overlapping scales, powerful curled tail and tapered muzzle; attack pose tightly curls into a near-round rolling armored ball. Row 2: Gua Kelawar, Malaysian limestone cave bat spirit with deep violet-black membranes, jagged silver wing edges and glowing lavender ears and eyes; pose changes show clear folded, flying, drawn back and spread wings, no shadow or projectiles. Row 3: Biawak Arus, a long Malaysian water monitor spirit with blue-grey speckled scales, turquoise dorsal ripples, golden throat and a streaming thick tail; attack pose snaps forward. Row 4: Dusun Beruk, a stocky Malaysian pig-tailed macaque spirit with charcoal grey-brown fur, red flushed nose, amber eyes, orchard leaves around the shoulders, a small spiked green durian held in one hand; throw pose follows through. Keep all characters fully within their own square cell with transparent gutters and the same bottom-center ground pivot. No scenery, cast shadows, detached effects, text, border, grid, logos, or gore.
```


## Regional rare enemy atlas

`malaysia-night-foes.webp` contains 21 original painted cutouts generated with the built-in ImageGen tool. Three 4×2 sheets were packed in order into a 4×6 atlas of 192 px cells. Frames use a common ground pivot. The Three.js renderer supplies procedural travel, cast, and recovery poses.

The three prompts used `malaysia-boss-escorts.webp` for painted style and elevated perspective. Each requested a transparent 4-column × 2-row sheet of isolated sprites facing screen right, with transparent gutters and a bottom-center pivot. The prompts asked for bold silhouettes at 60 px, warm rim light, saturated accents, and painterly shadows. The character prompts were:

```text
Sheet 1: Top row left to right: cracked charcoal satay brazier creature glowing red (1), antique brass gong with a loose purple spirit inside (2), split faceted tin ore golem with blue glints (3), ragged ivory burial cloth spirit standing (4). Bottom row left to right: giant maroon pitcher plant creature with long bent leaves (5), burned-out bronze oil lamp creature and charcoal smoke (6), ink-black civet spirit draped in mist (7), enormous blue-green clam shell on stumpy stone legs (8).

Sheet 2: Top row left to right: brass shallow panning tray mimic full of little turquoise and gold stones on short feet (1), red-sapped dragon-blood tree stump creature (2), olive green venomous pit viper spirit with triangular head (3), purple forest spirit with inky flowing batik ribbons (4). Bottom row left to right: tangled jungle rattan creeper ball with thorny tendrils (5), crooked weathered wood face spirit with fringed woven indigo shoulders (6), spiky reddish durian-husk armored creature (7), rainbow-hued angular limestone beetle (8).

Sheet 3: Top row left to right: smoke-black storm cloud spirit curled around blue lightning (1), bright pearl-white floating moon kite spirit with a diamond silhouette and forked tail (2), copper orangutan-shaped ember spirit with red-gold fire seams (3), silver-blue Cameron Highlands mist fox spirit with a plume of pale fog (4). Bottom row first cell: a turquoise spectral macaque double with electric cyan edges (5). Leave the last three cells completely empty alpha.
```

The first sheet received a background-removal pass preserving its characters, cell positions, and layout.


## Stage scene props

`stage-scene-props.webp` contains sixteen original painted props generated with the built-in ImageGen tool. The cutouts were packed into 256 px cells with a shared bottom pivot and transparent gutters.

```text
Stylized game asset, one transparent PNG sprite atlas for a Malaysian 2.5D survival RPG. STRICT 4 columns x 4 rows equally divided into 16 cells. Each individual cutout centered in its cell, never crosses cell bounds, a generous transparent gutter around every prop. All seen from same elevated three-quarter frontal view at 45 degrees, detailed painterly realistic illustration, readable silhouette, daylight with warm rim light and dark jade shadows, no pixels or line art. No cast shadows, no models of ground, transparent background, no text. Cell order exactly left to right: row 1 clay pots and pandan basket; hawker cart with faded striped awning; wooden rack of hanging batik cloth; stack of wood tea crates and burlap sacks. Row 2 open low basket of pottery bowls and crockery; wheelbarrow of pale limestone and mining tools; low wooden tea table with stools; stack of rice sacks with woven winnowing tray. Row 3 narrow traditional wooden sampan (end to end at slight diagonal, no water); fishing net on a timber drying rack; boat ribs on low sawhorses in a shipyard; stacked rope coils with net floats. Row 4 colorful crescent wau kites leaned on a bamboo display stand; small mangrove seedling nursery rack with three pots; stone planter with leafy flowering plants; timber roadside market sign with small amber glass lamp and no writing. Leave the background truly transparent.
```
