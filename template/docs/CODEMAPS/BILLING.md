# Billing Codemap

**Last Updated:** 2026-03-01

**Entry Points:**

- `@repo/billing` (package export)
- `apps/app/src/app/api/billing/*` (API routes)
- `apps/app/src/app/api/webhooks/polar/*` (webhook handler)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Polar (External Service)                 │
│          (Subscriptions, Checkouts, Customer Portal)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │  Checkout  │ │ Customer │ │ Webhook      │
   │  API Route │ │ Portal   │ │ Handler      │
   │            │ │ Route    │ │              │
   └────────────┘ └──────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │   @repo/billing  │
              │                  │
              │ ┌──────────────┐ │
              │ │   client.ts  │ │ Polar SDK
              │ └──────────────┘ │ configuration
              │ ┌──────────────┐ │
              │ │ subscription │ │ CRUD operations
              │ │   .ts        │ │ on Subscription
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │   webhook.ts │ │ Validation,
              │ └──────────────┘ │ verification
              │ ┌──────────────┐ │
              │ │ keys.ts      │ │ Env variables
              │ └──────────────┘ │
              └──────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  @repo/database │
              │                 │
              │ Subscription    │ Persists
              │ model + User    │ subscription
              │ (polarCustomerId)│ state
              └─────────────────┘
```

## Key Modules

| Module                    | Purpose                          | Exports                                                        | Dependencies                         |
| ------------------------- | -------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `client.ts`               | Initializes Polar SDK            | `polar` (Polar instance)                                       | `@polar-sh/sdk`, `keys.ts`           |
| `keys.ts`                 | Environment variable validation  | `env` (validated env vars)                                     | `@t3-oss/env-nextjs`, `zod`          |
| `plan-config.ts`          | Multi-tier pricing configuration | `TIERS` (Starter/Pro config), `TierConfig`, `BillingPeriod`    | (pure data)                          |
| `subscription.ts`         | Subscription data operations     | `getSubscription`, `upsertSubscription`                        | `@repo/database`, `types.ts`         |
| `subscription-utils.ts`   | Status mapping & validation      | `isSubscriptionActive`, `mapPolarStatus`                       | `types.ts`                           |
| `webhook.ts`              | Webhook re-exports               | `validateEvent`, `WebhookVerificationError`                    | `@polar-sh/sdk/webhooks`             |
| `types.ts`                | Type definitions                 | `Subscription`, `SubscriptionStatus`, `UpsertSubscriptionData` | (pure types)                         |
| `require-subscription.ts` | Route guard middleware           | `requireSubscription`                                          | `subscription.ts`, `next/navigation` |

## Data Flow

### 1. Checkout Flow

```
User clicks "Get Started" on pricing page
  ↓
POST /api/billing/checkout?productId=...
  ├─ Check session (auth guard)
  ├─ Rate limit check (checkRateLimit)
  ├─ Validate productId against allowed list
  └─ Call polar.checkouts.create({
      products: [productId],
      customerEmail,
      externalCustomerId: userId,
      successUrl
    })
  ↓
Redirect to Polar checkout page
  ↓
User completes payment on Polar
  ↓
Polar webhook fires subscription.created → /api/webhooks/polar
```

### 2. Subscription Webhook Flow

```
Polar fires webhook event (subscription.created/updated/canceled)
  ↓
POST /api/webhooks/polar
  ├─ Validate webhook signature (validateEvent)
  ├─ Parse event type & data
  ├─ Resolve userId (via externalCustomerId or email lookup)
  ├─ Call upsertSubscription({
      polarSubscriptionId,
      userId,
      polarProductId,
      polarPriceId,
      status: mapPolarStatus(polarStatus),
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      trialStart/trialEnd
    })
  ├─ Update User.polarCustomerId
  └─ Return { received: true }
```

### 3. Billing Settings Flow

```
User visits /settings/billing
  ↓
BillingSettingsPage (server component)
  ├─ Get session
  ├─ Call getSubscription(userId)
  ├─ Render SubscriptionStatusCard with subscription data
  └─ Card shows status + "Manage Billing" link
     (links to /api/billing/portal)
  ↓
User clicks "Manage Billing"
  ↓
GET /api/billing/portal
  ├─ Check session
  ├─ Rate limit check
  └─ Call polar.customerSessions.create({
      externalCustomerId: userId
    })
  ↓
Redirect to Polar customer portal
  ↓
User manages subscription (cancel, change plan, etc.) on Polar
```

## Database Schema

```sql
-- User model (packages/database/prisma/schema/user.prisma)
model User {
  id              String        @id @default(cuid())
  email           String        @unique
  name            String?
  emailVerified   Boolean       @default(false)
  image           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  polarCustomerId String?       @unique       -- Links to Polar customer
  sessions        Session[]
  accounts        Account[]
  subscription    Subscription?              -- 1:1 relationship
}

-- Subscription model (packages/database/prisma/schema/subscription.prisma)
model Subscription {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId])
  polarSubscriptionId String             @unique
  polarProductId      String
  polarPriceId        String
  status              SubscriptionStatus
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean            @default(false)
  trialStart          DateTime?
  trialEnd            DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  CANCELED
  PAST_DUE
  UNPAID
}
```

## Environment Variables

**Server-side (in `keys.ts` validation):**

- `POLAR_ACCESS_TOKEN` - Polar API authentication
- `POLAR_WEBHOOK_SECRET` - Webhook signature verification
- `POLAR_ORGANIZATION_ID` - Polar organization identifier

**Client-side (prefixed `NEXT_PUBLIC_`):**

- `NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY` - Starter monthly plan product ID
- `NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY` - Starter yearly plan product ID
- `NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY` - Pro monthly plan product ID
- `NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY` - Pro yearly plan product ID

**See:** `packages/billing/src/keys.ts` for schema validation.

## Pricing Tiers

Multi-tier pricing configuration in `packages/billing/src/plan-config.ts`:

```typescript
export const TIERS = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and small teams.",
    monthly: { price: 19, formattedPrice: "$19" },
    yearly: { price: 190, formattedPrice: "$190", savings: "Save 17%" },
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "3 team members",
      "Email support",
      "10GB storage",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power.",
    monthly: { price: 49, formattedPrice: "$49" },
    yearly: { price: 490, formattedPrice: "$490", savings: "Save 17%" },
    highlighted: true,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Unlimited team members",
      "Priority support",
      "100GB storage",
      "Custom workflows",
      "API access",
    ],
  },
];
```

**Usage:** Tiers are consumed by pricing UI components (`apps/web/src/app/pricing/`) to render plan cards with monthly/yearly toggle.

## External Dependencies

| Package              | Version         | Purpose                                               |
| -------------------- | --------------- | ----------------------------------------------------- |
| `@polar-sh/sdk`      | ^0.34.5         | Polar API client (checkouts, subscriptions, webhooks) |
| `@repo/database`     | workspace:\*    | Subscription model persistence                        |
| `@t3-oss/env-nextjs` | ^0.11.1         | Environment variable validation                       |
| `zod`                | ^3.25.76        | Schema validation for env vars                        |
| `server-only`        | ^0.0.1          | Ensures server-side only execution                    |
| `next`               | >=15.0.0 (peer) | Framework (for route.ts API handlers)                 |

## Rate Limiting

**Implementation:** In-memory rate limiter (`apps/app/src/lib/rate-limit.ts`)

```typescript
checkRateLimit(key: string): { allowed: boolean; remaining: number }
```

- **Window:** 60 seconds
- **Max requests:** 10 per window
- **Store limit:** 10,000 entries (auto cleanup)
- **Note:** Single-instance only. For serverless/multi-instance, use Upstash Redis.

**Applied to:**

- `POST /api/billing/checkout` (key: `checkout:${userId}`)
- `GET /api/billing/portal` (key: `portal:${userId}`)

## UI Components

| Component                | Location                                                                | Purpose                                                         |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `PricingPage`            | `apps/app/src/app/(public)/pricing/page.tsx`                            | Monthly/yearly plan cards, links to checkout                    |
| `SubscriptionStatusCard` | `apps/app/src/components/subscription-status-card.tsx`                  | Displays current subscription status, renewal date, manage link |
| `BillingSettingsPage`    | `apps/app/src/app/(authenticated)/(standard)/settings/billing/page.tsx` | Settings page wrapper, server session check                     |

## Security Considerations

- **Webhook Signature:** All Polar webhooks validated via `validateEvent(body, headers, POLAR_WEBHOOK_SECRET)`
- **Session Auth:** All billing routes require valid session (auth guard)
- **Rate Limiting:** Checkout and portal endpoints rate-limited per user
- **Product ID Validation:** Only configured product IDs allowed in checkout requests
- **User Resolution:** Webhook uses externalId (userId) primary, falls back to email lookup

## Related Areas

- [Auth Codemap](./AUTH.md) - Session management, user authentication
- [Database Codemap](./DATABASE.md) - Subscription schema, User model extensions
- [INDEX](./INDEX.md) - Overview and navigation

## Migration History

- **2026-02-28:** Add billing schema, webhook handler, API routes
- See `packages/database/prisma/migrations/` for schema version history

## Testing

**Unit tests:**

- `packages/billing/src/plan-config.test.ts` - Plan configuration validation (Vitest)
- `packages/billing/src/subscription.test.ts` - Subscription utils (Vitest)

**Integration tests:**

- `apps/app/src/app/api/billing/checkout/route.test.ts` - Checkout API route (Vitest)
- `apps/app/src/lib/resolve-callback-url.test.ts` - Callback URL resolution (Vitest)

**Configuration:**

- `packages/billing/vitest.config.ts` - Billing package Vitest setup
- `apps/app/vitest.config.ts` - App Vitest setup

**Run tests:**

```bash
pnpm test                 # Run all tests
pnpm --filter @repo/billing test  # Run billing package tests
pnpm --filter @jjlabs/app test    # Run app tests
```

---

**Last Verified:** Against commit `d1803ef` (feat: add multi-tier pricing, vitest setup, and Next.js 16 proxy migration)
