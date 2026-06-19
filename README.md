# create-jjlabs-app

[jjlabsio-starter](https://github.com/jjlabsio/jjlabsio-starter) 템플릿으로 새 프로젝트를 생성하는 CLI 도구.

## Usage

```bash
npx @jjlabsio/create-jjlabs-app@latest my-app
```

프로젝트 이름을 생략하면 대화형으로 입력받습니다:

```bash
npx @jjlabsio/create-jjlabs-app@latest
```

CLI 실행 파일 이름은 계속 `create-jjlabs-app`입니다.

## Options

```
-h, --help      도움말 표시
-v, --version   버전 표시
```

## Scaffold Flow

1. **Copy** — CLI 패키지에 내장된 `template/`을 프로젝트 경로로 복사
2. **Layout 선택** — Sidebar 또는 Standard 레이아웃 선택, 미사용 레이아웃의 route group·domain 디렉토리 제거
3. **Auth 정리** — 선택한 레이아웃의 `layout.tsx`에서 중복 auth guard 제거 (상위 `(authenticated)/layout.tsx`가 담당)
4. **Redirect 업데이트** — Standard 선택 시 루트·sign-in 리다이렉트 경로를 `/dashboard` → `/home`으로 변경
5. **패키지 이름 업데이트** — root 및 `apps/app`의 `package.json` 이름 치환
6. **Serena 설정 초기화** — `.serena/project.yml`의 `project_name` 갱신
7. **플레이스홀더 치환** — `{{PROJECT_NAME}}`을 실제 프로젝트명으로 일괄 치환
8. **포트 확정** — CLI에서 preview한 로컬 개발 포트를 템플릿 파일에 기록
9. **마무리** — `.git` 제거, 앱·패키지 `.env.example` → `.env` 복사, `pnpm install` 실행

## Layout Options

| Layout | Description |
| ------------ | ------------------------------------- |
| **Sidebar** | 대시보드 스타일의 사이드바 네비게이션 |
| **Standard** | 헤더 + 푸터 레이아웃 |

## Development

```bash
pnpm install
pnpm dev              # tsx로 직접 실행 (tsx src/index.ts)
pnpm build            # tsup으로 dist/ 빌드
pnpm test             # vitest 테스트 실행
pnpm test:watch       # 감시 모드
pnpm typecheck        # 타입 체크
```

### 템플릿 위치

템플릿 파일은 `template/`에 위치. npm 배포 시 `dist/`와 함께 패키지에 포함됨 (`files: ["dist", "template"]`).

로컬 E2E 테스트:

```bash
pnpm build
node dist/index.js test-project
cd test-project && pnpm dev
```

### 템플릿 빌드 제한

`(sidebar)`와 `(standard)` 양쪽이 `/settings/billing` 등 동일 경로를 정의하므로 **템플릿 자체는 빌드되지 않음.** 의도된 설계 — scaffold 후 미사용 레이아웃이 제거되면 충돌 해소.

## Publishing

릴리스는 GitHub Actions로 자동화됨.

1. PR 제목을 Conventional Commit 형식으로 작성

```text
feat: add capability        # minor
fix: correct behavior       # patch
docs: update release docs   # patch
ci: update workflow         # patch
feat!: change contract      # major
```

2. 비릴리스 PR은 `release-none` 라벨 적용
3. PR merge 후 `main` push에서 `.github/workflows/release.yml` 실행
4. workflow가 버전 결정, `chore(release): vX.Y.Z` 커밋, 태그, GitHub Release, npm publish 수행

수동으로 특정 버전을 재시도해야 할 때는 `workflow_dispatch`로 Release workflow를 실행하고 `version`에 정확한 semver를 입력.

```text
0.2.2
```

이미 tag 또는 GitHub Release가 있으면 workflow가 해당 단계는 건너뛰고, npm에 같은 버전이 없을 때 publish를 다시 시도함.

### npm Trusted Publishing

npm package `@jjlabsio/create-jjlabs-app`에 Trusted Publisher 설정 필요:

- Repository: `jjlabsio/jjlabsio-starter`
- Workflow: `.github/workflows/release.yml`
- Environment: 비워둠

workflow는 npm 토큰 없이 OIDC provenance publish 사용:

```bash
npm publish --provenance --access public
```

provenance 검증을 위해 root `package.json`의 `repository.url`은 GitHub repository와 매칭되어야 함.
