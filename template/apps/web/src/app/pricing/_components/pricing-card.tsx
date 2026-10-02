import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { PlanComparisonCard } from "@repo/ui/components/plan-comparison-card";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";

export function PricingCard({
  tier,
  period,
  href,
}: {
  readonly tier: TierConfig;
  readonly period: BillingPeriod;
  readonly href: string;
}) {
  return (
    <PlanComparisonCard tier={tier} period={period}>
      <Link href={href} className={buttonVariants({ className: "w-full" })}>
        Subscribe to {tier.name}
      </Link>
    </PlanComparisonCard>
  );
}
