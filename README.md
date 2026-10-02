# create-jjlabs-app

[jjlabsio-starter](https://github.com/jjlabsio/jjlabsio-starter) 템플릿으로 새 프로젝트를 생성하는 CLI.

## Usage

```bash
npx @jjlabsio/create-jjlabs-app@latest my-app
```

프로젝트 이름을 생략하면 대화형으로 입력받음:

```bash
npx @jjlabsio/create-jjlabs-app@latest
```

CLI 실행 파일 이름은 `create-jjlabs-app`.

## Options

```text
-h, --help      도움말 표시
-v, --version   버전 표시
```

## 생성되는 프로젝트

템플릿은 pnpm workspace 기반 모노레포를 생성함.

- `apps/app`: 인증, 결제, 대시보드가 포함된 SaaS 앱
- `apps/web`: 랜딩/마케팅 웹 앱
- `apps/api`: NestJS API 앱
- `apps/worker`: NestJS Worker 앱
- `packages/*`: auth, billing, database, email, ui 등 공유 패키지

생성 후 `README.md`에 초기 설정 절차가 포함됨.

## Scaffold Flow

1. CLI 패키지에 포함된 `template/` 복사
2. package 이름과 프로젝트명 플레이스홀더 치환
3. 로컬 개발 포트 배정 및 템플릿 파일 반영
4. `.env.example` 기반 `.env` 파일 생성
5. 의존성 설치

생성되는 앱은 대시보드 스타일의 sidebar 레이아웃을 기본으로 사용함.

## 템플릿 앱 미리보기

CLI를 배포하거나 프로젝트를 다시 생성하지 않고 현재 `template/` 소스를 바로 확인하려면 저장소 루트에서 실행:

```bash
pnpm dev:template-app
```

첫 실행 시 루프백에만 바인딩된 템플릿 전용 PostgreSQL과 `.local-preview/`의 로컬 인증 비밀값을 준비함. 이후에는 기존 의존성·DB·테스트 계정을 재사용하며, 앱은 `http://localhost:3999/sign-in`에서 실행됨. 앱·UI 소스 수정은 Next.js 개발 서버에 즉시 반영됨. `Ctrl-C`는 앱만 종료하고 DB와 테스트 데이터는 남김. 미리보기는 `template/`에 `.env`를 만들거나 기존 파일을 덮어쓰지 않음. 의존성을 변경했을 때만 `cd template && pnpm install` 실행 필요.

## 패키지 안전 검사

PR CI는 Git에 추적된 비밀값·생성물과 npm 패키지에 실제 포함될 파일을 검사함. 머지 후 릴리스에서도 태그를 만들기 전에 패키지 내용을 다시 검사하며, `npm publish` 직전에도 동일한 검사가 실행됨. 로컬 미리보기의 `node_modules`·`.next`는 Git/패키지에 포함되지 않는 한 검사 실패 사유가 아님.
