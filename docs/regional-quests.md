# Regional quests

Approach a local civilian and choose **Start encounter** in the encounter prompt. Gold marks the civilian. The green ground marker names the current action and destination. During a fight it follows the targeted ghost. Active quests take priority on the minimap. The map’s destination picker also lets you route to a discovered quest before starting it.

| Stage | Where to start | What to do | Reward |
| --- | --- | --- | --- |
| Johor | Traveller at the abandoned market | Defeat six captors, free the traveller, clear the bridge ambush and accompany them to Market bridge. | Weapon choice |
| Melaka | Quay clerk at Dataran Bata Merah | Recover the manifest from ghosts at Old River Quay and file it at Stadthuys Steps. | Quay Seal, relic |
| Kuala Lumpur | Hawker at Medan Selera | Deliver the first packets to Central Market Lane and supper to Monorail Depot. | Tiffin Carrier, charm |
| Selangor | Harbour clerk at Textile Lane | Collect the ferry ledger, clear the loading court at Old Quay Warehouse and return the ledger. | Harbour Token, relic |
| Perak | Assayer at Dredge Landing | Pan at Blue Tailings Pond, clear the assay bench at Tanjung Tualang Dredge and weigh the concentrate. | Assayer’s Mallet, weapon |
| Pulau Pinang | Fisher at Chew Jetty Landing | Accompany the fisher to the winch, lower the gangway if raised, then cross together to Fishing Platform. | Jetty Rope Bracelet, charm |
| Kedah | Irrigation keeper at Jelapang Granary | Read the gauge at Pintu Air and set the inlet at Irrigation Fields. | Padi Sheaf, charm |
| Pahang | Nursery keeper at Pangkalan Nipah | Collect seedlings at Mangrove Nursery and plant them at Nipah Canopy Walk. | Nipah Leaf Braid, charm |
| Terengganu | Boatbuilder at Duyong Boat Yard | Collect the roller at Cengal Working Shed, clear Duyong Outer Slipway and launch the boat. | Cengal Mallet, weapon |
| Kelantan | Kite maker at Pasar Wau | Rig the wau at Wau Workshop and launch it using the reel at Padang Layang Lookout. | Wau Line Spool, relic |

Stay within 290 world units of a travelling companion. If you get ahead, **Regroup** points back to them. Return and they resume walking. At a handoff, use the encounter’s action button. The winch and wau reel have their own controls.

Completing a regional quest offers its named item alongside two ordinary items from the same slot. Choose one or skip. Quest progress and equipment last for the current run. Johor also offers Lantern Ward and Thorn Hunt.

## Browser acceptance

Open the Docker development server at `/tests/regional-quests.html` and select **Run quest checks**. The harness starts a real campaign in every stage, stages player positions, and removes quest enemies through the runtime kill method. Escort movement, regrouping, quest transitions, winch operation, wau flight and reward selection use the live simulation and HTML controls.

[Cross-stage progression report](evidence/regional-quests/progression.json)

| Scene | Browser capture |
| --- | --- |
| The traveller waits while the bridge ambushers close in | [Johor bridge ambush](screenshots/johor-bridge-ambush.webp) |
| The fisher crosses the lowered gangway | [Chew Jetty escort](screenshots/penang-fisher-escort.webp) |
| The illustrated seedling bundle marks the planting site | [Nipah Canopy Walk](screenshots/pahang-planting-destination.webp) |
| The hawker gives directions at Medan Selera | [Hawker Delivery at 390 CSS pixels](screenshots/kl-hawker-mobile.webp) |

At 390 × 844 CSS pixels, Enter starts the encounter from its focused button and a tap completes the delivery handoff. The encounter tracker and the winch or reel share a scrollable column so both controls remain reachable. The browser check also exercised a reduced-motion escort and a tap on the winch.

The 20 November 2026 Chromium run passed all 115 quest checks, 479 stage-world checks, 163 rescue checks, 208 ward checks, 223 hunt checks, 12 combined equipment checks and 834 UI smoke checks. Docker lint, typecheck and production build passed. [UI smoke report](evidence/regional-quests/ui-smoke.json)
