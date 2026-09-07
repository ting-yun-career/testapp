// Obstacle layouts for the Gravity widget. Both functions are pure geometry —
// no Matter.js dependency — so the same output feeds body creation and drawing.

// Poles fill a band clear of the spawn point at top and the settling zone
// at bottom, so balls have room to accelerate before the first deflection
// and a clear run once they've passed the last row.
const TOP_MARGIN_RATIO = 0.12;
const BOTTOM_MARGIN_RATIO = 0.12;

// Fraction of the viewport width the widest (bottom) pyramid row spans.
const PYRAMID_WIDTH_RATIO = 0.6;

// Thin enough to read as a board rather than a beam, thick enough that a small
// ball at high gravity doesn't tunnel through between physics steps (Matter
// has no continuous collision detection). If tunnelling ever shows up, this is
// the lever.
export const BOARD_THICKNESS = 8;

// Height of the pivot as a fraction of the viewport: far enough below the
// spawn point that balls arrive with real speed, high enough that they still
// have a clear fall to the floor after sliding off either end.
const BOARD_PIVOT_Y_RATIO = 0.45;

export type PolePoint = { x: number; y: number };

export type PivotBoard = { x: number; y: number; length: number };

export function computePivotBoard(
  width: number,
  height: number,
  lengthRatio: number,
): PivotBoard {
  return {
    x: width / 2,
    y: height * BOARD_PIVOT_Y_RATIO,
    length: Math.max(1, width * lengthRatio),
  };
}

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
export function computePoles(
  width: number,
  height: number,
  count: number,
): PolePoint[] {
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
