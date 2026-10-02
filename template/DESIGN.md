---
version: alpha
name: 공통 무채색 UI
description: 모든 앱이 공유하는 무채색 시각 디자인.
colors:
  background: "#fdfdfd"
  foreground: "#171717"
  card: "#fdfdfd"
  card-foreground: "#171717"
  popover: "#fdfdfd"
  popover-foreground: "#171717"
  primary: "#171717"
  primary-foreground: "#fdfdfd"
  secondary: "#17171708"
  secondary-foreground: "#171717"
  muted: "#17171708"
  muted-foreground: "#171717a3"
  subtle-foreground: "#17171766"
  warning: "#f59e0b"
  accent: "#1717170d"
  accent-foreground: "#171717"
  destructive: "#fb2c36"
  border: "#17171714"
  input: "#1717171a"
  ring: "#2b7fff"
  control-selected: "#2b7fff"
  control-selected-foreground: "#ffffff"
  positive: "#00a63e"
  progress: "#2b7fff"
  dark-background: "#171717"
  dark-foreground: "#fdfdfd"
  dark-card: "#171717"
  dark-card-foreground: "#fdfdfd"
  dark-popover: "#171717"
  dark-popover-foreground: "#fdfdfd"
  dark-primary: "#fdfdfd"
  dark-primary-foreground: "#171717"
  dark-secondary: "#fdfdfd0d"
  dark-secondary-foreground: "#fdfdfd"
  dark-muted: "#fdfdfd0d"
  dark-muted-foreground: "#fdfdfda3"
  dark-subtle-foreground: "#fdfdfd66"
  dark-warning: "#f59e0b"
  dark-accent: "#fdfdfd14"
  dark-accent-foreground: "#fdfdfd"
  dark-destructive: "#fb2c36"
  dark-border: "#fdfdfd1a"
  dark-input: "#fdfdfd1f"
  dark-ring: "#2b7fff"
  dark-control-selected: "#2b7fff"
  dark-control-selected-foreground: "#ffffff"
  dark-positive: "#00a63e"
  dark-progress: "#2b7fff"
  sidebar: "#f6f6f6"
  sidebar-muted-foreground: "#999999"
  dark-sidebar: "#101010"
  dark-sidebar-muted-foreground: "#929292"
typography:
  fontFamily: Pretendard
  scale:
    xs: { fontSize: 0.75rem, lineHeight: 1rem }
    sm: { fontSize: 0.875rem, lineHeight: 1.25rem }
    md: { fontSize: 1rem, lineHeight: 1.5rem }
    lg: { fontSize: 1.125rem, lineHeight: 1.5rem }
    xl: { fontSize: 1.25rem, lineHeight: 1.5rem }
    display: { fontSize: 3rem, lineHeight: 3.25rem }
  weight: { regular: 400, medium: 500, semibold: 600 }
  tracking: { normal: 0, heading: -0.015em, display: -0.025em }
  textStyle:
    caption: { scale: xs, weight: regular }
    label: { scale: xs, weight: medium }
    body: { scale: sm, weight: regular }
    body-medium: { scale: sm, weight: medium }
    body-strong: { scale: sm, weight: semibold }
    reading: { scale: md, weight: regular }
    title-sm: { scale: md, weight: semibold, tracking: heading }
    title-md: { scale: lg, weight: semibold, tracking: heading }
    title-lg: { scale: xl, weight: semibold, tracking: heading }
    display: { scale: display, weight: semibold, tracking: display }
  numeric: tabular-nums
rounded:
  base: 0.625rem
omitted:
  - section: component-source
    reason: 컴포넌트 변형의 구현은 packages/ui 소스에서 정의.
---

# 디자인 시스템

## Overview

- shadcn Base Nova 프리셋(`bY9A`)을 기반으로 모든 앱에 같은 테마를 적용한다.
- 라이트 모드를 기본값으로 사용한다.
- 제품 셸은 절제된 사이드바·간결한 헤더·데이터 중심 카드 배치를 사용한다.
- 구현된 테마 값은 `packages/ui/src/styles/globals.css`를 따른다.

## Colors

- 위 YAML 색상은 `packages/ui/src/styles/globals.css`의 라이트(`:root`)·다크(`.dark`) 의미 토큰과 일치시킨다.
- 라이트 모드는 밝은 표면과 어두운 글자·주요 동작을 사용하고, 다크 모드는 그 관계를 반전한다.
- 라이트 사이드바는 `#f6f6f6`, 다크 사이드바는 `#101010`을 사용한다. 카드·팝오버는 두 모드의 `card`·`popover` 토큰을 따른다.
- 보조 표면과 경계선에는 두 모드 모두 전경색의 낮은 불투명도를 사용한다.
- 주요 동작에 장식용 브랜드 색상을 도입하지 않는다.
- 파란색 `#2b7fff`는 포커스, 체크박스·라디오 선택, 진행률, 데이터 시각화에만 사용한다. 같은 색이어도 `ring`은 포커스, `control-selected`는 체크박스·라디오, `progress`는 진행률에 사용한다. 켜진 스위치는 `positive`를 사용한다.
- 증감의 긍정 상태는 `positive`, 부정 상태는 `destructive`, 중립 상태는 `muted-foreground`를 사용한다. 증감 기호만으로 긍정·부정을 판단하지 않는다. 차트의 데이터 구분 색과 의미를 섞지 않는다.
- 진행 중 상태에는 `warning`, 입력 레이블·장식용 연결 아이콘에는 `subtle-foreground`를 적용한다. 본문 설명에는 더 진한 `muted-foreground`를 유지한다.
- 메뉴·탭·달력의 활성 항목은 선택 컨트롤과 다르게 정보 구조에 따라 중립 표면 또는 `primary`를 사용한다.
- 차트·사이드바 토큰의 실제 값은 `packages/ui/src/styles/globals.css`를 따른다.

## Typography

- 위 YAML의 `scale`·`weight`·`tracking`은 기본 토큰, `textStyle`은 이를 조합한 텍스트 스타일 토큰이다. 구현값은 `packages/ui/src/styles/globals.css`의 `--text-ui-*`·`--font-weight-ui-*`·`--tracking-ui-*`와 일치시킨다.
- 컴포넌트와 화면에서는 `type-ui-{textStyle}` 클래스를 사용한다. 이 클래스는 위 텍스트 스타일 토큰을 적용하며, 글자색용 `text-*` 클래스와 병합할 때 토큰이 제거되지 않는다.
- 하나의 요소에 같은 상태의 텍스트 스타일 토큰을 중복 적용하지 않음. 공통 Button은 `@repo/ui/lib/utils`의 병합 규칙으로 마지막 텍스트 스타일만 유지하며 글자색·반응형 상태는 보존.
- 텍스트 스타일은 컴포넌트 이름이 아닌 정보 위계로 선택한다. 동일한 역할은 앱·웹·어드민에서 같은 토큰을 사용한다. Pretendard를 모든 토큰의 공통 글꼴로 사용한다.

| 텍스트 스타일 토큰 | 사용하는 정보                             | 컴포넌트에서의 대표 사용처                                             |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| `caption`          | 부가 정보·입력 도움말·시각·개수·열 분류   | 보조 메타정보, 폼 도움말, 사이드바 그룹명, 표 헤더                     |
| `label`            | 조밀한 화면에서 분류를 표시하는 작은 글자 | 배지, 작은 버튼                                                        |
| `body`             | 일반 데이터·설명·입력값                   | 본문, 표의 일반 데이터·행 보조 내용, 입력값, 보조색 폼 레이블, 선형 탭 |
| `body-medium`      | 읽기 우선순위가 높은 일반 크기 정보       | 메뉴 항목, 행 주정보, 버튼·필터·기본 탭                                |
| `body-strong`      | 작은 영역의 제목                          | 패널 제목, 목록 그룹 제목                                              |
| `reading`          | 일반 굵기로 한 단계 크게 읽는 내용        | 긴 문서, 설정 카드 제목, 작업 요약 띠의 값                             |
| `title-sm`         | 한 단계 큰 영역 제목                      | 섹션 제목, 일반 대화상자 제목                                          |
| `title-md`         | 대표 지표                                 | 대시보드의 큰 지표 값                                                  |
| `title-lg`         | 화면의 주제·집중 상태의 제목              | 본문 페이지 제목, 상세 패널 제목, 중요한 빈 상태                       |
| `display`          | 화면에서 유일한 큰 메시지                 | 온보딩·샘플 결과의 중심 문구; 데이터 화면에는 사용하지 않음            |

- 숫자를 열로 정렬하거나 값이 바뀔 때 폭을 고정해야 하는 경우에만 `numeric` 토큰(`tabular-nums`)을 적용한다. KPI 값·증감률과 크게 보여주는 가격에는 적용하지 않는다. 별도 `metric` 글꼴 크기 토큰을 만들지 않는다. 독립 KPI 카드의 레이블은 `caption`+`muted-foreground`, 값은 `title-md`, 증감은 `label`+`positive`로 조합한다.
- 전경·보조·오류·비활성 색은 타이포그래피가 아닌 의미 색상 토큰으로 적용한다. 같은 `body`라도 설명이면 `muted-foreground`, 일반 내용이면 `foreground`를 사용한다.
- 독립 목적 화면의 본문 페이지 제목은 `title-lg`, 바로 아래 설명은 `body`+`muted-foreground` 사용. 일반 앱 페이지는 중복 페이지 제목 없이 콘텐츠로 시작. 섹션 제목은 `title-sm`, 데이터 패널 제목은 `body-strong`, 설정 카드 제목은 `reading` 적용.
- 기존 `CardTitle`·`Button`·`Badge`·`Input` 등은 사용처가 텍스트 토큰을 직접 고르지 않도록 공통 컴포넌트에서 적용한다. 화면의 독립 텍스트에만 의미 클래스 사용을 허용한다.
- 시각적 크기와 HTML 제목 수준은 별도로 결정한다. 제목 계층을 건너뛰지 않고, 상단 경로명과 본문 제목을 중복된 최상위 제목으로 취급하지 않는다.
- 캡처에서 정확한 CSS 수치는 확인할 수 없다. 위 값은 관찰한 상대 위계에 맞춘 공통 구현값이며, 동일 뷰포트 비교로 조정한다.

## Layout

- 기본 간격에는 Tailwind 4px 척도를 사용한다. 제품 셸에는 240px 사이드바·48px 상단 바를 적용한다.

### 페이지 배치 토큰

| 토큰                       | 값   | 적용 대상                                |
| -------------------------- | ---- | ---------------------------------------- |
| `layout-page-padding`      | 24px | 일반 페이지의 본문 상하 여백             |
| `layout-dashboard-padding` | 32px | 대시보드의 본문 상하 여백                |
| `layout-settings-padding`  | 8px  | 카드형 설정의 본문 상하 여백             |
| `layout-section-gap`       | 24px | 일반 페이지·섹션형 설정의 독립 섹션 간격 |
| `layout-region-gap`        | 48px | 대시보드의 요약 영역과 분석 영역 간격    |
| `layout-panel-gap`         | 16px | 같은 영역의 패널 간격·2열 패널 사이 간격 |
| `layout-settings-gap`      | 12px | 카드형 설정의 동급 카드 간격             |

- 구현값은 `packages/ui/src/styles/globals.css`의 `--layout-*`와 일치시킨다.

| 페이지 유형 | `PageContainer spacing` | 배치 구조                                              | 현재 사용 화면                    |
| ----------- | ----------------------- | ------------------------------------------------------ | --------------------------------- |
| 일반 페이지 | `default`               | 본문 여백 + 독립 섹션의 세로 스택                      | My website                        |
| 대시보드    | `dashboard`             | 요약 영역 + 분석 영역, 분석 안에는 패널 스택           | Overview                          |
| 카드형 설정 | `settings`              | 좁은 상단 여백 + 동급 카드 스택                        | Company                           |
| 섹션형 설정 | `settings-sections`     | 설정 여백 + 제목을 가진 독립 섹션, 섹션 안의 패널 스택 | Billing                           |
| 독립 프레임 | `canvas`                | 외곽 여백·간격 없이 해당 프레임의 배치 규칙 적용       | Requests·Actions·Profile·Projects |

- 새 페이지를 만들 때 같은 정보 구조의 기존 페이지 유형을 선택한다. 다른 구조의 화면에 대시보드 간격을 강제하지 않는다.
- 본문 외곽 여백과 독립 영역 간격은 `PageContainer`의 `.ui-page-layout[data-layout]`에서 적용한다. 자식의 `mt-*`·`pt-*`로 페이지 간격을 더하지 않는다.
- 일반 앱 페이지는 상단바·브레드크럼에서 페이지명 표시, 본문은 바로 콘텐츠로 시작. 본문 상단에 페이지명을 반복하는 제목·일반적인 소개 문구 추가 금지. 제목·설명은 실제 섹션·카드·폼의 내용 구분이나 입력 안내에 필요한 경우만 사용. 독립 Pricing 등 별도 목적 화면은 예외.
- 대시보드에는 요약과 분석을 각각 직접 자식 영역으로 배치한다. 분석 영역의 세로 패널은 `.ui-section-stack`, 나란한 패널은 `.ui-panel-pair`로 구성한다.
- 독립된 제목과 내용을 가진 설정 영역은 `settings-sections`로 구성한다. 제목·설명과 해당 카드는 하나의 `.ui-section-stack`으로 묶고, 섹션 사이에 카드형 설정의 12px 간격을 적용하지 않는다.
- 같은 영역의 제목·설명은 `.ui-section-heading`의 4px 간격을 사용한다. 카드 내부 여백은 카드 변형의 규칙을 유지한다.
- 일반·대시보드 본문의 좌우 여백은 모바일 16px, 데스크톱 왼쪽 12px·오른쪽 24px로 적용한다. 카드형 설정은 양쪽 12px로 적용한다.

### 셸·스크롤

- 요금제 비교 카드는 `Card variant="pricing"` 사용. 중립색 요금제명·가격 → 동일 순서의 제공량(항목명 왼쪽·값 오른쪽) → 전체 너비 CTA → 동일 순서의 기능 지원 목록 구성. 지원은 체크, 미지원은 대시와 약한 텍스트로 표시하며 접근 가능한 지원 여부 문구 제공. 서비스 특화 모델 목록은 기본 비교 카드에서 제외.
- Billing·Pricing은 앱 공통 `PlanComparisonCard`와 `BillingPeriodToggle` 재사용. 가격·청구 단위·할인·결제 상품은 동일한 선택 주기 기준 적용. 연간 가격은 월 환산액이 아닌 연간 청구 총액 표시.
- 접근 권한 기준: ACTIVE 또는 만료 전 TRIALING. 권한이 있으면 상단바에서 `/settings/billing` 이동, Billing 카드에서 선택 요금제·주기의 Polar checkout 직접 실행. `/pricing` 직접 접근도 Billing으로 이동.
- 권한이 없으면 앱 접근 시 `/pricing` 이동. Pricing에 접근 불가 사유와 요금제 결제 CTA 표시. Billing·Pricing의 checkout은 공통 `BillingAction` 사용, 상품 미설정 시 CTA 비활성 더미 상태 유지. checkout 성공 후 구독 상태 재확인으로 앱 접근 복구.
- 가격 카드 내부 간격: 요금제명과 가격 4px, 주요 블록 12px, 제공량 행 32px, 기능 행 28px. 할인은 가격과 같은 줄 오른쪽 배치하여 주기 변경 시 높이 유지. 독립 Pricing 화면은 상단 Back → 중앙 주기 선택 → 비교 카드 구성, 카드 간격 16px.
- Billing·Pricing 기본 선택은 Yearly. 명시적인 Monthly 선택은 유지. 연간 할인은 월간 가격 × 12 − 연간 가격의 차액을 `Save $금액`으로 표시.
- 셸 하단 높이는 `--shell-footer-height`(48px) 공유. 페이지 저장·액션·목록 하단 바와 사이드바 사용자 영역의 상단 경계 정렬. 페이지 하단 바는 `ui-form-save`·`ui-page-footer` 또는 `ui-master-list`의 페이지네이션 사용. 카드 내부 페이지네이션은 적용 대상 제외. 모바일은 줄바꿈에 따라 높이 확장 허용.
- 입력 기본 패턴: 전체 폼 아래에 Save/Create 등 완료 버튼 하나 배치. 페이지·다이얼로그·드로어 모두 동일한 원칙 적용, 내용이 길어 완료 버튼이 화면 밖으로 밀리는 경우 하단 고정. 기본 폼을 여러 저장 카드로 분할하지 않음.
- 제목 위치는 페이지 종류가 아닌 구성 단위 기준. 단일 카드는 내부 헤더에 제목 표시, 여러 콘텐츠를 의미 있게 묶는 영역은 외부 섹션 제목 → 필요한 경우 보조 설명 → 콘텐츠 순서. 같은 영역의 제목 중복 금지. `ui-section-heading`·`ui-section-title`·`ui-section-description` 또는 동일 토큰을 사용하는 폼 제목 재사용.
- 전체 폼의 기본 상단 여백은 섹션형 설정과 같은 `layout-settings-padding` 사용. Profile의 독립 폼은 예외적으로 32px 적용, 다른 폼에 자동 확대 적용 금지.
- 카드별 저장은 Company처럼 독립적인 설정을 함께 보여주는 예외 화면에만 사용. 여러 편집 카드의 Save 버튼을 나열하는 패턴은 기본적으로 지양, 구분이 모호하면 전체 폼 사용. 독립 스위치는 즉시 저장하며 진행·실패 표시 및 실패 시 원복 처리.

- 사이드바 카테고리(Home·Resources·Work·Workflow 등)는 breadcrumb에서 제외. 실제 진입 메뉴부터 시작하며 메뉴 루트는 제목만, 상세는 메뉴·상위 데이터·현재 위치 표시.

- 상단 제목·breadcrumb는 `PageContainer`·`SiteHeader` 공통 계약 사용. 일반 화면은 제목만, 계층 화면은 명시한 경로 항목 표시. 현재 항목은 링크 없이 표시하고 상세에서도 소속 사이드바 메뉴 활성 유지. 적용 방법은 [탐색 규칙](docs/components/navigation.md) 참조.

- 사이드바 기본 메뉴 행은 28px 높이·6px 반경·행 사이 2px 간격. 메뉴명은 `body-medium`(14px·medium), 아이콘은 12px·`sidebar-muted-foreground`, 아이콘과 글자 간격은 6px 적용. 활성·호버 배경은 `sidebar-accent` 사용.
- 첫 탐색 그룹은 `Home` 아래 개요와 사이트처럼 자주 쓰는 화면을 둔다. 이후 항목은 기능별 그룹으로 나누고, 없는 기능의 링크는 만들지 않는다.
- 사이드바 그룹명에 `SidebarGroupLabel`의 `caption`(12px·regular)+`sidebar-muted-foreground` 적용. 제목은 28px 높이, 그룹 패딩은 8px, 그룹 사이는 8px 유지. 탐색 영역의 상단 여백은 4px·하단은 8px 적용.
- 카테고리는 클릭·포커스·접기 아이콘 없는 고정 제목으로 표시하고 하위 메뉴는 항상 노출. `SidebarGroup`·`SidebarGroupLabel`·`SidebarGroupContent`·`SidebarMenu` 조합 사용. 사이드바 전체의 아이콘 축소 상태에서는 그룹명만 숨기고 메뉴 아이콘 유지.
- 일반 탐색의 Settings 진입점은 Preferences 카테고리에 배치한다. 설정 경로에서만 Project settings·Company 그룹을 표시한다. 모바일 경로 이동 후 사이드바를 닫는다.
- 하단 시작 카드는 기존 `Card`로 구성한다. 진행률을 표시한다면 실제 완료 상태와 연결하고, 단계는 이동 가능한 화면에만 연결한다.
- 상단 워크스페이스는 아바타·이름을 한 줄로 표시하고 전환 메뉴를 제공하지 않는다.
- 공통 상단바에 구독 상태·Help를 배치하고 테마 선택은 하단 계정 메뉴에서만 제공한다.
- 체험 남은 일수는 인증된 사용자의 구독 종료일로 계산한다. 체험 중에만 `Trial ends in`·일수 배지를 표시하고 요금제 화면에 연결한다.
- 유료 이용 상태에는 `Plan`·현재 요금제 이름 배지를 표시하고 구독 관리 화면에 연결한다.
- 상단과 Billing의 요금제 이름은 구독 `polarProductId`를 공통 요금제 설정에 매핑해 표시한다. 매핑되지 않은 상품은 `Unknown`으로 표시하고 요금제 이름을 추정하지 않는다.
- 하단 계정에는 `SidebarMenuButton variant="account" size="account"`를 적용해 전체 행을 클릭·호버 영역으로 사용한다. 16px 아바타·`body` 글자·행 끝 드롭다운 꺾쇠를 유지하고 상세 정보는 펼친 메뉴에 표시한다.
- 본문 스크롤 중 상단 바와 전역 필터 바는 고정한다. 사이드바는 별도로 고정·스크롤한다.
- 카드 없는 긴 편집 폼에는 아래 집중형 폼 규칙을 적용한다. 카드형 설정과 혼용하지 않는다.
- 탭·검색·하단 상태가 있는 목록은 `.ui-tab-toolbar`·`.ui-list-toolbar`·`.ui-page-footer`로 구성한다. 데스크톱에서는 목록만 스크롤하고 세 영역은 유지한다.
- 고정 목록의 높이는 `PageContainer`가 실제 필터 높이로 계산한 `--page-content-height`를 사용한다. 필터 줄바꿈을 고정 픽셀 높이로 가정하지 않는다.
- 대시보드에서 지표 띠가 상단 필터 위로 지나가면 선택 대상과 핵심 지표를 한 줄 요약으로 필터 아래에 고정한다. 요약 행은 본문을 밀지 않고 덮으며, 원래 지표 띠가 보일 때는 숨긴다.
- 페이지 제목·설명은 카드 밖. 섹션 제목·설명도 해당 카드 묶음 밖. 카드 제목·조작 요소는 카드 안의 상단 헤더에 배치.
- 화면 전체에 적용되는 필터는 상단 바 바로 아래의 `.ui-filter-bar`에 모음. 데이터 영역에만 적용되는 필터는 해당 카드 헤더에 배치. 좁은 화면에서는 줄바꿈을 허용.
- 데이터 조작은 카드 헤더의 `CardAction`에, 테이블 검색은 해당 카드 안에 배치. 필터 결과와 선택 상태를 버튼에 표시.
- 동등한 두 패널은 `.ui-panel-pair`로 넓은 화면 1:1·좁은 화면 1열 배치한다. 기능상 주·보조 관계가 명확할 때만 다른 비율을 사용한다.

## Elevation & Depth

- 본문은 거의 흰색, 사이드바는 한 단계 어두운 회색으로 분리. 장식용 그라디언트·질감 이미지는 기본 화면에 사용하지 않음.
- 카드의 경계는 1px 저대비 선으로 표현하고 기본 그림자는 사용하지 않음. 열려 있는 메뉴·팝오버에만 얕은 그림자 사용.
- 넓은 면의 배경색을 바꾸기보다 헤더 구분선·행 구분선·작은 상태 배지로 정보 계층을 표현.

## Shapes

- 공통 기본 모서리 반경은 `0.625rem`이다.
- `packages/ui/src/styles/globals.css`의 `rounded-*` 값은 기본 반경에서 파생한다.

## Components

- 동일한 목적의 조작에는 모든 앱에서 같은 `packages/ui` 컴포넌트·변형을 사용한다.
- shadcn 컴포넌트 추가 시 기존 `packages/ui` 파일은 덮어쓰지 않는다. 캡처 근거가 없는 컴포넌트는 기본 구조를 유지하고 공통 색상·타이포그래피·상태 토큰만 적용한다.
- 방향 아이콘은 역할별로 통일한다. 드롭다운·Select·날짜 선택·페이지 이동·표 정렬에는 `CaretIcon variant="chevron"`, 펼치는 계층 목록에는 기본 채운 삼각형을 사용한다. 고정 사이드바 카테고리에는 방향 아이콘을 표시하지 않는다. 방향은 `direction` 또는 공통 컴포넌트의 상태로 전환한다. 화면별 SVG·CSS 아이콘을 만들지 않는다.
- `Avatar size="xs"`의 문자 대체 표시는 한 글자만 사용한다. 두 글자 이니셜은 `size="sm"` 이상에서 표시한다.
- 독립 카드로 묶인 지표·차트·목록·테이블 패널은 `Card variant="panel"` 사용. 패널의 모서리 반경은 12px, 헤더 높이는 최소 48px, 내부 좌우 여백은 16px. 제목 한 줄과 여러 줄 모두 헤더 높이 안에서 수직 정렬한다. 차트 내용에는 패딩을 주고 목록·테이블 내용은 헤더 아래에 바로 배치.
- 요약 지표는 `CardContent padding="none"` 안에서 `.ui-metric-strip`·`.ui-metric-cell`·`.ui-metric-line`으로 한 띠 안에 균등 배치하고, 차트와 데이터 패널은 공통 카드 헤더·경계·정렬 규칙을 공유한다. 차트의 범주 색은 `chart-1`~`chart-5`를 순서대로 재사용하고, 상태 색·화면별 16진수 색을 데이터 구분용으로 사용하지 않는다.
- 지표·패널 제목의 설명에 `TooltipTrigger variant="info"` 적용. 공통 구현에서 16px 중앙 정렬 영역·14px 정보 아이콘·2 SVG 획·`subtle-foreground` 사용.
- 필드 도움말에는 기존 `FieldLabel help` 사용. 같은 도움말 영역을 공유하고 필드의 채운 정보 아이콘 유지.
- 사이드바 접기에 `SidebarTrigger` 사용. 열림·닫힘 모두 테두리형 16px `IconLayoutSidebar`·`subtle-foreground` 적용, 호버에는 공통 ghost 버튼 규칙 유지.
- 지표 변화는 `changeTone`으로 의미 색을 명시하고, 압축 요약에는 `SectionCards variant="summary"` 사용.
- 인라인 지표 요약은 `body` 레이블·`body-medium` 값·항목 사이 세로 구분선을 사용한다.
- 본문 폭을 채우는 작업 요약에는 `SectionCards variant="band"`와 `Card variant="flush"`를 적용한다. 모서리·좌우 테두리를 제거하고 레이블은 `body`, 값은 `reading`으로 표시한다. 독립 KPI 카드에는 기존 `strip` 변형을 유지한다.
- 차트 헤더에는 제목·설명 툴팁·실제로 동작하는 조작을 배치한다. 차트 하단 상태·보기 전환은 `.ui-chart-panel-footer`를 사용한다. 백분율 차트 툴팁은 숫자에 `%`를 붙이고, 실선·점선처럼 시리즈를 구분한 표시는 툴팁에도 유지한다.
- 데이터 차트 패널에 `CardContent padding="chart"`·`ChartContainer variant="panel"` 조합 적용. 본문 좌우·상단 16px·하단 8px, 차트 최소 높이는 `--chart-panel-min-height` 256px 사용. 나란한 패널이 늘어나면 차트가 남은 본문 높이를 채움. 고정 높이·비율로 푸터 위 빈 공간 생성 금지.
- 패널 차트의 축에 `caption`·`muted-foreground`, 추이 선에 `--chart-line-width` 1.5 적용. 실선·점선 구분과 데이터 색 유지. 토큰 구현값은 `globals.css`와 일치시킴.
- 막대 차트는 0 기준, 선 차트는 비교에 필요한 범위·동일 지표의 같은 축 사용. 여백을 줄이기 위한 데이터 왜곡·일부 선 잘림 금지. 빈 결과에도 같은 최소 높이 유지.
- 데이터가 있어야 실행할 수 있는 조작은 빈 결과에서 비활성화한다. 클릭 후 아무 일도 없는 활성 버튼을 남기지 않는다.
- 배타적 보기·기간 전환에는 `ButtonGroup variant="segmented"`와 `Button variant="segment"`를 사용한다. `aria-pressed`를 데이터 상태와 연결하고, 선택 항목에만 `background`·`foreground`·경계·얕은 그림자를 적용한다. 비선택 항목은 투명 배경·보조색을 사용한다.
- 범주형 막대 차트의 가로축은 범주를, 시간 변화 선 차트의 가로축은 날짜를 사용한다. 선 차트 전환 시 범주 순서를 선으로 잇지 않는다. 같은 소스는 차트와 인접 목록에서 동일한 아이콘·색을 사용한다.
- 카드 밖 섹션 설명과 카드 안 제목을 중복하지 않음. 패널 내용만 데이터 형식에 맞게 조합.
- 필터·값 선택에 `FilterSelect` 사용. 페이지에서는 옵션·값·변경 함수만 제공하고 트리거·검색·선택 표시·초기화·추가 행의 시각 구조 재작성 금지.
- 명령·페이지 이동·행 더보기에 `DropdownMenu` 사용. 폼 값 입력에 `Select`·검색 가능한 입력에 `Combobox`, 날짜 범위에 `DateRangePicker` 사용. 같은 외형을 위해 서로 다른 접근성·키보드 동작을 하나의 메뉴로 강제 통합하지 않음.
- 팝업 표면·행에 `lib/menu-styles.ts`의 공통 규칙 적용. 메뉴·Select·Combobox·Popover의 반경·경계·그림자·화면 경계 제한 공유. 달력·폼 입력·일반 명령의 폭과 내부 배치는 용도별 유지.
- 메뉴 치수는 `--menu-row-height` 32px·`--menu-radius` 12px·`--menu-filter-width` 218px 사용. 행은 `body`·좌우 8px·상하 6px, 그룹 제목은 `caption`·`subtle-foreground` 적용. 복수 선택은 공통 `DropdownMenuCheckboxItem`의 왼쪽 체크박스를 사용하며 선택 중 메뉴 유지.
- 검색·필터 하위 메뉴는 `DropdownMenuContent`·`DropdownMenuSubContent variant="filter"` 사용. 일반 메뉴는 내용과 트리거 중 넓은 쪽 기준. 모든 메뉴는 뷰포트 폭에서 32px를 뺀 범위 안에 표시하며 부모·하위 메뉴의 반경·그림자 동일 적용.
- 메뉴 검색은 `InputGroup variant="menu"`과 `InputGroupInput onClear` 사용. 32px 검색 행 아래 구분선 배치. 입력값이 있을 때만 지우기 버튼 표시, 지운 뒤 검색 입력으로 포커스 복귀. 화면에서 검색 영역의 높이·여백 재정의 금지.
- 조회 기간 선택에 `DateRangePicker` 사용. 프리셋·범위 캘린더·선택 기간 요약 제공, 비교 기준·`vs` 표시 제외.
- 기간 비교에 `ComparisonDateRangePicker` 사용. 비교 기준·프리셋·범위 캘린더·조회/비교 기간 요약 순서 유지. `comparison`·`onComparisonChange`로 비교 기준 연결, 실제 비교 데이터 조회는 앱 책임.
- 두 기간 선택기는 같은 달력·프리셋·표면 규칙 공유. 달력 선택일은 `primary`, 중간 날짜는 중립 표면 적용. 가용 데이터에 따라 날짜·프리셋 제한, 기간 변경을 실제 조회·차트·내보내기와 연결. 좁은 화면에서는 프리셋과 달력을 세로 배치.
- 기간 선택기의 날짜 값은 `formatDateRange`로 시작일·종료일 모두 `yyyy.MM.dd` 표시. 프리셋 이름·일수 레이블은 유지.
- 포인터로 메뉴를 열면 팝업에 포커스를 두고 검색창 자동 활성화를 막는다. 키보드로 열면 기본 키보드 탐색을 유지한다. 메뉴 검색의 중립 포커스 배경은 `InputGroup variant="menu"`에서 적용하고, 일반 입력의 파란 포커스 링과 구분한다.
- 메뉴 검색의 문자 입력만 메뉴 타입어헤드로 전파하지 않는다. Escape·Tab·상하 화살표는 통과시킨다. `DropdownMenuLabel`은 반드시 `DropdownMenuGroup` 안에 배치한다.
- 체크박스·라디오의 파란 배경과 흰 체크에 `control-selected`·`control-selected-foreground`를 적용한다. 일반·메뉴·그룹 체크박스는 `.ui-selection-box`의 16px 크기·5px 반경·미선택 배경을 공유한다. 일부 선택은 같은 파란 배경에 흰 대시를 표시한다. 아이콘 크기·획은 `.ui-control-check`에서 통일한다. 스위치의 켜짐 상태는 `positive`를 사용한다.
- 기본 `Switch`는 38×16px 트랙·14px 손잡이를 사용한다. 켜짐·꺼짐 모두 같은 트랙 크기를 유지한다.
- 선택 모드에 `FilterSelect mode="single"` 또는 `"multiple"` 적용. 단일 선택은 오른쪽 체크·선택 후 닫기, 복수 선택은 왼쪽 파란 체크박스·열림 유지. `options.value`에 고유한 비어 있지 않은 문자열 사용.
- 선택값 표현에 `summary` 적용. `value`는 1개 값·2개 이상 분류명과 개수, `compact`는 분류명과 개수, `chips`는 분류명·개수와 삭제 가능한 바깥 칩 사용. 적용 상태에 중립 표면 유지, 비활성 스타일 적용 금지.
- 기본 선택값에 `defaultValue` 적용. 전체가 기본인 Overview와 빈 배열이 기본인 테이블 구분. `allLabel` 항목과 초기화는 같은 기본값 복원. 검색은 옵션 목록에만 적용하고 선택값을 삭제하지 않음.
- 필터 분류에 `FilterMenu`, 하위 선택 목록에 `FilterSelectList` 사용. 필터 허브의 개수는 적용된 분류 수, 개별 선택의 개수는 선택된 값 수 표시. 업무 데이터 검색은 옵션 검색과 구분.
- 초기화 소유자를 하나로 지정. 기본은 메뉴 하단, `chips`는 바깥 칩 뒤, 테이블·필터 허브의 외부 초기화가 있으면 `FilterSelect reset={false}` 적용. 기본 상태의 초기화 비활성화, 메뉴와 바깥 버튼 중복 배치 금지.
- 필터 메뉴 검색 결과가 비면 빈 결과 메시지를 표시한다. 데모 대시보드의 기간·소스 선택은 URL 쿼리에 남겨 새로고침·공유 후에도 유지한다.
- `/filter-examples`에서 기본·1개·복수 선택·비활성·검색·빈 결과·추가·초기화·일반 기간·기간 비교·하위 메뉴·명령·폼 선택 검수. 예시 기본값 사전 제공, `예시 상태 복원`으로 초기 상태 복귀.

### 항목 추가 흐름

- 선택 메뉴에서 생성 기능을 제공하면 구분선 아래 `DropdownMenuItem variant="create"`를 배치한다. 공통 Plus 아이콘·`body`·`muted-foreground`·32px 행을 사용한다.
- 이름 등 짧은 입력에는 `DialogContent`·`DialogFooter variant="form"`과 `Field density="compact"`를 조합한다. 최대 폭 580px·패딩 24px·표면과 이어진 푸터를 사용한다.
- 반복 입력·설명이 많은 폼에는 `SheetContent variant="form"`과 `Field density="comfortable"`를 조합한다. 본문만 스크롤하고 저장 영역은 하단에 유지한다.
- 생성 성공 시 목록에 새 항목을 반영하고 해당 항목을 선택한다. 새 항목을 가리는 검색은 초기화한다.
- 검증·저장 실패 시 입력값과 폼을 유지하고 `FieldError`로 원인을 표시한다. 실제 저장 전에 성공 상태를 표시하지 않는다.
- 취소 시 목록·선택값을 변경하지 않는다. 반복 입력 폼에 미저장 변경이 있으면 기존 폐기 확인을 사용한다.
- 폼을 열면 첫 입력에 포커스를 두고 닫으면 진입 버튼에 복귀한다. 메뉴에서 열었으면 제거되는 메뉴 항목 대신 메뉴 트리거로 복귀한다.

### 목록·설정 구성

- 동일한 정보 유형에는 기존 화면 구성 패턴을 재사용한다.
- 목록 행에 제목·설명과 상태·시각 메타정보가 함께 있으면 `.ui-list-row[data-layout="details"]`를 사용한다. 좁은 화면에서는 메타정보를 본문 아래로 내려 읽기 폭을 확보한다.
- 부모·자식 관계가 있는 목록에는 `Accordion variant="tree"`·`.ui-tree-list`·`.ui-tree-row`를 적용한다. 열린 그룹은 36px, 접힌 그룹은 44px, 자식 행은 최소 45px 높이를 사용한다. 왼쪽 8px `CaretIcon`·열린 그룹의 중립 배경·자식 연결선으로 계층을 표시하고 자식 행 구분선을 제거한다.
- 그룹 선택은 `AccordionTrigger selection` 슬롯에 배치해 펼침 버튼과 체크박스를 분리한다. 행 선택 체크박스는 호버·키보드 포커스·선택 상태에서 표시한다. 호버가 없는 터치 환경에서는 항상 표시한다.
- 목록의 분류는 `Badge variant="metadata"`, 그룹 개수는 `count`, 설정의 주기·상태는 `status`로 표시한다. 작은 둥근 직사각형을 사용하고 기본 알약 배지와 구분한다.
- 목록 탐색에 `TabsList variant="line"` 적용. 가로 탭 행 44px(하단 경계 포함)·탭 간격 4px·좌우 여백 8px·`body` 사용. 활성 여부에 따른 글자 크기·굵기 변경 금지.
- 선형 탭의 활성·호버 배경에 높이 28px·`muted`·공통 둥근 모서리 적용. 클릭 영역은 탭 행 전체 높이 유지.
- 선형 활성 탭에 `foreground`·1px 하단 선 적용. 선은 탭 너비 전체에 표시하고 행의 하단 경계에 정렬. 비활성은 `muted-foreground`, 호버는 전경색 강조·활성 선 위치 유지.
- 탭 도구막대에 `.ui-tab-toolbar` 적용. 탭 행 바깥 세로 패딩 추가 금지. 선택·방향키 탐색·포커스는 공통 `Tabs` 동작 유지.
- 요금제처럼 카드 자체가 한 항목인 경우 기본 `Card`를 사용하고, `Card variant="panel"`의 분리된 헤더는 차트·데이터 패널에만 사용한다.
- 카드의 주요 동작에는 `Button` 기본 크기(32px)를 사용한다. 조밀한 도구·보조 조작에만 `sm`(28px)을 사용하고 화면별 높이를 덮어쓰지 않는다.
- 인라인 상태 이동에는 `Button variant="status" size="sm"`·`Badge variant="status" size="sm"`을 조합한다. 체험 종료까지 2일 이하이면 배지에 `tone="destructive"`를 적용한다.
- 설정 입력 폼에는 `Card variant="form"`·`Field density="compact"`를 적용한다. 제목은 `reading`, 레이블은 `caption`+`subtle-foreground`, 입력 높이는 36px, 필드 사이 간격은 16px로 구성한다.
- 스위치·설명으로 구성한 설정에는 `Card variant="settings"`를 적용한다. 설정 설명 목록에는 `.ui-settings-details`의 12px 간격을 사용한다.

### 집중형 편집 폼·관리 목록

| 상황                  | 적용 규칙                                                                         | 공통 구현                                                           |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 카드 없는 편집 폼     | 외곽 폭 672px·필드 폭 624px, 필드 간격 32px                                       | `.ui-form-column`·`.ui-form-fields`                                 |
| 폼 제목·설명          | 제목 `title-sm`, 설명 `body`+`muted-foreground`, 다음 영역까지 48px               | `.ui-form-intro`                                                    |
| 설명이 붙는 필드      | 레이블 `body-medium`+`foreground`, 설명 `body`+`muted-foreground`, 입력 높이 36px | `Field density="comfortable"`                                       |
| 필드 도움말           | 같은 정보 아이콘·키보드 포커스·툴팁                                               | `FieldLabel help`                                                   |
| 목록형 입력값         | 28px 중립 태그·구분된 삭제 버튼, 점선 추가 버튼                                   | `Badge variant="tag" onRemove`·`Button variant="dashed"`            |
| 커버·프로필 표시      | 커버 144px, 64px 아바타를 32px 겹침                                               | `.ui-identity-cover`·`.ui-identity-summary`·`Avatar size="profile"` |
| 폼 스크롤·저장        | 본문만 스크롤, 저장 영역은 프레임 하단 유지                                       | `.ui-form-frame`·`.ui-form-scroll`·`.ui-form-save`                  |
| 목록·보조 영역        | 데스크톱 보조 폭 308px·독립 스크롤, 모바일 세로 배치                              | `.ui-master-detail`·`.ui-master-list`·`.ui-support-rail`            |
| 작은 보조 카드        | 12px 패딩·메타/이름/도메인·오른쪽 조작                                            | `Card size="sm"`·`.ui-compact-record`·`Badge size="sm"`             |
| 데이터 범주 색상 견본 | 12px 정사각형·기본 반경의 0.3배, `chart-*` 색상                                   | `.ui-color-swatch`                                                  |
| 우측 편집 패널        | 최대 680px·모바일 전체 폭, 본문 스크롤·하단 동작 고정                             | `SheetContent variant="form"`                                       |

- 설정 경로의 사이드바에서 `Project settings`와 `Company`를 구분한다. 상단 Overview 링크로 일반 탐색에 복귀한다.
- 저장 전후 상태를 구분한다. 저장 실패 시 입력을 보존하고, 로컬 예시는 서버에 저장된 것처럼 안내하지 않는다.
- 브라우저 저장값을 복원하는 설정은 복원 전 `Skeleton`을 표시한다. 예시 기본값을 저장된 상태처럼 먼저 표시하지 않는다.
- 데이터 목록은 아래 공통 테이블 규칙을 적용한다. 막대 목록·계층 목록·매트릭스는 일반 표로 강제 변환하지 않는다.

### 데이터 테이블

- 구현 절차·서버 조회 계약·상태 변경·회귀 검증은 [데이터 테이블 사용 컨벤션](docs/components/data-table.md)을 따른다.

| 구성      | 공통 구현·규칙                                                           | 화면에서 제공하는 항목                            |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| 기능 엔진 | `useDataTable`·TanStack Table, 서버 검색·필터·단일 열 정렬·페이지·선택   | 조회 함수·전체 결과 수·안정된 행 ID·열 정의       |
| 표 본체   | `DataTable`·shadcn `Table`, 40px 헤더·최소 44px 행·12px 셀 좌우 여백     | 레이블·최소 폭·빈 결과 문구·선택 허용 여부        |
| 셀        | 헤더 `caption`+보조색, 주정보 `body-medium`, 부가정보 `caption`+보조색   | 열 `meta`의 정렬·폭·주/보조 역할·줄바꿈·숫자 여부 |
| 도구막대  | `DataTableToolbar`·`DataTableFilter`, 기존 검색·Checkbox 메뉴·Reset 변형 | 검색 대상·필터 옵션·추가/업무 액션                |
| 하단      | `DataTablePagination`, 결과 개수·조건부 페이지 이동·선택 개수            | 항목 이름·업무 액션                               |
| 바깥 구성 | 기존 카드·페이지·목록 프레임                                             | 카드 제목·탭·전역 필터·요약·업무 로직             |

- 카드 안과 전체 목록에서 같은 `DataTable` 본체를 사용한다. 카드용·페이지용 헤더/행 스타일을 별도로 작성하지 않는다.
- 표의 색상·텍스트·행 여백을 화면별 `className`으로 덮어쓰지 않는다. 정렬·폭·줄바꿈 등 열별 표현은 `meta`로 지정한다. 두 줄 셀은 `DataTableText`로 구성한다.
- 열 이름에는 `caption`·`muted-foreground`를 적용한다. 정렬 가능 여부와 관계없이 같은 글자 크기·굵기를 유지한다.
- 편집 가능한 이름 셀은 `DataTableText onClick`·`icon`·`trailing`을 조합한다. 이름 버튼을 셀 폭 안에서 말줄임하고 전체 이름을 접근성 이름·`title`에 유지한다. 화면별 flex 버튼으로 인접 열을 침범하지 않는다.
- 열의 너비 유형은 `meta.layout`으로 지정한다. 미지정 숫자는 `numeric`, 나머지는 `content`로 처리한다. 구현값은 `globals.css`의 `--table-column-*`를 따른다.

| 너비 유형 | 기본/최소 폭 | 배분 방식                                                                  |
| --------- | ------------ | -------------------------------------------------------------------------- |
| `content` | 320px        | 이름·설명, 남는 폭 배분; 복수 열이면 가장 큰 최소 폭을 확보한 뒤 균등 배분 |
| `compact` | 144px        | 상태·분류, 고정 폭                                                         |
| `numeric` | 112px        | 수치, 고정 폭                                                              |
| `date`    | 128px        | 날짜·시각, 고정 폭                                                         |
| `actions` | 48px         | 행 액션, 고정 폭                                                           |

- 선택 열은 40px로 유지한다. 헤더·아이콘·대표 값이 기본 폭에 들어가지 않으면 `meta.width`로 조정한다. `content`의 `width`는 최소 폭, 나머지는 고정 폭으로 사용한다. 최소 폭의 합보다 좁은 컨테이너에서는 표 내부를 가로 스크롤한다.
- 헤더와 데이터에 같은 열 정렬을 적용한다. 텍스트·상태는 왼쪽, 수치는 오른쪽을 기본값으로 사용한다. 날짜·특수 셀의 정렬은 `meta.align`으로 지정한다.
- 오른쪽 정렬 가능 열에는 헤더·데이터 모두 `--table-sort-slot` 16px를 기본 여백에 추가한다. 헤더 제목과 값의 오른쪽 끝을 맞추고 정렬 아이콘은 이 슬롯에 고정한다. 왼쪽 헤더의 아이콘은 제목 뒤에 배치한다.
- 정렬 버튼은 헤더 셀의 전체 너비·높이를 클릭·호버 영역으로 사용한다. 좌우 여백은 버튼 안에서 12px 유지하고 열 `meta`의 정렬 방향을 따른다. 헤더 행 전체 호버·글자 주변의 작은 둥근 버튼 금지. 키보드 포커스 링은 셀 안쪽에 표시한다.
- 정렬 아이콘은 12×12px 영역에 위·아래 선형 꺾쇠를 배치한다. 각 꺾쇠는 12×6px·1.5 SVG 획·`subtle-foreground`, 활성 방향은 `foreground`를 사용한다. 채운 삼각형을 정렬 아이콘에 사용하지 않는다.
- 정렬이 해제된 열에서만 호버·키보드 포커스 시 두 꺾쇠를 `foreground`로 강조한다. 정렬된 열에서는 호버·포커스 여부와 관계없이 활성 방향만 `foreground`, 반대 방향은 `subtle-foreground`로 유지한다.
- 정렬 기능은 기본으로 끈다. 참조 캡처에 정렬 표시가 있는 대응 열 또는 정렬 확인용 예시에만 `enableSorting: true`·`sortFn`을 함께 지정한다. 참조에 표시가 없는 열에는 버튼·아이콘·`aria-sort`를 추가하지 않는다.
- 정렬은 오름차순 → 내림차순 → 해제 순서로 전환하고 `aria-sort`·공통 꺾쇠 표시를 상태에 연결한다.
- 테이블 필터 버튼은 분류명을 유지하고, 1개 이상 선택하면 이름 옆에 개수 배지를 표시한다. 미선택 기본명은 `label`, 별도 전체 항목 문구가 필요하면 `allLabel` 사용. 선택값은 메뉴 체크 상태와 접근성 이름으로 제공한다. 별도 칩 행·삭제 버튼을 추가하지 않는다.
- `DataTableFilter`는 TanStack 상태를 `FilterSelect mode="multiple" summary="compact" reset={false}`에 연결. 트리거·개수 배지·선택 목록을 테이블에서 별도 구현하지 않음. 중립 적용 표면·파란 체크박스·키보드 링은 공통 선택 규칙 유지.
- 선택 열은 필요한 목록에만 표시한다. 일부 선택은 공통 체크박스의 중간 상태로 표시하고 일괄 작업 버튼에 선택 개수를 표시한다.
- 빈 결과·로딩·오류는 본문 안에 표시하고 하단에도 조회 상태를 반영한다. 모바일에서도 같은 표를 내부 가로 스크롤로 탐색하며 페이지 전체 가로 넘침을 만들지 않는다.
- 열 드래그·크기 조절·고정·열 설정·그룹/매트릭스는 초기 공통 기능에 포함하지 않는다.

### 구현 기준

- 화면별 데이터·배치·조합은 각 앱에서 정의한다.
- 공통 컴포넌트·변형의 실제 정의는 `packages/ui/src/components/`를 따른다.
- shadcn 프리셋 설정은 `packages/ui/components.json`을 따른다.

## 검증 기준

- 다른 뷰포트의 캡처는 픽셀 좌표를 직접 비교하지 않는다. 같은 뷰포트로 다시 캡처해 구성 순서·상대 비율·계층을 확인한다.
- 스크롤 고정·호버·메뉴 동작은 정지 이미지가 아닌 실제 브라우저로 검증한다.
- 메뉴 열림·Escape·Enter·Space, 선택/부분 선택, 초기화, 실제 차트 전환, 저장 실패를 검증한다. 성공 메시지는 실제 저장값과 일치할 때만 표시한다.
- 1440×900·390×844에서 기존 모든 경로와 사이드바 확장·축소 상태를 검증한다. 모바일 표의 내부 가로 스크롤과 페이지 전체 가로 넘침을 구분한다.
- 같은 페이지 유형의 본문 여백·영역 간격과 패널 간격을 실제 DOM 경계로 측정해 위 배치 토큰과 비교한다. 카드 내부 패딩을 섹션 간격에 포함하지 않는다.
- 화면 비교에서 필터·탭·펼침 상태를 맞춘다. 색상뿐 아니라 제목 위계·컨테이너 형태·행 밀도·펼침 방향·스크롤 경계를 검수한다.

## 예외와 금지

- 랜딩 페이지 전용 조합·래퍼는 웹 앱 내부에서 만든다.
- 개별 앱에서 전역 `:root`·`.dark` 테마 토큰을 덮어쓰지 않는다.
- 카드·메뉴·버튼의 공통 시각 규칙을 화면별 `className`으로 다시 만들지 않는다. 새 화면은 공통 변형과 의미 클래스를 조합한다.
