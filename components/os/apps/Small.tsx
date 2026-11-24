"use client";

import { useState } from "react";
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
/* À propos (like "About this Mac")                                          */
/* ------------------------------------------------------------------------ */

export function About({ api }: { api: OSApi }) {
  const rows = [
    ["Utilisateur", PROFILE.name],
    ["Formation", "BUT Informatique, 2e année"],
    ["Établissement", PROFILE.university.name],
    ["Écran", "Studio Display XDR 27 pouces"],
    ["macOS", "Portfolio 2026"],
  ];
  return (
    <div className="flex flex-col items-center text-center px-6 pt-2 pb-5 h-full mac-content">
      <DisplayArt />
      <h1 className="text-[22px] font-bold tracking-tight mt-3">Khémara Parc</h1>
      <p className="text-[12px] mac-text-3 mb-4">Étudiant développeur · 2026</p>
      <dl className="text-[11.5px] w-full flex flex-col gap-1 mb-5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-[42%] text-right font-semibold">{k}</dt>
            <dd className="w-[58%] text-left mac-text-2">{v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={() => api.openApp("notes", "about")} className="push-btn">
        Plus d&apos;infos…
      </button>
      <p className="text-[10px] mac-text-3 mt-auto pt-4 leading-snug">
        © 2026 {PROFILE.name}.
        <br />
        Portfolio personnel, non affilié à Apple.
      </p>
    </div>
  );
}

/** Small drawing of the display, like the device picture of "About This Mac". */
function DisplayArt() {
  return (
    <svg width="150" height="118" viewBox="0 0 150 118" aria-hidden>
      <defs>
        <linearGradient id="about-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9cc8ff" />
          <stop offset="0.55" stopColor="#b9a7f2" />
          <stop offset="1" stopColor="#f2b79b" />
        </linearGradient>
        <linearGradient id="about-alu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4e5e8" />
          <stop offset="1" stopColor="#b9bcc1" />
        </linearGradient>
      </defs>
      <path d="M62 82h26l6 26H56z" fill="url(#about-alu)" />
      <rect x="44" y="106" width="62" height="5" rx="2.5" fill="url(#about-alu)" />
      <rect x="4" y="4" width="142" height="82" rx="5" fill="#d3d5d9" />
      <rect x="6" y="6" width="138" height="78" rx="4" fill="#0b0b0c" />
      <rect x="9" y="9" width="132" height="72" rx="1.5" fill="url(#about-wall)" />
    </svg>
  );
}
