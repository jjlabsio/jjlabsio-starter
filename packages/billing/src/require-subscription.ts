import "server-only";
import { redirect } from "next/navigation";
import { getSubscription, isSubscriptionActive } from "./subscription";

export async function requireSubscription(userId: string) {
  const subscription = await getSubscription(userId);
  if (!isSubscriptionActive(subscription?.status)) {
    redirect("/pricing");
  }
  return subscription!;
}
