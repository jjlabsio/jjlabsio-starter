# jjlabsio-starter

SaaS 서비스를 빠르게 구축하기 위한 모노레포 스타터 템플릿.

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript (strict mode)
- **Monorepo**: Turborepo, pnpm
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Linting**: ESLint 9, Prettier, Husky + lint-staged

## Project Structure

```
apps/
  app/               # SaaS 대시보드 애플리케이션 (port 3000)
  web/               # 랜딩페이지 (port 3001)
packages/
  ui/                # 공유 UI 컴포넌트, hooks, utils
  eslint-config/     # 공유 ESLint 설정
  typescript-config/ # 공유 TypeScript 설정
```

## Usage

### 1. 레포 복사

```bash
npx degit jjlabsio/starter my-project
cd my-project
pnpm install
```

### 2. DB 이름 변경

`docker-compose.yml`에서 `POSTGRES_DB`를 프로젝트에 맞게 수정합니다.

```yaml
# docker-compose.yml
POSTGRES_DB: my-project # starter -> 원하는 이름으로 변경
```

`packages/database/.env`의 `DATABASE_URL`도 동일하게 변경합니다.

```
DATABASE_URL="postgresql://admin:admin@localhost:5432/my-project?schema=public"
DIRECT_URL="postgresql://admin:admin@localhost:5432/my-project?schema=public"
```

### 3. 개발 서버 실행

```bash
docker compose up -d   # PostgreSQL 실행
pnpm dev               # 개발 서버 실행
```

## Commands

```bash
pnpm dev          # 모든 앱 개발 서버 실행
pnpm build        # 모든 앱 빌드
pnpm lint         # 린트 검사
pnpm typecheck    # 타입 검사
pnpm format       # Prettier 포매팅
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
