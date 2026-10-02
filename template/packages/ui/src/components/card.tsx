import * as React from "react";
import { cn } from "cn";

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm";
  variant?: "default" | "panel" | "form" | "settings" | "flush" | "pricing";
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) type-ui-body text-card-foreground ring-1 ring-border [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 data-[variant=panel]:gap-0 data-[variant=panel]:rounded-[12px] data-[variant=panel]:py-0 data-[variant=form]:gap-2 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        "data-[variant=form]:pt-4 data-[variant=form]:pb-3 data-[variant=settings]:gap-2 data-[variant=settings]:has-data-[slot=card-description]:gap-4 data-[variant=flush]:gap-0 data-[variant=flush]:rounded-none data-[variant=flush]:border-y data-[variant=flush]:py-0 data-[variant=flush]:ring-0",
        "data-[variant=pricing]:gap-1 data-[variant=pricing]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing) group-data-[variant=panel]/card:min-h-12 group-data-[variant=panel]/card:content-center group-data-[variant=panel]/card:items-center group-data-[variant=panel]/card:rounded-none group-data-[variant=panel]/card:border-b group-data-[variant=panel]/card:py-2",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "type-ui-title-sm group-data-[size=sm]/card:type-ui-body-strong group-data-[variant=panel]/card:type-ui-body-strong",
        "group-data-[variant=form]/card:type-ui-reading group-data-[variant=settings]/card:type-ui-reading",
        "group-data-[variant=pricing]/card:type-ui-reading group-data-[variant=pricing]/card:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("type-ui-body text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  padding = "default",
  ...props
}: React.ComponentProps<"div"> & { padding?: "default" | "none" | "chart" }) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        padding === "default" && "px-(--card-spacing)",
        padding === "chart" && "flex min-h-0 flex-1 flex-col px-4 pt-4 pb-2",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
