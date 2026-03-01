import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

interface FeatureBlockProps {
  readonly title: string;
  readonly description: string;
  readonly mockupLabel: string;
  readonly reversed?: boolean;
}

export function FeatureBlock({
  title,
  description,
  mockupLabel,
  reversed = false,
}: FeatureBlockProps) {
  return (
    <section id="features" className="py-16">
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16",
          reversed && "md:[direction:rtl]",
        )}
      >
        <div className={cn(reversed && "md:[direction:ltr]")}>
          <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-muted">
            <p className="text-sm text-muted-foreground">{mockupLabel}</p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-6",
            reversed && "md:[direction:ltr]",
          )}
        >
          <h3 className="text-3xl font-light tracking-tight md:text-4xl">
            {title}
          </h3>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div>
            <Button variant="outline" className="rounded-full">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
