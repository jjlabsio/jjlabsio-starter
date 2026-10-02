# 데이터 테이블 사용 컨벤션

## 적용 범위

- 새 목록과 카드 내부 표에 `@repo/ui/components/data-table` 사용.
- 시각 규칙에 루트 [DESIGN.md](../../DESIGN.md)의 데이터 테이블 항목 적용.
- 예시 `/tables` 페이지는 검수용. 삭제해도 공통 구현·이 문서·회귀 테스트 보존.
- 막대 목록·계층 목록·매트릭스에 일반 데이터 테이블 강제 적용 금지.

## 책임 분리

| 위치             | 책임                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `packages/ui`    | 헤더·행·셀·정렬 표시·필터 선택 표시·페이지네이션·조회 상태·선택 초기화 |
| 앱의 목록 화면   | 열 정의·행 ID·필터 옵션·카드/페이지 배치·업무 액션                     |
| 앱의 조회 어댑터 | `loadRows(query, signal)`·요청 취소·응답 해석·오류 메시지              |
| 서버 API         | 인증·사용자/워크스페이스 권한·입력 검증·DB 조회·전체 결과 개수·저장    |

- 서비스 데이터 타입·API 주소·Prisma 접근을 UI 패키지에 추가하지 않음.
- 검색·필터·정렬·페이지네이션을 같은 전체 결과 집합에서 처리.
- 서버 페이지 결과에 클라이언트 정렬·필터를 추가 적용하지 않음.

## 기본 구현: 서버 조회

1. 목록 데이터 타입과 `DataTableColumn<T>[]` 정의.
2. `loadRows(query, signal)` 구현. 현재 페이지의 `rows`와 필터 적용 후 전체 `rowCount` 반환.
3. `useDataTable({ columns, loadRows, getRowId })` 호출. `getRowId`에 안정된 레코드 ID 사용.
4. 같은 `table` 인스턴스를 도구막대·표 본체·하단에 연결.
5. 업무 액션 성공 후 `table.reload()` 호출. 실패 시 입력·선택을 보존하고 오류 표시.

```tsx
"use client";

import {
  DataTable,
  DataTableToolbar,
  DataTableFilter,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
  type DataTableQuery,
  type DataTableResult,
} from "@repo/ui/components/data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";

type RecordRow = { id: string; name: string; status: string };
const columns: DataTableColumn<RecordRow>[] = [
  {
    accessorKey: "name",
    header: "이름",
    enableSorting: true,
    sortFn: "alphanumeric",
    meta: { layout: "content", text: "primary" },
  },
  {
    accessorKey: "status",
    header: "상태",
    filterFn: "oneOf",
    meta: { layout: "compact" },
  },
];

async function loadRows(
  query: DataTableQuery,
  signal: AbortSignal,
): Promise<DataTableResult<RecordRow>> {
  const params = new URLSearchParams({
    pageIndex: String(query.pagination.pageIndex),
    pageSize: String(query.pagination.pageSize),
    search: query.globalFilter,
  });
  const sort = query.sorting[0];
  if (sort) {
    params.set("sort", sort.id);
    params.set("direction", sort.desc ? "desc" : "asc");
  }
  for (const filter of query.columnFilters)
    for (const value of filter.value as string[])
      params.append(filter.id, value);
  const response = await fetch(`/api/records?${params}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("목록을 불러오지 못했습니다. 다시 시도해 주세요.");
  return response.json();
}

export function RecordsList() {
  const table = useDataTable({ columns, loadRows, getRowId: (row) => row.id });
  return (
    <Card variant="panel">
      <CardHeader>
        <CardTitle>목록</CardTitle>
      </CardHeader>
      <CardContent padding="none">
        <DataTableToolbar table={table} searchLabel="목록 검색">
          <DataTableFilter
            table={table}
            columnId="status"
            label="상태"
            options={[
              { label: "활성", value: "active" },
              { label: "보관", value: "archived" },
            ]}
          />
        </DataTableToolbar>
        <DataTable
          table={table}
          label="목록"
          selectable
          rowLabel={(row) => row.name}
        />
        <DataTablePagination table={table} label="개 항목" />
      </CardContent>
    </Card>
  );
}
```

- 위 `/api/records`는 서비스에서 구현할 계약 예시. 템플릿의 예시 API를 운영 DB처럼 사용하지 않음.
- 외부 조회 조건에 워크스페이스·탭·기간을 사용하면 실제 요청과 `queryKey` 양쪽에 같은 조건 연결.
- `queryKey`만 변경해서 서버 조회 조건이 바뀐 것으로 간주하지 않음.
- `loadRows`에서 전달받은 `signal`을 `fetch`에 연결. 공통 훅은 취소된 요청의 늦은 결과도 무시.
- `rowCount`는 현재 페이지의 길이가 아닌, 같은 권한·검색·필터 조건의 전체 개수.
- 서버 응답의 `rows`는 배열, `rowCount`는 행 개수 이상인 0 이상의 정수. 잘못된 응답은 공통 오류·재시도로 처리.

### 서버 API 필수 조건

- 세션에서 사용자 식별. 요청의 사용자 ID만 신뢰하지 않음.
- 목록 조회와 개수 조회에 같은 사용자·워크스페이스 접근 범위와 필터 조건 적용.
- `pageIndex`에 0 이상의 정수, `pageSize`에 1~100 정수 허용. 검색 길이에 상한 적용.
- 정렬 열·방향·필터 열·필터 값에 허용 목록 적용. 입력값을 SQL·Prisma 필드명에 그대로 사용하지 않음.
- 검색·필터 적용 → 정렬 → 페이지 분할 순서 유지. `skip = pageIndex * pageSize`, `take = pageSize` 사용.
- 동일 정렬값의 순서를 안정된 ID로 추가 결정. 정렬 해제 시에도 기본 정렬과 ID 기준 적용.
- 같은 필터 안의 값에 OR, 서로 다른 필터와 검색에 AND 적용.
- 저장 API에서 인증·레코드별 권한 재검증. 화면에서 선택한 ID라는 이유로 저장 권한 부여 금지.

## 외부 조회 라이브러리가 결과를 관리하는 경우

- `loadRows` 방식과 외부 조회 방식을 혼합하지 않음.
- 서버 기본 모드에 다음 전체 계약 제공. 누락 시 공통 훅에서 오류 발생.

| 필수 항목                      | 연결 기준                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `data`·`rowCount`·`getRowId`   | 현재 페이지 결과·전체 결과 수·안정된 ID                                                                       |
| `state`                        | `globalFilter`·`columnFilters`·`sorting`·`pagination` 전체 상태                                               |
| 변경 콜백 4개                  | `onGlobalFilterChange`·`onColumnFiltersChange`·`onSortingChange`·`onPaginationChange`를 실제 조회 상태에 연결 |
| `isLoading`·`error`·`onReload` | 현재 조건의 로딩·오류·실제 재조회 함수                                                                        |

- 변경 콜백의 값·함수형 `Updater` 둘 다 처리. React 상태 setter에 직접 연결 가능.
- 외부 쿼리 키에 전체 조회 조건 포함. 이전 조건의 결과를 현재 조건의 데이터로 표시하지 않음.
- 공통 훅에 제어 상태를 제공하면 대응 변경 콜백도 제공. 행 선택을 제어하면 `onRowSelectionChange` 연결.

## 클라이언트 처리 예외

- 작고 고정된 목록을 이미 전부 보유한 경우에만 `processing: "client"`·`data` 사용.
- 서버의 일부 페이지 결과를 클라이언트 모드로 전달하지 않음.
- 브라우저 저장 예시는 UI 검수용. 누적되는 실제 서비스 목록은 기본 서버 조회 사용.

## 동작 계약

### 행 클릭

- 본문 행 호버는 행 전체에 `bg-muted` 적용. 토큰 자체에 투명도가 있으므로 `/30` 등 추가 투명도로 약화하지 않음. 라이트·다크 모두 각 테마 토큰 사용, 헤더 호버 규칙은 별도 유지.

- `rowClickable` 기본값 `false`. 활성화한 행은 포인터·기존 행 호버·키보드 포커스 표시, Enter/Space 실행.
- `selectable`이 있으면 행 클릭은 선택 토글만 수행. 선택 불가 행은 클릭 비활성. `onRowClick` 동시 지정 시에도 선택 우선.
- `selectable`이 없으면 `onRowClick(row)` 실행. 콜백이 없으면 클릭 비활성. 상세 이동·다이얼로그 열기는 앱에서 연결.
- 내부 링크·버튼·입력·체크박스는 자신의 동작만 실행. 사용자 정의 조작 영역에는 `data-row-click-ignore` 지정. 텍스트 드래그 선택은 행 동작 미실행.
- 이동용 이름 링크는 유지하여 새 탭 열기·링크 복사 지원. 행의 빈 영역 클릭은 기본 상세 이동에 사용.
- 예: `<DataTable table={table} label="projects" rowClickable onRowClick={(row) => router.push(row.href)} />`.

| 상황                               | 공통 동작                                               |
| ---------------------------------- | ------------------------------------------------------- |
| 검색·필터·정렬·외부 조회 조건 변경 | 첫 페이지 이동·행 선택 해제                             |
| 페이지 이동                        | 행 선택 해제                                            |
| 페이지 크기 변경                   | 보던 행 위치 유지하도록 페이지 번호 재계산·행 선택 해제 |
| 재조회 후 전체 결과 감소           | 범위를 벗어난 페이지를 마지막 유효 페이지로 보정        |
| 0건 / 1페이지 / 2페이지 이상       | 빈 결과 / 개수만 / 번호·이전/다음·결과 범위와 전체 개수 |

- 페이지 크기 변경에 TanStack 기본 동작 유지. 20건씩 3페이지의 시작 위치 40 → 10건씩 5페이지. 데이터 변경이 아니므로 첫 페이지 이동 강제하지 않음.
- 기본 페이지 크기는 20건. 서비스가 크기 선택기를 제공하면 `table.setPageSize(size)` 사용.
- 정렬은 필요한 열에만 `enableSorting: true`·`sortFn` 지정. 숫자·날짜에는 원본 값을 전달하고 셀에서만 포맷.
- 필터에 `DataTableFilter` 사용. 분류명 유지·선택 개수 표시·중립 적용 배경·메뉴 체크 상태 유지.
- 검색·필터 초기화는 `DataTableToolbar`에서 한 번만 제공. 별도 칩 행·필터 메뉴 초기화 중복 금지.
- 선택은 현재 페이지의 선택 가능한 행만 대상으로 처리. 헤더 전체 선택·일부 선택 표시·하단 선택 개수 유지.
- 업무 버튼의 노출·권한·확인·저장 처리는 앱 책임. 조회 중이거나 선택이 없으면 선택 기반 액션 비활성화.
- 로딩·빈 결과·오류·재시도에 공통 구현 사용. 모바일에서는 표 내부 가로 스크롤 유지.

## 완료 확인

- 카드 안·독립 목록에서 같은 공통 표·타이포그래피·정렬 표시 적용 확인.
- 0건·1페이지·복수 페이지·마지막 페이지·전체 결과 감소 확인.
- 검색·복수 필터·정렬·초기화·행 선택·페이지 크기 변경의 실제 조회 조건 확인.
- 느린 이전 요청이 최신 결과를 덮지 않는지, 조회 실패 후 Retry로 복구되는지 확인.
- 1440×900·390×844에서 표 내부 스크롤·클릭·키보드·페이지 전체 가로 넘침 확인.

## 검증 명령과 구현 근거

```bash
pnpm --filter app exec vitest run src/domains/sidebar/lib/data-table.test.ts src/domains/sidebar/lib/data-table-interactions.test.tsx
pnpm --filter @repo/ui typecheck
```

- 회귀 테스트는 공통 컴포넌트를 직접 마운트하며 `/tables` 라우트·예시 API에 의존하지 않음.
- 페이지 크기 재계산 근거: 설치된 TanStack의 `table_setPageSize` 구현. 공식 [페이지네이션 API](https://tanstack.com/table/v8/docs/api/features/pagination)와 함께 확인.
- 예시 화면 삭제 시 다른 화면에서 사용하는 조회 어댑터·공통 테스트를 함께 삭제하지 않음.
