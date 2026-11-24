"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Boot screen that looks like a real terminal session: commands are typed
 * at the zsh prompt, the server logs scroll by, the "Compiling" step waits
 * for the 3D scene to be ready, and the last command waits for Enter.
 */

const PROMPT = "khemara@MacBook-Pro portfolio %";

type Step =
  | { kind: "type"; cmd: string; prompt?: string; pause?: number }
  | { kind: "out"; text: string; delay?: number; tone?: "dim" | "ok" | "accent" }
  | { kind: "wait" };

const SCRIPT: Step[] = [
  { kind: "out", text: `Last login: ${lastLogin()} on ttys002`, delay: 80 },
  { kind: "type", cmd: "cd ~/dev/portfolio", prompt: "khemara@MacBook-Pro ~ %", pause: 160 },
  { kind: "type", cmd: "npm run start", pause: 220 },
  { kind: "out", text: "", delay: 40 },
  { kind: "out", text: "> portfolio@2.0.0 start", delay: 60, tone: "dim" },
  { kind: "out", text: "> next start", delay: 120, tone: "dim" },
  { kind: "out", text: "", delay: 40 },
  { kind: "out", text: "   ▲ Next.js 15.2.8", delay: 160 },
  { kind: "out", text: "   - Local:        http://localhost:3000", delay: 40 },
  { kind: "out", text: "", delay: 60 },
  { kind: "out", text: " ✓ Starting...", delay: 180, tone: "ok" },
  { kind: "out", text: " ✓ Ready in 412ms", delay: 220, tone: "ok" },
  { kind: "out", text: " ○ Compiling / ...", delay: 120 },
  { kind: "wait" },
  { kind: "out", text: " ✓ Compiled / in 1.4s (968 modules)", delay: 60, tone: "ok" },
  { kind: "out", text: " GET / 200 in 1532ms", delay: 160, tone: "dim" },
  { kind: "out", text: "", delay: 60 },
];


function lastLogin() {
  const d = new Date(Date.now() - 1000 * 60 * 47);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${day} ${mon} ${String(d.getDate()).padStart(2, " ")} ${time}`;
}

interface Line {
  prompt?: string;
  text: string;
  tone?: "dim" | "ok" | "accent";
}

interface LoaderProps {
  /** Real loading progress of the scene, 0 to 1. */
  progress: number;
  onStart: () => void;
  leaving: boolean;
  note?: string;
}

export default function Loader({ progress, onStart, leaving, note }: LoaderProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState<{ prompt: string; text: string } | null>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const started = useRef(false);
  const readyRef = useRef(false);
  readyRef.current = ready;
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Play the script, one step at a time.
  useEffect(() => {
    if (step >= SCRIPT.length) {
      // Server is up: ask the visitor to open it.
      const id = setTimeout(() => {
        readyRef.current = true;
        setReady(true);
      }, 120);
      return () => clearTimeout(id);
    }

    const s = SCRIPT[step];
    if (s.kind === "out") {
      const id = setTimeout(() => {
        setLines((l) => [...l, { text: s.text, tone: s.tone }]);
        setStep((x) => x + 1);
      }, s.delay ?? 80);
      return () => clearTimeout(id);
    }
    if (s.kind === "wait") {
      const id = setInterval(() => {
        if (progressRef.current >= 1) {
          clearInterval(id);
          setStep((x) => x + 1);
        }
      }, 60);
      return () => clearInterval(id);
    }
    // Type a command character by character, with a human rhythm.
    const prompt = s.prompt ?? PROMPT;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      setTyping({ prompt, text: s.cmd.slice(0, i) });
      if (i < s.cmd.length) {
        timer = setTimeout(tick, 35 + Math.random() * 55);
      } else {
        timer = setTimeout(() => {
          setTyping(null);
          setLines((l) => [...l, { prompt, text: s.cmd }]);
          setStep((x) => x + 1);
        }, s.pause ?? 150);
      }
    };
    timer = setTimeout(tick, 260);
    return () => clearTimeout(timer);
  }, [step]);

  const go = () => {
    if (!readyRef.current || started.current) return;
    started.current = true;
    setLines((l) => [...l, { text: "Opening http://localhost:3000 …", tone: "dim" }]);
    setReady(false);
    onStart();
  };

  // Listen from the start and check readiness at key time, so an Enter
  // pressed right as the prompt appears is never lost.
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") goRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tone = (t?: Line["tone"]) => (t === "dim" ? "text-[#8b8b8b]" : t === "ok" ? "text-[#4fd17a]" : t === "accent" ? "text-[#6cb6ff]" : "");

  return (
    <div
      className={`term-loader fixed inset-0 z-50 bg-[#1e1e1e] text-[#e6e6e6] transition-opacity duration-700 ${leaving ? "opacity-0 pointer-events-none" : "opacity-100"} ${ready ? "cursor-pointer" : ""}`}
      data-ready={ready || undefined}
      onClick={go}
    >
      <div className="h-full overflow-hidden px-3 py-2 sm:px-4 sm:py-3 font-[Menlo,Monaco,'SF_Mono',var(--font-geist-mono),monospace] text-[12px] sm:text-[13px] leading-[1.45]">
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-words min-h-[1.45em]">
            {l.prompt && <span>{l.prompt} </span>}
            <span className={tone(l.tone)}>{l.text}</span>
          </div>
        ))}
        {typing && (
          <div className="whitespace-pre-wrap break-words">
            <span>{typing.prompt} </span>
            {typing.text}
            <span className="term-caret" aria-hidden />
          </div>
        )}
        {ready && (
          <div className="whitespace-pre-wrap break-words">
            <span className="text-[#6cb6ff]">?</span> <span className="font-bold">{touch ? "Tap anywhere to open in browser" : "Press Enter to open in browser"}</span>
            <span className="text-[#8b8b8b]"> › http://localhost:3000</span>
            <span className="term-caret ml-1" aria-hidden />
          </div>
        )}
        {!typing && !ready && !leaving && step < SCRIPT.length && SCRIPT[step]?.kind !== "type" && <span className="term-caret term-caret--idle" aria-hidden />}
      </div>
      {note && <p className="absolute bottom-3 left-4 text-[11px] text-[#6b6b6b] font-mono">{note}</p>}
      <span className="sr-only" role="status">
        {ready ? "Appuyez sur Entrée ou cliquez pour ouvrir le portfolio." : "Chargement du portfolio…"}
      </span>
    </div>
  );
}
