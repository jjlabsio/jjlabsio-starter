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
    constants.ts        # 상수 (레이아웃 타입, 템플릿 URL 등)
    layout-files.ts     # 레이아웃별 삭제 대상 파일 목록
  steps/                # scaffold 개별 단계 (각 파일이 단일 책임)
    clone.ts            # degit으로 템플릿 복제
    clean-layout.ts     # 미사용 레이아웃 파일 제거
    clean-auth-duplication.ts  # 레이아웃별 auth 코드 정리
    update-redirects.ts # 루트 리다이렉트 경로 업데이트
    update-package-names.ts   # package.json 이름 치환
    reset-serena-config.ts    # Serena project.yml 프로젝트명 갱신
    substitute-project-name.ts  # {{PROJECT_NAME}} 플레이스홀더 일괄 치환
    finalize.ts         # .git·tools/ 제거, .env 복사, pnpm install
  utils/
    fs.ts               # 파일시스템 유틸
    logger.ts           # 컬러 로그 출력
    validate.ts         # 프로젝트명 유효성 검사
```

---

## Conventions

### 새 scaffold 단계 추가

1. `src/steps/` 에 단일 책임 파일로 작성
2. `scaffold.ts`에 import 후 적절한 순서에 `await` 호출
3. 단계 시작 시 `logger.step(...)` 출력

### 템플릿 치환

`{{PROJECT_NAME}}` 플레이스홀더 사용. `substitute-project-name.ts`의 `TARGET_FILES` 배열에 대상 파일 추가.
