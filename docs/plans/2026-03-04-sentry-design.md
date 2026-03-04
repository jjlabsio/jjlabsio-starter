# Sentry Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `@sentry/nextjs` SDK로 template/apps/app/에 Client + Server + Edge 에러 캡처 설정

**Architecture:** Sentry 공식 Next.js SDK 사용. 3개 config 파일(client/server/edge)로 환경별 초기화, `instrumentation.ts`로 서버/Edge 등록, `global-error.tsx`로 App Router 전역 에러 바운더리 제공. DSN 미설정 시 Sentry 완전 비활성화.

**Tech Stack:** `@sentry/nextjs`, Next.js 16 App Router, TypeScript

---

### Task 1: Add `@sentry/nextjs` dependency

**Files:**
- Modify: `template/apps/app/package.json`

**Step 1: Add `@sentry/nextjs` to dependencies**

In `template/apps/app/package.json`, add to `dependencies`:

```json
"@sentry/nextjs": "^9"
```

Add it alphabetically after `@repo/ui`:

```json
"dependencies": {
    "@better-auth/telemetry": "^1.4.18",
    "@repo/auth": "workspace:*",
    "@repo/billing": "workspace:*",
    "@repo/database": "workspace:*",
    "@repo/ui": "workspace:*",
    "@sentry/nextjs": "^9",
    "@tabler/icons-react": "^3.36.1",
```

**Step 2: Install dependencies**

Run: `cd template && pnpm install`
Expected: Lockfile updated, `@sentry/nextjs` installed

**Step 3: Commit**

```bash
git add template/apps/app/package.json template/pnpm-lock.yaml
git commit -m "feat(template): add @sentry/nextjs dependency"
```

---

### Task 2: Create Sentry config files

**Files:**
- Create: `template/apps/app/sentry.client.config.ts`
- Create: `template/apps/app/sentry.server.config.ts`
- Create: `template/apps/app/sentry.edge.config.ts`

**Step 1: Create `sentry.client.config.ts`**

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 2: Create `sentry.server.config.ts`**

Same content as client config:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 3: Create `sentry.edge.config.ts`**

Same content as client config:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 4: Commit**

```bash
git add template/apps/app/sentry.client.config.ts template/apps/app/sentry.server.config.ts template/apps/app/sentry.edge.config.ts
git commit -m "feat(template): add sentry client/server/edge config files"
```

---

### Task 3: Create instrumentation.ts

**Files:**
- Create: `template/apps/app/src/instrumentation.ts`

**Step 1: Create `src/instrumentation.ts`**

```ts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
```

Note: `import("../sentry.server.config")` goes up one level from `src/` to project root where the config files live.

**Step 2: Commit**

```bash
git add template/apps/app/src/instrumentation.ts
git commit -m "feat(template): add Next.js instrumentation hook for sentry"
```

---

### Task 4: Create global-error.tsx

**Files:**
- Create: `template/apps/app/src/app/global-error.tsx`

**Step 1: Create `src/app/global-error.tsx`**

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
```

**Step 2: Commit**

```bash
git add template/apps/app/src/app/global-error.tsx
git commit -m "feat(template): add global-error.tsx with sentry error capture"
```

---

### Task 5: Wrap next.config.ts with withSentryConfig

**Files:**
- Modify: `template/apps/app/next.config.ts`

**Step 1: Update `next.config.ts`**

Replace the entire file content with:

```ts
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/database",
    "@repo/auth",
    "@repo/billing",
  ],
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
});
```

Changes from original:
- Added `import type { NextConfig }` for proper typing
- Added `import { withSentryConfig }` from `@sentry/nextjs`
- Wrapped `nextConfig` with `withSentryConfig`
- `silent: !process.env.CI` — only log source map upload in CI
- `disableServerWebpackPlugin` / `disableClientWebpackPlugin` — skip source map upload when no auth token

**Step 2: Verify typecheck passes**

Run: `cd template && pnpm --filter app typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add template/apps/app/next.config.ts
git commit -m "feat(template): wrap next.config.ts with withSentryConfig"
```

---

### Task 6: Update environment variables

**Files:**
- Modify: `template/apps/app/.env.example`
- Modify: `template/turbo.json`

**Step 1: Add Sentry section to `.env.example`**

Append to end of file:

```
# Sentry (https://sentry.io)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
```

**Step 2: Update `turbo.json`**

Add `"env"` array to `tasks.build` for build-time env vars, and add `SENTRY_AUTH_TOKEN` to `globalEnv`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NEXT_PUBLIC_SENTRY_DSN"]
    },
    "db:migrate:deploy": {
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  },
  "globalEnv": [
    "DATABASE_URL",
    "DIRECT_URL",
    "NODE_ENV",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SENTRY_AUTH_TOKEN"
  ]
}
```

Changes:
- Added `"env": ["NEXT_PUBLIC_SENTRY_DSN"]` to `tasks.build` (build-time bundled var)
- Added `"SENTRY_AUTH_TOKEN"` to `globalEnv` (runtime secret for source map upload)

**Step 3: Commit**

```bash
git add template/apps/app/.env.example template/turbo.json
git commit -m "feat(template): add sentry env vars to .env.example and turbo.json"
```

---

### Task 7: Verify build works

**Step 1: Run build**

Run: `cd template && pnpm --filter app build`
Expected: Build succeeds. Sentry should be inactive (no DSN set) but should not cause build errors.

**Step 2: Final commit (if any fixups needed)**

If build passes with no changes needed, skip this step.
