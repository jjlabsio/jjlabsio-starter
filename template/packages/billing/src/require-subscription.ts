import "server-only";
import { redirect } from "next/navigation";
import { getSubscription } from "./subscription";
import { getSubscriptionState } from "./subscription-utils";
import { expireTrial } from "./trial";

export async function requireSubscription(userId: string) {
  const subscription = await getSubscription(userId);

  // Lazy trial expiry: if trial period has ended, mark as canceled
  if (
    subscription?.status === "TRIALING" &&
    subscription.trialEnd &&
    subscription.trialEnd <= new Date()
  ) {
    await expireTrial(subscription.id);
    redirect("/pricing");
  }

  const state = getSubscriptionState(subscription);
  if (state !== "active" && state !== "trialing") {
    redirect("/pricing");
  }

  return subscription!;
}
