# Auth Codemap

**Last Updated:** 2026-02-28

**Entry Points:**

- `@repo/auth` (package export)
- `apps/app/src/app/api/auth/*` (Better Auth routes)

---

## Architecture

Better Auth handles authentication with Google OAuth and session management via Prisma adapter.

## Quick Reference

| Module         | Location                      | Purpose                                    |
| -------------- | ----------------------------- | ------------------------------------------ |
| Config         | `packages/auth/src/index.ts`  | Better Auth setup, OAuth, database adapter |
| Client         | `packages/auth/src/client.ts` | Client-side auth utilities                 |
| Env Validation | `packages/auth/src/keys.ts`   | Auth-related environment variables         |

## Session Management

- **Sessions stored in:** Database (Prisma, `Session` model in `packages/database`)
- **Session cookie:** `better-auth` manages session cookies automatically
- **Verification:** `auth.api.getSession({ headers })` retrieves current session

## Integration Points

- **Middleware:** `apps/app/src/middleware.ts` checks session existence on protected routes
- **Billing:** Session required for checkout and portal endpoints
- **Database:** User model linked to sessions and accounts

## Related Areas

- [Billing Codemap](./BILLING.md) - Session used in billing flows
- [Database Codemap](./DATABASE.md) - Session, User, Account models

---

**Note:** Detailed auth codemap to be expanded as auth feature complexity grows.
