# CLAUDE.md

> **Claude Code 작업 지침 파일.**
> 이 파일은 저장소 작업 시 참고할 핵심 구조와 규칙만 기록.
> 중복 설명 지양, 변경 시 실제 코드와 README.md 기준으로 동기화.

---

## Source Structure

```
src/
  index.ts              # CLI 진입점, 인수 파싱, 대화형 입력 호출
  prompts.ts            # 프로젝트명, 레이아웃, 로컬 포트 선택 입력
  scaffold.ts           # 전체 scaffold 흐름 오케스트레이션
  config/
    constants.ts        # 경로 상수, 레이아웃 타입
    layout-files.ts     # 선택 레이아웃 기준 제거 대상 반환
  steps/
    copy-template.ts    # 내장 template/ 디렉토리를 프로젝트 경로로 복사
    clean-layout.ts     # 미사용 layout route group 및 domain 디렉토리 제거
    clean-auth-duplication.ts  # 선택 layout.tsx의 중복 auth guard 제거
    update-package-names.ts    # root 및 apps/app package.json 이름 치환
    substitute-project-name.ts # {{PROJECT_NAME}} 플레이스홀더 치환
    assign-local-ports.ts      # 프로젝트별 로컬 개발 포트 배정 및 템플릿 반영
    finalize.ts         # .git 제거, .env 복사, pnpm install 실행
  utils/
    fs.ts               # fs-extra 래퍼
    logger.ts           # 컬러 로그 출력
    validate.ts         # 프로젝트명 유효성 검사 및 디렉토리 충돌 확인
```

---

## Scaffold Flow

1. `template/` 복사
2. 선택하지 않은 레이아웃 route group 및 domain 디렉토리 제거
3. 선택 레이아웃의 중복 auth guard 제거
4. package 이름 치환
5. `{{PROJECT_NAME}}` 플레이스홀더 치환
6. 로컬 개발 포트 배정 및 템플릿 포트 플레이스홀더 치환
7. `.git` 제거, `.env.example` 복사, `pnpm install` 실행

---

## Layout Structure

템플릿은 두 레이아웃을 동시에 포함.

| Layout | Route Group | Domain Dir |
| --- | --- | --- |
| sidebar | `apps/app/src/app/(authenticated)/(sidebar)` | `apps/app/src/domains/sidebar` |
| standard | `apps/app/src/app/(authenticated)/(standard)` | `apps/app/src/domains/standard` |

`cleanLayout`은 선택하지 않은 레이아웃의 route group 및 domain 디렉토리 제거.
공유 컴포넌트는 `apps/app/src/components/`에 유지.

---

## Conventions

### Scaffold 단계 추가

1. `src/steps/`에 단일 책임 파일 추가
2. `src/scaffold.ts`에 import 및 실행 순서 추가
3. 단계 시작 시 `logger.step(...)` 출력
4. 관련 테스트와 README.md 흐름 설명 동기화

### Template Placeholder

`{{PROJECT_NAME}}`, `{{LOCAL_APP_PORT}}`, `{{LOCAL_WEB_PORT}}`, `{{LOCAL_API_PORT}}`, `{{LOCAL_POSTGRES_PORT}}` 플레이스홀더 사용.

프로젝트명 치환 대상은 `src/steps/substitute-project-name.ts`의 `TARGET_FILES`에 명시.
포트 치환은 `src/steps/assign-local-ports.ts`에서 관리.

### Template Gitignore

`template/` 내 `.gitignore`는 npm 배포 시 dotfile 제거 문제로 `gitignore` 파일명 사용.
`copy-template.ts`가 복사 후 `.gitignore`로 rename 처리.

### Frontend Components

`template/packages/ui/`의 shadcn 컴포넌트 우선 사용.
필요 컴포넌트가 없으면 shadcn CLI로 `template/packages/ui`에 추가.
