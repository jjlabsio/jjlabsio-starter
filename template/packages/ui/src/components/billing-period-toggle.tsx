"use client";
import type { BillingPeriod } from "@repo/billing/plan-config";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
export function BillingPeriodToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}) {
  return (
    <ButtonGroup variant="segmented" aria-label="Billing period">
      {(["monthly", "yearly"] as const).map((period) => (
        <Button
          key={period}
          variant="segment"
          aria-pressed={value === period}
          onClick={() => onChange(period)}
        >
          {period === "monthly" ? "Monthly" : "Yearly"}
        </Button>
      ))}
    </ButtonGroup>
  );
}
