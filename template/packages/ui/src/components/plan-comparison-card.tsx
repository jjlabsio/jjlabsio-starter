import React, { type ReactNode } from "react";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";
import {
  IconCheck,
  IconMinus,
  IconFolder,
  IconUsers,
  IconDatabase,
} from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";

const features = [
  {
    label: "Basic analytics",
    includes: ["Basic analytics", "Advanced analytics"],
  },
  { label: "Advanced analytics", includes: ["Advanced analytics"] },
  { label: "Email support", includes: ["Email support", "Priority support"] },
  { label: "Priority support", includes: ["Priority support"] },
  { label: "Custom workflows", includes: ["Custom workflows"] },
  { label: "API access", includes: ["API access"] },
];

export function PlanComparisonCard({
  tier,
  period,
  children,
}: {
  tier: TierConfig;
  period: BillingPeriod;
  children: ReactNode;
}) {
  const pricing = tier[period];
  return (
    <Card variant="pricing" className="min-w-0">
      <CardHeader>
        <CardTitle>{tier.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
          <p className="flex items-baseline gap-1">
            <span className="type-ui-title-lg">{pricing.formattedPrice}</span>
            <span className="type-ui-body text-muted-foreground">
              {pricing.period}
            </span>
          </p>
          {pricing.savings && (
            <p className="shrink-0 type-ui-label text-positive">
              {pricing.savings}
            </p>
          )}
        </div>
        <dl className="space-y-3 border-t border-border pt-3">
          {[
            {
              label: "Projects",
              value: tier.limits.projects ?? "Unlimited",
              icon: IconFolder,
            },
            {
              label: "Team members",
              value: tier.limits.members ?? "Unlimited",
              icon: IconUsers,
            },
            {
              label: "Storage",
              value: `${tier.limits.storageGB} GB`,
              icon: IconDatabase,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="flex items-center gap-2 type-ui-body text-muted-foreground">
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {label}
              </dt>
              <dd className="shrink-0 type-ui-body-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {children}
        <ul className="space-y-2 border-t border-border pt-3">
          {features.map((feature) => {
            const included = feature.includes.some((name) =>
              tier.features.includes(name),
            );
            const Icon = included ? IconCheck : IconMinus;
            return (
              <li
                key={feature.label}
                className={`flex items-center gap-2 type-ui-body ${included ? "text-foreground" : "text-muted-foreground/60"}`}
              >
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {included ? "Included: " : "Not included: "}
                </span>
                {feature.label}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
