# 상단 경로와 사이드바

## 공통 계약

- `PageContainer`에 `title`과 선택적 `breadcrumbs: { label, href? }[]` 전달.
- 상단바를 직접 사용하는 페이지도 `SiteHeader`의 동일 계약 사용.
- 경로 생략·0개·1개: 기존 페이지 제목만 표시. 2개 이상: 공통 breadcrumb 표시.
- 마지막 항목: 현재 위치, 링크 없음. `title`은 현재 화면의 접근 가능한 제목으로 유지.
- Home·Resources·Work·Workflow 등 사이드바 카테고리는 모든 화면의 breadcrumb에서 제외. 실제 진입 메뉴를 첫 항목으로 사용.
- 상위 항목은 실제 상위 페이지의 `href` 제공. 메뉴 루트는 제목만, 상세는 메뉴부터 현재 항목까지 표시.
- 주소 문자열·사이드바 카테고리·방문 기록에서 표시 이름 자동 생성 금지. 페이지의 데이터와 논리적 계층으로 명시.

## 사이드바 활성화

- 메뉴 URL과 현재 경로가 같거나 `/` 경계의 하위 경로이면 해당 메뉴 활성화. 루트 `/`는 정확히 일치할 때만 활성화.
- 상세 경로는 소속 메뉴 URL 아래 배치. 예: `/resources/projects/atlas/pages/getting-started` → Projects 활성, Resources는 분류.
- 다른 탐색 계층에서 같은 데이터를 보여주는 경우 해당 계층의 경로에서 공통 상세 콘텐츠 재사용. 직전 클릭 메뉴를 상태로 저장하지 않음.
- 메뉴 URL을 중첩 등록할 경우 별도 소속 판정 필요. 현재 예시는 하나의 소속 메뉴 아래 상세 경로만 구성.

## 좁은 화면

- 상단바 한 줄 유지, 긴 이름 말줄임 및 전체 이름 `title` 제공.
- 768px 미만·3단계 이상: 앞선 경로를 `Show parent pages` 메뉴에 표시하고 직전 상위·현재 위치 유지.
- 숨긴 경로의 링크 이동과 키보드 조작은 공통 DropdownMenu 사용.

## 적용 예

```tsx
<PageContainer
  title="Getting started"
  breadcrumbs={[
    { label: "Projects", href: "/resources/projects" },
    { label: "Atlas", href: "/resources/projects/atlas" },
    { label: "Pages", href: "/resources/projects/atlas/pages" },
    { label: "Getting started" },
  ]}
>
  {/* 기존 공통 컴포넌트로 상세 콘텐츠 구성 */}
</PageContainer>
```

- 실행 예시: Resources 카테고리 아래 Projects 메뉴 → 프로젝트명 클릭 → 상세의 페이지명 클릭 → 페이지 상세. 프로젝트 상세의 View all pages에서 별도 하위 목록도 탐색 가능.
- Resources는 사이드바에만 표시하는 분류, Projects는 breadcrumb의 시작 메뉴. 기본 경로는 `projectsNavigation`에서 한 번 정의하고 상세 화면은 데이터 이름·링크만 `projectBreadcrumbs`에 추가. 모든 메뉴에 동일 규칙 적용.
- `/resources`는 Projects 목록으로 리다이렉트. 모든 하위 화면의 활성 메뉴는 `/resources/projects`이며 분류는 활성화하지 않음.
- `resource-examples.ts`의 고정 레코드를 서버에서 ID로 조회. 페이지 조회는 프로젝트 ID까지 함께 검사하여 다른 프로젝트의 페이지 접근 시 404 반환.
- 표는 고정된 전체 예시 데이터만 클라이언트 처리. 실제 SaaS에서는 목록을 데이터 테이블의 `loadRows` 서버 계약으로 교체하고 목록·상세 모두 인증된 사용자/워크스페이스 범위로 조회. UI 패키지에 서비스 데이터·권한 로직 추가 금지.
- 신규 상세 검증: 직접 접속·새로고침·상위 링크·브라우저 뒤로/앞으로·모바일 경로 메뉴·소속 메뉴 활성·잘못된 ID의 404 확인.
