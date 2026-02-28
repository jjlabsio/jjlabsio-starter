# UI Codemap

**Last Updated:** 2026-02-28

**Entry Points:**

- `@repo/ui` (component exports)
- `packages/ui/src/components/` (shadcn/ui components)

---

## Architecture

Shared React component library built on shadcn/ui with base-vega theme (Tailwind CSS v4).

## Package Structure

| Directory         | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `src/components/` | shadcn/ui components (Button, Badge, etc.) |
| `src/hooks/`      | Custom React hooks                         |
| `src/utils/`      | Utility functions                          |
| `components.json` | shadcn configuration                       |

## Installation & Management

```bash
# Add shadcn component to @repo/ui
npx shadcn@latest add <component-name> -c packages/ui
```

**Important:** Always add new shadcn components to `@repo/ui` first, then import into apps.

## Components Used in Billing

| Component | Location                    | Usage                                         |
| --------- | --------------------------- | --------------------------------------------- |
| Button    | `src/components/button.tsx` | Pricing CTAs, "Get Started", "Manage Billing" |
| Badge     | `src/components/badge.tsx`  | Status badges (ACTIVE, TRIAL, CANCELED, etc.) |

See app UI components for billing-specific implementations:

- `apps/app/src/components/subscription-status-card.tsx` (built from Button + Badge)

## Related Areas

- [Billing Codemap](./BILLING.md) - UI components used in pricing/billing pages
- [INDEX](./INDEX.md) - Overview

---

**Note:** UI codemap to be expanded as component library grows. For full component list, see `packages/ui/src/components/`.
