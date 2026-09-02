import { useCallback, useEffect, useRef, useState } from "react";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { mulberry32 } from "../../lib/random";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";

const MAX_WAVES = 24;
const MAX_OCTAVES = 4;
const SAMPLE_STEP = 5;
const AXIS_TICK_COUNT = 20;
const AXIS_TICK_LENGTH = 3;
// The fade envelope is a single Hann (raised-cosine) bump spanning the full
// active width — zero at both margins, rising continuously to 1 at the
// centre — not a flat middle with tapered shoulders. Shrinking this ratio
// narrows the whole bump; it doesn't widen a flat region.
const WINDOW_MARGIN_RATIO = 1 / 20;
const PHASE_OFFSET_DEG = 40;
const STROKE_WIDTH = 1;

type OctaveSpec = {
  amp: number;
  freq: number;
  phase: number;
  drift: number;
};

function generateWaveSpecs(): OctaveSpec[][] {
  const random = mulberry32(1);
  return Array.from({ length: MAX_WAVES }, () =>
    Array.from({ length: MAX_OCTAVES }, () => ({
      amp: random(),
      freq: random(),
      phase: random(),
      drift: random(),
    })),
  );
}

type WaveConfig = {
  waveCount: number;
  maxAmplitude: number;
  maxFrequency: number;
  speed: number;
  roughness: number;
};

const CONFIG_KEY = "wave-config";

const DEFAULT_CONFIG: WaveConfig = {
  waveCount: 9,
  maxAmplitude: 230,
  maxFrequency: 6,
  speed: 10,
  roughness: 1,
};

function Wave() {
  const [waveSpecs] = useState(generateWaveSpecs);
  const [config, setConfig] = useSessionConfig<WaveConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [paused] = useState(prefersReducedMotion);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const axisRef = useRef<SVGLineElement>(null);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const timeRef = useRef(0);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const drawAxis = useCallback((width: number, height: number) => {
    const centerY = height / 2;

    const axis = axisRef.current;
    if (axis) {
      axis.setAttribute("x1", "0");
      axis.setAttribute("x2", String(width));
      axis.setAttribute("y1", String(centerY));
      axis.setAttribute("y2", String(centerY));
    }

    for (let i = 0; i < AXIS_TICK_COUNT; i++) {
      const tick = tickRefs.current[i];
      if (!tick) continue;
      const x = (i / (AXIS_TICK_COUNT - 1)) * width;
      tick.setAttribute("x1", x.toFixed(1));
      tick.setAttribute("x2", x.toFixed(1));
      tick.setAttribute("y1", (centerY - AXIS_TICK_LENGTH / 2).toFixed(1));
      tick.setAttribute("y2", (centerY + AXIS_TICK_LENGTH / 2).toFixed(1));
    }
  }, []);

  const drawFrame = useCallback(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const c = configRef.current;
    const t = timeRef.current;
    const centerY = height / 2;

    const lastSize = lastSizeRef.current;
    if (lastSize.width !== width || lastSize.height !== height) {
      drawAxis(width, height);
      lastSizeRef.current = { width, height };
    }

    // Per-(wave, octave) terms depend only on config and time, not on the
    // sample position — computed once per frame instead of once per sample.
    const terms: { amp: number; freqTerm: number; phaseTerm: number }[] = [];
    let totalWeightSum = 0;
    const octaveCounts: number[] = [];
    for (let i = 0; i < c.waveCount; i++) {
      const spec = waveSpecs[i];
      const octaveCount = Math.min(c.roughness, spec.length);
      octaveCounts.push(octaveCount);
      for (let o = 0; o < octaveCount; o++) {
        totalWeightSum += (1 / 2 ** o) * (0.7 + spec[o].amp * 0.6);
      }
    }
    for (let i = 0; i < c.waveCount; i++) {
      const spec = waveSpecs[i];
      const octaveCount = octaveCounts[i];
      const waveOffset = i * (PHASE_OFFSET_DEG * (Math.PI / 180));

      for (let o = 0; o < octaveCount; o++) {
        const rawWeight = (1 / 2 ** o) * (0.7 + spec[o].amp * 0.6);
        const amp = (rawWeight / totalWeightSum) * c.maxAmplitude;
        const freqMult = 2 ** o * (0.7 + spec[o].freq * 0.6);
        const phase = spec[o].phase * Math.PI * 2;
        const drift = (spec[o].drift * 2 - 1) * (0.4 + o * 0.25) * c.speed;
        terms.push({
          amp,
          freqTerm: 2 * Math.PI * c.maxFrequency * freqMult,
          phaseTerm: phase + waveOffset + t * drift,
        });
      }
    }

    const margin = width * WINDOW_MARGIN_RATIO;
    const activeWidth = width - margin * 2;

    const segments: string[] = [];
    for (let x = 0; x <= width; x += SAMPLE_STEP) {
      const xNorm = x / width;
      const edgeEnvelope =
        x <= margin || x >= width - margin
          ? 0
          : 0.5 * (1 - Math.cos((2 * Math.PI * (x - margin)) / activeWidth));

      let oscillation = 0;
      for (const term of terms) {
        oscillation += term.amp * Math.sin(term.freqTerm * xNorm + term.phaseTerm);
      }

      const y = centerY + oscillation * edgeEnvelope;
      segments.push(`${segments.length ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    path.setAttribute("d", segments.join(" "));
  }, [waveSpecs, drawAxis]);

  useEffect(() => {
    drawFrame();
    if (paused) return;

    let frameId: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      timeRef.current += dt;
      drawFrame();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [paused, drawFrame]);

  useEffect(() => {
    if (paused) drawFrame();
  }, [config, paused, drawFrame]);

  useEffect(() => {
    // The rAF loop already picks up size changes each frame while running;
    // this covers the case where the viewport resizes while paused.
    window.addEventListener("resize", drawFrame);
    return () => window.removeEventListener("resize", drawFrame);
  }, [drawFrame]);

  return (
    <>
      <svg
        ref={svgRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      >
        <line ref={axisRef} className="stroke-black/20" strokeWidth={1} />
        {Array.from({ length: AXIS_TICK_COUNT }, (_, i) => (
          <line
            key={i}
            ref={(el) => {
              tickRefs.current[i] = el;
            }}
            className="stroke-black/20"
            strokeWidth={1}
          />
        ))}

        <path
          ref={pathRef}
          fill="none"
          className="stroke-neutral-800/40"
          strokeWidth={STROKE_WIDTH}
        />
      </svg>

      <ConfigPanel>
        <SliderControl
          label="Waves"
          value={config.waveCount}
          min={1}
          max={MAX_WAVES}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, waveCount: v }))}
        />
        <SliderControl
          label="Max amplitude"
          value={config.maxAmplitude}
          min={10}
          max={500}
          step={5}
          format={(v) => `${v}px`}
          onChange={(v) => setConfig((c) => ({ ...c, maxAmplitude: v }))}
        />
        <SliderControl
          label="Max frequency"
          value={config.maxFrequency}
          min={1}
          max={20}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, maxFrequency: v }))}
        />
        <SliderControl
          label="Speed"
          value={config.speed}
          min={0}
          max={100}
          step={5}
          onChange={(v) => setConfig((c) => ({ ...c, speed: v }))}
        />
        <SliderControl
          label="Roughness"
          value={config.roughness}
          min={1}
          max={MAX_OCTAVES}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, roughness: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Wave;
