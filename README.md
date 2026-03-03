# create-jjlabs-app

[jjlabsio-starter](https://github.com/jjlabsio/jjlabsio-starter) 템플릿으로 새 SaaS 프로젝트를 생성하는 CLI 도구.

## Usage

```bash
npx create-jjlabs-app my-app
```

프로젝트 이름을 생략하면 대화형으로 입력받습니다:

```bash
npx create-jjlabs-app
```

### Options

```
-h, --help      도움말 표시
-v, --version   버전 표시
```

## Scaffold Flow

1. **Copy** — CLI 패키지에 내장된 `template/`을 프로젝트 경로로 복사
2. **Layout 선택** — Sidebar 또는 Standard 레이아웃 선택, 미사용 레이아웃의 route group·domain 디렉토리 제거
3. **Auth 정리** — 선택한 레이아웃의 `layout.tsx`에서 중복 auth guard 제거
4. **Redirect 업데이트** — Standard 선택 시 루트·sign-in 리다이렉트 경로를 `/dashboard` → `/home`으로 변경
5. **패키지 이름 업데이트** — root 및 `apps/app`의 `package.json` 이름 치환
6. **Serena 설정 초기화** — `.serena/project.yml`의 `project_name` 갱신
7. **플레이스홀더 치환** — `{{PROJECT_NAME}}`을 실제 프로젝트명으로 일괄 치환
8. **마무리** — `.git` 제거, `.env.example` → `.env` 복사, `pnpm install` 실행

## Layout Options

| Layout       | Description                          |
| ------------ | ------------------------------------ |
| **Sidebar**  | 대시보드 스타일의 사이드바 네비게이션 |
| **Standard** | 헤더 + 푸터 레이아웃                  |

---

## Development

이 레포는 `create-jjlabs-app` CLI 도구 개발 워크스페이스입니다.

### 구조

```
tools/
  create-jjlabs-app/
    src/          # CLI 소스 (TypeScript)
    template/     # 번들 템플릿 (npm 배포 시 포함)
    dist/         # 빌드 결과물
    tests/        # 테스트
```

### 명령어

```bash
cd tools/create-jjlabs-app

pnpm dev              # tsx로 직접 실행 (빌드 없이)
pnpm build            # tsup으로 dist/ 빌드
pnpm test             # vitest 테스트 실행
pnpm test:watch       # 감시 모드
pnpm typecheck        # 타입 체크
```

### 로컬 E2E 테스트

```bash
cd tools/create-jjlabs-app
pnpm test:e2e         # build 후 test-project/ 생성
```

또는 수동:

```bash
pnpm build
node dist/index.js ../../test-project
cd ../../test-project && pnpm dev
```

### 템플릿 수정

템플릿 파일은 `tools/create-jjlabs-app/template/`에 위치합니다.

> **주의:** `(sidebar)`와 `(standard)` 레이아웃이 동일 경로를 정의하므로 **템플릿 자체는 빌드되지 않습니다.** scaffold 후 미사용 레이아웃이 제거되면 충돌이 해소됩니다.

`gitignore`(점 없음)로 저장된 파일은 `copy-template.ts`가 복사 시 `.gitignore`로 rename합니다.

### npm 배포

```bash
cd tools/create-jjlabs-app
pnpm publish:npm
```
