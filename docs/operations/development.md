# Development Guide

`create-jjlabs-app` CLI와 내장 `template/`을 개발하기 위한 메인터너 문서.

## Commands

```bash
pnpm install
pnpm dev              # tsx src/index.ts
pnpm build            # tsup build
pnpm test             # vitest run
pnpm test:watch       # vitest watch
pnpm typecheck        # tsc --noEmit
pnpm test:pack-env    # npm pack 환경 안전성 검사
pnpm test:e2e         # 빌드된 CLI smoke test
```

## Template 위치

템플릿 파일은 `template/`에 위치.

npm 배포 시 root `package.json`의 `files` 설정에 따라 `dist/`와 `template/`만 패키지에 포함됨.

```json
["dist", "template"]
```

## Scaffold 단계 추가

1. `src/steps/`에 단일 책임 파일 추가
2. `src/scaffold.ts`에 import 및 실행 순서 추가
3. 단계 시작 시 `logger.step(...)` 출력
4. 관련 unit/integration test 추가 또는 갱신
5. 사용자-facing 동작이 바뀌면 root `README.md` 갱신
6. 생성된 프로젝트 안내가 바뀌면 `template/README.md` 갱신

## Template 치환

프로젝트명 치환은 `src/steps/substitute-project-name.ts`의 `TARGET_FILES`에서 관리.

포트 치환은 `src/steps/assign-local-ports.ts`에서 관리.

주요 플레이스홀더:

- `{{PROJECT_NAME}}`
- `{{LOCAL_APP_PORT}}`
- `{{LOCAL_WEB_PORT}}`
- `{{LOCAL_API_PORT}}`
- `{{LOCAL_POSTGRES_PORT}}`

## Template gitignore

`template/` 내 `.gitignore`는 npm 배포 시 dotfile 제거 문제를 피하기 위해 `gitignore` 파일명으로 저장.

`src/steps/copy-template.ts`가 복사 후 `gitignore`를 `.gitignore`로 rename 처리.

## Template 빌드 제한

템플릿은 `(sidebar)`와 `(standard)` 양쪽이 동일 route를 일부 정의하므로 템플릿 원본 상태에서는 앱 빌드를 전제로 하지 않음.

scaffold 후 미사용 레이아웃이 제거되면 route 충돌이 해소됨.

## 테스트 기준

일반 변경:

```bash
pnpm test
pnpm typecheck
```

템플릿 구조 또는 scaffold 흐름 변경:

```bash
pnpm test -- tests/unit/template-structure.test.ts tests/integration/scaffold-standard.test.ts tests/integration/scaffold-sidebar.test.ts
```

패키징 또는 배포 포함 여부 변경:

```bash
pnpm test:pack-env
npm pack --dry-run
```

릴리스 전 전체 확인:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm test:pack-env
```

## Release

릴리스는 GitHub Actions로 자동화됨.

1. PR 제목을 release Conventional Commit 형식으로 작성

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

수동으로 특정 버전을 재시도해야 할 때는 `workflow_dispatch`로 Release workflow를 실행하고 `version`에 정확한 semver 입력.

```text
0.3.1
```

이미 tag 또는 GitHub Release가 있으면 workflow가 해당 단계는 건너뛰고, npm에 같은 버전이 없을 때 publish를 다시 시도함.

## npm Trusted Publishing

npm package `@jjlabsio/create-jjlabs-app`에 Trusted Publisher 설정 필요:

- Repository: `jjlabsio/jjlabsio-starter`
- Workflow: `.github/workflows/release.yml`
- Environment: 비워둠

workflow는 npm token 없이 OIDC provenance publish 사용:

```bash
npm publish --provenance --access public
```

provenance 검증을 위해 root `package.json`의 `repository.url`은 GitHub repository와 매칭되어야 함.
