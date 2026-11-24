"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Terminal-style boot loader: log lines are printed one by one, an ASCII
 * progress bar follows the real loading of the 3D scene, then the visitor
 * presses Enter (or clicks) to start.
 */

const BOOT: { text: string; status?: string; delay: number }[] = [
  { text: "khemara-portfolio v2026.11 — tty0", delay: 120 },
  { text: "", delay: 60 },
  { text: "Chargement du noyau", status: "ok", delay: 160 },
  { text: "Montage de /home/khemara", status: "ok", delay: 140 },
  { text: "Initialisation du moteur WebGL", status: "ok", delay: 220 },
  { text: "Modélisation du bureau", status: "ok", delay: 180 },
  { text: "Branchement de l'écran, du clavier et de la souris", status: "ok", delay: 200 },
  { text: "Allumage de la lampe", status: "ok", delay: 150 },
  { text: "Préparation du café", status: "ok", delay: 170 },
  { text: "Démarrage de l'interface", status: "ok", delay: 140 },
];

interface LoaderProps {
  /** Real loading progress of the scene, 0 to 1. */
  progress: number;
  onStart: () => void;
  leaving: boolean;
  note?: string;
}

function bar(p: number, width = 28) {
  const filled = Math.round(p * width);
  return `[${"#".repeat(filled)}${".".repeat(width - filled)}] ${String(Math.round(p * 100)).padStart(3, " ")}%`;
}

export default function Loader({ progress, onStart, leaving, note }: LoaderProps) {
  const [shown, setShown] = useState(0);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  // Print the boot log line by line.
  useEffect(() => {
    if (shown >= BOOT.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), BOOT[shown].delay);
    return () => clearTimeout(id);
  }, [shown]);

  // The bar follows the real progress but never faster than the log.
  const target = Math.min(progress, shown / BOOT.length);
  useEffect(() => {
    const id = setInterval(() => setDisplay((d) => (d >= target ? d : Math.min(target, d + 0.04))), 40);
    return () => clearInterval(id);
  }, [target]);

  const done = display >= 1 && shown >= BOOT.length;

  const go = () => {
    if (!done || started.current) return;
    started.current = true;
    onStart();
  };

  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div
      className={`term-loader fixed inset-0 z-50 bg-black text-[#d8d8d8] font-mono transition-opacity duration-700 ${leaving ? "opacity-0 pointer-events-none" : "opacity-100"} ${done ? "cursor-pointer" : ""}`}
      onClick={go}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 term-loader-scanlines pointer-events-none" aria-hidden />
      <div className="relative h-full overflow-hidden p-5 sm:p-10 text-[12.5px] sm:text-[14px] leading-[1.7]">
        {BOOT.slice(0, shown).map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-words min-h-[1.7em]">
            {l.status ? (
              <>
                <span className="text-[#7a7a7a]">[ </span>
                <span className="text-[#5af78e]">{l.status.toUpperCase()}</span>
                <span className="text-[#7a7a7a]"> ]</span> {l.text}
              </>
            ) : (
              <span className="text-white">{l.text}</span>
            )}
          </div>
        ))}

        {shown > 2 && (
          <div className="mt-4 text-white whitespace-pre">
            <span className="hidden sm:inline">chargement </span>
            {bar(display, 24)}
          </div>
        )}

        {done && (
          <div className="mt-6">
            <p className="text-[#7a7a7a]">{note ?? "Système prêt."}</p>
            <p className="mt-1">
              <span className="text-[#5af78e]">khemara@portfolio</span>
              <span className="text-[#7a7a7a]">:</span>
              <span className="text-[#6cb6ff]">~</span>
              <span className="text-[#7a7a7a]">$ </span>
              <span className="text-white">Appuyez sur Entrée ou cliquez pour démarrer</span>
              <span className="term-caret" aria-hidden />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
