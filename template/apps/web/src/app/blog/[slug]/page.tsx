import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getPost, getPosts } from "@/lib/blog";

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.description;
  return { title, description, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title, description, images: [{ url: post.cover, alt: post.coverAlt }], publishedTime: post.date, authors: [post.author] }, twitter: { card: "summary_large_image", title, description, images: [post.cover] } };
}
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <div className="min-h-svh"><Header /><main className="mx-auto max-w-4xl px-6 pt-12 pb-24 md:pt-20">
    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">← All articles</Link>
    <div className="mt-10 flex gap-3 text-sm text-muted-foreground"><span>{post.category}</span><span aria-hidden="true">·</span><time dateTime={post.date}>{post.date}</time></div>
    <h1 className="mt-4 text-4xl leading-tight font-medium tracking-tight text-balance md:text-5xl">{post.title}</h1>
    <div className="relative mt-10 aspect-video overflow-hidden rounded-lg bg-muted"><Image src={post.cover} alt={post.coverAlt} fill sizes="(min-width: 896px) 848px, 100vw" className="object-cover" priority /></div>
    <div className="mt-12 text-base leading-8 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-xl [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-5 [&_blockquote]:text-muted-foreground [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4">
      <Markdown components={{ img: ({ src, alt }) => {
        if (typeof src !== "string" || !src.startsWith("/images/")) return null;
        return <Image src={src} alt={alt ?? ""} width={1440} height={810} sizes="(min-width: 896px) 848px, 100vw" className="my-8 aspect-video w-full rounded-lg object-cover" />;
      } }}>{post.body}</Markdown>
    </div>
  </main><Footer /></div>;
}
