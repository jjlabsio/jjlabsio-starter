import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "./_components/hero";
import { IconArrowUpRight } from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";
import { features, solutions } from "@/lib/marketing";
import { env } from "@/lib/env";
import { FaqSection } from "@/components/faq-section";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-20 md:py-24"
        >
          <div className="mb-12 max-w-2xl">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
                Everything your team needs to work together
              </h2>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Start with what your team needs. Keep your projects, processes,
              and progress connected in one workspace.
            </p>
          </div>
          <div className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {features.map((item) => (
              <Link
                key={item.slug}
                href={`/features/${item.slug}`}
                className="group flex flex-col gap-4 px-6 py-8 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring max-md:not-last:border-b max-md:border-border"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-medium">{item.label}</h3>
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  />
                </div>
                <p className="max-w-sm type-ui-body text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
                Built around the way you work
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                A shared workspace for teams and the clients they support.
              </p>
            </div>
            <div className="mt-12 divide-y divide-border border-y border-border">
              {solutions.map((item) => (
                <Link
                  key={item.slug}
                  href={`/solutions/${item.slug}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-8 gap-y-3 px-6 py-8 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring md:grid-cols-[1fr_2fr_auto]"
                >
                  <h3 className="text-xl font-medium">{item.label}</h3>
                  <p className="col-start-1 row-start-2 type-ui-body text-muted-foreground md:col-start-2 md:row-start-1">
                    {item.description}
                  </p>
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="col-start-2 row-start-1 size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground md:col-start-3"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <FaqSection />
        <section id="start" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-center gap-7 py-20 text-center lg:py-30">
              <h2 className="max-w-[12em] text-4xl leading-none font-medium tracking-tight text-balance md:text-[56px]">
                Your next chapter starts here
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
                  className={buttonVariants({ size: "lg" })}
                >
                  Start for free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
