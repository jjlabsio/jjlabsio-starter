# AGENTS.md

> 생성된 프로젝트의 에이전트 작업 지침. 사용자 설치·운영 안내는 `README.md` 참조.

---

## 기준 경로

| 확인 대상                                  | 기준 경로                                                 |
| ------------------------------------------ | --------------------------------------------------------- |
| 스크립트·의존성·런타임 버전                | 루트와 각 워크스페이스의 `package.json`                   |
| 워크스페이스 구조                          | `pnpm-workspace.yaml`, `turbo.json`, `apps/`, `packages/` |
| 실행 앱                                    | `apps/`                                                   |
| 환경 변수                                  | `.env.example` 파일                                       |
| DB 스키마·마이그레이션·생성 클라이언트     | `packages/database/prisma/`, `packages/database/`         |
| 공통 shadcn/ui 컴포넌트·훅·스타일·유틸리티 | `packages/ui/`                                            |
| 디자인 지침                                | `DESIGN.md`                                               |
| 구현된 테마 값                             | `packages/ui/src/styles/globals.css`                      |
| Better Auth 설정·인증 경계                 | `packages/auth/`                                          |
| Polar 결제 경계                            | `packages/billing/`                                       |
| 이메일 템플릿·제공자 경계                  | `packages/email/`                                         |
| 사용자 설치·서비스 설정                    | `README.md`                                               |

- 문서 설명과 실제 설정이 다르면 위 기준 파일을 따른다.

---

## 작업 규칙

- 동작을 바꾸기 전에 기존 코드와 설정을 확인한다.
- 변경 범위를 사용자 요청으로 제한한다.
- 새 추상화를 추가하기 전에 기존 워크스페이스·패키지 패턴을 따른다.
- 비밀값, 실제 `.env` 파일, 토큰, 자격 증명, 개인 키를 커밋하지 않는다.

---

## 명령

- `dev`, `build`, `lint`, `typecheck`, `test`, `format` 실행 전에 루트 `package.json`의 스크립트를 확인한다.
- `db:migrate:dev`, `db:migrate:deploy`, `db:studio` 실행 전에 `packages/database/package.json`의 스크립트를 확인한다.
- DB 스크립트는 `pnpm --filter @repo/database <스크립트>` 형식으로 실행한다.

---

## UI

- UI 작업 전에 루트 `DESIGN.md`를 읽는다.
- 데이터 테이블 구현 전에 `docs/components/data-table.md`를 읽는다.
- 공통 조작 요소의 외형·동작을 화면별 스타일로 덮어쓰지 않는다.
- 화면 전용 컴포넌트는 공통 컴포넌트의 배치·조합에 사용한다.

### 컴포넌트 선택 순서

1. `packages/ui`의 기존 컴포넌트·변형을 조합한다.
2. 기존 컴포넌트의 공통 외형·동작을 바꿔야 하면 `packages/ui`의 구현을 수정하거나 변형을 추가한다.
3. 기존 컴포넌트로 구성할 수 없으면 shadcn/ui 컴포넌트를 승인 없이 `packages/ui`에 추가한다.

- 모든 사용처에 적용할 변경에만 공통 컴포넌트의 기본값을 수정한다.
- shadcn CLI 실행 전에 `packages/ui/components.json`을 확인한다.
- shadcn/ui 외의 오픈소스 UI 컴포넌트·라이브러리를 추가하기 전에 사용자 승인을 받는다.
- shadcn/ui 컴포넌트 추가를 제외하고, 재사용 가능한 새 UI 컴포넌트를 만들기 전에 사용자 승인을 받는다.
- `DESIGN.md` 또는 `packages/ui/src/styles/globals.css`의 토큰 값을 바꿀 때 같은 변경에서 다른 파일의 대응 값을 갱신한다.

---

## 데이터베이스

- PostgreSQL을 사용한다.
- 애플리케이션의 DB 접근에는 `@repo/database`와 Prisma를 사용한다.
- PostgreSQL 호스트는 Neon을 기본으로 권장한다.
- 연결·풀링 URL·직접 연결 URL 요건은 `.env.example`과 Prisma 설정에서 확인한다.

---

## 환경 변수

- 필수 환경 변수는 `.env.example` 파일을 기준으로 확인한다.
- scaffold는 설정된 위치에 `.env.example` 기반의 로컬 `.env` 파일을 생성한다.

---

## 문서

- 사용자 설치·환경 변수·명령·서비스 설정이 바뀌면 `README.md`를 갱신한다.
- 에이전트 작업 규칙이 바뀌면 `AGENTS.md`를 갱신한다.
- 자주 바뀌는 의존성 버전·패키지 목록은 문서에 복제하지 않고 기준 파일을 가리킨다.
