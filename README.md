# Roulette Lab

A play-money roulette laboratory. Runs entirely in the browser, including its simulation worker.

Live app: https://wehinson.github.io/roulette-lab/

## Development

- Use the `working` branch for edits.
- Run `npm test` for engine and board selection checks.
- Serve `dist/` with a static HTTP server for the UI.
- Browser checks need William's permission under RULES.md G4.

## Release

After William authorizes shipping, merge `working` into `main` and push. GitHub Actions tests the engine, uploads `dist/`, and deploys GitHub Pages. The live `release.json` records the release commit and version. All app asset paths are relative so the app works under `/roulette-lab/`.

The original Sites deployment is retained as a prior version. GitHub Pages is the current host.
