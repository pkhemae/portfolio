import { useId } from "react";
import type { AppId } from "./types";

/**
 * App icons drawn for khémaraOS, in the spirit of macOS "squircle" icons.
 * Original artwork: simple glyphs on gradients.
 */

function Squircle({ size, from, to, children, stroke }: { size: number; from: string; to: string; children?: React.ReactNode; stroke?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="mac-icon">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="21" fill={`url(#g${id})`} stroke={stroke ?? "rgba(0,0,0,0.08)"} strokeWidth="0.8" />
      {children}
    </svg>
  );
}

export function AppIcon({ app, size = 48 }: { app: AppId | "trash" | "trash-full"; size?: number }) {
  switch (app) {
    case "finder":
      return (
        <Squircle size={size} from="#6fd0ff" to="#1673e6">
          <path d="M26 36h18l5 6h25v28a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4z" fill="#fff" opacity="0.95" />
          <path d="M26 46h48" stroke="#9fd2ff" strokeWidth="2.5" />
          <path d="M40 58q10 8 20 0" stroke="#1673e6" strokeWidth="3" fill="none" strokeLinecap="round" />
        </Squircle>
      );
    case "safari":
      return (
        <Squircle size={size} from="#ffffff" to="#e9edf2">
          <circle cx="50" cy="50" r="33" fill="#2f8cff" />
          <circle cx="50" cy="50" r="29" fill="#56b2ff" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={50 + Math.cos(a) * 25} y1={50 + Math.sin(a) * 25} x2={50 + Math.cos(a) * 28} y2={50 + Math.sin(a) * 28} stroke="#fff" strokeWidth="1.2" opacity="0.8" />;
          })}
          <path d="M50 50 L66 34 L54 54 Z" fill="#ff3b30" />
          <path d="M50 50 L34 66 L46 46 Z" fill="#fff" />
        </Squircle>
      );
    case "notes":
      return (
        <Squircle size={size} from="#ffffff" to="#f4f4f4">
          <path d="M6 27V27a21 21 0 0 1 21-21h46a21 21 0 0 1 21 21v4H6z" fill="#ffd60a" />
          <path d="M6 31h88" stroke="#e8be00" strokeWidth="1.5" />
          {[44, 56, 68, 80].map((y) => (
            <line key={y} x1="18" y1={y} x2="82" y2={y} stroke="#d9d9de" strokeWidth="2" />
          ))}
        </Squircle>
      );
    case "preview":
      return (
        <Squircle size={size} from="#8ad7ff" to="#2c7fe0">
          <rect x="24" y="22" width="44" height="56" rx="3" fill="#fff" />
          <rect x="34" y="32" width="44" height="46" rx="3" fill="#fff" stroke="#2c7fe0" strokeWidth="1.5" />
          <circle cx="47" cy="45" r="4" fill="#ffcc00" />
          <path d="M37 72l12-14 8 9 6-6 13 11z" fill="#34c759" />
        </Squircle>
      );
    case "mail":
      return (
        <Squircle size={size} from="#5ab8ff" to="#1665d8">
          <rect x="20" y="30" width="60" height="40" rx="4" fill="#fff" />
          <path d="M21 33l29 21 29-21" stroke="#9cc7f5" strokeWidth="3" fill="none" />
        </Squircle>
      );
    case "terminal":
      return (
        <Squircle size={size} from="#3a3a3f" to="#1c1c1f" stroke="rgba(255,255,255,0.12)">
          <path d="M24 40l12 9-12 9" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 62h22" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </Squircle>
      );
    case "activity":
      return (
        <Squircle size={size} from="#2b2b30" to="#0f0f12" stroke="rgba(255,255,255,0.12)">
          {[30, 50, 70].map((y) => (
            <line key={y} x1="16" y1={y} x2="84" y2={y} stroke="#2f3b31" strokeWidth="1.2" />
          ))}
          <path d="M16 58h14l6-20 9 34 8-26 6 12h25" stroke="#32d74b" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </Squircle>
      );
    case "about":
      return (
        <Squircle size={size} from="#d9dce1" to="#9ea3ab">
          <circle cx="50" cy="50" r="24" fill="#fff" />
          <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="700" fill="#5b6068" fontFamily="-apple-system, Inter, sans-serif">
            KP
          </text>
        </Squircle>
      );
    case "trash":
    case "trash-full":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="mac-icon">
          <path d="M24 26h52l-5 62a5 5 0 0 1-5 4H34a5 5 0 0 1-5-4z" fill="rgba(235,238,242,0.85)" stroke="#a7adb6" strokeWidth="1.5" />
          {app === "trash-full" && <path d="M30 30q8-10 18-2t20-2l-2 12H32z" fill="#f2f2f2" stroke="#c3c7cd" strokeWidth="1" />}
          {[38, 50, 62].map((x) => (
            <line key={x} x1={x} y1="34" x2={x} y2="84" stroke="#b4bac2" strokeWidth="1.5" />
          ))}
          <rect x="20" y="20" width="60" height="8" rx="4" fill="#dfe3e8" stroke="#a7adb6" strokeWidth="1.5" />
        </svg>
      );
  }
}

export function FolderIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="mac-icon">
      <path d="M8 26a6 6 0 0 1 6-6h22l7 7h43a6 6 0 0 1 6 6v6H8z" fill="#3d9cf0" />
      <path d="M8 36a5 5 0 0 1 5-5h74a5 5 0 0 1 5 5v42a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill="#6cbcf8" />
      <path d="M8 40h84" stroke="#8fcdfb" strokeWidth="1.2" />
    </svg>
  );
}

export function TextFileIcon({ size = 64, label = "TXT" }: { size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="mac-icon">
      <path d="M24 8h38l18 18v62a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff" stroke="#d3d6db" strokeWidth="1.5" />
      <path d="M62 8v14a4 4 0 0 0 4 4h14" fill="#eef0f3" stroke="#d3d6db" strokeWidth="1.5" />
      {[38, 46, 54, 62].map((y) => (
        <line key={y} x1="30" y1={y} x2="70" y2={y} stroke="#c7cbd1" strokeWidth="2" />
      ))}
      <text x="50" y="82" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8e939b" fontFamily="-apple-system, Inter, sans-serif">
        {label}
      </text>
    </svg>
  );
}

/** Thumbnail-style icon for an image backed document (PDF, web page). */
export function ThumbIcon({ src, size = 64, badge }: { src: string; size?: number; badge?: string }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="max-w-[88%] max-h-[88%] object-cover bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] border border-black/10" style={{ aspectRatio: badge === "PDF" ? "0.707" : "1.6" }} />
      {badge && <span className="absolute bottom-[8%] right-[4%] text-[9px] font-semibold px-1 rounded-[3px] bg-[#e5483b] text-white">{badge}</span>}
    </span>
  );
}

/* Small UI glyphs (SF Symbols-like, drawn by hand) */

export function Glyph({ name, size = 16 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "chevron-left":
      return <svg {...common}><path d="M15 5l-7 7 7 7" /></svg>;
    case "chevron-right":
      return <svg {...common}><path d="M9 5l7 7-7 7" /></svg>;
    case "sidebar":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M9 5v14" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>;
    case "share":
      return <svg {...common}><path d="M12 3v12M8 7l4-4 4 4" /><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "lock":
      return <svg {...common}><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M9 11V8a3 3 0 0 1 6 0v3" /></svg>;
    case "grid":
      return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
    case "list":
      return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="0.8" fill="currentColor" /><circle cx="4.5" cy="12" r="0.8" fill="currentColor" /><circle cx="4.5" cy="18" r="0.8" fill="currentColor" /></svg>;
    case "folder":
      return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
    case "doc":
      return <svg {...common}><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M14 3v5h5" /></svg>;
    case "apps":
      return <svg {...common}><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>;
    case "trash":
      return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case "desktop":
      return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6M12 16v4" /></svg>;
    case "compose":
      return <svg {...common}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13 7l4 4" /></svg>;
    case "send":
      return <svg {...common}><path d="M4 12l16-8-6 16-3-6z" /><path d="M11 14l9-10" /></svg>;
    case "zoom-in":
      return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5M8.5 11h5M11 8.5v5" /></svg>;
    case "zoom-out":
      return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5M8.5 11h5" /></svg>;
    case "download":
      return <svg {...common}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
    case "external":
      return <svg {...common}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></svg>;
    case "copy":
      return <svg {...common}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
    case "wifi":
      return <svg {...common}><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0" /><circle cx="12" cy="19" r="0.9" fill="currentColor" /></svg>;
    case "battery":
      return (
        <svg width={size * 1.5} height={size} viewBox="0 0 36 24" fill="none" aria-hidden>
          <rect x="1.5" y="6" width="29" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
          <rect x="3.5" y="8" width="21" height="9" rx="2" fill="currentColor" />
          <path d="M32.5 10.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "control":
      return <svg {...common}><rect x="3" y="5" width="18" height="6" rx="3" /><circle cx="17" cy="8" r="1.6" fill="currentColor" /><rect x="3" y="13" width="18" height="6" rx="3" /><circle cx="7" cy="16" r="1.6" fill="currentColor" /></svg>;
    case "moon":
      return <svg {...common}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>;
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75v5.7h-4v-5.05c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.95 1.3-1.95 2.66v5.14h-4z" />
        </svg>
      );
    default:
      return null;
  }
}

/** Logo used in the menu bar and on the boot screen. */
export function Logo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M9 7v10M9 12l5-5M10.5 10.5L15 17" stroke="var(--logo-cut, #fff)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
