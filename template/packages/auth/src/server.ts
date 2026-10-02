import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { database } from "@repo/database";
import { env } from "./keys";

export const localDevAuthEnabled =
  process.env.NODE_ENV === "development" &&
  ["localhost", "127.0.0.1"].includes(new URL(env.BETTER_AUTH_URL).hostname);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
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
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          // Creation hook, not session hook: returning logins never resend this email.
          if (
            ctx?.path !== "/callback/:id" ||
            ctx.params?.id !== "google" ||
            !user.emailVerified
          )
            return;
          let timeout: ReturnType<typeof setTimeout> | undefined;
          try {
            const { sendWelcomeEmail } = await import("@repo/email/welcome");
            await Promise.race([
              sendWelcomeEmail(user, env.BETTER_AUTH_URL),
              new Promise<never>((_, reject) => {
                timeout = setTimeout(
                  () => reject(new Error("Welcome email timed out")),
                  3000,
                );
              }),
            ]);
          } catch {
            // No recipient or provider response in logs; sending must not fail signup.
            console.error("Welcome email delivery failed");
          } finally {
            clearTimeout(timeout);
          }
        },
      },
    },
  },
});
