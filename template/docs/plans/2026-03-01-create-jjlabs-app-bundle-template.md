# create-jjlabs-app Bundle Template Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `create-jjlabs-app`이 GitHub degit 대신 npm 패키지에 번들된 템플릿 파일을 복사하는 업계 표준 방식으로 전환.

**Architecture:** 현재 레포 루트의 템플릿 파일들(`apps/`, `packages/` 등)을 `tools/create-jjlabs-app/template/`으로 이동. CLI 런타임에 `path.resolve(__dirname, '../template')`을 `fs-extra.copy`로 복사. 레포 루트는 CLI 개발 환경(tools/\* 워크스페이스)으로 단순화.

**Tech Stack:** `fs-extra`, `tsup`, `vitest`, pnpm workspace

---

## Background: 현재 구조

```
tools/create-jjlabs-app/src/steps/
  clone.ts          # degit으로 jjlabsio/jjlabsio-starter 복제
  finalize.ts       # .git 제거, tools/ 제거, .env 복사, pnpm install
scaffold.ts         # cloneTemplate → ... → finalize 순으로 오케스트레이션
config/constants.ts # TEMPLATE_REPO = "jjlabsio/jjlabsio-starter"
```

---

## Task 1: 템플릿 파일 이동 (git mv)

레포 루트의 템플릿 파일들을 `tools/create-jjlabs-app/template/`으로 이동. `git mv`로 이력 보존.

**Files:**

- Move: `apps/` → `tools/create-jjlabs-app/template/apps/`
- Move: `packages/` → `tools/create-jjlabs-app/template/packages/`
- Move: `docs/` → `tools/create-jjlabs-app/template/docs/`
- Move: `turbo.json` → `tools/create-jjlabs-app/template/turbo.json`
- Move: `package.json` → `tools/create-jjlabs-app/template/package.json`
- Move: `pnpm-workspace.yaml` → `tools/create-jjlabs-app/template/pnpm-workspace.yaml`
- Move: `tsconfig.json` → `tools/create-jjlabs-app/template/tsconfig.json`
- Move: `eslint.config.js` → `tools/create-jjlabs-app/template/eslint.config.js`
- Move: `docker-compose.yml` → `tools/create-jjlabs-app/template/docker-compose.yml`
- Move: `.husky/` → `tools/create-jjlabs-app/template/.husky/`
- Move: `.mcp.json` → `tools/create-jjlabs-app/template/.mcp.json`
- Move: `.serena/` → `tools/create-jjlabs-app/template/.serena/`
- Move: `.vscode/` → `tools/create-jjlabs-app/template/.vscode/` (존재 시)
- Move: `CLAUDE.md` → `tools/create-jjlabs-app/template/CLAUDE.md`
- Rename: `.gitignore` → `tools/create-jjlabs-app/template/gitignore` (dotfile — npm 배포 시 누락 방지)

**Step 1: template/ 디렉토리 생성 후 git mv 실행**

```bash
mkdir -p tools/create-jjlabs-app/template

git mv apps tools/create-jjlabs-app/template/apps
git mv packages tools/create-jjlabs-app/template/packages
git mv docs tools/create-jjlabs-app/template/docs
git mv turbo.json tools/create-jjlabs-app/template/turbo.json
git mv package.json tools/create-jjlabs-app/template/package.json
git mv pnpm-workspace.yaml tools/create-jjlabs-app/template/pnpm-workspace.yaml
git mv tsconfig.json tools/create-jjlabs-app/template/tsconfig.json
git mv eslint.config.js tools/create-jjlabs-app/template/eslint.config.js
git mv docker-compose.yml tools/create-jjlabs-app/template/docker-compose.yml
git mv .husky tools/create-jjlabs-app/template/.husky
git mv .mcp.json tools/create-jjlabs-app/template/.mcp.json
git mv .serena tools/create-jjlabs-app/template/.serena
git mv CLAUDE.md tools/create-jjlabs-app/template/CLAUDE.md
```

`.vscode/` 존재 시:

```bash
git mv .vscode tools/create-jjlabs-app/template/.vscode
```

`.gitignore` 는 일반 `mv`로 rename (npm이 패키지에서 `.gitignore`를 자동 제외하기 때문):

```bash
mv .gitignore tools/create-jjlabs-app/template/gitignore
git add -A
```

**Step 2: 이동 결과 확인**

```bash
ls tools/create-jjlabs-app/template/
```

Expected 출력 (최소):

```
apps  CLAUDE.md  docs  docker-compose.yml  eslint.config.js
gitignore  .husky  .mcp.json  package.json  packages
pnpm-workspace.yaml  .serena  tsconfig.json  turbo.json
```

**Step 3: 커밋**

```bash
git commit -m "chore: move template files into tools/create-jjlabs-app/template/"
```

---

## Task 2: 루트 워크스페이스 파일 업데이트

레포 루트를 CLI 개발 전용 워크스페이스로 단순화. `pnpm-workspace.yaml`이 `tools/*`만 가리키도록 변경.

**Files:**

- Create: `pnpm-workspace.yaml` (루트, 새로 작성)
- Create: `package.json` (루트, 새로 작성)
- Create: `.gitignore` (루트, 새로 작성)

**Step 1: 루트 pnpm-workspace.yaml 새로 작성**

```yaml
# tools/create-jjlabs-app/pnpm-workspace.yaml 과 다름!
# 이 파일은 레포 루트 workspace 설정 (CLI 개발 전용)
packages:
  - "tools/*"
```

파일 경로: `pnpm-workspace.yaml` (루트)

**Step 2: 루트 package.json 새로 작성**

```json
{
  "name": "jjlabsio-starter-dev",
  "version": "0.0.1",
  "private": true,
  "packageManager": "pnpm@10.4.1",
  "engines": {
    "node": ">=20"
  }
}
```

파일 경로: `package.json` (루트)

**Step 3: 루트 .gitignore 새로 작성**

```
node_modules/
.turbo/
tools/create-jjlabs-app/dist/
tools/create-jjlabs-app/template/node_modules/
tools/create-jjlabs-app/template/.turbo/
tools/create-jjlabs-app/template/apps/app/.next/
tools/create-jjlabs-app/template/apps/web/.next/
tools/create-jjlabs-app/template/apps/*/node_modules/
tools/create-jjlabs-app/template/packages/*/node_modules/
tools/create-jjlabs-app/template/.env
tools/create-jjlabs-app/template/apps/app/.env
tools/create-jjlabs-app/template/packages/database/.env
```

파일 경로: `.gitignore` (루트)

**Step 4: pnpm install 실행 (루트 workspace 재초기화)**

```bash
# 기존 node_modules 제거 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

Expected: `tools/create-jjlabs-app` 패키지만 설치됨.

**Step 5: 커밋**

```bash
git add pnpm-workspace.yaml package.json .gitignore pnpm-lock.yaml
git commit -m "chore: simplify root workspace to tools/* only"
```

---

## Task 3: copy-template.ts 작성 (TDD)

`clone.ts`를 대체하는 `copy-template.ts` 작성. 번들된 template/ 디렉토리를 fs-extra로 복사.

**Files:**

- Create: `tools/create-jjlabs-app/src/steps/copy-template.ts`
- Create: `tools/create-jjlabs-app/src/steps/copy-template.test.ts`

**Step 1: 실패하는 테스트 작성**

파일: `tools/create-jjlabs-app/src/steps/copy-template.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fs-extra mock
vi.mock("fs-extra", () => ({
  default: {
    copy: vi.fn().mockResolvedValue(undefined),
    pathExists: vi.fn().mockResolvedValue(true),
    move: vi.fn().mockResolvedValue(undefined),
  },
}));

// logger mock
vi.mock("../utils/logger.js", () => ({
  logger: { step: vi.fn() },
}));

describe("copyTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("copies template directory to target", async () => {
    const fs = (await import("fs-extra")).default;
    const { copyTemplate } = await import("./copy-template.js");

    await copyTemplate("/target/dir");

    expect(fs.copy).toHaveBeenCalledOnce();
    const [src, dst] = (fs.copy as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(src).toContain("template");
    expect(dst).toBe("/target/dir");
  });

  it("renames gitignore to .gitignore after copy", async () => {
    const fs = (await import("fs-extra")).default;
    const { copyTemplate } = await import("./copy-template.js");

    await copyTemplate("/target/dir");

    expect(fs.move).toHaveBeenCalledWith(
      path.join("/target/dir", "gitignore"),
      path.join("/target/dir", ".gitignore"),
    );
  });
});
```

**Step 2: 테스트 실행 — 실패 확인**

```bash
cd tools/create-jjlabs-app
pnpm test src/steps/copy-template.test.ts
```

Expected: `FAIL` — `copy-template.js` 모듈 없음

**Step 3: copy-template.ts 구현**

파일: `tools/create-jjlabs-app/src/steps/copy-template.ts`

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 빌드 후: dist/steps/copy-template.js → dist/../template = dist/../template
// tsx dev: src/steps/copy-template.ts → src/../template = src/../template (dev 시)
const TEMPLATE_DIR = path.resolve(__dirname, "../../template");

export async function copyTemplate(targetDir: string): Promise<void> {
  logger.step("Copying template files...");
  await fs.copy(TEMPLATE_DIR, targetDir);

  // npm publish 시 .gitignore는 패키지에서 자동 제외됨
  // template/gitignore → .gitignore 로 rename
  const gitignoreSrc = path.join(targetDir, "gitignore");
  const gitignoreDst = path.join(targetDir, ".gitignore");
  if (await fs.pathExists(gitignoreSrc)) {
    await fs.move(gitignoreSrc, gitignoreDst);
  }
}
```

> **주의:** `TEMPLATE_DIR` 경로는 빌드 결과(`dist/`)와 `tsx` dev 실행(`src/`) 시 다름.
>
> - `pnpm build` 후: `dist/steps/copy-template.js` → `../../template` = `dist/../../template` = `tools/create-jjlabs-app/template` ✓
> - `pnpm dev` (tsx): `src/steps/copy-template.ts` → `../../template` = `src/../../template` = `tools/create-jjlabs-app/template` ✓

**Step 4: 테스트 재실행 — 통과 확인**

```bash
cd tools/create-jjlabs-app
pnpm test src/steps/copy-template.test.ts
```

Expected: `PASS` — 2 tests passed

**Step 5: 커밋**

```bash
git add tools/create-jjlabs-app/src/steps/copy-template.ts \
        tools/create-jjlabs-app/src/steps/copy-template.test.ts
git commit -m "feat: add copy-template step (bundle-based, replaces degit)"
```

---

## Task 4: scaffold.ts — cloneTemplate → copyTemplate 교체

`scaffold.ts`에서 `cloneTemplate` import를 `copyTemplate`으로 변경.

**Files:**

- Modify: `tools/create-jjlabs-app/src/scaffold.ts:3-4,24`

**Step 1: scaffold.ts 수정**

파일: `tools/create-jjlabs-app/src/scaffold.ts`

변경 전:

```ts
import { cloneTemplate } from "./steps/clone.js";
...
  await cloneTemplate(projectDir);
```

변경 후:

```ts
import { copyTemplate } from "./steps/copy-template.js";
...
  await copyTemplate(projectDir);
```

전체 `scaffold.ts`:

```ts
import path from "node:path";
import type { LayoutChoice } from "./config/constants.js";
import { copyTemplate } from "./steps/copy-template.js";
import { cleanLayout } from "./steps/clean-layout.js";
import { cleanAuthDuplication } from "./steps/clean-auth-duplication.js";
import { updateRedirects } from "./steps/update-redirects.js";
import { updatePackageNames } from "./steps/update-package-names.js";
import { resetSerenaConfig } from "./steps/reset-serena-config.js";
import { substituteProjectName } from "./steps/substitute-project-name.js";
import { finalize } from "./steps/finalize.js";
import { logger } from "./utils/logger.js";

interface ScaffoldOptions {
  readonly projectName: string;
  readonly layout: LayoutChoice;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName, layout } = options;
  const projectDir = path.resolve(projectName);

  logger.info(`\nCreating ${projectName} with ${layout} layout...\n`);

  await copyTemplate(projectDir);
  await cleanLayout(projectDir, layout);
  await cleanAuthDuplication(projectDir, layout);
  await updateRedirects(projectDir, layout);
  await updatePackageNames(projectDir, projectName);
  await resetSerenaConfig(projectDir, projectName);
  await substituteProjectName(projectDir, projectName);
  await finalize(projectDir);

  logger.success(`\nProject "${projectName}" created successfully!\n`);
  logger.info("Next steps:");
  logger.info(`  cd ${projectName}`);
  logger.info("  # Update .env with your credentials");
  logger.info("  pnpm dev\n");
}
```

**Step 2: 타입 체크**

```bash
cd tools/create-jjlabs-app
pnpm typecheck
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add tools/create-jjlabs-app/src/scaffold.ts
git commit -m "refactor: replace cloneTemplate with copyTemplate in scaffold"
```

---

## Task 5: finalize.ts — removeToolsDir 제거

template에 `tools/` 디렉토리가 없으므로 `removeToolsDir` 로직 불필요.

**Files:**

- Modify: `tools/create-jjlabs-app/src/steps/finalize.ts:7-8,22-29`

**Step 1: finalize.ts 수정**

`removeToolsDir` 함수 전체와 `finalize` 내 호출부 제거.

변경 후 `finalize.ts`:

```ts
import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

export async function finalize(projectDir: string): Promise<void> {
  await removeGitDir(projectDir);
  await copyEnvFile(projectDir);
  await installDependencies(projectDir);
}

async function removeGitDir(projectDir: string): Promise<void> {
  const gitDir = path.join(projectDir, ".git");

  if (await fs.pathExists(gitDir)) {
    logger.step("Removing .git directory...");
    await fs.remove(gitDir);
  }
}

const ENV_EXAMPLE_PATHS = [
  "apps/app/.env.example",
  "packages/database/.env.example",
];

async function copyEnvFile(projectDir: string): Promise<void> {
  logger.step("Creating .env files from .env.example...");

  for (const envExampleRelPath of ENV_EXAMPLE_PATHS) {
    const envExample = path.join(projectDir, envExampleRelPath);
    const envLocal = path.join(
      projectDir,
      envExampleRelPath.replace(".env.example", ".env"),
    );

    if (await fs.pathExists(envExample)) {
      await fs.copy(envExample, envLocal);
    }
  }
}

async function installDependencies(projectDir: string): Promise<void> {
  logger.step("Installing dependencies...");

  try {
    execSync("pnpm install", {
      cwd: projectDir,
      stdio: "inherit",
    });
  } catch {
    logger.warn("Failed to install dependencies. Run 'pnpm install' manually.");
  }
}
```

**Step 2: 타입 체크**

```bash
cd tools/create-jjlabs-app
pnpm typecheck
```

Expected: 에러 없음

**Step 3: 커밋**

```bash
git add tools/create-jjlabs-app/src/steps/finalize.ts
git commit -m "refactor: remove removeToolsDir from finalize (not in bundled template)"
```

---

## Task 6: constants.ts — TEMPLATE_REPO 제거

`clone.ts`가 제거되므로 `TEMPLATE_REPO` 상수도 불필요.

**Files:**

- Modify: `tools/create-jjlabs-app/src/config/constants.ts:1`

**Step 1: constants.ts 수정**

변경 전 첫 번째 줄:

```ts
export const TEMPLATE_REPO = "jjlabsio/jjlabsio-starter";
```

해당 줄 제거. 나머지 상수는 유지.

변경 후 `constants.ts`:

```ts
export const APP_DIR = "apps/app";
export const SRC_DIR = `${APP_DIR}/src`;
export const COMPONENTS_DIR = `${SRC_DIR}/components`;
export const AUTHENTICATED_DIR = `${SRC_DIR}/app/(authenticated)`;
export const SIDEBAR_GROUP_DIR = `${AUTHENTICATED_DIR}/(sidebar)`;
export const STANDARD_GROUP_DIR = `${AUTHENTICATED_DIR}/(standard)`;

export const DOMAINS_DIR = `${SRC_DIR}/domains`;
export const STANDARD_DOMAIN_DIR = `${DOMAINS_DIR}/standard`;
export const SIDEBAR_DOMAIN_DIR = `${DOMAINS_DIR}/sidebar`;

export const ROOT_PAGE = `${SRC_DIR}/app/page.tsx`;
export const SIGN_IN_PAGE = `${SRC_DIR}/app/(public)/sign-in/page.tsx`;

export type LayoutChoice = "sidebar" | "standard";
```

**Step 2: clone.ts 삭제**

```bash
git rm tools/create-jjlabs-app/src/steps/clone.ts
```

**Step 3: 타입 체크**

```bash
cd tools/create-jjlabs-app
pnpm typecheck
```

Expected: 에러 없음 (clone.ts는 scaffold.ts에서 이미 import 제거됨)

**Step 4: 커밋**

```bash
git add tools/create-jjlabs-app/src/config/constants.ts
git commit -m "refactor: remove TEMPLATE_REPO constant and clone.ts step"
```

---

## Task 7: CLI package.json 업데이트

`degit` 의존성 제거, `files` 필드에 `template` 추가.

**Files:**

- Modify: `tools/create-jjlabs-app/package.json`

**Step 1: package.json 수정**

변경 후:

```json
{
  "name": "create-jjlabs-app",
  "version": "0.1.8",
  "description": "CLI to scaffold a new JJLabs app from the starter template",
  "type": "module",
  "bin": {
    "create-jjlabs-app": "dist/index.js"
  },
  "files": ["dist", "template"],
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "publish:npm": "pnpm build && npm publish --access public --auth-type=web"
  },
  "dependencies": {
    "fs-extra": "^11.2.0",
    "picocolors": "^1.1.1",
    "prompts": "^2.4.2"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/prompts": "^2.4.9",
    "tsup": "^8.3.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

**Step 2: degit 제거 후 pnpm install**

```bash
cd tools/create-jjlabs-app
pnpm install
```

Expected: `degit` 제거, lockfile 업데이트

**Step 3: 전체 테스트 실행**

```bash
pnpm test
```

Expected: `PASS` — copy-template 테스트 통과

**Step 4: 커밋**

```bash
git add tools/create-jjlabs-app/package.json \
        tools/create-jjlabs-app/pnpm-lock.yaml
git commit -m "chore: remove degit dep, add template to npm files field"
```

---

## Task 8: 로컬 end-to-end 테스트

실제로 `pnpm dev`를 실행해 scaffold가 올바르게 동작하는지 검증.

**Step 1: CLI 빌드**

```bash
cd tools/create-jjlabs-app
pnpm build
```

Expected: `dist/` 생성, 에러 없음

**Step 2: npm pack으로 패키지 내용 확인**

```bash
cd tools/create-jjlabs-app
npm pack --dry-run 2>&1 | head -60
```

Expected 출력에 반드시 포함되어야 할 항목:

```
template/apps/...
template/packages/...
template/turbo.json
template/gitignore    ← .gitignore 아님 (rename 전)
dist/index.js
```

**Step 3: 임시 디렉토리에 scaffold 실행**

```bash
cd tools/create-jjlabs-app
pnpm dev /tmp/test-jjlabs-app -- --layout sidebar 2>&1 || \
  tsx src/index.ts /tmp/test-jjlabs-app
```

또는 대화형으로:

```bash
cd tools/create-jjlabs-app
tsx src/index.ts
# 프로젝트명: test-jjlabs-app
# 레이아웃: sidebar 선택
```

**Step 4: scaffold 결과 구조 확인**

```bash
ls /tmp/test-jjlabs-app/
```

Expected:

```
apps  CLAUDE.md  docs  docker-compose.yml  eslint.config.js
.gitignore  .husky  .mcp.json  package.json  packages
pnpm-workspace.yaml  .serena  tsconfig.json  turbo.json
```

확인 사항:

- [ ] `.gitignore` 존재 (gitignore → .gitignore rename 성공)
- [ ] `tools/` 디렉토리 없음
- [ ] `apps/app/src/domains/sidebar/` 존재
- [ ] `apps/app/src/domains/standard/` 없음 (sidebar 선택 시)
- [ ] `apps/app/.env` 존재 (`.env.example`에서 복사됨)

**Step 5: 커밋**

```bash
git add -A
git commit -m "test: verify bundle template scaffold end-to-end"
```

---

## Task 9: README 업데이트

`create-jjlabs-app/README.md`의 "템플릿 개발 시 빌드 제한" 섹션과 개발 워크플로우 업데이트.

**Files:**

- Modify: `tools/create-jjlabs-app/README.md`

**Step 1: README 수정**

"Scaffold Flow" 섹션의 1번 항목 업데이트:

```markdown
1. **Copy** - 번들된 템플릿 파일 복사 (네트워크 불필요)
```

"Development" 섹션의 테스트 방법 업데이트:

````markdown
### 로컬 테스트

```bash
# GitHub push 없이 즉시 테스트 가능
cd tools/create-jjlabs-app
pnpm dev my-test-app
```
````

````

"템플릿 개발 시 빌드 제한" 섹션 전체 내용 교체:

```markdown
### 템플릿 개발 위치

템플릿 파일은 `tools/create-jjlabs-app/template/`에 위치합니다.

```bash
# 템플릿 파일 직접 편집
tools/create-jjlabs-app/template/apps/app/src/...

# 템플릿 scaffold 테스트
cd tools/create-jjlabs-app
pnpm dev /tmp/test-project
````

두 레이아웃(`(sidebar)`, `(standard)`)이 동시에 `/settings/billing` 경로를 정의하므로,
`template/` 안의 프로젝트는 **단독으로 빌드되지 않습니다.** `create-jjlabs-app`이 레이아웃을 선택한 후에야 빌드 가능.

````

**Step 2: 커밋**

```bash
git add tools/create-jjlabs-app/README.md
git commit -m "docs: update README for bundled template workflow"
````

---

## 완료 확인 체크리스트

- [ ] `tools/create-jjlabs-app/template/` 에 `apps/`, `packages/` 등 모든 템플릿 파일 존재
- [ ] 레포 루트의 `pnpm-workspace.yaml`이 `tools/*` 만 포함
- [ ] `copy-template.ts` 테스트 통과
- [ ] `clone.ts` 삭제됨
- [ ] `TEMPLATE_REPO` 상수 제거됨
- [ ] `degit` 의존성 제거됨
- [ ] `package.json` `files`에 `"template"` 포함
- [ ] `npm pack --dry-run`에 `template/` 파일 포함 확인
- [ ] scaffold 실행 시 `.gitignore` 올바르게 생성됨
- [ ] scaffold 결과물에 `tools/` 없음
