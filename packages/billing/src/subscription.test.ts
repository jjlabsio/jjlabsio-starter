import { describe, it, expect } from "vitest";
import { isSubscriptionActive, mapPolarStatus } from "./subscription-utils";
import type { SubscriptionStatus } from "./types";

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
