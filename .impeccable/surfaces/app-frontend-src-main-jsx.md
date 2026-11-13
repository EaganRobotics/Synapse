---
version: 1
slug: "app-frontend-src-main-jsx"
primary_target: "app/frontend/src/main.jsx"
related_targets: ["app/frontend/src/styles.css"]
---

# Train shell

Mode: operate

Audience: any FRC team on a Windows PC. Job: set up, train, watch the field, replay a model, and read logs. Action: start or stop a training run and see whether it is healthy. Content: launch fields, phase status, reward chart, field, models, logs. Constraint: every current job stays reachable. The display name is Reefscape RL.

## Direction contract

THESIS: Reefscape RL is a working trainer on Neuron chrome, and the reward chart and the field share one cream grid. It refuses the dark metric-hero dashboard.

OWN-WORLD: Glossy blue header, silver-blue page, lifted tabs, steel title bars, Aero buttons, cream canvases ruled with a soft blue grid. Tahoma. The active scoring face is the one mark that burns.

STORY: The operator sees the job, the phase, and the field in one glance, starts training, and can stop it. A missing dependency stays visible with Setup + Deps as the recovery.

FIRST VIEWPORT: A 76px glossy header carries the name, a status chip, and step and reward readouts. Train is the lifted tab. Under it, a command row holds Setup + Deps, Doctor, Project Folder, Host AdvantageScope, and Stop. The body is a launch plate beside a phase list whose current row has a filled length, then the reward chart and a field plate on the same grid. The missing-deps warning sits above the plates when it is true.

FORM: Shared field grid, fifth grounded candidate, translated onto the pinned Neuron chrome. seed:acd198670d315d75

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
