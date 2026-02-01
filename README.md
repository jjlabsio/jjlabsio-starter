# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components, run the following command at the root of the monorepo:

```bash
npx shadcn@latest add badge -c packages/ui
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@repo/ui/components/button";
```
