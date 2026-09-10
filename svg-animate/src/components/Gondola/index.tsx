import { useEffect, useRef, useState } from "react";
import type * as MatterNS from "matter-js";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";
import { pointOnCircle } from "./fields";

const CONFIG_KEY = "gondola-config";

type GondolaConfig = {
  speed: number;
  gravity: number;
  cableLength: number;
  stiffness: number;
  trackRadius: number;
};

const DEFAULT_CONFIG: GondolaConfig = {
  speed: 0.15,
  gravity: 1,
  cableLength: 70,
  stiffness: 0.2,
  trackRadius: 25,
};

const MAX_DEVICE_PIXEL_RATIO = 2;

// Track center as a fraction of the viewport — high enough that the box has
// clear room to hang and swing below it without the loop or the box
// threatening to clip the bottom edge at the sliders' upper range.
const TRACK_CENTER_X_RATIO = 0.5;
const TRACK_CENTER_Y_RATIO = 0.38;

// Track radius is a % of the shorter viewport dimension (min, not width),
// like Gravity sizes its board off the axis a shape actually has to fit in —
// on a tall narrow viewport, sizing off width alone could still overflow the
// screen vertically.
function trackRadiusPx(percent: number, width: number, height: number): number {
  return (percent / 100) * Math.min(width, height);
}

// The box itself isn't config yet — one thing at a time, and a fixed size
// keeps the first pass focused on the path-following mechanic.
const BOX_WIDTH = 60;
const BOX_HEIGHT = 30;

// Fixed physics timestep, same reasoning as Gravity: Matter.js destabilizes
// with a variable step, and capping substeps per frame avoids a spiral of
// death after the tab is backgrounded and dt spikes.
const PHYSICS_STEP_MS = 1000 / 60;
const PHYSICS_STEP_S = PHYSICS_STEP_MS / 1000;
const MAX_SUBSTEPS = 5;

// Starting angle: top of the circle, so the box's first visible motion is a
// sideways glide rather than starting mid-swing.
const START_THETA = -Math.PI / 2;

// Tailwind neutral-800, matching the fill/stroke used by the other widgets.
const TRACK_STROKE = "rgba(38, 38, 38, 0.35)";
const TRACK_STROKE_WIDTH = 1.5;
const TRACK_DASH: number[] = [6, 6];
const CABLE_STROKE = "rgba(38, 38, 38, 0.5)";
const CABLE_STROKE_WIDTH = 1.5;
const ANCHOR_DOT_RADIUS = 4;
const BOX_FILL = "rgba(38, 38, 38, 0.85)";

function Gondola() {
  const { width, height } = useViewportSize();
  const [config, setConfig] = useSessionConfig<GondolaConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [paused] = useState(prefersReducedMotion);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const trackCenter = {
      x: width * TRACK_CENTER_X_RATIO,
      y: height * TRACK_CENTER_Y_RATIO,
    };

    import("matter-js").then((mod) => {
      if (cancelled) return;

      const Matter = ((mod as { default?: typeof MatterNS }).default ??
        (mod as unknown as typeof MatterNS));
      const { Engine, Bodies, Composite, Constraint, Events } = Matter;

      const engine = Engine.create();
      engine.gravity.y = configRef.current.gravity;

      // theta is the only path state — everything else (anchor position,
      // cable length/stiffness) is read live off configRef every tick, so
      // none of those sliders need to tear this effect down and restart.
      let theta = START_THETA;

      const startRadius = trackRadiusPx(configRef.current.trackRadius, width, height);
      const startAnchor = pointOnCircle(
        trackCenter.x,
        trackCenter.y,
        startRadius,
        theta,
      );

      // No pointB / offset — the constraint attaches at the box's own
      // center, so gravity plus the constraint's pull toward the (moving)
      // anchor is what makes it lag and sway, not body rotation. A gondola
      // cabin hangs level in real life; this keeps it level here too, rather
      // than swinging like a pendulum bob that tips over.
      const box = Bodies.rectangle(
        startAnchor.x,
        startAnchor.y + configRef.current.cableLength,
        BOX_WIDTH,
        BOX_HEIGHT,
      );
      Composite.add(engine.world, box);

      const cable = Constraint.create({
        pointA: { x: startAnchor.x, y: startAnchor.y },
        bodyB: box,
        length: configRef.current.cableLength,
        stiffness: configRef.current.stiffness,
      });
      Composite.add(engine.world, cable);

      // Moves the anchor along the track once per physics step (not once per
      // animation frame) — Engine.update fires this at the start of every
      // fixed-size step it takes, including the extra substeps a lagging
      // frame catches up with, so theta advances by a fixed amount per call
      // regardless of how many steps a single rAF tick ends up running.
      const onBeforeUpdate = () => {
        const c = configRef.current;
        theta += c.speed * Math.PI * 2 * PHYSICS_STEP_S;
        const radius = trackRadiusPx(c.trackRadius, width, height);
        const anchor = pointOnCircle(trackCenter.x, trackCenter.y, radius, theta);
        cable.pointA.x = anchor.x;
        cable.pointA.y = anchor.y;
        // Matter reads these off the constraint object every step rather
        // than fixing them at creation, so they can follow live slider
        // changes exactly like gravity does below.
        cable.length = c.cableLength;
        cable.stiffness = c.stiffness;
      };
      Events.on(engine, "beforeUpdate", onBeforeUpdate);

      const draw = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        const radius = trackRadiusPx(configRef.current.trackRadius, width, height);

        // The track itself — dashed, to read as a guide rather than a solid
        // obstacle in the scene.
        ctx.strokeStyle = TRACK_STROKE;
        ctx.lineWidth = TRACK_STROKE_WIDTH;
        ctx.setLineDash(TRACK_DASH);
        ctx.beginPath();
        ctx.arc(trackCenter.x, trackCenter.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cable, from the anchor down to wherever the box has swung to.
        ctx.strokeStyle = CABLE_STROKE;
        ctx.lineWidth = CABLE_STROKE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(cable.pointA.x, cable.pointA.y);
        ctx.lineTo(box.position.x, box.position.y);
        ctx.stroke();

        ctx.fillStyle = BOX_FILL;

        // Anchor dot.
        ctx.beginPath();
        ctx.arc(cable.pointA.x, cable.pointA.y, ANCHOR_DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // The box — vertices are already in world space and already
        // rotated, so no corner math of its own is needed here.
        const [first, ...rest] = box.vertices;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        for (const vertex of rest) ctx.lineTo(vertex.x, vertex.y);
        ctx.closePath();
        ctx.fill();
      };

      draw();

      if (paused) {
        teardown = () => {
          Events.off(engine, "beforeUpdate", onBeforeUpdate);
          Composite.clear(engine.world, false);
          Engine.clear(engine);
        };
        return;
      }

      let frameId = 0;
      let last = performance.now();
      let physicsAcc = 0;

      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, MAX_SUBSTEPS * PHYSICS_STEP_S);
        last = now;

        engine.gravity.y = configRef.current.gravity;

        physicsAcc += dt;
        let steps = 0;
        while (physicsAcc >= PHYSICS_STEP_S && steps < MAX_SUBSTEPS) {
          Engine.update(engine, PHYSICS_STEP_MS);
          physicsAcc -= PHYSICS_STEP_S;
          steps++;
        }
        if (steps === MAX_SUBSTEPS) physicsAcc = 0;

        draw();
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);

      teardown = () => {
        cancelAnimationFrame(frameId);
        Events.off(engine, "beforeUpdate", onBeforeUpdate);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [width, height, paused]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      />

      <ConfigPanel>
        <SliderControl
          label="Speed"
          value={config.speed}
          min={0.05}
          max={0.5}
          step={0.01}
          format={(v) => `${v.toFixed(2)}/s`}
          onChange={(v) => setConfig((c) => ({ ...c, speed: v }))}
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
          label="Cable length"
          value={config.cableLength}
          min={20}
          max={200}
          step={5}
          format={(v) => `${v}px`}
          onChange={(v) => setConfig((c) => ({ ...c, cableLength: v }))}
        />
        <SliderControl
          label="Stiffness"
          value={config.stiffness}
          min={0.02}
          max={1}
          step={0.02}
          onChange={(v) => setConfig((c) => ({ ...c, stiffness: v }))}
        />
        <SliderControl
          label="Track radius"
          value={config.trackRadius}
          min={10}
          max={40}
          step={1}
          format={(v) => `${v}%`}
          onChange={(v) => setConfig((c) => ({ ...c, trackRadius: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Gondola;
