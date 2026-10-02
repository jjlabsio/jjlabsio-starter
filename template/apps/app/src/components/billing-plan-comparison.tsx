"use client";
import { useState } from "react";
import {
  TIERS,
  PRODUCT_IDS,
  type BillingPeriod,
} from "@repo/billing/plan-config";
import { BillingAction } from "./billing-action";
import { PlanComparisonCard } from "./plan-comparison-card";
import { BillingPeriodToggle } from "./billing-period-toggle";
export function BillingPlanComparison() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");
  return (
    <section aria-labelledby="plan-comparison-heading" className="ui-section-stack">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="ui-section-heading">
          <h2 id="plan-comparison-heading" className="ui-section-title">
            Available plans
          </h2>
          <p className="ui-section-description">
            Choose the plan that fits your workspace.
          </p>
        </div>
        <BillingPeriodToggle value={period} onChange={setPeriod} />
      </div>
      <div className="grid gap-(--layout-panel-gap) xl:grid-cols-3">
        {TIERS.map((tier) => (
          <PlanComparisonCard key={tier.id} tier={tier} period={period}>
            <BillingAction
              className="w-full"
              endpoint={`/api/billing/checkout?productId=${PRODUCT_IDS[tier.id][period]}`}
              disabled={!PRODUCT_IDS[tier.id][period]}
            >
              Subscribe to {tier.name}
            </BillingAction>
          </PlanComparisonCard>
        ))}
      </div>
    </section>
  );
}
