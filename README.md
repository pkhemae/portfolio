# portfolio

Source code of my personal portfolio: an interactive 3D desk built with Three.js and Next.js, with a small explorable operating system on the computer screen.

Inspired by the concept of [Henry Heffernan's portfolio](https://github.com/henryjeff/portfolio-website); all code and 3D models here are original.

![Portfolio Preview](/public/portfolio-preview.png)

## 🚀 Features

- **Bureau en 3D (Three.js)** : un bureau modélisé entièrement en code (aucun modèle à télécharger) avec ordinateur, lampe, plante, tasse de café, livres… Ombres douces, éclairage d'environnement et légère parallaxe à la souris.
- **Un vrai ordinateur à fouiller** : en cliquant sur l'écran, la caméra zoome et l'on interagit avec *khémaraOS*, un petit système d'exploitation en React rendu directement sur l'écran via `CSS3DRenderer` (fenêtres déplaçables et redimensionnables, dock, menu, horloge).
- **Applications** : À propos, Projets (articles Markdown), CV, Compétences, Activité GitHub, Contact et un Terminal (`help`, `ls`, `cat`, `open`, `lampe`…).
- **Mode nuit** : cliquer sur la lampe (ou `[nuit]`, ou `lampe` dans le terminal) éteint la pièce et allume la lampe.
- **Sons synthétisés** (Web Audio) : clics, frappes clavier, carillon de démarrage et ambiance, sans aucun fichier audio.
- **Mobile** : sur petit écran, l'ordinateur s'ouvre en plein écran avec une mise en page adaptée.
- **Accessible et indexable** : contenu texte caché pour les lecteurs d'écran et les moteurs de recherche, pages d'articles statiques (`/blog/[slug]`), repli 2D si WebGL n'est pas disponible, respect de `prefers-reduced-motion`.

## 🛠️ Tech Stack

- **Framework** : [Next.js](https://nextjs.org/) (React 19, App Router, SSG)
- **3D** : [Three.js](https://threejs.org/) (WebGL + CSS3DRenderer)
- **Styles** : [Tailwind CSS](https://tailwindcss.com/)
- **Typographie** : Inter & Geist Mono
- **Langage** : [TypeScript](https://www.typescriptlang.org/)

## 🏗️ Project Structure

- `/app` : routes, layout et styles globaux.
- `/lib/scene` : la scène Three.js (`DeskScene`), les modèles procéduraux, les textures générées et les animations de caméra.
- `/lib/sound.ts` : petit moteur audio synthétisé.
- `/components/experience` : intégration React de la scène (écran de chargement, HUD).
- `/components/os` : *khémaraOS* (bureau, fenêtres, applications).
- `/content` : articles et projets en Markdown.
- `/public` : icônes, images et CV.

## 💻 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/pkhemae/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

MIT © [Khémara Parc](https://github.com/pkhemae)
