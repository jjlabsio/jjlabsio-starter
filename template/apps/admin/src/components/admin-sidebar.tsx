"use client";
import Link from "next/link";
import { useEffect } from "react";
import { IconGift, IconMail } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { NavUser } from "./nav-user";
export function AdminSidebar({
  user,
}: {
  user: { name: string; email: string; image?: string };
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  useEffect(() => setOpenMobile(false), [pathname, setOpenMobile]);
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-(--header-height) flex-row items-center border-b border-sidebar-border px-3">
        <Avatar size="xs">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <span className="type-ui-body-strong group-data-[collapsible=icon]:hidden">
          Admin
        </span>
      </SidebarHeader>
      <SidebarContent className="pt-1 pb-2">
        <SidebarGroup>
          <SidebarGroupLabel>Programs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/rewards")}
                  render={<Link href="/rewards" />}
                >
                  <IconGift />
                  <span>Rewards Program</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/emails")}
                  render={<Link href="/emails" />}
                >
                  <IconMail />
                  <span>Emails</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
