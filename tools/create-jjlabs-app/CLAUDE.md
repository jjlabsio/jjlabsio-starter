# CLAUDE.md

> **Claude 컨텍스트 윈도우 자동 로드 파일.**
> 내용 추가 시 토큰 효율 고려: 중복 제거, 간결한 표현, 불필요한 설명 지양. 문체는 명사형 종결 표현 사용.
> 사용법 및 scaffold 흐름: **README.md** 참조.

---

## Source Structure

```
src/
  index.ts              # CLI 진입점 (인수 파싱, prompts 호출)
  prompts.ts            # 대화형 입력 (프로젝트명, 레이아웃 선택)
  scaffold.ts           # 전체 scaffold 흐름 오케스트레이션
  config/
    constants.ts        # 경로 상수 (APP_DIR, DOMAINS_DIR, 레이아웃 그룹 등)
    layout-files.ts     # 레이아웃별 삭제 대상 디렉토리 반환 (getDirsToRemove)
  steps/
    copy-template.ts    # 내장 template/ 디렉토리를 프로젝트 경로로 복사
    clean-layout.ts     # 미사용 레이아웃 route group·domain 디렉토리 제거
    clean-auth-duplication.ts  # 선택 레이아웃 layout.tsx의 중복 auth guard 제거
    update-redirects.ts # standard 선택 시 루트·sign-in 리다이렉트 경로 /home으로 변경
    update-package-names.ts   # package.json 이름 치환 (root + apps/app)
    reset-serena-config.ts    # .serena/project.yml의 project_name 갱신
    substitute-project-name.ts  # {{PROJECT_NAME}} 플레이스홀더 일괄 치환
    finalize.ts         # .git 제거, .env 복사, pnpm install 실행
  utils/
    fs.ts               # fs-extra 래퍼 (removeDir, removeFile, readFile, writeFile)
    logger.ts           # 컬러 로그 출력
    validate.ts         # 프로젝트명 유효성 검사 및 디렉토리 충돌 확인
```

---

## Layout 구조

템플릿은 두 레이아웃을 동시에 포함:

| Layout | Route Group | Domain Dir |
| -------- | ----------------------------------------- | -------------------------- |
| sidebar | `apps/app/src/app/(authenticated)/(sidebar)` | `apps/app/src/domains/sidebar` |
| standard | `apps/app/src/app/(authenticated)/(standard)` | `apps/app/src/domains/standard` |

`cleanLayout`은 선택하지 않은 레이아웃의 **route group + domain 디렉토리** 두 곳을 제거.
공유 컴포넌트(`src/components/providers.tsx`, `theme-toggle.tsx`)는 항상 보존.

---

## Conventions

### 새 scaffold 단계 추가

1. `src/steps/`에 단일 책임 파일로 작성
2. `scaffold.ts`에 import 후 적절한 순서에 `await` 호출
3. 단계 시작 시 `logger.step(...)` 출력

### 템플릿 치환

`{{PROJECT_NAME}}` 플레이스홀더 사용. `substitute-project-name.ts`의 `TARGET_FILES` 배열에 대상 파일 추가.

### 템플릿 gitignore

`template/` 내 `.gitignore`는 npm 배포 시 dotfile 제거 문제로 `gitignore`(점 없이)로 저장.
`copy-template.ts`가 복사 후 `.gitignore`로 rename 처리.
