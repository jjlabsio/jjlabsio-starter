import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

const runtimeEnv = {
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  DIRECT_URL: process.env.DIRECT_URL || undefined,
};

export const env = process.env.SKIP_ENV_VALIDATION
  ? {
      DATABASE_URL:
        runtimeEnv.DATABASE_URL ??
        "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      DIRECT_URL: runtimeEnv.DIRECT_URL,
    }
  : envSchema.parse(runtimeEnv);
