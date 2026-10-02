import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "cn";
import { CaretIcon } from "@repo/ui/components/caret-icon";

function Accordion({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Root.Props & { variant?: "default" | "tree" }) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn("group/accordion flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "not-last:border-b group-data-[variant=tree]/accordion:border-0",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  selection,
  ...props
}: AccordionPrimitive.Trigger.Props & { selection?: React.ReactNode }) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      data-selectable={Boolean(selection)}
      className="group/accordion-header relative flex items-center"
    >
      {selection && <span data-slot="accordion-selection">{selection}</span>}
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between rounded-lg border border-transparent py-2.5 text-left type-ui-body-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          "group-data-[variant=tree]/accordion:min-h-11 group-data-[variant=tree]/accordion:aria-expanded:min-h-9 group-data-[variant=tree]/accordion:justify-start group-data-[variant=tree]/accordion:gap-2 group-data-[variant=tree]/accordion:border-0 group-data-[variant=tree]/accordion:px-3 group-data-[variant=tree]/accordion:py-2 group-data-[variant=tree]/accordion:hover:bg-muted group-data-[variant=tree]/accordion:hover:no-underline group-data-[variant=tree]/accordion:aria-expanded:bg-muted group-data-[variant=tree]/accordion:aria-expanded:type-ui-body-strong",
          className,
        )}
        {...props}
      >
        {children}
        <CaretIcon className="pointer-events-none ml-auto shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:rotate-180 group-data-[variant=tree]/accordion:order-first group-data-[variant=tree]/accordion:ml-0 group-data-[variant=tree]/accordion:-rotate-90 group-data-[variant=tree]/accordion:group-aria-expanded/accordion-trigger:rotate-0 group-data-[selectable=true]/accordion-header:mr-6" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden type-ui-body data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          "group-data-[variant=tree]/accordion:pb-1.5",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
