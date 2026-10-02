"use server";

import { database, Prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { requireRewardsUser } from "@/lib/rewards-access";
import { normalizePostUrl, REWARDS_CONSENT_VERSION, RewardsInputError } from "@/lib/rewards-policy";
import { checkRateLimit } from "@/lib/rate-limit";

export type RewardsResult = { error?: string; success?: string };

export async function submitReward(_previous: RewardsResult, form: FormData): Promise<RewardsResult> {
  const user = await requireRewardsUser();
  if (!checkRateLimit(`rewards:${user.id}`).allowed) return { error: "Too many requests. Try again in a minute." };
  try {
    const postUrl = normalizePostUrl(form.get("postUrl"));
    if (form.get("participation") !== "on") return { error: "Confirm the participation guidelines before submitting." };
    const now = new Date();
    const marketingConsent = form.get("marketing") === "on";
    const data = { postUrl, consentVersion: REWARDS_CONSENT_VERSION, participationAt: now, marketingConsent, marketingConsentAt: marketingConsent ? now : null };
    await database.$transaction(async (tx) => {
      const previous = await tx.rewardSubmission.findUnique({ where: { userId: user.id } });
      if (previous && previous.status !== "CHANGES_REQUESTED") throw new RewardsInputError("You already have a submission. Only requested changes can be resubmitted.");
      const event = { actorId: user.id, action: previous ? "RESUBMITTED" : "SUBMITTED", note: JSON.stringify(data) };
      if (previous) {
        const changed = await tx.rewardSubmission.updateMany({ where: { id: previous.id, status: "CHANGES_REQUESTED" }, data: { ...data, status: "PENDING", reviewNote: "", reviewedAt: null, reviewedBy: null } });
        if (changed.count !== 1) throw new RewardsInputError("The submission changed. Refresh and try again.");
        await tx.rewardReviewEvent.create({ data: { ...event, submissionId: previous.id } });
      } else await tx.rewardSubmission.create({ data: { ...data, userId: user.id, events: { create: event } } });
    });
    revalidatePath("/rewards");
    return { success: "Your post was submitted for review." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "This account or post already has a submission." };
    if (error instanceof RewardsInputError) return { error: error.message };
    return { error: "Could not save your submission. Try again." };
  }
}
