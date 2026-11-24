"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Window, { DOCK_SPACE, MENU_H } from "./Window";
import { AppIcon, FolderIcon, Glyph, Logo, TextFileIcon, ThumbIcon } from "./Icons";
import { APPS, DOCK, PROFILE } from "./profile";
import Finder from "./apps/Finder";
import Safari from "./apps/Safari";
import Notes from "./apps/Notes";
import Terminal from "./apps/Terminal";
import { About, Mail, Preview } from "./apps/Small";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const appleRef = useRef<HTMLButtonElement>(null);

  // Like on macOS, a menu closes on any click outside of it (in an app window,
  // on the Dock, on the desktop…).
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || appleRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // only close the menu, don't leave the screen
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
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
        return <Preview />;
      case "mail":
        return <Mail />;
      case "terminal":
        return <Terminal api={api} />;
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
          <button ref={appleRef} type="button" className={`menubar-item ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu Apple" aria-expanded={menuOpen}>
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
        <div ref={menuRef} role="menu" className="mac-menu absolute left-2 z-[9500] w-[260px] py-1.5 text-[13px]" style={{ top: MENU_H + 2 }}>
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
                className="mac-menu-item"
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

const MAGNIFY = 0.6; // max extra size (60%)
const RANGE = 2.6; // influence radius, in icon widths

function Dock({ compact, running, getScale, onOpen, onTrash }: { compact: boolean; running: AppId[]; getScale: () => number; onOpen: (app: AppId) => void; onTrash: () => void }) {
  const base = compact ? 48 : 56;
  const entries: { key: AppId | "trash"; label: string }[] = [...DOCK.map((id) => ({ key: id, label: APPS[id].name })), { key: "trash", label: "Corbeille" }];

  const [hover, setHover] = useState<string | null>(null);
  const [launching, setLaunching] = useState<string | null>(null);
  const [scales, setScales] = useState<number[]>(() => entries.map(() => 1));
  const navRef = useRef<HTMLElement>(null);
  const target = useRef<number | null>(null); // pointer x along the Dock, in Dock pixels at rest
  const current = useRef<number[]>(entries.map(() => 1));
  const raf = useRef(0);

  // Rest layout: centre of each icon (in Dock pixels) when nothing is magnified.
  const sepW = 11;
  const restCenters = entries.map((e, i) => base * (i + 0.5) + (e.key === "trash" ? sepW : 0));

  // Smoothly animate every icon towards its target scale (critically damped).
  const tick = () => {
    const px = target.current;
    let moving = false;
    const next = current.current.map((v, i) => {
      let goal = 1;
      if (px !== null) {
        const d = Math.abs(px - restCenters[i]) / base;
        if (d < RANGE) goal = 1 + MAGNIFY * (0.5 + 0.5 * Math.cos((Math.PI * d) / RANGE));
      }
      const nv = v + (goal - v) * 0.28;
      if (Math.abs(goal - nv) > 0.002) moving = true;
      return Math.abs(goal - nv) > 0.002 ? nv : goal;
    });
    current.current = next;
    setScales(next);
    raf.current = moving ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onMove = (e: React.PointerEvent) => {
    if (compact) return;
    const nav = navRef.current;
    if (!nav) return;
    // Convert to Dock pixels at rest: the Dock is centred, so measure from its centre.
    const r = nav.getBoundingClientRect();
    const scale = getScale() || 1;
    const restWidth = entries.length * base + sepW;
    const fromCenter = (e.clientX - (r.left + r.width / 2)) / scale;
    target.current = restWidth / 2 + fromCenter;
    kick();
  };

  const onLeave = () => {
    target.current = null;
    setHover(null);
    kick();
  };

  return (
    <nav
      ref={navRef}
      className="dock absolute left-1/2 -translate-x-1/2 bottom-[4px] z-[9000] flex items-end px-[4px]"
      // Fixed height: icons are scaled from their bottom edge and grow upwards
      // out of the Dock, so the row always stays aligned at the bottom.
      style={{ height: base + 6 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {entries.map((it, i) => {
        const k = compact ? 1 : scales[i];
        const isTrash = it.key === "trash";
        const app = it.key as AppId;
        return (
          <div key={it.key} className="flex items-end h-full">
            {isTrash && <span className="dock-sep self-center h-[70%] mx-[5px]" />}
            <button
              type="button"
              onClick={() => {
                if (isTrash) return onTrash();
                // Apps bounce while they "launch", like on macOS.
                if (!running.includes(app)) {
                  setLaunching(app);
                  setTimeout(() => setLaunching((l) => (l === app ? null : l)), 1300);
                }
                onOpen(app);
              }}
              onPointerEnter={() => setHover(it.key)}
              className={`dock-item relative h-full ${launching === it.key ? "is-launching" : ""}`}
              style={{ width: base * k }}
              aria-label={it.label}
            >
              {!compact && (
                <span className={`dock-tooltip absolute left-1/2 whitespace-nowrap ${hover === it.key ? "is-visible" : ""}`} style={{ bottom: base * k + 8 }}>
                  {it.label}
                </span>
              )}
              <span className="dock-bounce absolute left-1/2 bottom-[3px]" style={{ width: base, height: base, marginLeft: -base / 2 }}>
                {/* Drawn at the largest size and scaled down: always crisp,
                    never a stretched bitmap. */}
                <span
                  className="dock-icon absolute left-1/2 bottom-0"
                  style={{ width: base * (1 + MAGNIFY), height: base * (1 + MAGNIFY), marginLeft: (-base * (1 + MAGNIFY)) / 2, transform: `scale(${k / (1 + MAGNIFY)})` }}
                >
                  <AppIcon app={isTrash ? "trash-full" : app} size={base * (1 + MAGNIFY)} />
                </span>
              </span>
              {!isTrash && <span className={`dock-dot absolute left-1/2 -ml-[2px] bottom-[-1px] ${running.includes(app) ? "opacity-100" : "opacity-0"}`} />}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
