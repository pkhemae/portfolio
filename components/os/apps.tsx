"use client";

import { useEffect, useRef, useState } from "react";
import GithubContributions from "../GithubContributions";
import { AppIcon } from "./Icons";
import { APPS, PROFILE, SKILLS } from "./profile";
import type { AppId, PostSummary } from "./types";

/* ------------------------------------------------------------------------ */
/* Shared bits                                                               */
/* ------------------------------------------------------------------------ */

export function Bracket({ href, children, onClick, download }: { href?: string; children: React.ReactNode; onClick?: () => void; download?: boolean }) {
  const cls = "os-bracket inline-block font-mono text-[13px] text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 rounded-sm transition-colors duration-150 cursor-pointer";
  if (href) {
    const external = href.startsWith("http");
    return (
      <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} download={download}>
        [{children}]
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      [{children}]
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400 mb-3">{children}</h3>;
}

function useCopy(text: string) {
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

/* ------------------------------------------------------------------------ */
/* About                                                                     */
/* ------------------------------------------------------------------------ */

export function AboutApp({ openApp }: { openApp: (app: AppId) => void }) {
  return (
    <div className="p-8 text-[15px] leading-relaxed text-neutral-700">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1D2DFF] mb-3">a-propos.txt</p>
      <h1 className="text-[30px] font-bold tracking-tight text-neutral-900 leading-tight">{PROFILE.name}</h1>
      <p className="text-neutral-400 text-lg mb-6">Bonjour 👋</p>
      <div className="space-y-4">
        <p>
          Étudiant de 20 ans en deuxième année de BUT Informatique à{" "}
          <a href={PROFILE.university.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1D2DFF] underline underline-offset-4 decoration-[#1D2DFF]/40 hover:decoration-[#1D2DFF]">
            {PROFILE.university.name}
          </a>
          . Je suis passionné par les sciences et les nouvelles technologies.
        </p>
        <p>
          Bienvenue sur mon bureau. Ici, vous trouverez mes expérimentations ainsi que les différents projets sur lesquels j&apos;ai
          travaillé durant mon parcours. Faites comme chez vous, fouillez dans les dossiers.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-1 gap-y-1 mt-6 -ml-1.5">
        <Bracket onClick={() => openApp("projects")}>Mes projets</Bracket>
        <Bracket onClick={() => openApp("cv")}>Mon CV</Bracket>
        <Bracket onClick={() => openApp("contact")}>Me contacter</Bracket>
        <Bracket href={PROFILE.github}>GitHub</Bracket>
        <Bracket href={PROFILE.linkedin}>LinkedIn</Bracket>
      </div>
      <p className="mt-8 pt-4 border-t border-dashed border-neutral-200 font-mono text-[12px] text-neutral-400">
        astuce : la lampe du bureau s&apos;allume quand on clique dessus.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Projects                                                                  */
/* ------------------------------------------------------------------------ */

export function ProjectsApp({ posts, openPost }: { posts: PostSummary[]; openPost: (slug: string) => void }) {
  return (
    <div className="p-6">
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-mono text-[12px] text-neutral-400">~/projets — {posts.length} éléments</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {posts.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => openPost(p.slug)}
            className="group flex items-center gap-4 text-left p-2.5 -mx-1 rounded-sm border border-transparent hover:border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-28 h-16 max-sm:w-20 max-sm:h-12 shrink-0 overflow-hidden rounded-sm bg-neutral-100 border border-neutral-200">
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
              ) : (
                <div className="w-full h-full grid place-items-center text-neutral-300">
                  <AppIcon app="post" size={28} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900 group-hover:text-[#1D2DFF] transition-colors truncate">{p.title}</p>
              <p className="text-[13px] text-neutral-500 line-clamp-2 leading-snug mt-0.5">{p.description}</p>
            </div>
            <span className="max-sm:hidden font-mono text-[12px] text-neutral-400 tabular-nums shrink-0 self-start mt-1">{p.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PostApp({ post }: { post?: PostSummary }) {
  if (!post) return <p className="p-6 text-neutral-500">Fichier introuvable.</p>;
  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="font-mono text-[12px] text-neutral-400">{post.date}</p>
        <Bracket href={`/blog/${post.slug}`}>Ouvrir en plein écran ↗</Bracket>
      </div>
      <h1 className="text-[28px] font-bold tracking-tight text-neutral-900 leading-tight mb-6">{post.title}</h1>
      <article className="prose prose-neutral max-w-none os-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* CV                                                                        */
/* ------------------------------------------------------------------------ */

export function CvApp() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 bg-neutral-50/60 sticky top-0 z-10">
        <span className="font-mono text-[12px] text-neutral-400">cv.pdf — 1 page</span>
        <div className="flex gap-1">
          <Bracket href="/cv.pdf">Ouvrir</Bracket>
          <Bracket href="/cv.pdf" download>
            Télécharger
          </Bracket>
        </div>
      </div>
      <div className="p-5 bg-neutral-100/70 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cv.pdf.png" alt="CV de Khémara Parc" className="w-full h-auto shadow-[0_2px_20px_rgba(0,0,0,0.08)] bg-white" draggable={false} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Skills                                                                    */
/* ------------------------------------------------------------------------ */

export function SkillsApp() {
  return (
    <div className="p-7 space-y-7">
      {Object.entries(SKILLS).map(([group, items]) => (
        <div key={group}>
          <SectionLabel>{group}</SectionLabel>
          <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-2">
            {items.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 px-3 py-2.5 border border-neutral-200/80 bg-neutral-50/60 rounded-sm text-[13px] text-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt="" className="w-5 h-5 object-contain" draggable={false} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* GitHub activity                                                           */
/* ------------------------------------------------------------------------ */

export function GithubApp() {
  return (
    <div className="p-8">
      <GithubContributions />
      <div className="mt-6 -ml-1.5">
        <Bracket href={PROFILE.github}>Voir mon profil GitHub</Bracket>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Contact                                                                   */
/* ------------------------------------------------------------------------ */

export function ContactApp() {
  const { copied, copy } = useCopy(PROFILE.email);
  return (
    <div className="p-7">
      <SectionLabel>Me contacter</SectionLabel>
      <button
        type="button"
        onClick={copy}
        className="w-full text-left group border border-neutral-200 hover:border-[#1D2DFF] rounded-sm px-4 py-3 transition-colors"
      >
        <span className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">E-mail</span>
        <span className="block text-[15px] text-neutral-900 break-all">{PROFILE.email}</span>
        <span className="block font-mono text-[12px] mt-1.5 text-[#1D2DFF]">{copied ? "✓ copié dans le presse-papiers" : "cliquer pour copier"}</span>
      </button>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          { label: "GitHub", value: "@pkhemae", href: PROFILE.github },
          { label: "LinkedIn", value: "khemaraparc", href: PROFILE.linkedin },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-neutral-200 hover:border-[#1D2DFF] rounded-sm px-4 py-3 transition-colors"
          >
            <span className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">{l.label}</span>
            <span className="block text-[15px] text-neutral-900">{l.value} ↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Terminal                                                                  */
/* ------------------------------------------------------------------------ */

interface TerminalProps {
  posts: PostSummary[];
  openApp: (app: AppId, payload?: string) => void;
  toggleNight?: () => void;
  leave?: () => void;
}

type Line = { kind: "in" | "out" | "err"; text: string };

const PROMPT = `${PROFILE.handle}@bureau:~$`;

export function TerminalApp({ posts, openApp, toggleNight, leave }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "khémaraOS — terminal v1.0" },
    { kind: "out", text: "Tapez `help` pour la liste des commandes." },
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
    const scroller = endRef.current?.closest(".os-scroll");
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [lines]);

  const files = [...APPS.filter((a) => a.id !== "terminal").map((a) => a.file), ...posts.map((p) => `projets/${p.slug}.md`)];

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
        say("Commandes disponibles :");
        say("  whoami         qui suis-je ?");
        say("  ls             lister les fichiers");
        say("  open <nom>     ouvrir une application (about, projets, cv, contact…)");
        say("  projets        lister mes projets");
        say("  contact        afficher mes coordonnées");
        say("  lampe          allumer / éteindre la lampe du bureau");
        say("  date           afficher la date");
        say("  clear          effacer le terminal");
        say("  exit           revenir au bureau");
        break;
      case "whoami":
        say(`${PROFILE.name} — étudiant en BUT Informatique (Nantes), 20 ans.`);
        say("Passionné par les sciences et les nouvelles technologies.");
        break;
      case "ls":
        say(files.join("   "));
        break;
      case "cat":
        if (!arg) say("cat: nom de fichier manquant", "err");
        else if (arg.includes("a-propos")) openApp("about");
        else if (arg.includes("cv")) openApp("cv");
        else if (arg.includes("contact")) openApp("contact");
        else {
          const slug = arg.replace(/^projets\//, "").replace(/\.md$/, "");
          const post = posts.find((p) => p.slug === slug);
          if (post) openApp("post", post.slug);
          else say(`cat: ${arg}: fichier introuvable`, "err");
        }
        break;
      case "open": {
        const map: Record<string, AppId> = {
          about: "about",
          "a-propos": "about",
          apropos: "about",
          projets: "projects",
          projects: "projects",
          cv: "cv",
          competences: "skills",
          skills: "skills",
          github: "github",
          contact: "contact",
        };
        const app = map[arg.toLowerCase()];
        if (app) {
          openApp(app);
          say(`ouverture de ${arg}…`);
        } else say(`open: application inconnue « ${arg} »`, "err");
        break;
      }
      case "projets":
      case "projects":
        posts.forEach((p) => say(`  ${p.date}  ${p.title}`));
        say("→ `cat projets/<nom>.md` pour en lire un.");
        break;
      case "contact":
        say(`email     ${PROFILE.email}`);
        say(`github    ${PROFILE.github}`);
        say(`linkedin  ${PROFILE.linkedin}`);
        break;
      case "lampe":
      case "lamp":
        if (toggleNight) {
          toggleNight();
          say("clic.");
        } else say("lampe: aucune lampe détectée ici.", "err");
        break;
      case "date":
        say(new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" }));
        break;
      case "echo":
        say(arg);
        break;
      case "sudo":
        say("Bien essayé. Cet incident sera signalé. 🙂", "err");
        break;
      case "exit":
        if (leave) leave();
        else say("exit: déjà dehors.");
        break;
      case "clear":
        setLines([]);
        return;
      default:
        say(`${cmd}: commande introuvable. Tapez \`help\`.`, "err");
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
        const cmds = ["help", "whoami", "ls", "cat", "open", "projets", "contact", "lampe", "date", "clear", "exit", "echo"];
        const m = cmds.find((x) => x.startsWith(c));
        if (m) setValue(m + " ");
      } else {
        const m = files.find((f) => f.startsWith(partial));
        if (m) setValue(`${c} ${m}`);
      }
    }
  };

  return (
    <div className="min-h-full bg-[#141417] text-[#e6e3dc] font-mono text-[13px] leading-[1.6] p-4 cursor-text" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap break-words">
          {l.kind === "in" ? (
            <>
              <span className="text-[#8b93ff]">{PROMPT}</span> {l.text}
            </>
          ) : (
            <span className={l.kind === "err" ? "text-[#ff8a8a]" : ""}>{l.text}</span>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2" ref={endRef}>
        <span className="text-[#8b93ff] shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Commande du terminal"
          className="flex-1 bg-transparent outline-none caret-[#1D2DFF] text-[#e6e3dc] min-w-0"
        />
      </div>
    </div>
  );
}
