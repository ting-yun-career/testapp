import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { useViewportSize } from "../../hooks/useViewportSize";
import { mulberry32 } from "../../lib/random";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";

// Greek was dropped — the font has no coverage for it, so those glyphs fell
// back to the browser's placeholder rendering instead of the chosen font.
// Punctuation was dropped too — its width variance (narrow "." "'" "|" next
// to wide "@" "%" "&") skewed the average cell size the whole grid is
// packed against, throwing off spacing for everything else.
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const WALL_CHARSET = LETTERS + DIGITS;

// The "Ink" cut of this family is a COLRv1 color font with decorative
// ink-splash accents baked into the glyphs — a color font's own palette
// layers override canvas fillStyle, not the other way around, which is what
// was putting red into characters this widget draws as plain black/gray
// text. This plain cut has no embedded color layers, so fillStyle applies
// normally.
const FONT_FAMILY = "Bitcount Prop Single";

const FALLBACK_GLYPH_RATIO = 0.7;
// Horizontal cell width is the glyph's own width plus this fixed gap — an
// exact pixel gap rather than a proportional tracking multiplier.
const HORIZONTAL_GAP_PX = -1;
const LINE_HEIGHT_RATIO = 0.92;
// Fixed (not proportional to settle time) so the first cell always cracks
// about a second after load, however long the full sweep is set to.
const SETTLE_START_DELAY = 1;
// Each settle sweep holds at the fully-cracked state for a beat before the
// wall re-scrambles and cracks again.
const HOLD_SECONDS = 1;
const FONT_SIZE_PX = 18;
const MAX_DEVICE_PIXEL_RATIO = 2;
// Tailwind neutral-800, and the same color at 45% opacity — matches the
// settled/unsettled look the widget had as SVG text.
const SETTLED_FILL = "#262626";
const UNSETTLED_FILL = "rgba(38, 38, 38, 0.45)";

// A long, fixed, deterministically-generated pool of "cracked" characters —
// what the wall settles towards. Algorithmic rather than stored so it never
// runs out regardless of viewport/grid size; wraps around via modulo. Not
// derived from any user input, matching the brute-force-cracking effect
// (the target is fixed, only the scramble is random).
const TARGET_SEED = 1337;
const TARGET_POOL_LENGTH = 4096;
const TARGET_POOL = (() => {
  const random = mulberry32(TARGET_SEED);
  let pool = "";
  for (let i = 0; i < TARGET_POOL_LENGTH; i++) {
    pool += WALL_CHARSET[Math.floor(random() * WALL_CHARSET.length)];
  }
  return pool;
})();

function targetCharAt(index: number): string {
  return TARGET_POOL[index % TARGET_POOL_LENGTH];
}

type TextConfig = {
  duration: number;
  swapRate: number;
};

const CONFIG_KEY = "cypher-config";

const DEFAULT_CONFIG: TextConfig = {
  duration: 200,
  swapRate: 24,
};

// Cheap deterministic hash used to pick a scrambled glyph for (cell, tick) —
// avoids allocating a new mulberry32 generator every frame for every cell.
function hashUnit(a: number, b: number): number {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Cells settle in reading order (row-major, top-left to bottom-right) over
// the settle-time window — a cracking wavefront sweeping the wall rather
// than every cell settling independently.
function computeSettleTimes(n: number, duration: number): number[] {
  // Clamp so a very short settle time (slider's low end) can't push the
  // start delay past the end of the sweep itself.
  const startDelay = Math.min(SETTLE_START_DELAY, duration * 0.5);
  return Array.from({ length: n }, (_, i) => {
    const positional = n > 1 ? i / (n - 1) : 0;
    return startDelay + (duration - startDelay) * positional;
  });
}

// Measures the average glyph width in the wall charset against the loaded
// font, as a ratio of font size — used to size grid cells. Sizing to the
// widest glyph left narrow characters (digits, punctuation) sitting in an
// oversized, centred cell with visible padding on both sides; average width
// packs cells tightly instead, at the cost of the occasional wide glyph
// slightly overlapping its neighbour.
function measureGlyphRatio(sample: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return FALLBACK_GLYPH_RATIO;

  const probeSize = 200;
  ctx.font = `${probeSize}px "${FONT_FAMILY}"`;
  let total = 0;
  for (const ch of sample) {
    total += ctx.measureText(ch).width;
  }
  return sample.length > 0
    ? total / sample.length / probeSize
    : FALLBACK_GLYPH_RATIO;
}

type Cell = { x: number; y: number };

function computeGrid(width: number, height: number, glyphRatio: number) {
  // A negative gap can bring this to zero or below for a narrow enough
  // glyph — floor it so cols/rows can't blow up to Infinity.
  const cellWidth = Math.max(1, FONT_SIZE_PX * glyphRatio + HORIZONTAL_GAP_PX);
  const cellHeight = FONT_SIZE_PX * LINE_HEIGHT_RATIO;
  const cols = Math.max(1, Math.floor(width / cellWidth));
  const rows = Math.max(1, Math.floor(height / cellHeight));

  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight;
  const offsetX = (width - gridWidth) / 2 + cellWidth / 2;
  const offsetY = (height - gridHeight) / 2 + cellHeight / 2;

  const cells: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: offsetX + col * cellWidth,
        y: offsetY + row * cellHeight,
      });
    }
  }

  return { cells };
}

function Cypher() {
  const { width, height } = useViewportSize();
  const [config, setConfig] = useSessionConfig<TextConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [paused] = useState(prefersReducedMotion);

  const [glyphRatio, setGlyphRatio] = useState(FALLBACK_GLYPH_RATIO);

  // Glyph widths measured against the fallback font are wrong until the
  // real font actually loads — re-measure once ready. This is React state
  // (not a ref) because the grid's cell/column count is derived from it.
  useEffect(() => {
    let cancelled = false;
    document.fonts.load(`16px "${FONT_FAMILY}"`).catch(() => {});
    document.fonts.ready.then(() => {
      if (cancelled) return;
      setGlyphRatio(measureGlyphRatio(WALL_CHARSET));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const grid = useMemo(
    () => computeGrid(width, height, glyphRatio),
    [width, height, glyphRatio],
  );
  const n = grid.cells.length;

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // A wall this dense (thousands of cells) is one bulk raster surface, not
  // one DOM node per glyph — with SVG <text> per cell, the browser has to
  // lay out and paint thousands of nodes on every tick, which is what made
  // the scramble look choppy. Canvas redraws the whole frame in one pass.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(paused ? config.duration : 0);
  const settleTimesRef = useRef<number[]>([]);
  const settleCacheKeyRef = useRef("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [width, height]);

  const drawFrame = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = configRef.current;

    const settleCacheKey = `${n}|${c.duration}`;
    if (settleCacheKey !== settleCacheKeyRef.current) {
      settleCacheKeyRef.current = settleCacheKey;
      settleTimesRef.current = computeSettleTimes(n, c.duration);
    }
    const settleTimes = settleTimesRef.current;

    const cycle = c.duration + HOLD_SECONDS;
    const phase = cycle > 0 ? timeRef.current % cycle : 0;
    const tick = Math.floor(phase * c.swapRate);

    ctx.clearRect(0, 0, width, height);
    ctx.font = `${FONT_SIZE_PX}px "${FONT_FAMILY}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Two passes so fillStyle only changes twice a frame instead of once
    // per glyph — cheap since canvas state changes aren't free either.
    for (const settled of [false, true]) {
      ctx.fillStyle = settled ? SETTLED_FILL : UNSETTLED_FILL;
      for (let i = 0; i < n; i++) {
        if (phase >= settleTimes[i] !== settled) continue;
        const glyph = settled
          ? targetCharAt(i)
          : WALL_CHARSET[Math.floor(hashUnit(i, tick) * WALL_CHARSET.length)];
        const cell = grid.cells[i];
        ctx.fillText(glyph, cell.x, cell.y);
      }
    }
  }, [n, grid, width, height]);

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

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      />

      <ConfigPanel>
        <SliderControl
          label="Settle time"
          value={config.duration}
          min={100}
          max={300}
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

export default Cypher;
