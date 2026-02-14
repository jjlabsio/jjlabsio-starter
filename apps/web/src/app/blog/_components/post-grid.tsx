import type { Post } from "./featured-post";
import { FeaturedPost } from "./featured-post";
import { PostCard } from "./post-card";

const POSTS: readonly Post[] = [
  {
    slug: "introducing-acme-v2",
    title: "Introducing Acme v2: A New Era of Product Development",
    excerpt:
      "We are excited to announce the next generation of Acme with AI-powered workflows, real-time collaboration, and a completely redesigned experience.",
    category: "Product",
    date: "Jan 15, 2025",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "scaling-to-one-million-users",
    title: "How We Scaled to One Million Users",
    excerpt:
      "A deep dive into the architecture decisions, infrastructure changes, and engineering practices that helped us reach this milestone.",
    category: "Engineering",
    date: "Jan 8, 2025",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "design-system-principles",
    title: "Building a Design System That Scales",
    excerpt:
      "The principles and patterns behind our design system, and how it enables our team to ship consistent experiences faster.",
    category: "Design",
    date: "Dec 20, 2024",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "ai-powered-workflows",
    title: "The Future of AI-Powered Workflows",
    excerpt:
      "How we are integrating AI throughout the product to help teams automate repetitive tasks and focus on creative work.",
    category: "Product",
    date: "Dec 12, 2024",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "engineering-culture",
    title: "Our Engineering Culture: Ship Fast, Stay Curious",
    excerpt:
      "A look inside how our engineering team operates, from daily rituals to the values that guide our technical decisions.",
    category: "Company",
    date: "Dec 5, 2024",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "real-time-collaboration",
    title: "Building Real-Time Collaboration From Scratch",
    excerpt:
      "The technical challenges of building a multiplayer editing experience with conflict resolution and instant syncing.",
    category: "Engineering",
    date: "Nov 28, 2024",
    readTime: "10 min read",
    featured: false,
  },
];

export function PostGrid() {
  const featuredPost = POSTS.find((p) => p.featured);
  const otherPosts = POSTS.filter((p) => !p.featured);

  return (
    <>
      {featuredPost && (
        <section className="pb-12">
          <div className="mx-auto max-w-6xl px-6">
            <FeaturedPost post={featuredPost} />
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
