import Link from "next/link";
import { getSortedPostsData } from "../lib/posts";
import GithubContributions from "../components/GithubContributions";
import { FadeIn, FadeInStagger } from "../components/FadeIn";
import CvModal from "../components/CvModal";
import CopyEmailButton from "../components/CopyEmailButton";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="max-w-xl mx-auto px-6 pt-32 pb-20 font-mono text-neutral-800 relative">
      <FadeInStagger>
        <FadeIn>
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-2">Khémara Parc</h1>
            <p className="text-neutral-500 text-lg sm:text-xl">Bonjour 👋</p>
          </header>
        </FadeIn>

        <FadeIn>
          <section className="mb-12 space-y-6 text-base leading-relaxed">
            <p>Étudiant de 20 ans en deuxième année de BUT Informatique à l&apos;Université de Nantes. Je suis passionné par les sciences et les nouvelles technologies.</p>
            <p>Sur ce site, vous trouverez mes expérimentations ainsi que les différents projets sur lesquels j&apos;ai travaillé durant mon parcours.</p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-2">
              <CvModal />
              <CopyEmailButton />
              <a
                href="https://github.com/pkhemae"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                aria-label="Profil GitHub"
                className="bracket-btn text-sm text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 rounded transition-colors duration-150"
              >
                [GitHub]
              </a>
              <a
                href="https://linkedin.com/in/khemaraparc"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="Profil LinkedIn"
                className="bracket-btn text-sm text-neutral-500 hover:bg-[#1D2DFF] hover:text-white px-1.5 py-0.5 rounded transition-colors duration-150"
              >
                [LinkedIn]
              </a>
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="mb-12">
            <h2 className="text-neutral-400 text-sm mb-2 font-medium">Projets académiques & publications</h2>
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </FadeIn>

        <FadeIn>
          <section className="mb-12">
            <h2 className="text-neutral-400 text-sm mb-4 font-medium">Mes contributions</h2>
            <GithubContributions />
          </section>
        </FadeIn>


        <FadeIn>
          <footer className="mt-20 flex justify-center items-center gap-1.5 text-sm text-neutral-400">
            <span>Développé avec</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-red-500"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>par Khémara Parc.</span>
          </footer>
        </FadeIn>
      </FadeInStagger>
    </main>
  );
}
