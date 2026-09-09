import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import TextControl from "../TextControl";
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

// A giant letter, sized to roughly the viewport's height, hides in the wall:
// any cell that falls inside its filled shape draws in this bright pink once
// settled, instead of the usual near-black, so the letter reads as a hidden
// watermark made of cracking characters. Only once settled — a masked cell
// looks like any other cell while still scrambling, and only turns pink at
// the moment it reaches its target glyph, in its own place in the sweep
// rather than the whole letter appearing at once.
//
// The letter itself is config.hiddenLetter (a "Hidden letter" field in the
// panel), not a constant — DEFAULT_HIDDEN_LETTER is just its starting value.
// Only single printable-ASCII characters are accepted; an empty field is a
// valid, deliberate "off" state (an empty string measures and draws as
// nothing, so the mask comes out all-clear with no special-casing needed).
const DEFAULT_HIDDEN_LETTER = "?";
const PRINTABLE_ASCII = /^[\x20-\x7e]$/;
const HIGHLIGHT_SETTLED_FILL = "#ff2d95";

// Fraction of the viewport height the letter's glyph should span. Short of
// the full height so its top/bottom don't land flush against the screen
// edges. Width is whatever that height happens to produce — no separate
// horizontal fit, so a tall narrow viewport can end up with a letter wider
// than the screen (simply clipped by it), which reads fine since the point is
// the shape, not the letter's edges.
const HIDDEN_LETTER_HEIGHT_RATIO = 0.85;

// Alpha above which a sampled pixel counts as "inside" the letter — text
// edges anti-alias down to near-zero, not straight to it, so this needs to
// sit clear of both ends rather than right at the boundary.
const HIDDEN_LETTER_ALPHA_THRESHOLD = 128;

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
  hiddenLetter: string;
};

const CONFIG_KEY = "cypher-config";

const DEFAULT_CONFIG: TextConfig = {
  duration: 200,
  swapRate: 24,
  hiddenLetter: DEFAULT_HIDDEN_LETTER,
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

// Renders `letter` onto an offscreen canvas at roughly viewport size, then
// samples that canvas once per grid cell to decide which cells sit inside the
// letter's filled shape. A single getImageData call over the whole canvas,
// rather than one per cell — thousands of individual reads back from the
// GPU/canvas backing store would be far slower than one bulk read followed by
// cheap array indexing.
function computeHighlightMask(
  cells: Cell[],
  width: number,
  height: number,
  letter: string,
): Uint8Array {
  const mask = new Uint8Array(cells.length);
  // Empty is the deliberate "off" state (see hiddenLetter's doc comment) —
  // skip the canvas work rather than measure and draw nothing.
  if (width <= 0 || height <= 0 || letter.length === 0) return mask;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return mask;

  // Same measure-at-a-probe-size-then-scale approach as measureGlyphRatio:
  // canvas has no other way to ask "how tall does this render at size N",
  // and font size doesn't map to rendered glyph height in any fixed ratio
  // across fonts/letters.
  const probeSize = 200;
  ctx.font = `${probeSize}px sans-serif`;
  const metrics = ctx.measureText(letter);
  const measuredHeight =
    (metrics.actualBoundingBoxAscent || probeSize * 0.7) +
    (metrics.actualBoundingBoxDescent || 0);
  const targetHeight = height * HIDDEN_LETTER_HEIGHT_RATIO;
  const fontSize =
    measuredHeight > 0 ? (targetHeight / measuredHeight) * probeSize : targetHeight;

  // textBaseline "middle" centers on the font's em-box middle, not the
  // glyph's actual ink — for a letter like "B" (no descender, all its weight
  // above the baseline) that sits visibly low. Measuring the final-size
  // glyph's own bounding box and placing the baseline by hand centers the
  // ink itself instead.
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const finalMetrics = ctx.measureText(letter);
  const ascent = finalMetrics.actualBoundingBoxAscent || fontSize * 0.7;
  const descent = finalMetrics.actualBoundingBoxDescent || 0;
  const baselineY = height / 2 + (ascent - descent) / 2;
  ctx.fillStyle = "#000";
  ctx.fillText(letter, width / 2, baselineY);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const px = Math.min(canvas.width - 1, Math.max(0, Math.round(cell.x)));
    const py = Math.min(canvas.height - 1, Math.max(0, Math.round(cell.y)));
    const alpha = data[(py * canvas.width + px) * 4 + 3];
    mask[i] = alpha > HIDDEN_LETTER_ALPHA_THRESHOLD ? 1 : 0;
  }

  return mask;
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
  const highlightMaskRef = useRef<Uint8Array>(new Uint8Array(0));

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

    const mask = highlightMaskRef.current;

    // Unsettled cells never show the highlight, mask or not — a hidden-letter
    // cell looks exactly like any other cell right up until it settles onto
    // its target glyph, which is the moment the mask actually reveals itself,
    // in each cell's own place in the cracking sweep rather than all at once.
    ctx.fillStyle = UNSETTLED_FILL;
    for (let i = 0; i < n; i++) {
      if (phase >= settleTimes[i]) continue;
      const glyph = WALL_CHARSET[Math.floor(hashUnit(i, tick) * WALL_CHARSET.length)];
      const cell = grid.cells[i];
      ctx.fillText(glyph, cell.x, cell.y);
    }

    // Settled cells split by mask — two passes so fillStyle only changes
    // once each, not once per glyph.
    for (const highlighted of [false, true]) {
      ctx.fillStyle = highlighted ? HIGHLIGHT_SETTLED_FILL : SETTLED_FILL;
      for (let i = 0; i < n; i++) {
        if (phase < settleTimes[i]) continue;
        if (Boolean(mask[i]) !== highlighted) continue;
        const cell = grid.cells[i];
        ctx.fillText(targetCharAt(i), cell.x, cell.y);
      }
    }
  }, [n, grid, width, height]);

  // Recomputed whenever the grid's geometry does (resize, or the font-load
  // re-measure updating glyphRatio) or the hidden letter itself changes — not
  // on every frame, since none of what this depends on changes in between.
  // Draws once immediately after so a still (paused) wall doesn't wait for an
  // animation tick that may never come to pick up a freshly (re)computed
  // mask.
  useEffect(() => {
    highlightMaskRef.current = computeHighlightMask(
      grid.cells,
      width,
      height,
      config.hiddenLetter,
    );
    drawFrame();
  }, [grid, width, height, config.hiddenLetter, drawFrame]);

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
        <TextControl
          label="Hidden letter"
          value={config.hiddenLetter}
          maxLength={1}
          onChange={(v) => {
            // Rejects anything but a single printable-ASCII character —
            // empty is allowed too, as the deliberate "off" state. An
            // invalid keystroke is silently dropped rather than stored: the
            // input is controlled by config.hiddenLetter, so on rejection
            // React just re-renders it back to the last valid value.
            if (v.length > 0 && !PRINTABLE_ASCII.test(v)) return;
            setConfig((c) => ({ ...c, hiddenLetter: v }));
          }}
        />
      </ConfigPanel>
    </>
  );
}

export default Cypher;
