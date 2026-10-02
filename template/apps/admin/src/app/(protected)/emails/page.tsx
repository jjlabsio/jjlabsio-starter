import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-access";
import { getCampaign, listCampaigns } from "@repo/email/campaigns";
import { EmailComposer } from "@/domains/emails/composer";

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  await requireAdmin();
  const { draft } = await searchParams;
  if (draft && draft.length > 100) notFound();
  const [initial, recent] = await Promise.all([
    draft ? getCampaign(draft) : null,
    listCampaigns(),
  ]);
  if (draft && !initial) notFound();
  return (
    <EmailComposer key={draft ?? "new"} initial={initial} recent={recent} />
  );
}
