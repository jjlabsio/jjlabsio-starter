import { polar } from "@repo/billing";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  const successUrl = new URL("/dashboard", request.nextUrl.origin).toString();

  const checkout = await polar.checkouts.create({
    products: [productId],
    customerEmail: session.user.email,
    successUrl,
  });

  redirect(checkout.url);
}
