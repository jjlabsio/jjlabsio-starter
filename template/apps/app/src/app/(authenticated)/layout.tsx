import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { requireSubscription } from "@repo/billing";
import { getPlanByProductId } from "@repo/billing/plan-config";
import { HeaderSubscriptionProvider } from "@/domains/sidebar/components/site-header";

export default async function AuthenticatedLayout({
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

  const subscription = await requireSubscription(session.user.id);

  return (
    <HeaderSubscriptionProvider
      subscription={{
        status: subscription.status,
        trialEnd: subscription.trialEnd,
      }}
      planName={getPlanByProductId(subscription.polarProductId)?.name ?? null}
      checkedAt={Date.now()}
    >
      {children}
    </HeaderSubscriptionProvider>
  );
}
