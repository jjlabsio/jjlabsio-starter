"use client";

import { useState } from "react";
import { BillingPeriodToggle } from "@/components/billing-period-toggle";
import { PlanComparisonCard } from "@/components/plan-comparison-card";
import { BillingAction } from "@/components/billing-action";
import { SUPPORT_EMAIL, SUPPORT_HREF } from "@/lib/support";
import { TIERS, PRODUCT_IDS } from "@repo/billing/plan-config";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";
import type { SubscriptionState } from "@repo/billing";

function PlanCard({
  tier,
  period,
}: {
  tier: TierConfig;
  period: BillingPeriod;
}) {
  const productId = PRODUCT_IDS[tier.id][period];
  return (
    <PlanComparisonCard tier={tier} period={period}>
      <BillingAction
        endpoint={`/api/billing/checkout?productId=${productId}`}
        disabled={!productId}
        className="w-full"
      >
        Subscribe to {tier.name}
      </BillingAction>
    </PlanComparisonCard>
  );
}

interface PricingPageProps {
  subscriptionState: SubscriptionState;
  initialPeriod?: BillingPeriod;
}

export function PricingPage({
  subscriptionState,
  initialPeriod = "yearly",
}: PricingPageProps) {
  const [period, setPeriod] = useState<BillingPeriod>(initialPeriod);

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pt-4 pb-10 sm:px-6">
      <h1 className="mt-8 mb-12 text-3xl leading-tight font-semibold tracking-tight sm:mt-12 sm:mb-16 sm:text-4xl">
        Pricing
      </h1>
      <p
        role="status"
        className="mb-8 max-w-md text-center type-ui-body text-muted-foreground"
      >
        {subscriptionState === "expired"
          ? "Your subscription has ended."
          : "You don’t have an active subscription."}{" "}
        Your workspace is unavailable. Choose a plan to restore access.
      </p>
      <div className="mb-6">
        <BillingPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="grid w-full max-w-4xl gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <PlanCard key={tier.id} tier={tier} period={period} />
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-xs">
        Cancel anytime. Questions?{" "}
        <a href={SUPPORT_HREF} className="underline" title={SUPPORT_EMAIL}>
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
