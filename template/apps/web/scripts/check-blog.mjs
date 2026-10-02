import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";

const origin = "http://localhost:4000";
const listing = await fetch(`${origin}/blog`);
assert.equal(listing.status, 200);
const html = await listing.text();
assert(!html.includes("min read"));
for (const file of readdirSync("content/blog").filter((name) => name.endsWith(".md") && name !== "README.md")) {
  const { data } = matter(readFileSync(`content/blog/${file}`, "utf8"));
  const slug = file.slice(0, -3);
  assert(html.includes(`/blog/${slug}`));
  assert(data.description && data.cover && data.coverAlt);
  const response = await fetch(`${origin}/blog/${slug}`);
  assert.equal(response.status, 200);
  const article = await response.text();
  assert(article.includes("og:type"));
  assert(article.includes("article"));
  assert(article.includes("/images/blog-placeholder.svg"));
}
assert.equal((await fetch(`${origin}/blog/not-a-real-post`)).status, 404);
console.log("Blog listing, Markdown detail routes, metadata and 404 passed.");
