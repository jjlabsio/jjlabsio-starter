# Billing Codemap

**Last Updated:** 2026-02-28

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

| Module                    | Purpose                         | Exports                                                        | Dependencies                         |
| ------------------------- | ------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `client.ts`               | Initializes Polar SDK           | `polar` (Polar instance)                                       | `@polar-sh/sdk`, `keys.ts`           |
| `keys.ts`                 | Environment variable validation | `env` (validated env vars)                                     | `@t3-oss/env-nextjs`, `zod`          |
| `subscription.ts`         | Subscription data operations    | `getSubscription`, `upsertSubscription`                        | `@repo/database`, `types.ts`         |
| `subscription-utils.ts`   | Status mapping & validation     | `isSubscriptionActive`, `mapPolarStatus`                       | `types.ts`                           |
| `webhook.ts`              | Webhook re-exports              | `validateEvent`, `WebhookVerificationError`                    | `@polar-sh/sdk/webhooks`             |
| `types.ts`                | Type definitions                | `Subscription`, `SubscriptionStatus`, `UpsertSubscriptionData` | (pure types)                         |
| `require-subscription.ts` | Route guard middleware          | `requireSubscription`                                          | `subscription.ts`, `next/navigation` |

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

- `NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY` - Monthly plan product ID
- `NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY` - Yearly plan product ID

**See:** `packages/billing/src/keys.ts` for schema validation.

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

- Unit tests: `packages/billing/src/subscription.test.ts` (subscription utils)
- Integration: E2E testing of checkout/webhook flows (see app integration tests)

---

**Last Verified:** Against commits `d8a2b3e`, `e4ebf4f`, `81017be`, `16152e0`
