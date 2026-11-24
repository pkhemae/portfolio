/**
 * Display size and OS resolution. Kept free of any three.js import so the
 * page can use it without pulling the 3D engine into the initial bundle.
 */

/** Visible display area (16:9) in meters, and the default OS resolution. */
export const SCREEN = {
  width: 0.597,
  height: 0.336,
  pxWidth: 1440,
  pxHeight: 810,
};

/** Room left around the display when zoomed in (1 = edge to edge). */
export function screenMargin(viewportHeight: number) {
  // Small screens (laptops) use more of the height for the display.
  return viewportHeight < 900 ? 1.12 : 1.24;
}

/** Bounds of the OS resolution (CSS pixels). */
const MIN_WIDTH = 1024;
const MAX_WIDTH = 1440;

/**
 * Resolution of the OS so that, once zoomed in, one OS pixel is about one
 * screen pixel: the interface keeps a readable size on small screens
 * (like the "scaled" resolutions of macOS) and does not get huge on big ones.
 */
export function osResolution(viewportWidth: number, viewportHeight: number) {
  const margin = screenMargin(viewportHeight);
  const aspect = SCREEN.width / SCREEN.height;
  // On-screen size of the display when zoomed in (limited by width or height).
  const shownHeight = Math.min(viewportHeight / margin, viewportWidth / margin / aspect);
  const width = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, shownHeight * aspect)));
  return { width, height: Math.round(width / aspect) };
}
