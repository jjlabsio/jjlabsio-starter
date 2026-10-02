"use client";

import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { env } from "@/lib/env";

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
            href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
            className={buttonVariants({
              size: "lg",
            })}
          >
            Start for free
          </Link>
        </div>
      </div>
    </section>
  );
}
