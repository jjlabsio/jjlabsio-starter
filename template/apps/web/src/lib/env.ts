import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY: z.string().min(1),
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY: z.string().min(1),
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY: z.string().min(1),
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

export const PRODUCT_IDS = {
  starter: {
    monthly: env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY,
    yearly: env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY,
  },
  pro: {
    monthly: env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY,
    yearly: env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY,
  },
} as const;
