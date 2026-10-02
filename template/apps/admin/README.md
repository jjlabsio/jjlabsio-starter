# Admin

Separate Next.js application for Rewards Program review and service-email management. Shared UI, database, Better Auth libraries; no app subscription gate.

1. Copy `.env.example` to `.env`. Set `ADMIN_EMAIL` to exactly one verified owner Google email; empty denies everyone.
2. Set a distinct `BETTER_AUTH_SECRET`, own `BETTER_AUTH_URL` and Google credentials. Register `BETTER_AUTH_URL/api/auth/callback/google` with Google OAuth.
3. Run `pnpm --filter admin dev`; visit `/rewards`.

Deploy independently with its own domain/environment. Never share secrets or cookie prefixes with app. Production is Google-only. Local development on localhost/127.0.0.1, with ADMIN_EMAIL configured, additionally supports the dedicated dev-admin@example.test account; the button, server action and password endpoints are disabled in production/remote environments. This account is never presented as a verified Google identity. User creation, session issuance, pages and all actions enforce owner allowlist or the strictly local development identity. Changing ADMIN_EMAIL revokes access on next protected request. Separate deployment shares database; it is not database isolation. Personal email is not shipped in template defaults. Reward fulfillment is not implemented.

## Emails

Visit `/emails` to compose blocks, save drafts, preview, choose trial/subscribed audiences, and confirm before sending. Email content/rendering/sending and campaign state belong to `packages/email`; Admin owns only the protected UI/actions. Configure `RESEND_API_KEY` and `EMAIL_FROM` in Admin's `.env` to enable delivery. Apply database migrations before use. Drafting and preview do not require Resend credentials.

Service notices only, not promotional campaigns. Marketing consent/unsubscribe is not implemented. Up to 5,000 recipients per campaign, processed in resumable batches while the page remains open. Reopen an interrupted campaign and use Resume sending; never duplicate it to retry. “Sent” means accepted by Resend, not delivered to the inbox. See [email conventions](../../docs/architecture/email.md) for recipient rules, retry limits, and module boundaries.

Login and authenticated shell reuse app patterns (shared SignInLayout, SidebarProvider/SidebarInset, theme/account menu, fonts, providers and Toaster); service/billing menus excluded. Set NEXT_PUBLIC_WEB_URL to the website hosting /terms-of-service and /privacy. Login wording links to these documents; it is not an audit trail of legal acceptance. Add versioned consent recording separately if required for a live service.
