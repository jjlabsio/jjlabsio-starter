import { Star } from "lucide-react";

const BRANDS = [
  "Vercel",
  "Stripe",
  "Linear",
  "Notion",
  "Figma",
  "Shopify",
] as const;

export function SocialProof() {
  return (
    <section className="border-y border-border/30 bg-muted/40 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-neutral-800 text-neutral-800 dark:fill-neutral-200 dark:text-neutral-200"
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              4.9/5 from 2,000+ reviews
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {BRANDS.map((brand) => (
              <span
                key={brand}
                className="text-lg font-semibold text-muted-foreground/50"
              >
                {brand}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Trusted by 1,000+ companies worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
