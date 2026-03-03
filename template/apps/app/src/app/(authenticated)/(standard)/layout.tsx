import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { AppHeader } from "@/domains/standard/components/app-header";
import { AppFooter } from "@/domains/standard/components/app-footer";

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
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-8 pt-16 pb-24">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
