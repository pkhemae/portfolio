import * as THREE from "three";

/**
 * Procedural textures generated on a canvas, so the scene ships without any
 * binary asset.
 */

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

/** Deterministic pseudo random generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cheap, portable blur: scale the canvas down then back up with smoothing.
 * (ctx.filter = "blur()" is extremely slow on CPU-rendered canvases and
 * missing in older Safari.)
 */
export function softenCanvas(canvas: HTMLCanvasElement, factor: number) {
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(canvas.width / factor));
  small.height = Math.max(1, Math.round(canvas.height / factor));
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(canvas, 0, 0, small.width, small.height);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
}

export function woodTexture(): THREE.CanvasTexture {
  // Dark oak with a quiet, irregular figure: soft colour variations, then a
  // few faint grain lines of varying length, softened by resampling.
  const w = 2048;
  const h = 1024;
  const { canvas, ctx } = makeCanvas(w, h);
  const rand = rng(11);

  ctx.fillStyle = "#74502f";
  ctx.fillRect(0, 0, w, h);

  // Large, soft tone variations: radial gradients stretched along the grain.
  for (let i = 0; i < 70; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const rx = 200 + rand() * 700;
    const ry = 20 + rand() * 70;
    const dark = rand() > 0.45;
    const a = dark ? 0.08 + rand() * 0.14 : 0.06 + rand() * 0.12;
    const rgb = dark ? "58,36,20" : "150,108,66";
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  // Faint grain: segments of varying length and opacity.
  for (let i = 0; i < 340; i++) {
    const y0 = rand() * h;
    const x0 = rand() * w * 0.6 - w * 0.1;
    const len = w * (0.25 + rand() * 0.9);
    const amp = 1.5 + rand() * 6;
    const freq = 0.0015 + rand() * 0.004;
    const phase = rand() * Math.PI * 2;
    ctx.strokeStyle = `rgba(${45 + rand() * 25},${28 + rand() * 14},${14 + rand() * 10},${0.025 + rand() * 0.07})`;
    ctx.lineWidth = 0.8 + rand() * 2.2;
    ctx.beginPath();
    for (let x = x0; x <= x0 + len; x += 24) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase * 2) * amp * 0.3;
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Oak flecks: short, lighter, very subtle.
  for (let i = 0; i < 180; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 12 + rand() * 50;
    ctx.strokeStyle = `rgba(165,122,78,${0.04 + rand() * 0.07})`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rand() - 0.5) * 2);
    ctx.stroke();
  }

  softenCanvas(canvas, 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function radialShadowTexture(): THREE.CanvasTexture {
  const s = 256;
  const { canvas, ctx } = makeCanvas(s, s);
  const grd = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(0,0,0,1)");
  grd.addColorStop(0.45, "rgba(0,0,0,0.55)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(canvas);
}

/** Soft diagonal highlight used to fake a reflection on the screen glass. */
export function glassTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "rgba(255,255,255,0.0)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.32, "rgba(255,255,255,0.05)");
  grd.addColorStop(0.62, "rgba(255,255,255,0.0)");
  grd.addColorStop(0.7, "rgba(255,255,255,0.25)");
  grd.addColorStop(0.78, "rgba(255,255,255,0.0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Inner vignette so the screen feels recessed.
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.62);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function stickyNoteTexture(lines: string[]): THREE.CanvasTexture {
  const s = 256;
  const { canvas, ctx } = makeCanvas(s, s);
  ctx.fillStyle = "#f6e27a";
  ctx.fillRect(0, 0, s, s);
  const grd = ctx.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, "rgba(0,0,0,0.06)");
  grd.addColorStop(0.15, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "600 34px 'Comic Sans MS', 'Segoe Print', 'Bradley Hand', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) => {
    ctx.fillText(line, s / 2, s / 2 + (i - (lines.length - 1) / 2) * 46);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Lined paper for the notebook. */
export function paperTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 680;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#faf8f3";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(29,45,255,0.18)";
  ctx.lineWidth = 2;
  for (let y = 90; y < h; y += 34) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(w - 30, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(230,80,80,0.35)";
  ctx.beginPath();
  ctx.moveTo(70, 0);
  ctx.lineTo(70, h);
  ctx.stroke();

  // A tiny doodle: scribbled todo list.
  ctx.fillStyle = "rgba(40,40,40,0.75)";
  ctx.font = "500 26px 'Segoe Print', 'Bradley Hand', cursive";
  const todo = ["- finir le portfolio", "- réviser les maths", "- arroser la plante", "- dormir ?"];
  todo.forEach((t, i) => ctx.fillText(t, 86, 81 + 34 * (i + 1)));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
