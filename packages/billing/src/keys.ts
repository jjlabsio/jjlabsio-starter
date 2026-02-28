import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_ORGANIZATION_ID: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY: z.string().min(1),
    NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY: z.string().min(1),
  },
  runtimeEnv: {
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY,
    NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY:
      process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
