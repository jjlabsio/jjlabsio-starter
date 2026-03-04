import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription, getSubscriptionState } from "@repo/billing";
import { PricingPage } from "./pricing-page";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?next=/pricing");
  }

  const subscription = await getSubscription(session.user.id);
  const subscriptionState = getSubscriptionState(subscription);

  return <PricingPage subscriptionState={subscriptionState} />;
}
