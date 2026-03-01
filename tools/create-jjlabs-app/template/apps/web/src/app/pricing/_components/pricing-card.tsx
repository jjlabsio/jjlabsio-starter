import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { IconCheck } from "@tabler/icons-react";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";

interface PricingCardProps {
  readonly tier: TierConfig;
  readonly period: BillingPeriod;
  readonly href: string;
}

export function PricingCard({ tier, period, href }: PricingCardProps) {
  const pricing = tier[period];

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        tier.highlighted
          ? "border-foreground/20 shadow-[0_32px_64px_rgba(0,0,0,0.06),0_10px_12px_-6px_rgba(0,0,0,0.04)]"
          : "border-border/50"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-xs font-medium text-background">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium">{tier.name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-light tracking-tight">
            {pricing.formattedPrice}
          </span>
          <span className="text-muted-foreground">{pricing.period}</span>
        </div>
        {pricing.savings && (
          <span className="mt-1 inline-block text-xs font-medium text-green-600">
            {pricing.savings}
          </span>
        )}
        <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
      </div>

      <Link
        href={href}
        className={buttonVariants({
          variant: tier.highlighted ? "default" : "outline",
          className: "w-full rounded-full",
          size: "lg",
        })}
      >
        Get Started
      </Link>

      <ul className="mt-8 flex flex-col gap-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-muted-foreground"
          >
            <IconCheck className="mt-0.5 size-4 shrink-0 text-foreground/60" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
