"use client";

import { useRef } from "react";
import type { WindowState } from "./types";
import { AppIcon } from "./Icons";

interface WindowProps {
  win: WindowState;
  focused: boolean;
  compact: boolean;
  /** Returns the ratio between on-screen pixels and the OS virtual pixels. */
  getScale: () => number;
  bounds: { w: number; h: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onChange: (patch: Partial<WindowState>) => void;
  children: React.ReactNode;
}

const MIN_W = 300;
const MIN_H = 180;
const TOP = 32; // menu bar height
const BOTTOM = 58; // dock area

export default function Window({
  win,
  focused,
  compact,
  getScale,
  bounds,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onChange,
  children,
}: WindowProps) {
  const drag = useRef<{ mode: "move" | "resize"; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number; scale: number } | null>(null);

  const maximized = win.maximized || compact;

  const startDrag = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    if (maximized && mode === "resize") return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.preventDefault();
    onFocus();
    if (maximized) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y, ow: win.w, oh: win.h, scale: getScale() || 1 };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / d.scale;
    const dy = (e.clientY - d.sy) / d.scale;
    if (d.mode === "move") {
      const x = Math.min(Math.max(d.ox + dx, -d.ow + 80), bounds.w - 80);
      const y = Math.min(Math.max(d.oy + dy, TOP), bounds.h - BOTTOM - 30);
      onChange({ x, y });
    } else {
      onChange({
        w: Math.max(MIN_W, Math.min(d.ow + dx, bounds.w - d.ox)),
        h: Math.max(MIN_H, Math.min(d.oh + dy, bounds.h - BOTTOM - d.oy)),
      });
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current) {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      drag.current = null;
    }
  };

  const style: React.CSSProperties = maximized
    ? { left: 0, top: TOP, width: bounds.w, height: bounds.h - TOP - BOTTOM, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      role="dialog"
      aria-label={win.title}
      onPointerDown={onFocus}
      className={`os-window absolute flex flex-col bg-white ${maximized ? "" : "rounded-[3px]"} ${
        focused ? "os-window--focused" : ""
      } ${win.minimized ? "os-window--minimized" : ""}`}
      style={style}
    >
      <header
        className="os-titlebar flex items-center justify-between h-9 shrink-0 px-2.5 select-none cursor-default touch-none"
        onPointerDown={startDrag("move")}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => !compact && onToggleMaximize()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-neutral-800">
            <AppIcon app={win.app} size={18} />
          </span>
          <span className="font-mono text-[12px] uppercase tracking-wide text-neutral-500 truncate">
            [ <span className={focused ? "text-neutral-900" : ""}>{win.title}</span> ]
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0" data-no-drag>
          <button type="button" className="os-winbtn" aria-label="Réduire" onClick={onMinimize}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 5h8" stroke="currentColor" strokeWidth="1.4" /></svg>
          </button>
          {!compact && (
            <button type="button" className="os-winbtn" aria-label={win.maximized ? "Restaurer" : "Agrandir"} onClick={onToggleMaximize}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                {win.maximized ? (
                  <>
                    <rect x="1" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M3 3V1h6v6H7" stroke="currentColor" strokeWidth="1.3" />
                  </>
                ) : (
                  <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.3" />
                )}
              </svg>
            </button>
          )}
          <button type="button" className="os-winbtn os-winbtn--close" aria-label="Fermer" onClick={onClose}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" /></svg>
          </button>
        </div>
      </header>
      <div className="relative flex-1 min-h-0 overflow-auto os-scroll">{children}</div>
      {!maximized && (
        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize touch-none"
          onPointerDown={startDrag("resize")}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-neutral-300">
            <path d="M14 6L6 14M14 10l-4 4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      )}
    </section>
  );
}
