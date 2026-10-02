import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { IconX } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      tone: {
        neutral: "",
        destructive: "",
      },
      variant: {
        filter:
          "h-7 max-w-full gap-0 rounded-md border-border bg-background px-0 py-0 type-ui-body text-foreground shadow-xs [&>[data-slot=badge-label]]:border-r [&>[data-slot=badge-label]]:border-border [&>[data-slot=badge-label]]:px-1.5 [&>[data-slot=badge-label]]:text-muted-foreground [&>[data-slot=badge-content]]:px-1.5 [&>button]:h-full [&>button]:w-7 [&>button]:rounded-none [&>button]:border-0 [&>button]:border-l [&>button]:border-border",
        tag: "h-7 max-w-full rounded-lg border-border bg-muted px-1.5 type-ui-body text-muted-foreground has-[button]:pr-0 has-[button]:gap-1.5 [&>button]:h-full [&>button]:w-7 [&>button]:rounded-none [&>button]:border-0 [&>button]:border-l [&>button]:border-border",
        metadata:
          "h-6 rounded-md border-border px-1.5 type-ui-body text-muted-foreground",
        status:
          "h-6 rounded-md bg-muted px-2 type-ui-body text-muted-foreground",
        count:
          "h-[18px] min-w-5 rounded-md border-border px-1 type-ui-caption text-muted-foreground",
        default:
          "type-ui-label bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "type-ui-label bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "type-ui-label bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "type-ui-label border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "type-ui-label hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "type-ui-label text-primary underline-offset-4 hover:underline",
      },
    },
    compoundVariants: [
      {
        variant: "status",
        tone: "destructive",
        className: "bg-destructive/10 text-destructive",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  tone = "neutral",
  size = "default",
  render,
  children,
  onRemove,
  removeLabel,
  label,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    onRemove?: () => void;
    removeLabel?: string;
    label?: string;
    size?: "default" | "sm";
  }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ variant, tone }),
          size === "sm" && "h-5 px-1",
          className,
        ),
        children: onRemove ? (
          <>
            {label && <span data-slot="badge-label">{label}</span>}
            <span data-slot="badge-content" className="truncate">
              {children}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={
                removeLabel ??
                `Remove ${typeof children === "string" ? children : "item"}`
              }
              onClick={onRemove}
            >
              <IconX aria-hidden="true" />
            </Button>
          </>
        ) : (
          children
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
