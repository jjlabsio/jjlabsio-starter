import Link from "next/link";
import { Button } from "@repo/ui/components/button";

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "Customers", href: "/#customers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
] as const;

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full px-6 pt-4">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border border-border/50 bg-background/80 px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Acme
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button className="rounded-full px-5" size="sm">
          Get Started
        </Button>
      </div>
    </header>
  );
}
