import fieldSource from "./reefscape-field.json";

const ROBOT_FOOTPRINT_M = 0.76;
const OBSTACLE_COLORS = {
  wall: "#2c3a4e",
  reef: "#2f6fae",
  processor: "#6d3cc4",
  barge: "#0f766e",
  cage: "#0e7490",
  other: "#4b5a70"
};
const ZONE_FILL = {
  blue: "rgba(31, 88, 168, 0.18)",
  red: "rgba(176, 42, 48, 0.16)",
  neutral: "rgba(75, 90, 112, 0.10)"
};
const SOURCE_COLOR = "#1b7a4e";
const SOURCE_FILL = "rgba(47, 138, 59, 0.22)";
const ACTION_COLORS = {
  idle: "#7b8ca3",
  starting: "#d97706",
  running: "#2f8a3b",
  complete: "#1f58a8",
  failed: "#b02a30",
  cancelled: "#7c3aed"
};
const CANVAS_FILL = "#eef3fa";
const CARPET_FILL = "#d5dde8";
const CANVAS_INK = "#4e5d75";
const PEG_COLORS = {
  L1: { fill: "#7dd3fc", stroke: "#0c4a6e" },
  L2: { fill: "#86efac", stroke: "#14532d" },
  L3: { fill: "#fde047", stroke: "#713f12" },
  L4: { fill: "#f9a8d4", stroke: "#831843" }
};
const SEGMENT_PX = 7;
const GAP_PX = 1;
const WIDTH_PX = 8;

const field = indexReef(fieldSource);

function indexReef(source) {
  const next = source;
  const targets = new Map();
  const pegs = new Map();
  const troughs = new Map();
  for (const slot of next.scoring_locations || []) {
    if (!slot || slot.id == null || !slot.alliance) continue;
    const pipe = /^(face\d+)_p(\d+)_l[234]$/i.exec(slot.id);
    const trough = /^(face\d+)_trough$/i.exec(slot.id);
    if (pipe) {
      const key = `${slot.alliance}:${pipe[1]}:p${pipe[2]}`;
      let peg = pegs.get(key);
      if (!peg) {
        peg = { alliance: slot.alliance, x: slot.x, y: slot.y, normal: slot.normal || 0 };
        pegs.set(key, peg);
      }
      targets.set(`${slot.alliance}:${slot.id}`, peg);
    } else if (trough) {
      const key = `${slot.alliance}:${trough[1]}`;
      const faceTrough = {
        alliance: slot.alliance,
        x: slot.x,
        y: slot.y,
        normal: slot.normal || 0
      };
      troughs.set(key, faceTrough);
      targets.set(`${slot.alliance}:${slot.id}`, faceTrough);
    }
  }
  next.reefPegs = [...pegs.values()];
  next.reefTroughs = [...troughs.values()];
  next.reefTargetById = targets;
  return next;
}

function project(bounds, width, height) {
  const pad = 10;
  const usableW = width - 2 * pad;
  const usableH = height - 2 * pad;
  const scale = Math.min(usableW / (bounds.max_x - bounds.min_x), usableH / (bounds.max_y - bounds.min_y));
  const offX = pad + (usableW - (bounds.max_x - bounds.min_x) * scale) / 2;
  const offY = pad + (usableH - (bounds.max_y - bounds.min_y) * scale) / 2;
  return {
    scale,
    toPx(x, y) {
      return [offX + (x - bounds.min_x) * scale, offY + (bounds.max_y - y) * scale];
    }
  };
}

function polygonPath(ctx, projection, points) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const [px, py] = projection.toPx(point.x, point.y);
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function robotCorners(pose) {
  const half = ROBOT_FOOTPRINT_M / 2;
  const cos = Math.cos(pose.theta);
  const sin = Math.sin(pose.theta);
  return [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half]
  ].map(([lx, ly]) => ({ x: pose.x + lx * cos - ly * sin, y: pose.y + lx * sin + ly * cos }));
}

function drawTargetPose(ctx, projection, target) {
  if (!target) return;
  const color = "#a21caf";
  polygonPath(ctx, projection, robotCorners(target));
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
  const [cx, cy] = projection.toPx(target.x, target.y);
  const [hx, hy] = projection.toPx(
    target.x + Math.cos(target.theta) * ROBOT_FOOTPRINT_M,
    target.y + Math.sin(target.theta) * ROBOT_FOOTPRINT_M
  );
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRobot(ctx, projection, snapshot) {
  if (!snapshot?.pose) return;
  if (snapshot.showTarget) drawTargetPose(ctx, projection, snapshot.target_pose);
  const pose = snapshot.pose;
  const stateKey = snapshot.action_state || "idle";
  polygonPath(ctx, projection, robotCorners(pose));
  ctx.fillStyle = ACTION_COLORS[stateKey] || ACTION_COLORS.idle;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = (snapshot.robot_id || "").startsWith("red") ? "#b4232c" : "#1f58a8";
  ctx.lineWidth = 2;
  ctx.stroke();

  const [cx, cy] = projection.toPx(pose.x, pose.y);
  const [hx, hy] = projection.toPx(
    pose.x + Math.cos(pose.theta) * ROBOT_FOOTPRINT_M,
    pose.y + Math.sin(pose.theta) * ROBOT_FOOTPRINT_M
  );
  ctx.strokeStyle = "#1a2638";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.stroke();

  if (snapshot.velocity) {
    const [vx, vy] = projection.toPx(
      pose.x + snapshot.velocity.x * 0.5,
      pose.y + snapshot.velocity.y * 0.5
    );
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.stroke();
  }

  if (snapshot.held_piece) {
    const [px, py] = projection.toPx(
      pose.x + Math.cos(pose.theta) * ROBOT_FOOTPRINT_M * 0.7,
      pose.y + Math.sin(pose.theta) * ROBOT_FOOTPRINT_M * 0.7
    );
    ctx.fillStyle = "#f59e0b";
    ctx.strokeStyle = "#7a4600";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawSegment(ctx, x, y, normal, level, filled, active) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-normal);
  ctx.fillStyle = filled ? PEG_COLORS[level].fill : CANVAS_FILL;
  ctx.globalAlpha = filled ? 1 : 0.7;
  ctx.fillRect(-SEGMENT_PX / 2, -WIDTH_PX / 2, SEGMENT_PX, WIDTH_PX);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = active ? "#f59e0b" : PEG_COLORS[level].stroke;
  ctx.lineWidth = active ? 2 : 1;
  ctx.setLineDash(active ? [2, 1] : []);
  ctx.strokeRect(-SEGMENT_PX / 2, -WIDTH_PX / 2, SEGMENT_PX, WIDTH_PX);
  ctx.restore();
}

function drawReefPegs(ctx, projection, active) {
  const activeTarget = active?.alliance && active?.target
    ? field.reefTargetById.get(`${active.alliance}:${active.target}`)
    : null;
  for (const peg of field.reefPegs || []) {
    const [px, py] = projection.toPx(peg.x, peg.y);
    const outwardX = Math.cos(peg.normal);
    const outwardY = -Math.sin(peg.normal);
    ["L4", "L3", "L2"].forEach((level, index) => {
      const distance = (index - 1) * (SEGMENT_PX + GAP_PX);
      drawSegment(
        ctx,
        px + outwardX * distance,
        py + outwardY * distance,
        peg.normal,
        level,
        false,
        activeTarget === peg && active.level === level
      );
    });
  }
  for (const trough of field.reefTroughs || []) {
    const [px, py] = projection.toPx(trough.x, trough.y);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-trough.normal);
    ctx.fillStyle = CANVAS_FILL;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-13, -WIDTH_PX / 2, 26, WIDTH_PX);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = activeTarget === trough ? "#f59e0b" : PEG_COLORS.L1.stroke;
    ctx.lineWidth = activeTarget === trough ? 2 : 1;
    ctx.setLineDash(activeTarget === trough ? [3, 2] : []);
    ctx.strokeRect(-13, -WIDTH_PX / 2, 26, WIDTH_PX);
    ctx.restore();
  }
  ctx.setLineDash([]);
}

function activeScore(snap) {
  const pose = snap?.objective?.pose;
  if (!pose) return null;
  const wanted = snap.match?.targetLevel || "L4";
  let best = null;
  let bestD = Infinity;
  for (const slot of field.scoring_locations || []) {
    if (slot.alliance !== "blue" || slot.level !== wanted) continue;
    const dx = slot.x - pose.x;
    const dy = slot.y - pose.y;
    const distance = dx * dx + dy * dy;
    if (distance < bestD) {
      bestD = distance;
      best = slot;
    }
  }
  if (!best) return null;
  return { alliance: best.alliance, target: best.id, level: best.level };
}

function poseOf(pose) {
  if (!pose) return null;
  return { x: pose.x, y: pose.y, theta: pose.heading || pose.theta || 0 };
}

function robotsFrom(snap) {
  const robots = [];
  const player = poseOf(snap?.robot?.pose);
  if (player) {
    robots.push({
      robot_id: "blue",
      pose: player,
      velocity: snap.robot.velocity || null,
      held_piece: snap.robot.hasCoral ? "coral" : null,
      action_state: snap.running ? "running" : "idle",
      showTarget: true,
      target_pose: poseOf(snap.objective?.pose)
    });
  }
  const traffic = poseOf(snap?.traffic?.pose);
  if (traffic) {
    robots.push({
      robot_id: "red",
      pose: traffic,
      action_state: "idle"
    });
  }
  return robots;
}

export function drawNeuronField(ctx, width, height, snap) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = CANVAS_FILL;
  ctx.fillRect(0, 0, width, height);

  const projection = project(field.bounds, width, height);
  const bounds = field.bounds;
  polygonPath(ctx, projection, [
    { x: bounds.min_x, y: bounds.min_y },
    { x: bounds.max_x, y: bounds.min_y },
    { x: bounds.max_x, y: bounds.max_y },
    { x: bounds.min_x, y: bounds.max_y }
  ]);
  ctx.fillStyle = CARPET_FILL;
  ctx.fill();
  ctx.strokeStyle = "#4b6185";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (const zone of field.zones || []) {
    polygonPath(ctx, projection, zone.vertices);
    ctx.fillStyle = ZONE_FILL[zone.owner] || ZONE_FILL.neutral;
    ctx.fill();
  }

  for (const obstacle of field.obstacles || []) {
    polygonPath(ctx, projection, obstacle.vertices);
    if (obstacle.kind === "wall") {
      ctx.strokeStyle = OBSTACLE_COLORS.wall;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = OBSTACLE_COLORS[obstacle.kind] || OBSTACLE_COLORS.other;
      ctx.globalAlpha = 0.62;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = OBSTACLE_COLORS[obstacle.kind] || OBSTACLE_COLORS.other;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
  }

  ctx.font = "11px Consolas, 'Lucida Console', monospace";
  for (const source of field.sources || []) {
    const [px, py] = projection.toPx(source.pose.x, source.pose.y);
    const [hx, hy] = projection.toPx(
      source.pose.x + Math.cos(source.pose.theta) * 0.5,
      source.pose.y + Math.sin(source.pose.theta) * 0.5
    );
    ctx.fillStyle = SOURCE_FILL;
    ctx.strokeStyle = SOURCE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py - 6);
    ctx.lineTo(px + 6, py);
    ctx.lineTo(px, py + 6);
    ctx.lineTo(px - 6, py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.fillStyle = SOURCE_COLOR;
    ctx.fillText(source.id, px + 9, py + 4);
  }

  for (const [name, pose] of Object.entries(field.starting_positions || {})) {
    const [px, py] = projection.toPx(pose.x, pose.y);
    ctx.strokeStyle = CANVAS_INK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 5, py);
    ctx.lineTo(px + 5, py);
    ctx.moveTo(px, py - 5);
    ctx.lineTo(px, py + 5);
    ctx.stroke();
    ctx.fillStyle = CANVAS_INK;
    ctx.fillText(name, px + 7, py - 5);
  }

  const active = activeScore(snap);
  for (const robot of robotsFrom(snap)) drawRobot(ctx, projection, robot);
  drawReefPegs(ctx, projection, active);

  const match = snap?.match || {};
  const timeLeft = Number(match.timeRemainingS);
  ctx.fillStyle = CANVAS_INK;
  ctx.font = "12px Consolas, 'Lucida Console', monospace";
  ctx.fillText(
    `${snap?.running ? "live" : "demo"}  coral ${match.scoredCoral ?? 0}/${match.maxCoral ?? 0}  ${Number.isFinite(timeLeft) ? timeLeft.toFixed(1) : "-"}s`,
    16,
    height - 12
  );
}
