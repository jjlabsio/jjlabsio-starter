import "server-only";
import type { UpsertSubscriptionData } from "./types";
export { isSubscriptionActive, mapPolarStatus } from "./subscription-utils";

export async function getSubscription(userId: string) {
  const { database } = await import("@repo/database");
  return database.subscription.findUnique({ where: { userId } });
}

export async function upsertSubscription(data: UpsertSubscriptionData) {
  const { database } = await import("@repo/database");
  return database.subscription.upsert({
    where: { polarSubscriptionId: data.polarSubscriptionId },
    create: data,
    update: {
      status: data.status,
      polarProductId: data.polarProductId,
      polarPriceId: data.polarPriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
    },
  });
}
