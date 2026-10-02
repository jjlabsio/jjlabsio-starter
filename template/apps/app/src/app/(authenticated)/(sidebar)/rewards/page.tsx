import { database } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SubmissionForm } from "@/domains/rewards/forms";
import { requireRewardsUser } from "@/lib/rewards-access";
import { rewardStatusLabels } from "@/lib/rewards-policy";

export default async function RewardsPage() {
  const user = await requireRewardsUser();
  const submission = await database.rewardSubmission.findUnique({
    where: { userId: user.id },
  });
  return (
    <PageContainer title="Rewards Program" spacing="canvas">
      <section className="ui-form-column" data-spacing="profile">
        <div className="space-y-8 px-2 md:px-6">
          <div className="space-y-2">
            <h2 className="type-ui-title-sm">Submit your review</h2>
            <p className="type-ui-body leading-6 text-muted-foreground">
              Post your experience with Acme on X, LinkedIn, Instagram, TikTok,
              YouTube, or a public blog, then submit the URL.
            </p>
          </div>
          <ul className="list-disc space-y-2 pl-5 type-ui-body leading-6 text-muted-foreground">
            <li>
              Include original content that shows your experience with Acme.
            </li>
            <li>
              Keep your post public and disclose participation in the rewards
              program.
            </li>
            <li>One approved submission per account.</li>
          </ul>
          {submission && (
            <div className="space-y-3 border-y py-5">
              <Badge variant="secondary">
                {rewardStatusLabels[submission.status]}
              </Badge>
              <a
                href={submission.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm underline"
              >
                View submitted post
              </a>
              {submission.reviewNote && (
                <p className="text-sm">{submission.reviewNote}</p>
              )}
            </div>
          )}
          {(!submission || submission.status === "CHANGES_REQUESTED") && (
            <SubmissionForm postUrl={submission?.postUrl} />
          )}
        </div>
      </section>
    </PageContainer>
  );
}
