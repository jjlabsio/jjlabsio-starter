# CLAUDE.md

## Project Overview

SaaS 서비스를 빠르게 구축하기 위한 starter template 모노레포.

- **apps/app**: SaaS 애플리케이션 본체 (대시보드, 사용자 기능)
- **apps/web**: 랜딩페이지 (마케팅, 소개 페이지) - 추가 예정

---

## Tech Stack

| Category  | Technology                                    |
| --------- | --------------------------------------------- |
| Framework | Next.js 16, React 19                          |
| Language  | TypeScript 5.7 (strict mode)                  |
| Monorepo  | Turborepo 2.6, pnpm 10.4                      |
| Styling   | Tailwind CSS v4, shadcn/ui (radix-vega theme) |
| Font      | Pretendard Variable (local)                   |
| Linting   | ESLint 9 (flat config), Prettier              |
| Auth      | Better Auth (Google OAuth, Prisma adapter)    |
| Database  | Prisma ORM, PostgreSQL (Supabase)             |
| Git Hooks | Husky + lint-staged                           |
| Runtime   | Node.js >= 20                                 |

---

## Project Structure

```
apps/
  app/              # SaaS app (dashboard, sidebar, charts)
  web/              # Landing page (planned)
packages/
  auth/             # Better Auth server/client config, env validation
  database/         # Prisma client, schema, migrations
  ui/               # Shared shadcn/ui components, hooks, utils
  eslint-config/    # Shared ESLint configs (base, next, react-internal)
  typescript-config/ # Shared TypeScript configs (base, nextjs, react-library)
```

---

## Commands

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
pnpm format       # Format with Prettier
```

---

## Workspace Dependencies

Internal packages use `workspace:*` protocol:

- `@repo/auth` - Better Auth server/client (`packages/auth`)
- `@repo/database` - Prisma client and schema (`packages/database`)
- `@repo/ui` - shared UI components (`packages/ui`)
- `@repo/eslint-config` - shared ESLint config (`packages/eslint-config`)
- `@repo/typescript-config` - shared TypeScript config (`packages/typescript-config`)

---

## Conventions

### File Organization

- Path alias: `@/*` maps to `./src/*` in each app
- Components: `src/components/`
- Styles: `src/styles/`
- Types: `src/types/`

### Adding shadcn/ui Components

Components are managed in `packages/ui`. The `components.json` config points to `packages/ui`.

### New App Setup

New apps under `apps/` should:

1. Extend `@repo/typescript-config/nextjs.json`
2. Use `@repo/eslint-config/next.js`
3. Import shared components from `@repo/ui`
4. Transpile `@repo/ui`, `@repo/database`, `@repo/auth` in `next.config.ts`

### Pre-commit

Husky runs lint-staged on commit: ESLint auto-fix + Prettier formatting for `*.ts`, `*.tsx`, `*.json`, `*.md` files.
