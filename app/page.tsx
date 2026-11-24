import Link from "next/link";
import Experience from "../components/experience/Experience";
import { getAllPostsWithContent } from "../lib/posts";

export default async function Home() {
  const posts = await getAllPostsWithContent();

  return (
    <>
      {/* Plain content for search engines and screen readers. */}
      <div className="sr-only">
        <h1>Khémara Parc — portfolio</h1>
        <p>
          Étudiant de 20 ans en deuxième année de BUT Informatique à l&apos;Université de Nantes, passionné par les sciences et les
          nouvelles technologies.
        </p>
        <h2>Projets</h2>
        <ul>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`}>{p.title}</Link> — {p.description}
            </li>
          ))}
        </ul>
      </div>

      <Experience
        posts={posts.map(({ slug, title, date, description, thumbnail, content }) => ({ slug, title, date, description, thumbnail, content }))}
      />
    </>
  );
}
