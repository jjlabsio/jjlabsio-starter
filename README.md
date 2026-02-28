# {{PROJECT_NAME}}

> TODO: 프로젝트에 대한 설명을 여기에 작성하세요.

## Initial Setup

> AI 어시스턴트가 이 프로젝트를 셋팅할 때 아래 단계를 순서대로 실행하세요.
>
> **이미 완료된 항목:** 프로젝트명 치환, `.env` 파일 생성, `pnpm install`

### Step 1. BETTER_AUTH_SECRET 생성

`apps/app/.env`의 `BETTER_AUTH_SECRET`이 아직 placeholder입니다. 실제 값으로 업데이트하세요:

```bash
openssl rand -base64 32
```

생성된 값을 `apps/app/.env`의 `BETTER_AUTH_SECRET`에 설정합니다.

### Step 2. 플러그인 설치 확인

[jj@jjlabsio-claude-code](https://github.com/jjlabsio/jjlabsio-claude-code) 플러그인이 필요합니다.

플러그인 설치 여부를 `/plugins` 명령으로 확인하고, 없으면 설치합니다:

```
/plugin install jj@jjlabsio-claude-code
```

> **중요:** 플러그인 설치 후 대화를 재시작해야 합니다. 재시작 후 이 README를 다시 참조해 나머지 단계를 계속 진행하세요.

### Step 3. Docker 및 DB 마이그레이션

```bash
docker compose up -d                          # PostgreSQL 실행
pnpm --filter @repo/database db:migrate:dev   # 마이그레이션 실행
```

### Step 4. Codemaps 생성

```
/jj:update-docs
```

---

## Polar Billing 설정 (수동)

[polar.sh](https://polar.sh)에서 아래 항목을 준비한 후 `apps/app/.env`에 설정합니다.

**1. Organization 생성 후 제품 2개 추가** (월간, 연간)

**2. API Key 발급**: Settings → API Keys → Personal Access Token

**3. Webhook 등록**: Settings → Webhooks → Add Endpoint

- URL: `https://your-domain.com/api/webhooks/polar`
- Events: `subscription.created`, `subscription.updated`, `subscription.canceled`

**4. 환경변수 설정:**

```
POLAR_ACCESS_TOKEN="pat_xxx"
POLAR_WEBHOOK_SECRET="whs_xxx"
POLAR_ORGANIZATION_ID="org_xxx"
NEXT_PUBLIC_POLAR_PRODUCT_ID_MONTHLY="prod_xxx_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_YEARLY="prod_xxx_yearly"
```

**5. Pricing 페이지 가격 업데이트**: `apps/app/src/app/(public)/pricing/page.tsx`의 `$XX` 플레이스홀더를 실제 가격으로 교체

---

## Google OAuth 설정 (수동)

[Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 OAuth 자격 증명 생성 후 `apps/app/.env`에 설정합니다:

```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 개발 서버 실행

```bash
pnpm dev
```

---

## Commands

```bash
pnpm dev          # 전체 앱 개발 서버 실행
pnpm build        # 전체 빌드
pnpm lint         # 린트
pnpm typecheck    # 타입 체크
pnpm format       # Prettier 포매팅
```

```bash
pnpm --filter @repo/database db:migrate:dev      # 개발 마이그레이션 생성 및 적용
pnpm --filter @repo/database db:migrate:deploy   # 프로덕션 마이그레이션 적용
pnpm --filter @repo/database db:studio           # Prisma Studio 실행
```
