import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  admin: vi.fn(),
  rate: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  event: vi.fn(),
}));
vi.mock("@/lib/rewards-access", () => ({ requireRewardsAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@repo/database", () => ({
  Prisma: { PrismaClientKnownRequestError: class extends Error {} },
  database: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        rewardSubmission: {
          findUnique: mocks.find,
          create: mocks.create,
          updateMany: mocks.update,
        },
        rewardReviewEvent: { create: mocks.event },
      }),
  },
}));
import { reviewReward } from "./actions";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.admin.mockResolvedValue({ id: "real-admin" });
  mocks.update.mockResolvedValue({ count: 1 });
});
describe("admin review", () => {
  it("guards review actions independently from pages", async () => {
    mocks.admin.mockRejectedValue(new Error("Forbidden"));
    await expect(reviewReward({}, new FormData())).rejects.toThrow("Forbidden");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("requires a reason for changes and conditionally records approval without fulfillment", async () => {
    const form = new FormData();
    form.set("id", "submission-1");
    form.set("status", "CHANGES_REQUESTED");
    form.set("note", "");
    expect((await reviewReward({}, form)).error).toBeDefined();
    expect(mocks.update).not.toHaveBeenCalled();
    form.set("status", "APPROVED");
    expect((await reviewReward({}, form)).success).toBeDefined();
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "submission-1", status: "PENDING" },
        data: expect.objectContaining({
          status: "APPROVED",
          reviewedBy: "real-admin",
        }),
      }),
    );
    expect(mocks.event).toHaveBeenCalledOnce();
  });
});
