export type PlanTier = "starter" | "pro" | "premium";
export type BillingPeriod = "monthly" | "yearly";

export const PRODUCT_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY ?? "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY ?? "",
  },
  premium: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY ?? "",
  },
} as const;

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
  limits: {
    projects: number | null;
    members: number | null;
    storageGB: number;
  };
  highlighted?: boolean;
  monthly: PeriodPricing;
  yearly: PeriodPricing;
}

export const TIERS = [
  {
    id: "starter",
    limits: { projects: 5, members: 3, storageGB: 10 },
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
      savings: "Save $38",
      badge: "Save $38",
    },
  },
  {
    id: "pro",
    limits: { projects: 20, members: 10, storageGB: 50 },
    name: "Pro",
    description: "For teams building their next stage of growth.",
    features: [
      "Up to 20 projects",
      "Advanced analytics",
      "10 team members",
      "Email support",
      "50GB storage",
    ],
    highlighted: false,
    monthly: { price: 29, formattedPrice: "$29", period: "/ month" },
    yearly: {
      price: 290,
      formattedPrice: "$290",
      period: "/ year",
      savings: "Save $58",
      badge: "Save $58",
    },
  },
  {
    id: "premium",
    limits: { projects: null, members: null, storageGB: 100 },
    name: "Premium",
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
      savings: "Save $98",
      badge: "Best Value",
    },
  },
] as const satisfies readonly TierConfig[];

export function getPlanByProductId(
  productId: string | null | undefined,
  productIds = PRODUCT_IDS,
) {
  if (!productId) return null;
  return (
    TIERS.find((tier) =>
      Object.values(productIds[tier.id]).includes(productId),
    ) ?? null
  );
}
