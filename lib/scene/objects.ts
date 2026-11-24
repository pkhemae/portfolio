import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  glassTexture,
  labelTexture,
  paperTexture,
  radialShadowTexture,
  rng,
  stickyNoteTexture,
  woodTexture,
} from "./textures";

/**
 * Procedural models of the desk setup. Units are meters, the desk top sits at
 * y = DESK_TOP.
 */

export const DESK_TOP = 0.76;
export const ACCENT = "#1D2DFF";

/** Screen size (16:10) in world units and its virtual size in CSS pixels. */
export const SCREEN = {
  width: 0.576,
  height: 0.36,
  pxWidth: 1280,
  pxHeight: 800,
};

const std = (color: THREE.ColorRepresentation, roughness = 0.6, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

function rbox(w: number, h: number, d: number, r: number, mat: THREE.Material, segments = 4) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, segments, Math.min(r, w / 2, h / 2, d / 2)), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function shadowed<T extends THREE.Object3D>(obj: T): T {
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

/* ------------------------------------------------------------------------ */

export function createGround() {
  const group = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ color: 0x3a3226, opacity: 0.16 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Soft contact shadow under the desk (ambient occlusion feel).
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.6),
    new THREE.MeshBasicMaterial({
      map: radialShadowTexture(),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      color: 0x2b241a,
    }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.001;
  group.add(blob);
  return { group, floorMaterial: floor.material as THREE.ShadowMaterial, blobMaterial: blob.material as THREE.MeshBasicMaterial };
}

export function createDesk() {
  const group = new THREE.Group();
  const wood = woodTexture();
  wood.repeat.set(1, 1);
  const topMat = std("#ffffff", 0.55, 0, { map: wood });
  const top = rbox(1.7, 0.035, 0.8, 0.012, topMat);
  top.position.y = DESK_TOP - 0.0175;
  group.add(top);

  const metal = std("#1f1f22", 0.45, 0.6);
  const legH = DESK_TOP - 0.035;
  const legPositions: [number, number][] = [
    [-0.78, -0.33],
    [0.78, -0.33],
    [-0.78, 0.33],
    [0.78, 0.33],
  ];
  for (const [x, z] of legPositions) {
    const leg = rbox(0.032, legH, 0.032, 0.006, metal, 2);
    leg.position.set(x, legH / 2, z);
    group.add(leg);
  }
  // Side rails and back rail.
  for (const x of [-0.78, 0.78]) {
    const rail = rbox(0.03, 0.03, 0.7, 0.006, metal, 2);
    rail.position.set(x, legH - 0.04, 0);
    group.add(rail);
  }
  const back = rbox(1.56, 0.03, 0.03, 0.006, metal, 2);
  back.position.set(0, legH - 0.04, -0.33);
  group.add(back);

  return group;
}

/* ------------------------------------------------------------------------ */

export interface MonitorParts {
  group: THREE.Group;
  /** Plane exactly covering the visible display area (used for the CSS3D hole + raycasting). */
  screenPlane: THREE.Mesh;
  glass: THREE.Mesh;
  dimmer: THREE.Mesh;
  /** Display center in world space and outward normal. */
  screenCenter: THREE.Vector3;
  screenNormal: THREE.Vector3;
  led: THREE.MeshStandardMaterial;
}

export function createMonitor(): MonitorParts {
  const group = new THREE.Group();
  group.position.set(0, DESK_TOP, -0.2);

  const shell = std("#efebe4", 0.42, 0.0);
  const dark = std("#111113", 0.25, 0.1);

  // Stand.
  const base = rbox(0.24, 0.012, 0.17, 0.006, shell);
  base.position.set(0, 0.006, 0.0);
  group.add(base);
  const neck = rbox(0.06, 0.25, 0.022, 0.008, shell);
  neck.position.set(0, 0.14, -0.045);
  neck.rotation.x = -0.06;
  group.add(neck);

  // Body.
  const bodyY = 0.335;
  const body = rbox(0.64, 0.43, 0.034, 0.016, shell, 5);
  body.position.set(0, bodyY, 0);
  group.add(body);
  const hump = rbox(0.42, 0.26, 0.05, 0.03, shell, 4);
  hump.position.set(0, bodyY - 0.01, -0.03);
  group.add(hump);

  // Bezel (black glass) and display area.
  const front = 0.017;
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.606, 0.386), dark);
  bezel.position.set(0, bodyY + 0.012, front + 0.0004);
  bezel.receiveShadow = true;
  group.add(bezel);

  const screenY = bodyY + 0.012;
  const screenPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    // Punches a transparent hole into the WebGL canvas so that the DOM layer
    // underneath (the CSS3D "OS") shows through, while still being occluded
    // by geometry in front of it thanks to the depth test.
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true, blending: THREE.NoBlending, side: THREE.DoubleSide }),
  );
  screenPlane.position.set(0, screenY, front + 0.0008);
  screenPlane.name = "screen";
  screenPlane.renderOrder = 1;
  group.add(screenPlane);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshBasicMaterial({ map: glassTexture(), transparent: true, opacity: 0.22, depthWrite: false }),
  );
  glass.position.set(0, screenY, front + 0.0012);
  glass.renderOrder = 3;
  group.add(glass);

  // Darkens the screen when seen from a grazing angle / far away.
  const dimmer = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }),
  );
  dimmer.position.set(0, screenY, front + 0.001);
  dimmer.renderOrder = 2;
  group.add(dimmer);

  // Chin details: small logo dot + power LED.
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.006, 24), std(ACCENT, 0.4));
  logo.position.set(0, bodyY - 0.193, front + 0.0006);
  group.add(logo);
  const led = std("#7CFFB2", 0.3, 0, { emissive: new THREE.Color("#3dff8b"), emissiveIntensity: 1.5 });
  const ledMesh = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 16), led);
  ledMesh.position.set(0.285, bodyY - 0.196, front + 0.0006);
  group.add(ledMesh);

  // Sticky note on the bezel.
  const note = new THREE.Mesh(
    new THREE.PlaneGeometry(0.07, 0.07),
    std("#ffffff", 0.9, 0, { map: stickyNoteTexture(["salut", ":)"]) }),
  );
  // Sits on the top edge so it never covers the display when zoomed in.
  note.position.set(0.25, bodyY + 0.236, front + 0.0035);
  note.rotation.z = -0.12;
  note.rotation.x = -0.05;
  note.castShadow = true;
  group.add(note);

  shadowed(group);
  screenPlane.castShadow = false;
  glass.castShadow = false;
  dimmer.castShadow = false;
  screenPlane.receiveShadow = false;
  glass.receiveShadow = false;
  dimmer.receiveShadow = false;

  group.updateMatrixWorld(true);
  const screenCenter = new THREE.Vector3();
  screenPlane.getWorldPosition(screenCenter);
  const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(screenPlane.getWorldQuaternion(new THREE.Quaternion()));

  return { group, screenPlane, glass, dimmer, screenCenter, screenNormal, led };
}

/* ------------------------------------------------------------------------ */

export function createKeyboard() {
  const group = new THREE.Group();
  group.position.set(-0.02, DESK_TOP, 0.17);
  group.rotation.y = 0.02;

  const shell = std("#e9e5dd", 0.5);
  const body = rbox(0.43, 0.016, 0.135, 0.006, shell);
  body.position.y = 0.008;
  body.rotation.x = 0.035;
  group.add(body);

  const keyMat = std("#f7f5f0", 0.55);
  const keyDark = std("#c9c4ba", 0.55);
  const keyAccent = std(ACCENT, 0.45);
  const keyGeom = new RoundedBoxGeometry(1, 1, 1, 2, 0.18);

  const unit = 0.0262;
  const gap = 0.0032;
  const rows: { w: number; mat?: THREE.Material }[][] = [
    [{ w: 1, mat: keyAccent }, ...Array(12).fill({ w: 1 }), { w: 2, mat: keyDark }],
    [{ w: 1.5, mat: keyDark }, ...Array(12).fill({ w: 1 }), { w: 1.5, mat: keyDark }],
    [{ w: 1.75, mat: keyDark }, ...Array(11).fill({ w: 1 }), { w: 2.25, mat: keyAccent }],
    [{ w: 2.25, mat: keyDark }, ...Array(10).fill({ w: 1 }), { w: 2.75, mat: keyDark }],
    [{ w: 1.5, mat: keyDark }, { w: 1.5, mat: keyDark }, { w: 7 }, { w: 1.5, mat: keyDark }, { w: 1.5, mat: keyDark }, { w: 1, mat: keyDark }],
  ];
  const totalW = 15 * unit;
  rows.forEach((row, r) => {
    let x = -totalW / 2;
    const z = -0.052 + r * unit;
    row.forEach((k) => {
      const w = k.w * unit;
      const key = new THREE.Mesh(keyGeom, k.mat ?? keyMat);
      key.scale.set(w - gap, 0.009, unit - gap);
      key.position.set(x + w / 2, 0.019 + (0.052 - r * unit) * 0.035 + 0.002, z + 0.002);
      key.castShadow = true;
      key.receiveShadow = true;
      group.add(key);
      x += w;
    });
  });
  return group;
}

export function createMouse() {
  const group = new THREE.Group();
  group.position.set(0.36, DESK_TOP, 0.17);

  const pad = rbox(0.27, 0.003, 0.21, 0.0015, std("#2b2b2f", 0.95), 2);
  pad.position.y = 0.0015;
  group.add(pad);

  const mouse = new THREE.Group();
  const shell = std("#f1eee8", 0.35);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), shell);
  body.scale.set(0.031, 0.02, 0.054);
  mouse.add(body);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 16), std("#9a958c", 0.5));
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, 0.019, -0.022);
  mouse.add(wheel);
  mouse.position.set(0.02, 0.003, 0.0);
  mouse.rotation.y = -0.15;
  group.add(shadowed(mouse));
  return { group, mouse };
}

/* ------------------------------------------------------------------------ */

const steamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const steamFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35;
    uv.x += (noise(vec2(uv.y * 3.0 - t * 2.0, t)) - 0.5) * 0.45 * uv.y;
    float n = noise(vec2(uv.x * 5.0, uv.y * 3.0 - t * 3.0));
    n = smoothstep(0.45, 0.85, n);
    float edge = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x);
    float fade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.45, uv.y);
    gl_FragColor = vec4(vec3(1.0), n * edge * fade * uOpacity);
  }
`;

export function createMug() {
  const group = new THREE.Group();
  group.position.set(-0.45, DESK_TOP, 0.04);

  const profile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.036, 0.0),
    new THREE.Vector2(0.039, 0.004),
    new THREE.Vector2(0.041, 0.09),
    new THREE.Vector2(0.037, 0.09),
    new THREE.Vector2(0.035, 0.008),
    new THREE.Vector2(0.0, 0.008),
  ];
  const mat = std(ACCENT, 0.35, 0, { side: THREE.DoubleSide });
  const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), mat);
  group.add(cup);

  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), std("#3b2416", 0.15));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.075;
  group.add(coffee);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 12, 24, Math.PI), mat);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.04, 0.047, 0);
  group.add(handle);
  shadowed(group);

  const steamMat = new THREE.ShaderMaterial({
    vertexShader: steamVertex,
    fragmentShader: steamFragment,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.55 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const steam = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.2), steamMat);
  steam.position.set(0, 0.18, 0);
  steam.renderOrder = 4;
  group.add(steam);

  // Invisible, slightly larger hit box for easier clicking.
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.11, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.05;
  hit.name = "mug";
  group.add(hit);

  return { group, steam, steamMat, hit };
}

export function createLamp() {
  const group = new THREE.Group();
  group.position.set(-0.66, DESK_TOP, -0.24);
  group.rotation.y = 0.55;
  group.scale.setScalar(0.88);

  const black = std("#1c1c1f", 0.4, 0.5);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.082, 0.022, 48), black);
  base.position.y = 0.011;
  group.add(base);

  const joint = (y: number) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.014, 20, 14), black);
    s.position.y = y;
    return s;
  };

  // Lower arm (tilted back), upper arm (forward), shade.
  const lower = new THREE.Group();
  lower.position.y = 0.022;
  lower.rotation.x = -0.35;
  group.add(lower);
  lower.add(joint(0));
  const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 16), black);
  lowerArm.position.y = 0.17;
  lower.add(lowerArm);

  const upper = new THREE.Group();
  upper.position.y = 0.34;
  upper.rotation.x = 1.55;
  lower.add(upper);
  upper.add(joint(0));
  const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.3, 16), black);
  upperArm.position.y = 0.15;
  upper.add(upperArm);

  const head = new THREE.Group();
  head.position.y = 0.3;
  head.rotation.x = 0.95;
  upper.add(head);
  head.add(joint(0));

  const shadeMat = std("#1c1c1f", 0.35, 0.4, { side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.075, 0.11, 48, 1, true), shadeMat);
  shade.position.y = -0.06;
  head.add(shade);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shadeMat);
  cap.position.y = -0.008;
  head.add(cap);

  const bulbMat = new THREE.MeshStandardMaterial({ color: "#fff7e0", emissive: new THREE.Color("#ffd9a0"), emissiveIntensity: 0.2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 24, 16), bulbMat);
  bulb.position.y = -0.085;
  head.add(bulb);

  shadowed(group);
  bulb.castShadow = false;

  const spot = new THREE.SpotLight("#ffd29a", 0, 3.5, 0.85, 0.75, 1.4);
  spot.position.set(0, -0.08, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.01;
  spot.shadow.camera.near = 0.05;
  head.add(spot);
  const target = new THREE.Object3D();
  target.position.set(0, -1, 0);
  head.add(target);
  spot.target = target;

  const glow = new THREE.PointLight("#ffcf8f", 0, 1.2, 2);
  glow.position.set(0, -0.1, 0);
  head.add(glow);

  const hit = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.45), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0, 0.3, 0.12);
  hit.name = "lamp";
  group.add(hit);

  return { group, spot, glow, bulbMat, hit };
}

export function createPlant() {
  const group = new THREE.Group();
  group.position.set(0.7, DESK_TOP, -0.2);

  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.052, 0),
    new THREE.Vector2(0.066, 0.12),
    new THREE.Vector2(0.06, 0.12),
    new THREE.Vector2(0.056, 0.105),
    new THREE.Vector2(0, 0.105),
  ];
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potProfile, 48), std("#f4f1ea", 0.65));
  group.add(pot);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.057, 32), std("#4a3a2c", 1));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.106;
  group.add(soil);

  const foliage = new THREE.Group();
  foliage.position.y = 0.1;
  group.add(foliage);
  const greens = ["#3f7d4e", "#4f9460", "#356b43", "#5ea56f"];
  const rand = rng(42);
  const leafGeom = new THREE.SphereGeometry(1, 16, 12);
  const count = 11;
  for (let i = 0; i < count; i++) {
    const pivot = new THREE.Group();
    const angle = (i / count) * Math.PI * 2 + rand() * 0.4;
    const tilt = 0.25 + rand() * 0.55;
    const len = 0.11 + rand() * 0.08;
    pivot.rotation.y = angle;
    pivot.rotation.z = tilt;
    const leaf = new THREE.Mesh(leafGeom, std(greens[i % greens.length], 0.55, 0, { side: THREE.DoubleSide }));
    leaf.scale.set(0.022 + rand() * 0.008, len, 0.006);
    leaf.position.y = len;
    pivot.add(leaf);
    pivot.userData.baseZ = tilt;
    pivot.userData.phase = rand() * Math.PI * 2;
    foliage.add(pivot);
  }
  shadowed(group);

  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.36, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.18;
  hit.name = "plant";
  group.add(hit);

  return { group, foliage, hit };
}

export function createBooks() {
  const group = new THREE.Group();
  group.position.set(0.47, DESK_TOP, -0.2);
  group.rotation.y = -0.25;

  const books = [
    { w: 0.2, h: 0.028, d: 0.27, color: "#1f1f22", label: "ALGO", fg: "#e9e5dd" },
    { w: 0.19, h: 0.022, d: 0.25, color: "#f1ede6", label: "MATHS", fg: "#1f1f22" },
    { w: 0.175, h: 0.032, d: 0.235, color: ACCENT, label: "KOTLIN", fg: "#ffffff" },
  ];
  let y = 0;
  books.forEach((b, i) => {
    const book = new THREE.Group();
    const cover = rbox(b.w, b.h, b.d, 0.003, std(b.color, 0.6), 2);
    book.add(cover);
    const pages = rbox(b.w - 0.008, b.h * 0.8, b.d - 0.004, 0.001, std("#f7f3e8", 0.9), 1);
    pages.position.x = 0.006;
    book.add(pages);
    const spine = new THREE.Mesh(
      new THREE.PlaneGeometry(b.d * 0.7, b.h * 0.7),
      new THREE.MeshStandardMaterial({ map: labelTexture(b.label, b.color, b.fg), roughness: 0.6 }),
    );
    spine.rotation.y = -Math.PI / 2;
    spine.position.x = -b.w / 2 - 0.0005;
    book.add(spine);
    book.position.y = y + b.h / 2;
    book.rotation.y = (i - 1) * 0.12;
    y += b.h;
    group.add(shadowed(book));
  });
  return group;
}

export function createNotebook() {
  const group = new THREE.Group();
  group.position.set(-0.62, DESK_TOP, 0.2);
  group.rotation.y = 0.28;

  const cover = rbox(0.16, 0.008, 0.215, 0.002, std("#2a2a2e", 0.8), 1);
  cover.position.y = 0.004;
  group.add(cover);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.205), std("#ffffff", 0.95, 0, { map: paperTexture() }));
  paper.rotation.x = -Math.PI / 2;
  paper.position.y = 0.0085;
  paper.receiveShadow = true;
  group.add(paper);

  const pencil = new THREE.Group();
  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.15, 6), std("#f2c14e", 0.5));
  pencil.add(bodyMesh);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0038, 0.018, 6), std("#e8d2a8", 0.7));
  tip.position.y = 0.084;
  pencil.add(tip);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.0039, 0.0039, 0.012, 12), std("#e88a8a", 0.8));
  eraser.position.y = -0.081;
  pencil.add(eraser);
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = 0.5;
  pencil.position.set(0.105, 0.004, 0.02);
  group.add(pencil);

  return shadowed(group);
}

export function createHeadphones() {
  const group = new THREE.Group();
  group.position.set(0.66, DESK_TOP, 0.17);
  group.rotation.y = -0.6;
  const mat = std("#202024", 0.55, 0.2);
  const cushion = std("#38383d", 0.9);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 12, 40, Math.PI), mat);
  band.rotation.x = -Math.PI / 2;
  band.position.y = 0.022;
  group.add(band);
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.024, 32), mat);
    cup.position.set(side * 0.075, 0.017, 0);
    group.add(cup);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 28), cushion);
    pad.rotation.x = Math.PI / 2;
    pad.position.set(side * 0.075, 0.03, 0);
    group.add(pad);
  }
  return shadowed(group);
}
