export default function HomePage() {
  return (
    <>
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Welcome
      </p>
      <h1 className="mb-14 max-w-lg text-center text-4xl leading-snug font-normal">
        Build your next SaaS product faster than ever.
      </h1>
      <div className="flex w-full max-w-md gap-3">
        <button className="flex-1 rounded bg-primary px-8 py-5 text-base font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80">
          Get Started
        </button>
        <button className="flex-1 rounded bg-muted px-8 py-5 text-base font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/80">
          Learn More
        </button>
      </div>
      <div className="text-muted-foreground mt-6 flex items-center gap-3 text-xs">
        <span>No credit card required</span>
        <span aria-hidden="true">&middot;</span>
        <span>Free tier available</span>
        <span aria-hidden="true">&middot;</span>
        <span>Cancel anytime</span>
      </div>
    </>
  );
}
