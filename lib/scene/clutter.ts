import * as THREE from "three";
import { DESK_TOP, shadowed, std } from "./objects";
import { radialShadowTexture, rng } from "./textures";

/**
 * Small details that make the desk look lived in: loose sheets of maths
 * homework written in pencil, and a waste-paper basket under the desk.
 */

const HAND = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', 'Chalkboard SE', cursive";
const PENCIL = "rgba(62,62,70,0.86)";

/* ------------------------------------------------------------------------ */
/* Loose sheets                                                              */
/* ------------------------------------------------------------------------ */

type Line = { text: string; indent?: number; size?: number; strike?: boolean } | { sketch: "parabola" | "matrix" | "box" };

const SHEETS: Line[][] = [
  [
    { text: "Exercice 1", size: 1.15 },
    { text: "f(x) = x² ln(x)   sur ]0 ; +∞[", indent: 1 },
    { text: "f'(x) = 2x ln(x) + x²·(1/x)", indent: 1 },
    { text: "       = 2x ln(x) + x", indent: 1 },
    { text: "       = x (2 ln(x) + 1)", indent: 1 },
    { text: "f'(x) = 0  ⇔  ln(x) = -1/2", indent: 1 },
    { text: "        ⇔  x = e^(-1/2) ≈ 0,61", indent: 1 },
    { sketch: "parabola" },
    { text: "Exercice 2", size: 1.15 },
    { text: "lim (sin x)/x = 1   (x → 0)", indent: 1 },
    { text: "lim (1 + 1/n)ⁿ = e", indent: 1 },
  ],
  [
    { text: "Intégrales", size: 1.15 },
    { text: "∫₀¹ x² dx = [x³/3]₀¹ = 1/3", indent: 1 },
    { text: "∫ x eˣ dx  (IPP)", indent: 1 },
    { text: "u = x   v' = eˣ", indent: 2 },
    { text: "= x eˣ − ∫ eˣ dx", indent: 1 },
    { text: "= (x − 1) eˣ + C", indent: 1 },
    { sketch: "box" },
    { text: "Suites", size: 1.15 },
    { text: "Σ k = n(n+1)/2   (k = 1..n)", indent: 1 },
    { text: "uₙ₊₁ = 2uₙ + 1,  u₀ = 0", indent: 1 },
    { text: "uₙ = 2ⁿ − 1  (récurrence)", indent: 1 },
  ],
  [
    { text: "Algèbre linéaire", size: 1.15 },
    { sketch: "matrix" },
    { text: "det(A) = 2·3 − 1·4 = 2", indent: 1 },
    { text: "A⁻¹ = 1/2 ( 3  −1 ; −4  2 )", indent: 1 },
    { text: "Complexité", size: 1.15 },
    { text: "T(n) = 2T(n/2) + n", indent: 1 },
    { text: "⇒ T(n) = O(n log n)", indent: 1 },
    { text: "O(n²) pour le tri à bulles", indent: 1, strike: true },
    { text: "dichotomie : O(log n)", indent: 1 },
  ],
];

/** Squared maths paper ("petits carreaux") with pencil notes. */
function sheetTexture(lines: Line[], seed: number) {
  const W = 768;
  const H = Math.round(W * Math.SQRT2); // A4 ratio
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = rng(seed);

  ctx.fillStyle = "#f8f7f2";
  ctx.fillRect(0, 0, W, H);
  // 5 mm squares.
  const sq = W / 42;
  ctx.strokeStyle = "rgba(120,150,190,0.22)";
  ctx.lineWidth = 1;
  for (let x = sq; x < W; x += sq) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = sq; y < H; y += sq) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  // Margin.
  ctx.strokeStyle = "rgba(220,80,80,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sq * 5, 0);
  ctx.lineTo(sq * 5, H);
  ctx.stroke();

  // Pencil writing, slightly irregular.
  ctx.fillStyle = PENCIL;
  ctx.strokeStyle = PENCIL;
  ctx.textBaseline = "alphabetic";
  let y = sq * 4;
  const left = sq * 5.8;
  const lh = sq * 2;
  for (const line of lines) {
    if ("sketch" in line) {
      ctx.save();
      ctx.lineWidth = 2.2;
      ctx.translate(left + sq * 2, y);
      if (line.sketch === "parabola") {
        const w = sq * 14;
        const h = sq * 7;
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(w, h);
        ctx.moveTo(w * 0.2, h + 6);
        ctx.lineTo(w * 0.2, 0);
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const px = w * (0.22 + t * 0.75);
          const xx = 0.05 + t * 1.6;
          const v = xx * xx * Math.log(xx);
          ctx.lineTo(px, h * 0.7 - v * h * 0.45);
        }
        ctx.stroke();
        ctx.font = `${sq * 0.9}px ${HAND}`;
        ctx.fillText("y = f(x)", w * 0.78, h * 0.1);
        y += h + lh * 0.9;
      } else if (line.sketch === "matrix") {
        ctx.font = `${sq * 1.15}px ${HAND}`;
        ctx.fillText("A =", 0, sq * 1.6);
        const bx = sq * 3;
        ctx.beginPath();
        ctx.moveTo(bx + 6, -sq * 0.2);
        ctx.quadraticCurveTo(bx - 4, sq * 1.3, bx + 6, sq * 2.8);
        ctx.moveTo(bx + sq * 4.6, -sq * 0.2);
        ctx.quadraticCurveTo(bx + sq * 4.6 + 10, sq * 1.3, bx + sq * 4.6, sq * 2.8);
        ctx.stroke();
        ctx.fillText("2   1", bx + sq * 0.8, sq * 0.9);
        ctx.fillText("4   3", bx + sq * 0.8, sq * 2.3);
        y += sq * 3.6;
      } else {
        // A boxed result.
        ctx.font = `${sq * 1.1}px ${HAND}`;
        const text = "∫₀^π sin x dx = 2";
        const tw = ctx.measureText(text).width;
        ctx.fillText(text, sq * 0.6, sq * 1.2);
        ctx.strokeRect(0, -sq * 0.2, tw + sq * 1.2, sq * 2);
        y += sq * 2.8;
      }
      ctx.restore();
      continue;
    }
    const size = sq * 1.05 * (line.size ?? 1);
    ctx.save();
    ctx.translate(left + (line.indent ?? 0) * sq * 1.4 + (rand() - 0.5) * 6, y + (rand() - 0.5) * 3);
    ctx.rotate((rand() - 0.5) * 0.02);
    ctx.font = `${line.size ? 600 : 400} ${Math.round(size)}px ${HAND}`;
    ctx.fillText(line.text, 0, 0);
    if (line.size) {
      const w = ctx.measureText(line.text).width;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(w, 5);
      ctx.stroke();
    }
    if (line.strike) {
      const w = ctx.measureText(line.text).width;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -size * 0.3);
      ctx.lineTo(w + 4, -size * 0.36);
      ctx.stroke();
    }
    ctx.restore();
    y += lh * (line.size ? 1.25 : 1);
  }

  // A few eraser smudges.
  for (let i = 0; i < 4; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, "rgba(90,90,100,0.05)");
    g.addColorStop(1, "rgba(90,90,100,0)");
    ctx.save();
    ctx.translate(rand() * W, rand() * H);
    ctx.scale(40 + rand() * 60, 14 + rand() * 20);
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function pencil() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0037, 0.0037, 0.16, 6), std("#2f3a33", 0.5));
  g.add(body);
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.0037, 0.017, 6), std("#e5cfa6", 0.7));
  wood.position.y = 0.0885;
  g.add(wood);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.0011, 0.005, 6), std("#3a3a3a", 0.4));
  lead.position.y = 0.0985;
  g.add(lead);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.0039, 0.0039, 0.008, 12), std("#c9c9cc", 0.3, 0.8));
  ferrule.position.y = -0.084;
  g.add(ferrule);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.0037, 0.0037, 0.007, 12), std("#e6a3a3", 0.9));
  eraser.position.y = -0.0915;
  g.add(eraser);
  g.rotation.z = Math.PI / 2;
  return shadowed(g);
}

export function createLooseSheets() {
  const group = new THREE.Group();
  group.position.set(0.63, DESK_TOP, 0.16);

  const A4 = { w: 0.21, h: 0.297 };
  const layout = [
    { x: 0.0, z: 0.02, r: -0.42 },
    { x: -0.035, z: -0.01, r: 0.18 },
    { x: 0.02, z: 0.03, r: -0.08 },
  ];
  SHEETS.forEach((lines, i) => {
    const l = layout[i];
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(A4.w, A4.h),
      std("#ffffff", 0.95, 0, { map: sheetTexture(lines, 31 + i * 7) }),
    );
    sheet.rotation.x = -Math.PI / 2;
    sheet.rotation.z = l.r;
    // Stacked a little apart so they never z-fight.
    sheet.position.set(l.x, 0.0009 + i * 0.0006, l.z);
    sheet.receiveShadow = true;
    group.add(sheet);
  });

  const p = pencil();
  p.rotation.y = 0.9;
  p.position.set(-0.02, 0.0009 + SHEETS.length * 0.0006 + 0.0037, 0.06);
  group.add(p);
  return group;
}

/* ------------------------------------------------------------------------ */
/* Waste-paper basket                                                        */
/* ------------------------------------------------------------------------ */

/** A crumpled ball of paper: a noisy icosphere with flat shading. */
function crumpledBall(radius: number, seed: number) {
  const geom = new THREE.IcosahedronGeometry(radius, 2);
  const rand = rng(seed);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const offsets = new Map<string, number>();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Same displacement for vertices shared between faces (no cracks).
    const key = `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`;
    let k = offsets.get(key);
    if (k === undefined) {
      k = 0.72 + rand() * 0.42;
      offsets.set(key, k);
    }
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: "#f3f1ea", roughness: 0.95, flatShading: true }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createWasteBasket() {
  const group = new THREE.Group();
  // On the floor, under the left side of the desk.
  group.position.set(-0.5, 0, -0.18);

  const H = 0.29;
  const rBottom = 0.1;
  const rTop = 0.125;
  const wall = 0.003;
  // Tapered open cylinder: outer wall, inner wall and floor in one profile.
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(rBottom, 0),
    new THREE.Vector2(rTop, H),
    new THREE.Vector2(rTop - wall, H),
    new THREE.Vector2(rBottom - wall, wall),
    new THREE.Vector2(0, wall),
  ];
  const binMat = std("#2a2a2d", 0.55, 0.35, { side: THREE.DoubleSide });
  const bin = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), binMat);
  group.add(bin);
  // Rolled rim.
  const rim = new THREE.Mesh(new THREE.TorusGeometry(rTop - wall / 2, 0.0035, 10, 64), binMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = H;
  group.add(rim);
  shadowed(group);

  // Crumpled drafts: a few inside (some peeking out), one missed shot.
  const balls: [number, number, number, number][] = [
    [-0.03, 0.2, 0.02, 0.04],
    [0.035, 0.225, -0.025, 0.037],
    [0.0, 0.265, 0.035, 0.035],
    [-0.02, 0.252, -0.04, 0.032],
  ];
  balls.forEach(([x, y, z, r], i) => {
    const b = crumpledBall(r, 100 + i);
    b.position.set(x, y, z);
    b.rotation.set(i, i * 2, i * 3);
    group.add(b);
  });
  const missed = crumpledBall(0.034, 200);
  missed.position.set(0.19, 0.03, 0.09);
  group.add(missed);

  // Soft contact shadows on the floor.
  const shadowMat = new THREE.MeshBasicMaterial({ map: radialShadowTexture(), color: 0x2b241a, transparent: true, opacity: 0.45, depthWrite: false });
  const s1 = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), shadowMat);
  s1.rotation.x = -Math.PI / 2;
  s1.position.y = 0.0015;
  group.add(s1);
  const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), shadowMat);
  s2.rotation.x = -Math.PI / 2;
  s2.position.set(0.19, 0.0015, 0.09);
  group.add(s2);

  return group;
}
