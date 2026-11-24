"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Window from "./Window";
import { AppIcon } from "./Icons";
import { APPS, PROFILE, appMeta } from "./profile";
import { AboutApp, ContactApp, CvApp, GithubApp, PostApp, ProjectsApp, SkillsApp, TerminalApp } from "./apps";
import type { AppId, PostSummary, WindowState } from "./types";
import { sound } from "@/lib/sound";

interface OSProps {
  posts: PostSummary[];
  /** Phone-sized layout: every window is full screen. */
  compact?: boolean;
  /** Virtual size of the OS in CSS pixels. */
  width: number;
  height: number;
  /** When false the screen shows a stand-by state; switching to true boots the OS. */
  powered: boolean;
  onLeave?: () => void;
  onToggleNight?: () => void;
}

const TOP = 32;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function OS({ posts, compact = false, width, height, powered, onLeave, onToggleNight }: OSProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [phase, setPhase] = useState<"off" | "boot" | "on">("off");
  const zRef = useRef(10);
  const openCount = useRef(0);
  const now = useClock();

  const getScale = useCallback(() => {
    const el = rootRef.current;
    if (!el) return 1;
    return el.getBoundingClientRect().width / el.offsetWidth;
  }, []);

  const focusedId = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [windows]);

  const focus = useCallback((id: string) => {
    setWindows((ws) => {
      const top = ws.reduce((m, w) => Math.max(m, w.z), 0);
      const target = ws.find((w) => w.id === id);
      if (!target || (target.z === top && !target.minimized)) return ws;
      zRef.current = top + 1;
      return ws.map((w) => (w.id === id ? { ...w, z: zRef.current, minimized: false } : w));
    });
  }, []);

  const openApp = useCallback(
    (app: AppId, payload?: string) => {
      const id = app === "post" ? `post:${payload}` : app;
      setWindows((ws) => {
        const existing = ws.find((w) => w.id === id);
        zRef.current += 1;
        if (existing) {
          return ws.map((w) => (w.id === id ? { ...w, z: zRef.current, minimized: false } : w));
        }
        const meta = appMeta(app);
        const post = app === "post" ? posts.find((p) => p.slug === payload) : undefined;
        const w = Math.min(app === "post" ? 820 : meta?.w ?? 720, width - 40);
        const h = Math.min(app === "post" ? 640 : meta?.h ?? 560, height - TOP - 100);
        const n = openCount.current++ % 7;
        const baseX = app === "post" ? 300 : 210;
        const x = Math.max(20, Math.min(baseX + n * 34, width - w - 20));
        const y = Math.max(TOP + 10, Math.min(TOP + 34 + n * 26, height - h - 70));
        return [
          ...ws,
          {
            id,
            app,
            title: post ? post.title : meta?.label ?? app,
            x,
            y,
            w,
            h,
            z: zRef.current,
            minimized: false,
            maximized: false,
            payload,
          },
        ];
      });
    },
    [posts, width, height],
  );

  const close = (id: string) => setWindows((ws) => ws.filter((w) => w.id !== id));
  const patch = (id: string, p: Partial<WindowState>) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));

  // Boot sequence.
  useEffect(() => {
    if (!powered || phase !== "off") return;
    setPhase("boot");
    const t1 = setTimeout(() => sound.chime(), 300);
    const t2 = setTimeout(() => {
      setPhase("on");
      openApp("about");
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powered]);

  const onDockClick = (app: AppId) => {
    const w = windows.find((x) => x.id === app);
    if (!w) return openApp(app);
    if (w.minimized || focusedId !== w.id) return focus(w.id);
    patch(w.id, { minimized: true });
  };

  const renderApp = (w: WindowState) => {
    switch (w.app) {
      case "about":
        return <AboutApp openApp={openApp} />;
      case "projects":
        return <ProjectsApp posts={posts} openPost={(slug) => openApp("post", slug)} />;
      case "post":
        return <PostApp post={posts.find((p) => p.slug === w.payload)} />;
      case "cv":
        return <CvApp />;
      case "skills":
        return <SkillsApp />;
      case "github":
        return <GithubApp />;
      case "contact":
        return <ContactApp />;
      case "terminal":
        return <TerminalApp posts={posts} openApp={openApp} toggleNight={onToggleNight} leave={onLeave} />;
    }
  };

  const focusedWin = windows.find((w) => w.id === focusedId);

  return (
    <div
      ref={rootRef}
      className={`os-root relative overflow-hidden select-none ${compact ? "os-compact" : ""}`}
      style={{ width, height }}
      onPointerDown={() => sound.click()}
      onKeyDown={(e) => {
        if (!e.repeat) sound.key();
      }}
    >
      {/* Wallpaper */}
      <div className="os-wallpaper absolute inset-0" aria-hidden>
        <div className="absolute right-[6%] bottom-[16%] text-right pointer-events-none">
          <p className="font-mono text-[12px] tracking-[0.3em] uppercase text-neutral-400 mb-3">portfolio — 2026</p>
          <p className={`${compact ? "text-[44px]" : "text-[88px]"} font-bold tracking-[-0.04em] leading-[0.9] text-neutral-900/[0.07]`}>
            Khémara
            <br />
            Parc
          </p>
        </div>
        <div className="os-crosshair absolute left-1/2 top-1/2" />
      </div>

      {/* Menu bar */}
      <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-3 bg-white/70 backdrop-blur-md border-b border-neutral-200/70 font-mono text-[12px] text-neutral-600 z-[9000]">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={() => openApp("about")} className="flex items-center gap-1.5 font-semibold text-neutral-900 hover:text-[#1D2DFF]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1D2DFF]" />
            khémaraOS
          </button>
          <span className="text-neutral-400 truncate">{focusedWin ? focusedWin.title : "Bureau"}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onLeave && (
            <button type="button" onClick={onLeave} className="hover:text-[#1D2DFF]" title="Revenir au bureau 3D (Échap)">
              {compact ? "[← bureau]" : "[↙ quitter l'écran]"}
            </button>
          )}
          <span className="tabular-nums whitespace-nowrap">
            {now ? now.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : ""}
            {"  "}
            {now ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
        </div>
      </div>

      {/* Desktop icons */}
      <div className={`absolute left-0 top-8 bottom-16 ${compact ? "right-0 grid grid-cols-3 content-start gap-y-4 p-5" : "flex flex-col flex-wrap content-start gap-1 p-4"}`}>
        {APPS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => openApp(a.id)}
            className="os-icon group flex flex-col items-center gap-1.5 w-[104px] py-2 rounded-sm"
          >
            <span className="text-neutral-800 transition-transform group-hover:-translate-y-0.5">
              <AppIcon app={a.id} />
            </span>
            <span className="font-mono text-[11.5px] text-neutral-700 px-1 rounded-sm group-hover:bg-[#1D2DFF] group-hover:text-white">{a.file}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window
          key={w.id}
          win={w}
          focused={w.id === focusedId}
          compact={compact}
          getScale={getScale}
          bounds={{ w: width, h: height }}
          onFocus={() => focus(w.id)}
          onClose={() => close(w.id)}
          onMinimize={() => patch(w.id, { minimized: true })}
          onToggleMaximize={() => patch(w.id, { maximized: !w.maximized })}
          onChange={(p) => patch(w.id, p)}
        >
          {renderApp(w)}
        </Window>
      ))}

      {/* Dock */}
      <nav className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-[9000] flex items-end gap-1 px-2 py-1.5 bg-white/75 backdrop-blur-md border border-neutral-200 rounded-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        {APPS.map((a) => {
          const open = windows.some((w) => w.id === a.id);
          return (
            <button key={a.id} type="button" onClick={() => onDockClick(a.id)} className="os-dock-item relative grid place-items-center w-10 h-10 rounded-sm hover:bg-neutral-100" title={a.label} aria-label={a.label}>
              <AppIcon app={a.id} size={28} />
              <span className={`absolute -bottom-1 w-1 h-1 rounded-full ${open ? "bg-[#1D2DFF]" : "bg-transparent"}`} />
            </button>
          );
        })}
        <span className="w-px h-7 bg-neutral-200 mx-1 self-center" />
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="grid place-items-center w-10 h-10 rounded-sm hover:bg-neutral-100 text-neutral-700" title="GitHub" aria-label="GitHub">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </nav>

      {/* Stand-by and boot screens */}
      {phase !== "on" && (
        <div className={`absolute inset-0 z-[9999] grid place-items-center bg-[#0e0e10] ${phase === "boot" ? "os-boot" : ""}`}>
          {phase === "boot" ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-white">
                <span className="inline-block w-4 h-4 rounded-full bg-[#1D2DFF] os-pulse" />
                <span className="font-mono text-[22px] tracking-tight">khémaraOS</span>
              </div>
              <div className="w-56 h-[3px] bg-white/10 overflow-hidden">
                <div className="h-full bg-white os-progress" />
              </div>
            </div>
          ) : (
            <span className="font-mono text-[13px] text-white/25 tracking-[0.3em] uppercase">veille</span>
          )}
        </div>
      )}
    </div>
  );
}
