# Blog content convention

`content/blog/<slug>.md` 파일 하나로 `/blog/<slug>` 생성. 소문자 영문·숫자·하이픈 slug 사용. 날짜 내림차순 목록 및 카테고리 필터 자동 생성. CMS 없이 로컬 Markdown을 서버에서 읽는 구조.

## Frontmatter

```yaml
---
title: "Article title"
description: "A short, separately written introduction for the listing."
date: "2026-10-01"
category: "Product"
author: "Acme team"
cover: "/images/blog/my-cover.jpg"
coverAlt: "Meaningful description of the cover"
seoTitle: "Article title | Acme"
seoDescription: "Optional search and social description."
---
```

`title`, `description`, `date`, `category`, `author`, `cover`, `coverAlt` 필수. `seoTitle`, `seoDescription` 선택; 생략 시 제목·설명 재사용. 목록 설명은 본문 추출이 아닌 독립 필드. 날짜 문자열은 반드시 따옴표 사용. 잘못된 필드는 검증 오류로 수정 위치 확인.

## Images and body

이미지 파일은 `public/images/` 아래 보관. 커버는 목록·상세 모두 16:9, `object-cover`로 표시하므로 주요 피사체를 중앙에 배치. 대표 글도 다른 비율 사용 금지. 목록 제목 2줄·설명 3줄 고정 높이 및 초과 텍스트 생략; 상세에서 전체 확인. 읽기 시간 표시 없음. 외곽 카드 테두리 및 별도 읽기 버튼 없음.

본문은 일반 Markdown. 상세 제목은 frontmatter에서 표시하므로 본문은 문단과 `##` 소제목부터 시작.

```md
## Show the work

An introductory paragraph.

![Accessible image description](/images/blog/example.jpg)

A paragraph after the image.
```

본문 이미지는 `/images/` 로컬 파일만 지원. 제목·커버·본문의 시작점과 너비 동일; 본문에 별도 좁은 너비 제한 금지. 모든 블로그 이미지(목록 커버·상세 커버·본문 이미지)는 16:9 및 object-cover 통일. 상세 커버와 본문 이미지의 표시 크기 동일. 상세에 설명·작성자 표시 없음; 메타데이터 유지. 임의 HTML·MDX 실행 없음. SEO title/description, canonical, Open Graph 및 Twitter 이미지 메타데이터 자동 생성. 배포 시 `NEXT_PUBLIC_WEB_URL`을 웹 도메인으로 설정; 기본값은 로컬 `http://localhost:4000`.

검증: `pnpm typecheck`, `/blog` 카테고리 필터·각 글 링크·잘못된 slug 404 확인, 데스크톱·모바일 커버 비율과 제목/설명 정렬 확인.
