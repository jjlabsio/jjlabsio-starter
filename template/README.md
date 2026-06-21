# {{PROJECT_NAME}}

> TODO: 프로젝트에 대한 설명을 여기에 작성하세요.

## Initial Setup

Scaffold 완료 후 아래 항목을 프로젝트에 맞게 설정합니다.

이미 완료된 항목:

- 프로젝트명 치환
- 로컬 개발 포트 배정
- `.env.example` 기반 `.env` 파일 생성
- `pnpm install`

### Step 1. Product Brief 작성

제품 정의와 현재 스코프를 먼저 정리합니다.

- `docs/product/product-brief.md`

이 문서는 이후 기능 범위, 화면 구성, 용어, 에이전트 작업 컨텍스트의 기준으로 사용합니다.

### Step 2. Auth Secret 생성

`apps/app/.env`의 `BETTER_AUTH_SECRET` 값을 실제 secret으로 교체합니다.

```bash
openssl rand -base64 32
```

### Step 3. Database 설정

로컬 개발은 기본 `docker-compose.yml`의 PostgreSQL을 사용할 수 있습니다.

```bash
docker compose up -d
pnpm --filter @repo/database db:migrate:dev
```

프로덕션 또는 공유 개발 DB는 Neon PostgreSQL을 기본 권장합니다. 연결 정보는 아래 파일을 기준으로 설정합니다.

- `apps/app/.env`
- `packages/database/.env`

필요한 값:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Step 4. Google OAuth 설정

[Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 OAuth 자격 증명 생성 후 `apps/app/.env`에 설정합니다.

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Step 5. Polar Billing 설정

[Polar](https://polar.sh)에서 organization, products, API key, webhook을 준비한 후 `apps/app/.env`와 `apps/web/.env`에 설정합니다.

Webhook URL:

```text
https://your-domain.com/api/webhooks/polar
```

Webhook events:

```text
subscription.created
subscription.updated
subscription.canceled
```

Environment variables:

```bash
POLAR_ACCESS_TOKEN="pat_xxx"
POLAR_WEBHOOK_SECRET="whs_xxx"
POLAR_ORGANIZATION_ID="org_xxx"
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY="prod_xxx_starter_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY="prod_xxx_starter_yearly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY="prod_xxx_pro_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY="prod_xxx_pro_yearly"
```

가격과 플랜 카피는 앱의 pricing 관련 파일에서 실제 제품에 맞게 조정합니다.

### Step 6. Resend Email 설정

[Resend](https://resend.com) API key를 발급한 후 `apps/app/.env`에 설정합니다.

```bash
RESEND_API_KEY="re_xxx"
```

### Step 7. Sentry 설정

Sentry로 런타임 에러를 수집하려면 [Sentry](https://sentry.io)에서 Next.js 프로젝트를 생성한 후 `apps/app/.env`에 DSN을 설정합니다.

```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

`NEXT_PUBLIC_SENTRY_DSN`이 비어 있으면 Sentry는 비활성화됩니다.

이 starter는 Vercel 빌드 메모리 사용량을 줄이기 위해 Sentry source map upload를 기본 비활성화합니다.

## Development

```bash
pnpm dev
```

`pnpm dev`는 workspace dev task를 실행합니다. 앱별 포트는 scaffold 중 배정된 값을 사용합니다.

## Commands

```bash
pnpm dev                  # 개발 서버 실행
pnpm build                # 전체 빌드
pnpm lint                 # 린트
pnpm typecheck            # 타입 체크
pnpm test                 # 테스트
pnpm format               # Prettier 포매팅
pnpm db:reset             # 로컬 DB 볼륨 초기화 후 개발 마이그레이션 적용
pnpm db:migrate:deploy    # 프로덕션 마이그레이션 적용
```

Database package commands:

```bash
pnpm --filter @repo/database db:migrate:dev
pnpm --filter @repo/database db:migrate:deploy
pnpm --filter @repo/database db:studio
```
