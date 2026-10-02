import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { env } from "@/lib/env";

export function CtaSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 px-6 py-20 text-center lg:py-30">
        <h2 className="max-w-[12em] text-4xl leading-none font-medium tracking-tight text-balance md:text-[56px]">
          Your next chapter starts here
        </h2>

        <Link
          href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
          className={buttonVariants({ size: "lg" })}
        >
          Start for free
        </Link>
      </div>
    </section>
  );
}
