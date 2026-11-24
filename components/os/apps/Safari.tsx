"use client";

import { useEffect, useRef, useState } from "react";
import { Glyph } from "../Icons";
import { PROFILE } from "../profile";
import type { OSApi, PostSummary } from "../types";
import { Toolbar, ToolButton } from "./shared";

/** Pages: "start" (home with favorites and all projects) and "post:<slug>". */
type Page = string;

function urlFor(page: Page) {
  if (page === "start") return "";
  if (page.startsWith("post:")) return `${PROFILE.domain}/projets/${page.slice(5)}`;
  return PROFILE.domain;
}

export default function Safari({ api, payload, nav }: { api: OSApi; payload?: string; nav: number }) {
  const [history, setHistory] = useState<Page[]>([payload || "start"]);
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const page = history[index];

  const go = (p: Page) => {
    setHistory((h) => [...h.slice(0, index + 1), p]);
    setIndex((i) => i + 1);
  };

  useEffect(() => {
    if (payload && payload !== page) go(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [page]);

  const post = page.startsWith("post:") ? api.posts.find((p) => p.slug === page.slice(5)) : undefined;
  const url = urlFor(page);

  return (
    <div className="flex flex-col h-full min-h-0">
      <Toolbar className="mac-toolbar--safari">
        <div className="flex items-center">
          <ToolButton label="Précédent" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            <Glyph name="chevron-left" />
          </ToolButton>
          <ToolButton label="Suivant" onClick={() => setIndex((i) => Math.min(history.length - 1, i + 1))} disabled={index >= history.length - 1}>
            <Glyph name="chevron-right" />
          </ToolButton>
        </div>
        <div className="flex-1 flex justify-center min-w-0">
          <button type="button" data-no-drag onClick={() => go("start")} className="url-field w-full max-w-[460px] flex items-center justify-center gap-1.5 h-[30px] rounded-[8px] text-[13px] min-w-0">
            {url ? (
              <>
                <span className="mac-text-3 shrink-0">
                  <Glyph name="lock" size={12} />
                </span>
                <span className="truncate">{url}</span>
              </>
            ) : (
              <span className="mac-text-3">Rechercher ou saisir un nom de site web</span>
            )}
          </button>
        </div>
        {post && (
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="tool-btn" title="Ouvrir dans un nouvel onglet" aria-label="Ouvrir dans un nouvel onglet" data-no-drag>
            <Glyph name="share" />
          </a>
        )}
        <ToolButton label="Page d'accueil" onClick={() => go("start")}>
          <Glyph name="plus" />
        </ToolButton>
      </Toolbar>

      <div ref={scroller} className="flex-1 min-h-0 overflow-auto mac-scroll safari-page">
        {page === "start" && <StartPage api={api} go={go} />}
        {post && <Article post={post} go={go} />}
        {page.startsWith("post:") && !post && <p className="p-10 text-center mac-text-2">Safari ne parvient pas à trouver cette page.</p>}
      </div>
    </div>
  );
}

function StartPage({ api, go }: { api: OSApi; go: (p: Page) => void }) {
  const favorites = [
    { label: "GitHub", href: PROFILE.github, logo: "github" as const },
    { label: "LinkedIn", href: PROFILE.linkedin, logo: "linkedin" as const },
  ];
  return (
    <div className="max-w-[760px] mx-auto px-8 py-10">
      <h2 className="text-[19px] font-bold mb-4">Favoris</h2>
      <div className="flex gap-6 mb-10">
        {favorites.map((f) => (
          <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 w-[72px] hover:opacity-80">
            <span className="w-[64px] h-[64px] rounded-[14px] grid place-items-center bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] border border-black/5">
              <BrandLogo brand={f.logo} size={34} />
            </span>
            <span className="text-[12px] mac-text-2 text-center">{f.label}</span>
          </a>
        ))}
      </div>

      <h2 className="text-[19px] font-bold mb-4">Projets</h2>
      <div className="flex flex-col gap-4">
        {api.posts.map((p) => (
          <button key={p.slug} type="button" onClick={() => go(`post:${p.slug}`)} className="reading-card flex max-sm:flex-col gap-5 text-left rounded-[14px] overflow-hidden p-3">
            {p.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.thumbnail} alt="" className="w-[220px] max-sm:w-full aspect-[1.7] object-cover rounded-[9px] shrink-0" draggable={false} />
            )}
            <div className="py-1 min-w-0">
              <p className="text-[12px] mac-text-3 mb-1">{p.date}</p>
              <p className="text-[17px] font-semibold leading-snug">{p.title}</p>
              <p className="text-[13px] mac-text-2 mt-1.5 line-clamp-3">{p.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Official GitHub and LinkedIn marks, in their brand colours. */
function BrandLogo({ brand, size }: { brand: "github" | "linkedin"; size: number }) {
  if (brand === "linkedin") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#0A66C2"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    );
  }
  return (
    <span className="text-[#181717]">
      <Glyph name="github" size={size} />
    </span>
  );
}

function SiteHeader({ go }: { go: (p: Page) => void }) {
  return (
    <header className="site-header sticky top-0 z-10 flex items-center justify-between px-8 h-14">
      <button type="button" onClick={() => go("start")} className="flex items-center gap-2 font-semibold text-[14px]">
        <span className="w-6 h-6 rounded-full bg-[#1D2DFF] text-white text-[10px] font-bold grid place-items-center">KP</span>
        {PROFILE.name}
      </button>
      <nav className="flex items-center gap-5 text-[13px] mac-text-2">
        <button type="button" onClick={() => go("start")} className="hover:opacity-70">
          Projets
        </button>
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
          GitHub
        </a>
      </nav>
    </header>
  );
}

function Article({ post, go }: { post: PostSummary; go: (p: Page) => void }) {
  return (
    <div>
      <SiteHeader go={go} />
      <article className="max-w-[720px] mx-auto px-8 py-12">
        <button type="button" onClick={() => go("start")} className="text-[13px] mac-accent-text mb-6 inline-flex items-center gap-1">
          <Glyph name="chevron-left" size={13} /> Tous les projets
        </button>
        <p className="text-[13px] mac-text-3 mb-2">{post.date}</p>
        <h1 className="text-[34px] font-bold tracking-tight leading-[1.15] mb-4">{post.title}</h1>
        <p className="text-[17px] mac-text-2 leading-relaxed mb-8">{post.description}</p>
        <div className="prose max-w-none safari-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-1.5 text-[13px] mac-accent-text">
          Ouvrir la page publique <Glyph name="external" size={13} />
        </a>
      </article>
    </div>
  );
}
