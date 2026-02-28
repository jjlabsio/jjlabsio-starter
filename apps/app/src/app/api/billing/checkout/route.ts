import { polar, env } from "@repo/billing";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_PRODUCT_IDS = new Set(
  [
    env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY,
    env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY,
    env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY,
    env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY,
  ].filter(Boolean),
);

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `/sign-in?next=${encodeURIComponent(callbackUrl)}`,
        request.nextUrl.origin,
      ),
    );
  }

  const { allowed } = checkRateLimit(`checkout:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId || !ALLOWED_PRODUCT_IDS.has(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const successUrl = new URL("/dashboard", request.nextUrl.origin).toString();

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: session.user.email,
      externalCustomerId: session.user.id,
      successUrl,
    });

    return NextResponse.redirect(checkout.url);
  } catch (error) {
    console.error("[Billing] Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
