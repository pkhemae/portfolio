import Link from "next/link";
import { getSortedPostsData } from "../lib/posts";
import GithubContributions from "../components/GithubContributions";
import { FadeIn, FadeInStagger } from "../components/FadeIn";
import CvModal from "../components/CvModal";
import CopyEmailButton from "../components/CopyEmailButton";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="max-w-xl mx-auto px-6 pt-32 pb-20 font-sans text-neutral-800 relative">
      <FadeInStagger>
        <FadeIn>
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-2">Khémara Parc</h1>
            <p className="text-neutral-500 text-lg sm:text-xl">Bonjour 👋</p>
          </header>
        </FadeIn>

        <FadeIn>
          <section className="mb-12 space-y-6 text-base leading-relaxed">
            <p>
              Étudiant de 20 ans en deuxième année de BUT Informatique à{" "}
              <a
                href="https://www.univ-nantes.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline font-medium text-[#1D2DFF] group transition-colors whitespace-nowrap"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/univ-nantes.png"
                  alt="Université de Nantes"
                  className="w-4 h-4 object-contain inline-block mr-1.5 align-[-2px]"
                />
                <span className="underline underline-offset-4 decoration-[#1D2DFF]/40 group-hover:decoration-[#1D2DFF] transition-colors">
                  l&apos;Université de Nantes
                </span>
              </a>
              . Je suis passionné par les sciences et les nouvelles technologies.
            </p>
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
            <h2 className="text-neutral-400 text-sm mb-2 font-medium">Mes projets</h2>
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
            <h2 className="text-neutral-400 text-sm mb-4 font-medium">Mes contributions GitHub</h2>
            <GithubContributions />
          </section>
        </FadeIn>

        <FadeIn>
          <section className="mb-12">
            <h2 className="text-neutral-400 text-sm mb-4 font-medium">Compétences</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xs text-neutral-400 mb-2 font-medium">Langages</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "HTML", icon: "/icons/html.svg" },
                    { name: "CSS", icon: "/icons/css.svg" },
                    { name: "JavaScript", icon: "/icons/javascript.svg" },
                    { name: "Kotlin", icon: "/icons/kotlin.svg" },
                    { name: "Python", icon: "/icons/python.svg" },
                    { name: "SQL", icon: "/icons/sql.svg" },
                  ].map((skill) => (
                    <div
                      key={skill.name}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded border border-neutral-200/80 bg-neutral-50/50 text-xs text-neutral-700 hover:border-neutral-300 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={skill.icon} alt={skill.name} className="w-4 h-4 object-contain" />
                      <span>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-neutral-400 mb-2 font-medium">Outils</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Git", icon: "/icons/git.svg" },
                    { name: "SQLDeveloper", icon: "/icons/sqldeveloper.svg" },
                    { name: "VSCode", icon: "/icons/vscode.svg" },
                    { name: "IntelliJ", icon: "/icons/intellij.svg" },
                  ].map((skill) => (
                    <div
                      key={skill.name}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded border border-neutral-200/80 bg-neutral-50/50 text-xs text-neutral-700 hover:border-neutral-300 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={skill.icon} alt={skill.name} className="w-4 h-4 object-contain" />
                      <span>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>


        <FadeIn>
          <footer className="mt-20 flex flex-col items-center justify-center gap-2 text-sm text-neutral-400">
            <div className="flex items-center gap-1.5">
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
            </div>
            <a
              href="https://github.com/pkhemae/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors duration-150 hover:underline underline-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Accéder au code source</span>
            </a>
          </footer>
        </FadeIn>
      </FadeInStagger>
    </main>
  );
}
