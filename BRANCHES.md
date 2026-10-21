# Release 0.1.2

- Agent: Codex
- Status: Shipped as part of the authorized GitHub Pages release.
- Changes: Restore visible Red and Black labels beside diamonds; download the last completed run as TXT with original settings, seed, release identity, totals, stop reasons, table-limit hits, all session results, and sampled paths. Share summary processing between the UI and report engine.
- Engine checks: Numerical, seeded simulation, and all board target checks passed. Report checks passed known statistics, configuration fidelity, precision, one-session runs, and all 10,000 session rows.
- Browser checks: No horizontal overflow at 320, 360, 390, 430, 768, and 844 pixels. All mobile bet types, command population, scheduled rules, and completed simulations passed. Chrome native TXT download passed; downloaded contents preserved the completed run after form settings changed.
- Limitation: Phone-sized browser layouts were checked; physical iOS/Android devices were not available. The automation download-event helper timed out, so native clicks and the actual downloaded file were checked instead.
- Version: 0.1.2
- Last update: 2026-10-09

# Worker launch recovery — 2026-10-21

- Agent: Codex; branch: task/worker-launch-recovery-20261021.
- Base: main daf6d7dffd91e9a515a201a0f98445919ad3ab82; no working branch exists. Explicit task authorization permits this main fallback.
- Status: Ready With Caveat; unmerged review only. No version change.
- Change: Catch synchronous Worker construction/send failures, terminate an allocated failed Worker, restore controls and show a retryable error. Preserve completed reports. Ignore callbacks from previous Workers after cleanup.
- Existing behavior: Manual Cancel already recovered controls and terminated allocated Workers; reload was not required.
- Baseline: Full actual app/dependencies under synthetic DOM/Worker: constructor/send exceptions escaped; focused suite 2 passed/6 failed (including stale callback guards).
- Verification: node --experimental-vm-modules --test app-lifecycle.test.mjs: 8/8 passed. npm test passed numerical, progression, scheduled wagering, board and report checks. git diff --check passed.
- Limits: Synthetic DOM and Workers only; browser layout and native Worker failure conditions/frequency unverified. No browser automation, preview, merge or deployment.
