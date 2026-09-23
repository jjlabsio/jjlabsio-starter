import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "fs-extra";

const TEMPLATE_DIR = path.resolve(__dirname, "../../template");

describe("template sidebar page", () => {
  it("keeps its defensive session guard without a duplicate redirect", async () => {
    const content = await fs.readFile(
      path.join(
        TEMPLATE_DIR,
        "apps/app/src/app/(authenticated)/(sidebar)/layout.tsx",
      ),
      "utf-8",
    );

    expect(content).toContain("if (!session) return null");
    expect(content).not.toContain("next/navigation");
    expect(content).not.toContain('redirect("/sign-in")');
  });

  it("does not duplicate auth/subscription checks already handled by (authenticated)/layout.tsx", async () => {
    const content = await fs.readFile(
      path.join(
        TEMPLATE_DIR,
        "apps/app/src/app/(authenticated)/(sidebar)/page.tsx",
      ),
      "utf-8",
    );

    // (authenticated)/layout.tsx already calls requireSubscription; page must not repeat it
    expect(content).not.toContain("requireSubscription");
    // (authenticated)/layout.tsx already verifies session; page must not re-fetch it
    expect(content).not.toContain("auth.api.getSession");
  });
});
