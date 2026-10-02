# shadcn preset bY9A for shared UI

## Status

Accepted — 2026-09-23

## Context

The scaffold's shared UI components had drifted from the current shadcn registry.
The existing Button also exposed a project-specific loading API that was no longer
needed. The active chart component required Recharts 2 while current shadcn
Base Nova components require Recharts 3.

## Decision

Use the shadcn Create preset `bY9A` for `template/packages/ui`: Base Nova,
neutral tokens, Tabler icons, and the registry-generated component sources.
Keep the existing Pretendard font binding. All apps, including the landing-page
web app, use the same global theme tokens from `packages/ui/src/styles/globals.css`.
The landing page may compose or wrap shared components locally, without a
separate global theme override. Use the standard Base UI Button without an
`isLoading` extension.

## Consequences

- Shared UI depends on `cn`, Base UI 1.8, shadcn 4.21, and Recharts 3.
- The app and shared UI pin the same Recharts version (`3.8.0`) because
  `ResponsiveContainer` and chart components must share one package instance.
- Tooltip consumers are wrapped by `TooltipProvider` in both app providers.
- Future UI updates should be generated from the same preset rather than
  hand-copying another shadcn style.
