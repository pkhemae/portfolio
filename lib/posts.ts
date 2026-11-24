import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
    slug: string;
    title: string;
    date: string;
    description: string;
    thumbnail?: string;
    content: string;
    toc: { id: string; title: string; level: number }[];
}

export function getSortedPostsData(): Omit<Post, "content" | "toc">[] {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const slug = fileName.replace(/\.md$/, "");

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            slug,
            ...(matterResult.data as { title: string; date: string; description: string; thumbnail?: string }),
        };
    });

    // Sort posts by date (dates are written as dd/mm/yyyy), newest first.
    const toKey = (d: string) => {
        const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
    };
    return allPostsData.sort((a, b) => (toKey(a.date) < toKey(b.date) ? 1 : -1));
}

/** All posts, newest first, with their rendered HTML (used by the desktop OS). */
export async function getAllPostsWithContent(): Promise<Post[]> {
    const summaries = getSortedPostsData();
    return Promise.all(summaries.map((p) => getPostData(p.slug)));
}

export function getAllPostSlugs() {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map((fileName) => {
        return {
            params: {
                slug: fileName.replace(/\.md$/, ""),
            },
        };
    });
}

export async function getPostData(slug: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Extract headings for TOC
    const slugger = new GithubSlugger();
    const toc: { id: string; title: string; level: number }[] = [];
    const lines = matterResult.content.split("\n");
    lines.forEach((line) => {
        const match = line.match(/^(#{2,3})\s+(.*)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];
            const id = slugger.slug(title);
            toc.push({ id, title, level });
        }
    });

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeStringify)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Combine the data with the id and contentHtml
    return {
        slug,
        content: contentHtml,
        toc,
        ...(matterResult.data as { title: string; date: string; description: string; thumbnail?: string }),
    };
}
