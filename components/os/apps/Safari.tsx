"use client";

import { useEffect, useRef, useState } from "react";
import { Glyph, Logo } from "../Icons";
import { PROFILE } from "../profile";
import type { OSApi, PostSummary } from "../types";
import { Toolbar, ToolButton } from "./shared";

/** Pages: "start", "projets", "post:<slug>". */
type Page = string;

function urlFor(page: Page) {
  if (page === "start") return "";
  if (page === "projets") return `${PROFILE.domain}/projets`;
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
        {page === "projets" && <ProjectsPage posts={api.posts} go={go} />}
        {post && <Article post={post} go={go} />}
        {page.startsWith("post:") && !post && <p className="p-10 text-center mac-text-2">Safari ne parvient pas à trouver cette page.</p>}
      </div>
    </div>
  );
}

function StartPage({ api, go }: { api: OSApi; go: (p: Page) => void }) {
  const favorites = [
    { label: "Mes projets", onClick: () => go("projets"), tile: <Logo size={26} />, color: "#1D2DFF" },
    { label: "GitHub", href: PROFILE.github, tile: <Glyph name="github" size={26} />, color: "#1f2328" },
    { label: "LinkedIn", href: PROFILE.linkedin, tile: <Glyph name="linkedin" size={24} />, color: "#0a66c2" },
    { label: "Université", href: PROFILE.university.url, tile: <span className="text-[17px] font-bold">UN</span>, color: "#e2001a" },
  ];
  return (
    <div className="max-w-[720px] mx-auto px-8 py-10">
      <h2 className="text-[19px] font-bold mb-4">Favoris</h2>
      <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-5 mb-10">
        {favorites.map((f) => {
          const inner = (
            <>
              <span className="w-[64px] h-[64px] rounded-[14px] grid place-items-center text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]" style={{ background: f.color }}>
                {f.tile}
              </span>
              <span className="text-[12px] mac-text-2 text-center">{f.label}</span>
            </>
          );
          return f.href ? (
            <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:opacity-80">
              {inner}
            </a>
          ) : (
            <button key={f.label} type="button" onClick={f.onClick} className="flex flex-col items-center gap-2 hover:opacity-80">
              {inner}
            </button>
          );
        })}
      </div>

      <h2 className="text-[19px] font-bold mb-4">Projets récents</h2>
      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
        {api.posts.map((p) => (
          <button key={p.slug} type="button" onClick={() => go(`post:${p.slug}`)} className="reading-card text-left rounded-[12px] overflow-hidden">
            {p.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.thumbnail} alt="" className="w-full aspect-[1.9] object-cover" draggable={false} />
            )}
            <div className="p-3">
              <p className="text-[13px] font-semibold leading-snug line-clamp-2">{p.title}</p>
              <p className="text-[12px] mac-text-3 mt-1">{PROFILE.domain}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SiteHeader({ go }: { go: (p: Page) => void }) {
  return (
    <header className="site-header sticky top-0 z-10 flex items-center justify-between px-8 h-14">
      <button type="button" onClick={() => go("start")} className="flex items-center gap-2 font-semibold text-[14px]">
        <Logo size={18} />
        {PROFILE.name}
      </button>
      <nav className="flex items-center gap-5 text-[13px] mac-text-2">
        <button type="button" onClick={() => go("projets")} className="hover:opacity-70">
          Projets
        </button>
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
          GitHub
        </a>
      </nav>
    </header>
  );
}

function ProjectsPage({ posts, go }: { posts: PostSummary[]; go: (p: Page) => void }) {
  return (
    <div>
      <SiteHeader go={go} />
      <div className="max-w-[760px] mx-auto px-8 py-12">
        <p className="text-[13px] font-semibold mac-accent-text mb-2">Projets</p>
        <h1 className="text-[36px] font-bold tracking-tight leading-tight mb-10">Ce sur quoi j&apos;ai travaillé.</h1>
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
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
    </div>
  );
}

function Article({ post, go }: { post: PostSummary; go: (p: Page) => void }) {
  return (
    <div>
      <SiteHeader go={go} />
      <article className="max-w-[720px] mx-auto px-8 py-12">
        <button type="button" onClick={() => go("projets")} className="text-[13px] mac-accent-text mb-6 inline-flex items-center gap-1">
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
