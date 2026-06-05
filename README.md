# portfolio

Code source de mon portfolio personnel, développé avec Next.js et Tailwind CSS.

![Aperçu du portfolio](/public/portfolio-preview.png)

## 🚀 Fonctionnalités

- **Performances** : Créé avec le App Router de Next.js. Les pages des projets sont générées statiquement (SSG) pour un chargement rapide.
- **Animations** : Utilisation de la librairie Framer Motion pour les transitions de page et les modales.
- **Contenu Markdown** : Les projets et les articles sont écrits en fichiers Markdown, parsés avec `gray-matter` et `remark`.
- **Prévisualisation CV** : Le CV s'affiche directement sur le site dans une fenêtre modale avec un bouton de téléchargement.

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (React)
- **Style** : [Tailwind CSS](https://tailwindcss.com/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)

## 🏗️ Structure du projet

- `/app` : Les pages principales du site.
- `/components` : Les composants React (Navbar, modales, etc).
- `/content` : Les dossiers `/posts` et `/projects` avec les fichiers `.md`.
- `/lib` : Les scripts pour lire et récupérer le contenu des fichiers Markdown.
- `/public` : Les images et fichiers statiques (comme le CV en PDF).

## 💻 Lancer le projet

1. Cloner le projet :
```bash
git clone https://github.com/pkhemae/portfolio.git
cd portfolio
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.
