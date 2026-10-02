import * as React from "react";
import { cn } from "cn";

type CaretIconProps = React.ComponentProps<"svg"> & {
  direction?: "down" | "up" | "right" | "left";
  variant?: "caret" | "chevron";
};

function CaretIcon({
  className,
  direction = "down",
  variant = "caret",
  ...props
}: CaretIconProps) {
  return (
    <svg
      aria-hidden="true"
      data-slot={variant === "chevron" ? "chevron-icon" : "caret-icon"}
      viewBox={variant === "chevron" ? "0 0 24 24" : "0 0 8 8"}
      fill={variant === "chevron" ? "none" : "currentColor"}
      stroke={variant === "chevron" ? "currentColor" : undefined}
      strokeWidth={variant === "chevron" ? 2 : undefined}
      strokeLinecap={variant === "chevron" ? "round" : undefined}
      strokeLinejoin={variant === "chevron" ? "round" : undefined}
      className={cn(
        variant === "chevron" ? "size-3.5 shrink-0" : "size-2 shrink-0",
        direction === "up" && "rotate-180",
        direction === "right" && "-rotate-90",
        direction === "left" && "rotate-90",
        className,
      )}
      {...props}
    >
      <path d={variant === "chevron" ? "m6 9 6 6 6-6" : "M1 2h6L4 6z"} />
    </svg>
  );
}

export { CaretIcon };
