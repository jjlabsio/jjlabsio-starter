# @jjlabsio-starter/web

Landing page for the SaaS starter template.

앱과 동일한 `@repo/ui/globals.css`·Pretendard·라이트/다크 토큰 사용. 버튼·카드·배지·가격 카드·결제 주기 선택은 `@repo/ui` 재사용. 랜딩의 섹션 배치·큰 제목은 웹에서 구성하되 공통 컴포넌트의 색상·모서리·상태 스타일을 개별 덮어쓰기하지 않음.

## 랜딩 구조

- 메뉴 데이터: `src/lib/marketing.ts`. 헤더·모바일 메뉴·푸터에서 동일 데이터 사용.
- 최상위 메뉴: Features·Solutions·Resources·Pricing. Tools는 Resources 하위 그룹, 실제 도구 구현 전 주석 유지.
- 드롭다운: 보조색 그룹 라벨 + 공통 NavigationMenu 링크. 모바일은 공통 Sheet 내부에 같은 그룹 표시.
- 랜딩 메뉴는 제목·보조 설명 조합. `marketing.ts`에서 두 텍스트 관리, 데스크톱·모바일 동일 내용 표시. 데스크톱은 승인된 전용 스타일(`src/components/layout/header.module.css`) 사용. 12px 내부 여백·기본 반경의 0.6배·최소 52px 링크·공통 의미 색상 유지. 앱의 메뉴 기본값 변경 제외.
- 홈: 중앙 제목·설명·CTA → 고정 비율 제품 더미 이미지 → 기능·활용 섹션 → FAQ → CTA. 기능·활용 상세도 같은 구조. 실제 제품 적용 시 더미 이미지를 제품 화면으로 교체.
- 넓은 제목·섹션 여백은 랜딩 전용 배치. 색상·버튼·카드·상태는 공통 UI 토큰 사용, 별도 테마 정의 금지. 실제 제품 적용 시 예시를 해당 기능의 화면으로 교체.
- 예시 기능·활용·업데이트 페이지는 noindex. 실제 기능·고유 콘텐츠·근거로 교체한 뒤 색인 활성화.

## Pricing 비교표

- 웹 `/pricing` 전용: 가격 카드 → 카테고리별 상세 비교표 → FAQ → CTA. 앱의 Pricing·Billing 변경 제외.
- `src/app/pricing/_components/pricing-comparison.tsx`의 `featureSections`에서 카테고리·행 구성. 예시 3개 카테고리·활동 이력 기간은 더미 데이터, 실제 서비스에 맞게 교체.
- 이름·가격·제공량·기존 지원 기능은 `@repo/billing/plan-config`의 `TIERS` 참조. 카드와 비교표에 `PricingToggle`의 동일 주기 전달, 가격 중복 정의 금지.
- 지원 여부는 체크·대시 및 스크린리더 문구 사용. 공통 `Table` 조합, 정렬·필터·페이지네이션 없는 비교 매트릭스. 모바일은 표 내부 가로 스크롤·고정 행 레이블 사용.
- 로컬 검증: 웹 서버 실행 후 `node scripts/check-pricing.mjs`. 카테고리·요금제·연간 가격·모든 기능의 비교 셀 확인.

## Rewards Program

- Resources의 `/rewards`: 안내 → 앱 `/rewards` 로그인 폼 → URL·동의 저장 → 별도 `apps/admin`의 `/rewards` 검수. 초대 기반 referral 및 판매 수수료 affiliate와 구분.
- 계정당 승인 1회, 보상 미정. 긍정적 후기·최소 팔로워·판매 실적 조건 없음. 구독 연장·현금 지급 등 보상 로직 미구현.
- 공개·원본 콘텐츠, 실제 사용, 보상 관계의 명확한 공개 필수. 마케팅 재사용 동의는 선택이며 검수와 독립.
- 설치·권한·DB·상태 전이·검증: [Rewards Program 규칙](../../docs/product/rewards.md).
- 페이지는 정책 미확정 템플릿 표시 및 noindex. 보상 안내·절차·조건·공통 FAQ·제출 CTA 구성, 기존 의미 색상과 UI 버튼 재사용. Changelog 메뉴·페이지 제거.
- 참고: [ScheduleBeats 공개 게시/검수/구독 연장](https://schedulebeats.com/en/blog/schedulebeats-ambassador-program), [NightCafe SNS 리워드](https://help.nightcafe.studio/portal/en/kb/articles/free-credits-questions), [FTC 보상성 후기 공개 안내](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking). 대상 국가·플랫폼 규정은 실제 운영 전 별도 검토.

## 실행

블로그 작성 규칙: [Markdown 콘텐츠 가이드](content/blog/README.md). 로컬 서버 실행 후 `node scripts/check-blog.mjs`로 목록·상세·메타데이터·404 검증.

```bash
pnpm dev        # Start dev server on the scaffolded web port
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript type checking
```
