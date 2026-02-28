import { env, mapPolarStatus, upsertSubscription } from "@repo/billing";
import { database } from "@repo/database";
import { validateEvent, WebhookVerificationError } from "@repo/billing/webhook";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, headers, env.POLAR_WEBHOOK_SECRET);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    throw e;
  }

  try {
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = event.data;
        await upsertSubscription({
          polarSubscriptionId: sub.id,
          userId: await resolveUserId(sub.customer.email),
          polarProductId: sub.productId,
          polarPriceId: sub.prices[0]?.id ?? "",
          status: mapPolarStatus(sub.status),
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialStart: null,
          trialEnd: null,
        });

        if (sub.customer.externalId) {
          await database.user.update({
            where: { id: sub.customer.externalId },
            data: { polarCustomerId: sub.customerId },
          });
        }
        break;
      }

      case "subscription.canceled": {
        const sub = event.data;
        await upsertSubscription({
          polarSubscriptionId: sub.id,
          userId: await resolveUserId(sub.customer.email),
          polarProductId: sub.productId,
          polarPriceId: sub.prices[0]?.id ?? "",
          status: "CANCELED",
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialStart: null,
          trialEnd: null,
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Polar Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function resolveUserId(email: string): Promise<string> {
  const user = await database.user.findUniqueOrThrow({ where: { email } });
  return user.id;
}
