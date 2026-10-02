import "server-only";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth, localDevAuthEnabled } from "./auth";
import { isAdminIdentity } from "./admin-policy";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (
    !isAdminIdentity(
      session.user.email,
      session.user.emailVerified,
      localDevAuthEnabled,
    )
  )
    notFound();
  return session.user;
}
