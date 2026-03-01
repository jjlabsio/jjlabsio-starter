import "server-only";

import { PrismaClient } from "@prisma/client";
import { env } from "./keys";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createClient = () =>
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  });

export const database = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}
