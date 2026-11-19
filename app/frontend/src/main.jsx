import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  EvaluateArtifact,
  GetLiveState,
  GetState,
  OpenAdvantageScope,
  OpenFolder,
  ReplayArtifact,
  RunAction,
  RunCLI,
  StartSmokeRun,
  StartTraining,
  Stop
} from "../wailsjs/go/main/App";
import { drawNeuronField } from "./field-viewer";
import "./styles.css";

const defaultConfig = {
  timesteps: "100000",
  modelOut: "models/reefscape_ppo",
  resumeFrom: "",
  device: "cuda",
  robotProfile: "2025-robot",
  preview: "desktop",
  nEnvs: "8",
  nSteps: "512",
  batchSize: "1024",
  learningRate: "0.0003",
  checkpointEvery: "10000",
  pretrain: true,
  advantageScope: true
};

const tabs = [
  ["train", "Train"],
  ["field", "Field"],
  ["models", "Models"],
  ["logs", "Logs"]
];

function App() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState("train");
  const [config, setConfig] = useState(defaultConfig);
  const [cli, setCli] = useState("python menu.py");
  const [selectedModel, setSelectedModel] = useState("");
  const [error, setError] = useState("");
  const fullRefreshInFlight = useRef(false);
  const liveRefreshInFlight = useRef(false);

  const refreshFull = async () => {
    if (fullRefreshInFlight.current) return;
    fullRefreshInFlight.current = true;
    try {
      const next = await GetState();
      setState(next);
      setError("");
    } catch (err) {
      setError(explainError(err));
    } finally {
      fullRefreshInFlight.current = false;
    }
  };

  const refreshLive = async () => {
    if (liveRefreshInFlight.current) return;
    liveRefreshInFlight.current = true;
    try {
      const live = await GetLiveState();
      setState((current) => {
        if (!current) return current;
        return {
          ...current,
          running: live.running,
          current: live.current,
          lastCode: live.lastCode ?? current.lastCode,
          snapshot: live.snapshot || current.snapshot
        };
      });
    } catch {
      // Full refresh owns user-facing error reporting.
    } finally {
      liveRefreshInFlight.current = false;
    }
  };

  useEffect(() => {
    refreshFull();
    refreshLive();
    const fullId = window.setInterval(refreshFull, 650);
    const liveId = window.setInterval(refreshLive, 33);
    return () => {
      window.clearInterval(fullId);
      window.clearInterval(liveId);
    };
  }, []);

  const run = async (fn) => {
    try {
      setError("");
      await fn();
      await refreshFull();
    } catch (err) {
      setError(explainError(err));
    }
  };

  const latestMetric = state?.metrics?.at(-1);
  const snapshot = state?.snapshot || demoSnapshot();
  const running = Boolean(state?.running);

  return (
    <div className="site">
      <header className="site-header">
        <BrandMark />
        <div className="brand">
          <h1>Reefscape RL</h1>
          <p>Train, watch, and replay a REEFSCAPE policy</p>
        </div>
        <div className="header-readouts">
          <div className={running ? "chip running" : "chip ready"}>
            <span>Status</span>
            <Flap value={running ? "Running" : "Ready"} />
          </div>
          <div className="readout">
            <span>Step</span>
            <Flap value={formatInt(latestMetric?.step || snapshot?.training?.step || 0)} />
          </div>
          <div className="readout">
            <span>Reward</span>
            <Flap value={formatMetric(latestMetric?.reward ?? snapshot?.match?.totalReward)} />
          </div>
        </div>
      </header>

      <nav className="site-tabs" aria-label="Primary">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            <span className={`tab-ico ${id}`} />
            {label}
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <button className="command" type="button" disabled={running} onClick={() => run(() => RunAction("setup_deps"))}>Verify Bundled Runtime</button>
        <button className="command" type="button" disabled={running} onClick={() => run(() => RunAction("doctor"))}>Doctor</button>
        <button className="command" type="button" onClick={() => run(OpenFolder)}>Project Folder</button>
        <button className="command" type="button" disabled={running} onClick={() => run(OpenAdvantageScope)}>Host AdvantageScope</button>
        <button className="command danger" type="button" disabled={!running} onClick={() => run(Stop)}>Stop</button>
      </div>

      <main className="site-body">
        {error && <div className="notice error">{error}</div>}
        {state?.missingTraining?.length > 0 && (
          <div className="notice warn">
            Training deps missing: {state.missingTraining.join(", ")}. Verify the bundled runtime, then reinstall if the check fails.
          </div>
        )}

        {tab === "train" && (
          <TrainView
            config={config}
            setConfig={setConfig}
            running={running}
            onStart={() => run(() => StartTraining(config))}
            onSmoke={() => run(StartSmokeRun)}
            onStop={() => run(Stop)}
            metrics={state?.metrics || []}
            logs={state?.logs || []}
            current={state?.current || ""}
            snapshot={snapshot}
            live={Boolean(state?.snapshot)}
          />
        )}
        {tab === "field" && <FieldView snapshot={snapshot} live={Boolean(state?.snapshot)} tall />}
        {tab === "models" && (
          <ModelsView
            artifacts={state?.artifacts || []}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            running={running}
            onEvaluate={() => run(() => EvaluateArtifact(selectedModel))}
            onReplay={() => run(async () => {
              await ReplayArtifact(selectedModel);
              setTab("field");
            })}
          />
        )}
        {tab === "logs" && (
          <LogsView logs={state?.logs || []} cli={cli} setCli={setCli} onRun={() => run(() => RunCLI(cli))} running={running} />
        )}
      </main>

      <footer className="site-footer">
        <span>Desktop trainer for a REEFSCAPE policy</span>
        <span>{state?.pythonAvailable ? "Python linked" : state ? "Python missing" : "Checking Python"}</span>
      </footer>
    </div>
  );
}

function BrandMark() {
  return (
    <svg className="mark" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="mark-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7f1ff" />
          <stop offset="0.45" stopColor="#4e8dd4" />
          <stop offset="1" stopColor="#163e78" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="6" fill="url(#mark-face)" stroke="#0b2f66" />
      <polygon points="24,11 35,17.5 35,30.5 24,37 13,30.5 13,17.5" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function Flap({ value }) {
  const [tick, setTick] = useState(0);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      setTick((current) => current + 1);
    }
  }, [value]);
  return <strong key={tick} className="flap">{value}</strong>;
}

function TrainView({ config, setConfig, running, onStart, onSmoke, onStop, metrics, logs, current, snapshot, live }) {
  const update = (key, value) => setConfig((currentConfig) => ({ ...currentConfig, [key]: value }));
  return (
    <div className="train-layout">
      <section className="plate">
        <h2>Launch</h2>
        <div className="plate-body">
          <div className="form-grid">
            <Field label="Timesteps" value={config.timesteps} onChange={(v) => update("timesteps", v)} />
            <Select label="Device" value={config.device} onChange={(v) => update("device", v)} options={["cuda", "auto", "cpu"]} />
            <Select label="Robot" value={config.robotProfile} onChange={(v) => update("robotProfile", v)} options={["2025-robot", "sim"]} />
            <Select label="Preview" value={config.preview} onChange={(v) => update("preview", v)} options={["desktop", "both", "advantagescope", "none"]} />
            <Field label="Model Out" value={config.modelOut} onChange={(v) => update("modelOut", v)} wide />
            <Field label="Resume From" value={config.resumeFrom} onChange={(v) => update("resumeFrom", v)} wide />
            <Field label="Parallel Envs" value={config.nEnvs} onChange={(v) => update("nEnvs", v)} />
            <Field label="Rollout Steps" value={config.nSteps} onChange={(v) => update("nSteps", v)} />
            <Field label="Batch Size" value={config.batchSize} onChange={(v) => update("batchSize", v)} />
            <Field label="Learning Rate" value={config.learningRate} onChange={(v) => update("learningRate", v)} />
            <Field label="Checkpoint Every" value={config.checkpointEvery} onChange={(v) => update("checkpointEvery", v)} />
          </div>
          <div className="switch-row">
            <label><input type="checkbox" checked={config.pretrain} onChange={(e) => update("pretrain", e.target.checked)} /> Heuristic pretrain</label>
            <label><input type="checkbox" checked={config.advantageScope} onChange={(e) => update("advantageScope", e.target.checked)} /> AdvantageScope stream</label>
          </div>
          <div className="action-row">
            <button className="primary" type="button" disabled={running} onClick={onStart}>Start Training</button>
            <button type="button" disabled={running} onClick={onSmoke}>Smoke Test</button>
            <button className="danger" type="button" disabled={!running} onClick={onStop}>Stop</button>
          </div>
        </div>
      </section>

      <section className="plate">
        <h2>Current</h2>
        <div className="plate-body">
          <TrainingStatus logs={logs} current={current} metrics={metrics} timesteps={config.timesteps} />
        </div>
      </section>

      <div className="canvases">
        <section className="plate">
          <h2>Reward</h2>
          <div className="canvas-frame"><MetricChart metrics={metrics} /></div>
        </section>
        <FieldView snapshot={snapshot} live={live} />
      </div>
    </div>
  );
}

function TrainingStatus({ logs, current, metrics, timesteps }) {
  const status = useMemo(() => deriveTrainingStatus(logs, current, metrics), [logs, current, metrics]);
  const fill = phaseFill(status.phases, metrics, timesteps);
  return (
    <div>
      <div className="phase-list">
        {status.phases.map((phase) => (
          <div key={phase.label} className={`phase ${phase.state}`}>
            <span className="phase-dot" />
            <strong>{phase.label}</strong>
            <small>{phase.detail}</small>
            {phase.state === "active" && (
              <div className="phase-bar" aria-hidden="true"><span style={{ width: `${fill}%` }} /></div>
            )}
          </div>
        ))}
      </div>
      {logs.length > 0 && <pre className="mini-terminal">{logs.slice(-8).join("\n")}</pre>}
    </div>
  );
}

function FieldView({ snapshot, live, tall }) {
  return (
    <section className="plate">
      <h2>
        Field
        <span className={live ? "live-pill" : "live-pill idle"}>{live ? "Live" : "Demo"}</span>
      </h2>
      <div className={tall ? "canvas-frame tall" : "canvas-frame"}>
        <FieldCanvas snapshot={snapshot} />
      </div>
    </section>
  );
}

function ModelsView({ artifacts, selectedModel, setSelectedModel, running, onEvaluate, onReplay }) {
  return (
    <section className="plate">
      <h2>Models</h2>
      <div className="plate-body">
        <div className="model-actions">
          <button type="button" disabled={running || !selectedModel} onClick={onEvaluate}>Evaluate</button>
          <button className="primary" type="button" disabled={running || !selectedModel} onClick={onReplay}>Run in Field</button>
          {selectedModel && <span className="selected-model">{selectedModel}</span>}
        </div>
      </div>
      {artifacts.length > 0 ? (
        <div className="table">
          {artifacts.map((item) => (
            <button key={item.path} type="button" className={selectedModel === item.path ? "row selected" : "row"} onClick={() => setSelectedModel(item.path)}>
              <span>{item.path}</span>
              <small>{selectedModel === item.path ? "Selected" : "On disk"} · {item.size} · {item.modified}</small>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">No model archives found in models or runs.</div>
      )}
    </section>
  );
}

function LogsView({ logs, cli, setCli, onRun, running }) {
  const tail = logs.slice(-700).join("\n");
  return (
    <section className="plate logs-panel">
      <h2>Live Log</h2>
      <div className="plate-body" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div className="cli-row">
          <input aria-label="Command" value={cli} onChange={(e) => setCli(e.target.value)} />
          <button type="button" disabled={running} onClick={onRun}>Run CLI</button>
        </div>
        <pre>{tail || "No log lines yet."}</pre>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, wide }) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MetricChart({ metrics }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawChart(ctx, rect.width, rect.height, metrics);
  }, [metrics]);
  return <canvas className="chart" ref={canvasRef} />;
}

function FieldCanvas({ snapshot }) {
  const ref = useRef(null);
  const snapshotRef = useRef(snapshot);
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const nextW = Math.floor(rect.width * ratio);
      const nextH = Math.floor(rect.height * ratio);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawField(ctx, rect.width, rect.height, snapshotRef.current);
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return <canvas className="field-canvas" ref={ref} aria-label="Field" />;
}

function drawChart(ctx, width, height, metrics) {
  const pad = 22;
  ctx.fillStyle = "#f6f9fd";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#dce5f1";
  ctx.lineWidth = 1;
  for (let x = pad; x < width; x += 28) line(ctx, x, pad, x, height - pad);
  for (let y = pad; y < height; y += 28) line(ctx, pad, y, width - pad, y);
  const points = metrics.filter((m) => Number.isFinite(m.reward) && Number.isFinite(m.step));
  ctx.fillStyle = "#4e5d75";
  ctx.font = "700 12px Tahoma, Verdana, sans-serif";
  if (points.length === 0) {
    ctx.fillText("Waiting for trainer metrics", 16, 28);
    return;
  }
  if (points.length === 1) {
    dot(ctx, width / 2, height / 2, 5, "#1f58a8");
    ctx.fillText(`Latest reward ${formatMetric(points[0].reward)}`, 16, 28);
    return;
  }
  const xs = points.map((p) => p.step);
  const ys = points.map((p) => p.reward);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (Math.abs(maxY - minY) < 1e-6) {
    minY -= 1;
    maxY += 1;
  }
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  ctx.font = "600 11px Tahoma, Verdana, sans-serif";
  ctx.fillText(`max ${formatMetric(maxY)}`, width - 88, 16);
  ctx.fillText(`min ${formatMetric(minY)}`, width - 88, height - 8);
  if (minY < 0 && maxY > 0) {
    const zeroY = height - pad - ((0 - minY) / spanY) * (height - pad * 2);
    ctx.strokeStyle = "#7a8ea9";
    line(ctx, pad, zeroY, width - pad, zeroY);
  }
  const mapped = points.map((p) => ({
    x: pad + ((p.step - minX) / spanX) * (width - pad * 2),
    y: height - pad - ((p.reward - minY) / spanY) * (height - pad * 2)
  }));
  const first = mapped[0];
  const last = mapped.at(-1);
  ctx.beginPath();
  mapped.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.lineTo(last.x, height - pad);
  ctx.lineTo(first.x, height - pad);
  ctx.closePath();
  ctx.fillStyle = "rgba(31, 88, 168, 0.14)";
  ctx.fill();
  ctx.beginPath();
  mapped.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.strokeStyle = "#1f58a8";
  ctx.lineWidth = 2;
  ctx.stroke();
  dot(ctx, last.x, last.y, 4, "#1f58a8");
}

function drawField(ctx, width, height, snap) {
  drawNeuronField(ctx, width, height, snap);
}

function deriveTrainingStatus(logs, current, metrics) {
  const text = logs.join("\n");
  const latest = logs.at(-1) || "";
  const epochMatches = [...text.matchAll(/Heuristic pretrain epoch\s+(\d+)\/(\d+):\s+loss=([0-9.]+)/g)];
  const lastEpoch = epochMatches.at(-1);
  const metric = metrics.at(-1);
  const phases = [
    phase("Environment", /Using device:|CUDA device:/.test(text), current === "Setup + Install Training Dependencies", firstMatch(text, /Using device:.*|CUDA device:.*/)),
    phase("Heuristic training", Boolean(lastEpoch), /Heuristic pretraining/.test(text) && !/Training metrics will be written/.test(text), lastEpoch ? `epoch ${lastEpoch[1]}/${lastEpoch[2]} loss ${lastEpoch[3]}` : "waiting for imitation pretrain"),
    phase("PPO training", Boolean(metric?.step), current === "Train PPO", metric?.step ? `step ${formatInt(metric.step)} reward ${formatMetric(metric.reward)}` : "waiting for rollout metrics"),
    phase("Visualizer", /visualization enabled|visualizer state/i.test(text), current === "Run Model in Field", firstMatch(text, /Training visualization enabled.*|Native .*visualizer state.*/i)),
    phase("Checkpoint", /Checkpoint saved:|Wrote .*\.zip/.test(text), false, firstMatch(text, /Checkpoint saved:.*|Wrote .*\.zip/))
  ];
  return { phases, current, detail: latest };
}

function phaseFill(phases, metrics, timesteps) {
  const active = phases.find((item) => item.state === "active");
  if (!active) return 0;
  if (active.label === "PPO training") {
    const step = Number(metrics.at(-1)?.step || 0);
    const total = Number(timesteps) || 1;
    return Math.max(6, Math.min(100, (step / total) * 100));
  }
  const epoch = String(active.detail).match(/epoch\s+(\d+)\/(\d+)/);
  if (epoch) return Math.max(6, Math.min(100, (Number(epoch[1]) / Number(epoch[2])) * 100));
  if (active.state === "active") return 28;
  return 0;
}

function phase(label, done, active, detail) {
  return { label, detail: detail || "not started", state: active ? "active" : done ? "done" : "pending" };
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[0] : "";
}

function demoSnapshot() {
  const reefCenter = { x: 4.48, y: 4.02 };
  return {
    running: false,
    policy: "desktop demo",
    field: {
      lengthM: 17.55,
      widthM: 8.05,
      reefCenter,
      reefObstacleRadiusM: 0.84,
      robotRadiusM: 0.46,
      coralStations: [{ x: 1.2, y: 1.1 }, { x: 1.2, y: 6.95 }],
      trafficPath: [{ x: 6.2, y: 1.3 }, { x: 8.8, y: 1.3 }, { x: 8.8, y: 6.7 }, { x: 6.2, y: 6.7 }],
      reefScoringPoses: Array.from({ length: 6 }, (_, i) => ({
        x: reefCenter.x + Math.cos((i * Math.PI) / 3) * 1.18,
        y: reefCenter.y + Math.sin((i * Math.PI) / 3) * 1.18,
        heading: 0
      }))
    },
    match: { timeRemainingS: 150, scoredCoral: 0, maxCoral: 12, targetLevel: "L4", totalReward: 0 },
    robot: { pose: { x: 2.4, y: 4.1, heading: 0.1 }, hasCoral: false },
    traffic: { pose: { x: 7.3, y: 2, heading: 1.57 }, distanceM: 5.1 },
    objective: { pose: { x: 4.95, y: 4.83, heading: 0 }, coralPose: { x: 1.2, y: 6.95, heading: 0 }, goalIndex: 1 },
    ai: { intent: "awaiting training", focus: "reef", confidence: 0.72, risk: 0.18 },
    training: { step: 0 }
  };
}

function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function dot(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function explainError(err) {
  const text = String(err);
  if (text.includes("reading 'main'") || text.includes("Wails") || text.includes("wails")) {
    return "Desktop bridge is not connected. Open Reefscape RL from the app window.";
  }
  return text;
}

function formatMetric(value) {
  if (!Number.isFinite(Number(value))) return "-";
  const n = Number(value);
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(3);
}
function formatInt(value) {
  return Number(value || 0).toLocaleString();
}

const rootElement = document.getElementById("root");
const root = rootElement._reefscapeRoot ?? createRoot(rootElement);
rootElement._reefscapeRoot = root;
root.render(<App />);
