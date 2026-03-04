import "server-only";
import { TRIAL_DURATION_DAYS } from "./subscription-utils";

export async function startTrial(userId: string) {
  const { database } = await import("@repo/database");

  const now = new Date();
  const trialEnd = new Date(
    now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  try {
    return await database.subscription.create({
      data: {
        userId,
        status: "TRIALING",
        currentPeriodStart: now,
        trialStart: now,
        trialEnd,
        cancelAtPeriodEnd: false,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new Error("User already has a subscription or trial");
    }
    throw error;
  }
}

export async function expireTrial(subscriptionId: string) {
  const { database } = await import("@repo/database");
  return database.subscription.update({
    where: { id: subscriptionId, status: "TRIALING" },
    data: { status: "CANCELED" },
  });
}
