import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@repo/ui/components/button";
import { env } from "@/lib/env";

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl leading-[1.08] font-medium tracking-tight text-balance md:text-6xl lg:text-7xl">
          Your team&apos;s work
          <br className="hidden sm:block" /> in one clear view
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Connect projects, people, and progress. Keep the context you need to
          move from a good idea to finished work.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`} className={buttonVariants({ size: "lg" })}>
            Start for free
          </Link>
        </div>
      </div>
      <div className="mt-14 md:mt-16"><ProductPreview /></div>
    </section>
  );
}

export function ProductPreview() {
  return (
    <Image src="/images/product-placeholder.svg" alt="Product image placeholder" width={1440} height={810} className="h-auto w-full rounded-lg border border-border bg-muted" />
  );
}
