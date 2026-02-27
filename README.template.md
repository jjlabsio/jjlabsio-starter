# {{PROJECT_NAME}}

> TODO: 프로젝트에 대한 설명을 여기에 작성하세요.

## Getting Started

### 1. 환경변수 설정

`.env` 파일이 자동으로 생성되어 있습니다.

`apps/app/.env`에서 아래 값을 설정합니다:

```
# Database
DATABASE_URL="postgresql://admin:admin@localhost:5432/{{PROJECT_NAME}}?schema=public"
DIRECT_URL="postgresql://admin:admin@localhost:5432/{{PROJECT_NAME}}?schema=public"

# Better Auth
BETTER_AUTH_SECRET="replace-with-random-secret-at-least-32-chars"  # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. DB 이름 확인

`docker-compose.yml`의 `POSTGRES_DB`가 자동으로 설정되어 있습니다.

```yaml
# docker-compose.yml
POSTGRES_DB: { { PROJECT_NAME } }
```

`.env`의 `DATABASE_URL`, `DIRECT_URL`도 동일하게 설정되어 있습니다.

### 3. 개발 서버 실행

```bash
docker compose up -d                          # PostgreSQL 실행
pnpm --filter @repo/database db:migrate:dev   # 마이그레이션 실행
pnpm dev                                      # 개발 서버 실행
```

### 4. Codemaps 생성 (Claude Code)

[jj@jjlabsio-claude-code](https://github.com/jjlabsio/jjlabsio-claude-code) 플러그인이 필요합니다.

```
/plugin install jj@jjlabsio-claude-code
/jj:update-docs
```
