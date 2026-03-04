import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { getSubscription, getSubscriptionState } from "@repo/billing";
import type { SubscriptionState } from "@repo/billing";
import { PricingPage } from "./pricing-page";

export default async function Page() {
  let subscriptionState: SubscriptionState = "unauthenticated";

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    const subscription = await getSubscription(session.user.id);
    subscriptionState = getSubscriptionState(subscription);
  }

  return <PricingPage subscriptionState={subscriptionState} />;
}
