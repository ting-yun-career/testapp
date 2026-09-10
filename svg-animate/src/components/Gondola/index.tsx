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
// actually lands on the anchor (see the drawImage calls below) — not the
// image's own bounding-box center, and not WHEEL_CROP_HEIGHT either, which
// is a different row chosen only to split the wheel and cabin into layers.
const JOINT_FRACTION_X = 437 / 1024;
const JOINT_FRACTION_Y = 241 / 1024;

// gondola.png is drawn and rotated as one rigid sprite, but a real gondola's
// wheel/grip stays clamped level to the cable — it doesn't tilt with the
// cabin's swing, only the cabin (hinged below it) does. Treating the whole
// picture as one rotating body was making the wheel (and the length of cable
// drawn through it in the art) visibly swing with the cabin, which reads as
// backwards once you notice it, because it is.
//
// The fix is drawing it as two layers sharing one pivot: everything above
// this source-image row (the wheel, and the local cable segment drawn
// through it) stays level; everything below it (the neck and cabin) rotates
// with the physics swing. Measured with the same coordinate-picker tool as
// the joint — the wheel's rim spans roughly y=200-282, and the neck below it
// runs straight and narrow (barely moving from x=427-455) all the way to
// y=400 before it starts curving into the cabin around y=430, so this sits
// well clear of the wheel with plenty of margin either side to land in.
//
// This crop boundary is NOT the same point as the hub (JOINT_FRACTION_Y
// above) — it's 109 source-px (≈21 display px at BOX_IMAGE_DISPLAY_SIZE)
// below it. An earlier version pinned this boundary directly to the anchor
// instead of the hub, on the assumption the gap would be visually
// negligible; it wasn't (a constant, visible offset between the wheel
// graphic and the actual track path, at every point along the loop). Both
// drawImage calls below now anchor to the true hub and then offset the
// crop boundary from it by this same 109px, rather than the other way
// around.
const WHEEL_CROP_HEIGHT = 350;

// Size the image draws at on screen — independent of both gondola.png's own
// resolution and the physics body's collision rectangle below; drawImage
// doesn't care what either of those are. Assumes a square source, matching
// gondola.png; a non-square replacement would need width and height sized
// separately to preserve its own aspect ratio instead of reusing one constant
// for both.
const BOX_IMAGE_DISPLAY_SIZE = 200;

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
// (measured headlessly: 12 of the 32 slider corners, every one of them at
// the shortest cable and weakest gravity, reaching a full 180deg). Drawing
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

      // theta and leanAngle/leanAngularVelocity are the only path/lean state
      // — everything else (anchor position, cable length/stiffness) is read
      // live off configRef every tick, so none of those sliders need to tear
      // this effect down and restart.
      let theta = START_THETA;
      let leanAngle = 0;
      let leanAngularVelocity = 0;

      const startRadius = trackRadiusPx(configRef.current.trackRadius, width, height);
      const startAnchor = pointOnCircle(
        trackCenter.x,
        trackCenter.y,
        startRadius,
        theta,
      );

      // The body's position IS the joint — see the lean-model comment above
      // for why the constraint attaches at the centroid rather than an
      // offset point (no separate mass-center position to track anymore).
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
        // pointB defaults to the body's centroid ({x: 0, y: 0}) — deliberate,
        // see the lean-model comment above.
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

      // Advances the lean spring once per physics step, same fixed-dt
      // reasoning as theta above — and deliberately AFTER the step (not in
      // onBeforeUpdate) so it reads the body's position as this step just
      // left it, not last step's stale value.
      const onAfterUpdate = () => {
        // The cable's own angle, anchor -> body, as a rotation off vertical.
        // Negated because canvas rotate() is clockwise-positive, so a
        // positive angle tilts the cabin (drawn below the pivot) toward -x,
        // while the body hanging toward -x gives a negative atan2.
        const cableAngle = -Math.atan2(
          box.position.x - cable.pointA.x,
          box.position.y - cable.pointA.y,
        );
        const targetLean = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, cableAngle));
        const leanAcceleration =
          LEAN_STIFFNESS * (targetLean - leanAngle) -
          LEAN_DAMPING * leanAngularVelocity;
        leanAngularVelocity += leanAcceleration * PHYSICS_STEP_S;
        leanAngle += leanAngularVelocity * PHYSICS_STEP_S;
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

        // The gondola, as two layers sharing one pivot (see WHEEL_CROP_HEIGHT
        // above for why): the wheel sits exactly on the anchor (specifically
        // the hub, JOINT_FRACTION_Y — not the crop boundary; see that
        // comment) and never rotates — no rope-stretch visualization needed
        // either, since the wheel is drawn AT the anchor directly rather
        // than at whatever the physics computes the joint's position to be,
        // and per-frame that gap is sub-pixel anyway at any sane slider
        // settings. The cabin swings from that same point, rotated by
        // leanAngle — the separate damped spring described above, not the
        // physics body's own angle (which stays at ~0; see that comment for
        // why).
        if (boxImage.complete && boxImage.naturalWidth > 0) {
          const scale = BOX_IMAGE_DISPLAY_SIZE / boxImage.naturalWidth;
          const drawWidth = boxImage.naturalWidth * scale;
          const jointOffsetX = JOINT_FRACTION_X * drawWidth;
          const jointOffsetY = JOINT_FRACTION_Y * boxImage.naturalHeight * scale;
          const wheelDrawHeight = WHEEL_CROP_HEIGHT * scale;
          const cabinCropHeight = boxImage.naturalHeight - WHEEL_CROP_HEIGHT;
          const cabinDrawHeight = cabinCropHeight * scale;
          // How far the crop boundary sits below the hub, at display scale —
          // the same 109 source-px gap described above, just applied at the
          // seam now instead of at the anchor.
          const cropBoundaryBelowHub = wheelDrawHeight - jointOffsetY;

          // Wheel: top slice of the source, undistorted, no rotation. Its
          // hub — not its bottom edge — lands on the anchor, so the visible
          // pulley graphic tracks the track path exactly rather than sitting
          // a constant ~21px off from it.
          ctx.drawImage(
            boxImage,
            0,
            0,
            boxImage.naturalWidth,
            WHEEL_CROP_HEIGHT,
            cable.pointA.x - jointOffsetX,
            cable.pointA.y - jointOffsetY,
            drawWidth,
            wheelDrawHeight,
          );

          // Cabin + neck: everything below that slice, pivoted at the same
          // hub point the wheel anchors to. Its own top edge (the crop
          // boundary) isn't the hub, so it's drawn cropBoundaryBelowHub
          // lower than the pivot — matching exactly where the wheel layer's
          // bottom edge sits at zero lean, so the two crops still meet at
          // the seam instead of gapping or overlapping.
          ctx.save();
          ctx.translate(cable.pointA.x, cable.pointA.y);
          ctx.rotate(leanAngle);
          ctx.drawImage(
            boxImage,
            0,
            WHEEL_CROP_HEIGHT,
            boxImage.naturalWidth,
            cabinCropHeight,
            -jointOffsetX,
            cropBoundaryBelowHub,
            drawWidth,
            cabinDrawHeight,
          );
          ctx.restore();
        } else {
          // Fallback while the image is still loading (or failed to load) —
          // vertices are already in world space and already rotated, so no
          // corner math of its own is needed here.
          ctx.fillStyle = BOX_FILL;
          const [first, ...rest] = box.vertices;
          ctx.beginPath();
          ctx.moveTo(first.x, first.y);
          for (const vertex of rest) ctx.lineTo(vertex.x, vertex.y);
          ctx.closePath();
          ctx.fill();
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
