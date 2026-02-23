# jjlabsio-starter

SaaS 서비스를 빠르게 구축하기 위한 모노레포 스타터 템플릿.

## Tech Stack

| Category  | Technology                                   |
| --------- | -------------------------------------------- |
| Framework | Next.js 16, React 19                         |
| Language  | TypeScript 5.7 (strict mode)                 |
| Monorepo  | Turborepo, pnpm                              |
| Styling   | Tailwind CSS v4, shadcn/ui (base-vega theme) |
| Auth      | Better Auth (Google OAuth, Prisma adapter)   |
| Database  | Prisma ORM, PostgreSQL                       |
| Font      | Pretendard Variable                          |
| Linting   | ESLint 9, Prettier, Husky + lint-staged      |

## Project Structure

```
apps/
  app/                 # SaaS 애플리케이션 (port 3000)
  web/                 # 랜딩페이지 (port 3001)
packages/
  auth/                # Better Auth 서버/클라이언트 설정
  database/            # Prisma 클라이언트, 스키마, 마이그레이션
  ui/                  # 공유 UI 컴포넌트, hooks, utils
  eslint-config/       # 공유 ESLint 설정
  typescript-config/   # 공유 TypeScript 설정
tools/
  create-jjlabs-app/   # 프로젝트 스캐폴딩 CLI
```

## Getting Started

### 1. 프로젝트 생성

```bash
npx create-jjlabs-app my-project
```

CLI가 프로젝트 이름과 레이아웃(Sidebar / Standard)을 묻고 자동으로 설정합니다.

수동으로 생성하려면:

```bash
npx degit jjlabsio/jjlabsio-starter my-project
cd my-project
pnpm install
```

### 2. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.

```bash
cp apps/app/.env.example apps/app/.env
cp packages/database/.env.example packages/database/.env
```

`apps/app/.env`에서 아래 값을 설정합니다:

```
# Database
DATABASE_URL="postgresql://admin:admin@localhost:5432/starter?schema=public"
DIRECT_URL="postgresql://admin:admin@localhost:5432/starter?schema=public"

# Better Auth
BETTER_AUTH_SECRET="replace-with-random-secret-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. DB 이름 변경

`docker-compose.yml`에서 `POSTGRES_DB`를 프로젝트에 맞게 수정합니다.

```yaml
# docker-compose.yml
POSTGRES_DB: my-project # starter -> 원하는 이름으로 변경
```

`.env` 파일의 `DATABASE_URL`, `DIRECT_URL`도 동일하게 변경합니다.

### 4. 개발 서버 실행

```bash
docker compose up -d                          # PostgreSQL 실행
pnpm --filter @repo/database db:migrate:dev   # 마이그레이션 실행
pnpm dev                                      # 개발 서버 실행
```

## Commands

```bash
pnpm dev          # 모든 앱 개발 서버 실행
pnpm build        # 모든 앱 빌드
pnpm lint         # 린트 검사
pnpm typecheck    # 타입 검사
pnpm format       # Prettier 포매팅
```

### Database

```bash
pnpm --filter @repo/database db:migrate:dev      # 개발 마이그레이션 생성 및 적용
pnpm --filter @repo/database db:migrate:deploy   # 프로덕션 마이그레이션 적용
pnpm --filter @repo/database db:studio            # Prisma Studio 실행
```

## Adding Components

프로젝트 루트에서 아래 명령어를 실행하면 `packages/ui/src/components`에 컴포넌트가 추가됩니다.

```bash
npx shadcn@latest add <component-name> -c packages/ui
```

앱에서 사용할 때는 `@repo/ui`에서 import합니다.

```tsx
import { Button } from "@repo/ui/components/button";
```

## Workspace Packages

| Package                      | Import                    | Description                      |
| ---------------------------- | ------------------------- | -------------------------------- |
| `packages/auth`              | `@repo/auth`              | Better Auth 서버/클라이언트 설정 |
| `packages/database`          | `@repo/database`          | Prisma 클라이언트, 스키마        |
| `packages/ui`                | `@repo/ui`                | 공유 UI 컴포넌트                 |
| `packages/eslint-config`     | `@repo/eslint-config`     | 공유 ESLint 설정                 |
| `packages/typescript-config` | `@repo/typescript-config` | 공유 TypeScript 설정             |
