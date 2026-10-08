# portfolio

Source code of my personal portfolio, built with Next.js and Tailwind CSS.

![Portfolio Preview](/public/portfolio-preview.png)

## 🚀 Features

- **Performance**: Built with Next.js App Router. Project and article pages are statically generated (SSG) for fast loading times.
- **Minimalist Design & Clean Typography**: Styled with Tailwind CSS and Inter for clean readability, accented with subtle interactions.
- **Interactive CV Modal**: Preview resume directly on the site with an embedded viewer and direct download option.
- **GitHub Contribution Graph**: Dynamic commit activity visualizer powered by `mdxcn`.
- **Skills & Tech Stack**: Highlighted languages and tools with colored vector icons.
- **Smooth Animations**: Page transitions and modal dialogs powered by Framer Motion.
- **Markdown Content**: Articles and project write-ups written in Markdown, parsed with `gray-matter` and `remark`.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏗️ Project Structure

- `/app`: Application routes, layout, and global styling.
- `/components`: Reusable UI components (CV modal, GitHub activity graph, email copy button, animations).
- `/content`: Markdown files for posts and projects.
- `/lib`: Helper utilities to parse and load Markdown content.
- `/public`: Static assets including icons, images, and resume files.

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
