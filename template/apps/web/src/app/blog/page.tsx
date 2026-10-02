import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingPageHeading } from "@/components/marketing-page-heading";
import { getPosts } from "@/lib/blog";
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
      <MarketingPageHeading
        title="Blog"
        description="Insights on product development, engineering, and building better teams."
      />
      <PostGrid posts={getPosts().map((post) => ({ ...post, body: undefined }))} />
      <Footer />
    </div>
  );
}
