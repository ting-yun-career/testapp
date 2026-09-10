// Path geometry for Gondola — no Matter.js dependency, so the same function
// that positions the cable's anchor each tick also draws the track itself.
// Circular is the first path; a different shape is just another function with
// the same (theta) -> Point signature.

export type Point = { x: number; y: number };

// A point on a circle of the given radius centered at (cx, cy), at angle
// theta in radians. Canvas y grows downward, so increasing theta sweeps
// clockwise on screen rather than the counterclockwise a math textbook would
// call "increasing angle" — not that it matters here, since nothing about the
// widget cares which way the loop runs, only that it's continuous.
export function pointOnCircle(
  cx: number,
  cy: number,
  radius: number,
  theta: number,
): Point {
  return {
    x: cx + radius * Math.cos(theta),
    y: cy + radius * Math.sin(theta),
  };
}
