import React from "react";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ value: "expired" }));
vi.mock("next/headers", () => ({ headers: async () => ({}) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
vi.mock("@repo/auth", () => ({
  auth: { api: { getSession: async () => ({ user: { id: "test-user" } }) } },
}));
vi.mock("@repo/billing", () => ({
  getSubscription: async () => null,
  getSubscriptionState: () => state.value,
}));
vi.mock("./pricing-page", () => ({ PricingPage: () => null }));
import Page from "./page";

describe("Pricing 접근 규칙", () => {
  it.each(["active", "trialing"])(
    "%s 사용자는 Billing으로 이동",
    async (value) => {
      state.value = value;
      await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
        "redirect:/settings/billing",
      );
    },
  );
  it.each(["expired", "no-subscription"])(
    "%s 사용자는 Yearly 결제 화면 표시",
    async (value) => {
      state.value = value;
      const result = await Page({ searchParams: Promise.resolve({}) });
      expect(result.props.initialPeriod).toBe("yearly");
      expect(result.props.subscriptionState).toBe(value);
    },
  );
  it("명시적으로 선택한 Monthly는 유지", async () => {
    state.value = "expired";
    const result = await Page({
      searchParams: Promise.resolve({ period: "monthly" }),
    });
    expect(result.props.initialPeriod).toBe("monthly");
  });
});
