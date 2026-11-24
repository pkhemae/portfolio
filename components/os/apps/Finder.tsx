"use client";

import { useEffect, useMemo, useState } from "react";
import { AppIcon, FolderIcon, Glyph, TextFileIcon, ThumbIcon } from "../Icons";
import { APPS, DOCK } from "../profile";
import type { OSApi } from "../types";
import { Toolbar, ToolButton } from "./shared";

type Location = "projets" | "documents" | "applications" | "bureau" | "corbeille";

interface Item {
  key: string;
  name: string;
  kind: string;
  /** Icon drawn at the requested size (grid: 64, list: 20). */
  icon: (size: number) => React.ReactNode;
  open?: () => void;
}

const LABELS: Record<Location, string> = {
  projets: "Projets",
  documents: "Documents",
  applications: "Applications",
  bureau: "Bureau",
  corbeille: "Corbeille",
};

const SIDEBAR: { title: string; items: { id: Location; glyph: string }[] }[] = [
  {
    title: "Favoris",
    items: [
      { id: "projets", glyph: "folder" },
      { id: "documents", glyph: "doc" },
      { id: "applications", glyph: "apps" },
      { id: "bureau", glyph: "desktop" },
    ],
  },
  { title: "Emplacements", items: [{ id: "corbeille", glyph: "trash" }] },
];

export default function Finder({ api, payload, nav }: { api: OSApi; payload?: string; nav: number }) {
  const [history, setHistory] = useState<Location[]>([(payload as Location) || "projets"]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const location = history[index];

  const go = (loc: Location) => {
    if (loc === location) return;
    const next = [...history.slice(0, index + 1), loc];
    setHistory(next);
    setIndex(next.length - 1);
    setSelected(null);
    setQuery("");
  };

  // Navigation requested from outside (desktop icon, Dock, terminal…).
  useEffect(() => {
    if (payload) go(payload as Location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  const items: Item[] = useMemo(() => {
    switch (location) {
      case "projets":
        return api.posts.map((p) => ({
          key: p.slug,
          name: p.title.split(":")[0].trim(),
          kind: "Page web",
          icon: (s: number) => (p.thumbnail ? <ThumbIcon src={p.thumbnail} size={s} /> : <TextFileIcon label="WEB" size={s} />),
          open: () => api.openApp("safari", `post:${p.slug}`),
        }));
      case "documents":
        return [
          { key: "cv", name: "CV.pdf", kind: "Document PDF", icon: (s: number) => <ThumbIcon src="/cv.pdf.png" badge="PDF" size={s} />, open: () => api.openApp("preview") },
          { key: "about", name: "À propos.txt", kind: "Note", icon: (s: number) => <TextFileIcon size={s} />, open: () => api.openApp("notes", "about") },
          { key: "skills", name: "Compétences.txt", kind: "Note", icon: (s: number) => <TextFileIcon size={s} />, open: () => api.openApp("notes", "skills") },
          { key: "projets", name: "Projets", kind: "Dossier", icon: (s: number) => <FolderIcon size={s} />, open: () => go("projets") },
        ];
      case "applications":
        return DOCK.map((id) => ({ key: id, name: APPS[id].name, kind: "Application", icon: (s: number) => <AppIcon app={id} size={s} />, open: () => api.openApp(id) }));
      case "bureau":
        return [
          { key: "projets", name: "Projets", kind: "Dossier", icon: (s: number) => <FolderIcon size={s} />, open: () => go("projets") },
          { key: "cv", name: "CV.pdf", kind: "Document PDF", icon: (s: number) => <ThumbIcon src="/cv.pdf.png" badge="PDF" size={s} />, open: () => api.openApp("preview") },
          { key: "about", name: "À propos.txt", kind: "Note", icon: (s: number) => <TextFileIcon size={s} />, open: () => api.openApp("notes", "about") },
        ];
      case "corbeille":
        return [{ key: "old", name: "ancien-portfolio.zip", kind: "Archive ZIP", icon: (s: number) => <TextFileIcon label="ZIP" size={s} /> }];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, api.posts]);

  const visible = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  const activate = (item: Item) => {
    if (api.compact) item.open?.();
    else setSelected(item.key);
  };

  return (
    <div className="flex h-full min-h-0">
      {!api.compact && (
        <aside data-drag className="mac-sidebar w-[180px] shrink-0 pt-[52px] px-2.5 overflow-auto">
          {SIDEBAR.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="px-2 mb-1 text-[11px] font-semibold mac-text-3">{group.title}</p>
              {group.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => go(it.id)}
                  className={`sidebar-item w-full flex items-center gap-2 px-2 h-[26px] rounded-[6px] text-[13px] ${location === it.id ? "sidebar-item--active" : ""}`}
                >
                  <span className="mac-accent-text">
                    <Glyph name={it.glyph} size={15} />
                  </span>
                  {LABELS[it.id]}
                </button>
              ))}
            </div>
          ))}
        </aside>
      )}

      <div className="flex-1 min-w-0 flex flex-col mac-content">
        <Toolbar leftInset={api.compact}>
          <div className="flex items-center">
            <ToolButton label="Précédent" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              <Glyph name="chevron-left" />
            </ToolButton>
            <ToolButton label="Suivant" onClick={() => setIndex((i) => Math.min(history.length - 1, i + 1))} disabled={index >= history.length - 1}>
              <Glyph name="chevron-right" />
            </ToolButton>
          </div>
          <span className="text-[14px] font-semibold truncate">{LABELS[location]}</span>
          <div className="flex-1" />
          {!api.compact && (
            <div className="segmented" data-no-drag>
              <button type="button" className={view === "grid" ? "is-on" : ""} onClick={() => setView("grid")} aria-label="Icônes">
                <Glyph name="grid" size={15} />
              </button>
              <button type="button" className={view === "list" ? "is-on" : ""} onClick={() => setView("list")} aria-label="Liste">
                <Glyph name="list" size={15} />
              </button>
            </div>
          )}
          <label className="search-field" data-no-drag>
            <Glyph name="search" size={13} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" aria-label="Rechercher" className="w-28" />
          </label>
        </Toolbar>

        <div className="flex-1 min-h-0 overflow-auto mac-scroll" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          {view === "grid" || api.compact ? (
            <div className={`grid ${api.compact ? "grid-cols-3" : "grid-cols-[repeat(auto-fill,minmax(112px,1fr))]"} gap-y-3 p-5`}>
              {visible.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => activate(item)}
                  onDoubleClick={() => item.open?.()}
                  className={`finder-item flex flex-col items-center gap-1 p-1.5 rounded-[8px] ${selected === item.key ? "is-selected" : ""}`}
                >
                  <span className="finder-icon grid place-items-center w-[72px] h-[64px] rounded-[6px]">{item.icon(64)}</span>
                  <span className="finder-label text-[12px] leading-tight text-center px-1.5 py-[1px] rounded-[4px] line-clamp-2 max-w-[108px]">{item.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="mac-text-3 text-[11px] text-left">
                  <th className="font-medium py-1.5 pl-5">Nom</th>
                  <th className="font-medium py-1.5">Type</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item, i) => (
                  <tr
                    key={item.key}
                    onClick={() => setSelected(item.key)}
                    onDoubleClick={() => item.open?.()}
                    className={`list-row ${selected === item.key ? "is-selected" : i % 2 ? "list-row--alt" : ""}`}
                  >
                    <td className="py-1 pl-5 flex items-center gap-2">
                      <span className="inline-grid place-items-center w-5 h-5">{item.icon(20)}</span>
                      {item.name}
                    </td>
                    <td className="py-1 mac-text-2">{item.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {visible.length === 0 && <p className="text-center text-[13px] mac-text-3 mt-10">Aucun élément</p>}
        </div>

        <div className="mac-statusbar h-[26px] shrink-0 grid place-items-center text-[11px] mac-text-2">
          {visible.length} élément{visible.length > 1 ? "s" : ""}
          {!api.compact && " · double-cliquez pour ouvrir"}
        </div>
      </div>
    </div>
  );
}
