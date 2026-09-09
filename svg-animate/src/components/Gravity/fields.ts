// Obstacle layouts for the Gravity widget. Both functions are pure geometry —
// no Matter.js dependency — so the same output feeds body creation and drawing.

// Poles fill a band clear of the spawn point at top and the settling zone
// at bottom, so balls have room to accelerate before the first deflection
// and a clear run once they've passed the last row.
const TOP_MARGIN_RATIO = 0.12;
const BOTTOM_MARGIN_RATIO = 0.12;

// Fraction of the viewport width the widest (bottom) pyramid row spans.
// Exported so the spawn spread can be sized off the same triangle it's
// raining onto, rather than an unrelated fixed pixel jitter.
export const PYRAMID_WIDTH_RATIO = 0.6;

// Thin enough to read as a board rather than a beam, thick enough that a small
// ball at high gravity doesn't tunnel through between physics steps (Matter
// has no continuous collision detection). If tunnelling ever shows up, this is
// the lever.
export const BOARD_THICKNESS = 8;

// Height of the top pivot as a fraction of the viewport: far enough below the
// spawn point that balls arrive with real speed, high enough that they still
// have a clear fall to the levers below.
const BOARD_PIVOT_Y_RATIO = 0.45;

// The pair below it, sized and placed to catch what rolls off the top lever's
// two ends: low enough that the top lever swinging to its tilt stop still
// clears them, high enough to leave the floor free for the settling pile.
const LOWER_LEVER_Y_RATIO = 0.72;
const LOWER_LEVER_LENGTH_RATIO = 0.55;

// How far out the lower pivots sit, as a fraction of the top lever's length
// measured from center. Past the top lever's own tips (which are at half its
// length), so the drop point lands on their inner arms rather than on the
// pivots — that's the half that gets loaded and turns them.
const LOWER_LEVER_PIVOT_RATIO = 0.7;

// Kept off the viewport edge, which the shift above would otherwise run them
// past at the top of the Board length slider's range.
const LOWER_LEVER_EDGE_MARGIN = 16;

// The top lever is drawn in from the width the Board length slider asks for.
// Its tips set where the lower pair hangs, so a full-width top lever pushes
// them out against the viewport edges — this pulls the whole cascade back
// toward the middle without changing how the three relate to each other.
const TOP_LEVER_CONTRACTION = 0.7;

export type PolePoint = { x: number; y: number };

export type Lever = { x: number; y: number; length: number };

// Index 0 is the top lever; the rest hang below it. Every lever behaves the
// same way, so callers just iterate.
export function computeLevers(
  width: number,
  height: number,
  lengthRatio: number,
): Lever[] {
  const length = Math.max(1, width * lengthRatio * TOP_LEVER_CONTRACTION);
  const lowerLength = Math.max(1, length * LOWER_LEVER_LENGTH_RATIO);
  const catchOffset = Math.min(
    length * LOWER_LEVER_PIVOT_RATIO,
    Math.max(0, width / 2 - lowerLength / 2 - LOWER_LEVER_EDGE_MARGIN),
  );
  const lowerY = height * LOWER_LEVER_Y_RATIO;

  return [
    { x: width / 2, y: height * BOARD_PIVOT_Y_RATIO, length },
    { x: width / 2 - catchOffset, y: lowerY, length: lowerLength },
    { x: width / 2 + catchOffset, y: lowerY, length: lowerLength },
  ];
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
