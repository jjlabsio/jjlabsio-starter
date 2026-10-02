# Rewards Program

## Scope

- Web `/rewards`: guidelines and CTA to `${NEXT_PUBLIC_APP_URL}/rewards`.
- App `/rewards`: signed-in post submission, required participation confirmation, optional organic-marketing reuse permission, own review status. Entry in sidebar account dropdown. Existing app subscription gate retained.
- `apps/admin` `/rewards`: separate Next.js deployment and production Google-only authentication, isolated cookie namespace and secret. No administrator routes/actions remain in user app. Shared UI and database.
- Approval is review eligibility only. No reward amounts, fulfillment, Polar mutations, subscription extensions, or notification emails implemented. Replace preview wording and configure rewards before public launch.

## Setup and security

1. Apply database migration with `pnpm --filter @repo/database db:migrate:deploy`; regenerate/build database package.
2. Configure `apps/admin/.env`: `ADMIN_EMAIL` (one verified Google email), distinct `BETTER_AUTH_SECRET`, own `BETTER_AUTH_URL` and Google callback. Empty denies all. Production and remote environments are Google-only; local development additionally permits the dedicated dev-admin@example.test account for testing.
3. Open Admin `/rewards`. User/session creation, pages and review actions enforce allowlist. Unauthorized users receive 404; anonymous users go to Admin sign-in. No subscription requirement. App cookies cannot authenticate Admin.
4. Run `pnpm --filter admin dev`; deploy separately. See `apps/admin/README.md`.

## Submission and review

- One row per authenticated user, unique normalized HTTPS post URL. Server uses session user ID, not form-provided identity. Links never fetched by the server (no scraping/SSRF); operator opens manually.
- `PENDING → APPROVED | REJECTED | CHANGES_REQUESTED`. Only changes-requested submissions can be edited/resubmitted into PENDING. Approved/rejected final in baseline. Conditional DB updates and unique constraints prevent concurrent overwrite/duplicate submissions.
- Review reason required for change request/rejection. User can see it. Recent admin history retained; list bounded to 20 per page.
- Participation and optional marketing permission stored with version and timestamps. Each initial/resubmission audit event retains consent snapshot. Current wording `2026-10-02-v2` in `rewards-policy.ts`. Marketing permission is not approval prerequisite and excludes paid ads. Withdrawals remain supported manually via support; removing inline help does not remove withdrawal rights.
- App form uses Profile's 32px top spacing. Title `Submit your review`, action `Submit`. URL and participation marked required; Submit enabled only for server-valid HTTPS URL + participation, disabled while pending. Optional marketing permission never gates submission. Server validation remains authoritative.

### Prior consent wording: 2026-10-02-v1

- Participation: “I confirm this is my original public post based on real usage, disclose that I may receive a reward, and agree to the participation guidelines.”
- Marketing: “I allow Acme to reuse this post, my public name, and images on its website and organic social channels. This is optional and does not affect approval. Contact support@example.com to withdraw permission.”
- Existing in-memory rate limiter used for submissions; use distributed limiter at scale.
- Future fulfillment must have its own idempotent payout ledger/state. Never interpret APPROVED as paid, or change app access dates without synchronizing the billing provider.

## Checks

`pnpm --filter app test -- src/lib/rewards-policy.test.ts src/domains/rewards/actions.test.ts` and `pnpm --filter admin test` verifies authorization, URL/consent boundaries, final-state protection and review without billing side effects. Browser flow: submit → request changes → resubmit → approve; refresh both pages; denied-admin user cannot review.
