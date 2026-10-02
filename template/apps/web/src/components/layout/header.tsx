"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu2 } from "@tabler/icons-react";
import { Button, buttonVariants } from "@repo/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@repo/ui/components/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/components/sheet";
import { marketingNavigation } from "@/lib/marketing";
import { env } from "@/lib/env";
import styles from "./header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Acme
        </Link>
        <div className="hidden flex-1 md:block">
          <NavigationMenu aria-label="Main navigation">
            <NavigationMenuList>
              {marketingNavigation.map((menu) => (
                <NavigationMenuItem key={menu.label}>
                  <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
                  <NavigationMenuContent className={styles.dropdown}>
                    <div className={styles.groups}>
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <p className={`${styles.label} type-ui-caption`}>
                            {group.label}
                          </p>
                          <ul className="space-y-1">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <NavigationMenuLink
                                  className={styles.link}
                                  render={<Link href={link.href} />}
                                >
                                  <span className="type-ui-body-medium">{link.label}</span>
                                  <span className={`${styles.description} type-ui-caption`}>{link.description}</span>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link href="/pricing" />}>
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
            className={buttonVariants({
              variant: "ghost",
              size: "lg",
              className: "hidden sm:inline-flex",
            })}
          >
            Log in
          </Link>
          <Link
            href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
            className={buttonVariants({ size: "lg" })}
          >
            Start for free
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <IconMenu2 />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Explore Acme</SheetTitle>
                <SheetDescription>
                  Features, solutions, and resources
                </SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="overflow-y-auto px-4 pb-6"
              >
                {marketingNavigation.map((menu) => (
                  <section key={menu.label} className="mb-6">
                    <h2 className="mb-3 type-ui-body-strong">{menu.label}</h2>
                    {menu.groups.map((group) => (
                      <div key={group.label} className="mb-4">
                        <p className="mb-1 px-2.5 type-ui-caption text-muted-foreground">
                          {group.label}
                        </p>
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={buttonVariants({
                              variant: "ghost",
                              className: "flex h-auto min-h-12 w-full justify-start py-2",
                            })}
                          >
                            <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                              <span>{link.label}</span>
                              <span className="type-ui-caption text-muted-foreground whitespace-normal">{link.description}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </section>
                ))}
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  Pricing
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
