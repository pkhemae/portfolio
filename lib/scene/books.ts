import * as THREE from "three";
import { DESK_TOP, shadowed, std } from "./objects";

/**
 * A stack of real computer science / maths classics. The books are built like
 * real ones: covers (hard boards that overhang the pages, or a thin paperback
 * cover), a titled spine and a visible block of pages on the three other
 * edges. Spines and the top cover are drawn on canvases (typography only).
 *
 * Local axes of a book lying flat: x = book height (head at -x),
 * z = book width (spine at +z, towards the viewer), y = thickness.
 */

interface BookSpec {
  /** Book height, width and thickness (meters). */
  height: number;
  width: number;
  thickness: number;
  hardcover: boolean;
  cover: string;
  spine: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  /** Front cover, drawn upright (width × height of the book). */
  front?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { size: number; color: string; font?: string; weight?: number | string; align?: CanvasTextAlign; spacing?: number; max?: number },
) {
  // Shrink the text until it fits its zone (spines are narrow).
  let size = opts.size;
  ctx.font = `${opts.weight ?? 600} ${Math.round(size)}px ${opts.font ?? SANS}`;
  if (opts.max) {
    while (size > 6 && ctx.measureText(value).width + (opts.spacing ?? 0) * value.length > opts.max) {
      size *= 0.94;
      ctx.font = `${opts.weight ?? 600} ${Math.round(size)}px ${opts.font ?? SANS}`;
    }
  }
  ctx.fillStyle = opts.color;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx && opts.spacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.spacing}px`;
  ctx.fillText(value, x, y);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
}

const BOOKS: BookSpec[] = [
  {
    // Cormen, Leiserson, Rivest, Stein — Introduction to Algorithms (MIT Press)
    height: 0.235,
    width: 0.2,
    thickness: 0.048,
    hardcover: true,
    cover: "#123a3c",
    spine: (ctx, w, h) => {
      ctx.fillStyle = "#123a3c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e7c75a";
      ctx.fillRect(w * 0.05, h * 0.1, w * 0.006, h * 0.8);
      text(ctx, "CORMEN · LEISERSON", w * 0.075, h * 0.36, { size: h * 0.15, color: "#e7c75a", spacing: 2, max: w * 0.26 });
      text(ctx, "RIVEST · STEIN", w * 0.075, h * 0.64, { size: h * 0.15, color: "#e7c75a", spacing: 2, max: w * 0.26 });
      text(ctx, "INTRODUCTION TO ALGORITHMS", w * 0.86, h * 0.42, { size: h * 0.26, color: "#ffffff", align: "right", weight: 700, max: w * 0.5 });
      text(ctx, "FOURTH EDITION", w * 0.86, h * 0.72, { size: h * 0.12, color: "#9ec3bf", align: "right", spacing: 3, max: w * 0.3 });
      text(ctx, "MIT", w * 0.93, h * 0.5, { size: h * 0.2, color: "#ffffff", align: "center", weight: 800 });
    },
  },
  {
    // Graham, Knuth, Patashnik — Concrete Mathematics (Addison-Wesley)
    height: 0.24,
    width: 0.168,
    thickness: 0.036,
    hardcover: true,
    cover: "#ece3c9",
    spine: (ctx, w, h) => {
      ctx.fillStyle = "#ece3c9";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7b2b1d";
      ctx.fillRect(0, 0, w, h * 0.09);
      ctx.fillRect(0, h * 0.91, w, h * 0.09);
      text(ctx, "GRAHAM · KNUTH · PATASHNIK", w * 0.05, h * 0.5, { size: h * 0.17, color: "#3d2a1c", font: SERIF, weight: 400, max: w * 0.3 });
      text(ctx, "Concrete Mathematics", w * 0.86, h * 0.5, { size: h * 0.36, color: "#7b2b1d", font: SERIF, weight: 700, align: "right", max: w * 0.48 });
      text(ctx, "A·W", w * 0.94, h * 0.5, { size: h * 0.2, color: "#3d2a1c", font: SERIF, align: "center", weight: 700 });
    },
  },
  {
    // Abelson & Sussman — Structure and Interpretation of Computer Programs (MIT Press)
    height: 0.233,
    width: 0.178,
    thickness: 0.03,
    hardcover: true,
    cover: "#5d2457",
    spine: (ctx, w, h) => {
      ctx.fillStyle = "#5d2457";
      ctx.fillRect(0, 0, w, h);
      text(ctx, "ABELSON · SUSSMAN", w * 0.05, h * 0.5, { size: h * 0.2, color: "#f1d7ea", spacing: 2, max: w * 0.22 });
      text(ctx, "Structure and Interpretation", w * 0.88, h * 0.32, { size: h * 0.24, color: "#ffffff", font: SERIF, align: "right", weight: 600, max: w * 0.58 });
      text(ctx, "of Computer Programs", w * 0.88, h * 0.68, { size: h * 0.24, color: "#ffffff", font: SERIF, align: "right", weight: 600, max: w * 0.58 });
      text(ctx, "MIT", w * 0.945, h * 0.5, { size: h * 0.24, color: "#ffffff", align: "center", weight: 800 });
    },
  },
  {
    // Kernighan & Ritchie — The C Programming Language (Prentice Hall), paperback
    height: 0.235,
    width: 0.178,
    thickness: 0.015,
    hardcover: false,
    cover: "#f7f7f4",
    spine: (ctx, w, h) => {
      ctx.fillStyle = "#f7f7f4";
      ctx.fillRect(0, 0, w, h);
      text(ctx, "KERNIGHAN · RITCHIE", w * 0.05, h * 0.52, { size: h * 0.3, color: "#1b1b1b", weight: 500, max: w * 0.28 });
      text(ctx, "THE C PROGRAMMING LANGUAGE", w * 0.87, h * 0.52, { size: h * 0.36, color: "#1d5fae", align: "right", weight: 700, max: w * 0.5 });
      text(ctx, "PH", w * 0.94, h * 0.52, { size: h * 0.32, color: "#1b1b1b", align: "center", weight: 800 });
    },
    front: (ctx, w, h) => {
      ctx.fillStyle = "#f7f7f4";
      ctx.fillRect(0, 0, w, h);
      text(ctx, "SECOND EDITION", w * 0.1, h * 0.08, { size: w * 0.045, color: "#1b1b1b", weight: 500, spacing: 4 });
      text(ctx, "THE", w * 0.1, h * 0.17, { size: w * 0.1, color: "#1b1b1b", weight: 700 });
      text(ctx, "PROGRAMMING", w * 0.1, h * 0.25, { size: w * 0.1, color: "#1b1b1b", weight: 700 });
      text(ctx, "LANGUAGE", w * 0.1, h * 0.33, { size: w * 0.1, color: "#1b1b1b", weight: 700 });
      text(ctx, "BRIAN W. KERNIGHAN", w * 0.1, h * 0.44, { size: w * 0.045, color: "#1b1b1b", weight: 500 });
      text(ctx, "DENNIS M. RITCHIE", w * 0.1, h * 0.49, { size: w * 0.045, color: "#1b1b1b", weight: 500 });
      // The big blue "C".
      ctx.font = `700 ${Math.round(w * 0.95)}px ${SANS}`;
      ctx.fillStyle = "#1d5fae";
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("C", w * 0.95, h * 0.95);
      text(ctx, "PRENTICE HALL SOFTWARE SERIES", w * 0.1, h * 0.95, { size: w * 0.035, color: "#1b1b1b", weight: 500, spacing: 2 });
    },
  },
];

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Stripes that read as the stacked sheets of a page block. */
function pagesTexture() {
  return canvasTexture(64, 256, (ctx, w, h) => {
    ctx.fillStyle = "#f2ead8";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) {
      const a = 0.05 + Math.random() * 0.09;
      ctx.fillStyle = `rgba(120,100,70,${a})`;
      ctx.fillRect(0, y, w, 1);
    }
  });
}

function buildBook(spec: BookSpec, pages: THREE.Texture) {
  const { height: W, width: D, thickness: T, hardcover } = spec;
  const book = new THREE.Group();
  const board = hardcover ? 0.0026 : 0.0007; // cover thickness
  const over = hardcover ? 0.003 : 0.0004; // how far the cover overhangs the pages

  const coverMat = std(spec.cover, hardcover ? 0.55 : 0.4);

  // Spine texture (outer face of the spine, +z).
  const spineTex = canvasTexture(1024, Math.max(32, Math.round((1024 * T) / W)), spec.spine);
  const spineMat = std("#ffffff", hardcover ? 0.55 : 0.4, 0, { map: spineTex });

  // Front cover texture: drawn upright then turned so the spine edge is at +z.
  let topMat: THREE.Material = coverMat;
  if (spec.front) {
    const upright = document.createElement("canvas");
    upright.width = Math.round(768 * (D / W));
    upright.height = 768;
    spec.front(upright.getContext("2d")!, upright.width, upright.height);
    const tex = canvasTexture(upright.height, upright.width, (ctx, w, h) => {
      // Rotate 90° counter-clockwise: the cover's left edge (spine) ends at the bottom.
      ctx.translate(0, h);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(upright, 0, 0, h, w);
    });
    topMat = std("#ffffff", 0.4, 0, { map: tex });
  }

  // Box face order: +x, -x, +y, -y, +z, -z.
  // The boards stop where the spine starts: no two faces ever share a plane
  // (coplanar faces z-fight and flicker as thin stripes).
  const boardD = D - board;
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(W, board, boardD), coverMat);
  bottom.position.set(0, board / 2, -board / 2);
  book.add(bottom);

  const top = new THREE.Mesh(new THREE.BoxGeometry(W, board, boardD), [coverMat, coverMat, topMat, coverMat, coverMat, coverMat]);
  top.position.set(0, T - board / 2, -board / 2);
  book.add(top);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(W, T, board), [coverMat, coverMat, coverMat, coverMat, spineMat, coverMat]);
  spine.position.set(0, T / 2, D / 2 - board / 2);
  book.add(spine);

  // Page block, set back from the head, tail and fore-edge.
  const pagesW = W - over * 2;
  const pagesD = D - over - board;
  const pagesT = T - board * 2;
  const pagesMat = std("#ffffff", 0.9, 0, { map: pages });
  const block = new THREE.Mesh(new THREE.BoxGeometry(pagesW, pagesT, pagesD), pagesMat);
  block.position.set(0, T / 2, -D / 2 + over + pagesD / 2);
  book.add(block);

  return shadowed(book);
}

export function createBooks() {
  const group = new THREE.Group();
  group.position.set(0.49, DESK_TOP, -0.19);
  group.rotation.y = -0.22;

  const pages = pagesTexture();
  pages.wrapS = THREE.RepeatWrapping;
  pages.wrapT = THREE.RepeatWrapping;

  let y = 0;
  BOOKS.forEach((spec, i) => {
    const book = buildBook(spec, pages);
    book.position.y = y;
    book.rotation.y = [0.04, -0.09, 0.07, -0.03][i] ?? 0;
    book.position.x = [0, 0.006, -0.004, 0.003][i] ?? 0;
    y += spec.thickness + 0.0004;
    group.add(book);
  });
  return group;
}
