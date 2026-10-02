import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription, getSubscriptionState } from "@repo/billing";
import { PricingPage } from "./pricing-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const period =
    (await searchParams).period === "monthly" ? "monthly" : "yearly";
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?next=/pricing");
  }

  const subscription = await getSubscription(session.user.id);
  const subscriptionState = getSubscriptionState(subscription);
  if (subscriptionState === "active" || subscriptionState === "trialing") {
    redirect("/settings/billing");
  }

  return (
    <PricingPage
      key={period}
      subscriptionState={subscriptionState}
      initialPeriod={period}
    />
  );
}
