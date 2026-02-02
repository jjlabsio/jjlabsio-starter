import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PageContainer } from "@/components/page-container";
import { SectionCards } from "@/components/section-cards";

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard">
      <SectionCards />
      <ChartAreaInteractive />
    </PageContainer>
  );
}
