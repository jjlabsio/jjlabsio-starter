import { describe, it, expect, vi } from "vitest";
import {
  TIERS,
  getPlanByProductId,
  type TierConfig,
  type PlanTier,
  type PeriodPricing,
} from "./plan-config";

describe("getPlanByProductId", () => {
  const products = {
    starter: { monthly: "starter-monthly", yearly: "starter-yearly" },
    pro: { monthly: "pro-monthly", yearly: "pro-yearly" },
    premium: { monthly: "premium-monthly", yearly: "premium-yearly" },
  };

  it.each([
    ["starter-monthly", "Starter"],
    ["starter-yearly", "Starter"],
    ["pro-monthly", "Pro"],
    ["pro-yearly", "Pro"],
    ["premium-monthly", "Premium"],
    ["premium-yearly", "Premium"],
  ])("%s 상품을 %s 요금제로 판별한다", (productId, name) => {
    expect(getPlanByProductId(productId, products)?.name).toBe(name);
  });

  it.each([null, undefined, "", "unknown-product"])(
    "상품 ID %s로 요금제를 추정하지 않는다",
    (productId) => {
      expect(getPlanByProductId(productId, products)).toBeNull();
    },
  );

  it("기본값은 설정된 공개 상품 ID를 사용한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_MONTHLY", "configured-pro");
    vi.stubEnv(
      "NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_MONTHLY",
      "configured-premium",
    );
    vi.resetModules();
    try {
      const config = await import("./plan-config");
      expect(config.getPlanByProductId("configured-pro")?.name).toBe("Pro");
      expect(config.getPlanByProductId("configured-pro")?.monthly.price).toBe(
        29,
      );
      expect(config.getPlanByProductId("configured-premium")?.name).toBe(
        "Premium",
      );
      expect(
        config.getPlanByProductId("configured-premium")?.monthly.price,
      ).toBe(49);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});

describe("TIERS", () => {
  describe("구조 검증", () => {
    it("Starter, Pro, Premium 순서로 세 tier를 표시한다", () => {
      expect(TIERS.map((tier) => tier.id)).toEqual([
        "starter",
        "pro",
        "premium",
      ]);
      expect(TIERS.map((tier) => tier.name)).toEqual([
        "Starter",
        "Pro",
        "Premium",
      ]);
    });

    it("starter tier가 존재해야 한다", () => {
      const ids = TIERS.map((t) => t.id);
      expect(ids).toContain("starter");
    });

    it("premium tier가 존재해야 한다", () => {
      const ids = TIERS.map((t) => t.id);
      expect(ids).toContain("premium");
    });

    it("각 tier는 TierConfig 타입을 만족해야 한다", () => {
      for (const tier of TIERS) {
        expect(tier).toMatchObject<Partial<TierConfig>>({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          features: expect.any(Array),
          monthly: expect.objectContaining({
            price: expect.any(Number),
            formattedPrice: expect.any(String),
            period: expect.any(String),
          }),
          yearly: expect.objectContaining({
            price: expect.any(Number),
            formattedPrice: expect.any(String),
            period: expect.any(String),
          }),
        });
      }
    });

    it("각 tier는 비어있지 않은 features 배열을 가져야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.features.length).toBeGreaterThan(0);
      }
    });

    it("각 tier는 name이 비어있지 않아야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.name.trim().length).toBeGreaterThan(0);
      }
    });

    it("각 tier는 description이 비어있지 않아야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.description.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("highlighted 로직", () => {
    it("premium tier만 highlighted가 true이어야 한다", () => {
      const premiumTier = TIERS.find((t) => t.id === "premium");
      expect(premiumTier?.highlighted).toBe(true);
    });

    it("starter tier는 highlighted가 false이어야 한다", () => {
      const starterTier = TIERS.find((t) => t.id === "starter");
      expect(starterTier?.highlighted).toBe(false);
    });

    it("highlighted가 true인 tier는 정확히 1개이어야 한다", () => {
      const highlightedTiers = TIERS.filter((t) => t.highlighted === true);
      expect(highlightedTiers).toHaveLength(1);
    });
  });

  describe("pricing 구조", () => {
    it("이름 변경 후에도 각 단계의 가격과 한도를 유지한다", () => {
      expect(
        TIERS.map((tier) => [
          tier.id,
          tier.monthly.price,
          tier.yearly.price,
          tier.limits.projects,
        ]),
      ).toEqual([
        ["starter", 19, 190, 5],
        ["pro", 29, 290, 20],
        ["premium", 49, 490, null],
      ]);
    });
    it("월간·연간 가격은 Starter, Pro, Premium 순서로 증가한다", () => {
      const [starter, pro, premium] = TIERS;
      for (const period of ["monthly", "yearly"] as const) {
        expect(pro[period].price).toBeGreaterThan(starter[period].price);
        expect(premium[period].price).toBeGreaterThan(pro[period].price);
      }
    });
    it("starter monthly price는 양수이어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.monthly.price).toBeGreaterThan(0);
    });

    it("starter yearly price는 양수이어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.yearly.price).toBeGreaterThan(0);
    });

    it("premium monthly price는 starter monthly price보다 커야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      const premium = TIERS.find((t) => t.id === "premium")!;
      expect(premium.monthly.price).toBeGreaterThan(starter.monthly.price);
    });

    it("yearly price는 monthly price보다 커야 한다 (연간 총액 기준)", () => {
      for (const tier of TIERS) {
        expect(tier.yearly.price).toBeGreaterThan(tier.monthly.price);
      }
    });

    it("yearly savings는 monthly × 12보다 저렴해야 한다 (할인 실제 적용)", () => {
      for (const tier of TIERS) {
        const monthlyAnnualTotal = tier.monthly.price * 12;
        expect(tier.yearly.price).toBeLessThan(monthlyAnnualTotal);
      }
    });

    it("formattedPrice는 '$' 기호로 시작해야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.monthly.formattedPrice).toMatch(/^\$/);
        expect(tier.yearly.formattedPrice).toMatch(/^\$/);
      }
    });

    it("monthly period는 '/ month' 문자열을 포함해야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.monthly.period).toContain("month");
      }
    });

    it("yearly period는 '/ year' 문자열을 포함해야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.yearly.period).toContain("year");
      }
    });
  });

  describe("yearly savings badge", () => {
    it("연간 할인 표시는 월간 12개월 대비 절약 금액과 일치해야 한다", () => {
      for (const tier of TIERS) {
        expect(tier.yearly.savings).toBe(
          `Save $${tier.monthly.price * 12 - tier.yearly.price}`,
        );
      }
    });
    it("starter yearly savings 정보가 있어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.yearly.savings).toBeDefined();
      expect(starter.yearly.savings!.length).toBeGreaterThan(0);
    });

    it("premium yearly savings 정보가 있어야 한다", () => {
      const premium = TIERS.find((t) => t.id === "premium")!;
      expect(premium.yearly.savings).toBeDefined();
      expect(premium.yearly.savings!.length).toBeGreaterThan(0);
    });

    it("premium yearly badge가 있어야 한다", () => {
      const premium = TIERS.find((t) => t.id === "premium")!;
      expect(premium.yearly.badge).toBeDefined();
      expect(premium.yearly.badge!.length).toBeGreaterThan(0);
    });

    it("monthly pricing에는 savings가 없어야 한다", () => {
      for (const tier of TIERS) {
        expect((tier.monthly as PeriodPricing).savings).toBeUndefined();
      }
    });
  });

  describe("타입 시스템 검증", () => {
    it("tier id는 PlanTier 리터럴 타입 값이어야 한다", () => {
      const validIds: PlanTier[] = ["starter", "pro", "premium"];
      for (const tier of TIERS) {
        expect(validIds).toContain(tier.id);
      }
    });

    it("tier id에 중복이 없어야 한다", () => {
      const ids = TIERS.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
