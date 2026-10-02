import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { database } from "@repo/database";
import { env } from "@repo/auth/keys";
import { isAdminIdentity, isLocalAdminDev } from "./admin-policy";
export const localDevAuthEnabled = isLocalAdminDev(
  process.env.NODE_ENV,
  env.BETTER_AUTH_URL,
);

// Separate cookie namespace and secret: user-app sessions never authenticate admins.
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  advanced: { cookiePrefix: "admin-auth" },
  database: prismaAdapter(database, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: localDevAuthEnabled,
    disableSignUp: !localDevAuthEnabled,
    autoSignIn: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  account: { accountLinking: { enabled: false } },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (
            !isAdminIdentity(
              user.email,
              user.emailVerified,
              localDevAuthEnabled,
            )
          )
            throw new APIError("FORBIDDEN", {
              message: "This account is not allowed to access Admin.",
            });
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await database.user.findUnique({
            where: { id: session.userId },
            select: { email: true, emailVerified: true },
          });
          if (
            !user ||
            !isAdminIdentity(
              user.email,
              user.emailVerified,
              localDevAuthEnabled,
            )
          )
            throw new APIError("FORBIDDEN", {
              message: "This account is not allowed to access Admin.",
            });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
