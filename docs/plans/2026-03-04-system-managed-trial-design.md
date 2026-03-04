# System-Managed Trial Design

## Problem

Polar trial requires credit card. Need card-free trial managed by our system.

## Approach

Reuse existing Subscription table. Make Polar-specific fields (`polarSubscriptionId`, `polarProductId`, `polarPriceId`) nullable so a trial-only Subscription record can be created without Polar involvement.

## Key Decisions

- **Trial trigger**: User clicks "Start Free Trial" on pricing page (per plan card)
- **Trial duration**: 14 days (configurable constant)
- **Trial scope**: Plan-independent, full feature access
- **Trial expiry**: Lazy evaluation in `requireSubscription` — no cron needed
- **Post-trial**: Redirect to pricing page (same as no subscription)
- **One trial per user**: Enforced by `userId` unique constraint on Subscription

## Database Schema Change

```prisma
model Subscription {
  polarSubscriptionId String?  @unique  // String → String?
  polarProductId      String?           // String → String?
  polarPriceId        String?           // String → String?
  // all other fields unchanged
}
```

Impact: Minimal. No existing code reads these Polar fields directly (UI uses status/dates only, webhook always provides values).

## Billing Package Changes

### types.ts

3 Polar fields become `string | null` in `Subscription` and `UpsertSubscriptionData`.

### trial.ts (new)

```
TRIAL_DURATION_DAYS = 14

startTrial(userId): Promise<Subscription>
  - Check no existing subscription (throw if exists)
  - Create Subscription with status=TRIALING, trialStart=now, trialEnd=now+14d
  - Polar fields set to null

hasActiveTrial(subscription): boolean
  - status === TRIALING && trialEnd > now
```

### require-subscription.ts (modified)

Add trial expiry check:
```
if status === TRIALING && trialEnd <= now:
  → update status to CANCELED
  → redirect to /pricing
```

### index.ts

Export `startTrial`, `hasActiveTrial`, `TRIAL_DURATION_DAYS`.

## API Route

### POST /api/billing/trial

- Auth required, rate limited
- Check existing subscription → 409 if exists
- Call startTrial(userId)
- Return 200

## UI Changes

### Pricing Page

Each plan card button varies by user state:

| User State | Button Text | Action |
|---|---|---|
| No subscription (trial unused) | "Start Free Trial" | POST /api/billing/trial → /welcome |
| Trial active | "Upgrade to {Plan}" | Polar checkout |
| Trial expired | "Subscribe to {Plan}" | Polar checkout |
| Paid subscriber | "Current Plan" / "Change to {Plan}" | Polar portal or checkout |

### Welcome Page (/welcome)

- Shown after trial start
- Trial started confirmation + remaining days info
- CTA button to enter app
- Auth required

### Subscription Status Card

Trial state:
- "Free Trial" label + remaining days
- "Upgrade to paid plan" link → pricing page

## Paid Conversion Flow

User on trial selects plan → Polar checkout (existing flow) → webhook upserts same Subscription record (status: ACTIVE, fills Polar fields, trial fields preserved).
