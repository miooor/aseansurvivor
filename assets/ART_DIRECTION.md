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

`regional-surfaces.webp` is an original image-generated 2×2 terrain atlas. The quadrants contain Melaka quay tiles, Perak limestone scree, Penang shell sand and Kedah rice stubble. Each stage samples a separate tile so repeating terrain cannot bleed into a neighbouring region. Kuala Lumpur uses procedural asphalt and paving. Regional civic structures, workshops, and hero spell geometry are authored locally.

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

`roster-skill-icons.webp` packs 35 original ability icons assembled from seven sheets made with the built-in imagegen tool. Mira’s current five rescue icons use the dedicated `mira-rescue-icons.svg` strip in the picker and HUD. Atlas rows follow Asha, Mira, Dani, Vanna, Keo, Nadi, and Lia. Columns follow basic attack, Q, E, F, and R. Each tile is 128 × 128. The lobby shows all five columns and the combat HUD uses Q through R.

The eleven local country flag images under `flags/` come from [Flagpedia](https://flagpedia.net/about). The lobby wheel and upgrade shop show the active survivor’s flag behind their sprite at 30% opacity.

### Ability icon prompts

The shared prompt used the palette and ordered tile subjects for each survivor below.

```text
Original hand-painted fantasy action RPG ability icons. One PERFECT REGULAR EDGE-TO-EDGE 3-column by 2-row sprite atlas, landscape 3:2 ratio. Exactly six equal SQUARE tiles. Straight divisions precisely at 1/3 and 2/3 width and 1/2 height. No gutters, no border around the whole sheet, no gaps, no text, lettering, keys, numerals, portraits, mockup, or watermark. Each tile has its own opaque, nearly black color-tinted background. Use luminous contrasting paint, light scattering and clean bold central silhouettes readable shrunk to 36×36, akin to hand-painted fantasy RPG inventory art, no imitation of specific game assets. Main objects stay generously within their own squares, at least 10% away from every edge; flat square-on icon artwork. Shared palette [palette]. The six tiles are read left-to-right across top row and then left-to-right across bottom row. In STRICT EXACT order, tile 1 through 5 are these five different coherent subjects separated by semicolons: [tile subjects]. Bottom-right tile 6 is a nearly black flat empty square.
```

- **asha** uses amber, warm gold, a little jade. Tiles show a single cream paper dispatch ticket with bright motion trail → a brass stamp landing on three paper tickets → three ticket stubs drawn off a rail into little flashes → an open palm with a broad radial push wave → a hovering brass service bell above a glowing circular field.
- **mira** uses marine blue, seafoam and brass. Read the five actions as a boathook tap, a hooked line, a circular sweep, a braced shield and one white-capped breaker.
- **dani** uses sea-glass green, moss jade and honey brass. Tiles show a small hooked bronze light streaking forward → three bold horizontal seawall shove streaks over a dock edge → one lit mooring lantern planted on a timber pier with a small light ring → a sturdy boot stepping down into a circular aqua shockwave with a translucent guard → a sheltered dock under a green wave dome.
- **vanna** uses rose, mulberry, amber and a little violet. Tiles show a brass weaving shuttle firing a magenta spark → one luminous strip of tightly woven warp threads extending straight into depth → a golden shuttle passing sideways across a broad pink ribbon of weft → two crossing ribbons erupting upward into an angular bright pink star → a broad woven textile screen unfurling into a glowing rose barrier.
- **keo** uses reed green, pale chartreuse, turquoise, antique gold. Tiles show a bundle of bamboo reed pipes puffing a single pearl of green air → one broad fan-shaped bass sound wave from a reed pipe → three bright parallel thin air bolts through a dark background → an isolated wide circular resonant wave surrounding a small pause-like pair of vertical reeds → four nested standing waves with a central flare.
- **nadi** uses copper, vermilion, amber and warm ivory. Tiles show one wooden lacquer brush flicking a single bright copper droplet → a long sharp lacquer peel curling off a stripe of illuminated material → one shallow glossy orange lacquer disc with a brush laying a swirl on it → a flattened orange ripple shoving a few dark fragments outward → exactly three orange lacquer discs in a triangular arrangement viewed from above.
- **lia** uses warm yellow, coral and rich ultramarine accents. Tiles show one wooden weaving shuttle with a gold return arc → a strong outward amber horizontal streak carving a path through fragments → one diagonal grounded dash trail with three trailing thread spools → three small separate spools swept inward by curved gold lines → three wooden shuttles fanning outward on three golden curved trails.

### Lia, Nadi and Vanna

Lia’s forward lean, split red cape and diagonally strapped dispatch case identify her at running speed. Timorese marathoner Aguida Amaral inspired the emphasis on endurance and economy of movement. Lia’s parcel throw, dash and recall bell belong to her fictional courier role. [International Olympic Committee](https://www.olympics.com/cio/timor-leste)

Nadi is an older workshop master with a broad, planted stance, silver bun, spectacles and jade longyi. Myanmar writer and publisher Ludu Daw Amar inspired the decision to portray an elder practitioner. Nadi’s brush, lacquer tins and bellows come from her own kit. [Reporters Without Borders](https://rsf.org/en/reporters-without-borders-pays-tribute-burmese-journalist-and-writer-ludu-daw-amar)

Vanna carries her two shuttles apart so the magenta thread forms a visible arc against her peacock-blue and ivory wrap. The Khmer classical dance tradition preserved by Princess Norodom Buppha Devi informed the controlled wrists and upright posture. The weaving gestures were designed for Vanna’s four textile skills. [Interview and dedication to Buppha Devi](https://www.nkfc.org/wp-content/uploads/2021/02/Paul-Cravath-Cambodian-Dancers-NKFC-Preview-Dedication-HRH-Buppha-Devi-Cravath-Interview.pdf) · [UNESCO](https://ich.unesco.org/en/RL/royal-ballet-of-cambodia-00060?RL=00060)

Each of the three has two transparent 8×8 WebP sheets with 320 × 192 px cells and feet aligned at y=180. Movement and basics occupy four rows each. Skill rows are Q/E/F/R windup and release pairs. Motion frame 58 supplies each lineup portrait. Review the eight directions on the animation gallery.

### The remaining nine survivors

| Survivor | Readable shape and gesture | Reference |
| --- | --- | --- |
| Fadli | Cream tunic over a green-and-gold waist cloth. His lantern and beads move in arcs around an upright body. | [Malaysian songket](https://ich.unesco.org/en/RL/songket-01505) |
| Kama | Yellow helmet above a red underbone motorcycle. The wheelie lifts his silhouette while his ultimate flattens it across the bike. | [Malaysian Cub Prix](https://www.petronas.com/motorsports/malaysian-cub-prix) |
| Nok | Compact red-wrapped boxer. Her high guard opens into a long teep and folds back into a tight elbow. | Muay Thai |
| Cô Lan | A broad green hat sits above a small lacquered puppet. The rod lets the dragon strike beyond her reach. | [Vietnamese water puppetry](https://vietnam.travel/things-to-do/vietnam-water-puppets/) |
| Sari | A purple-and-gold trailing sash follows a low centre of gravity. Her open guard and wide kick make distinct shapes. | [Indonesian pencak silat](https://ich.unesco.org/en/RL/traditions-of-pencak-silat-01391) |
| Asha | A pale knotted headscarf and brick-red apron give the dispatcher a compact outline. Her quick ticket flick contrasts with a two-armed clearing sweep. | Singapore hawker service |
| Mira | A dark headwrap and diagonal boathook frame the runner’s wide stance. She shifts her weight backwards to take the strain of her line. | Philippine waterfront work |
| Dani | The keeper’s boxy pack carries weight high on his back. He lowers his lantern to plant a beacon and lifts it to establish shelter. | [Brunei’s Kampong Ayer](https://www.bruneitourism.com/places/kampong-ayer/) |
| Keo | The bamboo pipes rise above the musician’s head. He tilts into the low notes and straightens for the sustained performance. | [Lao khaen music](https://ich.unesco.org/en/RL/music-of-the-khaen-01296) |

These nine painted characters use 240 × 144 px cells with feet at y=135. Motion rows 0–3 cycle locomotion and rows 4–7 play the basic attack, ending in the idle stance. Skill rows pair preparation and release for Q, E, F and R. The same foot anchor and aspect ratio work with Lia, Nadi and Vanna’s larger cells.

## Malaysian campaign sprite atlases

The terrain is 3D and the actors and scenery are illustrated billboards with ground anchors and projected shadows. Each new atlas uses a 3×3 grid of 256 px transparent cells. The stage order is Johor, Melaka, Kuala Lumpur, Perak, Pulau Pinang, Kedah, Pahang, Terengganu and Kelantan.

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
