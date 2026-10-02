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

로컬 개발 서버(`NODE_ENV=development`, `BETTER_AUTH_URL`이 `localhost` 또는 `127.0.0.1`)에서는 로그인 화면에 개발용 계정 버튼도 표시됩니다. 앱 개발 서버는 `127.0.0.1`에만 바인딩됩니다. 첫 클릭 시 Better Auth가 `dev@example.test` 계정을 생성하고, 대시보드 접근을 위한 로컬 테스트 구독을 준비합니다. 이후에는 같은 계정과 데이터로 로그인하며, 로그인할 때마다 테스트 구독이 활성화됩니다. 비밀번호는 서버에서 `BETTER_AUTH_SECRET`으로 파생하므로 입력하거나 클라이언트에 노출하지 않습니다. 프로덕션 빌드에서는 버튼과 이메일·비밀번호 인증이 비활성화됩니다. 개발용 로그인으로 실제 운영 DB에 연결하지 마세요.

### Step 5. Polar Billing 설정

[Polar](https://polar.sh)에서 organization, products, API key, webhook을 준비합니다.

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

`apps/app/.env`에는 서버에서 사용하는 Polar secret과 product ID를 설정합니다.

```bash
POLAR_ACCESS_TOKEN="pat_xxx"
POLAR_WEBHOOK_SECRET="whs_xxx"
POLAR_ORGANIZATION_ID="org_xxx"
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY="prod_xxx_starter_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY="prod_xxx_starter_yearly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY="prod_xxx_pro_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY="prod_xxx_pro_yearly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_MONTHLY="prod_xxx_premium_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY="prod_xxx_premium_yearly"
```

`apps/web/.env`에는 public product ID만 설정합니다.

```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY="prod_xxx_starter_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY="prod_xxx_starter_yearly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY="prod_xxx_pro_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY="prod_xxx_pro_yearly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_MONTHLY="prod_xxx_premium_monthly"
NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY="prod_xxx_premium_yearly"
```

- 공통 요금제 설정: `packages/billing/src/plan-config.ts`의 Starter·Pro·Premium 예시 가격·문구를 실제 제품에 맞게 조정.
- Pro product ID: 결제 연결 시 설정. 미설정 시 앱의 Pro 구매 버튼 비활성화, 웹에서는 로그인으로 이동. 로그인·무료 체험·기존 구독 관리는 유지.

#### 기존 요금제 ENV 이전

- 요금제 순서: Starter → Pro → Premium. 단계별 가격·한도·기능 유지.
- 이전 중간 단계의 `NEXT_PUBLIC_POLAR_PRODUCT_ID_BASE_MONTHLY/YEARLY` 값을 새 `NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY/YEARLY`로 이동.
- 이전 최상위 단계의 `NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY/YEARLY` 값을 새 `NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_MONTHLY/YEARLY`로 이동.
- 앱·웹의 로컬 ENV와 배포 환경에서 두 변경을 동시에 적용 후 재시작·재빌드. 기존 `PRO` 값을 그대로 두면 중간 요금제로 잘못 판별되는 위험.
- 상품 ID 값과 기존 구독 DB 데이터 유지. Polar 대시보드의 상품명은 별도 수정 대상. 구버전 ENV 별칭 미지원.

#### 앱 상단 구독 상태·도움말

- 로그인한 사용자의 `Subscription.status`·`trialEnd`를 서버에서 조회해 공통 상단바에 제공.
- `TRIALING` 상태에서만 `Trial ends in`·남은 일수 표시. 1분마다 갱신하며 만료 시 서버 구독 검증 재실행. 클릭 시 `/pricing` 이동.
- `ACTIVE` 상태에는 `Plan`·현재 요금제 이름 배지 표시. 클릭 시 `/settings/billing` 이동.
- 요금제 이름: 구독 `polarProductId`와 `packages/billing/src/plan-config.ts`의 `PRODUCT_IDS`·`TIERS`로 서버에서 판별. 상단과 Billing에 같은 이름 표시. 상품 ID가 없거나 설정과 맞지 않으면 `Unknown` 표시.
- 무료 체험 시작: 기존 `/pricing` → `POST /api/billing/trial` → DB 저장 흐름 유지. 기본 14일, 계정당 중복 시작 차단. 유료 구독에는 Trial 표시 없음.
- Help와 요금제 지원 메일: `apps/app/src/lib/support.ts`의 `SUPPORT_EMAIL`을 실제 지원 주소로 변경. 기본값은 `support@example.com`.
- 테마 선택: 사이드바 하단 계정 메뉴에서 제공. 상단 테마 버튼 제거.
- 상태 비교: `/filter-examples#subscription-header-examples`에서 체험·종료 임박·Starter·Pro·Premium 상단바를 함께 확인. 실제 구독 변경 없음.

### Step 6. Resend Email 설정

Resend 발송 로직은 `packages/email`에 기본 포함됩니다. [Resend](https://resend.com) API key 발급·발신 도메인 검증 후, 이메일을 발송하는 앱(`apps/app`, `apps/admin`)의 `.env` 또는 배포 환경 변수에 아래 두 값을 설정합니다.

```bash
RESEND_API_KEY="re_xxx"
EMAIL_FROM="Your Service <welcome@your-verified-domain.com>"
```

두 값을 설정하면 Google 첫 가입 시 공통 이메일 레이아웃을 사용하는 웰컴 이메일을 발송합니다. 미설정 시 생략하며, 재로그인·데브 로그인·Admin에는 발송하지 않습니다. 실패해도 가입을 유지합니다. 레이아웃과 템플릿 추가 규칙: [서비스 이메일](docs/architecture/email.md).

새 이메일은 서버 코드에서 `import { sendEmail } from "@repo/email"`로 공통 발송 함수를 호출하면 됩니다. HTML/일반 텍스트 렌더링·기본 발신자·설정 검사·공급자 오류 처리가 포함되어 SDK를 앱별로 다시 구현할 필요가 없습니다. 개별 수신 일괄 발송은 같은 패키지의 `sendEmailBatch` 사용. 호출 예제와 중복 방지 규칙: [Resend 공통 발송 API](docs/architecture/email.md#resend-공통-발송-api).

양식 확인은 `pnpm --filter @repo/email dev`로 이메일 모듈의 독립 React Email 미리보기 서버 실행(Node.js 20.19 이상). 앱·Admin 라우트와 분리되며 API 키·DB 불필요. 미리보기 포트도 scaffold에서 별도 배정.

관리자 작성/발송은 `apps/admin`의 `/emails`에서 제공. 제목·본문·불릿·버튼·구분선 조합 → 초안 저장 → 미리보기 → Trial/구독 대상 확인 → 서비스 공지 발송. DB 마이그레이션 적용 및 Admin의 `RESEND_API_KEY`·`EMAIL_FROM` 설정 필요. 홍보 메일 수신 동의·수신 거부는 별도 구현 후 사용. 안정성·재개 규칙은 [서비스 이메일](docs/architecture/email.md) 참조.

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

생성되는 workspace 앱:

- `apps/app`: 인증, 결제, 대시보드가 포함된 SaaS 앱
- `apps/web`: 랜딩/마케팅 웹 앱
- `apps/api`: NestJS API 앱
- `apps/worker`: NestJS Worker 앱

### UI 예시 화면

- 테이블 구현·서버 조회·선택·페이지네이션 컨벤션: [docs/components/data-table.md](docs/components/data-table.md). `/tables` 예시 화면을 제거해도 공통 구현과 컨벤션을 유지합니다.

상단 워크스페이스는 아바타·이름만 표시하며 전환 메뉴를 제공하지 않습니다. Requests는 범용 요청 목록, Projects는 프로젝트 관리 예시입니다. 공통 컴포넌트의 디자인·동작은 유지합니다.

앱 메뉴의 `Requests`(`/requests`), `Actions`(`/actions`), `Company`(`/settings/company`)는 공통 디자인 시스템을 검수하기 위한 예시 화면입니다. 검색·필터·선택·폼은 화면 안에서 동작하지만 예시 데이터는 서버에 저장하지 않으며 새로고침하면 초기화됩니다. 실제 서비스 기능을 만들 때는 `DESIGN.md`와 `packages/ui`의 공통 컴포넌트를 기준으로 교체합니다.

`Project settings`의 `Profile`(`/settings/profile`)과 `Projects`(`/settings/projects`)는 폼·태그 편집과 검색·추가·수정·삭제 예시입니다. 저장한 예시 데이터는 현재 브라우저 탭의 `sessionStorage`에 유지되며 새로고침 후 복원됩니다. 실제 계정·DB와는 연동되지 않으며 탭을 닫으면 사라집니다.

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

## Admin

별도 Next.js 앱 `apps/admin`으로 실행·배포. `pnpm --filter admin dev`. 이메일 허용 목록·별도 인증 비밀키·Google 설정은 [Admin 안내](apps/admin/README.md) 참조. 리워드 검수만 포함하며 사용자 구독과 독립.

로그인은 앱·어드민 공통 `SignInLayout` 사용. `NEXT_PUBLIC_WEB_URL`의 이용약관·개인정보 처리방침 링크와 Google 로그인 안내 표시. 어드민 데브 로그인은 관리자 이메일 설정 + development + localhost/127.0.0.1에서만 사용하며 구독 로직 없음.
