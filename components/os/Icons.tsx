import { useId } from "react";
import type { AppId } from "./types";

/**
 * macOS-style app icons, redrawn by hand as SVG (no image assets).
 * Every icon is drawn in a 100×100 box on the standard macOS icon grid.
 */

/**
 * macOS icon grid: the shape covers ~80% of the canvas, with a continuous
 * ("squircle") corner of ~22% of its size.
 */
const SQUIRCLE = (() => {
  // Superellipse |x|^n + |y|^n = 1, centered in the 100×100 box, 80 wide.
  const n = 5;
  const pts: string[] = [];
  for (let i = 0; i < 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 50 + 40 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = 50 + 40 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

function useIds(n: number) {
  const base = useId().replace(/:/g, "");
  return Array.from({ length: n }, (_, i) => `${base}${i}`);
}

/**
 * Icon canvas. The drop shadow is drawn inside the SVG (not with a CSS
 * filter), so it stays as crisp as the vector icon at any size.
 */
function Frame({ size, children, shadow = true }: { size: number; children: React.ReactNode; shadow?: boolean }) {
  const [blur] = useIds(1);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="mac-icon">
      {shadow && (
        <>
          <defs>
            <filter id={blur} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <path d={SQUIRCLE} transform="translate(0 1.8)" fill="rgba(0,0,0,0.3)" filter={`url(#${blur})`} />
        </>
      )}
      {children}
    </svg>
  );
}

function Finder({ size }: { size: number }) {
  const [clip, left, right] = useIds(3);
  return (
    <Frame size={size}>
      <defs>
        <clipPath id={clip}>
          <path d={SQUIRCLE} />
        </clipPath>
        <linearGradient id={left} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38b6ff" />
          <stop offset="1" stopColor="#1d6fe0" />
        </linearGradient>
        <linearGradient id={right} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f9fe" />
          <stop offset="1" stopColor="#d5e7f8" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${right})`} />
        {/* Left (dark) half, its edge draws the profile and the nose. */}
        <path d="M0 0h55c-2 10-4 22-5 33-1 8-3 15-9 22 4 1 8 1 12 1-1 13-1 26 2 44H0z" fill={`url(#${left})`} />
      </g>
      <rect x="30" y="27" width="5" height="15" rx="2.5" fill="#0d2742" />
      <rect x="68" y="27" width="5" height="15" rx="2.5" fill="#0d2742" />
      <path d="M24 66c16 12 38 12 54 -2" stroke="#0d2742" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={SQUIRCLE} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
    </Frame>
  );
}

function Safari({ size }: { size: number }) {
  const [bg, dial] = useIds(2);
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3e6ea" />
        </linearGradient>
        <radialGradient id={dial} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#5fd0ff" />
          <stop offset="1" stopColor="#1a6fe8" />
        </radialGradient>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${bg})`} stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="33" fill={`url(#${dial})`} />
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        const r1 = long ? 26.5 : 28.5;
        return <line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * 31} y2={50 + Math.sin(a) * 31} stroke="#fff" strokeWidth={long ? 1.4 : 0.7} opacity="0.85" />;
      })}
      <g transform="rotate(45 50 50)">
        <path d="M50 25 L54.5 50 L45.5 50 Z" fill="#ff3b30" />
        <path d="M50 75 L54.5 50 L45.5 50 Z" fill="#ffffff" />
      </g>
      <circle cx="50" cy="50" r="2" fill="#fff" />
    </Frame>
  );
}

function Notes({ size }: { size: number }) {
  const [clip, band] = useIds(2);
  return (
    <Frame size={size}>
      <defs>
        <clipPath id={clip}>
          <path d={SQUIRCLE} />
        </clipPath>
        <linearGradient id={band} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe06b" />
          <stop offset="1" stopColor="#f8c513" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill="#fdfdfb" />
        <rect width="100" height="30" fill={`url(#${band})`} />
        <path d="M6 33h88" stroke="#c9c9c9" strokeWidth="1.6" strokeDasharray="2 3" />
        {[46, 58, 70, 82].map((y) => (
          <line key={y} x1="10" y1={y} x2="90" y2={y} stroke="#e1e1e1" strokeWidth="1.4" />
        ))}
      </g>
      <path d={SQUIRCLE} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
    </Frame>
  );
}

function Preview({ size }: { size: number }) {
  const [bg, sky, glass] = useIds(3);
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset="1" stopColor="#d9dde3" />
        </linearGradient>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc7ff" />
          <stop offset="1" stopColor="#d6efff" />
        </linearGradient>
        <radialGradient id={glass} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="1" stopColor="rgba(190,225,255,0.45)" />
        </radialGradient>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${bg})`} stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
      <g transform="rotate(-8 44 46)">
        <rect x="18" y="22" width="52" height="42" rx="2" fill="#fff" stroke="rgba(0,0,0,0.12)" />
        <rect x="22" y="26" width="44" height="34" fill={`url(#${sky})`} />
        <path d="M22 60l12-14 8 8 10-12 14 18z" fill="#3fa34d" />
        <circle cx="56" cy="34" r="4" fill="#ffd23f" />
      </g>
      <circle cx="60" cy="58" r="14" fill={`url(#${glass})`} stroke="#3a3a3c" strokeWidth="4" />
      <path d="M70 68l11 11" stroke="#3a3a3c" strokeWidth="7" strokeLinecap="round" />
    </Frame>
  );
}

function Mail({ size }: { size: number }) {
  const [bg, env] = useIds(2);
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ec6ff" />
          <stop offset="1" stopColor="#1677f0" />
        </linearGradient>
        <linearGradient id={env} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6eef7" />
        </linearGradient>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${bg})`} />
      <rect x="18" y="30" width="64" height="42" rx="4" fill={`url(#${env})`} />
      <path d="M19 33l31 22 31-22" stroke="#b8c8da" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d="M19 70l23-18M81 70l-23-18" stroke="#d3dde9" strokeWidth="2" />
    </Frame>
  );
}

function Terminal({ size }: { size: number }) {
  const [frame] = useIds(1);
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={frame} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4d4d6" />
          <stop offset="1" stopColor="#9c9ca1" />
        </linearGradient>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${frame})`} />
      <rect x="14" y="16" width="72" height="68" rx="11" fill="#1b1b1d" />
      <path d="M23 29l9 7-9 7" stroke="#f2f2f2" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 44h12" stroke="#f2f2f2" strokeWidth="3.6" strokeLinecap="round" />
    </Frame>
  );
}

function SystemInfo({ size }: { size: number }) {
  const [bg] = useIds(1);
  return (
    <Frame size={size}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9eaed" />
          <stop offset="1" stopColor="#b9bcc2" />
        </linearGradient>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${bg})`} />
      <g transform="translate(26 22) scale(2)" fill="#3a3a3c">
        <path d={APPLE_PATH} />
      </g>
    </Frame>
  );
}

/**
 * Trash in the style of the macOS Dock: a frosted, slightly translucent metal
 * bin, tapered towards the bottom, with a rolled rim. When full, crumpled
 * sheets (a newspaper page, a photo, a printout) stick out of it.
 */
function Trash({ size, full }: { size: number; full?: boolean }) {
  const [metal, inner, rim, shade, gloss, blur] = useIds(6);
  // Bin outline: top ellipse at y=22 (rx 33), bottom at y=90 (rx 25).
  const body = "M17 22 L25 88 Q26 93 50 93 Q74 93 75 88 L83 22 Z";
  return (
    <Frame size={size} shadow={false}>
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5d6066" />
          <stop offset="0.16" stopColor="#8f9298" />
          <stop offset="0.34" stopColor="#c3c6cb" />
          <stop offset="0.5" stopColor="#a8abb1" />
          <stop offset="0.78" stopColor="#80838a" />
          <stop offset="1" stopColor="#55585e" />
        </linearGradient>
        <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0.28)" />
          <stop offset="0.25" stopColor="rgba(0,0,0,0)" />
          <stop offset="0.85" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
        <linearGradient id={gloss} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={inner} cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#2a2c30" />
          <stop offset="1" stopColor="#4a4d52" />
        </radialGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a9da2" />
          <stop offset="0.35" stopColor="#eef0f2" />
          <stop offset="0.7" stopColor="#c4c7cc" />
          <stop offset="1" stopColor="#8d9095" />
        </linearGradient>
        <filter id={blur} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="93" rx="27" ry="3.2" fill="rgba(0,0,0,0.35)" filter={`url(#${blur})`} />

      {/* Inside of the bin (seen through the opening) */}
      <ellipse cx="50" cy="22" rx="33" ry="6.5" fill={`url(#${inner})`} />

      {full && (
        <g transform="translate(50 23) scale(1.18) translate(-50 -23)">
          {/* Newspaper page */}
          <path d="M22 23 L27 9 L41 6 L46 14 L44 24 Z" fill="#f2f0ea" stroke="#b9b6ad" strokeWidth="0.6" />
          <path d="M28 11 L39 9 M28.5 13.5 L40 11.5 M29 16 L40.5 14 M29.5 18.5 L41 16.5" stroke="#8d8a83" strokeWidth="0.8" />
          <path d="M27 9 L33 15 L29 22" fill="none" stroke="#d8d5cc" strokeWidth="0.8" />
          {/* Photo print */}
          <path d="M44 22 L46 7 L60 5 L63 19 L58 25 Z" fill="#ffffff" stroke="#c9c9c9" strokeWidth="0.6" />
          <path d="M48 9 L58 7.6 L60.5 18 L50 20 Z" fill="#4f8fd8" />
          <path d="M50 20 L53.5 14.5 L56 17 L58 13.5 L60.5 18 Z" fill="#3c9a4f" />
          <path d="M48 9 L52 8.4 L50 13 Z" fill="#e8463b" opacity="0.9" />
          {/* Crumpled printout */}
          <path d="M57 24 L59 12 L69 8 L80 13 L79 23 Z" fill="#fbfbfa" stroke="#bcbcbc" strokeWidth="0.6" />
          <path d="M61 13 L67 18 L64 23 M69 8 L70 16 L77 19" fill="none" stroke="#d4d4d4" strokeWidth="0.8" />
          <path d="M62 15 L70 12.5 M62.5 17.5 L72 14.8" stroke="#9a9a9a" strokeWidth="0.7" />
          <path d="M66 20 L74 17.5" stroke="#e2a03b" strokeWidth="1.4" />
          {/* Ball of paper in the middle */}
          <path d="M37 22 Q38 13 47 13 Q56 13 57 21 Q50 25 37 22 Z" fill="#eeeeec" stroke="#b5b5b2" strokeWidth="0.6" />
          <path d="M41 16 L47 19 L52 15 M44 21 L49 17" fill="none" stroke="#cfcfcc" strokeWidth="0.7" />
        </g>
      )}

      {/* Body */}
      <path d={body} fill={`url(#${metal})`} opacity="0.94" />
      <path d={body} fill={`url(#${shade})`} />
      {/* Frosted vertical sheen */}
      <path d="M33 25 L37 89 L45 90 L42 25 Z" fill={`url(#${gloss})`} />

      {/* Rolled rim */}
      <ellipse cx="50" cy="22" rx="33.5" ry="6.8" fill="none" stroke={`url(#${rim})`} strokeWidth="3" />
      <path d="M17.5 23.5 Q50 34 82.5 23.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
      {/* Bottom edge */}
      <path d="M25.5 88.5 Q26.5 93 50 93 Q73.5 93 74.5 88.5" fill="none" stroke="#45484d" strokeWidth="1" opacity="0.7" />
    </Frame>
  );
}

export function AppIcon({ app, size = 48 }: { app: AppId | "trash" | "trash-full"; size?: number }) {
  switch (app) {
    case "finder":
      return <Finder size={size} />;
    case "safari":
      return <Safari size={size} />;
    case "notes":
      return <Notes size={size} />;
    case "preview":
      return <Preview size={size} />;
    case "mail":
      return <Mail size={size} />;
    case "terminal":
      return <Terminal size={size} />;
    case "about":
      return <SystemInfo size={size} />;
    case "trash":
      return <Trash size={size} />;
    case "trash-full":
      return <Trash size={size} full />;
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


/** Apple logo (24×24 path). */
const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

/** Apple logo, used in the menu bar, on the boot screen and in "About". */
export function Logo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d={APPLE_PATH} />
    </svg>
  );
}
