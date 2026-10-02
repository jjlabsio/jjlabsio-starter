"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconLogout,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  IconContrastFilled,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { toast } from "@repo/ui/components/toast";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initials = getInitials(user.name || user.email);

  const handleSignOut = async () => {
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.add({
        type: "error",
        title: "Could not sign out",
        description: "Please try again.",
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                variant="account"
                size="account"
                aria-label="Account menu"
              />
            }
          >
            <Avatar size="xs" aria-hidden="true">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>{initials.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate group-data-[collapsible=icon]:hidden">
              {user.email}
            </span>
            <CaretIcon
              variant="chevron"
              direction="up"
              className="group-data-[collapsible=icon]:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconContrastFilled />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    selected={mounted && theme === "light"}
                    onClick={() => setTheme("light")}
                  >
                    <IconSun />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    selected={mounted && theme === "dark"}
                    onClick={() => setTheme("dark")}
                  >
                    <IconMoon />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    selected={mounted && theme === "system"}
                    onClick={() => setTheme("system")}
                  >
                    <IconDeviceDesktop />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
