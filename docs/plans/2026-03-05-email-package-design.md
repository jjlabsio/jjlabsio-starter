# @repo/email Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `@repo/email` package to the turborepo template using Resend + React Email for transactional emails (welcome, weekly reports).

**Architecture:** New `packages/email/` package following `@repo/billing` patterns — ESM, `@t3-oss/env-nextjs` for env validation, `server-only` guard, React Email templates as JSX components.

**Tech Stack:** Resend SDK, @react-email/components, React 19, Zod, @t3-oss/env-nextjs

---

### Task 1: Create `@repo/email` package scaffold

**Files:**
- Create: `template/packages/email/package.json`
- Create: `template/packages/email/tsconfig.json`

**Step 1: Create package.json**

```json
{
  "name": "@repo/email",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@react-email/components": "^0.0.36",
    "@t3-oss/env-nextjs": "^0.11.1",
    "resend": "^4.5.1",
    "server-only": "^0.0.1",
    "zod": "^3.25.76"
  },
  "peerDependencies": {
    "next": ">=15.0.0",
    "react": ">=19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "eslint": "^9.32.0",
    "typescript": "^5.9.2"
  },
  "exports": {
    ".": "./src/index.ts",
    "./keys": "./src/keys.ts",
    "./templates/*": "./src/templates/*.tsx"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "paths": {
      "@repo/email/*": ["./src/*"]
    }
  },
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

Note: `react-library.json` is used instead of `nextjs.json` because this package contains JSX (React Email templates). The billing package uses `nextjs.json` because it has no JSX — this package does.

**Step 3: Commit**

```bash
git add template/packages/email/package.json template/packages/email/tsconfig.json
git commit -m "feat(template): scaffold @repo/email package"
```

---

### Task 2: Create keys.ts (environment variable validation)

**Files:**
- Create: `template/packages/email/src/keys.ts`

**Step 1: Create keys.ts**

Reference: `template/packages/billing/src/keys.ts`

```typescript
import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

**Step 2: Commit**

```bash
git add template/packages/email/src/keys.ts
git commit -m "feat(template): add @repo/email env validation"
```

---

### Task 3: Create index.ts (Resend client + sendEmail)

**Files:**
- Create: `template/packages/email/src/index.ts`

**Step 1: Create index.ts**

Reference: `template/packages/billing/src/client.ts` for client pattern, `template/packages/billing/src/index.ts` for export pattern.

```typescript
import "server-only";
import { Resend } from "resend";
import { env } from "./keys";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  return resend.emails.send({
    from: from ?? "{{PROJECT_NAME}} <noreply@yourdomain.com>",
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });
}

export { env } from "./keys";
```

**Step 2: Commit**

```bash
git add template/packages/email/src/index.ts
git commit -m "feat(template): add Resend client and sendEmail function"
```

---

### Task 4: Create welcome email template

**Files:**
- Create: `template/packages/email/src/templates/welcome.tsx`

**Step 1: Create welcome.tsx**

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {{PROJECT_NAME}}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}!</Heading>
          <Text style={text}>
            Thanks for signing up. We're excited to have you on board.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a4a4a",
  margin: "0",
};
```

**Step 2: Commit**

```bash
git add template/packages/email/src/templates/welcome.tsx
git commit -m "feat(template): add welcome email template"
```

---

### Task 5: Integrate into turborepo and app

**Files:**
- Modify: `template/turbo.json` — add `RESEND_API_KEY` to `globalEnv`
- Modify: `template/apps/app/next.config.ts` — add `@repo/email` to `transpilePackages`
- Modify: `template/apps/app/package.json` — add `@repo/email: workspace:*` to dependencies

**Step 1: Add `RESEND_API_KEY` to turbo.json globalEnv**

In `template/turbo.json`, add `"RESEND_API_KEY"` to the `globalEnv` array:

```json
"globalEnv": [
  "DATABASE_URL",
  "DIRECT_URL",
  "NODE_ENV",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "SENTRY_AUTH_TOKEN"
]
```

**Step 2: Add `@repo/email` to transpilePackages in next.config.ts**

In `template/apps/app/next.config.ts`:

```typescript
transpilePackages: [
  "@repo/ui",
  "@repo/database",
  "@repo/auth",
  "@repo/billing",
  "@repo/email",
],
```

**Step 3: Add `@repo/email` dependency to app package.json**

In `template/apps/app/package.json`, add to `dependencies`:

```json
"@repo/email": "workspace:*",
```

**Step 4: Commit**

```bash
git add template/turbo.json template/apps/app/next.config.ts template/apps/app/package.json
git commit -m "feat(template): integrate @repo/email into turborepo and app"
```

---

### Task 6: Update .env files and scaffold config

**Files:**
- Modify: `template/apps/app/.env.example` — add `RESEND_API_KEY` placeholder
- Modify: `template/apps/app/.env` — add `RESEND_API_KEY` placeholder
- Modify: `src/steps/substitute-project-name.ts` — add welcome template to `TARGET_FILES`

**Step 1: Add to .env.example**

Append after the Polar section:

```
# Resend Email (https://resend.com)
RESEND_API_KEY="re_xxx"
```

**Step 2: Add to .env**

Append same block:

```
# Resend Email (https://resend.com)
RESEND_API_KEY="re_xxx"
```

**Step 3: Add welcome template to substitute-project-name.ts TARGET_FILES**

The welcome template contains `{{PROJECT_NAME}}` in the Preview text. Add to the `TARGET_FILES` array in `src/steps/substitute-project-name.ts`:

```typescript
const TARGET_FILES = [
  "README.md",
  "CLAUDE.md",
  "apps/app/.env.example",
  "packages/database/.env.example",
  "packages/email/src/templates/welcome.tsx",
  "docker-compose.yml",
];
```

**Step 4: Commit**

```bash
git add template/apps/app/.env.example template/apps/app/.env src/steps/substitute-project-name.ts
git commit -m "feat(template): add RESEND_API_KEY to env files and scaffold config"
```

---

### Task 7: Run typecheck and verify

**Step 1: Install dependencies**

```bash
cd /Users/jaejinsong/code/projects/jjlabsio-starter/template && pnpm install
```

**Step 2: Run typecheck on email package**

```bash
cd /Users/jaejinsong/code/projects/jjlabsio-starter/template && pnpm --filter @repo/email typecheck
```

Expected: No errors.

**Step 3: Run lint on email package**

```bash
cd /Users/jaejinsong/code/projects/jjlabsio-starter/template && pnpm --filter @repo/email lint
```

Expected: No errors.

**Step 4: Run full workspace typecheck**

```bash
cd /Users/jaejinsong/code/projects/jjlabsio-starter/template && pnpm typecheck
```

Expected: No errors across all packages.
