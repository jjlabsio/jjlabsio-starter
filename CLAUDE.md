# CLAUDE.md

> **Claude 컨텍스트 윈도우 자동 로드 파일.**
> 내용 추가 시 토큰 효율 고려: 중복 제거, 간결한 표현, 불필요한 설명 지양. 문체는 명사형 종결 표현 사용.
> 프로젝트 개요 및 시작 방법: **README.md** 참조.
> `docs/CODEMAPS/INDEX.md` 존재 시 작업 시작 전 반드시 먼저 참조. 소스 파일 직접 탐색 전 `docs/CODEMAPS/` 확인.

---

## Tech Stack

| Category  | Technology                                     |
| --------- | ---------------------------------------------- |
| Framework | Next.js 16, React 19                           |
| Language  | TypeScript 5.7 (strict mode)                   |
| Monorepo  | Turborepo 2.6, pnpm 10.4                       |
| Styling   | Tailwind CSS v4, shadcn/ui (base-vega theme)   |
| Font      | Pretendard Variable (local)                    |
| Linting   | ESLint 9 (flat config), Prettier               |
| Auth      | Better Auth (Google OAuth, Prisma adapter)     |
| Database  | Prisma ORM, PostgreSQL (Supabase as host)      |
| Billing   | Polar (subscription, webhook, customer portal) |
| Git Hooks | Husky + lint-staged                            |
| Runtime   | Node.js >= 20                                  |

---

## Project Structure

```
apps/
  app/              # SaaS app (port 3000)
  web/              # Landing page (port 3001)
packages/
  auth/             # Better Auth server/client config, env validation
  billing/          # Polar billing: subscription CRUD, checkout, portal, webhook
  database/         # Prisma client, schema, migrations
  ui/               # Shared shadcn/ui components, hooks, utils
  eslint-config/    # Shared ESLint configs (base, next, react-internal)
  typescript-config/ # Shared TypeScript configs (base, nextjs, react-library)
tools/              # 스캐폴딩 CLI 도구 — codemap 탐색 제외
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

```bash
pnpm --filter @repo/database db:migrate:dev      # 개발 마이그레이션 생성 및 적용
pnpm --filter @repo/database db:migrate:deploy   # 프로덕션 마이그레이션 적용
pnpm --filter @repo/database db:studio            # Prisma Studio 실행
```

---

## Workspace Dependencies

내부 패키지 `workspace:*` 프로토콜 사용:

| Package                      | Import                    | Description                                |
| ---------------------------- | ------------------------- | ------------------------------------------ |
| `packages/auth`              | `@repo/auth`              | Better Auth server/client config           |
| `packages/billing`           | `@repo/billing`           | Polar billing, subscription, webhook utils |
| `packages/database`          | `@repo/database`          | Prisma client, schema, migrations          |
| `packages/ui`                | `@repo/ui`                | Shared shadcn/ui components                |
| `packages/eslint-config`     | `@repo/eslint-config`     | Shared ESLint config                       |
| `packages/typescript-config` | `@repo/typescript-config` | Shared TypeScript config                   |

---

## Conventions

### File Organization

- Path alias: `@/*` maps to `./src/*` in each app
- Components: `src/components/`
- Styles: `src/styles/`
- Types: `src/types/`

### Adding shadcn/ui Components

**항상 `packages/ui`를 통해 shadcn/ui 컴포넌트 우선 활용.** 직접 구현 전 shadcn 컴포넌트 존재 여부 확인 필수.

컴포넌트 관리: `packages/ui` / 설정: `components.json` → `packages/ui`

```bash
npx shadcn@latest add <component-name> -c packages/ui
```

### New App Setup

`apps/` 하위 신규 앱 설정:

1. `@repo/typescript-config/nextjs.json` 확장
2. `@repo/eslint-config/next.js` 사용
3. `@repo/ui`에서 공유 컴포넌트 import
4. `next.config.ts`에서 `@repo/ui`, `@repo/database`, `@repo/auth` transpile 설정

### Database

Supabase: PostgreSQL 호스팅 전용. **Supabase Client(`@supabase/supabase-js`) 사용 금지.** 모든 DB 접근은 `@repo/database` (Prisma) 경유.

### Pre-commit

커밋 시 Husky → lint-staged 실행: `*.ts`, `*.tsx`, `*.json`, `*.md` 파일 ESLint auto-fix + Prettier 포매팅.
