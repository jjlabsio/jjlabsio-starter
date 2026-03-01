import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BlogHero } from "./_components/blog-hero";
import { CategoryFilter } from "./_components/category-filter";
import { PostGrid } from "./_components/post-grid";

export const metadata: Metadata = {
  title: "Blog - Acme",
  description:
    "Insights on product development, engineering, and building better teams.",
};

export default function BlogPage() {
  return (
    <div className="min-h-svh">
      <Header />
      <BlogHero />
      <CategoryFilter />
      <PostGrid />
      <Footer />
    </div>
  );
}
