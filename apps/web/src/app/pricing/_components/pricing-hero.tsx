export function PricingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,123,132,0.12), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-32 text-center md:pb-20 md:pt-36">
        <h1 className="text-5xl font-light tracking-tight md:text-7xl">
          Simple, transparent{" "}
          <span className="text-muted-foreground">pricing</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Start free and scale as you grow. No hidden fees, no surprises.
        </p>
      </div>
    </section>
  );
}
