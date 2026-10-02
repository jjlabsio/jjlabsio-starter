import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { getSubscription } from "@repo/billing";
import { getPlanByProductId } from "@repo/billing/plan-config";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SubscriptionStatusCard } from "@/components/subscription-status-card";
import { BillingPlanComparison } from "@/components/billing-plan-comparison";

export default async function BillingSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const subscription = await getSubscription(session.user.id);

  return (
    <PageContainer title="Plans & Billing" spacing="settings-sections">
      <section aria-labelledby="plans-heading" className="ui-section-stack">
        <div className="ui-section-heading">
          <h2 id="plans-heading" className="ui-section-title">
            Plans
          </h2>
          <p className="ui-page-description">
            Review your current plan and compare available options.
          </p>
        </div>
        <SubscriptionStatusCard
          subscription={subscription}
          planName={
            getPlanByProductId(subscription?.polarProductId)?.name ?? null
          }
        />
      </section>

      <BillingPlanComparison />
    </PageContainer>
  );
}
