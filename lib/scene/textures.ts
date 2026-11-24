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

export function woodTexture(): THREE.CanvasTexture {
  const w = 2048;
  const h = 1024;
  const { canvas, ctx } = makeCanvas(w, h);
  const rand = rng(7);

  ctx.fillStyle = "#d8bf9c";
  ctx.fillRect(0, 0, w, h);

  // Broad tone variations.
  for (let i = 0; i < 18; i++) {
    const y = rand() * h;
    const grd = ctx.createLinearGradient(0, y - 80, 0, y + 80);
    const tone = rand() > 0.5 ? "rgba(160,120,80," : "rgba(240,220,190,";
    grd.addColorStop(0, tone + "0)");
    grd.addColorStop(0.5, tone + (0.08 + rand() * 0.1) + ")");
    grd.addColorStop(1, tone + "0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, y - 80, w, 160);
  }

  // Fine grain lines.
  for (let i = 0; i < 520; i++) {
    const y0 = rand() * h;
    const amp = 2 + rand() * 10;
    const freq = 0.001 + rand() * 0.004;
    const phase = rand() * Math.PI * 2;
    ctx.strokeStyle = `rgba(${110 + rand() * 40},${75 + rand() * 30},${45 + rand() * 20},${0.04 + rand() * 0.12})`;
    ctx.lineWidth = 0.6 + rand() * 1.6;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const y = y0 + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

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

/** Small text label for a book spine / cover. */
export function labelTexture(text: string, bg: string, fg: string, w = 512, h = 128): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = `600 ${Math.round(h * 0.42)}px ui-monospace, 'SFMono-Regular', Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
