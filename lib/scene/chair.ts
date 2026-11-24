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
 * Rounded slab bent around a vertical axis (concave towards -Z, the sitter),
 * like the shell of a chair back.
 */
function bentSlab(w: number, h: number, d: number, r: number, bend: number, mat: THREE.Material) {
  const geom = new RoundedBoxGeometry(w, h, d, 5, r);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) - (x * x) / (2 * bend));
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
  // Spine from the mechanism up to the back.
  const spine = rounded(0.07, 0.3, 0.03, 0.012, black, 2);
  spine.position.set(0, 0.56, 0.3);
  spine.rotation.x = 0.16;
  chair.add(spine);

  const back = new THREE.Group();
  back.position.set(0, 0.76, 0.31);
  back.rotation.x = 0.14; // reclined a little
  chair.add(back);

  // Shell (frame) with the mesh panel set into it, and a lumbar band.
  const shell = bentSlab(0.46, 0.48, 0.03, 0.06, 0.55, std("#19191c", 0.5, 0.25));
  back.add(shell);
  const meshPanel = bentSlab(0.42, 0.44, 0.012, 0.05, 0.55, std("#2c2d31", 0.92));
  meshPanel.position.z = -0.012;
  back.add(meshPanel);
  const lumbar = bentSlab(0.38, 0.06, 0.012, 0.02, 0.55, std("#3b3c41", 0.85));
  lumbar.position.set(0, -0.12, -0.02);
  back.add(lumbar);

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
