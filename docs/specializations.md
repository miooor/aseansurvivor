# Ability specializations

At the level 3 blessing in a campaign, the first two cards offer paths for one of the survivor’s skills. The third card gives an ordinary blessing and brings both paths back at the next level. Press a card’s number, focus and activate it with the keyboard, or tap it. The skill button displays the selected path for the rest of the run. Retry starts with the base skill. Practice uses the base kit. Paths cost one blessing and use no coins or save fields.

## Controlled encounter results

Run the development server with Docker Compose. In a fresh browser profile, open [/tests/specializations.html](../tests/specializations.html) and select **Run encounters**. The fixture uses real rank-one campaign casts, 1,000-HP stationary pocong with a four-unit test radius, fixed aim, no critical hits and no automatic casts. Each result cell lists the two measurements in the order shown. Damage is in HP, distances in world units and knockback in initial velocity units. The delayed trials advance the simulation in 50 ms steps.

| Hero and ability | Two measurements | Base | First path | Second path |
|---|---|---|---|---|
| Ustaz Fadli · Seruan | Stun seconds at 80 / damage at 250 | 1 / 0 | Steady Lantern 1.5 / 0 | Beacon Circle 0.6 / 15 |
| Mat Rempit “Kama” · Ekzos Panas | One patch’s damage at its centre from 2.5–3 s / damage 32 units to the side in the first 0.5 s | 0 / 0 | Long Fuse 11 / 0 | Flared Pipe 0 / 11 |
| Nok · Ember Teep | Damage 270 units ahead / damage 53 units to the side at 90 ahead | 0 / 0 | Long Teep 48 / 0 | Square Teep 0 / 32 |
| Cô Lan · Flood the Stage | Slow seconds at 80 / damage at 265 | 3 / 0 | Deep Current 5 / 0 | Lake Swell 1.8 / 14 |
| Sari · Silat Palm Guard | Guard still active at 2.8 s (1 = yes) / damage per initial contact counter | 0 / 40 | Patient Guard 1 / 28 | Snap Counter 0 / 60 |
| Asha Lim · Last Call Tickets | Live tickets at 7 s / arrival damage at 126 from stamp centre | 0 / 0 | Reserved Tickets 1 / 0 | Open Counter 0 / 24 |
| Mira Reyes · Deck Brace | HP saved against a 20-damage projectile at 3.5 s / opening shove | 0 / 180 | Held Brace 5 / 100 | Hard Shove 0 / 300 |
| Dani Rahman · Homeward Beacon | Arrival damage at 50 / at 137 | 18 / 0 | Beacon Core 28 / 0 | Beacon Halo 12 / 12 |
| Vanna · Crosscut Bloom | Crossing damage at 145 / ordinary pulse damage at 45 | 60 / 20 | Tight Knot 85 / 12 | Loose Weave 36 / 30 |
| Keo · Held Breath | Stun seconds / pulse damage on a fresh measure | 0.8 / 18 | Fermata 1.4 / 12 | Sharp Accent 0.4 / 28 |
| Nadi · Three-Seal Bloom | Impact damage 218 ahead / 48 ahead | 0 / 50 | Outer Seals 50 / 0 | Close Seals 0 / 50 |
| Lia Soares · Courier Lane | Damage at 285 / shove at 70 | 0 / 160 | Express Lane 28 / 100 | Clearing Lane 0 / 260 |

The Kama test isolates one deposited patch, normalizes its tick phase and stops further emission. On a moving bike, the longer patch lifetime increases the distance of road left burning behind Kama. The emission duration still follows skill rank. Nok’s sweet spot tracks the chosen reach, and Nadi’s delayed impacts use each disc’s cast-time position and radius. Vanna’s test forms a real crossing with Q and E before measuring F.

The browser checks also cover deferring the offer, selecting by number or button, preventing a second path, retrying, and entering practice. A repeat using an existing v1-format save with 173 coins, three owned heroes and a Johor clear preserved its serialized value. Desktop keyboard and emulated phone touch selections were verified in Chromium.

These automated comparisons establish which tactics each path favors in controlled encounters. Full-run win rates, equipment combinations, evolved-skill performance and player preference remain unmeasured. No human playtest was performed.

[Keyboard capture](screenshots/specialization-keyboard.png) · [Touch capture](screenshots/specialization-touch.png)
