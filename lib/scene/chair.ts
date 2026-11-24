import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { shadowed, std } from "./objects";
import { radialShadowTexture } from "./textures";

/**
 * A sober ergonomic office chair: five-star base on casters, gas lift,
 * upholstered seat, slightly curved mesh backrest with a lumbar band, and
 * T-shaped armrests. Local axes: the sitter faces -Z (towards the desk).
 */

function rounded(w: number, h: number, d: number, r: number, mat: THREE.Material, seg = 4) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/**
 * Slab bent around a vertical axis (concave towards -Z, the sitter), like the
 * shell of a chair back: a rounded rectangle (corner radius `r` in its plane)
 * extruded to thickness `d`, centred on its origin.
 */
function bentSlab(w: number, h: number, d: number, r: number, bend: number, mat: THREE.Material) {
  const x = w / 2;
  const y = h / 2;
  const rr = Math.min(r, x, y);
  const shape = new THREE.Shape();
  // Intermediate points along the top and bottom edges give the flat faces
  // vertices across the width, so they can actually follow the bend.
  const steps = Math.max(2, Math.round((w - 2 * rr) / 0.01));
  shape.moveTo(-x + rr, -y);
  for (let i = 1; i <= steps; i++) shape.lineTo(-x + rr + ((w - 2 * rr) * i) / steps, -y);
  shape.quadraticCurveTo(x, -y, x, -y + rr);
  shape.lineTo(x, y - rr);
  shape.quadraticCurveTo(x, y, x - rr, y);
  for (let i = 1; i <= steps; i++) shape.lineTo(x - rr - ((w - 2 * rr) * i) / steps, y);
  shape.quadraticCurveTo(-x, y, -x, y - rr);
  shape.lineTo(-x, -y + rr);
  shape.quadraticCurveTo(-x, -y, -x + rr, -y);
  const bevel = Math.min(0.004, d / 4);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
    steps: 1,
  });
  geom.translate(0, 0, -(d - bevel * 2) / 2);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    pos.setZ(i, pos.getZ(i) - (px * px) / (2 * bend));
  }
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createChair() {
  const chair = new THREE.Group();
  // Pulled out from the desk and turned aside, as if someone just got up.
  chair.position.set(0.5, 0, 1.0);
  chair.rotation.y = 0.95;

  const black = std("#1c1c1f", 0.5, 0.3);
  const metal = std("#b9bcc0", 0.28, 0.85);
  const fabric = std("#2f3034", 0.96);
  const fabricDark = std("#26272a", 0.96);

  // --- Five-star base on casters ---------------------------------------
  const hubY = 0.075;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.05, 24), black);
  hub.position.y = hubY;
  chair.add(hub);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const arm = new THREE.Group();
    arm.rotation.y = a;
    chair.add(arm);
    // Tapered leg, sloping down to the caster.
    const leg = rounded(0.04, 0.03, 0.3, 0.01, black, 2);
    leg.position.set(0, hubY - 0.01, 0.16);
    leg.rotation.x = 0.12;
    arm.add(leg);
    // Caster: fork + twin wheel.
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10), black);
    fork.position.set(0, 0.05, 0.3);
    arm.add(fork);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 20), black);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.026, 0.3);
    arm.add(wheel);
  }

  // --- Gas lift and seat mechanism ---------------------------------------
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.03, 0.2, 24), black);
  sleeve.position.y = 0.19;
  chair.add(sleeve);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 24), metal);
  piston.position.y = 0.34;
  chair.add(piston);
  const mech = rounded(0.24, 0.05, 0.26, 0.012, black, 2);
  mech.position.set(0, 0.42, 0.02);
  chair.add(mech);

  // --- Seat ----------------------------------------------------------------
  const seatY = 0.475;
  const seatShell = rounded(0.5, 0.03, 0.48, 0.012, black, 3);
  seatShell.position.set(0, seatY - 0.035, 0);
  chair.add(seatShell);
  const cushion = rounded(0.5, 0.07, 0.48, 0.035, fabric, 5);
  cushion.position.set(0, seatY, 0);
  chair.add(cushion);

  // --- Armrests (T-shaped) ---------------------------------------------
  for (const side of [-1, 1]) {
    const post = rounded(0.035, 0.22, 0.05, 0.01, black, 2);
    post.position.set(side * 0.27, seatY + 0.06, 0.06);
    chair.add(post);
    const bracket = rounded(0.03, 0.025, 0.08, 0.008, black, 2);
    bracket.position.set(side * 0.255, seatY - 0.03, 0.06);
    chair.add(bracket);
    const pad = rounded(0.075, 0.028, 0.25, 0.014, fabricDark, 3);
    pad.position.set(side * 0.27, seatY + 0.18, 0.03);
    chair.add(pad);
  }

  // --- Backrest ------------------------------------------------------------
  const back = new THREE.Group();
  back.position.set(0, 0.76, 0.31);
  back.rotation.x = 0.14; // reclined a little
  chair.add(back);
  back.updateMatrix();
  /** A point given in the backrest's own frame, expressed in the chair's frame. */
  const fromBack = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(back.matrix);

  // Shell (frame) with the mesh panel set into it, and a lumbar band.
  // Flat panels: everything stays perfectly flush (a bend left the faces behind).
  const BEND = Infinity;
  const shell = bentSlab(0.46, 0.48, 0.03, 0.06, BEND, std("#19191c", 0.5, 0.25));
  back.add(shell);
  const meshPanel = bentSlab(0.42, 0.44, 0.012, 0.05, BEND, std("#2c2d31", 0.92));
  meshPanel.position.z = -0.012;
  back.add(meshPanel);
  const lumbar = bentSlab(0.38, 0.06, 0.012, 0.02, BEND, std("#3b3c41", 0.85));
  lumbar.position.set(0, -0.12, -0.02);
  back.add(lumbar);

  // Mounting plate on the back of the shell (lower half).
  const plate = bentSlab(0.17, 0.26, 0.014, 0.02, BEND, black);
  plate.position.set(0, -0.1, 0.015 + 0.007);
  back.add(plate);

  // L-shaped support: from the mechanism under the seat to the back, then
  // up into the mounting plate.
  const bar = (a: THREE.Vector3, b: THREE.Vector3, w: number, t: number) => {
    const m = rounded(w, a.distanceTo(b), t, 0.01, black, 2);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return m;
  };
  const upperEnd = fromBack(0, -0.02, 0.015 + 0.014 + 0.012); // against the plate
  const lowerEnd = fromBack(0, -0.22, 0.015 + 0.014 + 0.012);
  const corner = new THREE.Vector3(0, 0.405, lowerEnd.z + (0.405 - lowerEnd.y) * Math.tan(0.14));
  const under = new THREE.Vector3(0, 0.405, 0.0);
  chair.add(bar(under, corner, 0.07, 0.03));
  chair.add(bar(corner, upperEnd, 0.07, 0.026));
  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), black);
  joint.position.copy(corner);
  chair.add(joint);

  shadowed(chair);

  // Soft contact shadow under the base.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: radialShadowTexture(), color: 0x2b241a, transparent: true, opacity: 0.38, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.0016;
  chair.add(shadow);

  return chair;
}
