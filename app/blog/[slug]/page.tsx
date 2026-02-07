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
        <main className="max-w-5xl mx-auto px-6 py-20 font-sans text-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 lg:gap-16">
                <aside className="hidden md:block">
                    <TableOfContents toc={postData.toc} />
                </aside>

                <div>
                    <header className="mb-10">
                        <Link
                            href="/"
                            className="md:hidden flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors mb-6 text-sm"
                        >
                            <span>←</span> Index
                        </Link>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">{postData.title}</h1>
                        <p className="text-neutral-400 text-sm">{postData.date}</p>
                    </header>

                    <article
                        className="prose prose-neutral max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-7 prose-p:mb-6
            prose-a:text-neutral-900 prose-a:decoration-neutral-400 prose-a:underline-offset-4 hover:prose-a:decoration-neutral-900 hover:prose-a:decoration-2
            prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6
            prose-li:my-2
            prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-pre:text-neutral-800 prose-pre:rounded-lg prose-pre:p-4
            prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: postData.content }}
                    />

                    <div className="mt-16 pt-8 border-t border-neutral-100 md:hidden">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors text-sm"
                        >
                            <span>←</span> Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
