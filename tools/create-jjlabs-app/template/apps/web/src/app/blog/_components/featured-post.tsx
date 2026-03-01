import Link from "next/link";

export interface Post {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly date: string;
  readonly readTime: string;
  readonly featured: boolean;
}

interface FeaturedPostProps {
  readonly post: Post;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-3xl border border-border/50 transition-shadow hover:shadow-[0_32px_64px_rgba(0,0,0,0.04),0_10px_12px_-6px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-center bg-muted/30 px-8 py-32">
        <p className="text-sm text-muted-foreground">Cover Image</p>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
            {post.category}
          </span>
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
        <h2 className="mt-4 text-2xl font-light tracking-tight group-hover:text-muted-foreground md:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
      </div>
    </Link>
  );
}
