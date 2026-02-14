import Link from "next/link";
import type { Post } from "./featured-post";

interface PostCardProps {
  readonly post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 transition-shadow hover:shadow-[0_16px_32px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-center bg-muted/30 px-6 py-20">
        <p className="text-xs text-muted-foreground">Cover Image</p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
            {post.category}
          </span>
          <span>{post.date}</span>
        </div>
        <h3 className="mt-3 text-lg font-medium tracking-tight group-hover:text-muted-foreground">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">{post.readTime}</p>
      </div>
    </Link>
  );
}
