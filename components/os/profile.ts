import type { AppId } from "./types";

export const PROFILE = {
  name: "Khémara Parc",
  initials: "KP",
  handle: "khemara",
  email: "khemara.parc@etu.univ-nantes.fr",
  github: "https://github.com/pkhemae",
  linkedin: "https://linkedin.com/in/khemaraparc",
  university: { name: "Université de Nantes", url: "https://www.univ-nantes.fr" },
  source: "https://github.com/pkhemae/portfolio",
  domain: "khemara.dev",
};

export const SKILLS = {
  Langages: [
    { name: "HTML", icon: "/icons/html.svg" },
    { name: "CSS", icon: "/icons/css.svg" },
    { name: "JavaScript", icon: "/icons/javascript.svg" },
    { name: "Kotlin", icon: "/icons/kotlin.svg" },
    { name: "Python", icon: "/icons/python.svg" },
    { name: "SQL", icon: "/icons/sql.svg" },
  ],
  Outils: [
    { name: "Git", icon: "/icons/git.svg" },
    { name: "SQL Developer", icon: "/icons/sqldeveloper.svg" },
    { name: "VS Code", icon: "/icons/vscode.svg" },
    { name: "IntelliJ IDEA", icon: "/icons/intellij.svg" },
  ],
};

export interface AppMeta {
  id: AppId;
  name: string;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  resizable?: boolean;
  /** Initial position (virtual pixels); otherwise cascaded. */
  x?: number;
  y?: number;
}

export const APPS: Record<AppId, AppMeta> = {
  finder: { id: "finder", name: "Finder", w: 780, h: 470, minW: 520, minH: 300 },
  safari: { id: "safari", name: "Safari", w: 960, h: 620, minW: 560, minH: 360 },
  notes: { id: "notes", name: "Notes", w: 800, h: 520, minW: 560, minH: 320, x: 150, y: 70 },
  preview: { id: "preview", name: "Aperçu", w: 540, h: 690, minW: 360, minH: 360 },
  mail: { id: "mail", name: "Mail", w: 620, h: 470, minW: 440, minH: 340 },
  terminal: { id: "terminal", name: "Terminal", w: 660, h: 410, minW: 400, minH: 220 },
  activity: { id: "activity", name: "Moniteur d'activité", w: 840, h: 400, minW: 560, minH: 300 },
  about: { id: "about", name: "À propos de ce Mac", w: 330, h: 450, resizable: false },
};

/** Apps in the Dock, in order. */
export const DOCK: AppId[] = ["finder", "safari", "notes", "preview", "mail", "activity", "terminal"];
