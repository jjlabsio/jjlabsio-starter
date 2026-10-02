"use client";
import { useState } from "react";
import type { BillingPeriod } from "@repo/billing/plan-config";
import { BillingPeriodToggle } from "@repo/ui/components/billing-period-toggle";
import { PricingCards } from "./pricing-cards";
import { PricingComparison } from "./pricing-comparison";

export function PricingToggle() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");
  return (
    <div>
      <div className="mb-10 flex justify-center">
        <BillingPeriodToggle value={period} onChange={setPeriod} />
      </div>
      <PricingCards period={period} />
      <PricingComparison period={period} />
    </div>
  );
}
