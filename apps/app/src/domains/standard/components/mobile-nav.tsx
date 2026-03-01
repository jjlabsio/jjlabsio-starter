"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2 } from "@tabler/icons-react";

import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";

interface NavLink {
  readonly label: string;
  readonly href: string;
}

export function MobileNav({
  user,
  navLinks,
}: {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  navLinks: readonly NavLink[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 md:hidden">
      <ThemeToggle />
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <IconMenu2 className="size-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t px-4 pt-4">
            <UserMenu user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
