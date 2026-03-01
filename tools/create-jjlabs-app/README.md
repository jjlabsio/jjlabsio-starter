# create-jjlabs-app

[jjlabsio-starter](https://github.com/jjlabsio/jjlabsio-starter) 템플릿으로 새 프로젝트를 생성하는 CLI 도구.

## Usage

```bash
npx create-jjlabs-app my-app
```

프로젝트 이름을 생략하면 대화형으로 입력받습니다:

```bash
npx create-jjlabs-app
```

## Options

```
-h, --help      도움말 표시
-v, --version   버전 표시
```

## Scaffold Flow

CLI는 다음 순서로 프로젝트를 생성합니다:

1. **Copy** - CLI 패키지에 내장된 템플릿을 프로젝트 경로로 복사
2. **Layout 선택** - Sidebar 또는 Standard 레이아웃 중 선택하고 미사용 레이아웃 제거
3. **Auth 정리** - 선택한 레이아웃에 맞게 인증 관련 코드 정리
4. **Redirect 업데이트** - 루트 페이지 리다이렉트 경로를 레이아웃에 맞게 변경
5. **패키지 이름 업데이트** - `package.json`의 이름을 프로젝트 이름으로 변경
6. **Serena 설정 초기화** - `.serena/project.yml`의 프로젝트명 갱신
7. **플레이스홀더 치환** - `{{PROJECT_NAME}}` 플레이스홀더를 실제 프로젝트명으로 일괄 치환
8. **마무리** - `.git` 제거, `.env` 생성, `pnpm install` 실행

## Layout Options

| Layout       | Description                           |
| ------------ | ------------------------------------- |
| **Sidebar**  | 대시보드 스타일의 사이드바 네비게이션 |
| **Standard** | 헤더 + 푸터 레이아웃                  |

## Development

```bash
cd tools/create-jjlabs-app
pnpm install
pnpm dev              # tsx로 직접 실행
pnpm build            # tsup으로 빌드
pnpm test             # 테스트 실행
pnpm typecheck        # 타입 체크
```

### 템플릿 위치

템플릿 파일은 `tools/create-jjlabs-app/template/`에 위치합니다. 이 디렉토리가 npm 배포 시 `dist/`와 함께 패키지에 포함됩니다(`files: ["dist", "template"]`).

템플릿 수정 후 로컬 E2E 테스트:

```bash
cd tools/create-jjlabs-app
pnpm build                       # dist/ 생성
node dist/index.js ../test-project  # scaffold 실행
cd ../test-project
pnpm dev
```

### 템플릿 개발 시 빌드 제한

`apps/app`의 두 레이아웃(`(sidebar)`, `(standard)`)이 동시에 `/settings/billing` 경로를 정의하므로, 템플릿은 **단독으로 빌드되지 않습니다.**

이는 의도된 설계입니다. `create-jjlabs-app`이 레이아웃을 선택하고 미사용 레이아웃 전체를 제거하면 경로 충돌이 해소됩니다.

## Publishing

```bash
cd tools/create-jjlabs-app
pnpm publish:npm
```
