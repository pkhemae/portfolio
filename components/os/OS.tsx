"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Window, { DOCK_SPACE, MENU_H } from "./Window";
import { AppIcon, FolderIcon, Glyph, Logo, TextFileIcon, ThumbIcon } from "./Icons";
import { APPS, DOCK, PROFILE } from "./profile";
import Finder from "./apps/Finder";
import Safari from "./apps/Safari";
import Notes from "./apps/Notes";
import Terminal from "./apps/Terminal";
import { About, Activity, Mail, Preview } from "./apps/Small";
import type { AppId, OSApi, PostSummary, WindowState } from "./types";

interface OSProps {
  posts: PostSummary[];
  /** Phone layout: every window is full screen. */
  compact?: boolean;
  /** Virtual size of the OS in CSS pixels. */
  width: number;
  height: number;
  /** False shows a sleeping screen; switching to true boots the OS. */
  powered: boolean;
  /** Dark appearance (follows the room's night mode). */
  dark?: boolean;
  onLeave?: () => void;
  onToggleLamp?: () => void;
}

const MENUS = ["Fichier", "Édition", "Présentation", "Fenêtre", "Aide"];

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function OS({ posts, compact = false, width, height, powered, dark = false, onLeave, onToggleLamp }: OSProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [phase, setPhase] = useState<"off" | "boot" | "on">(powered ? "on" : "off");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const zRef = useRef(10);
  const cascade = useRef(0);
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

  const focus = useCallback((id: AppId) => {
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
      setMenuOpen(false);
      setWindows((ws) => {
        zRef.current += 1;
        const existing = ws.find((w) => w.id === app);
        if (existing) {
          return ws.map((w) => (w.id === app ? { ...w, z: zRef.current, minimized: false, payload: payload ?? w.payload, nav: payload ? w.nav + 1 : w.nav } : w));
        }
        const meta = APPS[app];
        const w = Math.min(meta.w, width - 40);
        const h = Math.min(meta.h, height - MENU_H - DOCK_SPACE - 20);
        const n = cascade.current++ % 6;
        const x = meta.x ?? Math.round((width - w) / 2 - 120 + n * 40);
        const y = meta.y ?? Math.round(MENU_H + 40 + n * 28);
        return [
          ...ws,
          {
            id: app,
            x: Math.max(16, Math.min(x, width - w - 16)),
            y: Math.max(MENU_H + 8, Math.min(y, height - h - DOCK_SPACE)),
            w,
            h,
            z: zRef.current,
            minimized: false,
            maximized: false,
            payload,
            nav: 0,
          },
        ];
      });
    },
    [width, height],
  );

  const close = (id: AppId) => setWindows((ws) => ws.filter((w) => w.id !== id));
  const patch = (id: AppId, p: Partial<WindowState>) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));

  // Boot sequence.
  useEffect(() => {
    if (!powered || phase !== "off") return;
    setPhase("boot");
    const t2 = setTimeout(() => {
      setPhase("on");
      openApp("notes", "about");
    }, 2300);
    return () => clearTimeout(t2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powered]);

  // Already powered when mounted (phone layout): show the welcome note.
  useEffect(() => {
    if (powered && phase === "on") openApp("notes", "about");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: OSApi = { posts, compact, dark, openApp, toggleLamp: onToggleLamp, leave: onLeave };

  const renderApp = (w: WindowState) => {
    switch (w.id) {
      case "finder":
        return <Finder api={api} payload={w.payload} nav={w.nav} />;
      case "safari":
        return <Safari api={api} payload={w.payload} nav={w.nav} />;
      case "notes":
        return <Notes api={api} payload={w.payload} nav={w.nav} />;
      case "preview":
        return <Preview api={api} />;
      case "mail":
        return <Mail />;
      case "terminal":
        return <Terminal api={api} />;
      case "activity":
        return <Activity api={api} />;
      case "about":
        return <About api={api} />;
    }
  };

  const onDockClick = (app: AppId) => {
    const w = windows.find((x) => x.id === app);
    if (!w) return openApp(app);
    if (w.minimized || focusedId !== w.id) return focus(w.id);
    patch(w.id, { minimized: true });
  };

  const activeName = focusedId && focusedId !== "about" ? APPS[focusedId].name : "Finder";

  const desktopItems = [
    { key: "projets", label: "Projets", icon: <FolderIcon size={60} />, open: () => openApp("finder", "projets") },
    { key: "cv", label: "CV.pdf", icon: <ThumbIcon src="/cv.pdf.png" badge="PDF" size={60} />, open: () => openApp("preview") },
    { key: "about", label: "À propos.txt", icon: <TextFileIcon size={60} />, open: () => openApp("notes", "about") },
  ];

  return (
    <div
      ref={rootRef}
      className={`os-root relative overflow-hidden select-none ${dark ? "os-dark" : ""} ${compact ? "os-compact" : ""}`}
      style={{ width, height }}
    >
      <div
        className="os-wallpaper absolute inset-0"
        aria-hidden
        onPointerDown={() => {
          setSelectedIcon(null);
          setMenuOpen(false);
        }}
      />

      {/* Menu bar */}
      <div className="menubar absolute top-0 inset-x-0 flex items-center justify-between px-2.5 z-[9000] text-[13px]" style={{ height: MENU_H }}>
        <div className="flex items-center min-w-0">
          <button type="button" className={`menubar-item ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu Apple">
            <Logo size={15} />
          </button>
          <span className="menubar-item font-bold">{activeName}</span>
          {!compact &&
            MENUS.map((m) => (
              <span key={m} className="menubar-item menubar-item--static">
                {m}
              </span>
            ))}
        </div>
        <div className="flex items-center shrink-0">
          {!compact && (
            <>
              <span className="menubar-item menubar-item--static">
                <Glyph name="battery" size={14} />
              </span>
              <span className="menubar-item menubar-item--static">
                <Glyph name="wifi" size={15} />
              </span>
              <span className="menubar-item menubar-item--static">
                <Glyph name="control" size={15} />
              </span>
            </>
          )}
          <span className="menubar-item menubar-item--static tabular-nums whitespace-nowrap">
            {now ? now.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "") : ""}
            {" "}
            {now ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
        </div>
      </div>

      {menuOpen && (
        <div className="mac-menu absolute left-2 z-[9500] w-[260px] py-1.5 text-[13px]" style={{ top: MENU_H + 2 }}>
          <button type="button" className="mac-menu-item" onClick={() => openApp("about")}>
            À propos de ce Mac
          </button>
          <div className="mac-menu-sep" />
          <button type="button" className="mac-menu-item" onClick={() => openApp("finder", "applications")}>
            Applications…
          </button>
          <button
            type="button"
            className="mac-menu-item"
            onClick={() => {
              setMenuOpen(false);
              onToggleLamp?.();
            }}
          >
            Allumer / éteindre la lampe
          </button>
          <div className="mac-menu-sep" />
          <a className="mac-menu-item" href={PROFILE.source} target="_blank" rel="noopener noreferrer">
            Code source sur GitHub…
          </a>
          {onLeave && (
            <>
              <div className="mac-menu-sep" />
              <button
                type="button"
                className="mac-menu-item flex justify-between"
                onClick={() => {
                  setMenuOpen(false);
                  onLeave();
                }}
              >
                <span>Quitter l&apos;écran</span>
                <span className="opacity-60">⎋</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Desktop icons, top right like macOS */}
      <div className={`absolute z-[1] ${compact ? "left-0 right-0 grid grid-cols-4 justify-items-center px-2" : "right-3 flex flex-col gap-2"}`} style={{ top: MENU_H + 12 }}>
        {desktopItems.map((it) => (
          <button
            key={it.key}
            type="button"
            className={`desktop-icon flex flex-col items-center gap-1 w-[96px] py-1 ${selectedIcon === it.key ? "is-selected" : ""}`}
            onClick={() => (compact ? it.open() : setSelectedIcon(it.key))}
            onDoubleClick={it.open}
          >
            <span className="desktop-icon-img grid place-items-center w-[70px] h-[64px] rounded-[6px]">{it.icon}</span>
            <span className="desktop-icon-label text-[12px] font-medium px-1.5 rounded-[4px] leading-[1.35]">{it.label}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window
          key={w.id}
          win={w}
          title={w.id === "terminal" ? `${PROFILE.handle} — -zsh — 80×24` : w.id === "about" ? "" : APPS[w.id].name}
          chrome={w.id === "terminal" || w.id === "about" ? "titlebar" : "unified"}
          focused={w.id === focusedId}
          compact={compact}
          resizable={APPS[w.id].resizable !== false}
          minW={APPS[w.id].minW}
          minH={APPS[w.id].minH}
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

      <Dock compact={compact} running={windows.map((w) => w.id)} getScale={getScale} onOpen={onDockClick} onTrash={() => openApp("finder", "corbeille")} />

      {/* Sleep and boot screens */}
      {phase !== "on" && (
        <div className={`absolute inset-0 z-[9999] grid place-items-center bg-black ${phase === "boot" ? "os-boot" : ""}`}>
          {phase === "boot" && (
            <div className="flex flex-col items-center gap-12 text-white">
              <Logo size={80} />
              <div className="w-[190px] h-[5px] rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white os-progress rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Dock with magnification                                                   */
/* ------------------------------------------------------------------------ */

function Dock({ compact, running, getScale, onOpen, onTrash }: { compact: boolean; running: AppId[]; getScale: () => number; onOpen: (app: AppId) => void; onTrash: () => void }) {
  const base = compact ? 42 : 50;
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const centers = useRef<number[]>([]);
  const refs = useRef<(HTMLElement | null)[]>([]);

  // Icon centers are measured at rest (unmagnified) when the pointer enters.
  const measure = () => {
    centers.current = refs.current.map((el) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  };

  const sizeFor = (i: number) => {
    if (compact || mouseX === null || !centers.current[i]) return base;
    const dist = Math.abs(mouseX - centers.current[i]) / (getScale() || 1);
    const k = Math.max(0, 1 - dist / 150);
    return Math.round(base * (1 + 0.55 * Math.sin((k * Math.PI) / 2)));
  };

  const entries: { key: AppId | "trash"; label: string }[] = [...DOCK.map((id) => ({ key: id, label: APPS[id].name })), { key: "trash", label: "Corbeille" }];

  return (
    <nav
      className="dock absolute left-1/2 -translate-x-1/2 bottom-[6px] z-[9000] flex items-end px-[6px] py-[5px]"
      onPointerEnter={(e) => {
        if (mouseX === null) measure();
        setMouseX(e.clientX);
      }}
      onPointerMove={(e) => setMouseX(e.clientX)}
      onPointerLeave={() => {
        setMouseX(null);
        setHover(null);
      }}
    >
      {entries.map((it, i) => {
        const s = sizeFor(i);
        const isTrash = it.key === "trash";
        return (
          <div key={it.key} className="flex items-end">
            {isTrash && <span className="dock-sep self-stretch mx-[6px] my-1" />}
            <button
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              onClick={() => (isTrash ? onTrash() : onOpen(it.key as AppId))}
              onPointerEnter={() => setHover(it.key)}
              className="dock-item relative flex flex-col items-center mx-[3px]"
              style={{ width: s, height: s }}
              aria-label={it.label}
            >
              {hover === it.key && !compact && <span className="dock-tooltip absolute bottom-full mb-3 whitespace-nowrap">{it.label}</span>}
              <AppIcon app={isTrash ? "trash-full" : (it.key as AppId)} size={s} />
              {!isTrash && <span className={`dock-dot absolute -bottom-[4px] ${running.includes(it.key as AppId) ? "opacity-100" : "opacity-0"}`} />}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
