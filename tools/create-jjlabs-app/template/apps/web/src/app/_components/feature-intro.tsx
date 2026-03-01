import { Badge } from "@repo/ui/components/badge";

export function FeatureIntro() {
  return (
    <section id="product" className="py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1">
          Discover Acme
        </Badge>

        <h2 className="mx-auto max-w-3xl text-4xl font-light tracking-tight md:text-5xl">
          Everything you need to{" "}
          <span className="text-muted-foreground">build, ship, and scale</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          From ideation to production, Acme provides the complete toolkit for
          modern product teams. Streamline your workflow and eliminate
          bottlenecks.
        </p>
      </div>
    </section>
  );
}
