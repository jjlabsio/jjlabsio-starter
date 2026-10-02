import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TIERS } from "@repo/billing/plan-config";
import { PlanComparisonCard } from "./plan-comparison-card";

describe("shared plan comparison", () => {
  it("uses the selected billing period and the same comparison rows for every tier", () => {
    for (const tier of TIERS) {
      for (const period of ["monthly", "yearly"] as const) {
        const html = renderToStaticMarkup(
          <PlanComparisonCard tier={tier} period={period}>
            <button>Choose plan</button>
          </PlanComparisonCard>,
        );
        expect(html).toContain(tier[period].formattedPrice);
        expect(html).toContain(tier[period].period);
        for (const label of [
          "Projects",
          "Team members",
          "Storage",
          "Basic analytics",
          "Advanced analytics",
          "Email support",
          "Priority support",
          "Custom workflows",
          "API access",
        ]) {
          expect(html).toContain(label);
        }
        expect(html).toContain(
          tier.id === "premium" ? "Included: " : "Not included: ",
        );
      }
    }
  });
});
