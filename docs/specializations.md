# Ability specializations

At the level 3 blessing in a campaign, the first two cards offer paths for one of the survivor’s skills. The third card gives an ordinary blessing and brings both paths back at the next level. Press a card’s number, focus and activate it with the keyboard, or tap it. The skill button displays the selected path for the rest of the run. Retry starts with the base skill. Practice uses the base kit. Paths cost one blessing and use no coins or save fields.

## Controlled encounter results

Run the development server with Docker Compose. In a fresh browser profile, open [/tests/specializations.html](../tests/specializations.html) and select **Run encounters**. The fixture uses real rank-one campaign casts, 1,000-HP stationary pocong with a four-unit test radius, fixed aim, with critical hits, elemental modifiers and automatic casts disabled. Each result cell lists the two measurements in the order shown. Damage is in HP, distances in world units and knockback in initial velocity units. The delayed trials advance the simulation in 50 ms steps.

| Hero and ability | Two measurements | Base | First path | Second path |
|---|---|---|---|---|
| Ustaz Fadli · Seruan | Stun seconds at 80 / damage at 250 | 1 / 0 | Steady Lantern 1.5 / 0 | Beacon Circle 0.6 / 15 |
| Mat Rempit “Kama” · Ekzos Panas | One patch’s damage at its centre from 2.5–3 s / damage 32 units to the side in the first 0.5 s | 0 / 0 | Long Fuse 11 / 0 | Flared Pipe 0 / 11 |
| Nok · Ember Flying Knee | Damage 270 units ahead / damage 65 units to the side at 16 ahead | 0 / 0 | Long Knee 81 / 0 | Sweeping Knee 0 / 54 |
| Cô Lan · Flood the Stage | Slow seconds at 80 / damage at 265 | 3 / 0 | Deep Current 5 / 0 | Lake Swell 1.8 / 14 |
| Sari · Silat Palm Guard | Guard still active at 2.8 s (1 = yes) / damage per initial contact counter | 0 / 40 | Patient Guard 1 / 28 | Snap Counter 0 / 60 |
| Auntie Karen · Tissue Packet Chope | Live chopes at 7 s / arrival damage at 126 from stamp centre | 0 / 0 | Chope Early 1 / 0 | Bulk Buy 0 / 24 |
| Captain "Pag Pag" Garcia · Stockpot Guard | HP saved against a 20-damage projectile at 3.5 s / opening shove | 0 / 180 | Heavy Stockpot 5 / 100 | Hammered Rim 0 / 300 |
| The Gold Sultan · Gold Dust | Damage bonus / basic attack rate bonus | 25% / 50% | Deep Gold 40% / 25% | Quick Gold 15% / 80% |
| Vanna · Foldstep | Familiar damage at ranges 45 / 170 | 45 / 0 | Tight Knot 65 / 0 | Loose Weave 32 / 32 |
| Keo · Held Breath | Stun seconds / pulse damage on a fresh measure | 0.8 / 18 | Fermata 1.4 / 12 | Sharp Accent 0.4 / 28 |
| Nadi · Buddha’s Refuge | Ward duration in seconds / ward radius | 6 / 170 | Lasting Refuge 8 / 125 | Open Refuge 4 / 220 |
| Lia Soares · Crescent Cut | Damage at 330 / 70 | 0 / 32 | Long Crescent 24 / 24 | Deep Cut 0 / 48 |

The Kama test isolates one deposited patch, normalizes its tick phase and stops further emission. On a moving bike, the longer patch lifetime increases the distance of road left burning behind Kama. The emission duration still follows skill rank. Nok’s sweet spot tracks the chosen reach, and Nadi’s guardian leash matches the chosen ward radius.

The browser checks also cover deferring the offer, selecting by number or button, preventing a second path, retrying, and entering practice. A repeat using an existing v1-format save with 173 coins, three owned heroes and a Johor clear preserved its serialized value. Desktop keyboard and emulated phone touch selections were verified in Chromium.

These automated comparisons establish which tactics each path favors in controlled encounters. Full-run win rates, equipment combinations, evolved-skill performance and player preference remain unmeasured. No human playtest was performed.

[Keyboard capture](screenshots/specialization-keyboard.png) · [Touch capture](screenshots/specialization-touch.png)
