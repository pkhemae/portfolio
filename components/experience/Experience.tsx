"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import OS from "../os/OS";
import type { PostSummary } from "../os/types";
import type { DeskScene, SceneMode } from "@/lib/scene/DeskScene";
import { SCREEN } from "@/lib/scene/objects";
import Loader from "./Loader";

interface ExperienceProps {
  posts: PostSummary[];
}

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
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [powered, setPowered] = useState(false);
  const [mode, setMode] = useState<SceneMode>("intro");
  const [mobileOS, setMobileOS] = useState(false);
  const startedRef = useRef(false);
  const vp = useViewport();
  const compact = vp.w < 820 || vp.h < 520;

  // Phone layout: open the full-screen OS once the camera reached the screen.
  useEffect(() => {
    if (!(compact && mode === "screen")) {
      setMobileOS(false);
      return;
    }
    const id = setTimeout(() => setMobileOS(true), 650);
    return () => clearTimeout(id);
  }, [compact, mode]);

  // The full-screen phone OS hides the 3D completely: no need to render it.
  useEffect(() => {
    sceneRef.current?.setActive(!mobileOS && startedRef.current);
  }, [mobileOS]);

  // Create the 3D scene.
  useEffect(() => {
    let disposed = false;
    let scene: DeskScene | null = null;
    const el = document.createElement("div");
    el.className = "screen-surface";

    (async () => {
      setProgress(0.15);
      const mod = await import("@/lib/scene/DeskScene");
      if (disposed) return;
      setProgress(0.45);
      if (!mod.isWebGLAvailable() || !containerRef.current) {
        setWebgl(false);
        setProgress(1);
        return;
      }
      try {
        scene = new mod.DeskScene({
          container: containerRef.current,
          screenElement: el,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onModeChange: setMode,
        });
      } catch (err) {
        // Never leave the visitor on a blank screen: fall back to the 2D OS.
        console.error("3D scene failed to start, falling back to 2D.", err);
        containerRef.current?.replaceChildren();
        setWebgl(false);
        setProgress(1);
        return;
      }
      setWebgl(true);
      setScreenEl(el);
      sceneRef.current = scene;
      setProgress(0.8);
      // Let a couple of frames render (shader compilation) before revealing.
      // Let a few frames render (shaders compiled, textures uploaded, shadows
      // drawn) so pressing Enter does not hitch, then pause the 3D while the
      // opaque loader covers it.
      let frames = 0;
      const warm = () => {
        if (disposed) return;
        if (++frames < 4) return void requestAnimationFrame(warm);
        if (!startedRef.current) scene?.setActive(false);
        setProgress(1);
      };
      requestAnimationFrame(warm);
    })();

    return () => {
      disposed = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    startedRef.current = true;
    sceneRef.current?.setActive(true);
    setStarted(true);
    setTimeout(() => setLoaderGone(true), 700);
    sceneRef.current?.start();
    setTimeout(() => setPowered(true), webgl === false ? 0 : 1400);
  }, [webgl]);

  const leave = useCallback(() => {
    sceneRef.current?.leaveScreen();
  }, []);

  const toggleLamp = useCallback(() => {
    const s = sceneRef.current;
    if (s) s.setLamp(!s.isLampOn());
  }, []);

  // No WebGL: the OS alone, full screen.
  if (webgl === false) {
    return (
      <main className="fixed inset-0 bg-black">
        <OS posts={posts} width={vp.w} height={vp.h} compact={compact} powered={started} />
        {!loaderGone && <Loader progress={progress} onStart={start} leaving={started} note="WebGL indisponible : version 2D" />}
      </main>
    );
  }

  return (
    <main className="experience fixed inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {screenEl &&
        createPortal(
          <OS posts={posts} width={SCREEN.pxWidth} height={SCREEN.pxHeight} powered={powered} onLeave={compact ? undefined : leave} onToggleLamp={toggleLamp} />,
          screenEl,
        )}

      {/* Phone layout: the computer opens full screen once the camera reached it. */}
      {/* Stays mounted so the OS keeps its windows between visits. */}
      {compact && (
        <div inert={!mobileOS} className={`fixed inset-0 z-30 transition-opacity duration-500 ${mobileOS ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <OS posts={posts} width={vp.w} height={vp.h} compact powered onLeave={leave} onToggleLamp={toggleLamp} />
        </div>
      )}

      {!loaderGone && <Loader progress={progress} onStart={start} leaving={started} />}
    </main>
  );
}
