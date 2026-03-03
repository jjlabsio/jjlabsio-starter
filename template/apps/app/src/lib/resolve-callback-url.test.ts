import { describe, it, expect } from "vitest";
import { resolveCallbackUrl } from "./resolve-callback-url";

describe("resolveCallbackUrl", () => {
  describe("유효한 내부 경로 처리", () => {
    it("next=/dashboard → /dashboard 반환", () => {
      expect(resolveCallbackUrl("/dashboard")).toBe("/dashboard");
    });

    it("next=/settings/billing → /settings/billing 반환", () => {
      expect(resolveCallbackUrl("/settings/billing")).toBe("/settings/billing");
    });

    it("next=/api/billing/checkout?productId=xxx → 그대로 전달", () => {
      expect(resolveCallbackUrl("/api/billing/checkout?productId=xxx")).toBe(
        "/api/billing/checkout?productId=xxx",
      );
    });

    it("next가 '/'로 시작하는 경로면 그대로 반환", () => {
      expect(resolveCallbackUrl("/some/deep/path")).toBe("/some/deep/path");
    });

    it("query string이 포함된 내부 경로도 그대로 반환", () => {
      expect(resolveCallbackUrl("/search?q=test&page=1")).toBe(
        "/search?q=test&page=1",
      );
    });
  });

  describe("open redirect 방지", () => {
    it("next=https://evil.com → /dashboard (외부 URL 차단)", () => {
      expect(resolveCallbackUrl("https://evil.com")).toBe("/dashboard");
    });

    it("next=http://attacker.com/phish → /dashboard", () => {
      expect(resolveCallbackUrl("http://attacker.com/phish")).toBe(
        "/dashboard",
      );
    });

    it("next=//evil.com → /dashboard (protocol-relative URL 차단)", () => {
      expect(resolveCallbackUrl("//evil.com")).toBe("/dashboard");
    });

    it("next=https://evil.com/dashboard → /dashboard (도메인 포함 URL 차단)", () => {
      expect(resolveCallbackUrl("https://evil.com/dashboard")).toBe(
        "/dashboard",
      );
    });
  });

  describe("null/undefined/빈값 처리", () => {
    it("next=null → /dashboard 기본값 반환", () => {
      expect(resolveCallbackUrl(null)).toBe("/dashboard");
    });

    it("next=undefined → /dashboard 기본값 반환", () => {
      expect(resolveCallbackUrl(undefined)).toBe("/dashboard");
    });

    it("next='' (빈 문자열) → /dashboard 기본값 반환", () => {
      expect(resolveCallbackUrl("")).toBe("/dashboard");
    });

    it("next 인자 없이 호출 → /dashboard 기본값 반환", () => {
      expect(resolveCallbackUrl()).toBe("/dashboard");
    });
  });

  describe("엣지 케이스", () => {
    it("next=/ (루트 경로) → / 반환", () => {
      expect(resolveCallbackUrl("/")).toBe("/");
    });

    it("next에 유니코드 문자 포함된 내부 경로 → 그대로 반환", () => {
      expect(resolveCallbackUrl("/path/한국어")).toBe("/path/한국어");
    });

    it("매우 긴 내부 경로도 처리", () => {
      const longPath = "/" + "a".repeat(500);
      expect(resolveCallbackUrl(longPath)).toBe(longPath);
    });
  });
});
