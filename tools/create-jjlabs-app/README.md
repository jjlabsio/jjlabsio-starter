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

1. **Clone** - GitHub에서 스타터 템플릿 복제
2. **Layout 선택** - Sidebar 또는 Standard 레이아웃 중 선택하고 미사용 레이아웃 제거
3. **Auth 정리** - 선택한 레이아웃에 맞게 인증 관련 코드 정리
4. **Redirect 업데이트** - 루트 페이지 리다이렉트 경로를 레이아웃에 맞게 변경
5. **패키지 이름 업데이트** - `package.json`의 이름을 프로젝트 이름으로 변경
6. **마무리** - `.git` 및 `tools/` 제거, `.env` 생성, `pnpm install` 실행

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

## Publishing

```bash
cd tools/create-jjlabs-app
pnpm build
npm publish
```
