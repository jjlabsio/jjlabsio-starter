# Layout Domain Refactor Design

**Date:** 2026-03-01
**Status:** Approved

## Problem

`apps/app/src/components/`에 standard·sidebar 전용 컴포넌트가 혼재하고, `settings/billing/page.tsx`가 `(standard)` route group에만 존재한다. sidebar 선택 시 `create-jjlabs-app`의 `clean-layout.ts`가 billing page를 코드로 직접 작성(`writeFile`)하여 보완하는 방식은 유지보수성이 낮다.

## Goal

- 각 레이아웃이 자신의 컴포넌트·페이지를 완전히 소유
- `create-jjlabs-app`은 디렉토리 삭제(`removeDir`)만으로 정리 완료
- `writeFile`·`removeFile` 로직 완전 제거
- 프론트엔드 domain 규칙 준수 (`src/domains/<Name>/`)

## Directory Structure

```
apps/app/src/
├── domains/
│   ├── standard/
│   │   └── components/
│   │       ├── app-header.tsx
│   │       ├── app-footer.tsx
│   │       ├── mobile-nav.tsx
│   │       └── user-menu.tsx
│   └── sidebar/
│       └── components/
│           ├── app-sidebar.tsx
│           ├── nav-main.tsx
│           ├── nav-secondary.tsx
│           ├── nav-user.tsx
│           ├── nav-documents.tsx
│           ├── site-header.tsx
│           ├── page-container.tsx
│           ├── section-cards.tsx
│           └── chart-area-interactive.tsx
│
├── components/                         # 공유만 유지
│   ├── subscription-status-card.tsx
│   ├── providers.tsx
│   └── theme-toggle.tsx
│
└── app/
    └── (authenticated)/
        ├── (standard)/
        │   ├── layout.tsx              # @/domains/standard/components/ import
        │   ├── home/page.tsx
        │   ├── about/page.tsx
        │   └── settings/billing/page.tsx   # standard 버전 (raw HTML)
        └── (sidebar)/
            ├── layout.tsx              # @/domains/sidebar/components/ import
            ├── dashboard/page.tsx
            └── settings/billing/page.tsx   # sidebar 버전 (PageContainer 사용)
```

## Import Convention

- Layout 컴포넌트: `@/domains/<layout>/components/<component>`
- 공유 컴포넌트: `@/components/<component>`
- 크로스 도메인 import 금지 (standard ↔ sidebar)

## create-jjlabs-app Changes

### `clean-layout.ts` — before

```ts
// writeFile로 billing page 코드 직접 작성
// removeFile로 컴포넌트 파일 개별 삭제
```

### `clean-layout.ts` — after

```ts
// sidebar 선택 시
removeDir(STANDARD_GROUP_DIR)         // (standard)/ 전체 삭제
removeDir('src/domains/standard')     // standard domain 전체 삭제

// standard 선택 시
removeDir(SIDEBAR_GROUP_DIR)          // (sidebar)/ 전체 삭제
removeDir('src/domains/sidebar')      // sidebar domain 전체 삭제
```

### `layout-files.ts` — after

컴포넌트 파일 목록(`components: string[]`) 불필요. 두 디렉토리 경로만 추적.

### `constants.ts` — additions

```ts
export const DOMAINS_DIR = `${SRC_DIR}/domains`;
export const STANDARD_DOMAIN_DIR = `${DOMAINS_DIR}/standard`;
export const SIDEBAR_DOMAIN_DIR = `${DOMAINS_DIR}/sidebar`;
```

## Migration Steps (apps/app)

1. `src/domains/standard/components/` 생성 후 standard 전용 컴포넌트 이동
2. `src/domains/sidebar/components/` 생성 후 sidebar 전용 컴포넌트 이동
3. `(standard)/layout.tsx` import 경로 업데이트
4. `(sidebar)/layout.tsx` import 경로 업데이트
5. `(sidebar)/settings/billing/page.tsx` 신규 생성 (sidebar 버전)
6. 기존 컴포넌트 파일 `src/components/`에서 삭제 (공유만 남김)

## Migration Steps (create-jjlabs-app)

1. `constants.ts`에 domain 디렉토리 상수 추가
2. `layout-files.ts` 단순화 (컴포넌트 목록 제거, domain dir 추가)
3. `clean-layout.ts` 재작성 (`writeFile` 제거, `removeDir` 2회만 호출)
