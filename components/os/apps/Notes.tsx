"use client";

import { useEffect, useState } from "react";
import { Glyph } from "../Icons";
import { PROFILE, SKILLS } from "../profile";
import type { OSApi } from "../types";
import { Toolbar, ToolButton } from "./shared";

interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  body: (api: OSApi) => React.ReactNode;
}

const NOTES: Note[] = [
  {
    id: "about",
    title: "Bonjour 👋",
    preview: "Étudiant de 20 ans en BUT Informatique…",
    date: "Aujourd'hui",
    body: (api) => (
      <>
        <h1>Bonjour 👋</h1>
        <p>
          Je m&apos;appelle <strong>{PROFILE.name}</strong>. Étudiant de 20 ans en deuxième année de BUT Informatique à{" "}
          <a href={PROFILE.university.url} target="_blank" rel="noopener noreferrer">
            l&apos;{PROFILE.university.name}
          </a>
          , je suis passionné par les sciences et les nouvelles technologies.
        </p>
        <p>
          Bienvenue sur mon bureau. Vous y trouverez mes expérimentations et les projets sur lesquels j&apos;ai travaillé durant mon parcours.
          Faites comme chez vous, fouillez dans les dossiers.
        </p>
        <h2>Par où commencer</h2>
        <ul className="checklist">
          <li>
            <button type="button" onClick={() => api.openApp("safari", "start")}>Parcourir mes projets</button> dans Safari
          </li>
          <li>
            <button type="button" onClick={() => api.openApp("preview")}>Lire mon CV</button> dans Aperçu
          </li>
          <li>
            <button type="button" onClick={() => api.openApp("mail")}>M&apos;écrire</button> avec Mail
          </li>
          <li>
            <button type="button" onClick={() => api.openApp("terminal")}>Ouvrir le Terminal</button> et taper <code>help</code>
          </li>
        </ul>
        <p className="hint">Astuce : la lampe du bureau s&apos;allume et s&apos;éteint quand on clique dessus.</p>
      </>
    ),
  },
  {
    id: "skills",
    title: "Compétences",
    preview: "HTML, CSS, JavaScript, Kotlin, Python, SQL…",
    date: "Hier",
    body: () => (
      <>
        <h1>Compétences</h1>
        {Object.entries(SKILLS).map(([group, items]) => (
          <div key={group}>
            <h2>{group}</h2>
            <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-2 not-prose mb-6">
              {items.map((s) => (
                <span key={s.name} className="skill-chip flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.icon} alt="" className="w-5 h-5 object-contain" draggable={false} />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "links",
    title: "Liens",
    preview: "GitHub, LinkedIn, code source…",
    date: "Lundi",
    body: () => (
      <>
        <h1>Liens</h1>
        <ul>
          <li>
            GitHub :{" "}
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
              github.com/pkhemae
            </a>
          </li>
          <li>
            LinkedIn :{" "}
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/khemaraparc
            </a>
          </li>
          <li>
            Code source de ce portfolio :{" "}
            <a href={PROFILE.source} target="_blank" rel="noopener noreferrer">
              pkhemae/portfolio
            </a>
          </li>
          <li>E-mail : {PROFILE.email}</li>
        </ul>
      </>
    ),
  },
];

export default function Notes({ api, payload, nav }: { api: OSApi; payload?: string; nav: number }) {
  const [current, setCurrent] = useState(payload || "about");
  useEffect(() => {
    if (payload) setCurrent(payload);
  }, [payload, nav]);
  const note = NOTES.find((n) => n.id === current) ?? NOTES[0];

  return (
    <div className="flex h-full min-h-0">
      {!api.compact && (
        <aside data-drag className="mac-sidebar notes-list w-[230px] shrink-0 pt-[52px] overflow-auto">
          <p className="px-4 mb-1 text-[11px] font-semibold mac-text-3">Notes</p>
          {NOTES.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setCurrent(n.id)}
              className={`notes-item w-[calc(100%-16px)] mx-2 text-left px-3 py-2 rounded-[7px] ${n.id === current ? "is-active" : ""}`}
            >
              <p className="text-[13px] font-semibold truncate">{n.title}</p>
              <p className="text-[12px] truncate">
                <span className="mac-text-2 mr-1.5">{n.date}</span>
                <span className="mac-text-3">{n.preview}</span>
              </p>
            </button>
          ))}
        </aside>
      )}
      <div className="flex-1 min-w-0 flex flex-col mac-content">
        <Toolbar leftInset={api.compact}>
          {api.compact && (
            <select value={current} onChange={(e) => setCurrent(e.target.value)} className="notes-select text-[13px] rounded-[6px] px-2 h-7" data-no-drag aria-label="Note">
              {NOTES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          )}
          <div className="flex-1" />
          <ToolButton label="Nouvelle note" disabled>
            <Glyph name="compose" />
          </ToolButton>
        </Toolbar>
        <div className="flex-1 min-h-0 overflow-auto mac-scroll">
          <p className="text-center text-[11px] mac-text-3 mt-1 mb-4">{note.date}</p>
          <div className="notes-body max-w-[640px] mx-auto px-8 pb-10">{note.body(api)}</div>
        </div>
      </div>
    </div>
  );
}
