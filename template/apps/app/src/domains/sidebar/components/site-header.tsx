"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconHelp } from "@tabler/icons-react";
import type { Subscription } from "@repo/billing";
import { getTrialDaysRemaining } from "@repo/billing/subscription-utils";
import { SUPPORT_HREF } from "@/lib/support";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@repo/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui/components/dropdown-menu";
import type { BreadcrumbEntry } from "../lib/navigation";

const SubscriptionContext = React.createContext<{
  subscription: Pick<Subscription, "status" | "trialEnd"> | null;
  planName: string | null;
  now: number;
} | null>(null);

export function useHeaderSubscription() {
  return React.useContext(SubscriptionContext);
}

export function HeaderSubscriptionProvider({
  subscription,
  planName = null,
  checkedAt,
  children,
}: {
  subscription: Pick<Subscription, "status" | "trialEnd"> | null;
  planName?: string | null;
  checkedAt: number;
  children: React.ReactNode;
}) {
  const [now, setNow] = React.useState(checkedAt);
  const trialEnd = subscription?.trialEnd?.getTime();
  const trialing = subscription?.status === "TRIALING";

  React.useEffect(() => {
    if (!trialing || trialEnd === undefined) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [trialing, trialEnd]);

  return (
    <SubscriptionContext value={{ subscription, planName, now }}>
      {children}
    </SubscriptionContext>
  );
}

interface SiteHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbEntry[];
  titleAs?: "h1" | "h2" | "h3";
  actions?: React.ReactNode;
}

export function SiteHeader({
  title,
  breadcrumbs,
  titleAs: Title = "h1",
  actions,
}: SiteHeaderProps) {
  const router = useRouter();
  const billing = useHeaderSubscription();
  const days = getTrialDaysRemaining(
    billing?.subscription ?? null,
    billing?.now ?? 0,
  );

  React.useEffect(() => {
    if (days === 0) router.refresh();
  }, [days, router]);

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center justify-between border-b bg-background pr-4 pl-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger />
        {!breadcrumbs || breadcrumbs.length < 2 ? (
          <Title className="truncate type-ui-body-medium">{title}</Title>
        ) : (
          <>
            <Title className="sr-only">{title}</Title>
            <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
              <BreadcrumbList className="flex-nowrap overflow-hidden">
                {breadcrumbs.length > 2 && (
                  <>
                    <BreadcrumbItem className="shrink-0 md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Show parent pages"
                            />
                          }
                        >
                          <BreadcrumbEllipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {breadcrumbs.slice(0, -2).map((entry, index) => (
                            <DropdownMenuItem
                              key={index}
                              disabled={!entry.href}
                              render={
                                entry.href ? (
                                  <Link href={entry.href} />
                                ) : undefined
                              }
                            >
                              {entry.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="shrink-0 md:hidden" />
                  </>
                )}
                {breadcrumbs.map((entry, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <BreadcrumbSeparator
                        className={
                          index < breadcrumbs.length - 1
                            ? "hidden shrink-0 md:block"
                            : "shrink-0"
                        }
                      />
                    )}
                    <BreadcrumbItem
                      className={
                        index < breadcrumbs.length - 2
                          ? "hidden min-w-0 md:inline-flex"
                          : "min-w-0"
                      }
                    >
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage
                          className="truncate type-ui-body-medium"
                          title={entry.label}
                        >
                          {entry.label}
                        </BreadcrumbPage>
                      ) : entry.href ? (
                        <BreadcrumbLink
                          render={<Link href={entry.href} />}
                          className="truncate"
                          title={entry.label}
                        >
                          {entry.label}
                        </BreadcrumbLink>
                      ) : (
                        <span className="truncate" title={entry.label}>
                          {entry.label}
                        </span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {days !== null && (
          <Button
            variant="status"
            size="sm"
            nativeButton={false}
            render={<Link href={days > 0 ? "/settings/billing" : "/pricing"} />}
            aria-label={`Trial ${days ? `ends in ${days} ${days === 1 ? "day" : "days"}` : "ended"}. View plans`}
          >
            <span className="sm:hidden">Trial</span>
            <span className="hidden sm:inline">Trial ends in</span>
            <Badge
              variant="status"
              size="sm"
              tone={days <= 2 ? "destructive" : "neutral"}
            >
              {days ? `${days} ${days === 1 ? "day" : "days"}` : "Ended"}
            </Badge>
          </Button>
        )}
        {billing?.subscription?.status === "ACTIVE" && (
          <Button
            variant="status"
            size="sm"
            nativeButton={false}
            render={<Link href="/settings/billing" />}
            aria-label={`${billing.planName ?? "Unknown"} plan. View billing`}
          >
            Plan
            <Badge variant="status" size="sm">
              {billing.planName ?? "Unknown"}
            </Badge>
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          render={<a href={SUPPORT_HREF} />}
          aria-label="Help"
        >
          <IconHelp className="text-muted-foreground" aria-hidden="true" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </div>
    </header>
  );
}
