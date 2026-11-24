import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SCREEN, createDesk, createGround, createMug, createNotebook, createPlant } from "./objects";
import { createBooks } from "./books";
import { createLooseSheets, createWasteBasket } from "./clutter";
import { createChair } from "./chair";
import { createDeskMat, createDisplay, createKeyboard, createLamp, createMouse, createStickyNote } from "./hardware";
import { Tween, createTween, cubicBezier, easeInOutCubic, easeOutExpo } from "./tween";

export type SceneMode = "intro" | "desk" | "screen";
export type Interactive = "screen" | "lamp" | "plant" | "mug";

export interface DeskSceneOptions {
  container: HTMLElement;
  /** DOM element rendered on the monitor through CSS3D. */
  screenElement: HTMLElement;
  onModeChange?: (mode: SceneMode) => void;
  onHover?: (target: Interactive | null) => void;
  onInteract?: (target: Interactive) => void;
  onNightChange?: (night: boolean) => void;
  onLampChange?: (on: boolean) => void;
  /** Called when the free camera moves away from / back to the default view. */
  onViewChange?: (moved: boolean) => void;
  reducedMotion?: boolean;
}

/** Bounds of the free camera around the desk. */
const ORBIT = {
  minDistance: 0.75,
  maxDistance: 9,
  /** Never look from below the desk top: the floor stays out of reach. */
  minPolar: 0.3,
  maxPolar: 1.62,
  /** The camera always orbits around the middle of the desk, which stays centered. */
  target: new THREE.Vector3(0, 0.93, -0.1),
  /** Lowest camera height (floor is y = 0). */
  minHeight: 0.3,
};

/**
 * The CSS3D world is scaled up so that the DOM element is not scaled down to
 * microscopic values (browsers rasterize it more crisply that way).
 */
const CSS_SCALE = 1000;

const DAY = {
  background: new THREE.Color("#ece7de"),
  hemi: 1.15,
  sun: 2.3,
  env: 0.55,
  floorShadow: 0.32,
  screenLight: 0,
};

const NIGHT = {
  background: new THREE.Color("#141519"),
  hemi: 0.05,
  sun: 0.03,
  env: 0.035,
  floorShadow: 0.5,
  screenLight: 0.45,
};

/** Desk lamp output when switched on (independent from the room light). */
const LAMP = { spot: 4.5, glow: 0.22, bulb: 3.2 };

interface CameraKey {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export class DeskScene {
  private opts: DeskSceneOptions;
  private renderer: THREE.WebGLRenderer;
  private cssRenderer: CSS3DRenderer;
  private scene = new THREE.Scene();
  private cssScene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cssCamera: THREE.PerspectiveCamera;
  private cssObject: CSS3DObject;

  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private screenLight: THREE.PointLight;
  private ground: ReturnType<typeof createGround>;
  private monitor: ReturnType<typeof createDisplay>;
  private lamp: ReturnType<typeof createLamp>;
  private plant: ReturnType<typeof createPlant>;
  private mug: ReturnType<typeof createMug>;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmoothed = new THREE.Vector2(0, 0);
  private hasPointer = false;
  private hovered: Interactive | null = null;
  private interactives: THREE.Object3D[] = [];

  private mode: SceneMode = "intro";
  private night = false;
  private nightK = 0;
  private nightTween: Tween | null = null;
  private lampOn = false;
  private lampK = 0;
  private lampTween: Tween | null = null;
  private camTween: Tween | null = null;
  private plantWiggle = 0;
  private frame = 0;
  /** When false the loop idles (hidden behind the loader or the phone OS). */
  private active = true;
  /** Frames still to draw while nothing moves in screen mode. */
  private settleFrames = 3;
  private pointerMoved = true;
  private readonly tmpV2 = new THREE.Vector2();
  private readonly tmpRight = new THREE.Vector3();
  private readonly tmpUp = new THREE.Vector3();
  private steamOn = true;
  private steamK = 1;

  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();
  /** Camera driven by OrbitControls; the rendered camera adds parallax on top. */
  private rig: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private dragging = false;
  private viewMoved = false;
  /** Free-camera view to return to after leaving the screen. */
  private lastDeskView: CameraKey | null = null;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private downAt: { x: number; y: number; t: number } | null = null;

  constructor(opts: DeskSceneOptions) {
    this.opts = opts;
    const { container } = opts;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Renderers -------------------------------------------------------
    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(width, height);
    Object.assign(this.cssRenderer.domElement.style, { position: "absolute", inset: "0", zIndex: "0" });
    container.appendChild(this.cssRenderer.domElement);
    // A focused element inside the CSS3D layer can make the browser scroll
    // this overflow:hidden container, which would misalign the screen.
    this.cssRenderer.domElement.addEventListener("scroll", this.resetCssScroll);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    // Cap the resolution on very dense screens: a big saving for little visible change.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    // The scene is almost static: shadow maps are refreshed on demand (see loop).
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Object.assign(this.renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      zIndex: "1",
      pointerEvents: "none",
    });
    container.appendChild(this.renderer.domElement);

    // --- Camera ----------------------------------------------------------
    this.camera = new THREE.PerspectiveCamera(this.fovFor(width / height), width / height, 0.06, 40);
    this.cssCamera = this.camera.clone();
    this.rig = this.camera.clone();
    this.controls = this.createControls(container);
    const intro = this.introKey();
    this.camPos.copy(intro.position);
    this.camTarget.copy(intro.target);
    this.applyCamera();

    // --- Environment & lights -------------------------------------------
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environmentIntensity = DAY.env;
    this.scene.background = DAY.background.clone();

    this.hemi = new THREE.HemisphereLight("#ffffff", "#d9cdb9", DAY.hemi);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight("#fff3e2", DAY.sun);
    // High, slightly frontal key light: the desk shadow falls close under it.
    this.sun.position.set(-1.2, 5.4, 1.9);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    // The floor shadow is pre-drawn, so the shadow map only has to cover the
    // desk top (sharper shadows of the objects on it).
    sc.left = -1.3;
    sc.right = 1.3;
    sc.top = 1.3;
    sc.bottom = -1.3;
    sc.near = 1;
    sc.far = 12;
    this.sun.shadow.bias = -0.0002;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 6;
    this.scene.add(this.sun);

    // --- Objects ---------------------------------------------------------
    this.ground = createGround();
    this.scene.add(this.ground.group);
    this.scene.add(createDesk());
    this.monitor = createDisplay();
    this.scene.add(this.monitor.group);
    this.scene.add(createDeskMat());
    this.scene.add(createStickyNote());
    this.scene.add(createKeyboard());
    this.scene.add(createMouse());
    this.mug = createMug();
    this.scene.add(this.mug.group);
    this.lamp = createLamp();
    this.scene.add(this.lamp.group);
    this.plant = createPlant();
    this.scene.add(this.plant.group);
    this.scene.add(createBooks());
    this.scene.add(createNotebook());
    this.scene.add(createLooseSheets());
    this.scene.add(createWasteBasket());
    this.scene.add(createChair());

    this.screenLight = new THREE.PointLight("#bcd0ff", 0, 1.6, 2);
    this.screenLight.position.copy(this.monitor.screenCenter).addScaledVector(this.monitor.screenNormal, 0.25);
    this.scene.add(this.screenLight);

    this.interactives = [this.monitor.screenPlane, this.lamp.hit, this.plant.hit, this.mug.hit];

    // --- CSS3D screen ----------------------------------------------------
    const el = opts.screenElement;
    el.style.width = `${SCREEN.pxWidth}px`;
    el.style.height = `${SCREEN.pxHeight}px`;
    // Seen from behind the desk, the screen must not show through mirrored.
    el.style.backfaceVisibility = "hidden";
    this.cssObject = new CSS3DObject(el);
    this.cssObject.position.copy(this.monitor.screenCenter).multiplyScalar(CSS_SCALE);
    this.cssObject.quaternion.copy(this.monitor.screenPlane.getWorldQuaternion(new THREE.Quaternion()));
    const s = (SCREEN.width / SCREEN.pxWidth) * CSS_SCALE;
    this.cssObject.scale.set(s, s, s);
    this.cssScene.add(this.cssObject);
    this.setScreenInteractive(false);

    // --- Events ----------------------------------------------------------
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    container.addEventListener("pointerdown", this.onPointerDown);
    container.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("keydown", this.onKeyDown);

    this.loop();
  }

  /* ---------------------------------------------------------------------- */
  /* Public API                                                             */
  /* ---------------------------------------------------------------------- */

  /** Plays the intro camera flight towards the desk. */
  start() {
    const key = this.deskKey();
    this.moveCamera(key, this.opts.reducedMotion ? 400 : 2800, easeOutExpo, () => {
      this.setMode("desk");
      this.enableControls(key);
    });
  }

  focusScreen() {
    if (this.mode === "screen") return;
    this.lastDeskView = this.camTween ? null : { position: this.camPos.clone(), target: this.camTarget.clone() };
    this.controls.enabled = false;
    this.setMode("screen");
    this.setScreenInteractive(true);
    this.moveCamera(this.screenKey(), this.opts.reducedMotion ? 300 : 1700, cubicBezier(0.6, 0.0, 0.1, 1));
  }

  leaveScreen() {
    if (this.mode !== "screen") return;
    this.setScreenInteractive(false);
    this.setMode("desk");
    // Go back to wherever the visitor was looking from.
    const key = this.lastDeskView ?? this.deskKey();
    this.moveCamera(key, this.opts.reducedMotion ? 300 : 1500, easeInOutCubic, () => this.enableControls(key));
  }

  /**
   * Pauses or resumes rendering. Used while the scene is fully covered (boot
   * loader, full-screen OS on phones) so the GPU and the main thread stay free.
   */
  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    this.settleFrames = 3;
    this.clock.getDelta(); // no big time jump on resume
  }

  /** Flies back to the default view of the desk. */
  resetView() {
    if (this.mode !== "desk") return;
    this.controls.enabled = false;
    const key = this.deskKey();
    this.moveCamera(key, this.opts.reducedMotion ? 300 : 1200, easeInOutCubic, () => this.enableControls(key));
  }

  getMode() {
    return this.mode;
  }

  isNight() {
    return this.night;
  }

  isLampOn() {
    return this.lampOn;
  }

  /** Switches the desk lamp only (not the room). */
  setLamp(on: boolean) {
    if (on === this.lampOn) return;
    this.lampOn = on;
    this.opts.onLampChange?.(on);
    const from = this.lampK;
    const to = on ? 1 : 0;
    this.lampTween?.cancel();
    // Quick, slightly flickery switch like a real bulb.
    this.lampTween = createTween(this.opts.reducedMotion ? 1 : 260, (t) => t, (k) => {
      const flicker = on && k < 0.6 ? (Math.sin(k * 40) > 0 ? 1 : 0.55) : 1;
      this.lampK = (from + (to - from) * k) * flicker;
      this.applyLamp();
    });
  }

  /** Day / night ambience of the room. The lamp follows: on at night, off by day. */
  setNight(night: boolean) {
    if (night === this.night) return;
    this.night = night;
    this.opts.onNightChange?.(night);
    this.setLamp(night);
    const from = this.nightK;
    const to = night ? 1 : 0;
    this.nightTween?.cancel();
    this.nightTween = createTween(this.opts.reducedMotion ? 1 : 900, easeInOutCubic, (k) => {
      this.nightK = from + (to - from) * k;
      this.applyNight();
    });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.opts.container.removeEventListener("pointerdown", this.onPointerDown);
    this.opts.container.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("keydown", this.onKeyDown);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => {
            if (v instanceof THREE.Texture) v.dispose();
          });
          m.dispose();
        });
      }
    });
    this.cssRenderer.domElement.removeEventListener("scroll", this.resetCssScroll);
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.cssRenderer.domElement.remove();
  }

  /* ---------------------------------------------------------------------- */
  /* Camera keys                                                            */
  /* ---------------------------------------------------------------------- */

  private fovFor(aspect: number) {
    // Wider field of view on portrait screens.
    return aspect < 1 ? 50 : 36;
  }

  private distanceFactor() {
    const aspect = this.opts.container.clientWidth / Math.max(1, this.opts.container.clientHeight);
    return aspect < 1.25 ? Math.min(1.45, 1.05 / aspect) : 1;
  }

  private introKey(): CameraKey {
    return {
      position: new THREE.Vector3(2.4, 2.9, 3.6).multiplyScalar(this.distanceFactor()),
      target: new THREE.Vector3(0, 0.75, 0),
    };
  }

  private deskKey(): CameraKey {
    const f = this.distanceFactor();
    return {
      position: new THREE.Vector3(0, 1.36 + 0.12 * (f - 1), 1.78 * f),
      target: ORBIT.target.clone(),
    };
  }

  private screenKey(): CameraKey {
    const { screenCenter, screenNormal } = this.monitor;
    const aspect = this.camera.aspect;
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    // Leave some room around the display so the page breathes.
    const margin = 1.24;
    const dh = ((SCREEN.height * margin) / 2) / Math.tan(vfov / 2);
    const dw = ((SCREEN.width * margin) / 2) / (Math.tan(vfov / 2) * aspect);
    const d = Math.max(dh, dw);
    return {
      position: screenCenter.clone().addScaledVector(screenNormal, d),
      target: screenCenter.clone(),
    };
  }

  private createControls(container: HTMLElement) {
    const controls = new OrbitControls(this.rig, container);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    // Zoom stays on the desk center so the desk never drifts off-screen.
    controls.zoomToCursor = false;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 1.1;
    controls.minDistance = ORBIT.minDistance;
    controls.minPolarAngle = ORBIT.minPolar;
    controls.maxPolarAngle = ORBIT.maxPolar;
    controls.addEventListener("start", () => {
      this.dragging = true;
      container.style.cursor = "grabbing";
    });
    controls.addEventListener("end", () => {
      this.dragging = false;
      container.style.cursor = this.hovered ? "pointer" : "grab";
    });
    // OrbitControls disables touch scrolling on its element; restore it while
    // the controls are off (the OS on the screen needs it).
    container.style.touchAction = "";
    return controls;
  }

  /** Hands the camera over to OrbitControls, starting from `key`. */
  private enableControls(key: CameraKey) {
    this.rig.position.copy(key.position);
    this.controls.target.copy(ORBIT.target);
    this.controls.maxDistance = ORBIT.maxDistance * this.distanceFactor();
    this.controls.update();
    this.controls.enabled = true;
    this.opts.container.style.cursor = "grab";
    this.opts.container.style.touchAction = "none";
  }

  private updateControls() {
    if (!this.controls.enabled || this.camTween) return;
    this.controls.update();
    // Zoomed out, aim at the middle of the whole desk (legs included) rather
    // than at the desk top, so it stays centered on screen.
    const dist = this.rig.position.distanceTo(this.controls.target);
    const far = THREE.MathUtils.smoothstep(dist, 1.8, 6);
    this.controls.target.set(ORBIT.target.x, THREE.MathUtils.lerp(ORBIT.target.y, 0.5, far), ORBIT.target.z);
    // Keep the camera above the floor.
    if (this.rig.position.y < ORBIT.minHeight) this.rig.position.y = ORBIT.minHeight;
    this.camPos.copy(this.rig.position);
    this.camTarget.copy(this.controls.target);

    const home = this.deskKey();
    const moved = this.camPos.distanceTo(home.position) > 0.05;
    if (moved !== this.viewMoved) {
      this.viewMoved = moved;
      this.opts.onViewChange?.(moved);
    }
  }

  private moveCamera(key: CameraKey, duration: number, easing: (t: number) => number, onDone?: () => void) {
    this.camTween?.cancel();
    const fromPos = this.camPos.clone();
    const fromTarget = this.camTarget.clone();
    this.camTween = createTween(
      duration,
      easing,
      (k) => {
        this.camPos.lerpVectors(fromPos, key.position, k);
        this.camTarget.lerpVectors(fromTarget, key.target, k);
      },
      () => {
        this.camTween = null;
        onDone?.();
      },
    );
  }

  private applyCamera() {
    const p = this.pointerSmoothed;
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);
    if (this.mode === "desk") {
      // Subtle parallax along the camera's own axes, scaled by distance.
      const k = Math.min(0.1, this.camPos.distanceTo(this.camTarget) * 0.04);
      this.camera.updateMatrix();
      const right = this.tmpRight.setFromMatrixColumn(this.camera.matrix, 0);
      const up = this.tmpUp.setFromMatrixColumn(this.camera.matrix, 1);
      this.camera.position.addScaledVector(right, p.x * k).addScaledVector(up, p.y * k * 0.5);
      this.camera.lookAt(this.camTarget);
    }
    this.camera.updateMatrixWorld();

    this.cssCamera.fov = this.camera.fov;
    this.cssCamera.aspect = this.camera.aspect;
    this.cssCamera.position.copy(this.camera.position).multiplyScalar(CSS_SCALE);
    this.cssCamera.quaternion.copy(this.camera.quaternion);
    this.cssCamera.near = this.camera.near * CSS_SCALE;
    this.cssCamera.far = this.camera.far * CSS_SCALE;
    this.cssCamera.updateProjectionMatrix();
    this.cssCamera.updateMatrixWorld();
  }

  /* ---------------------------------------------------------------------- */
  /* Internals                                                              */
  /* ---------------------------------------------------------------------- */

  private setMode(mode: SceneMode) {
    this.settleFrames = 3;
    if (this.mode === mode) return;
    this.mode = mode;
    this.opts.onModeChange?.(mode);
  }

  private setScreenInteractive(on: boolean) {
    if (on) {
      this.opts.container.style.cursor = "";
      this.opts.container.style.touchAction = "";
    }
    const el = this.opts.screenElement;
    el.style.pointerEvents = on ? "auto" : "none";
    // Keep keyboard focus out of the screen while it is only decorative.
    el.inert = !on;
  }

  private applyNight() {
    const k = this.nightK;
    const lerp = (a: number, b: number) => a + (b - a) * k;
    (this.scene.background as THREE.Color).copy(DAY.background).lerp(NIGHT.background, k);
    this.hemi.intensity = lerp(DAY.hemi, NIGHT.hemi);
    this.sun.intensity = lerp(DAY.sun, NIGHT.sun);
    this.scene.environmentIntensity = lerp(DAY.env, NIGHT.env);
    this.ground.floorMaterial.opacity = lerp(DAY.floorShadow, NIGHT.floorShadow);
    this.ground.blobMaterial.opacity = lerp(0.12, 0.4);
    this.screenLight.intensity = lerp(DAY.screenLight, NIGHT.screenLight);
    this.opts.container.style.setProperty("--scene-bg", `#${(this.scene.background as THREE.Color).getHexString()}`);
  }

  private resetCssScroll = () => {
    const el = this.cssRenderer.domElement;
    el.scrollTop = 0;
    el.scrollLeft = 0;
  };

  private applyLamp() {
    const k = this.lampK;
    this.lamp.spot.intensity = LAMP.spot * k;
    this.lamp.glow.intensity = LAMP.glow * k;
    this.lamp.bulbMat.emissiveIntensity = LAMP.bulb * k;
  }

  private onResize = () => {
    this.settleFrames = 3;
    const { container } = this.opts;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.fov = this.fovFor(w / h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.cssRenderer.setSize(w, h);
    // Snap to the right framing for the new viewport.
    this.rig.aspect = this.camera.aspect;
    this.rig.fov = this.camera.fov;
    this.rig.updateProjectionMatrix();
    this.controls.maxDistance = ORBIT.maxDistance * this.distanceFactor();
    if (!this.camTween && this.mode === "screen") {
      const key = this.screenKey();
      this.camPos.copy(key.position);
      this.camTarget.copy(key.target);
    }
  };

  private updatePointer(e: PointerEvent) {
    const rect = this.opts.container.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.hasPointer = true;
  }

  private onPointerMove = (e: PointerEvent) => {
    this.updatePointer(e);
    this.pointerMoved = true;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.updatePointer(e);
    this.downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  private onPointerUp = (e: PointerEvent) => {
    const down = this.downAt;
    this.downAt = null;
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved > 8) return;
    // Clicks inside the OS are handled by the OS itself.
    if (this.mode === "screen" && this.opts.screenElement.contains(e.target as Node)) return;
    this.updatePointer(e);
    this.handleClick();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    // The OS may use Escape itself (closing a menu); text fields keep it too.
    const t = e.target as HTMLElement | null;
    const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (e.key === "Escape" && this.mode === "screen" && !e.defaultPrevented && !typing) {
      this.leaveScreen();
    }
  };

  private pick(): Interactive | null {
    if (!this.hasPointer) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.interactives, false)[0];
    return hit ? (hit.object.name as Interactive) : null;
  }

  private handleClick() {
    if (this.mode === "intro") return;
    const target = this.pick();
    if (this.mode === "screen") {
      // Clicked outside of the screen: go back to the desk.
      if (target !== "screen") this.leaveScreen();
      return;
    }
    if (!target) return;
    this.opts.onInteract?.(target);
    switch (target) {
      case "screen":
        this.focusScreen();
        break;
      case "lamp":
        this.setLamp(!this.lampOn);
        break;
      case "plant":
        this.plantWiggle = 1;
        break;
      case "mug":
        this.steamOn = !this.steamOn;
        break;
    }
  }

  private updateHover() {
    let hovered: Interactive | null = null;
    if (this.mode === "desk" && !this.camTween && !this.dragging) hovered = this.pick();
    if (hovered !== this.hovered) {
      this.hovered = hovered;
      if (!this.dragging) this.opts.container.style.cursor = hovered ? "pointer" : this.mode === "desk" ? "grab" : "";
      this.opts.onHover?.(hovered);
    }
  }

  private updateScreenDimmer() {
    const { screenCenter, screenNormal, dimmer, glass } = this.monitor;
    const toCam = this.camera.position.clone().sub(screenCenter);
    const dist = toCam.length();
    const facing = Math.max(0, toCam.normalize().dot(screenNormal));
    const angleDim = (1 - facing) * 0.8;
    const distDim = THREE.MathUtils.clamp((dist - 1.2) / 6, 0, 0.25);
    (dimmer.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(angleDim + distDim, 0, 0.85);
    // Reflection fades when looking straight at the screen up close.
    const closeness = THREE.MathUtils.clamp((dist - 0.45) / 0.8, 0, 1);
    (glass.material as THREE.MeshBasicMaterial).opacity = 0.05 + 0.2 * closeness;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.active) return;

    // Zoomed on the screen with the camera at rest, nothing in the 3D view
    // changes: skip rendering entirely (the OS is plain DOM and stays live).
    const animating = !!this.camTween || !!(this.lampTween && !this.lampTween.done) || this.plantWiggle > 0;
    if (this.mode === "screen" && !animating) {
      if (this.settleFrames <= 0) {
        this.clock.getDelta();
        return;
      }
      this.settleFrames--;
    } else {
      this.settleFrames = 3;
    }

    const now = performance.now();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    this.camTween?.update(now);
    this.nightTween?.update(now);
    this.lampTween?.update(now);
    this.updateControls();

    // Smooth parallax.
    const target = this.mode === "desk" && !this.dragging ? this.pointer : this.tmpV2.set(0, 0);
    this.pointerSmoothed.lerp(target, 1 - Math.exp(-dt * 3));

    // Plant wiggle (damped) and idle sway.
    this.plantWiggle = Math.max(0, this.plantWiggle - dt * 0.7);
    this.plant.foliage.children.forEach((pivot) => {
      const base = pivot.userData.baseZ as number;
      const phase = pivot.userData.phase as number;
      pivot.rotation.z = base + Math.sin(t * 1.2 + phase) * 0.015 + Math.sin(t * 14 + phase) * 0.18 * this.plantWiggle * this.plantWiggle;
    });

    // Steam.
    this.steamK += ((this.steamOn ? 1 : 0) - this.steamK) * (1 - Math.exp(-dt * 3));
    this.mug.steamMat.uniforms.uTime.value = t;
    this.mug.steamMat.uniforms.uOpacity.value = 0.5 * this.steamK * (1 - this.nightK * 0.4);
    this.mug.steam.visible = this.steamK > 0.01;
    // Steam rises straight up: the plane only turns around the vertical axis
    // to face the camera (a full billboard would tilt with the view).
    this.mug.steam.getWorldPosition(this.tmpRight);
    this.mug.steam.rotation.set(0, Math.atan2(this.camera.position.x - this.tmpRight.x, this.camera.position.z - this.tmpRight.z), 0);


    this.applyCamera();
    // Hover only needs a raycast when the pointer moved (or now and then, as
    // the camera drifts slightly with the parallax).
    if (this.pointerMoved || this.frame % 6 === 0) {
      this.updateHover();
      this.pointerMoved = false;
    }
    this.updateScreenDimmer();

    // Shadows: every frame only while something casting them moves (plant
    // shaken, lamp switching), otherwise a few times per second for the
    // plant's gentle idle sway.
    this.frame++;
    if (this.plantWiggle > 0 || (this.lampTween && !this.lampTween.done) || this.frame % 10 === 0) {
      this.renderer.shadowMap.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.cssScene, this.cssCamera);
  };
}

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}
