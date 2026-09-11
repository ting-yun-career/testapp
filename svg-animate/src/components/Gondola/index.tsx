import { useEffect, useRef, useState } from "react";
import type * as MatterNS from "matter-js";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";
import { pointOnCircle } from "./fields";
import gondolaSrc from "./gondola.png";

const CONFIG_KEY = "gondola-config";

type GondolaConfig = {
  speed: number;
  gravity: number;
  trackRadius: number;
  carCount: number;
};

const DEFAULT_CONFIG: GondolaConfig = {
  speed: 0.15,
  gravity: 1,
  trackRadius: 25,
  carCount: 1,
};

// Cars ride the loop evenly spaced, so the count is also the divisor for their
// phase offsets. Capped at 4 — past that they crowd each other at the small
// end of the track-radius slider.
const MIN_CARS = 1;
const MAX_CARS = 4;

// Fixed, no longer sliders — the cabin hangs at one distance below the hub, on
// a cable of one springiness.
const CABLE_LENGTH = 70;
const CABLE_STIFFNESS = 0.2;

const MAX_DEVICE_PIXEL_RATIO = 2;

// Track center as a fraction of the viewport. Dead center on both axes — the
// loop is nudged up from there by SPRITE_VERTICAL_BIAS below so that what
// actually gets centered is the drawn composition, not the bare circle.
const TRACK_CENTER_X_RATIO = 0.5;
const TRACK_CENTER_Y_RATIO = 0.5;

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

// Swap gondola.png for any other image or SVG in this folder to change what
// draws at the box's position — the physics body's own size/shape (BOX_WIDTH
// x BOX_HEIGHT, set on the Matter body below) is unrelated to what's drawn
// over it; drawImage doesn't have to match the collision box's dimensions at
// all. A Vite asset import (rather than a public/ URL) since this lives
// alongside the component it belongs to, like the rest of the widget's files.
//
// Loaded once at module scope, not per mount: Image() objects are cheap and
// the browser caches the fetch regardless, but there's no reason to create a
// new one every time this widget mounts.
const boxImage = new Image();
boxImage.src = gondolaSrc;

// Where the wheel's hub sits in gondola.png (1024x1024), as a fraction of the
// image — measured directly off the source with a scratch coordinate-picker
// tool (util/coord-picker.html), not estimated. This is the point that
// actually lands on the anchor (see the drawImage call below), not the
// image's own bounding-box center.
const JOINT_FRACTION_X = 437 / 1024;
const JOINT_FRACTION_Y = 241 / 1024;

// gondola.png is drawn and rotated as one rigid sprite pivoting at the hub —
// wheel and cabin swing together. An earlier version split the wheel and
// cabin into two separately-drawn layers, keeping the wheel level while only
// the cabin rotated, on the reasoning that a real gondola's grip stays
// clamped to the cable and doesn't tip with the cabin. That model needed a
// seam where the two crops met, and rotating the lower layer around the hub
// (rather than around the seam itself) swung that seam sideways by a few
// pixels at high lean angles — wider than the neck art it needed to align
// with, which read as the wheel and cabin visibly disconnecting. Pivoting
// the whole sprite as one piece at the hub has no seam to misalign in the
// first place, and matches the intended read of the whole gondola wobbling
// side to side as it's dragged around the loop, hub included.

// Size the image draws at on screen — independent of both gondola.png's own
// resolution and the physics body's collision rectangle below; drawImage
// doesn't care what either of those are. Assumes a square source, matching
// gondola.png; a non-square replacement would need width and height sized
// separately to preserve its own aspect ratio instead of reusing one constant
// for both.
const BOX_IMAGE_DISPLAY_SIZE = 200;

// The hub — the point that rides the track — sits near the TOP of the sprite,
// so the gondola hangs mostly below the circle: at the loop's apex the art
// reaches only a little above the track, while at its nadir it hangs a lot
// below. Centering the circle itself would therefore leave the composition
// visibly bottom-heavy. This is half that imbalance, and the track center is
// shifted up by it so the drawn extent (highest pixel at the apex, lowest at
// the nadir) is what ends up centered in the viewport instead.
const SPRITE_ABOVE_HUB = JOINT_FRACTION_Y * BOX_IMAGE_DISPLAY_SIZE;
const SPRITE_BELOW_HUB = BOX_IMAGE_DISPLAY_SIZE - SPRITE_ABOVE_HUB;
const SPRITE_VERTICAL_BIAS = (SPRITE_BELOW_HUB - SPRITE_ABOVE_HUB) / 2;

// --- Cabin lean, and why it's NOT modeled as a torque on the physics body ---
//
// An earlier version attached the cable constraint at an offset point on the
// body (the visual joint, some way above the body's own centroid) instead of
// the centroid itself, specifically to let gravity torque the body as it
// swung — real pendulum wobble instead of a point mass translating on a
// string. That produced a genuine, previously-undiagnosed instability: the
// anchor is a *kinematic* target (teleported to a new position every step by
// onBeforeUpdate below), not something driven by real forces, and pulling a
// rigid body toward a teleporting point through an off-center attachment
// feeds the constraint solver's per-step correction back into the body's own
// angular velocity. Headless matter-js reproduction (varying only the anchor
// speed, holding every other slider at its default) showed this is a real
// resonance, not a numerical edge case: net rotation stayed under a tenth of
// a turn per 20s up to a speed a third of the slider's max, then exploded to
// thousands of full turns per 10s beyond it — and a much larger, physically
// heavier body (taller than the visual cabin) hit the same blowup, which
// rules out "just needs more rotational inertia" as a fix. The instability
// is structural to torquing a rigid body against a teleported point, not a
// tunable threshold, so no slider-range tweak or inertia/stiffness value
// makes it safe at every setting.
//
// The fix: attach the constraint at the body's centroid (pointB defaults to
// {x: 0, y: 0}) so the cable can only ever pull, never twist it — a real
// cable does the same, tension acts along its own line, so this is the more
// physically honest model, not a compromise. body.angle is then
// mathematically guaranteed to stay exactly 0 forever (confirmed headlessly
// across the full cross product of every slider's min/max), regardless of
// how hard the anchor is driven.
//
// The visible lean is drawn separately, from the angle of the cable itself —
// the anchor-to-body vector. That body is a genuine pendulum bob hanging off
// the moving anchor, so its cable angle already encodes everything the lean
// should express: it trails when the anchor accelerates, and swings outward
// as the anchor rounds the loop. An earlier version drove the lean off the
// body's horizontal velocity instead, which was both backwards in sign and
// the wrong signal in principle — horizontal velocity doesn't map onto the
// radial direction, so it agreed with "leans outward" on some arcs of the
// loop and disagreed on others. The cable angle needs no gain to tune and
// can't disagree with the physics, because it IS the physics.
//
// It does need clamping, though: with a short cable and weak gravity, the
// drive overpowers gravity and the bob genuinely swings above the anchor
// (measured headlessly back when cable length was a slider too: 12 of the 32
// slider corners, every one of them at the shortest cable and weakest
// gravity, reaching a full 180deg). Drawing
// that raw would put the cabin back to doing backflips, so the angle is
// clamped and then run through a damped spring — which also keeps the clamp
// from snapping as the angle saturates. Bounded input to a linear damped
// spring can't diverge for any input, so the guarantee against spin holds at
// every setting (worst case measured: 31.1deg, with a 4.4deg largest
// single-frame step — no visible snap).
const MAX_LEAN = (30 * Math.PI) / 180; // clamp — no setting should ever tip the cabin past this
const LEAN_STIFFNESS = 90; // spring constant toward the (clamped) target lean
const LEAN_DAMPING = 14; // a little under critical (2*sqrt(stiffness) ~= 19) for a light settle-wobble

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
// Fallback fill only now — the wheel/cable and anchor dot were dropped once
// the wheel graphic itself started sitting exactly on the anchor (see the
// two-layer drawing below), which made both redundant.
const BOX_FILL = "rgba(38, 38, 38, 0.85)";

function Gondola() {
  const { width, height } = useViewportSize();
  const [config, setConfig] = useSessionConfig<GondolaConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [paused] = useState(prefersReducedMotion);

  // Structural, unlike the other config: changing it adds or removes physics
  // bodies, so it's a dep of the effect below rather than a live configRef
  // read — same split Gravity makes for its pole count.
  const { carCount } = config;

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
      y: height * TRACK_CENTER_Y_RATIO - SPRITE_VERTICAL_BIAS,
    };

    import("matter-js").then((mod) => {
      if (cancelled) return;

      const Matter = ((mod as { default?: typeof MatterNS }).default ??
        (mod as unknown as typeof MatterNS));
      const { Engine, Bodies, Composite, Constraint, Events } = Matter;

      const engine = Engine.create();
      engine.gravity.y = configRef.current.gravity;

      // theta is shared by every car — they're all the same point on the loop,
      // just offset by a fixed phase — while the lean spring is per-car, since
      // each one is a separate pendulum with its own swing. The anchor
      // position is recomputed from configRef every tick, so neither of the
      // sliders that feed it needs to tear this effect down and restart;
      // carCount does, which is why it's in the dep array below.
      let theta = START_THETA;

      const startRadius = trackRadiusPx(configRef.current.trackRadius, width, height);

      const cars = Array.from({ length: carCount }, (_, index) => {
        // Evenly spaced around the loop, so any count stays balanced.
        const thetaOffset = (index / carCount) * Math.PI * 2;
        const anchor = pointOnCircle(
          trackCenter.x,
          trackCenter.y,
          startRadius,
          theta + thetaOffset,
        );

        // The body's position IS the joint — see the lean-model comment above
        // for why the constraint attaches at the centroid rather than an
        // offset point (no separate mass-center position to track anymore).
        const box = Bodies.rectangle(
          anchor.x,
          anchor.y + CABLE_LENGTH,
          BOX_WIDTH,
          BOX_HEIGHT,
          {
            // Cars never collide with each other. A negative group in Matter
            // means "same group never collides", and that's load-bearing here
            // rather than cosmetic: a collision would impart angular velocity
            // and break the body.angle === 0 invariant the lean model above
            // depends on, putting the fallback shape back to spinning. Real
            // cars on a loop stay evenly spaced and never touch either, so
            // nothing is lost by turning this off.
            collisionFilter: { group: -1 },
          },
        );
        Composite.add(engine.world, box);

        const cable = Constraint.create({
          pointA: { x: anchor.x, y: anchor.y },
          bodyB: box,
          // pointB defaults to the body's centroid ({x: 0, y: 0}) —
          // deliberate, see the lean-model comment above.
          length: CABLE_LENGTH,
          stiffness: CABLE_STIFFNESS,
        });
        Composite.add(engine.world, cable);

        return { box, cable, thetaOffset, leanAngle: 0, leanAngularVelocity: 0 };
      });

      // Moves the anchor along the track once per physics step (not once per
      // animation frame) — Engine.update fires this at the start of every
      // fixed-size step it takes, including the extra substeps a lagging
      // frame catches up with, so theta advances by a fixed amount per call
      // regardless of how many steps a single rAF tick ends up running.
      const onBeforeUpdate = () => {
        const c = configRef.current;
        theta += c.speed * Math.PI * 2 * PHYSICS_STEP_S;
        const radius = trackRadiusPx(c.trackRadius, width, height);
        for (const car of cars) {
          const anchor = pointOnCircle(
            trackCenter.x,
            trackCenter.y,
            radius,
            theta + car.thetaOffset,
          );
          car.cable.pointA.x = anchor.x;
          car.cable.pointA.y = anchor.y;
        }
      };
      Events.on(engine, "beforeUpdate", onBeforeUpdate);

      // Advances the lean spring once per physics step, same fixed-dt
      // reasoning as theta above — and deliberately AFTER the step (not in
      // onBeforeUpdate) so it reads the body's position as this step just
      // left it, not last step's stale value.
      const onAfterUpdate = () => {
        for (const car of cars) {
          // The cable's own angle, anchor -> body, as a rotation off
          // vertical. Negated because canvas rotate() is clockwise-positive,
          // so a positive angle tilts the cabin (drawn below the pivot)
          // toward -x, while the body hanging toward -x gives a negative
          // atan2.
          const cableAngle = -Math.atan2(
            car.box.position.x - car.cable.pointA.x,
            car.box.position.y - car.cable.pointA.y,
          );
          const targetLean = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, cableAngle));
          const leanAcceleration =
            LEAN_STIFFNESS * (targetLean - car.leanAngle) -
            LEAN_DAMPING * car.leanAngularVelocity;
          car.leanAngularVelocity += leanAcceleration * PHYSICS_STEP_S;
          car.leanAngle += car.leanAngularVelocity * PHYSICS_STEP_S;
        }
      };
      Events.on(engine, "afterUpdate", onAfterUpdate);

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

        // Each car, as one rigid sprite pivoting at the hub (see the
        // JOINT_FRACTION comment above for why the whole image, wheel
        // included, rotates as a unit) — leanAngle is the separate damped
        // spring described above, not the physics body's own angle, which
        // stays at ~0. The image measurements don't depend on the car, so
        // they're hoisted out of the loop.
        if (boxImage.complete && boxImage.naturalWidth > 0) {
          const scale = BOX_IMAGE_DISPLAY_SIZE / boxImage.naturalWidth;
          const drawWidth = boxImage.naturalWidth * scale;
          const drawHeight = boxImage.naturalHeight * scale;
          const jointOffsetX = JOINT_FRACTION_X * drawWidth;
          const jointOffsetY = JOINT_FRACTION_Y * drawHeight;

          for (const car of cars) {
            ctx.save();
            ctx.translate(car.cable.pointA.x, car.cable.pointA.y);
            ctx.rotate(car.leanAngle);
            ctx.drawImage(
              boxImage,
              -jointOffsetX,
              -jointOffsetY,
              drawWidth,
              drawHeight,
            );
            ctx.restore();
          }
        } else {
          // Fallback while the image is still loading (or failed to load) —
          // vertices are already in world space and already rotated, so no
          // corner math of its own is needed here.
          ctx.fillStyle = BOX_FILL;
          for (const car of cars) {
            const [first, ...rest] = car.box.vertices;
            ctx.beginPath();
            ctx.moveTo(first.x, first.y);
            for (const vertex of rest) ctx.lineTo(vertex.x, vertex.y);
            ctx.closePath();
            ctx.fill();
          }
        }
      };

      draw();
      // The image very likely hasn't finished loading by the time this first
      // draw() call above runs — redraw once it has, so the fallback shape
      // doesn't linger a beat (or forever, if paused, since nothing else
      // would trigger a redraw at all in that case).
      boxImage.addEventListener("load", draw, { once: true });

      if (paused) {
        teardown = () => {
          boxImage.removeEventListener("load", draw);
          Events.off(engine, "beforeUpdate", onBeforeUpdate);
          Events.off(engine, "afterUpdate", onAfterUpdate);
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
        boxImage.removeEventListener("load", draw);
        Events.off(engine, "beforeUpdate", onBeforeUpdate);
        Events.off(engine, "afterUpdate", onAfterUpdate);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [width, height, paused, carCount]);

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
          label="Track radius"
          value={config.trackRadius}
          min={10}
          max={40}
          step={1}
          format={(v) => `${v}%`}
          onChange={(v) => setConfig((c) => ({ ...c, trackRadius: v }))}
        />
        <SliderControl
          label="Cars"
          value={config.carCount}
          min={MIN_CARS}
          max={MAX_CARS}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, carCount: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Gondola;
