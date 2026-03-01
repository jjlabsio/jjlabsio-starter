# Layout Domain Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 레이아웃별 컴포넌트·페이지를 `src/domains/<layout>/` 아래로 co-locate하여, `create-jjlabs-app`이 `removeDir` 두 번만으로 레이아웃 정리를 완료할 수 있게 한다.

**Architecture:** 각 레이아웃(standard, sidebar)을 독립 domain으로 취급한다. `src/domains/standard/components/`와 `src/domains/sidebar/components/`에 각 레이아웃 전용 컴포넌트를 이동하고, route group 내 페이지는 해당 domain에서 import한다. `src/components/`에는 공유 컴포넌트(subscription-status-card, providers, theme-toggle)만 남긴다.

**Tech Stack:** Next.js 16, TypeScript 5.7, pnpm (monorepo), Turborepo

---

## Phase 1: apps/app — domains 디렉토리 구성 및 컴포넌트 이동

### Task 1: domains/standard 디렉토리 생성 및 컴포넌트 이동

**Files:**
- Create dir: `apps/app/src/domains/standard/components/`
- Move: `apps/app/src/components/app-header.tsx` → `apps/app/src/domains/standard/components/app-header.tsx`
- Move: `apps/app/src/components/app-footer.tsx` → `apps/app/src/domains/standard/components/app-footer.tsx`
- Move: `apps/app/src/components/mobile-nav.tsx` → `apps/app/src/domains/standard/components/mobile-nav.tsx`
- Move: `apps/app/src/components/user-menu.tsx` → `apps/app/src/domains/standard/components/user-menu.tsx`

**Step 1: 디렉토리 생성**

```bash
mkdir -p apps/app/src/domains/standard/components
```

**Step 2: 파일 이동**

```bash
mv apps/app/src/components/app-header.tsx apps/app/src/domains/standard/components/
mv apps/app/src/components/app-footer.tsx apps/app/src/domains/standard/components/
mv apps/app/src/components/mobile-nav.tsx apps/app/src/domains/standard/components/
mv apps/app/src/components/user-menu.tsx apps/app/src/domains/standard/components/
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move standard layout components to domains/standard"
```

---

### Task 2: domains/sidebar 디렉토리 생성 및 컴포넌트 이동

**Files:**
- Create dir: `apps/app/src/domains/sidebar/components/`
- Move 9 files from `apps/app/src/components/`:
  - `app-sidebar.tsx`
  - `nav-main.tsx`
  - `nav-secondary.tsx`
  - `nav-user.tsx`
  - `nav-documents.tsx`
  - `site-header.tsx`
  - `page-container.tsx`
  - `section-cards.tsx`
  - `chart-area-interactive.tsx`

**Step 1: 디렉토리 생성**

```bash
mkdir -p apps/app/src/domains/sidebar/components
```

**Step 2: 파일 이동**

```bash
mv apps/app/src/components/app-sidebar.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/nav-main.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/nav-secondary.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/nav-user.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/nav-documents.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/site-header.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/page-container.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/section-cards.tsx apps/app/src/domains/sidebar/components/
mv apps/app/src/components/chart-area-interactive.tsx apps/app/src/domains/sidebar/components/
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move sidebar layout components to domains/sidebar"
```

---

## Phase 2: Import 경로 업데이트

### Task 3: `(standard)/layout.tsx` import 경로 업데이트

**Files:**
- Modify: `apps/app/src/app/(authenticated)/(standard)/layout.tsx`

**Step 1: import 경로 수정**

`@/components/app-header` → `@/domains/standard/components/app-header`
`@/components/app-footer` → `@/domains/standard/components/app-footer`

수정 후 파일:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { AppHeader } from "@/domains/standard/components/app-header";
import { AppFooter } from "@/domains/standard/components/app-footer";

export default async function StandardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email,
    image: session.user.image ?? undefined,
  };

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader user={user} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-8 pt-16 pb-24">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
```

**Step 2: typecheck 실행**

```bash
pnpm typecheck
```

Expected: 에러 없음

**Step 3: Commit**

```bash
git add apps/app/src/app/\(authenticated\)/\(standard\)/layout.tsx
git commit -m "refactor: update (standard)/layout.tsx import paths to domains/standard"
```

---

### Task 4: `(sidebar)/layout.tsx` import 경로 업데이트

**Files:**
- Modify: `apps/app/src/app/(authenticated)/(sidebar)/layout.tsx`

**Step 1: import 경로 수정**

`@/components/app-sidebar` → `@/domains/sidebar/components/app-sidebar`

수정 후 파일:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { AppSidebar } from "@/domains/sidebar/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email,
    image: session.user.image ?? undefined,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
```

**Step 2: typecheck 실행**

```bash
pnpm typecheck
```

Expected: 에러 없음

**Step 3: Commit**

```bash
git add apps/app/src/app/\(authenticated\)/\(sidebar\)/layout.tsx
git commit -m "refactor: update (sidebar)/layout.tsx import paths to domains/sidebar"
```

---

### Task 5: `(sidebar)/dashboard/page.tsx` import 경로 업데이트

**Files:**
- Modify: `apps/app/src/app/(authenticated)/(sidebar)/dashboard/page.tsx`

현재 파일이 `@/components/chart-area-interactive`, `@/components/page-container`, `@/components/section-cards`를 import하고 있다. 모두 sidebar domain으로 경로 변경.

**Step 1: import 경로 수정**

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

**Step 2: typecheck 실행**

```bash
pnpm typecheck
```

Expected: 에러 없음

**Step 3: Commit**

```bash
git add apps/app/src/app/\(authenticated\)/\(sidebar\)/dashboard/page.tsx
git commit -m "refactor: update dashboard page import paths to domains/sidebar"
```

---

## Phase 3: (sidebar) billing 페이지 신규 생성

### Task 6: `(sidebar)/settings/billing/page.tsx` 생성

**Files:**
- Create: `apps/app/src/app/(authenticated)/(sidebar)/settings/billing/page.tsx`

이 파일은 현재 `create-jjlabs-app`의 `clean-layout.ts`가 sidebar 선택 시 코드로 작성하던 내용이다. 이제 템플릿에 직접 포함시킨다.

**Step 1: 디렉토리 생성 및 파일 작성**

```bash
mkdir -p apps/app/src/app/\(authenticated\)/\(sidebar\)/settings/billing
```

파일 내용:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription } from "@repo/billing";
import { SubscriptionStatusCard } from "@/components/subscription-status-card";
import { PageContainer } from "@/domains/sidebar/components/page-container";

export default async function BillingSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const subscription = await getSubscription(session.user.id);

  return (
    <PageContainer title="Billing">
      <div className="w-full max-w-lg space-y-4">
        <SubscriptionStatusCard subscription={subscription} />
      </div>
    </PageContainer>
  );
}
```

**Step 2: typecheck 및 테스트 실행**

```bash
pnpm typecheck
pnpm --filter @jjlabs/app test
```

Expected: 에러·실패 없음

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add sidebar billing settings page to (sidebar) route group"
```

---

## Phase 4: create-jjlabs-app 업데이트

### Task 7: `constants.ts`에 domain 디렉토리 상수 추가

**Files:**
- Modify: `tools/create-jjlabs-app/src/config/constants.ts`

**Step 1: 상수 추가**

기존 내용에 아래 3줄 추가:

```ts
export const TEMPLATE_REPO = "jjlabsio/jjlabsio-starter";

export const APP_DIR = "apps/app";
export const SRC_DIR = `${APP_DIR}/src`;
export const COMPONENTS_DIR = `${SRC_DIR}/components`;
export const AUTHENTICATED_DIR = `${SRC_DIR}/app/(authenticated)`;
export const SIDEBAR_GROUP_DIR = `${AUTHENTICATED_DIR}/(sidebar)`;
export const STANDARD_GROUP_DIR = `${AUTHENTICATED_DIR}/(standard)`;

// 추가
export const DOMAINS_DIR = `${SRC_DIR}/domains`;
export const STANDARD_DOMAIN_DIR = `${DOMAINS_DIR}/standard`;
export const SIDEBAR_DOMAIN_DIR = `${DOMAINS_DIR}/sidebar`;

export const ROOT_PAGE = `${SRC_DIR}/app/page.tsx`;
export const SIGN_IN_PAGE = `${SRC_DIR}/app/(public)/sign-in/page.tsx`;

export type LayoutChoice = "sidebar" | "standard";
```

**Step 2: Commit**

```bash
git add tools/create-jjlabs-app/src/config/constants.ts
git commit -m "refactor: add domain directory constants to create-jjlabs-app"
```

---

### Task 8: `layout-files.ts` 단순화

**Files:**
- Modify: `tools/create-jjlabs-app/src/config/layout-files.ts`

`components` 배열 불필요 → `LayoutFileMap`에서 제거. 각 레이아웃의 삭제 대상은 route group 디렉토리 + domain 디렉토리 두 경로만.

**Step 1: 파일 전체 교체**

```ts
import {
  SIDEBAR_GROUP_DIR,
  STANDARD_GROUP_DIR,
  STANDARD_DOMAIN_DIR,
  SIDEBAR_DOMAIN_DIR,
  type LayoutChoice,
} from "./constants.js";

interface LayoutDirs {
  readonly routeGroupDir: string;
  readonly domainDir: string;
}

const SIDEBAR_DIRS: LayoutDirs = {
  routeGroupDir: SIDEBAR_GROUP_DIR,
  domainDir: SIDEBAR_DOMAIN_DIR,
};

const STANDARD_DIRS: LayoutDirs = {
  routeGroupDir: STANDARD_GROUP_DIR,
  domainDir: STANDARD_DOMAIN_DIR,
};

const DIR_MAP: Record<LayoutChoice, LayoutDirs> = {
  sidebar: STANDARD_DIRS,  // sidebar 선택 시 → standard 삭제
  standard: SIDEBAR_DIRS,  // standard 선택 시 → sidebar 삭제
};

export function getDirsToRemove(layout: LayoutChoice): LayoutDirs {
  return DIR_MAP[layout];
}

export function getSelectedLayoutDir(layout: LayoutChoice): string {
  return layout === "sidebar" ? SIDEBAR_GROUP_DIR : STANDARD_GROUP_DIR;
}
```

**Step 2: Commit**

```bash
git add tools/create-jjlabs-app/src/config/layout-files.ts
git commit -m "refactor: simplify layout-files config to directory-only cleanup"
```

---

### Task 9: `clean-layout.ts` 재작성

**Files:**
- Modify: `tools/create-jjlabs-app/src/steps/clean-layout.ts`

`writeFile`, `ensureDir` 사용 제거. `removeDir` 2회만 호출.

**Step 1: 파일 전체 교체**

```ts
import path from "node:path";
import { getDirsToRemove } from "../config/layout-files.js";
import type { LayoutChoice } from "../config/constants.js";
import { removeDir } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

export async function cleanLayout(
  projectDir: string,
  layout: LayoutChoice,
): Promise<void> {
  const { routeGroupDir, domainDir } = getDirsToRemove(layout);
  const unused = layout === "sidebar" ? "standard" : "sidebar";

  logger.step(`Removing unused ${unused} layout files...`);

  await Promise.all([
    removeDir(path.join(projectDir, routeGroupDir)),
    removeDir(path.join(projectDir, domainDir)),
  ]);
}
```

**Step 2: TypeScript 타입 확인**

```bash
cd tools/create-jjlabs-app && npx tsc --noEmit
```

Expected: 에러 없음

**Step 3: Commit**

```bash
git add tools/create-jjlabs-app/src/steps/clean-layout.ts
git commit -m "refactor: simplify clean-layout to removeDir-only, remove writeFile logic"
```

---

## Phase 5: 최종 검증

### Task 10: 전체 typecheck 및 lint

**Step 1: 전체 typecheck**

```bash
pnpm typecheck
```

Expected: 에러 없음

**Step 2: 전체 lint**

```bash
pnpm lint
```

Expected: 에러 없음

**Step 3: 전체 테스트**

```bash
pnpm test
```

Expected: 모든 테스트 통과

**Step 4: 남은 `src/components/` 파일 확인**

```bash
ls apps/app/src/components/
```

Expected: `providers.tsx`, `theme-toggle.tsx`, `subscription-status-card.tsx` 3개만 남아 있어야 함

**Step 5: domains 구조 확인**

```bash
find apps/app/src/domains -type f | sort
```

Expected:
```
apps/app/src/domains/sidebar/components/app-sidebar.tsx
apps/app/src/domains/sidebar/components/chart-area-interactive.tsx
apps/app/src/domains/sidebar/components/nav-documents.tsx
apps/app/src/domains/sidebar/components/nav-main.tsx
apps/app/src/domains/sidebar/components/nav-secondary.tsx
apps/app/src/domains/sidebar/components/nav-user.tsx
apps/app/src/domains/sidebar/components/page-container.tsx
apps/app/src/domains/sidebar/components/section-cards.tsx
apps/app/src/domains/sidebar/components/site-header.tsx
apps/app/src/domains/standard/components/app-footer.tsx
apps/app/src/domains/standard/components/app-header.tsx
apps/app/src/domains/standard/components/mobile-nav.tsx
apps/app/src/domains/standard/components/user-menu.tsx
```

**Step 6: 최종 commit**

```bash
git add -A
git commit -m "refactor: complete layout domain restructure"
```
