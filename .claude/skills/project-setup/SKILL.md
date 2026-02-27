---
name: project-setup
description: Interactive Getting Started setup for new jjlabs starter projects. Automates environment configuration, secret generation, database migrations, and guides Docker startup. Use this whenever a developer first sets up the project, when environment variables need to be configured, or when running `Getting Started` steps. Triggers on phrases like "프로젝트 설정", "초기 설정", "setup project", "getting started", "env 설정", "환경 설정", ".env 만들어줘", "처음 설정", "시작 설정".
---

# Project Setup

Getting Started 단계를 자동화하는 스킬입니다.

끊김이 필요한 작업(플러그인 설치 후 재시작, Docker 시작 대기)을 앞에 모아서, 유저가 한 번에 처리하고 나머지는 자동으로 완료될 수 있도록 설계되어 있다.

## 실행 순서

### 1단계: jj 플러그인 확인

코드맵 생성에 필요한 `jj` 플러그인이 설치되어 있는지 먼저 확인한다:

```bash
claude plugin list 2>/dev/null | grep "^jj"
```

**플러그인이 없으면** 아래 순서로 설치한다:

```bash
# 마켓플레이스 추가 (이미 있으면 에러가 나도 무시)
claude plugin marketplace add jjlabsio/jjlabsio-claude-code

# 플러그인 설치
claude plugin install jj@jjlabsio-claude-code
```

설치 후 **여기서 멈추고** 유저에게 알린다:

---

> ⚠️ jj 플러그인을 설치했습니다. Claude Code를 **재시작**해야 플러그인이 활성화됩니다.
>
> 재시작 후 다시 project-setup을 실행해주세요.

---

> 재시작이 필요한 이유: Claude Code는 시작 시에만 플러그인을 로드하기 때문에 설치 후 재시작 없이는 새 스킬을 사용할 수 없다.

**플러그인이 이미 설치되어 있으면** 바로 2단계로 진행한다.

### 2단계: Docker 확인

PostgreSQL이 이미 실행 중인지 확인한다:

```bash
docker compose ps --status running 2>/dev/null
```

- **PostgreSQL 컨테이너가 이미 실행 중이면**: 바로 3단계로 진행한다
- **실행 중이지 않으면**: 유저에게 다음 메시지를 보내고 **응답을 기다린다**:

---

> PostgreSQL을 시작해야 합니다. 아래 명령어를 실행하고 완료되면 알려주세요:
>
> ```bash
> docker compose up -d
> ```

---

유저가 완료 응답을 하면 3단계로 진행한다.

### 3단계: 프로젝트 이름 확인

루트 `package.json`의 `name` 필드를 읽어서 프로젝트 이름을 가져온다.

```bash
cat package.json | jq -r '.name'
```

### 4단계: BETTER_AUTH_SECRET 생성

아래 명령어를 실행해서 32자 랜덤 시크릿을 생성한다:

```bash
openssl rand -base64 32
```

결과 값을 메모리에 저장해둔다.

### 5단계: .env 파일 생성

`apps/app/.env` 파일이 이미 존재하는지 확인한다.

- **파일이 없으면**: 바로 생성
- **파일이 있으면**: 유저에게 덮어쓸지 물어본다

파일 내용 (실제 값으로 치환):

```
# Database
DATABASE_URL="postgresql://admin:admin@localhost:5432/<PROJECT_NAME>?schema=public"
DIRECT_URL="postgresql://admin:admin@localhost:5432/<PROJECT_NAME>?schema=public"

# Better Auth
BETTER_AUTH_SECRET="<GENERATED_SECRET>"  # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**파일 작성 후 즉시 검증**: 이 프로젝트에는 파일 저장 시 자동 포매팅 훅이 실행된다. 훅이 DATABASE_URL의 DB 이름을 기본값(`starter`)으로 되돌릴 수 있으므로, 작성 직후 확인한다:

```bash
grep "DATABASE_URL" apps/app/.env
```

`<PROJECT_NAME>` 자리에 `starter`가 들어가 있으면 Edit 도구로 즉시 수정한다. DIRECT_URL도 동일하게 확인한다.

파일 최종 확인 후 유저에게 알림:

- ✅ `BETTER_AUTH_SECRET`이 자동 생성되었음
- ⚠️ `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`은 수동으로 입력 필요
  - 발급: https://console.cloud.google.com/apis/credentials

### 6단계: 데이터베이스 마이그레이션

```bash
pnpm --filter @repo/database db:migrate:dev
```

실행 결과를 유저에게 보고한다. 실패하면:

- Docker가 실행 중인지 확인하라고 안내
- DB 이름(`docker-compose.yml`의 `POSTGRES_DB`)이 프로젝트 이름과 일치하는지 확인하라고 안내

### 7단계: 코드맵 생성

`jj:doc-full-scan` 스킬을 실행한다. 첫 셋업이므로 전체 스캔이 필요하다.

코드맵은 `docs/CODEMAPS/` 디렉토리에 저장되며, 이후 Claude가 프로젝트 구조를 빠르게 파악하는 데 사용된다.

### 8단계: 완료 안내

유저에게 다음을 안내한다:

---

> ✅ 설정 완료! 개발 서버를 시작하려면:
>
> ```bash
> pnpm dev
> ```
>
> 앱: http://localhost:3000

---

## 주의사항

- `apps/app/.env`에 이미 커스텀 값이 있으면 덮어쓰기 전에 반드시 유저 확인
- Google OAuth 없이도 앱은 실행되지만 소셜 로그인은 비활성화 상태
- `pnpm dev`는 장시간 실행되므로 직접 실행하지 않고 유저에게 안내만 함
