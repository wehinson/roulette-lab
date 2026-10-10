# Release 0.1.2

- Agent: Codex
- Status: Shipped as part of the authorized GitHub Pages release.
- Changes: Restore visible Red and Black labels beside diamonds; download the last completed run as TXT with original settings, seed, release identity, totals, stop reasons, table-limit hits, all session results, and sampled paths. Share summary processing between the UI and report engine.
- Engine checks: Numerical, seeded simulation, and all board target checks passed. Report checks passed known statistics, configuration fidelity, precision, one-session runs, and all 10,000 session rows.
- Browser checks: No horizontal overflow at 320, 360, 390, 430, 768, and 844 pixels. All mobile bet types, command population, scheduled rules, and completed simulations passed. Chrome native TXT download passed; downloaded contents preserved the completed run after form settings changed.
- Limitation: Phone-sized browser layouts were checked; physical iOS/Android devices were not available. The automation download-event helper timed out, so native clicks and the actual downloaded file were checked instead.
- Version: 0.1.2
- Last update: 2026-10-09
