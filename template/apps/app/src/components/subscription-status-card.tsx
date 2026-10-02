"use client";

import * as React from "react";
import Link from "next/link";
import { BillingAction } from "@/components/billing-action";
import type { Subscription, SubscriptionStatus } from "@repo/billing";
import { getTrialDaysRemaining } from "@repo/billing/subscription-utils";
import { Badge } from "@repo/ui/components/badge";
import { buttonVariants } from "@repo/ui/components/button";
import { Card, CardContent, CardTitle } from "@repo/ui/components/card";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  TRIALING: "Free Trial",
  PAST_DUE: "Past Due",
  CANCELED: "Canceled",
  UNPAID: "Unpaid",
};

const STATUS_VARIANT: Record<
  SubscriptionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  PAST_DUE: "destructive",
  CANCELED: "outline",
  UNPAID: "destructive",
};

interface SubscriptionStatusCardProps {
  subscription: Subscription | null;
  planName: string | null;
}

export function SubscriptionStatusCard({
  subscription,
  planName,
}: SubscriptionStatusCardProps) {
  if (!subscription) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Your plan</CardTitle>
            <div className="mt-3 space-y-1">
              <p className="font-medium">No active subscription</p>
              <p className="text-muted-foreground text-sm">
                Subscribe to unlock full access.
              </p>
            </div>
          </div>
          <Link href="/pricing" className={buttonVariants()}>
            View Plans
          </Link>
        </CardContent>
      </Card>
    );
  }

  const statusLabel = STATUS_LABELS[subscription.status];
  const badgeVariant = STATUS_VARIANT[subscription.status];
  const isTrial = subscription.status === "TRIALING";

  const trialDaysRemaining = getTrialDaysRemaining(subscription);

  const renewalDate = subscription.currentPeriodEnd
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        subscription.currentPeriodEnd,
      )
    : null;

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Your plan</CardTitle>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {isTrial
                  ? "Free Trial"
                  : planName
                    ? `${planName} Plan`
                    : "Unknown plan"}
              </p>
              <Badge variant={badgeVariant}>{statusLabel}</Badge>
            </div>
            {isTrial && trialDaysRemaining !== null && (
              <p className="text-muted-foreground text-sm">
                {trialDaysRemaining} days remaining
              </p>
            )}
            {!isTrial && renewalDate && (
              <p className="text-muted-foreground text-sm">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${renewalDate}`
                  : `Renews on ${renewalDate}`}
              </p>
            )}
          </div>
        </div>
        {isTrial ? (
          <Link href="#plan-comparison-heading" className={buttonVariants()}>
            Choose a plan
          </Link>
        ) : (
          <BillingAction
            endpoint="/api/billing/portal"
            variant="outline"
            size="sm"
          >
            Manage Billing
          </BillingAction>
        )}
      </CardContent>
    </Card>
  );
}
