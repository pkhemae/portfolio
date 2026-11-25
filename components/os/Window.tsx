"use client";

import { useRef } from "react";
import type { WindowState } from "./types";

export const MENU_H = 26;
export const DOCK_SPACE = 74;

interface WindowProps {
  win: WindowState;
  title?: string;
  /** "titlebar": classic title bar. "unified": the app draws its own toolbar (mark drag areas with data-drag). */
  chrome?: "titlebar" | "unified";
  focused: boolean;
  compact: boolean;
  resizable?: boolean;
  minW?: number;
  minH?: number;
  /** Ratio between on-screen pixels and OS virtual pixels. */
  getScale: () => number;
  bounds: { w: number; h: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onChange: (patch: Partial<WindowState>) => void;
  children: React.ReactNode;
}

type DragMode = "move" | "e" | "s" | "se";

export function TrafficLights({ focused, onClose, onMinimize, onZoom, canZoom = true }: { focused: boolean; onClose: () => void; onMinimize: () => void; onZoom: () => void; canZoom?: boolean }) {
  return (
    // Each button is a 20×20 hit area around its 12 px light; the areas touch,
    // so there is no dead space between the three buttons.
    <div className={`traffic flex items-center ${focused ? "" : "traffic--blur"}`} data-no-drag>
      <button type="button" className="traffic-btn traffic-close" aria-label="Fermer" onClick={onClose}>
        <span className="traffic-dot">
          <svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5" /></svg>
        </span>
      </button>
      <button type="button" className="traffic-btn traffic-min" aria-label="Réduire dans le Dock" onClick={onMinimize}>
        <span className="traffic-dot">
          <svg viewBox="0 0 12 12"><path d="M3 6h6" /></svg>
        </span>
      </button>
      <button type="button" className="traffic-btn traffic-zoom" aria-label="Agrandir" onClick={onZoom} disabled={!canZoom}>
        <span className="traffic-dot">
          <svg viewBox="0 0 12 12"><path d="M4 8V4.6L7.4 8zM8 4v3.4L4.6 4z" fill="currentColor" stroke="none" /></svg>
        </span>
      </button>
    </div>
  );
}

export default function Window({
  win,
  title,
  chrome = "titlebar",
  focused,
  compact,
  resizable = true,
  minW = 320,
  minH = 200,
  getScale,
  bounds,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onChange,
  children,
}: WindowProps) {
  const drag = useRef<{ mode: DragMode; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number; scale: number } | null>(null);
  const maximized = win.maximized || compact;

  const begin = (mode: DragMode, e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y, ow: win.w, oh: win.h, scale: getScale() || 1 };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus();
    if (e.button !== 0 || maximized) return;
    const t = e.target as HTMLElement;
    if (!t.closest("[data-drag]") || t.closest("button, a, input, textarea, [data-no-drag]")) return;
    begin("move", e);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / d.scale;
    const dy = (e.clientY - d.sy) / d.scale;
    if (d.mode === "move") {
      onChange({
        x: Math.min(Math.max(d.ox + dx, -d.ow + 100), bounds.w - 100),
        y: Math.min(Math.max(d.oy + dy, MENU_H), bounds.h - 60),
      });
      return;
    }
    const patch: Partial<WindowState> = {};
    if (d.mode === "e" || d.mode === "se") patch.w = Math.max(minW, Math.min(d.ow + dx, bounds.w - d.ox));
    if (d.mode === "s" || d.mode === "se") patch.h = Math.max(minH, Math.min(d.oh + dy, bounds.h - d.oy - 8));
    onChange(patch);
  };

  const end = (e: React.PointerEvent) => {
    if (!drag.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (compact || !resizable) return;
    if (t.closest("[data-drag]") && !t.closest("button, a, input, textarea, [data-no-drag]")) onToggleMaximize();
  };

  const style: React.CSSProperties = maximized
    ? { left: 0, top: MENU_H, width: bounds.w, height: bounds.h - MENU_H - (compact ? 70 : DOCK_SPACE), zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const handle = (mode: DragMode, cls: string) =>
    resizable && !maximized ? (
      <div className={`absolute ${cls}`} onPointerDown={(e) => { e.stopPropagation(); onFocus(); begin(mode, e); }} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end} aria-hidden />
    ) : null;

  return (
    <section
      role="dialog"
      aria-label={title}
      className={`mac-window absolute flex flex-col ${maximized ? "mac-window--max" : ""} ${focused ? "mac-window--focused" : ""} ${win.minimized ? "mac-window--min" : ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={onDoubleClick}
    >
      {chrome === "titlebar" ? (
        <header data-drag className="mac-titlebar relative flex items-center h-[30px] shrink-0 px-2 select-none">
          <TrafficLights focused={focused} onClose={onClose} onMinimize={onMinimize} onZoom={onToggleMaximize} canZoom={resizable && !compact} />
          <span className="absolute inset-x-24 text-center text-[13px] font-semibold truncate mac-title pointer-events-none">{title}</span>
        </header>
      ) : (
        <div className="absolute left-[10px] top-[12px] z-20">
          <TrafficLights focused={focused} onClose={onClose} onMinimize={onMinimize} onZoom={onToggleMaximize} canZoom={resizable && !compact} />
        </div>
      )}
      <div className="relative flex-1 min-h-0 flex flex-col">{children}</div>
      {handle("e", "top-3 bottom-3 -right-1 w-2 cursor-ew-resize")}
      {handle("s", "left-3 right-3 -bottom-1 h-2 cursor-ns-resize")}
      {handle("se", "-right-1 -bottom-1 w-4 h-4 cursor-nwse-resize")}
    </section>
  );
}
