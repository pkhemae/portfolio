import Link from "next/link";
import { getAllPostSlugs, getPostData } from "../../../lib/posts";
import TableOfContents from "../../../components/TableOfContents";

export async function generateStaticParams() {
    const paths = getAllPostSlugs();
    return paths.map((path) => path.params);
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    return (
        <div className="blog-page min-h-screen font-sans text-neutral-800">
            <div className="sticky top-0 z-20 h-10 flex items-center justify-between px-4 sm:px-6 bg-[#f1eee8]/80 backdrop-blur-md border-b border-neutral-200/70 font-mono text-[12px] text-neutral-500">
                <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 hover:text-[#1D2DFF] transition-colors">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1D2DFF]" />
                    khémaraOS
                </Link>
                <span className="hidden sm:block truncate px-4">~/projets/{slug}.md</span>
                <Link href="/" className="hud-btn !text-neutral-500 hover:!text-white">[← retour au bureau]</Link>
            </div>

            <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 lg:gap-16">
                    <aside className="hidden md:block">
                        <TableOfContents toc={postData.toc} />
                    </aside>

                    <div className="bg-white border border-neutral-200 rounded-[3px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] px-6 sm:px-10 py-10">
                        <header className="mb-10">
                            <p className="font-mono text-[12px] text-[#1D2DFF] mb-3">{postData.date}</p>
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">{postData.title}</h1>
                            {postData.description && <p className="mt-3 text-neutral-500">{postData.description}</p>}
                        </header>

                        <article
                            className="prose prose-neutral max-w-none os-prose
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-7 prose-p:mb-6
            prose-li:my-2
            prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-pre:text-neutral-800 prose-pre:rounded-sm prose-pre:p-4"
                            dangerouslySetInnerHTML={{ __html: postData.content }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
