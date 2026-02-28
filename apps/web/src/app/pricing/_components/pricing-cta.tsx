"use client";

import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { APP_URL } from "@/lib/env";

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
          <Link
            href={`${APP_URL}/pricing`}
            className={buttonVariants({
              className: "rounded-full px-8 py-6 text-base",
              size: "lg",
            })}
          >
            Get Started
          </Link>
          <Link
            href="/pricing"
            className={buttonVariants({
              variant: "outline",
              className: "rounded-full px-8 py-6 text-base",
              size: "lg",
            })}
          >
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
