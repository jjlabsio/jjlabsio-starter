import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

const MONTHLY_PRODUCT_ID =
  process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY ?? "";
const YEARLY_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY ?? "";

const plans = [
  {
    name: "Pro Monthly",
    price: "$XX",
    period: "/ month",
    description: "Everything you need to get started.",
    productId: MONTHLY_PRODUCT_ID,
    badge: null,
  },
  {
    name: "Pro Yearly",
    price: "$XX",
    period: "/ year",
    description: "Save XX% with annual billing.",
    productId: YEARLY_PRODUCT_ID,
    badge: "Best Value",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-24">
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Pricing
      </p>
      <h1 className="mb-4 max-w-lg text-center text-4xl leading-snug font-normal">
        Simple, transparent pricing.
      </h1>
      <p className="text-muted-foreground mb-14 max-w-sm text-center text-sm leading-relaxed">
        Start your free trial today. No credit card required.
      </p>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-card relative flex flex-col gap-6 rounded-xl border p-8"
          >
            {plan.badge && (
              <Badge className="absolute top-4 right-4">{plan.badge}</Badge>
            )}
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">
                  {plan.period}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {plan.description}
              </p>
            </div>

            <Link
              href={
                plan.productId
                  ? `/api/billing/checkout?productId=${plan.productId}`
                  : "#"
              }
              className={buttonVariants({ className: "w-full" })}
              aria-disabled={!plan.productId}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-xs">
        Cancel anytime. Questions?{" "}
        <a href="mailto:support@example.com" className="underline">
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
