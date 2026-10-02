import Link from "next/link";
import { database } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { buttonVariants } from "@repo/ui/components/button";
import { ReviewForm } from "@/domains/rewards/forms";
import { requireRewardsAdmin } from "@/lib/rewards-access";
const rewardStatusLabels = {
  PENDING: "Pending review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

export default async function AdminRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string }>;
}) {
  await requireRewardsAdmin();
  const { before } = await searchParams;
  const cursor =
    before && !Number.isNaN(Date.parse(before)) ? new Date(before) : null;
  const rows = await database.rewardSubmission.findMany({
    where: cursor ? { createdAt: { lt: cursor } } : {},
    include: {
      user: { select: { email: true } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
    take: 21,
  });
  const items = rows.slice(0, 20);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <h1 className="text-xl font-medium">Rewards Program</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review public posts. Approval records eligibility only; no reward,
        subscription extension, or payment is applied.
      </p>
      {!items.length && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No submissions yet.
        </p>
      )}
      <div className="mt-8 divide-y border-y">
        {items.map((row) => (
          <article key={row.id} className="space-y-5 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-all font-medium">{row.user.email}</h2>
              <Badge variant="secondary">
                {rewardStatusLabels[row.status]}
              </Badge>
            </div>
            <a
              href={row.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm underline"
            >
              {row.postUrl}
            </a>
            <p className="text-sm text-muted-foreground">
              Submitted {row.createdAt.toISOString().slice(0, 10)} · Marketing
              permission: {row.marketingConsent ? "Granted" : "Not granted"} ·
              Consent {row.consentVersion}
            </p>
            {row.status === "PENDING" ? (
              <ReviewForm id={row.id} />
            ) : (
              <p className="text-sm">{row.reviewNote || "Review completed"}</p>
            )}
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer">Recent history</summary>
              <ul className="mt-3 space-y-2">
                {row.events.map((event) => (
                  <li key={event.id} className="break-all">
                    {event.createdAt.toISOString()} · {event.action} ·{" "}
                    {event.note}
                  </li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
      {rows.length > 20 && (
        <Link
          href={`/rewards?before=${encodeURIComponent(items[items.length - 1]!.createdAt.toISOString())}`}
          className={buttonVariants({ variant: "outline", className: "mt-6" })}
        >
          Older submissions
        </Link>
      )}
    </div>
  );
}
