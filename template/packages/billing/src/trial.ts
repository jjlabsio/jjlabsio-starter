import "server-only";
import { TRIAL_DURATION_DAYS } from "./subscription-utils";

export async function startTrial(userId: string) {
  const { database } = await import("@repo/database");

  const existing = await database.subscription.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new Error("User already has a subscription or trial");
  }

  const now = new Date();
  const trialEnd = new Date(
    now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  return database.subscription.create({
    data: {
      userId,
      status: "TRIALING",
      currentPeriodStart: now,
      trialStart: now,
      trialEnd,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function expireTrial(subscriptionId: string) {
  const { database } = await import("@repo/database");
  return database.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELED" },
  });
}
