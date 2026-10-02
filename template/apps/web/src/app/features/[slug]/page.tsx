import { notFound } from "next/navigation";
import { features } from "@/lib/marketing";
import { MarketingDetail } from "@/components/marketing-detail";
export function generateStaticParams() {
  return features.map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = features.find((item) => item.slug === slug);
  return {
    title: item ? `${item.label} - Acme` : "Not found",
    description: item?.description,
    robots: { index: false, follow: true },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = features.find((item) => item.slug === slug);
  if (!item) notFound();
  return <MarketingDetail item={item} kind="Features" />;
}
