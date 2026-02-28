import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---- Hoisted mock functions (vi.hoisted runs before vi.mock hoisting) ----

const { mockGetSession, mockCheckRateLimit, mockCheckoutsCreate } = vi.hoisted(
  () => ({
    mockGetSession: vi.fn(),
    mockCheckRateLimit: vi.fn(),
    mockCheckoutsCreate: vi.fn(),
  }),
);

// ---- Module mocks ----

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock("@repo/billing", () => ({
  polar: {
    checkouts: {
      create: mockCheckoutsCreate,
    },
  },
  env: {
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_MONTHLY: "prod_starter_monthly",
    NEXT_PUBLIC_POLAR_PRODUCT_ID_STARTER_YEARLY: "prod_starter_yearly",
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY: "prod_pro_monthly",
    NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY: "prod_pro_yearly",
  },
}));

// Import route AFTER mocks are set up
import { GET } from "./route";

// ---- Helpers ----

function makeRequest(path: string, search = ""): NextRequest {
  const url = `http://localhost:3000${path}${search}`;
  return new NextRequest(url);
}

const VALID_PRODUCT_IDS = [
  "prod_starter_monthly",
  "prod_starter_yearly",
  "prod_pro_monthly",
  "prod_pro_yearly",
];

const MOCK_SESSION = {
  user: {
    id: "user_123",
    email: "test@example.com",
  },
};

// ---- Tests ----

describe("GET /api/billing/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated, not rate-limited
    mockGetSession.mockResolvedValue(MOCK_SESSION);
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 9 });
  });

  // ----------------------------------------------------------------
  // 1. 미인증 요청 → /sign-in?next=... 리다이렉트
  // ----------------------------------------------------------------
  describe("미인증 요청", () => {
    it("세션이 없으면 /sign-in?next=... 로 리다이렉트한다", async () => {
      mockGetSession.mockResolvedValue(null);

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      const res = await GET(req);

      // NextResponse.redirect uses 307 by default in Next.js
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toMatch(/\/sign-in\?next=/);
    });

    it("next 파라미터에 원래 경로가 인코딩되어 포함된다", async () => {
      mockGetSession.mockResolvedValue(null);

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      const res = await GET(req);

      const location = res.headers.get("location");
      expect(location).toContain(
        encodeURIComponent(
          "/api/billing/checkout?productId=prod_starter_monthly",
        ),
      );
    });

    it("미인증 요청 시 rate limit 체크를 하지 않는다", async () => {
      mockGetSession.mockResolvedValue(null);

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      await GET(req);

      expect(mockCheckRateLimit).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // 2. rate limit 초과 → 429
  // ----------------------------------------------------------------
  describe("rate limit 초과", () => {
    it("rate limit 초과 시 429 응답을 반환한다", async () => {
      mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0 });

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      const res = await GET(req);

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body).toEqual({ error: "Too many requests" });
    });

    it("rate limit key는 checkout:userId 형식이다", async () => {
      mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 9 });
      mockCheckoutsCreate.mockResolvedValue({
        url: "https://polar.sh/checkout/abc",
      });

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      await GET(req);

      expect(mockCheckRateLimit).toHaveBeenCalledWith("checkout:user_123");
    });
  });

  // ----------------------------------------------------------------
  // 3. 유효하지 않은 productId → 400
  // ----------------------------------------------------------------
  describe("productId 검증", () => {
    it("productId가 없으면 400을 반환한다", async () => {
      const req = makeRequest("/api/billing/checkout");
      const res = await GET(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: "Invalid productId" });
    });

    it("허용되지 않은 productId이면 400을 반환한다", async () => {
      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_unknown_id",
      );
      const res = await GET(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: "Invalid productId" });
    });

    it("빈 문자열 productId이면 400을 반환한다", async () => {
      const req = makeRequest("/api/billing/checkout", "?productId=");
      const res = await GET(req);

      expect(res.status).toBe(400);
    });

    it("SQL 인젝션 시도 productId이면 400을 반환한다", async () => {
      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=%27+OR+1%3D1+--",
      );
      const res = await GET(req);

      expect(res.status).toBe(400);
    });
  });

  // ----------------------------------------------------------------
  // 4. 유효한 요청 → Polar checkout 리다이렉트
  // ----------------------------------------------------------------
  describe("유효한 요청 처리", () => {
    it.each(VALID_PRODUCT_IDS)(
      "유효한 productId '%s' → Polar checkout URL로 리다이렉트",
      async (productId) => {
        mockCheckoutsCreate.mockResolvedValue({
          url: `https://polar.sh/checkout/${productId}`,
        });

        const req = makeRequest(
          "/api/billing/checkout",
          `?productId=${productId}`,
        );
        const res = await GET(req);

        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe(
          `https://polar.sh/checkout/${productId}`,
        );
      },
    );

    it("polar.checkouts.create에 올바른 인자를 전달한다", async () => {
      mockCheckoutsCreate.mockResolvedValue({
        url: "https://polar.sh/checkout/abc",
      });

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      await GET(req);

      expect(mockCheckoutsCreate).toHaveBeenCalledWith({
        products: ["prod_starter_monthly"],
        customerEmail: "test@example.com",
        externalCustomerId: "user_123",
        successUrl: "http://localhost:3000/dashboard",
      });
    });
  });

  // ----------------------------------------------------------------
  // 5. Polar API 실패 → 500
  // ----------------------------------------------------------------
  describe("Polar API 에러 처리", () => {
    it("polar checkout 생성 실패 시 500을 반환한다", async () => {
      mockCheckoutsCreate.mockRejectedValue(new Error("Polar API error"));

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_starter_monthly",
      );
      const res = await GET(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: "Failed to create checkout" });
    });

    it("Polar 네트워크 타임아웃 시 500을 반환한다", async () => {
      mockCheckoutsCreate.mockRejectedValue(new Error("Network timeout"));

      const req = makeRequest(
        "/api/billing/checkout",
        "?productId=prod_pro_yearly",
      );
      const res = await GET(req);

      expect(res.status).toBe(500);
    });
  });
});
