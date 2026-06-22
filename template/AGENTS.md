# AGENTS.md

> Agent 작업 지침.
> 사용자용 설치·운영 안내는 `README.md` 참조.
> `AGENTS.md`와 `CLAUDE.md`는 제목만 다르고 동일한 본문 유지.

---

## Source of Truth

- scripts, dependencies, runtime versions: root `package.json` and workspace `package.json` files
- workspace layout: `pnpm-workspace.yaml`, `turbo.json`, `apps/`, `packages/`
- environment variables: `.env.example` files
- database schema and migrations: `packages/database/prisma/`
- shared UI components: `packages/ui/`
- user setup and service configuration: `README.md`

Prefer these files over stale prose when behavior, commands, or versions differ.

---

## Project Shape

- `apps/`: runnable applications
- `packages/`: shared workspace packages
- `packages/ui`: shared shadcn/ui components, hooks, styles, and utilities
- `packages/database`: Prisma schema, generated client boundary, and database scripts
- `packages/auth`: Better Auth configuration and auth client/server boundary
- `packages/billing`: Polar billing integration boundary
- `packages/email`: email templates and provider integration boundary

---

## Working Rules

- Inspect existing code and configuration before changing behavior.
- Keep changes scoped to the requested task.
- Follow the existing workspace/package patterns before adding new abstractions.
- Update `README.md` when user setup, environment variables, commands, or service configuration changes.
- Update `AGENTS.md` and `CLAUDE.md` together when agent-facing rules change.
- Do not commit secrets, real `.env` files, tokens, credentials, or private keys.

---

## Commands

Check root `package.json` before relying on a command. Common commands:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

Database commands live in `packages/database/package.json` and are usually run through pnpm filters, for example:

```bash
pnpm --filter @repo/database db:migrate:dev
pnpm --filter @repo/database db:migrate:deploy
pnpm --filter @repo/database db:studio
```

---

## UI

- Prefer existing components from `packages/ui`.
- Add shadcn/ui components to `packages/ui` instead of individual apps.
- Check `packages/ui/components.json` before running shadcn commands.

---

## Database

- DB is PostgreSQL.
- Application database access goes through `@repo/database` and Prisma.
- Neon is the default recommended PostgreSQL host.
- Confirm connection, pooling URL, and direct URL requirements from `.env.example` files and Prisma configuration.

---

## Environment

- Use `.env.example` files as the source of truth for required variables.
- The scaffold creates local `.env` files from `.env.example` where configured.
- Keep local secrets out of git.

---

## Documentation

- `README.md` is for user setup, service configuration, and operational commands.
- `AGENTS.md` and `CLAUDE.md` are for agent working rules.
- Avoid duplicating fast-changing dependency versions or package lists in prose; point to source files instead.
