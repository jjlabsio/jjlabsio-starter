"use client";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@repo/ui/components/sidebar";

export function AdminHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger />
      <span className="type-ui-body-medium">
        {pathname.startsWith("/emails") ? "Emails" : "Rewards Program"}
      </span>
    </header>
  );
}
