import { polar } from "@repo/billing";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portalSession = await polar.customerSessions.create({
    externalCustomerId: session.user.id,
  });

  redirect(portalSession.customerPortalUrl);
}
