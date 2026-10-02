import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";

export async function requireRewardsUser(next = "/rewards") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session.user;
}
