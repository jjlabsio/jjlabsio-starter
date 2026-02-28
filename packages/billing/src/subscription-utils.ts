import type { SubscriptionStatus } from "./types";

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
