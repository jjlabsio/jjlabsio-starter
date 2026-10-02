import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ user: vi.fn(), rate: vi.fn(), find: vi.fn(), create: vi.fn(), update: vi.fn(), event: vi.fn() }));
vi.mock("@/lib/rewards-access", () => ({ requireRewardsUser: mocks.user }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.rate }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@repo/database", () => ({ Prisma: { PrismaClientKnownRequestError: class extends Error {} }, database: { $transaction: (fn: (tx: unknown) => unknown) => fn({ rewardSubmission: { findUnique: mocks.find, create: mocks.create, updateMany: mocks.update }, rewardReviewEvent: { create: mocks.event } }) } }));
import { submitReward } from "./actions";

function submission() { const form = new FormData(); form.set("postUrl", "https://example.com/post"); form.set("participation", "on"); form.set("userId", "forged-user"); return form; }
beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "real-user" }); mocks.rate.mockReturnValue({ allowed: true }); mocks.find.mockResolvedValue(null); mocks.update.mockResolvedValue({ count: 1 }); });
describe("rewards submission and review", () => {
  it("uses session identity and optional marketing consent defaults to false", async () => {
    expect((await submitReward({}, submission())).success).toBeDefined();
    expect(mocks.create.mock.calls[0]![0].data).toMatchObject({ userId: "real-user", marketingConsent: false, marketingConsentAt: null });
  });
  it("requires participation confirmation", async () => {
    const form = submission(); form.delete("participation"); expect((await submitReward({}, form)).error).toBeDefined(); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("cannot overwrite a final approval", async () => {
    mocks.find.mockResolvedValue({ status: "APPROVED" }); expect((await submitReward({}, submission())).error).toBeDefined(); expect(mocks.update).not.toHaveBeenCalled();
  });
});
