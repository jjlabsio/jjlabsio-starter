"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import type { BlogPost } from "@/lib/blog";

export function PostGrid({ posts }: { posts: Omit<BlogPost, "body">[] }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(posts.map((post) => post.category))];
  return <section className="mx-auto max-w-7xl px-6 pb-24">
    <div aria-label="Blog categories" className="mb-10 flex flex-wrap gap-2 border-b border-border pb-6">
      {categories.map((item) => <Button key={item} variant={category === item ? "secondary" : "ghost"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}
    </div>
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {posts.filter((post) => category === "All" || post.category === category).map((post) => <article key={post.slug}>
        <Link href={`/blog/${post.slug}`} className="group block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <Image src={post.cover} alt={post.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-opacity group-hover:opacity-80" />
          </div>
          <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground"><span>{post.category}</span><span aria-hidden="true">·</span><time dateTime={post.date}>{new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></div>
          <h2 className="mt-3 line-clamp-2 h-14 text-xl leading-7 font-medium tracking-tight group-hover:underline underline-offset-4">{post.title}</h2>
          <p className="mt-3 line-clamp-3 h-[4.5rem] text-base leading-6 text-muted-foreground">{post.description}</p>
        </Link>
      </article>)}
    </div>
  </section>;
}
