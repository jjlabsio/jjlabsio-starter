"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-access";
import {
  CampaignError,
  previewCampaign,
  saveCampaign,
  reviewCampaign,
  confirmCampaign,
  sendNextCampaignBatch,
} from "@repo/email/campaigns";

function errorMessage(error: unknown) {
  return error instanceof CampaignError
    ? error.message
    : "Could not complete this action. Check the server configuration and try again.";
}

export async function previewEmail(raw: unknown) {
  await requireAdmin();
  try {
    return { data: await previewCampaign(raw) };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function saveEmail(raw: unknown, id?: string, revision?: number) {
  const admin = await requireAdmin();
  if (id && (!revision || !Number.isSafeInteger(revision)))
    return { error: "Invalid draft revision." };
  try {
    const data = await saveCampaign(raw, admin.id, id, revision);
    revalidatePath("/emails");
    return { data };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function reviewEmail(id: string, revision: number) {
  await requireAdmin();
  try {
    return { data: await reviewCampaign(id, revision) };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function confirmEmail(
  id: string,
  revision: number,
  fingerprint: string,
  serviceNotice: boolean,
) {
  const admin = await requireAdmin();
  if (serviceNotice !== true)
    return {
      error: "Confirm that this is a service notice, not promotional content.",
    };
  try {
    await confirmCampaign(id, revision, fingerprint, admin.id);
    revalidatePath("/emails");
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function sendEmailStep(id: string) {
  await requireAdmin();
  try {
    const data = await sendNextCampaignBatch(id);
    revalidatePath("/emails");
    return { data };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
