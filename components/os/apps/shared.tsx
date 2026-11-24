"use client";

import { useState } from "react";

/** Unified toolbar (title bar + tools), draggable like on macOS. */
export function Toolbar({ children, className = "", leftInset = true }: { children: React.ReactNode; className?: string; leftInset?: boolean }) {
  return (
    <div data-drag className={`mac-toolbar flex items-center gap-2 h-[52px] shrink-0 pr-3 select-none ${leftInset ? "pl-[86px]" : "pl-3"} ${className}`}>
      {children}
    </div>
  );
}

export function ToolButton({ children, onClick, label, disabled, active }: { children: React.ReactNode; onClick?: () => void; label: string; disabled?: boolean; active?: boolean }) {
  return (
    <button type="button" className={`tool-btn ${active ? "tool-btn--active" : ""}`} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      {children}
    </button>
  );
}

export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return { copied, copy };
}
