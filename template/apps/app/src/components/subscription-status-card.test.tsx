import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Subscription } from "@repo/billing";
import { SubscriptionStatusCard } from "./subscription-status-card";

vi.mock("./billing-action", () => ({
  BillingAction: ({ children }: { children: React.ReactNode }) => children,
}));

const subscription: Subscription = {
  id: "subscription-example",
  userId: "user-example",
  polarSubscriptionId: null,
  polarProductId: "product-example",
  polarPriceId: null,
  status: "ACTIVE",
  currentPeriodStart: new Date("2026-09-29T00:00:00Z"),
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialStart: null,
  trialEnd: null,
  createdAt: new Date("2026-09-29T00:00:00Z"),
  updatedAt: new Date("2026-09-29T00:00:00Z"),
};

describe("Billing 현재 요금제", () => {
  it("체험 상태에서 요금제 비교 섹션의 고유 앵커로 이동한다", () => {
    const html = renderToStaticMarkup(
      <SubscriptionStatusCard
        subscription={{ ...subscription, status: "TRIALING" }}
        planName={null}
      />,
    );
    expect(html).toContain('href="#plan-comparison-heading"');
  });

  it.each(["Starter", "Pro", "Premium"])(
    "서버에서 판별한 %s 이름을 표시한다",
    (planName) => {
      const html = renderToStaticMarkup(
        <SubscriptionStatusCard
          subscription={subscription}
          planName={planName}
        />,
      );
      expect(html).toContain(`${planName} Plan`);
      if (planName !== "Premium") expect(html).not.toContain("Premium Plan");
    },
  );

  it("판별할 수 없는 상품을 Premium로 잘못 표시하지 않는다", () => {
    const html = renderToStaticMarkup(
      <SubscriptionStatusCard subscription={subscription} planName={null} />,
    );
    expect(html).toContain("Unknown plan");
    expect(html).not.toContain("Premium Plan");
  });
});
