import type { AppId } from "./types";

/**
 * Minimal line icons drawn for the desktop. Stroke uses currentColor, the
 * accent is the portfolio blue.
 */

const A = "#1D2DFF";

function Frame({ children, size = 44 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {children}
    </svg>
  );
}

export function AppIcon({ app, size }: { app: AppId; size?: number }) {
  switch (app) {
    case "about":
      return (
        <Frame size={size}>
          <path d="M12 6h17l9 9v27H12z" fill="#fff" />
          <path d="M29 6v9h9" />
          <path d="M17 22h16M17 27h16M17 32h10" />
          <circle cx="34" cy="36" r="3" fill={A} stroke="none" />
        </Frame>
      );
    case "projects":
      return (
        <Frame size={size}>
          <path d="M5 13h14l4 4h20v23H5z" fill="#fff" />
          <path d="M5 21h38" />
          <path d="M5 21h38v19H5z" fill={A} stroke={A} />
        </Frame>
      );
    case "post":
      return (
        <Frame size={size}>
          <rect x="8" y="8" width="32" height="32" rx="2" fill="#fff" />
          <path d="M14 16h20M14 22h20M14 28h12" />
          <rect x="28" y="28" width="8" height="8" fill={A} stroke="none" />
        </Frame>
      );
    case "cv":
      return (
        <Frame size={size}>
          <path d="M12 6h17l9 9v27H12z" fill="#fff" />
          <path d="M29 6v9h9" />
          <rect x="15" y="30" width="20" height="8" fill={A} stroke="none" />
          <text x="25" y="36.3" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="#fff" stroke="none" fontWeight="700">
            PDF
          </text>
          <path d="M17 19h12M17 24h16" />
        </Frame>
      );
    case "skills":
      return (
        <Frame size={size}>
          <rect x="7" y="7" width="15" height="15" fill="#fff" />
          <rect x="26" y="7" width="15" height="15" fill={A} stroke={A} />
          <rect x="7" y="26" width="15" height="15" fill="#fff" />
          <rect x="26" y="26" width="15" height="15" fill="#fff" />
        </Frame>
      );
    case "github":
      return (
        <Frame size={size}>
          <rect x="6" y="9" width="36" height="30" rx="2" fill="#fff" />
          {[0, 1, 2, 3, 4].map((c) =>
            [0, 1, 2].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={11 + c * 6}
                y={15 + r * 6}
                width="4"
                height="4"
                stroke="none"
                fill={(c * 3 + r) % 4 === 0 ? A : (c + r) % 3 === 0 ? "#8b93ff" : "#d4d4d4"}
              />
            )),
          )}
        </Frame>
      );
    case "contact":
      return (
        <Frame size={size}>
          <rect x="5" y="11" width="38" height="26" rx="2" fill="#fff" />
          <path d="M5 13l19 13 19-13" />
          <circle cx="38" cy="12" r="4.5" fill={A} stroke="none" />
        </Frame>
      );
    case "terminal":
      return (
        <Frame size={size}>
          <rect x="5" y="9" width="38" height="30" rx="2" fill="#17171a" stroke="#17171a" />
          <path d="M12 19l6 5-6 5" stroke="#fff" />
          <path d="M22 30h10" stroke={A} strokeWidth={2.2} />
        </Frame>
      );
  }
}
