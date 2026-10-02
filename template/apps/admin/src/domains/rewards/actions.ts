"use server";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { requireRewardsAdmin } from "@/lib/rewards-access";
export type RewardsResult = { error?: string; success?: string };

export async function reviewReward(
  _previous: RewardsResult,
  form: FormData,
): Promise<RewardsResult> {
  const admin = await requireRewardsAdmin();
  const id = form.get("id");
  const status = form.get("status");
  const note = form.get("note");
  if (
    typeof id !== "string" ||
    id.length > 100 ||
    typeof note !== "string" ||
    note.length > 1000 ||
    (status !== "APPROVED" &&
      status !== "REJECTED" &&
      status !== "CHANGES_REQUESTED")
  )
    return { error: "Invalid review." };
  if (status !== "APPROVED" && !note.trim())
    return { error: "Add a reason so the user knows what to change." };
  try {
    await database.$transaction(async (tx) => {
      const changed = await tx.rewardSubmission.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status,
          reviewNote: note.trim(),
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
      if (changed.count !== 1)
        throw new Error(
          "This submission has already been reviewed. Refresh the page.",
        );
      await tx.rewardReviewEvent.create({
        data: {
          submissionId: id,
          actorId: admin.id,
          action: status,
          note: note.trim(),
        },
      });
    });
    revalidatePath("/rewards");
    return {
      success: "Review saved. No reward or billing change was applied.",
    };
  } catch {
    return {
      error:
        "Could not save. The submission may have already been reviewed. Refresh and try again.",
    };
  }
}
