"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCircleDot } from "@tabler/icons-react";

import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@repo/ui/lib/utils";

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "About", href: "/about" },
] as const;

export function AppHeader({
  user,
}: {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  const pathname = usePathname();

  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <IconCircleDot className="size-5" />
          <span>
            Acme<span className="text-muted-foreground">Inc</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <UserMenu user={user} />
          <ThemeToggle />
        </nav>

        <MobileNav user={user} navLinks={navLinks} />
      </div>
    </header>
  );
}
