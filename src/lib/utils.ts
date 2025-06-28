import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { promises as fs } from 'fs';
import path from 'path';
import grayMatter from 'gray-matter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseURL() {
// ... existing code ...
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

async function getMdxFiles(dir: string) {
    const fullPath = path.join(process.cwd(), dir);
    const files = await fs.readdir(fullPath);
    return files.filter((file) => path.extname(file) === '.mdx');
}

async function readMdxFile(filePath: string) {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = grayMatter(rawContent);
    return { data, content, slug: path.basename(filePath, path.extname(filePath)) };
}

export async function getAllContent(dir: string) {
    const files = await getMdxFiles(dir);
    const fullPath = path.join(process.cwd(), dir);
    const posts = await Promise.all(
        files.map((file) => readMdxFile(path.join(fullPath, file)))
    );
    return posts
        .map((post): any => ({ ...post.data, slug: post.slug }))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
} 