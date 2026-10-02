import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderEmail } from "../src/render";
import { CampaignEmail } from "../src/templates/campaign";
import {
  emailContentSchema,
  validateReady,
  type EmailContent,
} from "../src/content";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  users: vi.fn(),
  batchFind: vi.fn(),
  batchCreate: vi.fn(),
  batchUpdate: vi.fn(),
  batchCount: vi.fn(),
  send: vi.fn(),
  configured: vi.fn(),
  sender: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@repo/database", () => {
  const tx = {
    emailCampaign: {
      findUnique: mocks.find,
      create: mocks.create,
      updateMany: mocks.update,
    },
    emailBatch: {
      findFirst: mocks.batchFind,
      create: mocks.batchCreate,
      updateMany: mocks.batchUpdate,
      count: mocks.batchCount,
    },
    user: { findMany: mocks.users },
  };
  return {
    database: {
      ...tx,
      $transaction: (fn: (value: unknown) => unknown) => fn(tx),
    },
  };
});
vi.mock("../src/batch", () => ({
  sendEmailBatch: mocks.send,
  emailSendingConfigured: mocks.configured,
  getEmailSender: mocks.sender,
}));
import {
  saveCampaign,
  reviewCampaign,
  confirmCampaign,
  sendNextCampaignBatch,
} from "../src/campaigns";

const content: EmailContent = {
  subject: "Service update",
  previewText: "A short notice",
  audiences: ["trial", "subscribed"],
  blocks: [
    { type: "heading", text: "Service update" },
    { type: "paragraph", text: "Hello <script>alert(1)</script>" },
    { type: "bullets", text: "First item\nSecond item" },
    { type: "button", text: "Open workspace", url: "https://app.example.test" },
    { type: "divider" },
  ],
};
const row = {
  id: "campaign-1",
  revision: 2,
  status: "DRAFT",
  ...content,
  recipientCount: 0,
  batches: [],
};
const users = [
  {
    id: "trial-1",
    email: "trial@example.test",
    subscription: { status: "TRIALING" },
  },
  {
    id: "paid-1",
    email: "paid@example.test",
    subscription: { status: "ACTIVE" },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.find.mockResolvedValue(row);
  mocks.users.mockResolvedValue(users);
  mocks.update.mockResolvedValue({ count: 1 });
  mocks.batchUpdate.mockResolvedValue({ count: 1 });
  mocks.batchCount.mockResolvedValue(0);
  mocks.configured.mockReturnValue(true);
  mocks.sender.mockReturnValue("Acme <support@example.test>");
  mocks.send.mockResolvedValue(["provider-1"]);
});

describe("email content", () => {
  it("renders all reusable blocks inside the shared shell, escaping text", async () => {
    const { html, text } = await renderEmail(
      createElement(CampaignEmail, { content, brandName: "Acme" }),
    );
    expect(html).toContain("All rights reserved.");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("<li");
    expect(html).toContain('href="https://app.example.test"');
    expect(text).toContain("First item");
    expect(text).toMatch(/open workspace/i);
  });
  it("rejects executable URLs and unbounded content but permits unfinished drafts", () => {
    expect(
      emailContentSchema.safeParse({
        ...content,
        blocks: [{ type: "button", text: "Click", url: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
    expect(
      emailContentSchema.safeParse({
        ...content,
        blocks: Array(41).fill({ type: "divider" }),
      }).success,
    ).toBe(false);
    expect(
      emailContentSchema.safeParse({
        ...content,
        subject: "",
        blocks: [{ type: "heading", text: "" }],
      }).success,
    ).toBe(true);
    expect(() => validateReady({ ...content, subject: "" })).toThrow("subject");
    expect(() =>
      validateReady({
        ...content,
        blocks: [{ type: "button", text: "Open", url: "" }],
      }),
    ).toThrow("Complete");
  });
});

describe("campaign lifecycle", () => {
  it("saves only the expected draft revision and never sends while saving", async () => {
    await expect(saveCampaign(content, "admin-1", row.id)).rejects.toThrow(
      "revision",
    );
    await saveCampaign(content, "admin-1", row.id, 2);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: row.id, status: "DRAFT", revision: 2 },
      }),
    );
    expect(mocks.send).not.toHaveBeenCalled();
    mocks.update.mockResolvedValue({ count: 0 });
    await expect(saveCampaign(content, "admin-1", row.id, 2)).rejects.toThrow(
      "changed",
    );
  });
  it("reviews verified, unexpired trial and ACTIVE subscriber audiences without sending", async () => {
    const review = await reviewCampaign(row.id, 2);
    expect(review).toMatchObject({
      count: 2,
      trialCount: 1,
      subscribedCount: 1,
    });
    expect(mocks.users).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          emailVerified: true,
          subscription: {
            is: {
              OR: [
                { status: "TRIALING", trialEnd: { gt: expect.any(Date) } },
                { status: "ACTIVE" },
              ],
            },
          },
        },
      }),
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("excludes an unselected audience and blocks empty and changed recipient sets", async () => {
    mocks.find.mockResolvedValue({ ...row, audiences: ["subscribed"] });
    const review = await reviewCampaign(row.id, 2);
    expect(mocks.users.mock.calls[0]?.[0].where.subscription.is.OR).toEqual([
      { status: "ACTIVE" },
    ]);
    mocks.users.mockResolvedValue([users[1]]);
    await expect(
      confirmCampaign(row.id, 2, review.fingerprint, "admin-1"),
    ).rejects.toThrow("Recipients changed");
    mocks.users.mockResolvedValue([]);
    const empty = await reviewCampaign(row.id, 2);
    await expect(
      confirmCampaign(row.id, 2, empty.fingerprint, "admin-1"),
    ).rejects.toThrow("No eligible");
    expect(mocks.batchCreate).not.toHaveBeenCalled();
  });
  it("snapshots recipients and content before sending, in individual-address batches", async () => {
    mocks.users.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        id: `user-${index}`,
        email: `user${index}@example.test`,
        subscription: { status: "ACTIVE" },
      })),
    );
    const review = await reviewCampaign(row.id, 2);
    await confirmCampaign(row.id, 2, review.fingerprint, "admin-1");
    expect(mocks.batchCreate).toHaveBeenCalledTimes(2);
    expect(mocks.batchCreate.mock.calls[0]?.[0].data.recipientCount).toBe(100);
    expect(mocks.batchCreate.mock.calls[1]?.[0].data.recipientCount).toBe(1);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SENDING",
          confirmedBy: "admin-1",
          html: expect.any(String),
          text: expect.any(String),
        }),
      }),
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("blocks changed drafts, missing credentials, and concurrent confirmation", async () => {
    await expect(reviewCampaign(row.id, 1)).rejects.toThrow("changed");
    const review = await reviewCampaign(row.id, 2);
    mocks.sender.mockImplementation(() => {
      throw new Error("Missing keys");
    });
    await expect(
      confirmCampaign(row.id, 2, review.fingerprint, "admin-1"),
    ).rejects.toThrow("Configure");
    mocks.sender.mockReturnValue("Acme <support@example.test>");
    mocks.update.mockResolvedValue({ count: 0 });
    await expect(
      confirmCampaign(row.id, 2, review.fingerprint, "admin-1"),
    ).rejects.toThrow("already sending");
    expect(mocks.batchCreate).not.toHaveBeenCalled();
  });
});

describe("resumable sending", () => {
  const batch = {
    id: "batch-1",
    recipients: ["one@example.test"],
    firstAttemptAt: null,
  };
  beforeEach(() => {
    mocks.find.mockResolvedValue({
      ...row,
      status: "SENDING",
      from: "Acme <support@example.test>",
      html: "<p>Frozen content</p>",
      text: "Frozen content",
    });
    mocks.batchFind.mockResolvedValue(batch);
  });
  it("uses a stable idempotency key and frozen payload, then marks completion", async () => {
    await sendNextCampaignBatch(row.id);
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: batch.recipients,
        html: "<p>Frozen content</p>",
        key: "campaign/campaign-1/batch/batch-1",
      }),
    );
    expect(mocks.batchUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SENT",
          providerIds: ["provider-1"],
        }),
      }),
    );
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: row.id, status: "SENDING" },
      data: { status: "SENT" },
    });
  });
  it("does not send before confirmation, after completion, or without a batch lease", async () => {
    mocks.find.mockResolvedValue(row);
    await expect(sendNextCampaignBatch(row.id)).rejects.toThrow("Confirm");
    mocks.find.mockResolvedValue({ ...row, status: "SENT" });
    await sendNextCampaignBatch(row.id);
    expect(mocks.send).not.toHaveBeenCalled();
    mocks.find.mockResolvedValue({
      ...row,
      status: "SENDING",
      from: "sender@example.test",
      html: "html",
      text: "text",
    });
    mocks.batchUpdate.mockResolvedValue({ count: 0 });
    await expect(sendNextCampaignBatch(row.id)).rejects.toThrow(
      "already sending",
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("blocks retries outside the idempotency window and retains failed-batch identity", async () => {
    mocks.batchFind.mockResolvedValue({
      ...batch,
      firstAttemptAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    await expect(sendNextCampaignBatch(row.id)).rejects.toThrow(
      "safe retry window",
    );
    expect(mocks.send).not.toHaveBeenCalled();
    mocks.batchFind.mockResolvedValue(batch);
    mocks.send.mockRejectedValue(new Error("Provider unavailable"));
    await expect(sendNextCampaignBatch(row.id)).rejects.toThrow(
      "Resume the existing campaign",
    );
    expect(mocks.batchUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "batch-1" }),
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });
});
