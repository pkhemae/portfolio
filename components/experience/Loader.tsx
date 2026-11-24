"use client";

import { useEffect, useState } from "react";

const LOG = [
  "montage du bureau",
  "pose de l'ordinateur",
  "branchement du clavier",
  "arrosage de la plante",
  "préparation du café",
  "tout est prêt",
];

interface LoaderProps {
  ready: boolean;
  onStart: () => void;
  note?: string;
}

export default function Loader({ ready, onStart, note }: LoaderProps) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (step >= LOG.length - 1) return;
    const id = setTimeout(() => setStep((s) => s + 1), 220 + Math.random() * 180);
    return () => clearTimeout(id);
  }, [step]);

  const done = ready && step >= LOG.length - 1;

  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const go = () => {
    if (leaving) return;
    setLeaving(true);
    onStart();
  };

  const progress = Math.round(((step + (ready ? 1 : 0)) / LOG.length) * 100);

  return (
    <div className={`loader fixed inset-0 z-50 grid place-items-center bg-[#ece7de] transition-opacity duration-700 ${leaving ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <div className="w-[min(420px,calc(100vw-48px))]">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400 mb-2">portfolio — 2026</p>
        <h1 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.04em] leading-none text-neutral-900">Khémara Parc</h1>

        <ul className="mt-8 font-mono text-[12.5px] leading-[1.9] text-neutral-500 min-h-[140px]">
          {LOG.slice(0, step + 1).map((l, i) => (
            <li key={l} className="flex items-center gap-3 loader-line">
              <span className={i === step && !done ? "text-[#1D2DFF]" : "text-neutral-300"}>{i === step && !done ? "›" : "✓"}</span>
              <span className={i === LOG.length - 1 ? "text-neutral-900" : ""}>{l}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 h-px bg-neutral-300/70 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[#1D2DFF] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="font-mono text-[11px] text-neutral-400">{note ?? "son recommandé · souris ou tactile"}</span>
          <button
            type="button"
            onClick={go}
            disabled={!done}
            className="font-mono text-[14px] px-2 py-1 whitespace-nowrap shrink-0 rounded-sm text-neutral-900 enabled:hover:bg-[#1D2DFF] enabled:hover:text-white disabled:text-neutral-300 transition-colors"
          >
            [ entrer → ]
          </button>
        </div>
      </div>
    </div>
  );
}
