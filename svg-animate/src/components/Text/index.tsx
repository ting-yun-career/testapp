import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfigPanel from "../ConfigPanel";
import SelectControl from "../SelectControl";
import SliderControl from "../SliderControl";
import TextControl from "../TextControl";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*+=/<>[]{}$";
const FALLBACK_GLYPH_RATIO = 0.7;
const SLOT_TRACKING = 1.08;
const SPACE_SLOT_RATIO = 0.4;
const WIDTH_BUDGET_RATIO = 0.9;
const SETTLE_MIN_RATIO = 0.15;
// Characters always settle left-to-right rather than in a random order, and
// hold at the settled state for a fixed beat before the next scramble.
const HOLD_SECONDS = 1;
const FONT_SIZE_PX = 40;

// Single source of truth for the available fonts — everything else (the
// config-panel options, the glyph-ratio cache, the font-loading effect)
// is derived from these keys instead of re-listing them by hand.
const FONT_FAMILIES = {
  single: { label: "Single", className: "font-bitcount-single", family: "Bitcount Prop Single Ink" },
  sixtyfour: { label: "Sixtyfour", className: "font-sixtyfour", family: "Sixtyfour" },
} as const;

type FontKey = keyof typeof FONT_FAMILIES;

const FONT_KEYS = Object.keys(FONT_FAMILIES) as FontKey[];

const FONT_OPTIONS: { value: FontKey; label: string }[] = FONT_KEYS.map((key) => ({
  value: key,
  label: FONT_FAMILIES[key].label,
}));

type TextConfig = {
  value: string;
  duration: number;
  swapRate: number;
  font: FontKey;
};

const CONFIG_KEY = "text-config";

const DEFAULT_CONFIG: TextConfig = {
  value: "Password",
  duration: 5,
  swapRate: 24,
  font: "single",
};

// Config persists in sessionStorage across code changes, so a `font` value
// saved before a rename (or removed option) may no longer be a valid key —
// fall back to the default rather than crashing on an undefined lookup.
function normalizeFont(font: FontKey): FontKey {
  return font in FONT_FAMILIES ? font : DEFAULT_CONFIG.font;
}

// Cheap deterministic hash used to pick a scrambled glyph for (slot, tick) —
// avoids allocating a new mulberry32 generator every frame for every slot.
function hashUnit(a: number, b: number): number {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function computeSettleTimes(chars: string[], duration: number): number[] {
  const n = chars.length;
  return chars.map((ch, i) => {
    if (ch === " ") return 0;
    const positional = n > 1 ? i / (n - 1) : 0;
    return duration * (SETTLE_MIN_RATIO + (1 - SETTLE_MIN_RATIO) * positional);
  });
}

type Geometry = { fontSizePx: number; slotXs: number[]; centerY: number };

function computeGeometry(
  width: number,
  height: number,
  maxFontSize: number,
  chars: string[],
  glyphRatio: number,
): Geometry {
  const n = chars.length;
  if (n === 0) return { fontSizePx: maxFontSize, slotXs: [], centerY: height / 2 };

  const advanceRatio = glyphRatio * SLOT_TRACKING;
  // Space slots use a fraction of a full glyph's width — a word gap the
  // width of a letter reads as far too loose next to the settled text.
  const units = chars.map((ch) => (ch === " " ? SPACE_SLOT_RATIO : 1));
  const totalUnits = units.reduce((sum, u) => sum + u, 0);
  const widthBudget = width * WIDTH_BUDGET_RATIO;
  const fontSizePx = Math.min(maxFontSize, widthBudget / (totalUnits * advanceRatio));

  const widths = units.map((u) => u * fontSizePx * advanceRatio);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  let cursor = width / 2 - totalWidth / 2;
  const slotXs = widths.map((w) => {
    const center = cursor + w / 2;
    cursor += w;
    return center;
  });

  return { fontSizePx, slotXs, centerY: height / 2 };
}

// Measures the widest glyph in `sample` against the loaded font family, as a
// ratio of font size — used to size fixed-width slots so glyph swaps don't
// jitter neighbouring characters horizontally. Each font has different glyph
// proportions, so every font is measured separately.
function measureGlyphRatio(sample: string, family: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return FALLBACK_GLYPH_RATIO;

  const probeSize = 200;
  ctx.font = `${probeSize}px "${family}"`;
  let max = 0;
  for (const ch of sample) {
    if (ch === " ") continue;
    max = Math.max(max, ctx.measureText(ch).width);
  }
  return max > 0 ? max / probeSize : FALLBACK_GLYPH_RATIO;
}

function Text() {
  const [config, setConfig] = useSessionConfig<TextConfig>(CONFIG_KEY, DEFAULT_CONFIG);
  const [paused] = useState(prefersReducedMotion);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const characters = useMemo(() => Array.from(config.value.toUpperCase()), [config.value]);
  const fontKey = normalizeFont(config.font);

  const svgRef = useRef<SVGSVGElement>(null);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const timeRef = useRef(paused ? config.duration : 0);
  const glyphRatiosRef = useRef<Record<FontKey, number>>(
    Object.fromEntries(FONT_KEYS.map((key) => [key, FALLBACK_GLYPH_RATIO])) as Record<
      FontKey,
      number
    >,
  );
  const cacheRef = useRef<{ key: string; chars: string[]; settleTimes: number[] }>({
    key: "",
    chars: [],
    settleTimes: [],
  });
  const lastGlyphsRef = useRef<(string | null)[]>([]);
  const lastClassKeysRef = useRef<(string | null)[]>([]);
  const geometryRef = useRef<Geometry>({ fontSizePx: 0, slotXs: [], centerY: 0 });
  const lastSizeKeyRef = useRef("");

  const drawFrame = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    if (width === 0 || height === 0) return;
    const c = configRef.current;

    const cacheKey = `${c.value}|${c.duration}`;
    if (cacheKey !== cacheRef.current.key) {
      const chars = Array.from(c.value.toUpperCase());
      cacheRef.current = {
        key: cacheKey,
        chars,
        settleTimes: computeSettleTimes(chars, c.duration),
      };
      lastGlyphsRef.current = chars.map(() => null);
      lastClassKeysRef.current = chars.map(() => null);
    }
    const { chars, settleTimes } = cacheRef.current;
    const n = chars.length;

    const fontKey = normalizeFont(c.font);
    const glyphRatio = glyphRatiosRef.current[fontKey];
    const sizeKey = `${width}x${height}x${c.value}x${fontKey}x${glyphRatio}`;
    if (sizeKey !== lastSizeKeyRef.current) {
      lastSizeKeyRef.current = sizeKey;
      geometryRef.current = computeGeometry(width, height, FONT_SIZE_PX, chars, glyphRatio);
      const { fontSizePx, slotXs, centerY } = geometryRef.current;
      for (let i = 0; i < n; i++) {
        const el = textRefs.current[i];
        if (!el) continue;
        el.setAttribute("x", slotXs[i].toFixed(1));
        el.setAttribute("y", centerY.toFixed(1));
        el.setAttribute("font-size", fontSizePx.toFixed(1));
      }
    }

    const cycle = c.duration + HOLD_SECONDS;
    const phase = cycle > 0 ? timeRef.current % cycle : 0;

    for (let i = 0; i < n; i++) {
      const el = textRefs.current[i];
      if (!el) continue;
      const ch = chars[i];

      let glyph: string;
      let settled: boolean;
      if (ch === " ") {
        glyph = " ";
        settled = true;
      } else if (phase >= settleTimes[i]) {
        glyph = ch;
        settled = true;
      } else {
        const tick = Math.floor(phase * c.swapRate);
        glyph = CHARSET[Math.floor(hashUnit(i, tick) * CHARSET.length)];
        settled = false;
      }

      if (lastGlyphsRef.current[i] !== glyph) {
        lastGlyphsRef.current[i] = glyph;
        el.textContent = glyph;
      }

      // Settled/unsettled + font is the only thing that ever changes the
      // class — most frames touch neither, so skip the DOM write when the
      // combined key hasn't moved since last frame.
      const classKey = `${fontKey}:${settled}`;
      if (lastClassKeysRef.current[i] !== classKey) {
        lastClassKeysRef.current[i] = classKey;
        const fontClass = FONT_FAMILIES[fontKey].className;
        el.setAttribute(
          "class",
          settled
            ? `${fontClass} fill-neutral-800 select-none`
            : `${fontClass} fill-neutral-800/45 select-none`,
        );
      }
    }
  }, []);

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
    window.addEventListener("resize", drawFrame);
    return () => window.removeEventListener("resize", drawFrame);
  }, [drawFrame]);

  // Glyph widths measured against the fallback font are wrong until every
  // font actually loads — re-measure each once ready and force a geometry
  // recompute so slots don't stay sized off the fallback.
  useEffect(() => {
    let cancelled = false;
    for (const key of FONT_KEYS) {
      document.fonts.load(`16px "${FONT_FAMILIES[key].family}"`).catch(() => {});
    }
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const sample = CHARSET + configRef.current.value.toUpperCase();
      glyphRatiosRef.current = Object.fromEntries(
        FONT_KEYS.map((key) => [key, measureGlyphRatio(sample, FONT_FAMILIES[key].family)]),
      ) as Record<FontKey, number>;
      lastSizeKeyRef.current = "";
      drawFrame();
    });
    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  return (
    <>
      <svg
        ref={svgRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      >
        {characters.map((ch, i) => (
          <text
            key={i}
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`${FONT_FAMILIES[fontKey].className} fill-neutral-800/45 select-none`}
          >
            {ch === " " ? "" : ch}
          </text>
        ))}
      </svg>

      <ConfigPanel>
        <TextControl
          label="Text"
          value={config.value}
          maxLength={24}
          onChange={(v) => setConfig((c) => ({ ...c, value: v }))}
        />
        <SelectControl
          label="Font"
          value={fontKey}
          options={FONT_OPTIONS}
          onChange={(v) => setConfig((c) => ({ ...c, font: v }))}
        />
        <SliderControl
          label="Settle time"
          value={config.duration}
          min={0.5}
          max={20}
          step={0.1}
          format={(v) => `${v.toFixed(1)}s`}
          onChange={(v) => setConfig((c) => ({ ...c, duration: v }))}
        />
        <SliderControl
          label="Swap rate"
          value={config.swapRate}
          min={4}
          max={30}
          step={1}
          format={(v) => `${v}/s`}
          onChange={(v) => setConfig((c) => ({ ...c, swapRate: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Text;
