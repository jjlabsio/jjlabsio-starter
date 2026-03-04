import { describe, it, expect } from "vitest";
import { isSubscriptionActive, mapPolarStatus } from "./subscription-utils";
import {
  hasActiveTrial,
  TRIAL_DURATION_DAYS,
  getSubscriptionState,
} from "./subscription-utils";
import type { SubscriptionStatus } from "./types";
import type { Subscription } from "./types";

// Helper to create a minimal trial subscription for testing
function createTrialSubscription(
  overrides: Partial<Subscription> = {},
): Subscription {
  const now = new Date();
  return {
    id: "test-id",
    userId: "test-user",
    polarSubscriptionId: null,
    polarProductId: null,
    polarPriceId: null,
    status: "TRIALING",
    currentPeriodStart: now,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    trialStart: now,
    trialEnd: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("isSubscriptionActive", () => {
  it("ACTIVE 구독은 활성 상태로 판단", () => {
    expect(isSubscriptionActive("ACTIVE")).toBe(true);
  });

  it("TRIALING 구독은 활성 상태로 판단", () => {
    expect(isSubscriptionActive("TRIALING")).toBe(true);
  });

  it("CANCELED 구독은 비활성 상태로 판단", () => {
    expect(isSubscriptionActive("CANCELED")).toBe(false);
  });

  it("PAST_DUE 구독은 비활성 상태로 판단", () => {
    expect(isSubscriptionActive("PAST_DUE")).toBe(false);
  });

  it("UNPAID 구독은 비활성 상태로 판단", () => {
    expect(isSubscriptionActive("UNPAID")).toBe(false);
  });

  it("null은 비활성 상태로 판단", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("undefined은 비활성 상태로 판단", () => {
    expect(isSubscriptionActive(undefined)).toBe(false);
  });
});

describe("mapPolarStatus", () => {
  it("Polar active → ACTIVE", () => {
    expect(mapPolarStatus("active")).toBe("ACTIVE");
  });

  it("Polar trialing → TRIALING", () => {
    expect(mapPolarStatus("trialing")).toBe("TRIALING");
  });

  it("Polar canceled → CANCELED", () => {
    expect(mapPolarStatus("canceled")).toBe("CANCELED");
  });

  it("Polar past_due → PAST_DUE", () => {
    expect(mapPolarStatus("past_due")).toBe("PAST_DUE");
  });

  it("Polar unpaid → UNPAID", () => {
    expect(mapPolarStatus("unpaid")).toBe("UNPAID");
  });

  it("Polar incomplete → UNPAID", () => {
    expect(mapPolarStatus("incomplete")).toBe("UNPAID");
  });

  it("Polar incomplete_expired → CANCELED", () => {
    expect(mapPolarStatus("incomplete_expired")).toBe("CANCELED");
  });

  it("알 수 없는 상태는 에러", () => {
    expect(() => mapPolarStatus("unknown_status")).toThrow(
      "Unknown Polar subscription status: unknown_status",
    );
  });
});

describe("TRIAL_DURATION_DAYS", () => {
  it("기본 trial 기간은 14일", () => {
    expect(TRIAL_DURATION_DAYS).toBe(14);
  });
});

describe("hasActiveTrial", () => {
  it("TRIALING 상태이고 trialEnd가 미래이면 true", () => {
    const sub = createTrialSubscription();
    expect(hasActiveTrial(sub)).toBe(true);
  });

  it("TRIALING 상태이고 trialEnd가 과거이면 false", () => {
    const sub = createTrialSubscription({
      trialEnd: new Date(Date.now() - 1000),
    });
    expect(hasActiveTrial(sub)).toBe(false);
  });

  it("ACTIVE 상태이면 false", () => {
    const sub = createTrialSubscription({ status: "ACTIVE" });
    expect(hasActiveTrial(sub)).toBe(false);
  });

  it("TRIALING 상태이지만 trialEnd가 null이면 false", () => {
    const sub = createTrialSubscription({ trialEnd: null });
    expect(hasActiveTrial(sub)).toBe(false);
  });

  it("null이면 false", () => {
    expect(hasActiveTrial(null)).toBe(false);
  });
});

describe("getSubscriptionState", () => {
  it("구독 없으면 no-subscription", () => {
    expect(getSubscriptionState(null)).toBe("no-subscription");
  });

  it("TRIALING + trialEnd 미래이면 trialing", () => {
    const sub = createTrialSubscription();
    expect(getSubscriptionState(sub)).toBe("trialing");
  });

  it("ACTIVE이면 active", () => {
    const sub = createTrialSubscription({ status: "ACTIVE" });
    expect(getSubscriptionState(sub)).toBe("active");
  });

  it("CANCELED이면 expired", () => {
    const sub = createTrialSubscription({ status: "CANCELED" });
    expect(getSubscriptionState(sub)).toBe("expired");
  });

  it("TRIALING + trialEnd 과거이면 expired", () => {
    const sub = createTrialSubscription({
      trialEnd: new Date(Date.now() - 1000),
    });
    expect(getSubscriptionState(sub)).toBe("expired");
  });
});
