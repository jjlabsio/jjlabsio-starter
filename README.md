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
2. Sidebar 또는 Standard 레이아웃 선택
3. 선택하지 않은 레이아웃 route group 및 domain 디렉토리 제거
4. 선택한 레이아웃의 중복 auth guard 정리
5. package 이름과 프로젝트명 플레이스홀더 치환
6. 로컬 개발 포트 배정 및 템플릿 파일 반영
7. `.env.example` 기반 `.env` 파일 생성
8. 의존성 설치

## Layout Options

| Layout | Description |
| --- | --- |
| **Sidebar** | 대시보드 스타일의 사이드바 네비게이션 |
| **Standard** | 헤더 + 푸터 레이아웃 |
