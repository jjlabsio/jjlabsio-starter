import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { requireSubscription } from "@repo/billing/require-subscription";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PageContainer } from "@/components/page-container";
import { SectionCards } from "@/components/section-cards";

export default async function DashboardPage() {
  // (authenticated)/layout.tsx guarantees session exists — fetching here only to get user.id
  const session = (await auth.api.getSession({ headers: await headers() }))!;
  await requireSubscription(session.user.id);

  return (
    <PageContainer title="Dashboard">
      <SectionCards />
      <ChartAreaInteractive />
    </PageContainer>
  );
}
