# Flatten Monorepo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** pnpm 모노레포(`tools/create-jjlabs-app/`) 구조를 리포 루트가 곧 `create-jjlabs-app` 패키지인 flat 구조로 변환한다.

**Architecture:** 루트의 workspace `package.json` / `pnpm-workspace.yaml`을 제거하고, `tools/create-jjlabs-app/`의 `package.json` + 모든 소스 파일을 루트로 올린다. `.gitignore`와 `README.md`는 루트 경로에 맞게 수정한다.

**Tech Stack:** pnpm, Node.js ≥20, TypeScript, tsup, vitest

---

## 현재 파일 맵 (변경 전)

```
jjlabsio-starter/
  .gitignore                     ← tools/create-jjlabs-app/ prefix 패턴 포함
  .git/
  .claude/
  README.md                      ← 루트 workspace README
  package.json                   ← { name: "jjlabsio-starter-dev", private: true }
  pnpm-lock.yaml                 ← workspace lock
  pnpm-workspace.yaml            ← packages: ["tools/*"]
  tools/
    create-jjlabs-app/
      package.json               ← 실제 CLI 패키지
      pnpm-lock.yaml             ← 패키지 lock
      tsconfig.json
      tsup.config.ts
      vitest.config.ts
      CLAUDE.md
      README.md
      src/
      template/
      tests/
      dist/                      ← 빌드 아티팩트 (gitignored)
      node_modules/              ← gitignored
```

## 목표 파일 맵 (변경 후)

```
jjlabsio-starter/
  .gitignore                     ← 경로 prefix 업데이트
  .git/
  .claude/
  README.md                      ← create-jjlabs-app README로 교체
  CLAUDE.md                      ← create-jjlabs-app CLAUDE.md로 이동
  package.json                   ← create-jjlabs-app package.json (scripts 수정)
  pnpm-lock.yaml                 ← create-jjlabs-app pnpm-lock.yaml로 교체
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
  src/
  template/
  tests/
  dist/                          ← gitignored
  node_modules/                  ← gitignored
```

---

### Task 1: 소스 파일 루트로 이동

**Files:**
- Move: `tools/create-jjlabs-app/src/` → `src/`
- Move: `tools/create-jjlabs-app/template/` → `template/`
- Move: `tools/create-jjlabs-app/tests/` → `tests/`
- Move: `tools/create-jjlabs-app/tsconfig.json` → `tsconfig.json`
- Move: `tools/create-jjlabs-app/tsup.config.ts` → `tsup.config.ts`
- Move: `tools/create-jjlabs-app/vitest.config.ts` → `vitest.config.ts`
- Move: `tools/create-jjlabs-app/CLAUDE.md` → `CLAUDE.md`

**Step 1: 소스 디렉토리 이동**

```bash
cp -r tools/create-jjlabs-app/src .
cp -r tools/create-jjlabs-app/template .
cp -r tools/create-jjlabs-app/tests .
```

Expected: 루트에 `src/`, `template/`, `tests/` 디렉토리 생성.

**Step 2: 설정 파일 이동**

```bash
cp tools/create-jjlabs-app/tsconfig.json .
cp tools/create-jjlabs-app/tsup.config.ts .
cp tools/create-jjlabs-app/vitest.config.ts .
cp tools/create-jjlabs-app/CLAUDE.md .
```

**Step 3: 파일이 올바르게 복사됐는지 확인**

```bash
ls -la src/ tests/ template/ tsconfig.json tsup.config.ts vitest.config.ts CLAUDE.md
```

Expected: 모두 존재.

---

### Task 2: package.json 교체

**Files:**
- Modify: `package.json` (루트)

**Step 1: 루트 package.json을 create-jjlabs-app 내용으로 교체**

루트 `package.json`을 아래 내용으로 완전 교체한다 (`test:e2e` 스크립트 경로 수정 포함):

```json
{
  "name": "create-jjlabs-app",
  "version": "0.1.8",
  "description": "CLI to scaffold a new JJLabs app from the starter template",
  "type": "module",
  "bin": {
    "create-jjlabs-app": "dist/index.js"
  },
  "files": [
    "dist",
    "template"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "test:e2e": "rm -rf ../test-project && pnpm build && cd .. && node jjlabsio-starter/dist/index.js test-project",
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
  },
  "packageManager": "pnpm@10.4.1"
}
```

> 주의: `test:e2e`의 기존 경로 `rm -rf ../../test-project ... cd ../..`는 `tools/create-jjlabs-app/` 기준이었으므로 루트 기준으로 수정해야 한다.

**Step 2: 파일 확인**

```bash
cat package.json
```

Expected: `"name": "create-jjlabs-app"` 포함.

---

### Task 3: pnpm-lock.yaml 교체 및 workspace 파일 제거

**Files:**
- Replace: `pnpm-lock.yaml` (루트)
- Delete: `pnpm-workspace.yaml`

**Step 1: create-jjlabs-app의 lock 파일로 교체**

```bash
cp tools/create-jjlabs-app/pnpm-lock.yaml pnpm-lock.yaml
```

**Step 2: workspace 설정 파일 제거**

```bash
rm pnpm-workspace.yaml
```

**Step 3: 확인**

```bash
ls pnpm-workspace.yaml 2>&1; head -3 pnpm-lock.yaml
```

Expected: `pnpm-workspace.yaml: No such file or directory`, lock 파일 헤더 출력.

---

### Task 4: .gitignore 업데이트

**Files:**
- Modify: `.gitignore`

현재 `.gitignore`는 `tools/create-jjlabs-app/` prefix 기반 패턴을 포함한다. flat 구조에 맞게 경로를 수정한다.

**Step 1: .gitignore를 아래 내용으로 교체**

```
dist/
node_modules/
template/node_modules/
template/.turbo/
template/apps/app/.next/
template/apps/web/.next/
template/apps/*/node_modules/
template/packages/*/node_modules/
template/**/.env
template/**/.env.*
template/apps/app/coverage/
template/packages/*/coverage/
template/packages/*/.turbo/

test-project/

# OS artifacts
.DS_Store
*.pem

# Debug logs
npm-debug.log*
```

**Step 2: 확인**

```bash
cat .gitignore
```

Expected: `tools/create-jjlabs-app/` prefix 없이 `dist/`, `node_modules/` 등이 보임.

---

### Task 5: README.md 교체

**Files:**
- Replace: `README.md`

**Step 1: create-jjlabs-app README로 루트 README 교체**

```bash
cp tools/create-jjlabs-app/README.md README.md
```

**Step 2: 확인**

```bash
head -5 README.md
```

Expected: create-jjlabs-app 관련 내용.

---

### Task 6: 의존성 설치 및 빌드 검증

**Step 1: 루트 node_modules 및 기존 lock 정리 후 재설치**

```bash
rm -rf node_modules
pnpm install
```

Expected: `node_modules/` 재생성, 에러 없음.

**Step 2: TypeScript 타입 검사**

```bash
pnpm typecheck
```

Expected: 에러 없음.

**Step 3: 빌드**

```bash
pnpm build
```

Expected: `dist/index.js` 생성.

**Step 4: 테스트**

```bash
pnpm test
```

Expected: 모든 테스트 통과.

---

### Task 7: tools/ 디렉토리 제거

**Step 1: tools 디렉토리 삭제**

```bash
rm -rf tools/
```

**Step 2: 확인**

```bash
ls tools 2>&1
```

Expected: `ls: tools: No such file or directory`

---

### Task 8: CLAUDE.md 내 경로 참조 업데이트

**Files:**
- Modify: `CLAUDE.md`

CLAUDE.md는 `tools/create-jjlabs-app/` 경로 없이 이미 상대 경로로 작성돼 있으므로, 내용 확인 후 필요시 수정한다.

**Step 1: CLAUDE.md 확인**

```bash
cat CLAUDE.md
```

Expected: 경로 참조가 `src/`, `tests/` 등 루트 기준으로 돼 있음. 문제 있으면 수정.

---

### Task 9: 최종 커밋

**Step 1: git status 확인**

```bash
git status
```

Expected: 새 파일들 tracked, `tools/` 삭제됨.

**Step 2: 스테이징 및 커밋**

```bash
git add -A
git commit -m "refactor: flatten monorepo - promote create-jjlabs-app to repo root"
```

Expected: 커밋 성공.

---

## 완료 기준

- [ ] 루트에서 `pnpm install` 성공
- [ ] `pnpm build` → `dist/index.js` 생성
- [ ] `pnpm test` → 모든 테스트 통과
- [ ] `pnpm typecheck` → 에러 없음
- [ ] `pnpm-workspace.yaml` 없음
- [ ] `tools/` 디렉토리 없음
- [ ] `.gitignore`에 `tools/create-jjlabs-app/` prefix 없음
