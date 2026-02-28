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
        const priceId = sub.prices[0]?.id;
        if (!priceId) {
          return NextResponse.json({ error: "Missing price" }, { status: 400 });
        }

        await upsertSubscription({
          polarSubscriptionId: sub.id,
          userId: await resolveUserId(sub.customer),
          polarProductId: sub.productId,
          polarPriceId: priceId,
          status: mapPolarStatus(sub.status),
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialStart: sub.startedAt ? new Date(sub.startedAt) : null,
          trialEnd: sub.endsAt ? new Date(sub.endsAt) : null,
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
        const priceId = sub.prices[0]?.id;
        if (!priceId) {
          return NextResponse.json({ error: "Missing price" }, { status: 400 });
        }

        await upsertSubscription({
          polarSubscriptionId: sub.id,
          userId: await resolveUserId(sub.customer),
          polarProductId: sub.productId,
          polarPriceId: priceId,
          status: mapPolarStatus(sub.status),
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialStart: sub.startedAt ? new Date(sub.startedAt) : null,
          trialEnd: sub.endsAt ? new Date(sub.endsAt) : null,
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

async function resolveUserId(customer: {
  externalId: string | null;
  email: string;
}): Promise<string> {
  if (customer.externalId) return customer.externalId;
  const user = await database.user.findUniqueOrThrow({
    where: { email: customer.email },
  });
  return user.id;
}
