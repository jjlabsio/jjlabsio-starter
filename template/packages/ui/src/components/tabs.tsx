"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-[3px] group-data-horizontal/tabs:h-8",
        line: "gap-1 bg-transparent p-0 group-data-horizontal/tabs:h-[calc(var(--spacing)*11-1px)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap text-muted-foreground transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground data-active:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:border group-data-[variant=default]/tabs-list:border-transparent group-data-[variant=default]/tabs-list:px-1.5 group-data-[variant=default]/tabs-list:py-0.5 group-data-[variant=default]/tabs-list:type-ui-body-medium group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=default]/tabs-list:focus-visible:border-ring group-data-[variant=default]/tabs-list:has-data-[icon=inline-end]:pr-1 group-data-[variant=default]/tabs-list:has-data-[icon=inline-start]:pl-1 dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30",
        "group-data-[variant=line]/tabs-list:isolate group-data-[variant=line]/tabs-list:h-full group-data-[variant=line]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:px-2 group-data-[variant=line]/tabs-list:py-0 group-data-[variant=line]/tabs-list:type-ui-body group-data-vertical/tabs:group-data-[variant=line]/tabs-list:h-9",
        "group-data-[variant=line]/tabs-list:before:pointer-events-none group-data-[variant=line]/tabs-list:before:absolute group-data-[variant=line]/tabs-list:before:inset-x-0 group-data-[variant=line]/tabs-list:before:top-1/2 group-data-[variant=line]/tabs-list:before:-z-10 group-data-[variant=line]/tabs-list:before:h-7 group-data-[variant=line]/tabs-list:before:-translate-y-1/2 group-data-[variant=line]/tabs-list:before:rounded-md group-data-[variant=line]/tabs-list:before:transition-colors group-data-[variant=line]/tabs-list:hover:before:bg-muted group-data-[variant=line]/tabs-list:data-active:before:bg-muted",
        "group-data-[variant=line]/tabs-list:after:pointer-events-none group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-foreground group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-px group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:right-0 group-data-vertical/tabs:after:w-px group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 type-ui-body outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
