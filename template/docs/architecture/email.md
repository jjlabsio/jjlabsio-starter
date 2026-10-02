# 서비스 이메일

## 공통 구성

- 모든 서비스 이메일은 `@repo/email/templates/layout`의 `EmailLayout` 사용. 브랜드·흰 배경·본문 폭·푸터를 레이아웃 한 곳에서 관리.
- 템플릿은 `preview`와 본문만 제공. HTML/Body/Container 중복 작성 금지.
- 브랜드는 `packages/email/src/config.ts`의 `EMAIL_BRAND` 사용. scaffold 시 프로젝트명 치환.
- 이메일은 React Email의 인라인 스타일 사용. 앱의 Tailwind 컴포넌트를 이메일에 직접 삽입하지 않음.
- `sendEmail`은 SDK 오류 응답도 예외로 변환. 호출부에서 실패 처리. 환경 변수는 서버 전용.
- 공통 `renderEmail`로 발송용 HTML과 일반 텍스트 버전 생성. 발송과 미리보기는 같은 React 템플릿 사용.

## Resend 공통 발송 API

- 제공자는 Resend로 고정. 앱마다 SDK 초기화·설정 검사·본문 렌더링·오류 처리를 복제하지 않고 서버 코드에서 `@repo/email` 호출. 제공자 교체용 인터페이스나 별도 공개 발송 API 라우트는 두지 않음.
- `client.ts`가 서버 전용 API 키와 기본 발신자 확인 및 SDK 생성 담당. 웰컴·개별 발송·관리자 배치 모두 같은 설정 검사 사용. 빈 값·공백·`re_xxx` 예제 키는 실발송 차단.
- 발송하는 실행 앱의 `.env`에 `RESEND_API_KEY`, `EMAIL_FROM` 설정. 사용자 앱과 Admin은 별도 배포이므로 각 실행 환경에 같은 두 이름으로 설정. 패키지가 앱의 `.env`를 직접 읽거나 API 키를 클라이언트 환경 변수로 전달하지 않음.
- Resend에서 실제 서비스 도메인 검증 후 해당 도메인의 발신 주소 설정. DNS 검증·키 발급은 서비스별 외부 설정이므로 scaffold가 자동 수행하지 않음. [공식 Next.js 설정](https://resend.com/docs/send-with-nextjs) 참조.

```ts
import { createElement } from "react";
import { sendEmail } from "@repo/email";
import { WelcomeEmail } from "@repo/email/templates/welcome";

await sendEmail({
  to: user.email,
  subject: "Welcome to your workspace",
  react: createElement(WelcomeEmail, { name: user.name, appUrl }),
  idempotencyKey: `welcome/${user.id}`,
});
```

- `sendEmail({ to, subject, react, from?, idempotencyKey? })`: React 템플릿 → HTML/일반 텍스트 → Resend 발송, 접수 ID 반환. 기본 발신자는 `EMAIL_FROM`, 필요할 때 `from` 지정. SDK 오류/접수 ID 누락은 예외이며 자동으로 성공 처리하지 않음.
- `to` 배열은 한 메시지의 **공개 To 목록**. 사용자 전체 공지는 아래 배치 사용. 서로 모르는 수신자를 이 배열에 넣지 않음.
- `sendEmailBatch({ recipients, subject, html, text, from, key })`: 렌더링된 같은 본문을 최대 100개 개별 메시지로 접수, 접수 ID 배열 반환. HTML/일반 텍스트는 공통 `renderEmail`로 생성. 관리자 UI는 직접 이 함수를 부르지 않고 권한·확인·DB 상태를 관리하는 `campaigns` 경로 사용.
- `emailSendingConfigured()`: 발송 설정 유무 확인. 웰컴처럼 선택적 기능에서만 생략 판단에 사용; 수동 발송 실패를 조용히 무시하지 않음.
- 중복 방지 키는 동일한 이벤트/배치에 동일하게 사용. 자동 재시도 없음. 접수 성공은 도착 보장이 아니며 추후 전달 상태가 필요하면 webhook 추가.

## 책임 경계

- 사용자 앱은 가입 이벤트에서 이메일 모듈의 발송 함수를 호출. 이메일 레이아웃·템플릿·렌더링·발송·미리보기·초안/캠페인 상태는 `packages/email` 소유.
- Admin은 `apps/admin`의 별도 앱. 이메일 모듈의 개발자용 미리보기 서버를 사용자 앱·Admin의 라우트나 메뉴로 추가하지 않음. Admin 작성 화면의 본문 미리보기는 아래 작성·발송 규칙 적용.
- 개발자용 미리보기 서버는 이메일 모듈의 개발 도구이며 운영 서비스로 배포하지 않음.

## 로컬 미리보기

- 생성한 프로젝트 루트에서 `pnpm --filter @repo/email dev` 실행. Node.js 20.19 이상 필요.
- React Email 공식 개발 서버 사용. 포트는 scaffold에서 독립 배정(첫 세트 `3105`, 다음 세트 `3205`). 앱 서버·DB 없이 실행 가능.
- starter 저장소에서는 `pnpm dev:template-email` 실행 후 `http://localhost:4002/preview/welcome`에서 확인.
- `packages/email/emails/`의 default-export 파일은 실제 템플릿을 샘플 데이터로 렌더링하는 미리보기 진입점. 새 템플릿 추가 시 이 디렉터리에 진입점 추가. 샘플 Acme/Alex만 사용하며 실제 발송·API 키·로그인 불필요.
- `.react-email` 생성물은 Git·npm 배포에서 제외. 미리보기 서버에 실제 사용자 데이터·자격 증명 입력 금지.
- 실제 발송의 브랜드는 `EMAIL_BRAND` 사용. 미리보기만 가독성을 위해 Acme로 표시.
- 브라우저 확인은 Gmail/Outlook 등 실제 메일 클라이언트 렌더링 검증을 대체하지 않음.

## 웰컴 발송

- 사용자 앱 Better Auth `user.create.after`에서 검증된 Google OAuth `/callback/:id`의 `google` 가입만 발송.
- 계정 생성 훅이므로 재로그인·계정 연결·데브 계정 생성에서는 발송하지 않음. 별도 Admin 인증에도 연결하지 않음.
- Resend 키·발신 주소가 비어 있거나 예제 키이면 발송 생략. Google 인증만으로 앱 이용 가능.
- `RESEND_API_KEY`, `EMAIL_FROM`을 `apps/app/.env`에 설정. 발신 도메인은 Resend에서 검증. CTA는 서버의 `BETTER_AUTH_URL` 사용.
- 웰컴 제목·본문은 `templates/welcome.tsx`, 발송은 `welcome.ts`에서 관리.
- 요청 안에서 최대 3초 대기 후 실패·시간 초과를 잡아 가입 유지. 대기 제한은 공급자 요청 자체를 취소하지 않으므로 시간 초과 후 이메일이 도착할 수도 있음. 실패 로그에 수신 주소나 공급자 응답 본문을 기록하지 않음.
- `welcome/<user id>` Resend idempotency key 사용. 자동 재시도·영구 발송 상태·백그라운드 큐 없음. API 장애 시 웰컴 누락 가능; 전달 보장이 필요할 때 outbox/큐 추가.
- 실발송은 외부 자격 증명 필요. 단위 테스트에서는 SDK를 대체하여 발송하지 않음.

## Admin 이메일 작성·발송

- `apps/admin`의 `/emails`: 작성 화면·대상 선택·발송 확인·진행률 담당. 모든 페이지/Server Action에서 같은 `requireAdmin` 적용. 앱 세션이나 클라이언트의 역할값으로 관리자 권한 판단 금지.
- 이메일 모듈의 `content.ts`로 제목·본문·불릿·버튼·구분선 블록 검증. 순서·개수·내용은 초안 JSON에 저장. 사용자 HTML·스크립트 입력 실행 금지, 버튼 URL은 http/https만 허용. 미완성 초안 저장 가능, 발송 전 모든 블록 검증.
- Admin 미리보기는 작성 중인 이메일을 확인하는 기능. 이메일 모듈의 `CampaignEmail`·`EmailLayout`·`renderEmail`만 호출. 개발자용 `4002` 서버나 사용자 앱 라우트를 iframe으로 끌어오지 않음. iframe은 `sandbox`로 링크 이동·스크립트 차단.
- `Save draft`로 DB 저장, revision 기반 동시 편집 충돌 감지. 발송 중/완료된 이메일 수정 불가. `/emails?draft=<id>`로 재열람. 선택 메뉴에 최근 30개 표시, 이전 초안은 해당 URL로 접근 가능.
- 대상: 검증된 이메일의 `TRIALING` + 미래 `trialEnd`, 또는 `ACTIVE`. 만료 체험·미구독·취소·연체·미검증 계정 제외. 수신 이메일 중복 제거. 수신자 이메일은 브라우저에 반환하지 않고 인원수만 표시.
- `Review & send`에서 제목·Trial/구독 인원수·전체 인원수 표시. 저장한 초안 revision 및 수신자 fingerprint를 확인 시 다시 검사; 바뀌면 재확인 필요. 확인 시 본문 HTML/일반 텍스트·발신 주소·수신자 목록 고정.
- `EmailCampaign`은 초안/발송 상태·생성/확인 관리자 ID, `EmailBatch`는 대상 주소·상태·공급자 ID·처리 시각 기록. 발송 후 DB 진행률을 기준으로 남은 배치만 재개. 수신자 개인정보가 포함되므로 서비스 설치 시 데이터 보존·삭제 정책 적용 필요.
- `apps/admin/.env`에 `RESEND_API_KEY`, 검증 도메인의 `EMAIL_FROM` 설정. 미설정이면 작성·저장·미리보기·확인 가능, 실발송 차단. 자격 증명은 클라이언트에 전달하지 않음.
- 현재 메뉴는 **서비스 공지·운영 안내 전용**. 확인 다이얼로그에서 공지 여부 명시. 수신 동의·수신 거부 처리 없는 상태에서 홍보 캠페인에 사용 금지. 마케팅 용도를 추가할 때 별도 동의/선호 관리와 수신 거부를 먼저 구현; 후기 재사용 동의를 이메일 마케팅 동의로 간주하지 않음.

### 발송 안정성·운영 범위

- 기존 [Resend Batch API](https://resend.com/docs/api-reference/emails/send-batch-emails) 사용. 100명 이하 배치, 주소별 개별 메시지(To 한 주소)로 다른 수신자 노출 방지. HTML·일반 텍스트 동일 내용 제공.
- DB 조건부 업데이트로 배치 90초 처리 임대. 동시 요청은 차단, 임대 토큰이 일치하는 처리만 결과 기록. 실패/중단 후 같은 배치 ID와 동결된 payload 재사용.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)는 24시간. 첫 시도 후 23시간 이내만 재시도 허용. 이후 불확실한 배치는 자동 재발송 차단; Resend 로그와 provider ID를 먼저 확인. 응답 유실에 대비해 새 캠페인으로 복제·재발송 금지.
- `Sent`/진행률은 **Resend 접수** 기준, 수신함 도착·열람 보장 아님. 바운스/민원/최종 전달 상태는 별도 webhook 연동 대상.
- 기본 범위: 캠페인 최대 5,000명, 브라우저가 한 배치씩 Server Action 호출. 화면 종료 시 자동 백그라운드 발송 없음; 해당 캠페인에서 확인 후 재개. rate limit·발송량 제한은 공급자 계정 기준, 실패 시 같은 캠페인 재개. 더 큰 대상이나 무인 발송이 필요할 때 기존 Worker/큐로 옮김.
- 운영 반영 전 실제 검증 주소로 테스트하고 Resend 도메인·일일 한도 확인. 자동 테스트/로컬 UI 검수는 실발송 금지.

## 검증

`pnpm --filter @repo/auth test` / `pnpm --filter @repo/email test` / `pnpm --filter admin test`: 가입 경계, 관리자 권한, 블록/URL 검증, 수신 대상, 초안 충돌, 확인 snapshot, 임대/중복/재시도 경계, 발송 실패, 설정 생략, 공통 HTML·CTA 검증.
