import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  checkRateLimit: vi.fn(),
  startTrial: vi.fn(),
}));

vi.mock("@repo/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("@repo/billing", () => ({ startTrial: mocks.startTrial }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));

import { POST } from "./route";

describe("POST /api/billing/trial", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "trial-user" } });
    mocks.checkRateLimit.mockReturnValue({ allowed: true });
    mocks.startTrial.mockResolvedValue({ status: "TRIALING" });
  });

  it("미인증 요청은 트라이얼을 시작하지 않는다", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect((await POST()).status).toBe(401);
    expect(mocks.startTrial).not.toHaveBeenCalled();
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });

  it("요청 제한을 초과하면 저장하지 않는다", async () => {
    mocks.checkRateLimit.mockReturnValue({ allowed: false });
    expect((await POST()).status).toBe(429);
    expect(mocks.startTrial).not.toHaveBeenCalled();
  });

  it("인증된 사용자 ID로 실제 트라이얼 저장 함수를 호출한다", async () => {
    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.checkRateLimit).toHaveBeenCalledWith("trial:trial-user");
    expect(mocks.startTrial).toHaveBeenCalledWith("trial-user");
  });

  it("이미 구독이나 체험을 사용한 계정은 중복 시작할 수 없다", async () => {
    mocks.startTrial.mockRejectedValue(
      new Error("User already has a subscription or trial"),
    );
    expect((await POST()).status).toBe(409);
  });

  it("저장 실패를 성공으로 처리하지 않는다", async () => {
    mocks.startTrial.mockRejectedValue(new Error("Database unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect((await POST()).status).toBe(500);
    } finally {
      log.mockRestore();
    }
  });
});
