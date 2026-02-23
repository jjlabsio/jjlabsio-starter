import { describe, expect, it } from "vitest";
import { transformLayout } from "../../src/steps/clean-auth-duplication.js";

const SIDEBAR_LAYOUT = `import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email,
    image: session.user.image ?? undefined,
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}`;

const STANDARD_LAYOUT = `import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";

export default async function StandardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email,
    image: session.user.image ?? undefined,
  };

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader user={user} />
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}`;

describe("transformLayout", () => {
  it("removes redirect import from sidebar layout", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).not.toContain('import { redirect } from "next/navigation"');
  });

  it("removes redirect import from standard layout", () => {
    const result = transformLayout(STANDARD_LAYOUT);
    expect(result).not.toContain('import { redirect } from "next/navigation"');
  });

  it("removes the if (!session) redirect block", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).not.toContain("if (!session)");
    expect(result).not.toContain('redirect("/sign-in")');
  });

  it("changes session.user to session!.user", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain("session!.user.name");
    expect(result).toContain("session!.user.email");
    expect(result).toContain("session!.user.image");
    expect(result).not.toMatch(/(?<!!)\.user\.name/);
  });

  it("adds comment about auth guard verification", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain("session is already verified");
  });

  it("preserves headers import", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain('import { headers } from "next/headers"');
  });

  it("preserves auth import", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain('import { auth } from "@repo/auth"');
  });

  it("preserves component imports", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain("AppSidebar");
    expect(result).toContain("SidebarProvider");
  });

  it("preserves the return JSX", () => {
    const result = transformLayout(SIDEBAR_LAYOUT);
    expect(result).toContain("<SidebarProvider>");
    expect(result).toContain("</SidebarProvider>");
  });

  it("works with standard layout too", () => {
    const result = transformLayout(STANDARD_LAYOUT);
    expect(result).not.toContain("redirect");
    expect(result).toContain("session!.user");
    expect(result).toContain("<AppHeader");
    expect(result).toContain("<AppFooter");
  });
});
