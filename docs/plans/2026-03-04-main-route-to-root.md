# Main Route to `/` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 두 레이아웃(sidebar/standard)의 메인 화면 라우트를 `"/dashboard"` / `"/home"` 에서 `"/"` 로 변경하고, 로그인 및 구독 결제 후 리다이렉트도 `"/"` 로 통일한다.

**Architecture:** 템플릿의 `(sidebar)/dashboard/page.tsx`와 `(standard)/home/page.tsx`를 각각 부모 route group 루트인 `(sidebar)/page.tsx`, `(standard)/page.tsx`로 이동한다. `app/page.tsx` (root redirect)는 삭제하고, `(authenticated)/layout.tsx`가 미인증 사용자를 `/sign-in`으로 처리한다. 모든 `/dashboard`, `/home` 하드코딩 참조를 `"/"` 로 교체한다. scaffold CLI의 `update-redirects.ts` 단계는 불필요해져 제거한다.

**Tech Stack:** TypeScript, Next.js App Router (route groups), Vitest

---

### Task 1: resolve-callback-url 기본값 변경

**Files:**
- Modify: `template/apps/app/src/lib/resolve-callback-url.ts:1`
- Modify: `template/apps/app/src/lib/resolve-callback-url.test.ts`

**Step 1: 테스트 파일에서 `/dashboard` 폴백 기대값을 `/` 로 수정**

`template/apps/app/src/lib/resolve-callback-url.test.ts` 에서 `"/dashboard"` 로 기대하는 라인들을 `"/"` 로 변경한다. 영향받는 테스트:
- `open redirect 방지` describe 블록 전체 (4개 케이스)
- `null/undefined/빈값 처리` describe 블록 전체 (4개 케이스)

변경 후 각 케이스:
```ts
// open redirect 방지
expect(resolveCallbackUrl("https://evil.com")).toBe("/");
expect(resolveCallbackUrl("http://attacker.com/phish")).toBe("/");
expect(resolveCallbackUrl("//evil.com")).toBe("/");
expect(resolveCallbackUrl("https://evil.com/dashboard")).toBe("/");

// null/undefined/빈값 처리
expect(resolveCallbackUrl(null)).toBe("/");
expect(resolveCallbackUrl(undefined)).toBe("/");
expect(resolveCallbackUrl("")).toBe("/");
expect(resolveCallbackUrl()).toBe("/");
```

테스트 설명 문자열의 `→ /dashboard` 도 `→ /` 로 업데이트한다.

**Step 2: 테스트가 실패하는지 확인**

```bash
pnpm --filter @repo/app test -- src/lib/resolve-callback-url.test.ts
```

Expected: 8개 테스트 FAIL (기대값 `/` vs 실제 `"/dashboard"`)

**Step 3: resolve-callback-url.ts 구현 변경**

`template/apps/app/src/lib/resolve-callback-url.ts` 1번 라인:
```ts
const DEFAULT_CALLBACK_URL = "/";
```

**Step 4: 테스트 통과 확인**

```bash
pnpm --filter @repo/app test -- src/lib/resolve-callback-url.test.ts
```

Expected: 전체 통과

**Step 5: 커밋**

```bash
git add template/apps/app/src/lib/resolve-callback-url.ts template/apps/app/src/lib/resolve-callback-url.test.ts
git commit -m "feat(template): change default callback URL to /"
```

---

### Task 2: checkout route successUrl 변경

**Files:**
- Modify: `template/apps/app/src/app/api/billing/checkout/route.ts:38`
- Modify: `template/apps/app/src/app/api/billing/checkout/route.test.ts:245`

**Step 1: 테스트 파일의 기대값 변경**

`template/apps/app/src/app/api/billing/checkout/route.test.ts` 245번 라인:
```ts
successUrl: "http://localhost:3000/",
```

**Step 2: 테스트 실패 확인**

```bash
pnpm --filter @repo/app test -- src/app/api/billing/checkout/route.test.ts
```

Expected: successUrl 관련 케이스 FAIL

**Step 3: route.ts 구현 변경**

`template/apps/app/src/app/api/billing/checkout/route.ts` 38번 라인:
```ts
const successUrl = new URL("/", request.nextUrl.origin).toString();
```

**Step 4: 테스트 통과 확인**

```bash
pnpm --filter @repo/app test -- src/app/api/billing/checkout/route.test.ts
```

Expected: 전체 통과

**Step 5: 커밋**

```bash
git add template/apps/app/src/app/api/billing/checkout/route.ts template/apps/app/src/app/api/billing/checkout/route.test.ts
git commit -m "feat(template): change checkout successUrl to /"
```

---

### Task 3: proxy.ts 미들웨어 matcher 업데이트

**Files:**
- Modify: `template/apps/app/src/proxy.ts:21`

**Step 1: matcher에서 `/dashboard/:path*` 를 `/` 로 교체**

`template/apps/app/src/proxy.ts` 의 `config.matcher` 배열:
```ts
export const config = {
  matcher: [
    "/",
    "/users/:path*",
    "/components/:path*",
    "/test/:path*",
  ],
};
```

**Step 2: 커밋**

```bash
git add template/apps/app/src/proxy.ts
git commit -m "feat(template): update middleware matcher from /dashboard to /"
```

---

### Task 4: sidebar - Dashboard 메뉴 링크 변경

**Files:**
- Modify: `template/apps/app/src/domains/sidebar/components/app-sidebar.tsx:37`

**Step 1: Dashboard navMain 항목 url 변경**

`template/apps/app/src/domains/sidebar/components/app-sidebar.tsx` 37번 라인:
```ts
url: "/",
```

**Step 2: 커밋**

```bash
git add template/apps/app/src/domains/sidebar/components/app-sidebar.tsx
git commit -m "feat(template): update sidebar Dashboard url to /"
```

---

### Task 5: standard - Home 헤더 링크 변경

**Files:**
- Modify: `template/apps/app/src/domains/standard/components/app-header.tsx:13`

**Step 1: navLinks Home href 변경**

`template/apps/app/src/domains/standard/components/app-header.tsx` 13번 라인:
```ts
{ label: "Home", href: "/" },
```

**Step 2: 커밋**

```bash
git add template/apps/app/src/domains/standard/components/app-header.tsx
git commit -m "feat(template): update standard Home nav href to /"
```

---

### Task 6: sidebar 메인 페이지를 route group 루트로 이동

**Files:**
- Create: `template/apps/app/src/app/(authenticated)/(sidebar)/page.tsx`
- Delete: `template/apps/app/src/app/(authenticated)/(sidebar)/dashboard/page.tsx`

**Step 1: 새 파일 생성**

`template/apps/app/src/app/(authenticated)/(sidebar)/page.tsx` 를 `dashboard/page.tsx` 와 동일한 내용으로 생성:

```tsx
import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { requireSubscription } from "@repo/billing/require-subscription";
import { ChartAreaInteractive } from "@/domains/sidebar/components/chart-area-interactive";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";

export default async function DashboardPage() {
  // (authenticated)/layout.tsx guarantees session exists — fetching here only to get user.id
  const session = (await auth.api.getSession({ headers: await headers() }))!;
  await requireSubscription(session.user.id);

  return (
    <PageContainer title="Dashboard">
      <SectionCards />
      <ChartAreaInteractive />
    </PageContainer>
  );
}
```

**Step 2: 구 dashboard/page.tsx 삭제**

```bash
rm template/apps/app/src/app/\(authenticated\)/\(sidebar\)/dashboard/page.tsx
rmdir template/apps/app/src/app/\(authenticated\)/\(sidebar\)/dashboard/
```

**Step 3: 커밋**

```bash
git add template/apps/app/src/app/\(authenticated\)/\(sidebar\)/page.tsx
git add -u template/apps/app/src/app/\(authenticated\)/\(sidebar\)/dashboard/
git commit -m "feat(template): move sidebar main page from /dashboard to /"
```

---

### Task 7: standard 메인 페이지를 route group 루트로 이동

**Files:**
- Create: `template/apps/app/src/app/(authenticated)/(standard)/page.tsx`
- Delete: `template/apps/app/src/app/(authenticated)/(standard)/home/page.tsx`

**Step 1: 새 파일 생성**

`template/apps/app/src/app/(authenticated)/(standard)/page.tsx` 를 `home/page.tsx` 와 동일한 내용으로 생성:

```tsx
"use client";

import { useState } from "react";

import { Button } from "@repo/ui/components/button";

export default function HomePage() {
  const [isFlexLoading, setIsFlexLoading] = useState(false);
  const [isInlineLoading, setIsInlineLoading] = useState(false);

  const handleFlexClick = () => {
    setIsFlexLoading(true);
    setTimeout(() => setIsFlexLoading(false), 2000);
  };

  const handleInlineClick = () => {
    setIsInlineLoading(true);
    setTimeout(() => setIsInlineLoading(false), 2000);
  };

  return (
    <>
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Welcome
      </p>
      <h1 className="mb-14 max-w-lg text-center text-4xl leading-snug font-normal">
        Build your next SaaS product faster than ever.
      </h1>

      <div className="flex w-full max-w-md gap-3">
        <Button
          isLoading={isFlexLoading}
          onClick={handleFlexClick}
          className="flex-1 px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Get Started
        </Button>
        <Button
          variant="secondary"
          className="flex-1 px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Learn More
        </Button>
      </div>

      <div className="mt-8">
        <Button
          isLoading={isInlineLoading}
          onClick={handleInlineClick}
          className="px-8 py-5 text-base font-semibold uppercase tracking-wide"
        >
          Submit Without Flex
        </Button>
      </div>

      <div className="text-muted-foreground mt-6 flex items-center gap-3 text-xs">
        <span>No credit card required</span>
        <span aria-hidden="true">&middot;</span>
        <span>Free tier available</span>
        <span aria-hidden="true">&middot;</span>
        <span>Cancel anytime</span>
      </div>
    </>
  );
}
```

**Step 2: 구 home/page.tsx 삭제**

```bash
rm template/apps/app/src/app/\(authenticated\)/\(standard\)/home/page.tsx
rmdir template/apps/app/src/app/\(authenticated\)/\(standard\)/home/
```

**Step 3: 커밋**

```bash
git add template/apps/app/src/app/\(authenticated\)/\(standard\)/page.tsx
git add -u template/apps/app/src/app/\(authenticated\)/\(standard\)/home/
git commit -m "feat(template): move standard main page from /home to /"
```

---

### Task 8: app/page.tsx (root redirect) 삭제

**Files:**
- Delete: `template/apps/app/src/app/page.tsx`

**Step 1: 파일 삭제**

`(authenticated)/layout.tsx`가 미인증 사용자를 `/sign-in`으로 리다이렉트하므로 root redirect 파일이 더 이상 필요 없다.

```bash
rm template/apps/app/src/app/page.tsx
```

**Step 2: 커밋**

```bash
git add -u template/apps/app/src/app/page.tsx
git commit -m "feat(template): remove root redirect page (auth handled by authenticated layout)"
```

---

### Task 9: scaffold CLI - update-redirects.ts 제거

**Files:**
- Delete: `src/steps/update-redirects.ts`
- Modify: `src/scaffold.ts`
- Modify: `src/config/constants.ts`

**Step 1: scaffold.ts에서 updateRedirects 제거**

`src/scaffold.ts` 에서:
- `import { updateRedirects } from "./steps/update-redirects.js";` 라인 삭제
- `await updateRedirects(projectDir, layout);` 라인 삭제

**Step 2: constants.ts에서 불필요 상수 제거**

`src/config/constants.ts` 에서 아래 3개 상수 삭제:
```ts
export const ROOT_PAGE = `${SRC_DIR}/app/page.tsx`;
export const RESOLVE_CALLBACK_URL = `${SRC_DIR}/lib/resolve-callback-url.ts`;
export const CHECKOUT_ROUTE = `${SRC_DIR}/app/api/billing/checkout/route.ts`;
```

**Step 3: update-redirects.ts 삭제**

```bash
rm src/steps/update-redirects.ts
```

**Step 4: 빌드 확인**

```bash
pnpm build
```

Expected: 빌드 성공, TypeScript 에러 없음

**Step 5: 커밋**

```bash
git add src/scaffold.ts src/config/constants.ts
git add -u src/steps/update-redirects.ts
git commit -m "chore(scaffold): remove update-redirects step (both layouts now use /)"
```

---

### Task 10: scaffold CLI - update-redirects 테스트 삭제

**Files:**
- Check: `src/steps/update-redirects.test.ts` (존재하면 삭제)

**Step 1: 테스트 파일 존재 확인 및 삭제**

```bash
ls src/steps/update-redirects.test.ts 2>/dev/null && rm src/steps/update-redirects.test.ts || echo "No test file found"
```

**Step 2: 전체 테스트 실행**

```bash
pnpm test
```

Expected: 전체 통과, update-redirects 관련 테스트 없음

**Step 3: 커밋 (테스트 파일이 있었던 경우)**

```bash
git add -u src/steps/update-redirects.test.ts
git commit -m "chore(scaffold): remove update-redirects test"
```
