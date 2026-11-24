"use client";

import { useState } from "react";
import GithubContributions from "../../GithubContributions";
import { Glyph } from "../Icons";
import { PROFILE } from "../profile";
import type { OSApi } from "../types";
import { Toolbar, ToolButton, useCopy } from "./shared";

/* ------------------------------------------------------------------------ */
/* Aperçu (CV)                                                               */
/* ------------------------------------------------------------------------ */

export function Preview({ api }: { api: OSApi }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex flex-col h-full min-h-0">
      <Toolbar leftInset>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate">CV.pdf</p>
          <p className="text-[11px] mac-text-3 leading-tight">1 page</p>
        </div>
        <div className="flex-1" />
        {!api.compact && (
          <>
            <ToolButton label="Réduire" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}>
              <Glyph name="zoom-out" />
            </ToolButton>
            <ToolButton label="Agrandir" onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}>
              <Glyph name="zoom-in" />
            </ToolButton>
          </>
        )}
        <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="tool-btn" title="Ouvrir le PDF" aria-label="Ouvrir le PDF" data-no-drag>
          <Glyph name="external" />
        </a>
        <a href="/cv.pdf" download className="tool-btn" title="Télécharger" aria-label="Télécharger" data-no-drag>
          <Glyph name="download" />
        </a>
      </Toolbar>
      <div className="preview-canvas flex-1 min-h-0 overflow-auto mac-scroll p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cv.pdf.png"
          alt={`CV de ${PROFILE.name}`}
          className="mx-auto bg-white shadow-[0_2px_14px_rgba(0,0,0,0.25)] max-w-none"
          style={{ width: `${zoom * 100}%` }}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Mail                                                                      */
/* ------------------------------------------------------------------------ */

export function Mail() {
  const [subject, setSubject] = useState("Bonjour Khémara");
  const [body, setBody] = useState("");
  const { copied, copy } = useCopy(PROFILE.email);
  const href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="flex flex-col h-full min-h-0 mac-content">
      <Toolbar leftInset>
        <span className="text-[13px] font-semibold">Nouveau message</span>
        <div className="flex-1" />
        <a href={href} className="tool-btn" title="Envoyer" aria-label="Envoyer" data-no-drag>
          <Glyph name="send" />
        </a>
      </Toolbar>
      <div className="mail-fields text-[13px]">
        <div className="mail-row">
          <span className="mac-text-3 w-14 shrink-0">À :</span>
          <span className="mail-chip">{PROFILE.name}</span>
          <span className="mac-text-3 truncate">{PROFILE.email}</span>
          <div className="flex-1" />
          <button type="button" onClick={copy} className="text-[12px] mac-accent-text flex items-center gap-1 shrink-0">
            <Glyph name="copy" size={13} />
            {copied ? "Copié" : "Copier l'adresse"}
          </button>
        </div>
        <label className="mail-row">
          <span className="mac-text-3 w-14 shrink-0">Objet :</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent outline-none" />
        </label>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Écrivez votre message… puis cliquez sur l'avion en papier pour l'envoyer avec votre messagerie."
        className="flex-1 min-h-0 resize-none bg-transparent outline-none p-4 text-[14px] leading-relaxed"
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Moniteur d'activité (GitHub)                                              */
/* ------------------------------------------------------------------------ */

export function Activity({ api }: { api: OSApi }) {
  return (
    <div className="flex flex-col h-full min-h-0 mac-content">
      <Toolbar leftInset>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate">Moniteur d&apos;activité</p>
          <p className="text-[11px] mac-text-3 leading-tight">Contributions GitHub · 12 derniers mois</p>
        </div>
        <div className="flex-1" />
        {!api.compact && (
          <div className="segmented" data-no-drag>
            <button type="button" className="is-on px-3 text-[12px]">Commits</button>
            <button type="button" className="px-3 text-[12px]" disabled>Mémoire</button>
            <button type="button" className="px-3 text-[12px]" disabled>Réseau</button>
          </div>
        )}
      </Toolbar>
      <div className="flex-1 min-h-0 overflow-auto mac-scroll p-6">
        <GithubContributions />
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-[13px] mac-accent-text">
          Voir mon profil GitHub <Glyph name="external" size={13} />
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* À propos (like "About this Mac")                                          */
/* ------------------------------------------------------------------------ */

export function About({ api }: { api: OSApi }) {
  const rows = [
    ["Formation", "BUT Informatique · 2e année"],
    ["Établissement", PROFILE.university.name],
    ["Âge", "20 ans"],
    ["Système", "khémaraOS 2026"],
  ];
  return (
    <div className="flex flex-col items-center text-center px-6 pt-4 pb-6 h-full mac-content">
      <div className="w-[110px] h-[110px] rounded-full grid place-items-center text-white text-[40px] font-semibold tracking-tight about-avatar mb-4">
        {PROFILE.initials}
      </div>
      <h1 className="text-[22px] font-bold tracking-tight">{PROFILE.name}</h1>
      <p className="text-[12px] mac-text-3 mb-5">Étudiant développeur</p>
      <dl className="text-[12px] w-full flex flex-col gap-1 mb-6">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-1/2 text-right font-semibold">{k}</dt>
            <dd className="w-1/2 text-left mac-text-2">{v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={() => api.openApp("notes", "about")} className="push-btn">
        Plus d&apos;infos…
      </button>
      <p className="text-[10px] mac-text-3 mt-auto pt-4">™ et © 2026 {PROFILE.name}. Tous droits réservés.</p>
    </div>
  );
}

