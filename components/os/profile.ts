import type { AppId } from "./types";

export const PROFILE = {
  name: "Khémara Parc",
  handle: "khemara",
  email: "khemara.parc@etu.univ-nantes.fr",
  github: "https://github.com/pkhemae",
  linkedin: "https://linkedin.com/in/khemaraparc",
  university: { name: "l'Université de Nantes", url: "https://www.univ-nantes.fr" },
  source: "https://github.com/pkhemae/portfolio",
};

export const SKILLS = {
  langages: [
    { name: "HTML", icon: "/icons/html.svg" },
    { name: "CSS", icon: "/icons/css.svg" },
    { name: "JavaScript", icon: "/icons/javascript.svg" },
    { name: "Kotlin", icon: "/icons/kotlin.svg" },
    { name: "Python", icon: "/icons/python.svg" },
    { name: "SQL", icon: "/icons/sql.svg" },
  ],
  outils: [
    { name: "Git", icon: "/icons/git.svg" },
    { name: "SQLDeveloper", icon: "/icons/sqldeveloper.svg" },
    { name: "VSCode", icon: "/icons/vscode.svg" },
    { name: "IntelliJ", icon: "/icons/intellij.svg" },
  ],
};

export interface AppMeta {
  id: AppId;
  label: string;
  /** File-like name shown under the desktop icon. */
  file: string;
  w: number;
  h: number;
}

export const APPS: AppMeta[] = [
  { id: "about", label: "À propos", file: "a-propos.txt", w: 560, h: 470 },
  { id: "projects", label: "Projets", file: "projets/", w: 640, h: 470 },
  { id: "cv", label: "CV", file: "cv.pdf", w: 460, h: 600 },
  { id: "skills", label: "Compétences", file: "competences/", w: 520, h: 380 },
  { id: "github", label: "Activité GitHub", file: "commits.log", w: 760, h: 330 },
  { id: "contact", label: "Contact", file: "contact.vcf", w: 440, h: 340 },
  { id: "terminal", label: "Terminal", file: "terminal", w: 620, h: 400 },
];

export const appMeta = (id: AppId) => APPS.find((a) => a.id === id);
