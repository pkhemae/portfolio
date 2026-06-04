import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export interface Project {
    id: string;
    title: string;
    shortDescription: string;
    tags: string[];
    rotation: number;
    color: string;
    link: string;
    github: string;
    contentHtml: string;
}

export async function getProjectsData(): Promise<Project[]> {
    if (!fs.existsSync(projectsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(projectsDirectory);
    
    const allProjectsData = await Promise.all(
        fileNames.filter(fileName => fileName.endsWith(".md")).map(async (fileName) => {
            const id = fileName.replace(/\.md$/, "");
            const fullPath = path.join(projectsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");

            const matterResult = matter(fileContents);

            const processedContent = await remark()
                .use(remarkRehype)
                .use(rehypeStringify)
                .process(matterResult.content);
            const contentHtml = processedContent.toString();

            return {
                id,
                contentHtml,
                ...(matterResult.data as { 
                    title: string; 
                    shortDescription: string; 
                    tags: string[]; 
                    rotation: number; 
                    color: string; 
                    link: string; 
                    github: string; 
                }),
            };
        })
    );

    return allProjectsData;
}
