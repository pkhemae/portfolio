"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import OS from "../os/OS";
import type { PostSummary } from "../os/types";
import type { DeskScene, Interactive, SceneMode } from "@/lib/scene/DeskScene";
import { SCREEN } from "@/lib/scene/objects";
import { sound } from "@/lib/sound";
import Loader from "./Loader";

interface ExperienceProps {
  posts: PostSummary[];
}

const HINTS: Record<Interactive, string> = {
  screen: "Cliquer pour allumer et explorer l'ordinateur",
  lamp: "Allumer / éteindre la lampe",
  plant: "Chatouiller la plante",
  mug: "Souffler sur le café",
};

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return vp;
}

export default function Experience({ posts }: ExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<DeskScene | null>(null);
  const [screenEl, setScreenEl] = useState<HTMLElement | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [powered, setPowered] = useState(false);
  const [mode, setMode] = useState<SceneMode>("intro");
  const [hover, setHover] = useState<Interactive | null>(null);
  const [night, setNight] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mobileOS, setMobileOS] = useState(false);
  const [viewMoved, setViewMoved] = useState(false);
  const vp = useViewport();
  const compact = vp.w < 820 || vp.h < 520;
  const [loaderGone, setLoaderGone] = useState(false);

  // Phone layout: open the full-screen OS once the camera reached the screen.
  useEffect(() => {
    if (!(compact && mode === "screen")) {
      setMobileOS(false);
      return;
    }
    const id = setTimeout(() => setMobileOS(true), 650);
    return () => clearTimeout(id);
  }, [compact, mode]);

  useEffect(() => sound.subscribe(setMuted), []);

  // Create the 3D scene.
  useEffect(() => {
    let disposed = false;
    let scene: DeskScene | null = null;
    const el = document.createElement("div");
    el.className = "screen-surface";

    (async () => {
      const mod = await import("@/lib/scene/DeskScene");
      if (disposed) return;
      if (!mod.isWebGLAvailable() || !containerRef.current) {
        setWebgl(false);
        setReady(true);
        return;
      }
      setWebgl(true);
      setScreenEl(el);
      scene = new mod.DeskScene({
        container: containerRef.current,
        screenElement: el,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onModeChange: setMode,
        onHover: setHover,
        onNightChange: setNight,
        onViewChange: setViewMoved,
        onInteract: () => sound.click(),
      });
      sceneRef.current = scene;
      // Let a couple of frames render (shader compilation) before revealing.
      requestAnimationFrame(() => requestAnimationFrame(() => !disposed && setReady(true)));
    })();

    return () => {
      disposed = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    sound.unlock();
    sound.startAmbient();
    setStarted(true);
    setTimeout(() => setLoaderGone(true), 800);
    sceneRef.current?.start();
    setTimeout(() => setPowered(true), webgl === false ? 0 : 1400);
  }, [webgl]);

  const leave = useCallback(() => {
    sceneRef.current?.leaveScreen();
  }, []);

  const toggleNight = useCallback(() => {
    const s = sceneRef.current;
    if (s) s.setNight(!s.isNight());
  }, []);

  // No WebGL: the OS alone, full screen.
  if (webgl === false) {
    return (
      <main className="fixed inset-0 bg-[#ece7de]">
        <OS posts={posts} width={vp.w} height={vp.h} compact={compact} powered={started} />
        {!loaderGone && <Loader ready onStart={start} note="Votre navigateur ne supporte pas WebGL : version 2D." />}
      </main>
    );
  }

  const hint =
    mode === "screen"
      ? "Échap ou clic en dehors de l'écran pour revenir au bureau"
      : hover
        ? HINTS[hover]
        : compact
          ? "Glisser pour tourner · pincer pour zoomer · toucher l'écran pour l'explorer"
          : "Glisser pour tourner · molette pour zoomer · cliquer sur l'écran pour l'explorer";

  return (
    <main className={`experience fixed inset-0 overflow-hidden ${night ? "is-night" : ""}`}>
      <div ref={containerRef} className="absolute inset-0" />

      {screenEl &&
        createPortal(
          <OS
            posts={posts}
            width={SCREEN.pxWidth}
            height={SCREEN.pxHeight}
            powered={powered}
            onLeave={compact ? undefined : leave}
            onToggleNight={toggleNight}
          />,
          screenEl,
        )}

      {/* Phone layout: the computer opens full screen once the camera reached it. */}
      {/* Stays mounted so the OS keeps its windows between visits. */}
      {compact && (
        <div inert={!mobileOS} className={`fixed inset-0 z-30 transition-opacity duration-500 ${mobileOS ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <OS posts={posts} width={vp.w} height={vp.h} compact powered onLeave={leave} onToggleNight={toggleNight} />
        </div>
      )}

      <div className="grain pointer-events-none fixed inset-0 z-20" aria-hidden />

      {/* HUD */}
      <div className={`hud pointer-events-none fixed inset-0 z-10 transition-opacity duration-700 ${started && mode !== "screen" ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-5 left-5 sm:top-6 sm:left-7">
          <p className="hud-title text-[15px] font-semibold tracking-tight">Khémara Parc</p>
          <p className="hud-sub font-mono text-[11px] uppercase tracking-[0.18em]">étudiant · BUT informatique</p>
        </div>
        <div className={`absolute top-5 right-5 sm:top-6 sm:right-7 flex items-center gap-1 ${started && mode !== "screen" ? "pointer-events-auto" : ""}`}>
          {viewMoved && mode === "desk" && (
            <button type="button" className="hud-btn" onClick={() => sceneRef.current?.resetView()}>
              [recentrer]
            </button>
          )}
          <button type="button" className="hud-btn" onClick={toggleNight} aria-pressed={night}>
            [{night ? "jour" : "nuit"}]
          </button>
          <button type="button" className="hud-btn" onClick={() => sound.setMuted(!muted)} aria-pressed={!muted}>
            [son : {muted ? "off" : "on"}]
          </button>
        </div>
        <p className={`hud-hint absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100vw-40px)] text-center font-mono text-[12px] transition-opacity duration-300 ${mode === "intro" ? "opacity-0" : "opacity-100"}`}>
          {hint}
        </p>
      </div>

      {!loaderGone && <Loader ready={ready} onStart={start} />}
    </main>
  );
}
