import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  category: z.string().min(1),
  author: z.string().min(1),
  cover: z.string().startsWith("/images/"),
  coverAlt: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
});
export type BlogPost = z.infer<typeof schema> & { slug: string; body: string };
export function getPosts(): BlogPost[] {
  const directory = path.join(process.cwd(), "content/blog");
  return readdirSync(directory).filter((file) => /^[a-z0-9-]+\.md$/.test(file)).map((file) => {
    const { data, content } = matter(readFileSync(path.join(directory, file), "utf8"));
    return { ...schema.parse(data), slug: file.replace(/\.md$/, ""), body: content };
  }).sort((a, b) => b.date.localeCompare(a.date));
}
export function getPost(slug: string) {
  return getPosts().find((post) => post.slug === slug);
}
