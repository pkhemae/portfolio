import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  paperTexture,
  radialShadowTexture,
  rng,
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
  width: 0.597,
  height: 0.336,
  pxWidth: 1440,
  pxHeight: 810,
};

export const std = (color: THREE.ColorRepresentation, roughness = 0.6, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

export function rbox(w: number, h: number, d: number, r: number, mat: THREE.Material, segments = 4) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, segments, Math.min(r, w / 2, h / 2, d / 2)), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function shadowed<T extends THREE.Object3D>(obj: T): T {
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

/* ------------------------------------------------------------------------ */

/**
 * Soft shadow of the desk on the floor, pre-drawn on a canvas (blurred desk
 * top projected along the key light, darker spots under the legs). It stays
 * soft from every angle, unlike a real-time shadow map, and costs nothing.
 */
function deskFloorShadowTexture(lightOffset: { x: number; z: number }) {
  const size = 1024;
  const span = 4; // meters covered by the texture
  const k = size / span;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const px = (x: number) => (x + span / 2) * k;
  const pz = (z: number) => (z + span / 2) * k;

  // Wide ambient occlusion under the whole desk.
  ctx.filter = "blur(70px)";
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(px(-0.95), pz(-0.5), 1.9 * k, 1.0 * k);

  // Desk top projected by the key light, with a wide penumbra.
  ctx.filter = "blur(30px)";
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(px(-0.85 + lightOffset.x), pz(-0.4 + lightOffset.z), 1.7 * k, 0.8 * k);

  // Contact shadows where the legs touch the floor.
  ctx.filter = "blur(6px)";
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  for (const [x, z] of [
    [-0.78, -0.33],
    [0.78, -0.33],
    [-0.78, 0.33],
    [0.78, 0.33],
  ]) {
    ctx.beginPath();
    ctx.arc(px(x), pz(z), 0.03 * k, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "none";
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function createGround(lightDir = new THREE.Vector3(-1.2, 5.4, 1.9)) {
  const group = new THREE.Group();

  // Where the desk top's shadow lands: projected from its height along the light.
  const h = DESK_TOP;
  const offset = { x: (-lightDir.x / lightDir.y) * h, z: (-lightDir.z / lightDir.y) * h };

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshBasicMaterial({ map: deskFloorShadowTexture(offset), color: 0x2b241a, transparent: true, opacity: 0.32, depthWrite: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.001;
  group.add(floor);

  // Kept for the day/night lighting code (very soft extra occlusion).
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.1),
    new THREE.MeshBasicMaterial({
      map: radialShadowTexture(),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      color: 0x2b241a,
    }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.0005;
  group.add(blob);
  return { group, floorMaterial: floor.material as THREE.MeshBasicMaterial, blobMaterial: blob.material as THREE.MeshBasicMaterial };
}

export function createDesk() {
  const group = new THREE.Group();
  const wood = woodTexture();
  wood.repeat.set(1, 1);
  const topMat = std("#ffffff", 0.42, 0, { map: wood });
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

export function createNotebook() {
  const group = new THREE.Group();
  group.position.set(-0.62, DESK_TOP, 0.2);
  group.rotation.y = 0.28;

  const cover = rbox(0.16, 0.008, 0.215, 0.002, std("#2a2a2e", 0.8), 1);
  cover.position.y = 0.004;
  group.add(cover);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.205), std("#ffffff", 0.95, 0, { map: paperTexture() }));
  paper.rotation.x = -Math.PI / 2;
  paper.position.y = 0.0089;
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
