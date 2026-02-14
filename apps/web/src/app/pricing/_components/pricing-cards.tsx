import type { Plan } from "./pricing-card";
import { PricingCard } from "./pricing-card";

const PLANS: readonly Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals and small projects getting started.",
    cta: "Get Started",
    ctaVariant: "outline",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "1 team member",
      "Community support",
      "1GB storage",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams that need more power and flexibility.",
    cta: "Start Free Trial",
    ctaVariant: "default",
    highlighted: true,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Up to 20 team members",
      "Priority support",
      "100GB storage",
      "Custom workflows",
      "API access",
      "SSO authentication",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with advanced security needs.",
    cta: "Talk to Sales",
    ctaVariant: "outline",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "SOC 2 compliance",
      "On-premise deployment",
      "Advanced access control",
    ],
  },
];

export function PricingCards() {
  return (
    <section className="pb-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </section>
  );
}
