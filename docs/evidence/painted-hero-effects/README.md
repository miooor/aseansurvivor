# Illustrated casts in gameplay

All 60 slots passed in normal and reduced motion on the desktop keyboard path and again at phone width on the touch path. The 12 production launches also passed. These runs used the actual WebGL battlefield, authored WebPs and combat handlers. [Cast measurements](casts.csv)

## Matched scenes

Each sheet has five rows in Basic, Q, E, F, R order. Read across for the pre-effect battlefield at `7341ddc`, the integrated normal-motion build, then the integrated reduced-motion build. Open a sheet at 100% for gameplay scale.

| | | |
|---|---|---|
| [Hakim](ustaz.webp) | [Jet](rempit.webp) | [Nok](nok.webp) |
| [Lan](lan.webp) | [Sari](sari.webp) | [Asha](asha.webp) |
| [Mira](mira.webp) | [Dani](dani.webp) | [Vanna](vanna.webp) |
| [Keo](keo.webp) | [Nadi](nadi.webp) | [Lia](lia.webp) |

The baseline ran from a local Git archive in its own Compose project. Each build started a fresh Johor encounter with the same seed, three stationary high-HP targets, eastward aim, rank-one skills, full ultimate charge and zero critical chance. Basic attacks fired automatically. Active skills used the keyboard handler. The scene advanced in 40 ms steps, three for basics and six for active skills, including hit-stop. The harness froze the last frame and removed camera shake for registration. Each 460 × 262 panel is a crop of a 1280 × 800 battlefield at one CSS pixel per output pixel. The crop omits the HUD and clips some distant or high arcs.

All 60 sampling times and all three target damage totals matched across the three builds/modes. The CSV records those shared values and every submitted atlas frame in draw order. Frames are zero-based and each row has four cells. Every integrated sample submitted the expected skill row from the expected decoded texture. Every reduced-motion submission used the third cell. Actual carriers continued to move and hit targets.

## What changed after inspecting the battlefield

- Keo's three bolts, Lia's three parcels and Nadi's three discs each repeated a grouped illustration on every carrier. Isolating one authored motif per frame and removing the extra caster copy made the positions and count readable. Nadi's smaller seals hover above their warning circles, then spread to the measured radius on contact.
- Hakim, Nok, Sari, Mira and Keo displayed several disconnected copies of a single directed gesture. One sweep now starts beside the casting pose. Sari retains the reverse half of her all-around stance. Wide fans lie on the terrain so the ground cannot cut off their lower edge.
- Hakim's large shelter petal blurred across the paving and lacked a visible boundary at its actual radius. A smaller centre illustration and a persistent floor outline separate the art from the gameplay boundary.
- The old smoke assertion inferred skill identity from triangle counts in the previous renderer. It now verifies the actual submitted skill row on consecutive fresh runs.

## Phases, depth and controls

The phase checks followed live positions and rendered instances in both motion modes. Lan's fish, Sari's kris and Lia's basic parcel reversed and expired. Lia's F turned all three dispatch parcels immediately. Lan's evolved dragon reversed its direction. [Returning projectiles](returns.webp)

Vanna's two strips persisted through the first canopy tick and disappeared after Crosscut. The field cleared at expiry. Mira's crest followed its advancing damage front. Her hit used the struck actor's foot depth, and the contact and crest held their frame and position during pause. Nadi's level-three choices placed three radius-65 discs at distance 175 or three radius-88 discs at distance 85. Each produced a floor contact at its own centre. [Fields and contacts](fields.webp)

In the 18-enemy Vanna encounter, foreground ghosts occlude the weave, both strip edges remain visible through the canopy and the hero's head and health bar stay readable. Damage numbers overlap around the crossing. The discovery banner covers the upper part of the battlefield. Small ochre and green projectiles have less contrast against Johor stone than Mira's white water. [Normal crowd](crowd-normal.webp) · [Reduced-motion crowd](crowd-reduced.webp)

A separate 390 × 844 Chromium touch context tapped Q/E/F/R on their real HUD buttons for every hero in both motion modes. The basic fired automatically in all 24 phone basic trials across the two passes. A phone practice run also primed Mira's hook and completed Haul In with a second tap. [Touch practice](touch.webp) · [Mira's 36 checks](mira-harbor.txt)

Both level-three specialization paths and the base kit passed their tactical encounters for all 12 heroes. Each results line gives the two encounter measurements for base, first and second path. The specialization harness also checked defer, retry, practice isolation and save preservation. [Specialization results](specializations.txt)

## Build and lifecycle

- Lint, TypeScript, Vite production build, 65 Node tests and the Pillow checks for all 240 atlas cells passed. All 12 hashed production sheets matched their source WebPs byte for byte. In Vite preview, each hero launched from the picker, accepted the keyboard Q input, paused and returned to the menu. Chromium observed all 12 hashed sheet URLs.
- For each displayed hero, returning to the menu detached the effect batch and disposed its Three.js geometry, material and texture. Switching away evicted the previous non-core hero's decoded effect sheet. The original heroes retain their boot-time CPU images.
- The UI harness passed 964 checks and downloaded its report. Stage-worlds passed 754 checks. [UI report](ui-smoke.json) · [Stage report](stage-worlds.json)

## Run locally

From the repository root, run `docker compose up -d` and open [the combat demo](http://localhost:5173/tests/combat-effects.html). Select a hero, skill and moment, then choose **Preview skill + critical hits**. The demo can also resume the battlefield. For the measured encounters, open [the development game](http://localhost:5173/) in a fresh browser profile and run the following in its console. Repeat after setting the browser's reduced-motion media preference.

```js
const checks = await import('/tests/painted-battle.js');
console.table(await checks.checkPaintedBattle());
console.log(await checks.checkPaintedPhases());
```

For a matched baseline capture, extract `git archive 7341ddc` into a temporary directory and copy only `tests/painted-battle.js` from this revision into its tests directory. Serve it with its own Compose project and port. The same `sampleCast(id, slot, {baseline: true, capture})` callback receives the just-rendered baseline canvas. On the integrated checkout use `sampleCast(id, slot, {capture})`.

The runs used Chromium 158 software WebGL and emulated touch. They sampled the specified phases and one staged crowd. Physical devices, Safari/Firefox, sustained GPU memory use, frame time, every enemy density and every equipment/evolution combination were outside these measurements.
