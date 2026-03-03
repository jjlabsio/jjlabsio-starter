export default function AboutPage() {
  return (
    <>
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        About
      </p>
      <h1 className="mb-14 max-w-lg text-center text-4xl leading-snug font-normal">
        We help teams ship products faster.
      </h1>
      <div className="w-full max-w-md space-y-6 text-center">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Acme Inc. is a platform that gives developers and teams the tools they
          need to build, deploy, and scale modern SaaS applications without the
          boilerplate.
        </p>
        <div className="bg-muted/50 rounded-lg border p-6 text-left">
          <h2 className="mb-3 text-base font-semibold">Our Mission</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Remove the friction between idea and launch. We believe every team
            deserves production-ready infrastructure from day one.
          </p>
        </div>
      </div>
      <div className="text-muted-foreground mt-10 flex items-center gap-3 text-xs">
        <span>Open Source</span>
        <span aria-hidden="true">&middot;</span>
        <span>Developer First</span>
        <span aria-hidden="true">&middot;</span>
        <span>Built with Next.js</span>
      </div>
    </>
  );
}
