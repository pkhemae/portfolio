import Link from "next/link";
import { getSortedPostsData } from "../lib/posts";

export default function Home() {
  const allPostsData = getSortedPostsData();
  return (
    <main className="max-w-xl mx-auto px-6 py-20 font-sans text-neutral-800">
      <header className="mb-12">
        <h1 className="text-lg font-medium mb-1">Khémara Parc</h1>
        <p className="text-neutral-500 text-sm">Bonjour 👋</p>
      </header>

      <section className="mb-12 space-y-6 text-base leading-relaxed">
        <p>Etudiant de 20 ans en première année de BUT Informatique à l'Université de Nantes. Passionné par les sciences et les nouvelles technologies, vous trouverez sur cette page mes projets.</p>
        <p>
          Vous pouvez également découvrir mon travail sur {" "}
          <Link
            href="https://github.com/pkhemae"
            className="underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-800 transition-colors"
          >
            Github
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-neutral-400 text-sm mb-2 font-medium">Articles</h2>
        <div className="space-y">
          {allPostsData.map(({ slug, date, title }) => (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              className="flex justify-between items-baseline group p-4 -mx-4 rounded-lg hover:bg-neutral-100 transition-colors block"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{title}</span>
              </div>
              <span className="text-neutral-400 text-sm tabular-nums">
                {date}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main >
  );
}