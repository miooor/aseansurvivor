# Repository Guidelines

## Project Structure & Module Organization

This is a browser-first Phaser game built with Vite:

- `index.html`, `ui.css`: menus, HUD, and responsive styling.
- `src/main.ts`, `src/scenes/`: Phaser bootstrap and native rendering.
- `src/game/`: combat runtime, hero kits/signatures, raid mechanics, and runtime types.
- `src/content/`: stage/region layouts, collision/navigation, heroes, passives, and evolutions.
- `assets/`: environment artwork and the character atlas.
- `tests/`: browser acceptance harness.
- `docs/architecture.md`: boundaries, limitations, and milestones.

Keep simulation changes in the runtime/modules and rendering in the Phaser scene. Extend the existing registries and `HOOKS`; do not introduce another animation-frame loop.

## Build, Test, and Development Commands

Use Docker Compose from the repository root:

```sh
docker compose up -d                     # localhost:5173
docker compose exec game npm run lint    # JavaScript lint
docker compose exec game npm run typecheck
docker compose exec game npm run build   # production dist/
docker compose exec game npm run preview # localhost:4173
docker compose down
```

Dependencies are locked in `package-lock.json` and installed in a container volume. Do not install host packages. Directly opening `index.html` is unsupported.

For Astrocade export, artwork encoding, or mobile verification, read `docs/astrocade.md`. Its optional Pillow encoder runs in `astrocade/assets.Dockerfile`; retain the source PNGs and update the CDN asset map before rebuilding the draft.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, camelCase functions/variables, and uppercase constants. New engine code uses strict TypeScript; retained simulation modules use ES-module JavaScript. Keep lowercase hero IDs such as `nok` consistent across registries. Preserve nearby formatting. ESLint checks JavaScript; TypeScript checks the new engine layer. No formatter is configured.

## Testing Guidelines

Open `/tests/ui-smoke.html` on the development server and select **Run checks**. Keep the tab active; require `PASS` and download the JSON report. This browser E2E harness covers heroes, stages, movement, overlays, raids, retry, and responsive widths. Use `/tests/stage-worlds.html` for regional navigation, caches and enemy changes. No coverage percentage is enforced.

Add complex behavior checks before implementation. Check signature charge, consumption, expiry, and reset behavior when changing heroes. Include screenshots for visual changes; inspect keyboard and touch controls. Use an isolated browser profile for persistence tests. Preserve `aseanSurvivor.v1` saves; `UNLOCK_ALL` currently enables testing access.

## Commit & Pull Request Guidelines

Existing history uses short descriptive subjects, such as “ASEAN Survivor browser prototype”. Use focused commits; no formal prefix convention exists.

Describe behavior changes, verification, and save/balance impacts. Link relevant issues and visual evidence. Update README and design decisions when affected. Follow `DESIGN.md` portrayal rules; “Current decisions” overrides older sections.

## Agent skills

### Issue tracker
Specs and tickets live in GitHub Issues for miooor/aseansurvivor.
See `docs/agents/issue-tracker.md`.

### Triage labels
Use the five default triage labels.
See `docs/agents/triage-labels.md`.

### Domain docs
Use a single-context layout: root GLOSSARY.md and docs/adr/.
See `docs/agents/domain.md`.
