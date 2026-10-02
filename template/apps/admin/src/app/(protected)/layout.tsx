import { requireAdmin } from "@/lib/admin-access";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/sidebar";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
          "--page-content-height": "calc(100svh - var(--header-height))",
        } as React.CSSProperties
      }
    >
      <AdminSidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
        }}
      />
      <SidebarInset>
        <AdminHeader />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
