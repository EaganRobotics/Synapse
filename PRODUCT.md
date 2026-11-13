# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

FRC teams on a Windows PC. They set up Python, train a PPO policy for a simplified 2025 REEFSCAPE driving task, watch the field, replay saved models, and read logs. The audience is any FRC team doing that job, not one team only.

## Product Purpose

Reefscape RL is the desktop app for that loop. It keeps setup, training, live metrics, model playback, logs, and the built-in field visualizer in one place. Success is a team finishing first-run setup, training a policy, watching it on the field, and inspecting the run without leaving the app. The command-line tools stay available as a fallback.

## Positioning

The app owns this task’s training loop and field view together. Setup, Doctor, PPO training, live metrics, model replay, and logs are the same session. AdvantageScope is optional: the app can host a local NetworkTables stream, and the operator connects AdvantageScope themselves. A raw training script or AdvantageScope alone does not cover that whole loop.

## Operating Context

Windows desktop, used at a team computer with Python 3.11 or newer and, when available, an NVIDIA GPU. First run is Setup + Deps, then Doctor. Training defaults are CUDA, 100000 timesteps, 8 parallel environments, desktop preview, and a model path under `models/`. Artifacts land in `models/`, `runs/`, and `logs/`. The built-in field is the default view. Host AdvantageScope starts the local sim stream at `127.0.0.1`. A global Stop ends the running job. The operator can open the project folder from the app.

## Capabilities and Constraints

The interface name is Reefscape RL.

These jobs stay reachable: Train, Field, Models, Logs, Setup + Deps, Doctor, open project folder, Host AdvantageScope, and Stop.

Train keeps the current launch fields: timesteps, device, robot profile, preview, model out, resume from, parallel envs, rollout steps, batch size, learning rate, checkpoint interval, heuristic pretrain, and AdvantageScope stream. It also keeps smoke test, live status, the metric chart, and the log tail.

Field keeps the built-in canvas and the live-versus-demo state. Models keeps archive selection, evaluate, and run in field. Logs keeps the log tail and the CLI runner.

The shell is a Wails app. The interface is a React frontend talking to the existing Go bindings. Do not drop a binding or invent a training capability the app does not have.

Python, CUDA, and dependency health stay visible. Missing training dependencies stay visible, with Setup + Deps as the recovery path. Errors from failed actions stay visible.

## Brand Commitments

Display name: Reefscape RL.

The rebuild uses the Neuron desktop UI as the visual reference. That reference is binding for the look of the shell. Neuron’s product, routes, and copy are not this product’s.

## Evidence on Hand

- `README.md` describes the installer, training defaults, model playback, AdvantageScope topics, and CLI fallback.
- `app/frontend/src/main.jsx` is the current desktop interface and its jobs.
- `C:\Users\Scuyul\Documents\GitHub\Neuron\src\neuron\web\static\` is the visual reference the user named. It is not evidence of Reefscape RL’s behavior.

No testimonials, benchmarks, pricing, or customer claims are on hand. Do not invent them.

## Product Principles

- One desktop session covers setup, training, the field, models, and logs.
- The built-in field is the default view. AdvantageScope stays optional.
- Running state, errors, and missing dependencies stay visible while a job is in progress.
- The name on the interface is Reefscape RL, for any FRC team.
- Existing jobs stay reachable. The visual shell can change.
