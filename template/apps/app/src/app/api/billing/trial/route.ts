import { startTrial } from "@repo/billing";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`trial:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    await startTrial(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User already has a subscription or trial"
    ) {
      return NextResponse.json(
        { error: "Trial already used or subscription exists" },
        { status: 409 },
      );
    }
    console.error("[Billing] Trial start failed:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 },
    );
  }
}
