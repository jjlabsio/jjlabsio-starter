export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "CANCELED"
  | "PAST_DUE"
  | "UNPAID";

export interface Subscription {
  id: string;
  userId: string;
  polarSubscriptionId: string;
  polarProductId: string;
  polarPriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSubscriptionData {
  polarSubscriptionId: string;
  userId: string;
  polarProductId: string;
  polarPriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date | null;
  trialEnd?: Date | null;
}
