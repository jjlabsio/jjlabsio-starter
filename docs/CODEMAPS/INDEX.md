# Codemaps Index

**Last Updated:** 2026-02-28

Central reference for jjlabsio-starter monorepo architecture. Each codemap documents a major area of the codebase.

## Areas

| Area                      | Focus                                                | Key Packages/Apps                            |
| ------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| [Billing](./BILLING.md)   | Polar integration, subscription management, webhooks | `@repo/billing`, `apps/app` (billing routes) |
| [Auth](./AUTH.md)         | Better Auth configuration, session management        | `@repo/auth`, `apps/app` (auth routes)       |
| [Database](./DATABASE.md) | Prisma schema, migrations, data models               | `@repo/database`                             |
| [UI](./UI.md)             | Shared React components, design system               | `@repo/ui`                                   |

## Quick Navigation

**For feature work:** Check the relevant area codemap to understand component responsibilities and data flow.

**For debugging:** Use codemaps to trace how data flows through the system, identify ownership of each module, and find related files.

**For onboarding:** Start with this INDEX, then read area codemaps in order of your task focus.

## Monorepo Structure

```
apps/
  app/              # SaaS application (port 3000)
  web/              # Marketing/landing page (port 3001)
packages/
  auth/             # Auth configuration & utilities
  billing/          # Billing service abstraction
  database/         # Prisma client & schema
  ui/               # Shared React components
  eslint-config/    # Lint rules
  typescript-config/ # TypeScript configs
```

## Technology Stack

- **Framework:** Next.js 16, React 19
- **Language:** TypeScript 5.7 (strict)
- **Monorepo:** Turborepo 2.6, pnpm 10.4
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Auth:** Better Auth with Google OAuth
- **Database:** Prisma ORM + PostgreSQL (Supabase)
- **Billing:** Polar (subscriptions, webhooks, customer portal)
- **Runtime:** Node.js >= 20

## External Dependencies

Major workspace dependencies:

- `@polar-sh/sdk` - Polar API client (billing package)
- `@t3-oss/env-nextjs` - Environment validation
- `better-auth` - Authentication library
- `@prisma/client` - Database ORM
- `shadcn/ui` - Component library
- `tailwindcss` - Utility CSS framework
- `next` - React framework
- `zod` - Schema validation

## Key Contacts & Files

- **Environment Setup:** `CLAUDE.md` (this repo)
- **Project README:** `README.md`
- **Billing Docs:** `POLAR_SETUP.md` (if exists)
- **Database:** `packages/database/README.md`
- **Auth Config:** `packages/auth/README.md`

---

**Remember:** When updating code, keep codemaps in sync. Stale documentation is worse than none.
