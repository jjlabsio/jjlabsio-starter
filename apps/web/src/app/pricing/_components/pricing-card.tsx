import { Button } from "@repo/ui/components/button";
import { Check } from "lucide-react";

interface Plan {
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly description: string;
  readonly cta: string;
  readonly ctaVariant: "default" | "outline";
  readonly highlighted: boolean;
  readonly features: readonly string[];
}

interface PricingCardProps {
  readonly plan: Plan;
}

export type { Plan };

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        plan.highlighted
          ? "border-foreground/20 shadow-[0_32px_64px_rgba(0,0,0,0.06),0_10px_12px_-6px_rgba(0,0,0,0.04)]"
          : "border-border/50"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-xs font-medium text-background">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-light tracking-tight">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-muted-foreground">{plan.period}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <Button
        variant={plan.ctaVariant}
        className="w-full rounded-full"
        size="lg"
      >
        {plan.cta}
      </Button>

      <ul className="mt-8 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-foreground/60" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
