export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const PRODUCT_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY ?? "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY ?? "",
  },
} as const;
