# @repo/database

모노레포 전체에서 공유하는 Prisma 데이터베이스 패키지.

- 개발 환경: 로컬 PostgreSQL
- 프로덕션 환경: Supabase (PostgreSQL)

---

## 환경 구성

### 개발 환경 (로컬 PostgreSQL)

`packages/database/.env`:

```
DATABASE_URL="postgresql://admin:admin@localhost:5432/starter?schema=public"
```

Docker Compose로 로컬 DB를 실행한다 (프로젝트 루트의 `docker-compose.yml`):

```bash
docker compose up -d
```

### 프로덕션 환경 (Supabase)

Supabase 대시보드 > Project Settings > Database > Connection string에서 연결 문자열을 확인한다.

배포 플랫폼(Vercel 등)에 다음 환경변수를 등록한다:

| 환경변수       | 용도                           | 포트 |
| -------------- | ------------------------------ | ---- |
| `DATABASE_URL` | PgBouncer 경유 (런타임 쿼리용) | 6543 |
| `DIRECT_URL`   | 직접 연결 (마이그레이션용)     | 5432 |

```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

`DIRECT_URL`은 optional이므로 로컬 개발 시에는 설정하지 않아도 된다.

---

## 앱에서 사용하기

### 1. 의존성 추가

```bash
pnpm --filter <app-name> add @repo/database@workspace:*
```

### 2. next.config.ts 설정

```ts
const nextConfig = {
  transpilePackages: ["@repo/database"],
};
```

### 3. 환경변수 설정

앱 루트에 `.env` 파일을 생성하고 `DATABASE_URL`을 설정한다.

```
DATABASE_URL="postgresql://admin:admin@localhost:5432/starter?schema=public"
```

### 4. 배포용 빌드 스크립트 추가

앱의 `package.json`에 `build:deploy` 스크립트를 추가한다.

```json
{
  "scripts": {
    "build": "next build",
    "build:deploy": "pnpm --filter @repo/database db:migrate:deploy && next build"
  }
}
```

- `build` - 로컬 개발/일반 빌드용 (마이그레이션 없음)
- `build:deploy` - 배포 환경용 (마이그레이션 적용 후 빌드)

### 5. Import

```ts
import { database } from "@repo/database";
import type { User, Comment } from "@repo/database";
```

서버 컴포넌트에서만 사용 가능하다 (`server-only` 적용됨).

---

## 개발 워크플로우

### 스키마 변경 후 마이그레이션 생성

```bash
pnpm --filter @repo/database db:migrate:dev --name <migration-name>
```

`prisma/migrations/` 디렉토리에 마이그레이션 파일이 생성된다. 반드시 git에 커밋한다.

### 마이그레이션 없이 빠르게 스키마 반영 (프로토타이핑)

```bash
pnpm --filter @repo/database db:push
```

프로토타이핑 단계에서만 사용한다. 마이그레이션 히스토리가 남지 않으므로 배포 환경에서는 사용하지 않는다.

### 기타 명령어

| 명령어              | 설명                                  |
| ------------------- | ------------------------------------- |
| `db:generate`       | Prisma Client 재생성                  |
| `db:migrate:status` | 마이그레이션 적용 상태 확인           |
| `db:migrate:reset`  | DB 초기화 후 전체 마이그레이션 재적용 |
| `db:studio`         | Prisma Studio (DB GUI) 실행           |

모든 명령어는 `pnpm --filter @repo/database <command>` 형태로 실행한다.

---

## 배포 순서

배포 환경에서 `build:deploy` 스크립트 실행 시 다음 순서로 동작한다.

```
1. pnpm install
   의존성 설치 및 prisma 바이너리 준비

2. prisma generate
   Prisma Client 생성 (turbo의 ^build 의존성으로 자동 실행)

3. prisma migrate deploy
   prisma/migrations/ 내 마이그레이션 파일을 프로덕션 DB에 적용
   - 새 마이그레이션을 생성하지 않음
   - 아직 적용되지 않은 마이그레이션만 순서대로 실행
   - DIRECT_URL을 통해 PgBouncer를 우회하여 직접 연결

4. next build
   Next.js 앱 빌드
```

### Vercel 배포 시

Build Command를 다음으로 설정한다:

```
pnpm --filter @repo/database build && pnpm --filter <app-name> build:deploy
```

Environment Variables에 `DATABASE_URL`과 `DIRECT_URL`을 등록한다.

---

## 스키마 구조

멀티파일 스키마를 사용한다 (`prisma/schema/` 디렉토리).

```
prisma/schema/
  base.prisma      # generator, datasource 설정 (directUrl 포함)
  user.prisma      # User 모델
  comment.prisma   # Comment 모델
```

새 모델을 추가할 때는 `prisma/schema/` 디렉토리에 별도 파일로 생성한다.
