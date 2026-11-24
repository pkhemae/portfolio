"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../profile";
import type { AppId, OSApi } from "../types";

type Line = { kind: "in" | "out" | "err"; text: string };

const PROMPT = `${PROFILE.handle}@studio ~ %`;

const APP_ALIASES: Record<string, AppId> = {
  finder: "finder",
  safari: "safari",
  notes: "notes",
  apercu: "preview",
  aperçu: "preview",
  preview: "preview",
  cv: "preview",
  mail: "mail",
  contact: "mail",
  terminal: "terminal",
};

export default function Terminal({ api }: { api: OSApi }) {
  const last = new Date();
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: `Last login: ${last.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} ${last.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} on ttys000` },
    { kind: "out", text: "Tapez `help` pour voir les commandes disponibles." },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    // Never use scrollIntoView here: it would also scroll the CSS3D layer.
    const scroller = endRef.current?.closest(".term-scroll");
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [lines]);

  const files = ["Bureau", "Documents", "Projets", ...api.posts.map((p) => `Projets/${p.slug}.md`), "Documents/CV.pdf"];

  const run = (raw: string) => {
    const input = raw.trim();
    const out: Line[] = [{ kind: "in", text: input }];
    const [cmd, ...args] = input.split(/\s+/);
    const arg = args.join(" ");
    const say = (text: string, kind: Line["kind"] = "out") => out.push({ kind, text });

    switch (cmd?.toLowerCase()) {
      case "":
        break;
      case "help":
        say("whoami          qui suis-je ?");
        say("ls              lister les fichiers");
        say("open <app>      ouvrir une app (finder, safari, notes, cv, mail)");
        say("cat <fichier>   lire un projet, ex. cat Projets/invitewatcher.md");
        say("projets         lister mes projets");
        say("contact         afficher mes coordonnées");
        say("lampe           allumer / éteindre la lampe du bureau");
        say("clear           effacer   ·   exit   revenir au bureau 3D");
        break;
      case "whoami":
        say(`${PROFILE.name} — étudiant en BUT Informatique (${PROFILE.university.name}), 20 ans.`);
        break;
      case "ls":
        say(files.join("   "));
        break;
      case "cat": {
        const slug = arg.replace(/^Projets\//i, "").replace(/\.md$/, "");
        const post = api.posts.find((p) => p.slug === slug);
        if (post) {
          api.openApp("safari", `post:${post.slug}`);
          say(`ouverture de ${post.title}…`);
        } else if (/cv/i.test(arg)) api.openApp("preview");
        else say(`cat: ${arg || "?"}: No such file or directory`, "err");
        break;
      }
      case "open": {
        const app = APP_ALIASES[arg.toLowerCase().replace(/^-a\s+/, "")];
        if (app) api.openApp(app);
        else say(`The application "${arg}" could not be found.`, "err");
        break;
      }
      case "projets":
      case "projects":
        api.posts.forEach((p) => say(`${p.date}   ${p.title}`));
        break;
      case "contact":
        say(`email     ${PROFILE.email}`);
        say(`github    ${PROFILE.github}`);
        say(`linkedin  ${PROFILE.linkedin}`);
        break;
      case "lampe":
      case "lamp":
        if (api.toggleLamp) {
          api.toggleLamp();
          say("clic.");
        } else say("lampe: aucune lampe détectée.", "err");
        break;
      case "date":
        say(new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" }));
        break;
      case "echo":
        say(arg);
        break;
      case "sudo":
        say("Password: ••••••••");
        say("Bien essayé. Cet incident sera signalé. 🙂", "err");
        break;
      case "exit":
        if (api.leave) api.leave();
        else say("[Opération terminée]");
        break;
      case "clear":
        setLines([]);
        return;
      default:
        say(`zsh: command not found: ${cmd}`, "err");
    }
    setLines((l) => [...l, ...out]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      if (value.trim()) setHistory((h) => [value, ...h].slice(0, 50));
      setValue("");
      setHIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (history[i] !== undefined) {
        setHIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(-1, i));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [c, ...rest] = value.split(" ");
      const partial = rest.join(" ");
      if (rest.length === 0) {
        const m = ["help", "whoami", "ls", "cat", "open", "projets", "contact", "lampe", "date", "clear", "exit", "echo"].find((x) => x.startsWith(c));
        if (m) setValue(m + " ");
      } else {
        const m = [...files, ...Object.keys(APP_ALIASES)].find((f) => f.startsWith(partial));
        if (m) setValue(`${c} ${m}`);
      }
    }
  };

  return (
    <div className="term-scroll flex-1 min-h-0 overflow-auto mac-scroll bg-[#1e1e1e] text-[#e5e5e5] font-mono text-[12.5px] leading-[1.55] px-3 py-2 cursor-text" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap break-words">
          {l.kind === "in" ? (
            <>
              <span className="text-[#9be28a]">{PROMPT}</span> {l.text}
            </>
          ) : (
            <span className={l.kind === "err" ? "text-[#ff7b72]" : ""}>{l.text}</span>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2" ref={endRef}>
        <span className="text-[#9be28a] shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Commande du terminal"
          className="flex-1 bg-transparent outline-none caret-[#e5e5e5] min-w-0"
        />
      </div>
    </div>
  );
}
