import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import {
  HeaderSubscriptionProvider,
  SiteHeader,
} from "../components/site-header";
import type { SubscriptionStatus } from "@repo/billing";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const now = Date.UTC(2026, 8, 29, 12);
const day = 24 * 60 * 60 * 1000;

function renderHeader(
  status: SubscriptionStatus,
  days: number,
  planName?: string,
) {
  return renderToStaticMarkup(
    <SidebarProvider>
      <HeaderSubscriptionProvider
        subscription={{ status, trialEnd: new Date(now + days * day) }}
        planName={planName}
        checkedAt={now}
      >
        <SiteHeader title="Overview" />
      </HeaderSubscriptionProvider>
    </SidebarProvider>,
  );
}

describe("공통 상단바", () => {
  it("일반 제목과 다단계 경로에 동일한 상단바를 사용한다", () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SiteHeader
          title="Item"
          breadcrumbs={[
            { label: "Sources" },
            { label: "URLs", href: "/urls" },
            { label: "Item", href: "/must-not-link" },
          ]}
        />
      </SidebarProvider>,
    );
    expect(html).toContain('aria-label="breadcrumb"');
    expect(html).toContain('href="/urls"');
    expect(html).not.toContain('href="/must-not-link"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Show parent pages"');
    expect(renderHeader("ACTIVE", 14, "Pro")).not.toContain(
      'aria-label="breadcrumb"',
    );
  });
  it("서버 구독값으로 즉시 Trial 일수와 요금제 이동을 표시한다", () => {
    const html = renderHeader("TRIALING", 14);
    expect(html).toContain("Trial ends in 14 days. View plans");
    expect(html).toContain('href="/settings/billing"');
    expect(html).toContain("14 days");
  });

  it("2일 이하의 Trial 배지에 공통 위험 상태 토큰을 적용한다", () => {
    const html = renderHeader("TRIALING", 2);
    expect(html).toContain("Trial ends in 2 days");
    expect(html).toContain("bg-destructive/10 text-destructive");
  });

  it.each(["Starter", "Pro", "Premium"])(
    "유료 상태에는 %s 요금제와 구독 관리 이동을 표시한다",
    (planName) => {
      const html = renderHeader("ACTIVE", 14, planName);
      expect(html).not.toContain("Trial ends in");
      expect(html).toContain(`aria-label="${planName} plan. View billing"`);
      expect(html).toContain('href="/settings/billing"');
      expect(html).not.toContain("Active");
      expect(html).toContain('aria-label="Help"');
      expect(html).toContain('href="mailto:support@example.com"');
      expect(html).not.toContain("Toggle theme");
    },
  );

  it("요금제를 판별할 수 없으면 특정 요금제를 추정하지 않는다", () => {
    const html = renderHeader("ACTIVE", 14);
    expect(html).toContain("Unknown plan. View billing");
    expect(html).not.toContain("Premium");
  });

  it("만료 일수를 음수로 표시하지 않는다", () => {
    const html = renderHeader("TRIALING", -1);
    expect(html).toContain("Trial ended. View plans");
    expect(html).toContain('href="/pricing"');
    expect(html).not.toContain("-1 day");
  });
});
