/**
 * Minimal tweening helpers used by the 3D scene (no external dependency).
 */

export type Easing = (t: number) => number;

export const easeInOutCubic: Easing = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutExpo: Easing = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const easeInOutQuint: Easing = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

/** Cubic-bezier easing (same semantics as the CSS function). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
      if (hi - lo < 1e-6) break;
    }
    return t;
  };

  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
}

export interface Tween {
  update(now: number): boolean;
  cancel(): void;
  done: boolean;
}

/**
 * Creates a tween that calls `onUpdate` with an eased progress in [0, 1].
 * Returns `false` from `update` once finished.
 */
export function createTween(
  duration: number,
  easing: Easing,
  onUpdate: (k: number) => void,
  onComplete?: () => void,
): Tween {
  let start = -1;
  const tween: Tween = {
    done: false,
    update(now: number) {
      if (tween.done) return false;
      if (start < 0) start = now;
      const t = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
      onUpdate(easing(t));
      if (t >= 1) {
        tween.done = true;
        onComplete?.();
        return false;
      }
      return true;
    },
    cancel() {
      tween.done = true;
    },
  };
  return tween;
}
