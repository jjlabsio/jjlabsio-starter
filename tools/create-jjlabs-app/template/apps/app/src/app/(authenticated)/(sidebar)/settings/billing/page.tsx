import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { getSubscription } from "@repo/billing";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SubscriptionStatusCard } from "@/components/subscription-status-card";

export default async function BillingSettingsPage() {
  // (authenticated)/layout.tsx guarantees session exists — fetching here only to get user.id
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const subscription = await getSubscription(session.user.id);

  return (
    <PageContainer title="Billing">
      <div className="w-full max-w-lg space-y-4">
        <SubscriptionStatusCard subscription={subscription} />
      </div>
    </PageContainer>
  );
}
