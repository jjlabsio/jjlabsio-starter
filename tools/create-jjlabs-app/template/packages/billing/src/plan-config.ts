export type PlanTier = "starter" | "pro";
export type BillingPeriod = "monthly" | "yearly";

export interface PeriodPricing {
  price: number;
  formattedPrice: string;
  period: string;
  savings?: string;
  badge?: string;
}

export interface TierConfig {
  id: PlanTier;
  name: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
  monthly: PeriodPricing;
  yearly: PeriodPricing;
}

export const TIERS = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and small teams.",
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "3 team members",
      "Email support",
      "10GB storage",
    ],
    highlighted: false,
    monthly: { price: 19, formattedPrice: "$19", period: "/ month" },
    yearly: {
      price: 190,
      formattedPrice: "$190",
      period: "/ year",
      savings: "Save 17%",
      badge: "Save 17%",
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Unlimited team members",
      "Priority support",
      "100GB storage",
      "Custom workflows",
      "API access",
    ],
    highlighted: true,
    monthly: { price: 49, formattedPrice: "$49", period: "/ month" },
    yearly: {
      price: 490,
      formattedPrice: "$490",
      period: "/ year",
      savings: "Save 17%",
      badge: "Best Value",
    },
  },
] as const satisfies readonly TierConfig[];
