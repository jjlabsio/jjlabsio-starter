import { describe, it, expect } from "vitest";
import {
  TIERS,
  type TierConfig,
  type PlanTier,
  type BillingPeriod,
  type PeriodPricing,
} from "./plan-config";

describe("TIERS", () => {
  describe("구조 검증", () => {
    it("정확히 2개의 tier가 존재해야 한다", () => {
      expect(TIERS).toHaveLength(2);
    });

    it("starter tier가 존재해야 한다", () => {
      const ids = TIERS.map((t) => t.id);
      expect(ids).toContain("starter");
    });

    it("pro tier가 존재해야 한다", () => {
      const ids = TIERS.map((t) => t.id);
      expect(ids).toContain("pro");
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
    it("pro tier만 highlighted가 true이어야 한다", () => {
      const proTier = TIERS.find((t) => t.id === "pro");
      expect(proTier?.highlighted).toBe(true);
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
    it("starter monthly price는 양수이어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.monthly.price).toBeGreaterThan(0);
    });

    it("starter yearly price는 양수이어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.yearly.price).toBeGreaterThan(0);
    });

    it("pro monthly price는 starter monthly price보다 커야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      const pro = TIERS.find((t) => t.id === "pro")!;
      expect(pro.monthly.price).toBeGreaterThan(starter.monthly.price);
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
    it("starter yearly savings 정보가 있어야 한다", () => {
      const starter = TIERS.find((t) => t.id === "starter")!;
      expect(starter.yearly.savings).toBeDefined();
      expect(starter.yearly.savings!.length).toBeGreaterThan(0);
    });

    it("pro yearly savings 정보가 있어야 한다", () => {
      const pro = TIERS.find((t) => t.id === "pro")!;
      expect(pro.yearly.savings).toBeDefined();
      expect(pro.yearly.savings!.length).toBeGreaterThan(0);
    });

    it("pro yearly badge가 있어야 한다", () => {
      const pro = TIERS.find((t) => t.id === "pro")!;
      expect(pro.yearly.badge).toBeDefined();
      expect(pro.yearly.badge!.length).toBeGreaterThan(0);
    });

    it("monthly pricing에는 savings가 없어야 한다", () => {
      for (const tier of TIERS) {
        expect((tier.monthly as PeriodPricing).savings).toBeUndefined();
      }
    });
  });

  describe("타입 시스템 검증", () => {
    it("tier id는 PlanTier 리터럴 타입 값이어야 한다", () => {
      const validIds: PlanTier[] = ["starter", "pro"];
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
