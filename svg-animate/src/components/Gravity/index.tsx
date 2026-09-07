import { useEffect, useRef, useState } from "react";
import type * as MatterNS from "matter-js";
import { useViewportSize } from "../../hooks/useViewportSize";
import ChoiceControl from "../ChoiceControl";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";
import { BOARD_THICKNESS, computePivotBoard, computePoles } from "./fields";

const CONFIG_KEY = "gravity-config";

type GravityVariant = "poles" | "boards";

type GravityConfig = {
  variant: GravityVariant;
  spawnRate: number;
  gravity: number;
  poleCount: number;
  boardLength: number;
  boardTilt: number;
  ballRadius: number;
  drainDelay: number;
};

const DEFAULT_CONFIG: GravityConfig = {
  variant: "poles",
  spawnRate: 3,
  gravity: 1,
  poleCount: 60,
  boardLength: 45,
  boardTilt: 14,
  ballRadius: 3,
  drainDelay: 2,
};

const VARIANT_OPTIONS: { value: GravityVariant; label: string }[] = [
  { value: "poles", label: "Poles" },
  { value: "boards", label: "Boards" },
];

const MAX_DEVICE_PIXEL_RATIO = 2;

const POLE_RADIUS = 7;
const WALL_THICKNESS = 200;

// A ball spawning dead-center every time, into a perfectly symmetric pole
// grid, would retrace the same deterministic path forever — this jitter is
// what makes the field diverge, not cosmetic noise.
const SPAWN_JITTER_PX = 40;

const BALL_RESTITUTION = 0.55;
const POLE_RESTITUTION = 0.6;

// The board is deliberately slippery. A ball needs friction above tan(tilt) —
// ~0.32 at the 18° maximum — to hold still on a slope, so anything near that
// would park sleeping balls on the board itself. Well below it, balls always
// slide off the low end and settle in the floor pile, where the existing
// sleep/fade/drain path already handles them.
const BOARD_FRICTION = 0.03;
const BOARD_RESTITUTION = 0.35;
const BOARD_CHAMFER_RADIUS = 2;

// The board is a normal dynamic body — balls tip it by real impulse — but its
// center is re-pinned to the pivot after every step and its linear velocity
// zeroed, so the only degree of freedom it keeps is rotation about that point.
// A Matter Constraint would do the same job softly (and visibly sag under a
// heavy pile); pinning is exact.
//
// Restoring torque is what keeps it teetering: without it the board tips to a
// stop, the balls slide off, and it stays leaning there with nothing to bring
// it back. Scaled by the body's own inertia so the feel doesn't change when
// the length slider changes the board's mass.
//
// BOARD_RESTORE_ACCEL is an angular acceleration in rad/s², which is NOT the
// unit Matter integrates in: it computes `angularVelocity += (torque /
// inertia) * deltaTimeSquared` with deltaTime in *milliseconds*, and its
// angularVelocity is rad per step, not per second. Converting rad/s² to that
// costs a factor of h² (h = 1/60 s) for the seconds and a factor of
// (1000/60)² for the millisecond deltaTimeSquared Matter multiplies back in —
// which is exactly 1e6. Skipping this conversion overdrives the spring by six
// orders of magnitude: the board snaps between its two stops every frame.
const BOARD_RESTORE_ACCEL = 5;
const RAD_PER_S2_TO_MATTER_TORQUE = 1e-6;

// Per-step velocity decay (Matter applies frictionAir to angular velocity as
// well as linear), so the teeter settles instead of ringing forever.
const BOARD_ANGULAR_DAMPING = 0.01;

// The board keeps Matter's default density — mass ~180x a 3px ball — because
// contact separation is split by inverse mass: a board light enough for balls
// to swing around is also one they visibly sink into and squeeze through.
//
// Responsiveness comes from inertia instead, which is what actually sets how
// far a ball tips it (deflection goes as 1/(inertia * BOARD_RESTORE_ACCEL),
// while the teeter's period goes as 1/sqrt(BOARD_RESTORE_ACCEL) alone). A
// uniform beam's inertia is mass*length²/3; a fraction of that is a beam with
// its mass gathered at the hub and light arms, which is both a real object and
// the one that reads as a seesaw. Measured over 40s runs, this pairing swings
// a few degrees either way, touches the stops occasionally, and crosses level
// about once every 4s.
const BOARD_INERTIA_COEFF = 0.01;

// Backstop on how fast the board may sweep, so a slam into the tilt stop can't
// carry its surface across a resting ball in a single step.
const BOARD_MAX_ANGULAR_SPEED = 2 / 60;

// Balls reach ~15px/step at gravity 1 and ~24px/step at 2.5 by the time they
// reach the board, which is more than the board is thick. See
// holdBallsOffBoard for why that has to be resolved by hand.
const BOARD_SWEEP_RESTITUTION = 0.3;

// Overlap left alone as ordinary resting contact — Matter's own solver keeps
// a ball a fraction of a pixel inside whatever it rests on, and correcting
// that every step would buzz.
const BOARD_CONTACT_TOLERANCE = 0.5;

// Inward speed below which a ball is treated as lying on the board rather than
// striking it. One step of gravity is ~0.3px/step (0.7 at the top of the
// slider), so this sits clear of that: bouncing a resting ball back every step
// would leave the whole pile shivering.
const BOARD_IMPACT_SPEED = 1.5;

// Every few seconds a dense load of ordinary balls is dumped on whichever end
// of the board is raised, to break up a long one-sided lean. One heavy ball
// isn't enough — the board shrugs off a single impulse — where a slug of this
// many keeps the weight on that arm for as long as it takes to come down.
//
// They are laid out in a grid stacked above the top edge rather than all at
// one point: same-frame spawns at the same spot start out overlapping, and
// the solver's answer to that is to fire them apart.
const LOAD_INTERVAL_S = 5;
const LOAD_INTERVAL_JITTER = 0.4;
const LOAD_COUNT = 30;

// Fractions of the raised arm the load covers — out where the leverage is,
// but stopping short of the tip, where a near miss just falls past the end.
const LOAD_BAND_INNER = 0.45;
const LOAD_BAND_OUTER = 0.95;

// Grid pitch, in ball radii. Above 2 so neighbours start out clear of each
// other with room for a little jitter.
const LOAD_CELL_RADII = 2.6;

const LOAD_LEVEL_EPS = (1 * Math.PI) / 180;

// Drawn-only marker on the pivot — a collision body there would block balls
// from passing beneath the board.
const PIVOT_DOT_RADIUS = 5;

// Slack added to a "was this ball resting against the removed one" check —
// generous enough to catch real contact despite floating-point/solver
// slop, without being so wide it wakes balls that were never touching.
const WAKE_CONTACT_SLACK_PX = 3;

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
const OBSTACLE_STROKE = "rgba(38, 38, 38, 0.5)";
const OBSTACLE_STROKE_WIDTH = 1.5;
const BALL_BASE_ALPHA = 0.85;
const BALL_FILL = `rgba(38, 38, 38, ${BALL_BASE_ALPHA})`;

type Ball = {
  body: MatterNS.Body;
  sleptFor: number;
  alpha: number;
  // Baked in at spawn — a ball's physics collision radius is fixed once its
  // Matter body is created, so it's drawn at that same radius even if the
  // config slider changes afterward (only newly spawned balls pick that up).
  radius: number;
  // Which face of the board this ball was last seen clear of: -1 above, 1
  // below, 0 not yet known (or off the ends, where there is no face to be on).
  // Matter's own positionPrev cannot answer this — when the solver ejects a
  // ball through the board it shifts positionPrev by the same correction, so
  // the ball's history says it was always on the side it was wrongly pushed to.
  boardFace: -1 | 0 | 1;
};

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

  const { variant, poleCount, boardLength, boardTilt } = config;

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
      const { Engine, Bodies, Body, Composite, Sleeping } = Matter;

      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = configRef.current.gravity;

      const isBoards = variant === "boards";
      const poles = isBoards ? [] : computePoles(width, height, poleCount);
      const pivot = isBoards
        ? computePivotBoard(width, height, boardLength / 100)
        : null;

      // Never allowed to sleep: a sleeping board still gets woken by an
      // incoming ball, but it would also stop honouring the restoring torque
      // mid-teeter and freeze at whatever angle it happened to hold.
      const boardBody = pivot
        ? Bodies.rectangle(pivot.x, pivot.y, pivot.length, BOARD_THICKNESS, {
            restitution: BOARD_RESTITUTION,
            friction: BOARD_FRICTION,
            frictionAir: BOARD_ANGULAR_DAMPING,
            chamfer: { radius: BOARD_CHAMFER_RADIUS },
            sleepThreshold: Infinity,
          })
        : null;

      if (boardBody && pivot) {
        Body.setInertia(
          boardBody,
          BOARD_INERTIA_COEFF * boardBody.mass * pivot.length * pivot.length,
        );
      }

      const obstacleBodies = boardBody
        ? [boardBody]
        : poles.map((p) =>
            Bodies.circle(p.x, p.y, POLE_RADIUS, {
              isStatic: true,
              restitution: POLE_RESTITUTION,
              friction: 0.05,
            }),
          );

      const maxBoardAngle = (boardTilt * Math.PI) / 180;

      // Pin the center, clamp the tip: the board keeps exactly one degree of
      // freedom, rotation about the pivot, bounded by the tilt slider so it
      // can never swing past a plausible seesaw angle and start spinning.
      const settleBoard = () => {
        if (!boardBody || !pivot) return;
        Body.setPosition(boardBody, { x: pivot.x, y: pivot.y });
        Body.setVelocity(boardBody, { x: 0, y: 0 });
        if (boardBody.angle > maxBoardAngle) {
          Body.setAngle(boardBody, maxBoardAngle);
          Body.setAngularVelocity(boardBody, 0);
        } else if (boardBody.angle < -maxBoardAngle) {
          Body.setAngle(boardBody, -maxBoardAngle);
          Body.setAngularVelocity(boardBody, 0);
        } else if (Math.abs(boardBody.angularVelocity) > BOARD_MAX_ANGULAR_SPEED) {
          Body.setAngularVelocity(
            boardBody,
            Math.sign(boardBody.angularVelocity) * BOARD_MAX_ANGULAR_SPEED,
          );
        }
      };

      // Matter cannot keep balls out of a board this thin on its own, in two
      // separate ways. A ball arrives at 15px/step (24 at max gravity) against
      // a 8px slab, so it lands *inside* rather than against the face; and once
      // its center is past the mid-plane, SAT's minimum-translation axis points
      // out the far side, so the solver's own correction is what posts the ball
      // through the board. Both were visible: balls fused into the plank for a
      // few frames, then dropped out the bottom.
      //
      // So the board's contact is resolved here instead, as a hard constraint:
      // whichever face a ball was on last step is the face it stays on. That
      // holds at any speed, needs no thickening, and leaves Matter to handle
      // every other body in the world.
      const holdBallsOffBoard = () => {
        if (!boardBody || !pivot) return;
        const cos = Math.cos(boardBody.angle);
        const sin = Math.sin(boardBody.angle);
        const half = pivot.length / 2;

        for (const ball of ballsRef.current) {
          const body = ball.body;
          const surface = BOARD_THICKNESS / 2 + ball.radius;

          const dx = body.position.x - pivot.x;
          const dy = body.position.y - pivot.y;
          const localX = dx * cos + dy * sin;
          const localY = -dx * sin + dy * cos;
          if (Math.abs(localX) > half) {
            ball.boardFace = 0;
            continue;
          }

          const side = localY < 0 ? -1 : 1;
          const clear = Math.abs(localY) > surface + BOARD_CONTACT_TOLERANCE;
          if (clear && (ball.boardFace === 0 || ball.boardFace === side)) {
            ball.boardFace = side;
            continue;
          }

          // Either overlapping the board or already on the wrong side of it.
          // Both are put back against the face the ball was last clear of.
          const face = ball.boardFace !== 0 ? ball.boardFace : side;
          ball.boardFace = face;
          const targetY = face * surface;
          Body.setPosition(body, {
            x: pivot.x + localX * cos - targetY * sin,
            y: pivot.y + localX * sin + targetY * cos,
          });

          const vLocalX = body.velocity.x * cos + body.velocity.y * sin;
          let vLocalY = -body.velocity.x * sin + body.velocity.y * cos;
          if (vLocalY * face < 0) {
            if (Math.abs(vLocalY) > BOARD_IMPACT_SPEED) {
              // A real hit: bounce it off the face and turn the board, which
              // is the impulse the missed contact would have applied.
              if (boardBody.inertia > 0) {
                Body.setAngularVelocity(
                  boardBody,
                  boardBody.angularVelocity +
                    (localX * body.mass * vLocalY) / boardBody.inertia,
                );
              }
              vLocalY *= -BOARD_SWEEP_RESTITUTION;
            } else {
              // A ball simply lying on the board, gaining a fraction of a
              // pixel of fall each step. Bouncing that back would buzz, so it
              // is just held against the face.
              vLocalY = 0;
            }
          }
          Body.setVelocity(body, {
            x: vLocalX * cos - vLocalY * sin,
            y: vLocalX * sin + vLocalY * cos,
          });

          if (body.isSleeping) Sleeping.set(body, false);
        }
      };

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

      Composite.add(engine.world, [...obstacleBodies, ...walls]);
      ballsRef.current = [];

      const draw = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // One path covering every obstacle, one stroke call, rather than a
        // beginPath/stroke pair per obstacle. Note this is tidiness, not a
        // meaningful optimization: measured, the whole of draw() costs well
        // under 1ms even at ~1400 shapes. Engine.update dominates the frame.
        ctx.strokeStyle = OBSTACLE_STROKE;
        ctx.lineWidth = OBSTACLE_STROKE_WIDTH;
        ctx.beginPath();
        for (const p of poles) {
          ctx.moveTo(p.x + POLE_RADIUS, p.y);
          ctx.arc(p.x, p.y, POLE_RADIUS, 0, Math.PI * 2);
        }
        if (boardBody) {
          // The body's own vertices are already in world space and already
          // rotated, so the board needs no corner math of its own.
          const [first, ...rest] = boardBody.vertices;
          ctx.moveTo(first.x, first.y);
          for (const vertex of rest) ctx.lineTo(vertex.x, vertex.y);
          ctx.closePath();
        }
        ctx.stroke();

        if (pivot) {
          ctx.fillStyle = BALL_FILL;
          ctx.beginPath();
          ctx.arc(pivot.x, pivot.y, PIVOT_DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }

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

      // Composite.remove fires no collision/wake event, so a sleeping ball
      // resting directly on the body being removed would otherwise hang in
      // mid-air forever once its support disappears — wake anything that
      // was actually touching it so it falls and re-settles naturally.
      // Waking a ball that turns out to still be supported by something
      // else is harmless: it re-settles and sleeps again within a frame or
      // two, so this only needs to be a generous "were these touching"
      // check, not a precise support graph.
      const wakeTouchingSleepers = (removed: MatterNS.Body) => {
        const removedRadius = removed.circleRadius ?? 0;
        for (const other of ballsRef.current) {
          if (other.body === removed || !other.body.isSleeping) continue;
          const dx = other.body.position.x - removed.position.x;
          const dy = other.body.position.y - removed.position.y;
          const reach = other.radius + removedRadius + WAKE_CONTACT_SLACK_PX;
          if (dx * dx + dy * dy <= reach * reach) Sleeping.set(other.body, false);
        }
      };

      // Poles keep the narrow central column the pyramid is built around. The
      // board wants the opposite: rain across its whole span, tip to tip. A
      // column at the middle only ever loads whichever side is already down —
      // every ball rolls to the low end — so the board tips once and stays
      // there. Spread over the full length, both ends get loaded and it rocks.
      const spawnSpread = pivot ? pivot.length / 2 : SPAWN_JITTER_PX;

      const addBall = (x: number, y: number, radius: number) => {
        const body = Bodies.circle(x, y, radius, {
          restitution: BALL_RESTITUTION,
          friction: 0.05,
          frictionAir: 0.01,
        });
        Composite.add(engine.world, body);
        ballsRef.current.push({ body, sleptFor: 0, alpha: 1, radius, boardFace: 0 });

        if (ballsRef.current.length > MAX_BALLS) {
          const oldest = ballsRef.current.shift();
          if (oldest) {
            wakeTouchingSleepers(oldest.body);
            Composite.remove(engine.world, oldest.body);
          }
        }
      };

      const spawnBall = () => {
        const radius = configRef.current.ballRadius;
        addBall(
          width / 2 + (Math.random() * 2 - 1) * spawnSpread,
          -radius * 2,
          radius,
        );
      };

      // A load of balls aimed at whichever end is currently up. The stream
      // alone can leave the board leaning for a long stretch — one end low and
      // catching everything that rolls — and this is the weight that puts it
      // back the other way.
      const spawnLoad = () => {
        if (!boardBody || !pivot) return;
        const radius = configRef.current.ballRadius;

        // Canvas y grows downward, so the raised end is the one with the
        // smaller y: the right end sits at pivot.y + (length/2)*sin(angle),
        // which is above the pivot exactly when the angle is negative.
        const angle = boardBody.angle;
        const highSide =
          Math.abs(angle) < LOAD_LEVEL_EPS
            ? Math.random() < 0.5
              ? -1
              : 1
            : angle < 0
              ? 1
              : -1;

        const half = pivot.length / 2;
        const inner = half * LOAD_BAND_INNER;
        const band = half * (LOAD_BAND_OUTER - LOAD_BAND_INNER);
        const cell = Math.max(radius * LOAD_CELL_RADII, 1);
        const columns = Math.max(1, Math.floor(band / cell));
        const columnWidth = band / columns;
        const jitter = Math.max(0, (columnWidth - radius * 2) / 2);

        for (let i = 0; i < LOAD_COUNT; i++) {
          const localX =
            inner +
            ((i % columns) + 0.5) * columnWidth +
            (Math.random() * 2 - 1) * jitter;
          addBall(
            pivot.x + highSide * localX * Math.cos(angle),
            -radius * 2 - Math.floor(i / columns) * cell,
            radius,
          );
        }
      };

      const nextLoadDelay = () =>
        LOAD_INTERVAL_S * (1 + (Math.random() * 2 - 1) * LOAD_INTERVAL_JITTER);

      let frameId = 0;
      let last = performance.now();
      let physicsAcc = 0;
      let spawnAcc = 0;
      let loadAcc = 0;
      let loadDelay = nextLoadDelay();

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
          if (boardBody) {
            boardBody.torque =
              -boardBody.inertia *
              BOARD_RESTORE_ACCEL *
              RAD_PER_S2_TO_MATTER_TORQUE *
              boardBody.angle;
          }
          Engine.update(engine, PHYSICS_STEP_MS);
          settleBoard();
          holdBallsOffBoard();
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

        if (boardBody) {
          loadAcc += dt;
          if (loadAcc >= loadDelay) {
            loadAcc = 0;
            loadDelay = nextLoadDelay();
            spawnLoad();
          }
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
            wakeTouchingSleepers(b.body);
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
  }, [
    width,
    height,
    variant,
    poleCount,
    boardLength,
    boardTilt,
    paused,
  ]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      />

      <ConfigPanel>
        <ChoiceControl
          label="Variant"
          value={config.variant}
          options={VARIANT_OPTIONS}
          onChange={(v) => setConfig((c) => ({ ...c, variant: v }))}
        />
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
        {config.variant === "boards" ? (
          <>
            <SliderControl
              label="Board length"
              value={config.boardLength}
              min={20}
              max={80}
              step={5}
              format={(v) => `${v}%`}
              onChange={(v) => setConfig((c) => ({ ...c, boardLength: v }))}
            />
            <SliderControl
              label="Max tilt"
              value={config.boardTilt}
              min={4}
              max={18}
              step={1}
              format={(v) => `${v}°`}
              onChange={(v) => setConfig((c) => ({ ...c, boardTilt: v }))}
            />
          </>
        ) : (
          <SliderControl
            label="Poles"
            value={config.poleCount}
            min={10}
            max={200}
            step={5}
            onChange={(v) => setConfig((c) => ({ ...c, poleCount: v }))}
          />
        )}
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
