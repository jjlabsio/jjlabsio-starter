"use server";

import { createHmac } from "node:crypto";
import { auth, env, localDevAuthEnabled } from "@repo/auth";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { resolveCallbackUrl } from "@/lib/resolve-callback-url";

const DEV_EMAIL = "dev@example.test";

export async function signInAsDev(next: string): Promise<{ error: string }> {
  if (!localDevAuthEnabled) {
    return { error: "Development login is unavailable." };
  }

  const password = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update("local-development-account")
    .digest("hex");

  try {
    const existingUser = await database.user.findUnique({
      where: { email: DEV_EMAIL },
      select: { id: true },
    });
    let userId = existingUser?.id;

    if (!userId) {
      const result = await auth.api.signUpEmail({
        body: { name: "Development Test", email: DEV_EMAIL, password },
      });
      userId = result.user.id;
    }

    await database.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
      },
      update: { status: "ACTIVE" },
    });

    await auth.api.signInEmail({ body: { email: DEV_EMAIL, password } });
  } catch (error) {
    console.error("[Auth] Development login failed:", error);
    return { error: "Development login failed. Check the local database." };
  }

  redirect(resolveCallbackUrl(next));
}
