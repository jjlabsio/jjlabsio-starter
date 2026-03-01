import { polar } from "@repo/billing";
import { auth } from "@repo/auth";
import { database } from "@repo/database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`portal:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { polarCustomerId: true },
  });

  if (!user?.polarCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 404 },
    );
  }

  try {
    const portalSession = await polar.customerSessions.create({
      customerId: user.polarCustomerId,
    });

    return NextResponse.redirect(portalSession.customerPortalUrl);
  } catch (error) {
    console.error("[Billing] Portal session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
