# Second Run: results screen, route ending and destination previews

* **Author:** miooor
* **Date:** 2026-11-21
* **Reviewed against:** commit `e40e8be976818e1424e465c97030989f068829c5`

## Overview

ASEAN Survivor is a browser Three.js survivor-like, deployed on Vercel and made for fun. It has no server, no analytics and no accounts.

This PRD targets one player: someone who ends a first run, banks the coins, and closes the game. That player is the owner's hypothesis from reviewing the game. No playtest has observed it yet.

The PRD adds no countries, bosses, items or Johor activities. It changes what the player sees at three moments:

1. **After a run ends.** The player can see how close they came, spend coins on the survivor they just played, and start again, without going back to the menu.
2. **After the last stage of a route.** The player gets a Malaysian ending and is pointed at the other coast, which is content that already exists, instead of at Thailand, which does not.
3. **Before committing to a destination inside a stage.** The player can see what a destination rewards before walking there.

Seven independent reviewers read the concept against the code. Their main result: most of what the concept asked for already exists, and the missing parts are smaller and more specific than the concept said. The sections below reflect the corrected scope.

## Analysis

### What already exists

Reviewers agreed on these facts, each checked against the code.

- **Rematch.** The end screen's "Play again" button restarts the same survivor and stage (`src/game/runtime.js:1098`) and takes focus on defeat (`runtime.js:1053`). `tests/ui-smoke.js:659-661` asserts it.
- **Upgrades apply to a rematch.** A new run re-reads the save and the purchased ranks (`runtime.js:158`, `:162`).
- **One reward screen.** Elite chests (`runtime.js:742`), Johor encounters and regional quests (`src/game/encounters.js:31`) all call `equipment.grant` and open one panel (`src/game/equipment.js:221-303`). The panel already shows the equipped item and labels such as "Replace X", "Equip in empty slot" and "Upgrade from X".
- **Planned countries on the atlas.** Ten planned stops are listed and drawn as dashed routes (`src/content/expedition.ts:11-26`, `src/scenes/CampaignAtlas.ts:239-254`).
- **Stage access without a clear.** `retainedStages` grants it (`src/content/campaign-routes.js:10`).

### What blocks the results screen today

- **Purchases are refused on the results screen.** `buyUpgrade` returns early whenever a run object exists (`runtime.js:921`), and the run object is still set while the results are shown.
- **The shop opens only from the lobby** (`src/ui/upgrade-shop.ts:98`), and its survivor selector lets the player buy for a different survivor than the one being replayed.
- **Coins are banked after the screen appears.** The payout write is asynchronous (`runtime.js:1054-1059`), so a purchase made at once would read a wallet without this run's coins.
- **Focus lands on "Play again" the moment the run ends**, and Space is the ultimate key. A player pressing Space at death may restart without seeing the screen. This is from reading the code, not from play.

### The largest open risk: the first-run player may not be able to buy anything

- Ordinary kills drop one coin 7% of the time (`runtime.js:271`).
- The stage clear bonus and the boss coin shower are paid only on a win (`runtime.js:1044`, `:275`).
- The cheapest upgrade rank costs 40 coins, and most cost 45 to 75 (`src/content/hero-upgrades.ts:4-12`).
- One reviewer estimated a first defeat banks 15 to 30 coins. This is an estimate from drop rates, not a measured run.

If that estimate holds, "spend coins on an upgrade you can afford" shows the target player an empty panel. The PRD must not promise an affordable upgrade until first-defeat payouts are measured. The existing "You need N more coins" message (`runtime.js:926`) can turn the shortfall into a goal for the next run.

### "Boss health left" is undefined for many defeats

The boss arrives at 180 seconds (120 in Kuala Lumpur). A first-time player often dies sooner. There are four defeat shapes, and each needs its own line:

| Defeat shape | What the screen shows |
| --- | --- |
| Died before the boss arrived | Time until the boss would have arrived |
| Died with the stage boss alive | Boss health left, as a percentage with a text label |
| Boss outlasted the night deadline | Boss health left, and that time ran out |
| Died inside the portal raid | Raid boss health left, named as the raid boss |

Use a percentage. Boss health scales with level (`runtime.js:490`), so raw numbers are not comparable between runs. Capture the figure before the cleanup hooks run at `runtime.js:1043`; no reviewer confirmed the boss is still readable afterwards.

### The route ending

- The current text is one string in `runtime.js:1047`: "West Coast route complete. Thailand is the next planned chapter."
- At a route end the Next button is hidden and focus goes to "Play again", which replays the finale (`runtime.js:1052-1053`).
- It shows on any win of a last stage. With `UNLOCK_ALL` on, Kedah or Kelantan can be a player's first run.
- The save records clears only, so there is no "ending seen" state.

The inventive reviewer's proposal resolves "an ending without new content": the other coast is the next thing to play. `nextCampaignStage(otherRoute, save)` (`campaign-routes.js:13`) already returns its next stage. A separate final screen is still needed once both coasts are cleared, and it can be derived from `cleared`.

One reviewer argued this item does not serve the target player, who never reaches stage four or six. That objection stands. The item stays because the owner listed it as one of three places the game looks unfinished, and it ships after the results screen so it does not confound that playtest.

### Destination previews

- A marker appears on the minimap only after its landmark is discovered (`src/scenes/RegionMap.ts:116-132`, `encounters.js:58`).
- The reward slot shows only within 120 units, as "Reward · slot" (`encounters.js:59`, `:67`).
- The pre-run mission sheet lists the boss and guardian but no quest (`runtime.js:877-880`).

Two limits on the original example ("market for a weapon last run, lantern for a charm this run"):

- **It exists only in Johor.** Johor has three encounters with fixed slots (`src/content/encounters.js:2-4`). Each of the other eight stages has one quest with a fixed slot (`src/content/regional-quests.js:7-32`). Elsewhere the choice is quest, cache, or elite chest, and the elite chest's slot is random (`runtime.js:261`).
- **Nothing forces a choice.** A player can finish all three Johor encounters in one run. Only the clock and the boss deadline compete. The PRD should say the trade-off is time.

Showing markers from the start of a run removes discovery as a reward for exploring. That is a cost of this item, not a free change.

### The reward screen

The "merge the reward interfaces" request describes work already done. The remaining gaps are small:

- A fixed "Lasts this run" line. All gear resets at run start (`equipment.js:305`), so there is no per-item duration.
- One layout for both cases. Single-slot offers show a "Currently equipped" header; mixed-slot elite offers show "Current effect" per card (`equipment.js:222-232`, `:245`).
- "What would change" as numbers cannot be computed, because item effects are functions (`equipment.js:78-85`). The panel can show descriptions only.

### Replacing the four specs

"Replaces" was the wrong word. The four specs cover different ground from this PRD, so closing them without a record drops commitments and live rules.

- **#1 (Johor encounter-and-loot):** largely shipped, and the code has moved past it (eight equipment slots against the spec's three). It is the only place some rules are written as requirements: no stacked modals, queued rewards, equipment never written to the save, 44 px touch targets, no overflow at 320 and 390 px.
- **#8 (deeper combat and skill equipment):** six skill items (`echoLattice`, `forkedConduit`, `undertowThread`, `relayKnot`, `crosswindDrum`, `monsoonLens`) and the fan, burst and enraged enemy patterns are not in the code. The game took a different direction with armour slots. Its acceptance steps require Astrocade builds.
- **#16 (twelve heroes):** the seven additional heroes shipped. Its acceptance steps require Astrocade builds.
- **#25 (illustrated effects for 60 skills):** an effects overhaul is a non-goal here, yet its children #26 to #28 are open.
- **#4, #5, #6:** labelled blocked, but `docs/johor-ward.md` and `docs/johor-hunt.md` describe #4 and #5 as built.
- **#12, #21:** verification tickets that name Astrocade.

Each of these needs an explicit disposition from the owner: closed as shipped, closed as dropped, or carried forward. See the open decisions below.

### Where the PRD lives

`docs/agents/issue-tracker.md` says specs and tickets live in GitHub Issues, with tickets linked to their spec as sub-issues. Spec #1 says to keep the issue as the canonical specification "rather than maintaining a second editable copy". The PRD should be one GitHub issue using #1's section order, with each scope item as a sub-issue. Shipped behaviour then goes into `DESIGN.md` "Current decisions".

`AGENTS.md:59` points to a root `GLOSSARY.md` and `docs/adr/`. Neither exists. The code, the interface and this concept use several words for the same things: hero and survivor; quest, event, encounter and destination; reward, offer and loot; chapter for both one stage (on the atlas) and the whole country.

### The legacy-access rule

The owner's rule is sound as an outcome. As written it cannot be implemented, for three reasons:

- **Nothing marks a legacy save.** The save has no version or marker field (`runtime.js:64`). Under the bypass no purchase ever writes `owned`, so a legacy save and a fresh earned-locks save have the same shape.
- **A marker cannot go in the defaults.** `readSave` merges defaults over the stored object (`runtime.js:69`), so the test must be on the raw parsed object, as line 74 already does for `retainedStages`.
- **A profile has no save until its first write.** Someone who opened the game and quit mid-run counts as fresh.

"Heroes have prices" is also only partly true: Nok, Lan and Sari cost 150, 200 and 250; Asha, Dani and Mira are priced 0 and so are always owned; the remaining four have no price and fall back to 200.

Since the flip is deferred, the PRD records the mechanism and builds none of it. The rule would be lost when the PRD issue closes, so it belongs in an ADR.

### The success measure

Reviewers found it cannot produce a pass or fail: no tester count, no threshold, no definition of "second run", and no baseline session before the change ships. Two proposals conflict:

- Run a "before" session on `e40e8be`, then an "after" session. Better yet, keep `e40e8be` live as a second Vercel deployment and alternate testers. Separate origins have separate `localStorage`, so every tester starts fresh with no reset step.
- Drop the "before" arm. A two-arm study is heavy for a for-fun game with one owner. Watch three to five new players after the change and note whether they open the shop and start another run.

Either way, the result is directional, not proof. The observed event needs no instrumentation: the player presses "Play again" or "Next", or goes to the menu or closes the tab.

### Ideal final result

The second run starts from the results screen. The existing end overlay, shop dialog, save fields, route table and minimap hold almost everything needed, so the PRD is mostly wiring, copy, and a record of what each old spec delivered.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  1. **Results screen.** Open the existing upgrade shop from the end screen, fixed to the survivor just played. Allow purchases when the run is over. Enable buying only after the payout is saved. Show the boss line from the defeat table. Show "need N more coins for X" when nothing is affordable. Keep the existing "Play again" button. Add a short input delay so a held key cannot skip the screen, and never put first focus on a buy button. Build it as a `src/ui/` module fed a plain run summary, on the pattern of `installUpgradeShop`.
  2. **Route ending.** On beating the last stage of a route, show a Malaysian ending and make the primary button the next uncleared stage on the other coast. Show a separate final screen when both coasts are cleared. Store the copy as content keyed by route, beside `CAMPAIGN_ROUTES`. Update `DESIGN.md:77`.
  3. **Destination previews.** Add the reward slot to the minimap marker and destination label, and the quest and its slot to the pre-run mission sheet. Add a "Lasts this run" line and one layout to the existing reward panel.
  4. **Housekeeping that the above depends on.** A disposition for every listed issue. A `GLOSSARY.md` fixing one term per concept. An ADR recording the legacy-access mechanism. A line in `AGENTS.md` and `README.md` saying not to change `UNLOCK_ALL` until that migration ships.
  5. **Constraints.** No new fields in `aseanSurvivor.v1` for items 1 to 3, checked with the existing byte-equality pattern in `tests/mira-harbor.js`. Equipment stays run-local. Touch targets of 44 px and no overflow at 320 and 390 px.
* **Out-of-Scope Non-Goals:**
  * New countries, bosses, item pools or Johor activities.
  * A broad art, animation, effects or sound overhaul. These need a hands-on playtest to name specific problems.
  * Analytics, telemetry or a backend.
  * Turning `UNLOCK_ALL` off. It stays on. Flipping it is a separate decision with its own fresh-save playtest.
  * The Fadli combo prompt. Deferred until playtests show players do not understand his kit before their first defeat.
  * A second shop interface, a new reward module, or a per-item duration field.

## Alternatives Weighed

- **A broad "more content" PRD: new stages, enemies and items.** Rejected by author: Malaysia already has nine stages on two routes and Johor has three encounters. The aim is more reasons to play existing stages differently.
- **Earned unlocks on by default in this PRD.** Rejected by author: changing the results screen and introducing locks together makes the playtest hard to interpret, and the hero economy has never been played with locks on.
- **Legacy rule "anything you used, you keep".** Rejected by author: the save records owned heroes, upgrades, clears and retained stages, but no history of hero or stage use, so the rule promises more than the save can prove.
- **One combat lesson per hero (twelve lessons).** Rejected by author: at most one optional prompt, for players who pick Fadli, reusing existing practice guidance. No forced hero selection.
- **A broad art, animation, effects and sound pass.** Rejected by author: not budgeted from a review; needs a playtest to identify specific problems.
- **Adding analytics to measure retention.** Rejected by author: success is judged by watched playtests on fresh profiles.
- **Keeping the Astrocade draft as a release target.** Rejected by author: the game is on Three.js and Vercel.
- **Keeping the four open specs alongside the PRD.** Rejected by author: this PRD is the main document agents implement from.
- **A new shared reward comparison layer.** Rejected after review: one `grant` call and one panel already serve every reward source (`encounters.js:31`, `runtime.js:742`, `equipment.js:221-303`).
- **A new rematch button.** Rejected after review: "Play again" already restarts the same survivor and stage (`runtime.js:1098`).
- **Reusing `practicePrompt` directly for the in-combat Fadli prompt.** Rejected after review: it reads `g.practice`, which is null in a campaign run (`src/game/signature-practice.js:18`), and the lesson table is not exported. The run HUD already shows "Basic attacks gather light" and "F · Raise a healing sanctuary" (`src/game/hero-identities.js:25-27`), so a prompt must say what it adds.
- **Reusing `retainedStages` as the marker for a legacy save.** Rejected after review: it is back-filled only when absent and then written by every save, so every profile has it.
- **A PRD kept as a file in `docs/`.** Rejected after review: the repository keeps specs in GitHub Issues and warns against a second editable copy.

## Key Decisions & Staging for Next Steps

### Resolved

- The PRD is pinned to commit `e40e8be`.
- `UNLOCK_ALL` stays on throughout this PRD.
- Existing `aseanSurvivor.v1` saves keep working: coins, owned heroes, upgrade ranks and route progress.
- Legacy outcome, for the later flip: every existing save keeps access to all heroes and stages; coins, ranks and clears are untouched; Kedah access survives without a Kedah clear; earned locks apply to fresh profiles only.
- Legacy mechanism, recorded in an ADR and not built now: a one-time migration, shipped while the bypass is still on, writes all hero ids into `owned`, all stage ids into `retainedStages`, and a marker field. A legacy save is one whose stored key exists and whose raw parsed object lacks the marker. "Valid" means the stored value parses to an object.
- Shipping order: measure first-defeat coin payouts; results screen with its harness checks; playtest; route ending; reward panel changes; destination previews.
- Verification per item: results screen checks extend `tests/ui-smoke.js` after line 658 using the existing `G.coins=450; endGame(false)` pattern; the route ending adds `endGame(true)` checks on Kedah and Kelantan, which no test covers today; destination previews are checked as "each marker's prompt names its reward slot before activation".

### Open, for the owner to decide

1. **First-defeat coins.** If a first defeat banks less than the cheapest rank, choose one: a minimum defeat payout, a cheaper first rank, or the "need N more coins" state alone. Needs a few measured runs first.
2. **Spec dispositions.** For each of #1, #8, #16, #25, #26 to #28, #4 to #6, #12 and #21: closed as shipped, closed as dropped, or carried forward. This includes whether #8's six skill items and three enemy patterns are dropped, and whether the #25 effects work is dropped or kept outside this PRD.
3. **Playtest shape.** Two arms with `e40e8be` kept live beside the new build, or one arm after the change. Also the number of testers, the starting survivor and stage, and what counts as a "second run" (suggested: any new stage start in the same sitting).
4. **Does the target include winners?** The results screen item changes defeat only. A first-run win in Johor already shows "Next stage".
5. **Route ending trigger.** Every win of a last stage, or only when every stage on that route is in `cleared`. This matters because the bypass lets a player start at Kedah.
6. **Markers visible from the start of a run.** Accept losing discovery as an exploration reward, or keep discovery and add previews only to the mission sheet.
7. **Scope of destination choice.** Johor only, or also quest versus cache versus elite chest in the other eight stages.
8. **Hero prices.** Four heroes have no price and default to 200; three are free. Needed before the unlock playtest, not before this PRD ships.
9. **Build identity.** Whether to show the commit id beside "Updated" in the lobby so a playtester's build can be identified. Small, but it is new scope.

### Not verified

- No one ran the game. Every claim is from reading code at the pinned commit.
- The first-defeat coin estimate (15 to 30) is derived from drop rates.
- Whether the boss object is still readable when the end screen is built.
- Whether `tests/minimap-selection.html` asserts the current discovery gating.
- The Vercel project settings; the repository has no `vercel.json`.
- The working tree had uncommitted changes from other work (`src/content/core.js`, `src/content/folklore-monsters.js`, `src/scenes/SpriteAssets.ts`, `tests/folklore-monsters.js`) when this brief was written. They were not reviewed.
