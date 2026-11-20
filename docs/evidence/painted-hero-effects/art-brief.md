# Hero effect flipbooks

The built-in ImageGen tool illustrated these effects for the local twelve-hero roster. The review sheet shows the decoded assets at 64 px per cell next to each hero’s gameplay motion texture. The packed lossless RGBA WebPs use 160 px square cells, four columns and five rows, with a centered pivot and transparent gutters.

## Illustration brief

Paint a four-frame strip for each skill. Start with a compact windup, unfold the material on release, show the full silhouette at peak, and leave broken or fading remnants. Face directional effects to the right. Use the actors’ elevated three-quarter view, warm upper-left brush highlights, deep local-colour shadows and matte surfaces. Keep the backdrop transparent and the edges readable at gameplay zoom. Omit lettering, scripture and scenery.

| Hero | Basic | Q | E | F | R |
|---|---|---|---|---|---|
| Ustaz | Folded dawn ember | Fan of ochre rays | Orbiting carved beads | Brass lantern wave | Golden petal shelter |
| Rempit | Worn steel spanner | Curving tread impressions | Cinder exhaust | Backfire petals | Twin racing slipstreams |
| Nok | Knot of hand-wrap linen | Heel-shaped ember thrust | Turning elbow crescent | Braided cotton armband | Burst of landing rubble |
| Lan | Articulated lacquered fish | Carved dragon bow wave | One wooden spear bearer per guard | Lake breaker | Rain-struck puppet pennants |
| Sari | Wavy silver kris | Plum and gold kick crescent | Striped tiger afterimage | Batik-framed palm | Descending Garuda feathers |
| Asha | Folded order slip | Clipped red tickets | Curling receipt | Fan of paper and apron pleats | Striped stall canopy |
| Mira | Boathook splash | Uncoiling rescue line | Circular harbour sweep | Knotted fender and spray | Single rightward breaker |
| Dani | Flying green beacon spark | Breakwater timber | Standing green lantern | Arc of rope fenders | Shelter of jetty lanterns |
| Vanna | Rosewood loom shuttle | Parallel warp | Stepped weft | Cut silk crossknot | Interlaced thread canopy |
| Keo | Flying reed | Fanned bamboo sound waves | One sound tongue per parallel bolt | Hollow breath spiral | Four reed-pipe echoes |
| Nadi | Cinnabar resin flick | Curling lacquer peel | Wet amber pool | Ochre kiln breath | One lacquer seal per delayed landing |
| Lia | Wrapped shuttle parcel | Straight cord and pennant | Rolling yarn bobbin | Brass recall bell | One parcel per diverging courier shuttle |

Run `python3 tests/hero-effect-sprites.py` with Pillow to decode and check all packaged cells. The automated check compares normalized alpha silhouettes. The actor contact sheet predates the isolation of individual carriers for Lan E, Keo E, Nadi R and Lia R. It records the visual review of materials, facing and slot order.
