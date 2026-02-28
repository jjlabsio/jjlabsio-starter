"use client";

import type { BillingPeriod } from "@repo/billing/plan-config";
import { TIERS } from "@repo/billing/plan-config";
import { APP_URL } from "@/lib/env";
import { PricingCard } from "./pricing-card";

interface PricingCardsProps {
  period: BillingPeriod;
}

export function PricingCards({ period }: PricingCardsProps) {
  return (
    <section className="pb-24">
      <div className="mx-auto grid max-w-4xl gap-8 px-6 md:grid-cols-2">
        {TIERS.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            period={period}
            href={`${APP_URL}/pricing`}
          />
        ))}
      </div>
    </section>
  );
}
