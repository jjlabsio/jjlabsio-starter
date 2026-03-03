"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { IconCheck } from "@tabler/icons-react";
import { TIERS } from "@repo/billing/plan-config";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";

const PRODUCT_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY ?? "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY ?? "",
  },
} as const;

function PlanCard({
  tier,
  period,
}: {
  tier: TierConfig;
  period: BillingPeriod;
}) {
  const pricing = tier[period];
  const productId = PRODUCT_IDS[tier.id][period];

  return (
    <div className="bg-card relative flex flex-col gap-6 rounded-xl border p-8">
      {pricing.badge && (
        <Badge className="absolute top-4 right-4">{pricing.badge}</Badge>
      )}
      <div>
        <p className="text-muted-foreground mb-1 text-sm font-medium">
          {tier.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold">
            {pricing.formattedPrice}
          </span>
          <span className="text-muted-foreground text-sm">
            {pricing.period}
          </span>
        </div>
        {pricing.savings && (
          <span className="mt-1 inline-block text-xs font-medium text-green-600">
            {pricing.savings}
          </span>
        )}
        <p className="text-muted-foreground mt-2 text-sm">{tier.description}</p>
      </div>

      {productId ? (
        <Link
          href={`/api/billing/checkout?productId=${productId}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Get Started
        </Link>
      ) : (
        <button disabled className={buttonVariants({ className: "w-full" })}>
          Get Started
        </button>
      )}

      <ul className="flex flex-col gap-2">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="text-muted-foreground flex items-start gap-2 text-sm"
          >
            <IconCheck className="mt-0.5 size-4 shrink-0 text-foreground/60" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-24">
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Pricing
      </p>
      <h1 className="mb-4 max-w-lg text-center text-4xl leading-snug font-normal">
        Simple, transparent pricing.
      </h1>
      <p className="text-muted-foreground mb-10 max-w-sm text-center text-sm leading-relaxed">
        Choose the plan that fits your needs. Cancel anytime.
      </p>

      <div className="mb-10 flex items-center gap-2 rounded-full border p-1">
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "monthly"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod("yearly")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "yearly"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <PlanCard key={tier.id} tier={tier} period={period} />
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-xs">
        Cancel anytime. Questions?{" "}
        <a href="mailto:support@example.com" className="underline">
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
