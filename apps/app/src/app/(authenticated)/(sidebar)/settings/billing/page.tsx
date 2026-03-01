import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription } from "@repo/billing";
import { SubscriptionStatusCard } from "@/components/subscription-status-card";
import { PageContainer } from "@/domains/sidebar/components/page-container";

export default async function BillingSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const subscription = await getSubscription(session.user.id);

  return (
    <PageContainer title="Billing">
      <div className="w-full max-w-lg space-y-4">
        <SubscriptionStatusCard subscription={subscription} />
      </div>
    </PageContainer>
  );
}
