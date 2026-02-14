export function BlogHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,123,132,0.12), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-32 text-center md:pb-16 md:pt-36">
        <h1 className="text-5xl font-light tracking-tight md:text-7xl">Blog</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Insights on product development, engineering, and building better
          teams.
        </p>
      </div>
    </section>
  );
}
