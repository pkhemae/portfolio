import Link from "next/link";
import Image from "next/image";
import { getSortedPostsData } from "../lib/posts";
import { getProjectsData } from "../lib/projects";
import GithubContributions from "../components/GithubContributions";
import ProjectsSection from "../components/ProjectsSection";
import { FadeIn, FadeInStagger } from "../components/FadeIn";

export default async function Home() {
  const allPostsData = getSortedPostsData();
  const projectsData = await getProjectsData();
  
  return (
    <>
      <div 
        className="absolute top-0 left-0 w-full h-[700px] z-[-1] opacity-[0.15] pointer-events-none" 
        style={{ 
          backgroundImage: "url('/images/nantes_map.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 10%, transparent 70%)",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 10%, transparent 70%)"
        }} 
      />
      <main className="max-w-xl mx-auto px-6 py-20 font-sans text-neutral-800 relative">
      <FadeInStagger>
      <FadeIn>
      <header className="mb-12 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-2">Khémara Parc</h1>
          <p className="text-neutral-500 text-lg sm:text-xl">Bonjour 👋</p>
        </div>
        <Image 
          src="/images/photo_upscaled.png" 
          alt="Khémara Parc" 
          width={256} 
          height={256} 
          quality={100}
          priority
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-sm border border-neutral-200/60 shrink-0 rotate-2 hover:rotate-0 hover:scale-105 hover:shadow-md transition-all duration-300" 
        />
      </header>
      </FadeIn>

      <FadeIn>
      <section className="mb-12 space-y-6 text-base leading-relaxed">
        <p>Étudiant de 20 ans en première année de BUT Informatique à l&apos;Université de Nantes. Je suis passionné par les sciences et les nouvelles technologies.</p>
        <p>Sur ce site, vous trouverez mes expérimentations ainsi que les différents projets sur lesquels j&apos;ai travaillé durant mon parcours.</p>
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
            href="/cv.pdf"
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
      </FadeIn>

      <FadeIn>
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
      <ProjectsSection projects={projectsData} />
      </FadeIn>
      
      <FadeIn>
      <section className="mb-12">
        <h2 className="text-neutral-400 text-sm mb-4 font-medium">Mes contributions</h2>
        <GithubContributions />
      </section>
      </FadeIn>

      <FadeIn>
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
    </>
  );
}