# System-Managed Trial Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add card-free trial system that reuses the existing Subscription table with nullable Polar fields.

**Architecture:** Make Polar-specific fields optional in the Subscription model so a trial-only record can be created without Polar. Trial expiry is checked lazily in `requireSubscription`. Pricing page shows context-dependent buttons based on user subscription state.

**Tech Stack:** Prisma, Next.js (App Router), Vitest, @repo/billing package, @repo/ui components

**Design Doc:** `docs/plans/2026-03-04-system-managed-trial-design.md`

---

### Task 1: Make Polar fields nullable in Prisma schema

**Files:**
- Modify: `template/packages/database/prisma/schema/subscription.prisma`
- Modify: `template/packages/database/prisma/migrations/20260228000001_add_billing/migration.sql`

Since this is a scaffold template (not a live app), we modify the original migration so new projects start with the correct schema.

**Step 1: Update Prisma schema**

In `template/packages/database/prisma/schema/subscription.prisma`, change 3 fields from required to optional and make `currentPeriodEnd` also optional (already `DateTime?` in schema but `NOT NULL` in migration — verify and fix if needed):

```prisma
  polarSubscriptionId String?            @unique @map("polar_subscription_id")
  polarProductId      String?            @map("polar_product_id")
  polarPriceId        String?            @map("polar_price_id")
```

**Step 2: Update existing migration SQL**

In `template/packages/database/prisma/migrations/20260228000001_add_billing/migration.sql`, change the 3 column definitions from `NOT NULL` to allow NULL:

```sql
    "polar_subscription_id" TEXT,
    "polar_product_id" TEXT,
    "polar_price_id" TEXT,
```

Also fix `current_period_end` to match the Prisma `DateTime?`:
```sql
    "current_period_end" TIMESTAMP(3),
```

**Step 3: Commit**

```bash
git add template/packages/database/prisma/schema/subscription.prisma template/packages/database/prisma/migrations/20260228000001_add_billing/migration.sql
git commit -m "feat(billing): make Polar fields nullable in subscription schema"
```

---

### Task 2: Update TypeScript types

**Files:**
- Modify: `template/packages/billing/src/types.ts`

**Step 1: Update Subscription interface**

Change 3 Polar fields to nullable:

```typescript
export interface Subscription {
  id: string;
  userId: string;
  polarSubscriptionId: string | null;
  polarProductId: string | null;
  polarPriceId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

`UpsertSubscriptionData` stays unchanged — it's only used by the webhook which always provides Polar values.

**Step 2: Commit**

```bash
git add template/packages/billing/src/types.ts
git commit -m "feat(billing): make Polar fields nullable in Subscription type"
```

---

### Task 3: Add trial utilities with TDD

**Files:**
- Modify: `template/packages/billing/src/subscription-utils.ts`
- Modify: `template/packages/billing/src/subscription.test.ts`

Pure functions go in `subscription-utils.ts` (no `server-only`) so they're testable.

**Step 1: Write failing tests**

Add to `template/packages/billing/src/subscription.test.ts`:

```typescript
import { hasActiveTrial, TRIAL_DURATION_DAYS } from "./subscription-utils";
import type { Subscription } from "./types";

// Helper to create a minimal trial subscription for testing
function createTrialSubscription(overrides: Partial<Subscription> = {}): Subscription {
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
```

**Step 2: Run tests to verify they fail**

```bash
cd template/packages/billing && pnpm test
```

Expected: FAIL — `hasActiveTrial` and `TRIAL_DURATION_DAYS` not exported from `subscription-utils`.

**Step 3: Implement trial utilities**

Add to `template/packages/billing/src/subscription-utils.ts`:

```typescript
import type { Subscription } from "./types";
```

Add at the top of the file (after existing imports):

```typescript
export const TRIAL_DURATION_DAYS = 14;
```

Add at the bottom of the file:

```typescript
export function hasActiveTrial(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "TRIALING") return false;
  if (!subscription.trialEnd) return false;
  return subscription.trialEnd > new Date();
}
```

**Step 4: Run tests to verify they pass**

```bash
cd template/packages/billing && pnpm test
```

Expected: ALL PASS

**Step 5: Commit**

```bash
git add template/packages/billing/src/subscription-utils.ts template/packages/billing/src/subscription.test.ts
git commit -m "feat(billing): add hasActiveTrial utility and TRIAL_DURATION_DAYS constant"
```

---

### Task 4: Create trial server module

**Files:**
- Create: `template/packages/billing/src/trial.ts`

This file has `server-only` and DB operations — not unit tested (same pattern as `subscription.ts`).

**Step 1: Create trial.ts**

```typescript
import "server-only";
import { TRIAL_DURATION_DAYS } from "./subscription-utils";

export async function startTrial(userId: string) {
  const { database } = await import("@repo/database");

  const existing = await database.subscription.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new Error("User already has a subscription or trial");
  }

  const now = new Date();
  const trialEnd = new Date(
    now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  return database.subscription.create({
    data: {
      userId,
      status: "TRIALING",
      currentPeriodStart: now,
      trialStart: now,
      trialEnd,
      cancelAtPeriodEnd: false,
    },
  });
}

export async function expireTrial(subscriptionId: string) {
  const { database } = await import("@repo/database");
  return database.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELED" },
  });
}
```

**Step 2: Commit**

```bash
git add template/packages/billing/src/trial.ts
git commit -m "feat(billing): add startTrial and expireTrial server functions"
```

---

### Task 5: Update requireSubscription with trial expiry check

**Files:**
- Modify: `template/packages/billing/src/require-subscription.ts`

**Step 1: Add lazy trial expiry evaluation**

Replace the full content of `require-subscription.ts`:

```typescript
import "server-only";
import { redirect } from "next/navigation";
import { getSubscription, isSubscriptionActive } from "./subscription";
import { expireTrial } from "./trial";

export async function requireSubscription(userId: string) {
  const subscription = await getSubscription(userId);

  // Lazy trial expiry: if trial period has ended, mark as canceled
  if (
    subscription?.status === "TRIALING" &&
    subscription.trialEnd &&
    subscription.trialEnd <= new Date()
  ) {
    await expireTrial(subscription.id);
    redirect("/pricing");
  }

  if (!isSubscriptionActive(subscription?.status)) {
    redirect("/pricing");
  }

  return subscription!;
}
```

**Step 2: Commit**

```bash
git add template/packages/billing/src/require-subscription.ts
git commit -m "feat(billing): add lazy trial expiry check in requireSubscription"
```

---

### Task 6: Update billing package exports

**Files:**
- Modify: `template/packages/billing/src/index.ts`
- Modify: `template/packages/billing/package.json`

**Step 1: Update index.ts exports**

Add trial exports:

```typescript
export { startTrial, expireTrial } from "./trial";
export { hasActiveTrial, TRIAL_DURATION_DAYS } from "./subscription-utils";
```

**Step 2: Add trial subpath export to package.json**

Add to the `"exports"` field:

```json
"./trial": "./src/trial.ts"
```

**Step 3: Commit**

```bash
git add template/packages/billing/src/index.ts template/packages/billing/package.json
git commit -m "feat(billing): export trial functions and add trial subpath"
```

---

### Task 7: Create trial API route

**Files:**
- Create: `template/apps/app/src/app/api/billing/trial/route.ts`

**Step 1: Create the route**

```typescript
import { startTrial } from "@repo/billing";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`trial:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    await startTrial(session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Trial already used or subscription exists" },
      { status: 409 },
    );
  }
}
```

**Step 2: Commit**

```bash
git add template/apps/app/src/app/api/billing/trial/route.ts
git commit -m "feat(app): add POST /api/billing/trial route"
```

---

### Task 8: Restructure pricing page with user-state buttons

**Files:**
- Modify: `template/apps/app/src/app/(public)/pricing/page.tsx`

The current page is entirely `"use client"`. We need to:
1. Make `page.tsx` a server component that optionally fetches session + subscription
2. Extract the client UI into a separate component that receives user state as props

**Step 1: Define subscription state type**

Add to `template/packages/billing/src/types.ts`:

```typescript
export type SubscriptionState =
  | "unauthenticated"
  | "no-subscription"
  | "trialing"
  | "expired"
  | "active";
```

Add to exports in `template/packages/billing/src/index.ts`:

```typescript
export type { SubscriptionState } from "./types";
```

**Step 2: Create helper to derive subscription state**

Add to `template/packages/billing/src/subscription-utils.ts`:

```typescript
import type { Subscription, SubscriptionState } from "./types";

export function getSubscriptionState(
  subscription: Subscription | null | undefined,
): SubscriptionState {
  if (!subscription) return "no-subscription";
  if (hasActiveTrial(subscription)) return "trialing";
  if (subscription.status === "ACTIVE") return "active";
  return "expired";
}
```

Export from `template/packages/billing/src/index.ts`:

```typescript
export { getSubscriptionState } from "./subscription-utils";
```

**Step 3: Add test for getSubscriptionState**

Add to `template/packages/billing/src/subscription.test.ts`:

```typescript
import { getSubscriptionState } from "./subscription-utils";

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
```

Run tests:

```bash
cd template/packages/billing && pnpm test
```

Expected: ALL PASS

**Step 4: Create client pricing component**

Create `template/apps/app/src/app/(public)/pricing/pricing-page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { IconCheck } from "@tabler/icons-react";
import { TIERS } from "@repo/billing/plan-config";
import type { BillingPeriod, TierConfig } from "@repo/billing/plan-config";
import type { SubscriptionState } from "@repo/billing";

const PRODUCT_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY ?? "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY ?? "",
    yearly: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY ?? "",
  },
} as const;

function getButtonConfig(
  state: SubscriptionState,
  tierName: string,
  checkoutHref: string,
): { text: string; href?: string; action?: "trial" } {
  switch (state) {
    case "unauthenticated":
      return { text: "Get Started", href: "/sign-in" };
    case "no-subscription":
      return { text: "Start Free Trial", action: "trial" };
    case "trialing":
      return { text: `Upgrade to ${tierName}`, href: checkoutHref };
    case "expired":
      return { text: `Subscribe to ${tierName}`, href: checkoutHref };
    case "active":
      return { text: "Manage Subscription", href: "/api/billing/portal" };
  }
}

function PlanCard({
  tier,
  period,
  subscriptionState,
}: {
  tier: TierConfig;
  period: BillingPeriod;
  subscriptionState: SubscriptionState;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const pricing = tier[period];
  const productId = PRODUCT_IDS[tier.id][period];
  const checkoutHref = `/api/billing/checkout?productId=${productId}`;
  const config = getButtonConfig(
    subscriptionState,
    tier.name,
    checkoutHref,
  );

  async function handleTrialStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/trial", { method: "POST" });
      if (res.ok) {
        router.push("/welcome");
      } else {
        // Trial already used or error — redirect to checkout instead
        router.push(checkoutHref);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card relative flex flex-col gap-6 rounded-xl border p-8">
      {pricing.badge && (
        <Badge className="absolute top-4 right-4">{pricing.badge}</Badge>
      )}
      <div>
        <p className="text-muted-foreground mb-1 text-sm font-medium">
          {tier.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold">
            {pricing.formattedPrice}
          </span>
          <span className="text-muted-foreground text-sm">
            {pricing.period}
          </span>
        </div>
        {pricing.savings && (
          <span className="mt-1 inline-block text-xs font-medium text-green-600">
            {pricing.savings}
          </span>
        )}
        <p className="text-muted-foreground mt-2 text-sm">
          {tier.description}
        </p>
      </div>

      {config.action === "trial" ? (
        <button
          onClick={handleTrialStart}
          disabled={loading}
          className={buttonVariants({ className: "w-full" })}
        >
          {loading ? "Starting trial..." : config.text}
        </button>
      ) : config.href ? (
        <a
          href={config.href}
          className={buttonVariants({ className: "w-full" })}
        >
          {config.text}
        </a>
      ) : (
        <button disabled className={buttonVariants({ className: "w-full" })}>
          {config.text}
        </button>
      )}

      <ul className="flex flex-col gap-2">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="text-muted-foreground flex items-start gap-2 text-sm"
          >
            <IconCheck className="mt-0.5 size-4 shrink-0 text-foreground/60" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PricingPageProps {
  subscriptionState: SubscriptionState;
}

export function PricingPage({ subscriptionState }: PricingPageProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-24">
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Pricing
      </p>
      <h1 className="mb-4 max-w-lg text-center text-4xl leading-snug font-normal">
        Simple, transparent pricing.
      </h1>
      <p className="text-muted-foreground mb-10 max-w-sm text-center text-sm leading-relaxed">
        Choose the plan that fits your needs. Cancel anytime.
      </p>

      <div className="mb-10 flex items-center gap-2 rounded-full border p-1">
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "monthly"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod("yearly")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            period === "yearly"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            period={period}
            subscriptionState={subscriptionState}
          />
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-xs">
        Cancel anytime. Questions?{" "}
        <a href="mailto:support@example.com" className="underline">
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
```

**Step 5: Rewrite page.tsx as server component**

Replace `template/apps/app/src/app/(public)/pricing/page.tsx`:

```typescript
import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { getSubscription, getSubscriptionState } from "@repo/billing";
import type { SubscriptionState } from "@repo/billing";
import { PricingPage } from "./pricing-page";

export default async function Page() {
  let subscriptionState: SubscriptionState = "unauthenticated";

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    const subscription = await getSubscription(session.user.id);
    subscriptionState = getSubscriptionState(subscription);
  }

  return <PricingPage subscriptionState={subscriptionState} />;
}
```

**Step 6: Commit**

```bash
git add template/packages/billing/src/types.ts template/packages/billing/src/subscription-utils.ts template/packages/billing/src/subscription.test.ts template/packages/billing/src/index.ts template/apps/app/src/app/\(public\)/pricing/
git commit -m "feat(app): restructure pricing page with user-state-dependent buttons"
```

---

### Task 9: Create welcome page

**Files:**
- Create: `template/apps/app/src/app/(authenticated)/welcome/page.tsx`

This page lives directly under `(authenticated)` — outside both `(sidebar)` and `(standard)` route groups — so it has auth + subscription check but no layout navigation chrome.

**Step 1: Create the page**

```typescript
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@repo/auth";
import { getSubscription, hasActiveTrial, TRIAL_DURATION_DAYS } from "@repo/billing";
import { buttonVariants } from "@repo/ui/components/button";

export default async function WelcomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const subscription = await getSubscription(session.user.id);
  if (!hasActiveTrial(subscription)) {
    redirect("/");
  }

  const daysRemaining = subscription?.trialEnd
    ? Math.ceil(
        (subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : TRIAL_DURATION_DAYS;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-3xl font-semibold">Welcome!</h1>
        <p className="text-muted-foreground mb-2 text-base">
          Your free trial has started.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          You have {daysRemaining} days to explore all features.
        </p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
```

Note: This page does its own auth check instead of relying on the `(authenticated)/layout.tsx` `requireSubscription` — because `requireSubscription` would pass (TRIALING is active), but we also want to redirect non-trial users away from this page.

**Step 2: Commit**

```bash
git add template/apps/app/src/app/\(authenticated\)/welcome/page.tsx
git commit -m "feat(app): add welcome page for trial onboarding"
```

---

### Task 10: Update Subscription Status Card for trial state

**Files:**
- Modify: `template/apps/app/src/components/subscription-status-card.tsx`

**Step 1: Add trial-specific display**

Update the component to show trial info when status is TRIALING:

```typescript
"use client";

import Link from "next/link";
import type { Subscription, SubscriptionStatus } from "@repo/billing";
import { Badge } from "@repo/ui/components/badge";
import { buttonVariants } from "@repo/ui/components/button";

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
  const isTrial = subscription.status === "TRIALING";

  const trialDaysRemaining =
    isTrial && subscription.trialEnd
      ? Math.ceil(
          (subscription.trialEnd.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

  const renewalDate = subscription.currentPeriodEnd
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        subscription.currentPeriodEnd,
      )
    : null;

  return (
    <div className="bg-card flex items-center justify-between rounded-xl border p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{isTrial ? "Free Trial" : "Pro Plan"}</p>
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
      {isTrial ? (
        <Link href="/pricing" className={buttonVariants({ size: "sm" })}>
          Upgrade
        </Link>
      ) : (
        <Link
          href="/api/billing/portal"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Manage Billing
        </Link>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add template/apps/app/src/components/subscription-status-card.tsx
git commit -m "feat(app): update subscription status card with trial display"
```

---

### Task 11: Run all tests and verify

**Step 1: Run billing package tests**

```bash
cd template/packages/billing && pnpm test
```

Expected: ALL PASS (existing tests + new trial tests)

**Step 2: Run typecheck**

```bash
cd template && pnpm turbo typecheck --filter=@repo/billing --filter=app
```

Expected: No type errors

**Step 3: Final commit if any fixes needed**
