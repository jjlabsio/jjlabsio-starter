"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { isNavigationActive } from "../lib/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";

export function NavMain({
  items,
  label,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [mountedPathname, setMountedPathname] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    setMountedPathname(pathname);
  }, [pathname]);

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<Link href={item.url} />}
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
                isActive={
                  mountedPathname
                    ? isNavigationActive(mountedPathname, item.url)
                    : false
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
