import Link from "next/link";
import type { Subscription, SubscriptionStatus } from "@repo/billing";
import { Badge } from "@repo/ui/components/badge";
import { buttonVariants } from "@repo/ui/components/button";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  TRIALING: "Trial",
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
}

export function SubscriptionStatusCard({
  subscription,
}: SubscriptionStatusCardProps) {
  if (!subscription) {
    return (
      <div className="bg-card flex items-center justify-between rounded-xl border p-6">
        <div>
          <p className="font-medium">No active subscription</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Subscribe to unlock full access.
          </p>
        </div>
        <Link href="/pricing" className={buttonVariants({ size: "sm" })}>
          View Plans
        </Link>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[subscription.status];
  const badgeVariant = STATUS_VARIANT[subscription.status];
  const renewalDate = subscription.currentPeriodEnd
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        subscription.currentPeriodEnd,
      )
    : null;

  return (
    <div className="bg-card flex items-center justify-between rounded-xl border p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">Pro Plan</p>
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>
        {renewalDate && (
          <p className="text-muted-foreground text-sm">
            {subscription.cancelAtPeriodEnd
              ? `Cancels on ${renewalDate}`
              : `Renews on ${renewalDate}`}
          </p>
        )}
      </div>
      <Link
        href="/api/billing/portal"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Manage Billing
      </Link>
    </div>
  );
}
