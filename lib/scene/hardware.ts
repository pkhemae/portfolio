import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { DESK_TOP, SCREEN, rbox, shadowed, std } from "./objects";
import { glassTexture, stickyNoteTexture } from "./textures";

/**
 * Desk hardware in the style of a modern Apple setup: a 27" studio display,
 * a low-profile wireless keyboard and mouse, plus an architect lamp.
 * Everything is procedural; units are meters.
 */

const aluminium = () => std("#d9dadc", 0.32, 0.75);
const aluminiumDark = () => std("#c4c6c9", 0.38, 0.7);

/** A box spanning from `a` to `b` (its local Y axis), `w` wide and `t` thick. */
function boxBetween(a: THREE.Vector3, b: THREE.Vector3, w: number, t: number, mat: THREE.Material, r = 0.003) {
  const len = a.distanceTo(b);
  const mesh = rbox(w, len, t, r, mat, 3);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return mesh;
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const len = a.distanceTo(b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* ------------------------------------------------------------------------ */
/* Display                                                                   */
/* ------------------------------------------------------------------------ */

export interface DisplayParts {
  group: THREE.Group;
  /** Plane exactly covering the visible display area (CSS3D hole + raycasting). */
  screenPlane: THREE.Mesh;
  glass: THREE.Mesh;
  dimmer: THREE.Mesh;
  screenCenter: THREE.Vector3;
  screenNormal: THREE.Vector3;
}

export function createDisplay(): DisplayParts {
  const group = new THREE.Group();
  group.position.set(0, DESK_TOP, -0.2);

  const alu = aluminium();

  // Tilt- and height-adjustable stand (Studio Display XDR): a flat foot,
  // an upright column at the back and a counterbalanced arm holding the
  // display.
  const foot = rbox(0.21, 0.008, 0.205, 0.004, alu, 3);
  foot.position.set(0, 0.004, -0.02);
  group.add(foot);
  const columnBottom = new THREE.Vector3(0, 0.006, -0.105);
  const columnTop = new THREE.Vector3(0, 0.215, -0.118);
  group.add(boxBetween(columnBottom, columnTop, 0.15, 0.024, alu, 0.006));
  const hinge = new THREE.Vector3(0, 0.27, -0.045);
  const arm = boxBetween(columnTop, hinge, 0.13, 0.016, aluminiumDark(), 0.005);
  group.add(arm);
  // Pivot caps at both ends of the arm.
  for (const p of [columnTop, hinge]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.135, 24), aluminiumDark());
    cap.rotation.z = Math.PI / 2;
    cap.position.copy(p);
    group.add(cap);
  }

  // Display head, tilted back a little around the hinge.
  const head = new THREE.Group();
  head.position.copy(hinge);
  head.rotation.x = -0.07;
  group.add(head);

  const W = 0.623;
  const H = 0.362;
  const D = 0.024;
  const centerY = 0.06; // head center relative to the hinge
  const BZ = D / 2 + 0.004; // body sits just in front of the hinge
  const body = rbox(W, H, D, 0.011, alu, 5);
  body.position.set(0, centerY, BZ);
  head.add(body);

  const front = BZ + D / 2;
  const bezelMat = new THREE.MeshStandardMaterial({ color: "#050506", roughness: 0.08, metalness: 0.2 });
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.007, H - 0.007), bezelMat);
  bezel.position.set(0, centerY, front + 0.0003);
  head.add(bezel);

  // Tiny camera at the top of the bezel.
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 20), std("#1a1c22", 0.2, 0.4));
  cam.position.set(0, centerY + H / 2 - 0.0075, front + 0.0005);
  head.add(cam);

  const screenPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    // Punches a transparent hole in the WebGL canvas so the DOM (CSS3D) OS
    // underneath shows through, while staying depth-occluded.
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true, blending: THREE.NoBlending, side: THREE.DoubleSide }),
  );
  screenPlane.position.set(0, centerY, front + 0.0007);
  screenPlane.name = "screen";
  screenPlane.renderOrder = 1;
  head.add(screenPlane);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshBasicMaterial({ map: glassTexture(), transparent: true, opacity: 0.18, depthWrite: false }),
  );
  glass.position.set(0, centerY, front + 0.0011);
  glass.renderOrder = 3;
  head.add(glass);

  const dimmer = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }),
  );
  dimmer.position.set(0, centerY, front + 0.0009);
  dimmer.renderOrder = 2;
  head.add(dimmer);

  // Back: a slightly darker round plate where the arm attaches.
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.004, 48), aluminiumDark());
  plate.rotation.x = Math.PI / 2;
  plate.position.set(0, 0.0, BZ - D / 2 - 0.0015);
  head.add(plate);

  shadowed(group);
  for (const m of [screenPlane, glass, dimmer, bezel, cam]) {
    m.castShadow = false;
    m.receiveShadow = false;
  }
  bezel.receiveShadow = true;

  group.updateMatrixWorld(true);
  const screenCenter = new THREE.Vector3();
  screenPlane.getWorldPosition(screenCenter);
  const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(screenPlane.getWorldQuaternion(new THREE.Quaternion()));

  return { group, screenPlane, glass, dimmer, screenCenter, screenNormal };
}

/* ------------------------------------------------------------------------ */
/* Keyboard, mouse, desk mat                                                 */
/* ------------------------------------------------------------------------ */

export function createDeskMat() {
  const mat = rbox(0.72, 0.003, 0.27, 0.0015, std("#4a4846", 0.97), 2);
  mat.position.set(0.04, DESK_TOP + 0.0015, 0.18);
  mat.castShadow = false;
  return mat;
}

/** A sticky note left on the desk, next to the display. */
export function createStickyNote() {
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), std("#ffffff", 0.9, 0, { map: stickyNoteTexture(["salut", ":)"]) }));
  note.rotation.x = -Math.PI / 2;
  note.rotation.z = 0.25;
  note.position.set(0.21, DESK_TOP + 0.0006, -0.01);
  note.receiveShadow = true;
  return note;
}

export function createKeyboard() {
  const group = new THREE.Group();
  group.position.set(-0.05, DESK_TOP + 0.003, 0.17);
  group.rotation.y = 0.015;

  // Thin aluminium wedge: higher at the back.
  const W = 0.279;
  const Dp = 0.115;
  const slope = Math.atan((0.0109 - 0.0041) / Dp);
  const deck = new THREE.Group();
  deck.rotation.x = slope;
  deck.position.y = 0.0075 / 2 + 0.0034;
  group.add(deck);
  deck.add(rbox(W, 0.0075, Dp, 0.0032, aluminium(), 4));

  const keyMat = std("#f7f7f8", 0.5);
  const keyGeom = new RoundedBoxGeometry(1, 1, 1, 2, 0.2);
  const u = W / 15.6;
  const gap = u * 0.13;
  const rows: { w: number; h?: number }[][] = [
    Array(14).fill({ w: 15 / 14, h: 0.55 }),
    [...Array(13).fill({ w: 1 }), { w: 2 }],
    [{ w: 1.5 }, ...Array(12).fill({ w: 1 }), { w: 1.5 }],
    [{ w: 1.8 }, ...Array(11).fill({ w: 1 }), { w: 2.2 }],
    [{ w: 2.35 }, ...Array(10).fill({ w: 1 }), { w: 2.65 }],
    [{ w: 1 }, { w: 1 }, { w: 1 }, { w: 1.25 }, { w: 5.5 }, { w: 1.25 }, { w: 1 }, { w: 1 }, { w: 1 }, { w: 1 }],
  ];
  const totalW = 15 * u;
  let z = -Dp / 2 + 0.008;
  rows.forEach((row, r) => {
    const rowH = (row[0].h ?? 1) * u;
    let x = -totalW / 2;
    row.forEach((k, i) => {
      const w = k.w * u;
      // Inverted-T arrows: the up/down slot is split in two half keys.
      const isUpDown = r === rows.length - 1 && i === 8;
      const parts = isUpDown ? [-0.25, 0.25] : [0];
      for (const off of parts) {
        const key = new THREE.Mesh(keyGeom, keyMat);
        const h = isUpDown ? rowH / 2 : rowH;
        key.scale.set(w - gap, 0.0016, h - gap);
        key.position.set(x + w / 2, 0.0075 / 2 + 0.0006, z + rowH / 2 + off * rowH);
        key.castShadow = false;
        key.receiveShadow = true;
        deck.add(key);
      }
      x += w;
    });
    z += rowH;
  });
  return shadowed(group);
}

/**
 * Mouse shell in the style of the Magic Mouse: a squarish oval outline, a very
 * low arched top whose highest point sits slightly towards the back, and a
 * short rounded rim, on a thin aluminium base.
 */
function mouseShellGeometry() {
  const a = 0.0285; // half width
  const b = 0.0567; // half length
  const n = 2.7; // superellipse exponent (squarish oval)
  const H = 0.0185; // shell height above its base
  const rim = 0.0028;
  const segments = 72;
  const rings = 22;

  const outline = (theta: number, t: number) => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return {
      x: a * t * Math.sign(c) * Math.pow(Math.abs(c), 2 / n),
      z: b * t * Math.sign(s) * Math.pow(Math.abs(s), 2 / n),
    };
  };

  const positions: number[] = [];
  const indices: number[] = [];
  const cols = segments + 1;
  // Top surface rings, then one extra ring at the bottom of the rim.
  for (let r = 0; r <= rings + 1; r++) {
    const t = Math.min(1, r / rings);
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const { x, z } = outline(theta, t);
      let y: number;
      if (r <= rings) {
        const dome = Math.pow(1 - Math.pow(t, 2.4), 1 / 2.4);
        const along = 1 - 0.28 * Math.pow(z / b + 0.18, 2);
        y = rim + (H - rim) * dome * along;
      } else {
        y = 0;
      }
      positions.push(x, y, z);
    }
  }
  for (let r = 0; r < rings + 1; r++) {
    for (let i = 0; i < segments; i++) {
      const p = r * cols + i;
      indices.push(p, p + cols, p + 1, p + 1, p + cols, p + cols + 1);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return { geom, outline };
}

export function createMouse() {
  const group = new THREE.Group();
  group.position.set(0.3, DESK_TOP + 0.003, 0.17);
  group.rotation.y = -0.1;

  const { geom, outline } = mouseShellGeometry();

  // Aluminium base: same outline, slightly inset, very thin.
  const shape = new THREE.Shape();
  for (let i = 0; i <= 72; i++) {
    const { x, z } = outline((i / 72) * Math.PI * 2, 0.94);
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  }
  const baseGeom = new THREE.ExtrudeGeometry(shape, { depth: 0.0024, bevelEnabled: false, curveSegments: 1 });
  baseGeom.rotateX(Math.PI / 2);
  baseGeom.translate(0, 0.0024, 0);
  const base = new THREE.Mesh(baseGeom, aluminium());
  group.add(base);

  const shell = new THREE.Mesh(geom, std("#fbfbfc", 0.2, 0, { envMapIntensity: 1.1, side: THREE.DoubleSide }));
  shell.position.y = 0.0024;
  group.add(shell);
  return shadowed(group);
}

/* ------------------------------------------------------------------------ */
/* Architect lamp                                                            */
/* ------------------------------------------------------------------------ */

export function createLamp() {
  const group = new THREE.Group();
  group.position.set(-0.66, DESK_TOP, -0.25);
  // Local +Z points towards the front-left of the desk (mug & notebook).
  group.rotation.y = 0.78;

  const black = std("#1d1d20", 0.42, 0.45);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.074, 0.02, 48), black);
  base.position.y = 0.01;
  group.add(base);

  const p0 = new THREE.Vector3(0, 0.02, 0);
  const p1 = new THREE.Vector3(0, 0.37, -0.09); // elbow, leaning back
  const p2 = new THREE.Vector3(0, 0.47, 0.25); // head, reaching over the desk
  group.add(cylinderBetween(p0, p1, 0.0075, black));
  group.add(cylinderBetween(p1, p2, 0.0068, black));
  for (const p of [p0, p1, p2]) {
    const j = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 14), black);
    j.position.copy(p);
    group.add(j);
  }

  // Shade: an open cone whose mouth points down and slightly forward.
  const dir = new THREE.Vector3(0, -1, 0.3).normalize();
  const head = new THREE.Group();
  head.position.copy(p2);
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  group.add(head);

  const shadeMat = std("#1d1d20", 0.38, 0.4, { side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.072, 0.105, 48, 1, true), shadeMat);
  shade.position.y = -0.06;
  head.add(shade);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.028, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shadeMat);
  cap.position.y = -0.008;
  head.add(cap);
  // Light-coloured inside of the shade.
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.07, 0.1, 48, 1, true), std("#efe9df", 0.6, 0, { side: THREE.BackSide }));
  inner.position.y = -0.06;
  head.add(inner);

  const bulbMat = new THREE.MeshStandardMaterial({ color: "#fff7e6", emissive: new THREE.Color("#ffd49a"), emissiveIntensity: 0 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), bulbMat);
  bulb.position.y = -0.07;
  head.add(bulb);

  shadowed(group);
  bulb.castShadow = false;
  inner.castShadow = false;

  const spot = new THREE.SpotLight("#ffcf94", 0, 2.6, 0.72, 0.65, 1.5);
  spot.position.set(0, -0.075, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.01;
  spot.shadow.camera.near = 0.03;
  head.add(spot);
  const target = new THREE.Object3D();
  target.position.set(0, -1, 0);
  head.add(target);
  spot.target = target;

  const glow = new THREE.PointLight("#ffcf8f", 0, 0.9, 2);
  glow.position.set(0, -0.12, 0);
  head.add(glow);

  // Generous invisible hit box (whole lamp).
  const hit = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.56, 0.48), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0, 0.28, 0.08);
  hit.name = "lamp";
  group.add(hit);

  return { group, spot, glow, bulbMat, hit };
}
