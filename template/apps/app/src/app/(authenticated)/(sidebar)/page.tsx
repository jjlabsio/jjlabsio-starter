import { ChartAreaInteractive } from "@/domains/sidebar/components/chart-area-interactive";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";

export default function MainPage() {
  return (
    <PageContainer title="Dashboard">
      <SectionCards />
      <ChartAreaInteractive />
    </PageContainer>
  );
}
