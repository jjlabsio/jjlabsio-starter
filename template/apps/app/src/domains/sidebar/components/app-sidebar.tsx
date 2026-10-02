"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChevronRight,
  IconChevronLeft,
  IconUser,
  IconFolder,
  IconCircle,
  IconCircleCheckFilled,
  IconCreditCard,
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBuilding,
  IconInbox,
  // IconSearch,
  IconSettings,
  IconTable,
  IconFilter,
  IconWorld,
} from "@tabler/icons-react";
import { NavMain } from "@/domains/sidebar/components/nav-main";
import { projectsNavigation } from "../lib/navigation";
import { NavUser } from "@/domains/sidebar/components/nav-user";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { InputGroup, InputGroupInput } from "@repo/ui/components/input-group";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@repo/ui/components/sidebar";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string };
};

const setupSteps = [
  { title: "Review overview", url: "/" },
  { title: "Explore your website", url: "/my-website" },
  { title: "Open billing settings", url: "/settings/billing" },
];

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  React.useEffect(() => setOpenMobile(false), [pathname, setOpenMobile]);
  const isSettings = pathname.startsWith("/settings/");
  const [search, setSearch] = React.useState("");
  const [visited, setVisited] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("starter-setup-visited") ?? "[]",
      ) as string[];
      const next = [...new Set([...saved, pathname])];
      setVisited(next);
      window.localStorage.setItem(
        "starter-setup-visited",
        JSON.stringify(next),
      );
    } catch {
      setVisited([pathname]);
    }
  }, [pathname]);
  const completedSteps = setupSteps.filter((step) =>
    visited.includes(step.url),
  ).length;
  const nextStep =
    setupSteps.find((step) => !visited.includes(step.url)) ?? setupSteps[0]!;
  const destinations = [
    { title: "Overview", url: "/" },
    { title: "My website", url: "/my-website" },
    { title: "Requests", url: "/requests" },
    { title: "Actions", url: "/actions" },
    { title: "Tables", url: "/tables" },
    { title: "Filters & menus", url: "/filter-examples" },
    { title: "Profile", url: "/settings/profile" },
    { title: "Projects", url: "/settings/projects" },
    { title: "Company", url: "/settings/company" },
    { title: "Billing", url: "/settings/billing" },
  ].filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-(--header-height) flex-row items-center justify-between border-b border-sidebar-border px-3">
        {isSettings ? (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/" />}
            aria-label="Back to overview"
            className="group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
          >
            <IconChevronLeft aria-hidden="true" />
            <span className="group-data-[collapsible=icon]:hidden">
              Overview
            </span>
          </Button>
        ) : (
          <>
            <div
              role="group"
              aria-label="Current workspace"
              className="flex min-w-0 items-center gap-2 px-1.5 text-sidebar-foreground group-data-[collapsible=icon]:px-1"
            >
              <Avatar size="xs" aria-hidden="true">
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
              <span className="truncate type-ui-body-strong group-data-[collapsible=icon]:hidden">
                Workspace
              </span>
            </div>
            <DropdownMenu>
              {/* <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Search navigation"
                    className="text-sidebar-muted-foreground group-data-[collapsible=icon]:hidden"
                  />
                }
              >
                <IconSearch aria-hidden="true" />
              </DropdownMenuTrigger> */}
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-1">
                  <InputGroup variant="menu">
                    <InputGroupInput
                      autoFocus
                      aria-label="Search pages"
                      placeholder="Search pages"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </InputGroup>
                </div>
                {destinations.map((item) => (
                  <DropdownMenuItem
                    key={item.url}
                    render={<Link href={item.url} />}
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
                {destinations.length === 0 && (
                  <p className="px-2 py-2 text-sm text-muted-foreground">
                    No matching pages
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </SidebarHeader>
      <SidebarContent className="pt-1 pb-2">
        {!isSettings && (
          <>
            <NavMain
              label="Home"
              items={[
                {
                  title: "Overview",
                  url: "/",
                  icon: IconAdjustmentsHorizontal,
                },
                { title: "My website", url: "/my-website", icon: IconWorld },
                { title: "Tables", url: "/tables", icon: IconTable },
                {
                  title: "Filters & menus",
                  url: "/filter-examples",
                  icon: IconFilter,
                },
              ]}
            />
            <NavMain
              label="Resources"
              items={[
                {
                  title: projectsNavigation.label,
                  url: projectsNavigation.href,
                  icon: IconFolder,
                },
              ]}
            />
            <NavMain
              label="Work"
              items={[
                {
                  title: "Requests",
                  url: "/requests",
                  icon: IconInbox,
                },
              ]}
            />
            <NavMain
              label="Workflow"
              items={[{ title: "Actions", url: "/actions", icon: IconBolt }]}
            />
          </>
        )}
        {isSettings ? (
          <>
            <NavMain
              label="Project settings"
              items={[
                { title: "Profile", url: "/settings/profile", icon: IconUser },
                {
                  title: "Projects",
                  url: "/settings/projects",
                  icon: IconFolder,
                },
              ]}
            />
            <NavMain
              label="Company"
              items={[
                {
                  title: "Company",
                  url: "/settings/company",
                  icon: IconBuilding,
                },
                {
                  title: "Billing",
                  url: "/settings/billing",
                  icon: IconCreditCard,
                },
              ]}
            />
          </>
        ) : (
          <NavMain
            label="Preferences"
            items={[
              {
                title: "Settings",
                url: "/settings/profile",
                icon: IconSettings,
              },
            ]}
          />
        )}
        {!isSettings && (
          <div className="mt-auto px-2 pt-3 group-data-[collapsible=icon]:hidden">
            <Card size="sm" className="bg-background">
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Start here</p>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {completedSteps}/{setupSteps.length}
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Getting started progress"
                  aria-valuemin={0}
                  aria-valuemax={setupSteps.length}
                  aria-valuenow={completedSteps}
                >
                  <div
                    className="h-full rounded-full bg-progress"
                    style={{
                      width: `${(completedSteps / setupSteps.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Explore your workspace
                </p>
                <ul className="space-y-1">
                  {setupSteps.map((step) => (
                    <li key={step.url}>
                      <Link
                        href={step.url}
                        className="flex min-h-9 items-center gap-2 rounded-md text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {visited.includes(step.url) ? (
                          <IconCircleCheckFilled
                            className="size-4 shrink-0 text-positive"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconCircle
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1">{step.title}</span>
                        <IconChevronRight
                          className="size-3 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={nextStep.url} />}
                  className="w-full"
                >
                  {completedSteps === setupSteps.length
                    ? "Review workspace"
                    : "Continue setup"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
