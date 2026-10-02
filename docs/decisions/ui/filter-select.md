# 공통 선택 패턴

- 상태: 적용
- 날짜: 2026-09-28

## 결정

- 선택 UX 소유권: `template/packages/ui/src/components/filter-select.tsx`.
- 단일·복수 선택: `FilterSelect`; 하위 목록: `FilterSelectList`; 분류 메뉴: `FilterMenu`.
- 외형 소유권: 기존 CSS 토큰과 `lib/menu-styles.ts`. 날짜·메뉴·폼 입력의 접근성 동작은 각 shadcn/Base UI 컴포넌트 유지.
- 기존 연결: Overview 소스·기간 하위 목록, Actions 상태·그룹·카테고리, Prompts 주제, Brands 브랜드, TanStack 열 필터.
- 검수 경로: `/filter-examples`. 사전 선택 상태와 독립적인 상호작용, 전체 예시 복원 제공. 생성 데이터는 페이지 메모리만 사용.

## 경계

- 필터 입력: 옵션·선택값·변경 함수. 조회·저장·URL 상태는 앱 책임.
- 전체 기본값: `defaultValue`; 기본 상태 판정은 순서가 아닌 집합 비교.
- 표현: `value`·`compact`·`chips`. 초기화 소유자는 영역당 하나.

## 검증

- 선택 상태·중복 추가·해제: `apps/app/src/domains/sidebar/lib/filter-select.test.ts`.
- 데스크톱 1440×900·모바일 390×844: 선택·검색·초기화·추가·날짜·하위 메뉴·폼 입력 검수.
- 실제 사용처: 테이블 서버 필터 결과, Overview URL 조건, Actions 상태, Prompts 주제·생성 폼, Brands 검색·선택·추가 연결 확인.
- 단일 선택 후 닫힘·복수 선택 후 유지·Esc 닫힘과 트리거 포커스 복원 확인.
- 앱 테스트 75개·UI/app 타입 검사·UI 및 변경 앱 파일 린트 통과.
- 최종 화면: `.local-preview/ui-audit/filter-select/verified-{desktop,mobile}.png`; 열린 메뉴: `selected-menu-{desktop,mobile}.png`.

## 기간 선택 역할 분리 (2026-09-29)

- 일반 조회: `DateRangePicker`. Overview·Prompts에서 사용, 비교 기준·`vs` 요약 제외.
- 비교 분석: `ComparisonDateRangePicker`. 조회 기간과 비교 기준 선택, 비교 상태·변경 함수 필수.
- 공통 구현: `components/date-range-picker.tsx`의 내부 `RangePicker`. 달력·프리셋·선택 동작·날짜 포맷 공유, 페이지별 재구현 금지.
- 책임 경계: 컴포넌트는 기간 선택·비교 구간 계산 담당. 실제 데이터 조회·분석은 앱 담당, 검수 예시는 메모리 상태만 변경.
- 검수 경로: `/filter-examples`의 두 패널. 각각 전체·프리셋·사용자 지정 기간 사전 제공, 전체 복원으로 양쪽 상태 초기화.
- 검증: 테스트 75개·UI/app 타입 검사·UI/변경 앱 파일 린트 통과. 데스크톱·모바일에서 프리셋·기간 선택·비교 기준·복원 확인, Overview URL 갱신·Prompts 결과 필터링 확인.
- 화면 기록: `.local-preview/ui-audit/filter-select/range-split/{plain,comparison}-{desktop,mobile}.png`.
