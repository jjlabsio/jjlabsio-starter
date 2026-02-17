"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

function isItemActive(currentPathname: string, itemUrl: string) {
  if (currentPathname === itemUrl) return true;
  return currentPathname.startsWith(`${itemUrl}/`);
}

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}) {
  const pathname = usePathname();
  const [mountedPathname, setMountedPathname] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    setMountedPathname(pathname);
  }, [pathname]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<Link href={item.url} />}
                isActive={
                  mountedPathname
                    ? isItemActive(mountedPathname, item.url)
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
