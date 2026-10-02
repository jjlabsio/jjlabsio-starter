import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { buttonVariants } from "@repo/ui/components/button";
import { ProductPreview } from "@/app/_components/hero";
import { env } from "@/lib/env";
import { FaqSection } from "@/components/faq-section";
import { CtaSection } from "@/app/_components/cta-section";

type Item = {
  label: string;
  description: string;
  detail: string;
  benefits: readonly string[];
};
export function MarketingDetail({
  item,
}: {
  item: Item;
  kind: "Features" | "Solutions";
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
            {item.label}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {item.detail}
          </p>
          <Link
            href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
            className={buttonVariants({ size: "lg", className: "mt-8" })}
          >
            Start for free
          </Link>
        </div>
        <div className="mt-14 md:mt-16">
          <ProductPreview />
        </div>
        <section className="py-20 md:py-24" aria-label="Capabilities">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
              A clearer way to work
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
          <div className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {item.benefits.map((benefit) => (
              <div
                key={benefit}
                className="px-6 py-8 max-md:not-last:border-b max-md:border-border"
              >
                <h3 className="mb-4 text-lg font-medium">{benefit}</h3>
                <p className="type-ui-body text-muted-foreground">
                  Example capability. Replace with your product&apos;s actual
                  workflow and supporting evidence before publishing.
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="py-20 md:py-24" aria-label="Use cases">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
              Built around your workflow
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              {
                title: "Everyday work",
                description:
                  "Describe how your team uses this in its daily workflow.",
              },
              {
                title: "Working together",
                description:
                  "Describe how this helps people coordinate and share progress.",
              },
            ].map((entry) => (
              <div
                key={entry.title}
                className="grid gap-3 px-6 py-8 md:grid-cols-[1fr_2fr] md:gap-8"
              >
                <h3 className="text-xl font-medium">{entry.title}</h3>
                <p className="type-ui-body text-muted-foreground">
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <FaqSection />
      <CtaSection />
      <Footer />
    </>
  );
}
