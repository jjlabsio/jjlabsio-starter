import type {
  Subscription,
  SubscriptionState,
  SubscriptionStatus,
} from "./types";

export const TRIAL_DURATION_DAYS = 14;

export function getTrialDaysRemaining(
  subscription: Pick<Subscription, "status" | "trialEnd"> | null,
  now = Date.now(),
): number | null {
  if (subscription?.status !== "TRIALING" || !subscription.trialEnd)
    return null;
  return Math.max(
    0,
    Math.ceil((subscription.trialEnd.getTime() - now) / (24 * 60 * 60 * 1000)),
  );
}

const ACTIVE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "ACTIVE",
  "TRIALING",
]);

const POLAR_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  canceled: "CANCELED",
  past_due: "PAST_DUE",
  unpaid: "UNPAID",
  incomplete: "UNPAID",
  incomplete_expired: "CANCELED",
};

export function isSubscriptionActive(
  status: SubscriptionStatus | null | undefined,
): boolean {
  if (!status) return false;
  return ACTIVE_STATUSES.has(status);
}

export function mapPolarStatus(polarStatus: string): SubscriptionStatus {
  const mapped = POLAR_STATUS_MAP[polarStatus];
  if (!mapped) {
    throw new Error(`Unknown Polar subscription status: ${polarStatus}`);
  }
  return mapped;
}

export function hasActiveTrial(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "TRIALING") return false;
  if (!subscription.trialEnd) return false;
  return subscription.trialEnd > new Date();
}

export function getSubscriptionState(
  subscription: Subscription | null | undefined,
): SubscriptionState {
  if (!subscription) return "no-subscription";
  if (hasActiveTrial(subscription)) return "trialing";
  if (subscription.status === "ACTIVE") return "active";
  return "expired";
}
