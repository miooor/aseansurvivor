# ASEAN Survivor

A top-down 2D survive-the-horde game. Pick a hero from Southeast Asia and fight your way north from Johor, fighting ghosts from each country's folklore: toyol, pocong, penanggal, orang minyak, pontianak and more.

It is an original game in the survivor-like genre, with its own heroes, ghosts and rules. Each hero has a MOBA-style kit: an auto basic attack, three skills and an ultimate.

## Play

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also turn on GitHub Pages for this repo (Settings → Pages → deploy from the main branch) to get a shareable link.

## Controls

| Action | Keys |
| --- | --- |
| Move | WASD or arrow keys (on a phone, drag on the left side of the screen) |
| Cast a skill early | Q, E, F |
| Ultimate | R or Space |
| Switch the auto-cast combo (Q+E, Q+F, E+F, all, off) | T or the AUTO button |
| Pause | Esc or P |
| Pick a level-up card | 1, 2, 3 |

## What's in the prototype

- **5 heroes:** Ustaz Hakim and Mat Rempit "Jet" (Malaysia), Nok (Muay Thai, Thailand), Cô Lan (water puppeteer, Vietnam), Sari (pencak silat, Indonesia).
- **Malaysia route:** Johor → Melaka → Perak → Pulau Pinang → Kedah, each with its own boss. Kuala Lumpur is a bonus stage that unlocks after Perak (2 minutes, 3x coins).
- **Auto-cast combos:** link two skills and they fire together so their combo triggers.
- **Combos and evolutions:** skills used together get bonuses, and a rank-5 skill plus a matching item evolves.
- **Power-ups:** Ketupat (heal), Besi Berani (magnet), Mercun (hits every ghost on screen), Kopi Kaw (fast recharge), Payung (shield).
- **Portal raid:** a portal appears once per stage. Inside is Hantu Raya, a raid boss that drops a Fusion Orb (free evolution) or a big XP buff.
- **Coins and hero shop:** saved in the browser's localStorage.

All heroes and stages are unlocked for testing. To bring back the shop and stage locks, set `UNLOCK_ALL` to `false` in `index.html`.

## Code layout

| File | What it holds |
| --- | --- |
| `index.html` | Core game: loop, input, ghosts, stages, bosses, power-ups, UI, the Ustaz and Rempit heroes, and the `HOOKS` registry that modules plug into |
| `heroes-sea.js` | Nok, Cô Lan and Sari (skills, auto-cast rules, evolutions, drawing) |
| `raid.js` | Portal, raid arena and the Hantu Raya boss |

Plain HTML5 canvas, no libraries. Art is placeholder shapes for now. The plan is chunky 2D sprites with thick outlines and punchy animation, probably in Phaser 3.

## Design

See [DESIGN.md](DESIGN.md) for heroes, the ghost roster, stages and the respectful-portrayal guidelines.
