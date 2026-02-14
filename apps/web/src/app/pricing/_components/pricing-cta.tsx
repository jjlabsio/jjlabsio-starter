import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export function PricingCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-4xl font-light tracking-tight md:text-5xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Join thousands of teams already building better products with Acme.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button className="rounded-full px-8 py-6 text-base" size="lg">
            Start for free
          </Button>
          <Link href="/pricing">
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 text-base"
              size="lg"
            >
              Compare plans
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
