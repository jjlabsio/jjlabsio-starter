This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open the app URL printed by the scaffold command with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project loads Pretendard through [`next/font/local`](https://nextjs.org/docs/app/api-reference/components/font#local-fonts).

## 공통 테이블

- 확인 화면: 로그인 후 사이드바의 **Tables** (`/tables`). 63건의 서버 예제로 검색·체크박스 필터·정렬·20건 페이지 이동·현재 페이지 행 선택·일괄 아카이브·상세 메뉴 확인.
- 구현: `@repo/ui/components/data-table`의 `useDataTable`, `DataTable`, `DataTableToolbar`, `DataTableFilter`, `DataTablePagination`, `DataTableText`.
- 사용 예제: `src/app/(authenticated)/(sidebar)/tables/page.tsx`. 열 정의는 `DataTableColumn<T>` 사용. 숫자·날짜는 원본 값으로 정렬, 행 ID는 데이터의 안정된 ID 제공.
- 카드 안 표와 전체 목록은 같은 본체 사용. 제목·탭·전역 필터·데이터 저장은 화면에서 구성. 디자인 계약은 프로젝트 루트 `DESIGN.md`의 데이터 테이블 항목 참조.
- 기존 적용 화면: Overview의 Top sources, Requests, Settings → Projects. 모바일은 표 내부 가로 스크롤 사용.
- `useDataTable`은 서버 처리가 기본. 앱의 `loadRows(query, signal)`에서 조회해 `{ rows, rowCount }` 반환. 검색·필터·정렬·페이지 분할은 모두 서버에서 처리. 작은 고정 목록을 전부 로드한 경우에만 `processing="client"` 명시.
- 실제 조회 예제: `src/app/api/examples/records/route.ts`, `src/domains/sidebar/lib/example-records.ts`. 인증·입력 검증·전체 결과 수·서버 정렬/필터·페이지 분할 포함. 서비스 구현 시 fixture 조회를 사용자/워크스페이스 범위의 Prisma `findMany`·`count`로 교체.
- 아카이브 예제는 사용자별 HttpOnly 세션 쿠키에 예제 ID만 저장하며 실제 DB를 변경하지 않음. 서버 처리와 영구 DB 저장은 별개. 실제 서비스에서는 같은 인증 범위의 DB 업데이트로 교체.
- Overview Top sources도 인증된 서버 조회 사용. 기존 Projects·Requests는 브라우저 저장/메모리 폼 예제이므로 명시적 client 예외 유지. 실제 서비스 저장 방식으로 사용하지 않음.
- 열 이동·크기 조절·고정·열 설정·전체 검색 결과 선택·페이지 간 선택 유지는 미포함.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
