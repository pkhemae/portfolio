import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
    slug: string;
    title: string;
    date: string;
    description: string;
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
            ...(matterResult.data as { title: string; date: string; description: string }),
        };
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
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

// Simple slugger to match rehype-slug default behavior
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function getPostData(slug: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Extract headings for TOC
    const toc: { id: string; title: string; level: number }[] = [];
    const lines = matterResult.content.split("\n");
    lines.forEach((line) => {
        const match = line.match(/^(#{2,3})\s+(.*)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];
            const id = slugify(title);
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
        ...(matterResult.data as { title: string; date: string; description: string }),
    };
}
