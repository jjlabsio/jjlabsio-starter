"use server";
import { createHmac } from "node:crypto";
import { env } from "@repo/auth/keys";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { auth, localDevAuthEnabled } from "@/lib/auth";
import { ADMIN_DEV_EMAIL } from "@/lib/admin-policy";

export async function signInAsDev(): Promise<{ error: string }> {
  if (!localDevAuthEnabled)
    return { error: "Development login is unavailable." };
  const password = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update("local-admin-development-account")
    .digest("hex");
  try {
    const existing = await database.user.findUnique({
      where: { email: ADMIN_DEV_EMAIL },
      select: { id: true },
    });
    if (!existing)
      await auth.api.signUpEmail({
        body: { name: "Development Admin", email: ADMIN_DEV_EMAIL, password },
      });
    await auth.api.signInEmail({ body: { email: ADMIN_DEV_EMAIL, password } });
  } catch {
    return { error: "Development login failed. Check the local database." };
  }
  redirect("/rewards");
}
