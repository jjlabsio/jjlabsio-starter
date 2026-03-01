import { Button } from "@repo/ui/components/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft warm gradient: rose / peach / lavender */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,123,132,0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 10%, rgba(230,170,140,0.12), transparent 70%), radial-gradient(ellipse 50% 40% at 20% 10%, rgba(190,170,220,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center md:pb-32 md:pt-44">
        <h1 className="mx-auto max-w-4xl text-5xl font-light tracking-tight md:text-7xl">
          Build better products,{" "}
          <span className="text-muted-foreground">faster than ever</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Acme empowers modern teams to ship products 10x faster with AI-powered
          workflows, seamless collaboration, and powerful analytics.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Button className="rounded-full px-8 py-6 text-base" size="lg">
            Start for free
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-8 py-6 text-base"
            size="lg"
          >
            Book a demo
          </Button>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-background shadow-[0_32px_64px_rgba(0,0,0,0.04),0_10px_12px_-6px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 border-b border-border/30 px-4 py-3">
              <div className="size-3 rounded-full bg-neutral-300" />
              <div className="size-3 rounded-full bg-neutral-300" />
              <div className="size-3 rounded-full bg-neutral-300" />
              <div className="ml-4 h-5 w-64 rounded-md bg-muted" />
            </div>
            <div className="flex items-center justify-center bg-muted/20 px-8 py-36">
              <p className="text-sm text-muted-foreground">
                Product Dashboard Preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
