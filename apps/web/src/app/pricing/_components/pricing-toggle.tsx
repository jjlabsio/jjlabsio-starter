"use client";

import { useState } from "react";
import type { BillingPeriod } from "@repo/billing/plan-config";
import { PricingCards } from "./pricing-cards";

export function PricingToggle() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-3">
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
      <PricingCards period={period} />
    </div>
  );
}
