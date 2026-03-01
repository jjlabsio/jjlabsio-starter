# create-jjlabs-app 번들 템플릿 전환 설계

**목표:** `create-jjlabs-app`이 GitHub degit 방식 대신 CLI 패키지 내에 번들된 템플릿 파일을 복사하는 업계 표준 방식으로 전환.

**아키텍처:** 현재 레포 루트에 있는 템플릿 소스(`apps/`, `packages/` 등)를 `tools/create-jjlabs-app/template/`으로 이동. CLI는 런타임에 `path.resolve(__dirname, '../template')`을 복사. 레포 루트는 CLI 개발 환경으로 역할 변경.

**주요 기술:** `fs-extra.copy`, `tsup` (빌드), pnpm workspace

---

## 디렉토리 구조 변화

**현재:**

```
jjlabsio-starter/          ← 레포 루트 = 템플릿 소스
├── apps/
├── packages/
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tools/
    └── create-jjlabs-app/
```

**전환 후:**

```
jjlabsio-starter/          ← 레포 루트 = CLI 개발 환경
├── tools/
│   └── create-jjlabs-app/
│       ├── src/
│       ├── template/      ← 이동된 템플릿
│       │   ├── apps/
│       │   ├── packages/
│       │   ├── docs/
│       │   ├── turbo.json
│       │   ├── pnpm-workspace.yaml
│       │   └── package.json
│       └── package.json
├── pnpm-workspace.yaml    ← tools/* 만 포함
└── package.json           ← 최소 루트 config
```

---

## CLI 코드 변경

| 파일                      | 변경 내용                                          |
| ------------------------- | -------------------------------------------------- |
| `src/steps/clone.ts`      | `copy-template.ts`로 교체 — `fs-extra.copy()` 사용 |
| `src/steps/finalize.ts`   | `tools/` 제거 로직 삭제 (템플릿에 없음)            |
| `src/config/constants.ts` | `TEMPLATE_REPO` 상수 제거                          |
| `package.json`            | `degit` 제거, `files: ["dist", "template"]` 추가   |
| `scaffold.ts`             | `cloneTemplate` → `copyTemplate` import 변경       |

**copy-template.ts 핵심 로직:**

```ts
import path from "path";
import fs from "fs-extra";

const TEMPLATE_DIR = path.resolve(__dirname, "../template");

export async function copyTemplate(targetDir: string): Promise<void> {
  await fs.copy(TEMPLATE_DIR, targetDir);
}
```

---

## 템플릿에 포함되는 파일 목록

레포 루트에서 `tools/create-jjlabs-app/template/`으로 이동:

- `apps/`
- `packages/`
- `docs/`
- `turbo.json`
- `pnpm-workspace.yaml`
- `package.json` (템플릿의 루트 package.json)
- `tsconfig.json`
- `eslint.config.js`
- `.env.example`
- `.prettierrc` (존재 시)
- `.gitignore` (템플릿용)
- `docker-compose.yml` (존재 시)

레포 루트에 **남는** 파일:

- `tools/` (create-jjlabs-app CLI)
- `.github/` (CI/CD)
- `pnpm-workspace.yaml` (tools/\* 만 포함하도록 수정)
- `package.json` (루트 최소 config)

---

## 빌드 및 배포

**npm publish 포함 파일 (`package.json` files 필드):**

```json
{
  "files": ["dist", "template"]
}
```

**로컬 테스트:**

```bash
cd tools/create-jjlabs-app
pnpm dev my-test-app   # GitHub push 없이 즉시 테스트
```

**빌드:**

```bash
cd tools/create-jjlabs-app
pnpm build             # dist/ 생성, template/ 그대로 포함
npm publish            # dist/ + template/ 배포
```

---

## 개발 워크플로우

**템플릿 수정 시:**

```bash
# 템플릿 파일 직접 편집
tools/create-jjlabs-app/template/apps/app/src/...
```

**scaffold 테스트:**

```bash
cd tools/create-jjlabs-app
pnpm dev /tmp/test-project
cd /tmp/test-project
pnpm dev
```
