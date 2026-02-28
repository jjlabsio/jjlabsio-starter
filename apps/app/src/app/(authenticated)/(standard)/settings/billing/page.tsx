import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription } from "@repo/billing";
import { SubscriptionStatusCard } from "@/components/subscription-status-card";

export default async function BillingSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const subscription = await getSubscription(session.user.id);

  return (
    <>
      <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
        Settings
      </p>
      <h1 className="mb-10 w-full max-w-lg text-3xl font-normal">Billing</h1>

      <div className="w-full max-w-lg space-y-4">
        <SubscriptionStatusCard subscription={subscription} />
      </div>
    </>
  );
}
