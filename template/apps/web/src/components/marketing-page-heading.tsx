export function MarketingPageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 text-center md:pt-24 md:pb-16">
      <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
