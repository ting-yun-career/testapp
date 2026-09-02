import { useEffect, useRef, useState } from "react";
import type * as MatterNS from "matter-js";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";

const CONFIG_KEY = "gravity-config";

type GravityConfig = {
  spawnRate: number;
  gravity: number;
  poleCount: number;
  ballRadius: number;
  drainDelay: number;
};

const DEFAULT_CONFIG: GravityConfig = {
  spawnRate: 3,
  gravity: 1,
  poleCount: 60,
  ballRadius: 3,
  drainDelay: 2,
};

const MAX_DEVICE_PIXEL_RATIO = 2;

const POLE_RADIUS = 7;
const WALL_THICKNESS = 200;

// Poles fill a band clear of the spawn point at top and the settling zone
// at bottom, so balls have room to accelerate before the first deflection
// and a clear run once they've passed the last row.
const TOP_MARGIN_RATIO = 0.12;
const BOTTOM_MARGIN_RATIO = 0.12;

// Fraction of the viewport width the widest (bottom) pyramid row spans.
const PYRAMID_WIDTH_RATIO = 0.6;

// A ball spawning dead-center every time, into a perfectly symmetric pole
// grid, would retrace the same deterministic path forever — this jitter is
// what makes the field diverge, not cosmetic noise.
const SPAWN_JITTER_PX = 40;

const BALL_RESTITUTION = 0.55;
const POLE_RESTITUTION = 0.6;

// Resting balls fade out and get removed so the pile never grows without
// bound: once a ball has been asleep this long (config.drainDelay), it
// starts fading; once fully transparent, it's removed from the simulation.
const FADE_DURATION_S = 0.6;

// Hard backstop in case a ball somehow never settles (e.g. balanced on a
// pole edge), or the drain-delay slider plus max spawn rate would otherwise
// need more concurrent balls than is sensible to simulate — oldest ball is
// evicted instantly (no fade) rather than letting the sim grow unbounded.
// Sized to comfortably clear steady-state population at max spawn rate
// (100/s) and max drain delay, so this stays a rare backstop rather than
// the everyday removal path — if it's the thing actually evicting balls,
// they vanish abruptly instead of fading out.
const MAX_BALLS = 1300;

// Fixed physics timestep — Matter.js (like most impulse-based solvers)
// destabilizes with a variable step, and capping substeps per frame avoids
// a spiral of death after the tab is backgrounded and dt spikes.
const PHYSICS_STEP_MS = 1000 / 60;
const PHYSICS_STEP_S = PHYSICS_STEP_MS / 1000;
const MAX_SUBSTEPS = 5;

// Tailwind neutral-800, matching the fill used by the other widgets.
const POLE_STROKE = "rgba(38, 38, 38, 0.5)";
const POLE_STROKE_WIDTH = 1.5;
const BALL_BASE_ALPHA = 0.85;
const BALL_FILL = `rgba(38, 38, 38, ${BALL_BASE_ALPHA})`;

type PolePoint = { x: number; y: number };

type Ball = {
  body: MatterNS.Body;
  sleptFor: number;
  alpha: number;
  // Baked in at spawn — a ball's physics collision radius is fixed once its
  // Matter body is created, so it's drawn at that same radius even if the
  // config slider changes afterward (only newly spawned balls pick that up).
  radius: number;
};

// Lays out poles as a Galton-board / pachinko pyramid: row r has exactly
// r+1 pegs (1, 2, 3, ...), centered under the top-center spawn point,
// widening toward the bottom. A full-width grid (the previous layout)
// wastes poles balls never reach — with a single spawn point and modest
// jitter, only the central cone actually sees traffic.
//
// `count` is a target, not an exact output: rows*(rows+1)/2 (a triangular
// number) rarely equals `count` exactly, and forcing arbitrary row sizes to
// hit it exactly is what produced a jagged edge (some rows 2+ pegs wider
// than the row above). Snapping to the nearest triangular number instead
// keeps every row's width a clean, uninterrupted step from the last.
function computePoles(width: number, height: number, count: number): PolePoint[] {
  if (count <= 0 || width <= 0 || height <= 0) return [];

  const top = height * TOP_MARGIN_RATIO;
  const bottom = height * (1 - BOTTOM_MARGIN_RATIO);
  const bandHeight = Math.max(1, bottom - top);

  // Triangular numbers: after `rows` rows of 1, 2, 3, ... pegs, the total is
  // rows*(rows+1)/2 — solve that for rows given the target count.
  const rows = Math.max(1, Math.round((Math.sqrt(8 * count + 1) - 1) / 2));
  const rowPitch = bandHeight / (rows + 1);

  // A single fixed horizontal pitch, shared by every row — narrower rows
  // simply use fewer of the same-spaced slots, which is what produces the
  // taper. Sizing colPitch per row instead (like the old grid layout did)
  // would stretch every row to the same width and erase the pyramid shape.
  const colPitch = (width * PYRAMID_WIDTH_RATIO) / Math.max(1, rows - 1);

  const points: PolePoint[] = [];
  for (let r = 0; r < rows; r++) {
    const cols = r + 1;
    const y = top + rowPitch * (r + 1);
    for (let c = 0; c < cols; c++) {
      const x = width / 2 + (c - (cols - 1) / 2) * colPitch;
      points.push({ x, y });
    }
  }
  return points;
}

function Gravity() {
  const { width, height } = useViewportSize();
  const [config, setConfig] = useSessionConfig<GravityConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [paused] = useState(prefersReducedMotion);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);

  const { poleCount } = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cancelled = false;
    let teardown: (() => void) | null = null;

    import("matter-js").then((mod) => {
      if (cancelled) return;

      const Matter = ((mod as { default?: typeof MatterNS }).default ??
        (mod as unknown as typeof MatterNS));
      const { Engine, Bodies, Composite } = Matter;

      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = configRef.current.gravity;

      const poles = computePoles(width, height, poleCount);
      const poleBodies = poles.map((p) =>
        Bodies.circle(p.x, p.y, POLE_RADIUS, {
          isStatic: true,
          restitution: POLE_RESTITUTION,
          friction: 0.05,
        }),
      );

      const wallOptions = { isStatic: true, friction: 0.1, restitution: 0.3 };
      const walls = [
        // Inner faces sit at x=0, x=width, y=height; thick and extended past
        // the corners so a fast ball can't tunnel through at a grazing angle.
        Bodies.rectangle(
          -WALL_THICKNESS / 2,
          height / 2,
          WALL_THICKNESS,
          height + WALL_THICKNESS * 2,
          wallOptions,
        ),
        Bodies.rectangle(
          width + WALL_THICKNESS / 2,
          height / 2,
          WALL_THICKNESS,
          height + WALL_THICKNESS * 2,
          wallOptions,
        ),
        Bodies.rectangle(
          width / 2,
          height + WALL_THICKNESS / 2,
          width + WALL_THICKNESS * 2,
          WALL_THICKNESS,
          wallOptions,
        ),
      ];

      Composite.add(engine.world, [...poleBodies, ...walls]);
      ballsRef.current = [];

      const draw = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // One path covering every pole, one stroke call, rather than a
        // beginPath/stroke pair per pole. Note this is tidiness, not a
        // meaningful optimization: measured, the whole of draw() costs well
        // under 1ms even at ~1400 shapes. Engine.update dominates the frame.
        ctx.strokeStyle = POLE_STROKE;
        ctx.lineWidth = POLE_STROKE_WIDTH;
        ctx.beginPath();
        for (const p of poles) {
          ctx.moveTo(p.x + POLE_RADIUS, p.y);
          ctx.arc(p.x, p.y, POLE_RADIUS, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Same for balls, split on alpha: the overwhelming majority are
        // fully settled and share one exact fillStyle, so they batch into a
        // single path + fill. Only the (typically few dozen at most)
        // currently-fading balls have a continuously varying alpha and need
        // their own fillStyle/fill call each.
        ctx.fillStyle = BALL_FILL;
        ctx.beginPath();
        for (const b of ballsRef.current) {
          if (b.alpha < 1) continue;
          ctx.moveTo(b.body.position.x + b.radius, b.body.position.y);
          ctx.arc(b.body.position.x, b.body.position.y, b.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        for (const b of ballsRef.current) {
          if (b.alpha >= 1) continue;
          ctx.fillStyle = `rgba(38, 38, 38, ${(BALL_BASE_ALPHA * b.alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(b.body.position.x, b.body.position.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      draw();

      if (paused) {
        teardown = () => {
          Composite.clear(engine.world, false);
          Engine.clear(engine);
          ballsRef.current = [];
        };
        return;
      }

      const spawnBall = () => {
        const radius = configRef.current.ballRadius;
        const x = width / 2 + (Math.random() * 2 - 1) * SPAWN_JITTER_PX;
        const body = Bodies.circle(x, -radius * 2, radius, {
          restitution: BALL_RESTITUTION,
          friction: 0.05,
          frictionAir: 0.01,
        });
        Composite.add(engine.world, body);
        ballsRef.current.push({ body, sleptFor: 0, alpha: 1, radius });

        if (ballsRef.current.length > MAX_BALLS) {
          const oldest = ballsRef.current.shift();
          if (oldest) Composite.remove(engine.world, oldest.body);
        }
      };

      let frameId = 0;
      let last = performance.now();
      let physicsAcc = 0;
      let spawnAcc = 0;

      const loop = (now: number) => {
        const dt = Math.min(
          (now - last) / 1000,
          MAX_SUBSTEPS * PHYSICS_STEP_S,
        );
        last = now;

        const c = configRef.current;
        engine.gravity.y = c.gravity;

        physicsAcc += dt;
        let steps = 0;
        while (physicsAcc >= PHYSICS_STEP_S && steps < MAX_SUBSTEPS) {
          Engine.update(engine, PHYSICS_STEP_MS);
          physicsAcc -= PHYSICS_STEP_S;
          steps++;
        }
        if (steps === MAX_SUBSTEPS) physicsAcc = 0;

        const spawnInterval = 1 / Math.max(0.1, c.spawnRate);
        spawnAcc += dt;
        while (spawnAcc >= spawnInterval) {
          spawnBall();
          spawnAcc -= spawnInterval;
        }

        const drainDelay = c.drainDelay;
        const balls = ballsRef.current;
        for (let i = balls.length - 1; i >= 0; i--) {
          const b = balls[i];
          if (!b.body.isSleeping) {
            b.sleptFor = 0;
            b.alpha = 1;
            continue;
          }
          b.sleptFor += dt;
          if (b.sleptFor <= drainDelay) continue;
          b.alpha = Math.max(0, 1 - (b.sleptFor - drainDelay) / FADE_DURATION_S);
          if (b.alpha <= 0) {
            Composite.remove(engine.world, b.body);
            balls.splice(i, 1);
          }
        }

        draw();
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);

      teardown = () => {
        cancelAnimationFrame(frameId);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        ballsRef.current = [];
      };
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [width, height, poleCount, paused]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      />

      <ConfigPanel>
        <SliderControl
          label="Spawn rate"
          value={config.spawnRate}
          min={0.5}
          max={100}
          step={0.5}
          format={(v) => `${v}/s`}
          onChange={(v) => setConfig((c) => ({ ...c, spawnRate: v }))}
        />
        <SliderControl
          label="Gravity"
          value={config.gravity}
          min={0.2}
          max={2.5}
          step={0.1}
          onChange={(v) => setConfig((c) => ({ ...c, gravity: v }))}
        />
        <SliderControl
          label="Poles"
          value={config.poleCount}
          min={10}
          max={200}
          step={5}
          onChange={(v) => setConfig((c) => ({ ...c, poleCount: v }))}
        />
        <SliderControl
          label="Ball size"
          value={config.ballRadius}
          min={1}
          max={10}
          step={0.5}
          format={(v) => `${v}px`}
          onChange={(v) => setConfig((c) => ({ ...c, ballRadius: v }))}
        />
        <SliderControl
          label="Drain delay"
          value={config.drainDelay}
          min={0.5}
          max={10}
          step={0.5}
          format={(v) => `${v}s`}
          onChange={(v) => setConfig((c) => ({ ...c, drainDelay: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Gravity;
