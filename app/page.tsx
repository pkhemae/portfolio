import Link from "next/link";
import { getSortedPostsData } from "../lib/posts";
import GithubContributions from "../components/GithubContributions";

export default function Home() {
  const allPostsData = getSortedPostsData();
  return (
    <main className="max-w-xl mx-auto px-6 py-20 font-sans text-neutral-800">
      <header className="mb-12">
        <h1 className="text-lg font-medium mb-1">Khémara Parc</h1>
        <p className="text-neutral-500 text-sm">Bonjour 👋</p>
      </header>

      <section className="mb-12 space-y-6 text-base leading-relaxed">
        <p>Étudiant de 20 ans en première année de BUT Informatique à l&apos;Université de Nantes. Passionné par les sciences et les nouvelles technologies, vous trouverez mes projets sur cette page.</p>
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
        <div>
          <a
            href="#"
            target="_blank"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Télécharger mon CV
          </a>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-neutral-400 text-sm mb-2 font-medium">Publications</h2>
        <div className="space-y">
          {allPostsData.map(({ slug, date, title, thumbnail }) => (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {thumbnail && (
                  <div className="relative w-10 h-6 shrink-0 rounded overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img
                      src={thumbnail}
                      alt={title}
                      className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
                <span className="font-medium group-hover:text-neutral-900 transition-colors">{title}</span>
              </div>
              <span className="text-neutral-400 text-sm tabular-nums shrink-0">{date}</span>
            </Link>
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-neutral-400 text-sm mb-4 font-medium">Mes contributions</h2>
        <GithubContributions />
      </section>

      <section>
        <h2 className="text-neutral-400 text-sm mb-2 font-medium">Liens externes</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/pkhemae"
            target="_blank"
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors w-fit group"
          >
            <span>Github</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/khemaraparc"
            target="_blank"
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors w-fit group"
          >
            <span>LinkedIn</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
          <a
            href="mailto:khemara.parc@etu.univ-nantes.fr"
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors w-fit group"
          >
            <span>Email</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      </section>
    </main >
  );
}