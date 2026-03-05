# Env Setup Completeness Design

## Problem

- `apps/web/.env.example`이 scaffold 시 `.env`로 복사되지 않음
- `apps/web`에 env 검증 없음 (단순 상수 파일)
- `turbo.json`에 Polar, SKIP_ENV_VALIDATION 등 누락

## Changes

### 1. `apps/web/src/lib/env.ts` — t3-oss env 검증으로 교체

- `NEXT_PUBLIC_APP_URL` + Polar product ID 4개 검증
- `SKIP_ENV_VALIDATION` 지원
- `PRODUCT_IDS` 헬퍼 객체 유지

### 2. `apps/web/.env.example` — Polar 변수 + SKIP_ENV_VALIDATION 추가

### 3. `apps/web/package.json` — `@t3-oss/env-nextjs`, `zod` 의존성 추가

### 4. `src/steps/finalize.ts` — `apps/web/.env.example` 복사 추가

### 5. `template/turbo.json` — build.env, globalEnv 보강

### 6. `apps/web` 참조 파일 — `env.APP_URL`, `env.NEXT_PUBLIC_POLAR_*` 사용으로 변경
