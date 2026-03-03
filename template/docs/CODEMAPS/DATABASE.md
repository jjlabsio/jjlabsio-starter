# Database Codemap

**Last Updated:** 2026-02-28

**Entry Points:**

- `@repo/database` (Prisma client)
- `packages/database/prisma/` (schema & migrations)

---

## Architecture

Prisma ORM with PostgreSQL (Supabase). Modular schema organization via multiple `.prisma` files.

## Schema Organization

Located in `packages/database/prisma/schema/`:

| File                  | Models                                   |
| --------------------- | ---------------------------------------- |
| `base.prisma`         | Generator, datasource                    |
| `user.prisma`         | User (auth subject, billing reference)   |
| `session.prisma`      | Session (Better Auth)                    |
| `account.prisma`      | Account (OAuth provider links)           |
| `subscription.prisma` | Subscription (Polar integration)         |
| `verification.prisma` | Verification (email verification tokens) |

## Key Models

### User

```prisma
model User {
  id              String
  email           String        @unique
  name            String?
  emailVerified   Boolean
  image           String?
  createdAt       DateTime
  updatedAt       DateTime
  polarCustomerId String?       @unique  -- Link to Polar customer

  sessions        Session[]     -- 1:N relationship
  accounts        Account[]     -- OAuth provider accounts
  subscription    Subscription? -- 0:1 relationship (billing)
}
```

### Subscription

```prisma
model Subscription {
  id                  String    @id
  userId              String    @unique  -- 1:1 to User
  polarSubscriptionId String    @unique  -- External: Polar
  polarProductId      String            -- Polar product
  polarPriceId        String            -- Polar price tier
  status              SubscriptionStatus
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean
  trialStart          DateTime?
  trialEnd            DateTime?
  createdAt           DateTime
  updatedAt           DateTime
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  CANCELED
  PAST_DUE
  UNPAID
}
```

## Migrations

Located in `packages/database/prisma/migrations/`:

- `20260228000000_init` - Initial auth schema
- `20260228000001_add_billing` - Subscription model + User.polarCustomerId
- `20260228000002_nullable_period_end` - currentPeriodEnd nullable fix

## Integration with Other Areas

- **Auth:** User, Session, Account models (Better Auth)
- **Billing:** Subscription model, User.polarCustomerId (Polar webhooks)

## Commands

```bash
# Generate Prisma client
pnpm --filter @repo/database db:generate

# Create and apply migration (dev)
pnpm --filter @repo/database db:migrate:dev

# Apply migrations (prod)
pnpm --filter @repo/database db:migrate:deploy

# View data in Prisma Studio
pnpm --filter @repo/database db:studio
```

## Related Areas

- [Billing Codemap](./BILLING.md) - Uses Subscription model
- [Auth Codemap](./AUTH.md) - Uses User, Session, Account models

---

**Note:** Database codemap to be expanded as schema grows. For full schema details, see `packages/database/prisma/schema/`.
