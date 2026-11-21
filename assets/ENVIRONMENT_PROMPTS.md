# Environment artwork prompts

Built-in ImageGen generated the final workspace assets. Original rasters are retained; WebP export changes colour encoding only and preserves dimensions and alpha exactly.

## Terrain atlas — assets/world-terrain.png

Use case: stylized-concept.
Asset type: production terrain texture atlas for ASEAN Survivor, a top-down 2D Malaysian kampung fantasy action game, rendered with small illustrated anime heroes.
Create ONE landscape 3:2 image with EXACTLY THREE equal-width columns and TWO equal-height rows, six perfectly aligned square cells. No gutters, no border, no captions, no text. Each cell is a DIFFERENT reusable terrain asset, NOT a scene or collage of concepts:
Top left: an edge-to-edge seamless tiling tropical meadow floor, low jade/olive green grass and tiny natural ground cover on softly mottled soil. Uniform scale and brightness, organic fine detail, no stripes, no checkerboard, no diagonal bands, no large bare patches, no lighting gradient. Fully opaque square to all four edges.
Top middle: one elongated north-south worn kampung dirt-road PATCH, light warm compacted earth, tiny pebbles and faint worn wheel tracks, very irregular softly feathered grassy side margins, softly tapered ends. Centered, generous transparent corner space, no rectangular slab or solid background. Will be overlapped and rotated to form winding paths; road is broad enough for two walking heroes.
Top right: an edge-to-edge seamless tropical river-water texture, muted turquoise/deep jade water, delicate directional ripples, a few pale specular strokes, gentle variation and depth, no shoreline, no land, no foam border, no giant waves. Fully opaque square, tiles in both axes.
Bottom left: a small organic rice-paddy PATCH seen overhead, slender lush rice seedlings in gently curved cultivated rows, shallow reflective dark jade water and warm muddy narrow earthen embankments, irregular rounded/terraced edges with small grasses. A hand-painted rural rice garden rather than a geometric rectangle. Fully transparent outside its irregular silhouette. No black ground shadow.
Bottom middle: an edge-to-edge seamless weathered timber boardwalk-deck texture, warm natural wood planks, grain and subtle nail details, orthographic overhead, no perspective vanishing point, no rails, no water, no outer framing. Fully opaque square. Will texture the existing bridges and jetties.
Bottom right: an edge-to-edge seamless old Malaysian town cobblestone/aged paving texture, subtle warm grey stone blocks with little moss in joints, varied natural uneven stone edges, no grid lines or giant tiles, quiet low contrast. Fully opaque square.
Style: polished hand-painted 2D fantasy game environment art with organic material detail, coordinated soft natural colours; gently elevated overhead camera but all textures remain flat, reusable and free of cast shadows. Light from upper left is very subtle and diffuse. Keep material patterns understated so enemies and attack telegraphs remain readable.
Critical: preserve exact 3-column by 2-row square-cell arrangement; road and paddy cells have genuine transparency outside their organic painted shapes; the other four cells must be fully opaque and fill their cells. No characters, buildings, UI, writing, logos, large stones, trees, hard rectangular field borders, visible grid guides, baked circular shadows or diamond patterns.

## Atlas alpha correction

Edit target: the attached 1536x1024 six-cell game terrain atlas. Preserve the SAME exact painting, 3-column by 2-row layout, cell boundaries, all material details and palette.
Fix ONLY opacity and cutouts. The road in top-middle and rice-paddy in bottom-left currently have white backgrounds. REMOVE ALL white/near-white background around those TWO painted silhouettes and make it FULLY TRANSPARENT (alpha 0), including the corners. Preserve the natural grassy silhouette and clean soft antialiased edges; no glow, no ground shadow, no rectangular white plate. Do not erase beige dirt inside the road.
The other FOUR cells (top-left grass, top-right water, bottom-middle wood, bottom-right cobblestone) must be FULLY OPAQUE edge-to-edge (alpha 255). They are usable square tiles, not semi-transparent.
This is a production alpha correction, not a redesign. No extra white canvas, no border, no checkerboard baked into pixels. Keep every item in the same cell, exact original dimensions and 3x2 arrangement.

## Meadow ground — assets/world-ground.png

Use case: stylized-concept. Asset type: ONE fully opaque seamless ground texture for a top-down Malaysian kampung fantasy game.
Create a square image filled edge to edge with softly mottled jade/olive meadow grass, fine small tropical grass blades, tiny low ferns and occasional tiny leaf litter on natural dark earth. Polished hand-painted 2D game environment art. Very understated fine detail, uniform scale, uniform diffuse lighting and colour across the whole square; readable calm floor behind small animated heroes.
CRITICAL: genuinely seamless texture tiling left-to-right AND top-to-bottom; opposite borders match. No vignette, no border darkening or transparent edges, no checkerboard, no diagonal stripes, no diamond shapes, no geometric plots or large repeated clumps, no paths or big empty soil patches, no trees, buildings, rocks, characters, cast shadows, writing or UI. Fully opaque all the way to every pixel at all four image edges. This is a reusable ground material, not a landscape with a horizon.
