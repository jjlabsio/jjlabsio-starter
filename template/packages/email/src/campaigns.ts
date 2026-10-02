import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createElement } from "react";
import { database } from "@repo/database";
import {
  emailContentSchema,
  validateReady,
  type EmailContent,
} from "./content";
import { CampaignEmail } from "./templates/campaign";
import { renderEmail } from "./render";
import {
  emailSendingConfigured,
  getEmailSender,
  sendEmailBatch,
} from "./batch";

export class CampaignError extends Error {}
// ponytail: bounded manual campaigns; use a background job for larger audiences.
export const MAX_CAMPAIGN_RECIPIENTS = 5000;
const BATCH_SIZE = 100;
const RETRY_WINDOW = 23 * 60 * 60 * 1000;
const LEASE_MS = 90_000;

export type CampaignView = {
  id: string;
  revision: number;
  status: "DRAFT" | "SENDING" | "SENT";
  content: EmailContent;
  recipientCount: number;
  acceptedCount: number;
};
export type SendReview = {
  subject: string;
  revision: number;
  fingerprint: string;
  count: number;
  trialCount: number;
  subscribedCount: number;
  configured: boolean;
};

function parseContent(raw: unknown): EmailContent {
  const parsed = emailContentSchema.safeParse(raw);
  if (!parsed.success)
    throw new CampaignError(
      parsed.error.issues[0]?.message ?? "Invalid email content.",
    );
  return parsed.data;
}

function ensureReady(content: EmailContent) {
  try {
    validateReady(content);
  } catch (error) {
    throw new CampaignError((error as Error).message);
  }
}

export async function previewCampaign(raw: unknown) {
  const content = parseContent(raw);
  return renderEmail(createElement(CampaignEmail, { content }));
}

export async function getCampaign(id: string): Promise<CampaignView | null> {
  const row = await database.emailCampaign.findUnique({
    where: { id },
    include: {
      batches: { where: { status: "SENT" }, select: { recipientCount: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    revision: row.revision,
    status: row.status,
    content: parseContent({
      subject: row.subject,
      previewText: row.previewText,
      audiences: row.audiences,
      blocks: row.blocks,
    }),
    recipientCount: row.recipientCount,
    acceptedCount: row.batches.reduce(
      (sum, batch) => sum + batch.recipientCount,
      0,
    ),
  };
}

export async function listCampaigns() {
  return database.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, subject: true, status: true },
  });
}

export async function saveCampaign(
  raw: unknown,
  actor: string,
  id?: string,
  revision?: number,
) {
  const content = parseContent(raw);
  if (!id) {
    const row = await database.emailCampaign.create({
      data: { ...content, createdBy: actor },
    });
    return (await getCampaign(row.id))!;
  }
  if (!revision || !Number.isSafeInteger(revision))
    throw new CampaignError("Invalid draft revision.");
  const changed = await database.emailCampaign.updateMany({
    where: { id, status: "DRAFT", revision },
    data: { ...content, revision: { increment: 1 } },
  });
  if (changed.count !== 1)
    throw new CampaignError(
      "This draft changed or is already sending. Reload before editing.",
    );
  return (await getCampaign(id))!;
}

async function audienceSnapshot(content: EmailContent) {
  const users = await database.user.findMany({
    where: {
      emailVerified: true,
      subscription: {
        is: {
          OR: [
            ...(content.audiences.includes("trial")
              ? [{ status: "TRIALING" as const, trialEnd: { gt: new Date() } }]
              : []),
            ...(content.audiences.includes("subscribed")
              ? [{ status: "ACTIVE" as const }]
              : []),
          ],
        },
      },
    },
    select: {
      id: true,
      email: true,
      subscription: { select: { status: true } },
    },
    orderBy: { id: "asc" },
    take: MAX_CAMPAIGN_RECIPIENTS + 1,
  });
  if (users.length > MAX_CAMPAIGN_RECIPIENTS)
    throw new CampaignError(
      "This audience exceeds 5,000 recipients. Use a background sending job.",
    );
  const recipients = [
    ...new Map(users.map((user) => [user.email.toLowerCase(), user])).values(),
  ];
  return {
    recipients,
    fingerprint: createHash("sha256")
      .update(
        JSON.stringify(
          recipients.map((user) => [
            user.id,
            user.email,
            user.subscription?.status,
          ]),
        ),
      )
      .digest("hex"),
    trialCount: recipients.filter(
      (user) => user.subscription?.status === "TRIALING",
    ).length,
    subscribedCount: recipients.filter(
      (user) => user.subscription?.status === "ACTIVE",
    ).length,
  };
}

async function editableCampaign(id: string, revision: number) {
  const row = await getCampaign(id);
  if (!row || row.status !== "DRAFT" || row.revision !== revision)
    throw new CampaignError(
      "This draft changed or is already sending. Reload and review it again.",
    );
  ensureReady(row.content);
  return row;
}

export async function reviewCampaign(
  id: string,
  revision: number,
): Promise<SendReview> {
  const row = await editableCampaign(id, revision);
  const snapshot = await audienceSnapshot(row.content);
  return {
    subject: row.content.subject,
    revision,
    fingerprint: snapshot.fingerprint,
    count: snapshot.recipients.length,
    trialCount: snapshot.trialCount,
    subscribedCount: snapshot.subscribedCount,
    configured: emailSendingConfigured(),
  };
}

/** Freeze the reviewed draft and audience before the first provider call. */
export async function confirmCampaign(
  id: string,
  revision: number,
  fingerprint: string,
  actor: string,
) {
  const row = await editableCampaign(id, revision);
  let from: string;
  try {
    from = getEmailSender();
  } catch {
    throw new CampaignError(
      "Configure RESEND_API_KEY and EMAIL_FROM in Admin before sending.",
    );
  }
  const snapshot = await audienceSnapshot(row.content);
  if (snapshot.fingerprint !== fingerprint)
    throw new CampaignError(
      "Recipients changed. Review the audience again before sending.",
    );
  if (!snapshot.recipients.length)
    throw new CampaignError("No eligible recipients in this audience.");
  const { html, text } = await previewCampaign(row.content);
  await database.$transaction(async (tx) => {
    const changed = await tx.emailCampaign.updateMany({
      where: { id, revision, status: "DRAFT" },
      data: {
        status: "SENDING",
        from,
        html,
        text,
        confirmedAt: new Date(),
        confirmedBy: actor,
        recipientCount: snapshot.recipients.length,
      },
    });
    if (changed.count !== 1)
      throw new CampaignError(
        "This campaign is already sending or the draft changed.",
      );
    for (
      let start = 0;
      start < snapshot.recipients.length;
      start += BATCH_SIZE
    ) {
      const recipients = snapshot.recipients
        .slice(start, start + BATCH_SIZE)
        .map((user) => user.email);
      await tx.emailBatch.create({
        data: {
          id: randomUUID(),
          campaignId: id,
          position: start / BATCH_SIZE,
          recipients,
          recipientCount: recipients.length,
          providerIds: [],
        },
      });
    }
  });
}

/** One bounded provider request per action; an interrupted browser can resume. */
export async function sendNextCampaignBatch(id: string): Promise<CampaignView> {
  const campaign = await database.emailCampaign.findUnique({ where: { id } });
  if (!campaign || campaign.status === "DRAFT")
    throw new CampaignError("Confirm this draft before sending.");
  if (campaign.status === "SENT") return (await getCampaign(id))!;
  if (!campaign.from || !campaign.html || !campaign.text)
    throw new CampaignError("This campaign has no frozen email content.");
  const batch = await database.emailBatch.findFirst({
    where: { campaignId: id, status: { not: "SENT" } },
    orderBy: { position: "asc" },
  });
  if (!batch) {
    await database.emailCampaign.updateMany({
      where: { id, status: "SENDING" },
      data: { status: "SENT" },
    });
    return (await getCampaign(id))!;
  }
  const now = new Date();
  if (
    batch.firstAttemptAt &&
    now.getTime() - batch.firstAttemptAt.getTime() >= RETRY_WINDOW
  )
    throw new CampaignError(
      "The safe retry window expired. Check this batch in Resend before any further sending.",
    );
  const token = randomUUID();
  const claimed = await database.emailBatch.updateMany({
    where: {
      id: batch.id,
      OR: [
        { status: { in: ["PENDING", "FAILED"] } },
        { status: "SENDING", leaseUntil: { lte: now } },
      ],
    },
    data: {
      status: "SENDING",
      firstAttemptAt: batch.firstAttemptAt ?? now,
      leaseUntil: new Date(now.getTime() + LEASE_MS),
      leaseToken: token,
    },
  });
  if (!claimed.count)
    throw new CampaignError(
      "A batch is already sending. Wait 90 seconds before resuming.",
    );
  try {
    const providerIds = await sendEmailBatch({
      recipients: batch.recipients as string[],
      subject: campaign.subject,
      html: campaign.html,
      text: campaign.text,
      from: campaign.from,
      key: `campaign/${id}/batch/${batch.id}`,
    });
    await database.emailBatch.updateMany({
      where: { id: batch.id, leaseToken: token },
      data: {
        status: "SENT",
        providerIds,
        acceptedAt: new Date(),
        leaseUntil: null,
        leaseToken: null,
      },
    });
  } catch {
    await database.emailBatch.updateMany({
      where: { id: batch.id, leaseToken: token },
      data: { status: "FAILED", leaseUntil: null, leaseToken: null },
    });
    throw new CampaignError(
      "This batch was not confirmed. Resume the existing campaign; do not create a duplicate.",
    );
  }
  const remaining = await database.emailBatch.count({
    where: { campaignId: id, status: { not: "SENT" } },
  });
  if (!remaining)
    await database.emailCampaign.updateMany({
      where: { id, status: "SENDING" },
      data: { status: "SENT" },
    });
  return (await getCampaign(id))!;
}
