import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  preview: vi.fn(),
  save: vi.fn(),
  review: vi.fn(),
  confirm: vi.fn(),
  step: vi.fn(),
}));
vi.mock("@/lib/admin-access", () => ({ requireAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@repo/email/campaigns", () => ({
  CampaignError: class extends Error {},
  previewCampaign: mocks.preview,
  saveCampaign: mocks.save,
  reviewCampaign: mocks.review,
  confirmCampaign: mocks.confirm,
  sendNextCampaignBatch: mocks.step,
}));
import {
  previewEmail,
  saveEmail,
  reviewEmail,
  confirmEmail,
  sendEmailStep,
} from "./actions";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.admin.mockResolvedValue({ id: "owner-1" });
});
it("requires Admin identity for every independent action", async () => {
  mocks.admin.mockRejectedValue(new Error("Forbidden"));
  for (const action of [
    () => previewEmail({}),
    () => saveEmail({}),
    () => reviewEmail("id", 1),
    () => confirmEmail("id", 1, "hash", true),
    () => sendEmailStep("id"),
  ])
    await expect(action()).rejects.toThrow("Forbidden");
  expect(mocks.step).not.toHaveBeenCalled();
  expect(mocks.confirm).not.toHaveBeenCalled();
});
it("requires service-notice confirmation and a valid optimistic revision", async () => {
  expect((await confirmEmail("id", 1, "hash", false)).error).toBeDefined();
  expect(mocks.confirm).not.toHaveBeenCalled();
  expect((await saveEmail({}, "id", 0)).error).toBeDefined();
  expect(mocks.save).not.toHaveBeenCalled();
  await confirmEmail("id", 1, "hash", true);
  expect(mocks.confirm).toHaveBeenCalledWith("id", 1, "hash", "owner-1");
  expect(mocks.step).not.toHaveBeenCalled();
});
it("does not return provider errors or credentials to the browser", async () => {
  mocks.step.mockRejectedValue(
    new Error("SECRET_TOKEN recipient@example.test"),
  );
  const result = await sendEmailStep("id");
  expect(result.error).not.toContain("SECRET_TOKEN");
  expect(result.error).not.toContain("recipient@example.test");
});
