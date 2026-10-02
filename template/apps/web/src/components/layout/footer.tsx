import Link from "next/link";
import { marketingNavigation } from "@/lib/marketing";

export function Footer() {
  return (
    <footer className="border-t border-border pb-8 pt-16 md:pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/" className="text-xl font-semibold">
              Acme
            </Link>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3"
          >
            {marketingNavigation.map((menu) => (
              <div key={menu.label}>
                <h2 className="mb-3 type-ui-body text-subtle-foreground">
                  {menu.label}
                </h2>
                <ul className="space-y-3">
                  {menu.groups
                    .flatMap<{ label: string; href: string }>(
                      (group) => group.links,
                    )
                    .map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="type-ui-body text-muted-foreground hover:text-foreground hover:underline focus-visible:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div className="md:col-start-1 md:row-start-2">
              <h2 className="mb-3 type-ui-body text-subtle-foreground">
                Company
              </h2>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/pricing"
                    className="type-ui-body text-muted-foreground hover:text-foreground hover:underline focus-visible:underline"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@example.com"
                    className="type-ui-body text-muted-foreground hover:text-foreground hover:underline focus-visible:underline"
                  >
                    Contact us
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-4 type-ui-caption text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:mt-24">
          <p>&copy; {new Date().getFullYear()} Acme. All rights reserved.</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground hover:underline focus-visible:underline">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-foreground hover:underline focus-visible:underline">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
